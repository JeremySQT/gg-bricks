// Shared helpers of the wave 2 browser specs (form controls): resolved tokens, context switching, settled
// transitions, accessibility tree reads and the computed-value report used by the Figma parity check. Evidence
// helpers (every spec): screenshots and reports are written to reports/ only when GGB_EVIDENCE=1.
import { expect, type Page, type PageScreenshotOptions } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

export type Token = { $type: string; $value: unknown };
export type TokenMap = Record<string, Token>;
type Color = { components: number[]; alpha?: number };

export const brands = ['base', 'brick', 'orchid'];
export const modes = ['light', 'dark'];
export const densities = ['compact', 'standard', 'comfortable'];
export const sizes = ['sm', 'md', 'lg'];
export const allContexts = brands.flatMap((b) => modes.flatMap((m) => densities.map((d) => [b, m, d])));
export const representative = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];

/**
 * Evidence (screenshots, computed.json, browser-results.json) is written to reports/ only on explicit request
 * (`GGB_EVIDENCE=1 npm run test:browser`). Without it every check still runs, screenshots included, but nothing is
 * written, so that a run leaves the working tree clean (anti-aliasing changes a few pixels from one run to another).
 */
export const evidence = process.env.GGB_EVIDENCE === '1';

/** Takes the screenshot in every run; writes it to `path` only when evidence is requested. */
export async function capture(page: Page, path: string, options: Omit<PageScreenshotOptions, 'path'> = {}) {
  if (!evidence) return page.screenshot(options);
  fs.mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true });
  return page.screenshot({ ...options, path });
}

/** Writes a report file only when evidence is requested. */
export function writeEvidence(path: string, content: string) {
  if (!evidence) return;
  fs.mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(path, content);
}

export const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
export const px = (t: Token): number => (t.$value as { value: number }).value;
export const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};
/** The inset box-shadow that draws a component border of `width` in `color`. */
export const insetBorder = (color: Token, width: Token) => `${rgb(color)} 0px 0px 0px ${px(width)}px inset`;

/** Waits until no CSS transition runs, so that measures and audits read settled colors. */
export async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition)));
}

export async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
  await settle(page);
}

/** Role, name, description and properties of an element in Chromium's accessibility tree (through CDP). */
export async function accessible(
  page: Page,
  selector: string
): Promise<{ role: string; name: string; description: string; properties: Record<string, unknown> }> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', {
      backendNodeId: node.backendNodeId,
      fetchRelatives: false
    });
    const n = nodes[0];
    return {
      role: String(n.role?.value),
      name: String(n.name?.value ?? ''),
      description: String(n.description?.value ?? ''),
      properties: Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value]))
    };
  } finally {
    await cdp.detach();
  }
}

/** The computed.json layout: one record per line. */
export const computedJson = (records: Record<string, unknown>[]) =>
  `{ "records": [\n${records.map((r) => JSON.stringify(r)).join(',\n')}\n] }\n`;

/** Collects computed records and writes reports/components/<id>/svelte/computed.json. */
export class ComputedReport {
  records: Record<string, unknown>[] = [];
  add(context: string, props: Record<string, unknown>, state: string, values: Record<string, unknown>) {
    for (const [property, value] of Object.entries(values))
      this.records.push({ context, props, state, property, value });
  }
  write(id: string) {
    expect(this.records.length).toBeGreaterThan(0);
    writeEvidence(`reports/components/${id}/svelte/computed.json`, computedJson(this.records));
  }
}

/** axe audit of the review page in light and dark, screenshots on desktop and mobile, no horizontal overflow. */
export async function auditAndCapture(page: Page, id: string) {
  const out = `reports/components/${id}/svelte`;
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    await settle(page);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    // Documented exception (wave 2, raised at the implementation gate): text of an inactive component is exempt
    // from contrast (WCAG 1.4.3). axe treats text referenced by aria-labelledby of a disabled control as inactive,
    // but not a description referenced by aria-describedby, so color-contrast results inside a component marked
    // data-disabled are skipped. Every other violation fails.
    const violations: string[] = [];
    for (const v of results.violations)
      for (const n of v.nodes) {
        const selector = String(n.target[n.target.length - 1]);
        const inactive =
          v.id === 'color-contrast' &&
          (await page.evaluate((s) => !!document.querySelector(s)?.closest('[data-disabled]'), selector));
        if (!inactive) violations.push(`${mode} ${v.id}: ${n.target}`);
      }
    expect(violations).toEqual([]);
    await capture(page, `${out}/review-${mode}.png`, { fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  // Two frames: components that adapt to their size (a ButtonGroup that stacks) do so in a ResizeObserver callback.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await capture(page, `${out}/review-mobile.png`, { fullPage: true });
}

/** Ids of the elements a Tab press sequence focuses, starting from `from`. */
export async function tabOrder(page: Page, from: string, presses: number) {
  await page.focus(from);
  const order: string[] = [];
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.activeElement?.id ?? ''));
  }
  return order;
}
