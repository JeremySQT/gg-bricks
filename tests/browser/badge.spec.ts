import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { capture, computedJson, writeEvidence } from './helpers.ts';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Typography = { fontSize: { value: number }; fontWeight: number; lineHeight: number };
type Color = { components: number[]; alpha?: number };

const out = 'reports/components/badge/svelte';
const sizes = ['sm', 'md', 'lg'];
const intents = ['neutral', 'accent', 'info', 'success', 'warning', 'danger'];
const appearances = ['subtle', 'strong'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const px = (t: Token): number => (t.$value as { value: number }).value;
const typography = (t: Token): Typography => t.$value as Typography;
const lineBox = (t: Token): number => typography(t).fontSize.value * typography(t).lineHeight;
const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};

async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
  await settle(page);
}

/**
 * Waits until no CSS transition runs. A context switch transitions colors (motion duration); an audit or a measure
 * taken meanwhile reads intermediate colors, which made the axe contrast audit fail intermittently in CI.
 */
async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition)));
}

/** Computed values and geometry of one badge: container, label and leading icon. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const label = el.querySelector('.ggb-badge__label') as HTMLElement;
    const glyph = el.querySelector('.ggb-badge__leading > svg');
    const g = glyph?.getBoundingClientRect();
    return {
      color: c.color,
      backgroundColor: c.backgroundColor,
      boxShadow: c.boxShadow,
      radius: c.borderTopLeftRadius,
      paddingInline: c.paddingInlineStart,
      paddingInlineEnd: c.paddingInlineEnd,
      fontSize: c.fontSize,
      fontWeight: c.fontWeight,
      height: r.height,
      width: r.width,
      minInlineSize: c.minInlineSize,
      labelColor: getComputedStyle(label).color,
      iconColor: glyph ? getComputedStyle(glyph).color : '',
      iconSize: g ? `${g.width}x${g.height}` : '',
      iconOffsetInline: g ? g.left - r.left : 0,
      iconGap: glyph ? getComputedStyle(el.querySelector('.ggb-badge__leading')!).marginInlineEnd : '',
      iconToLabel: g ? label.getBoundingClientRect().left - g.right : 0,
      tabIndex: (el as HTMLElement).tabIndex,
      truncated: label.scrollWidth > label.clientWidth
    };
  });
}

/** Static text of an element as exposed by Chromium's accessibility tree (through CDP). */
async function accessibleText(page: Page, selector: string): Promise<{ text: string; roles: string[] }> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map((n) => [n.nodeId, n]));
    const start = nodes.find((n) => n.backendDOMNodeId === node.backendNodeId);
    if (!start) throw Error(`${selector} is not in the accessibility tree`);
    const parts: string[] = [];
    const roles: string[] = [];
    const walk = (n: (typeof nodes)[number]) => {
      if (!n.ignored) roles.push(String(n.role?.value));
      if (n.role?.value === 'StaticText' && !n.ignored) parts.push(String(n.name?.value ?? ''));
      for (const id of n.childIds ?? []) {
        const child = byId.get(id);
        if (child) walk(child);
      }
    };
    walk(start);
    return { text: parts.join(''), roles };
  } finally {
    await cdp.detach();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/badge/');
  await page.evaluate(() => document.fonts.ready);
});

test('read as plain text: the label is the text, the icon is hidden, nothing is interactive', async ({ page }) => {
  const plain = await accessibleText(page, '#badge-success-subtle-md');
  expect(plain.text).toBe('Paid');
  expect(plain.roles.filter((r) => !['generic', 'StaticText', 'InlineTextBox'].includes(r))).toEqual([]);
  const withIcon = await accessibleText(page, '#badge-icon-success-subtle-md');
  expect(withIcon.text).toBe('Paid');
  expect(withIcon.roles).not.toContain('image');
  // Truncated label: the whole text stays available.
  expect((await accessibleText(page, '#truncated')).text).toBe('Waiting for customer approval');
  for (const id of ['#badge-danger-strong-md', '#truncated']) expect((await measure(page, id)).tabIndex).toBe(-1);
  // Tab skips badges.
  await page.focus('#cell');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.closest('.ggb-badge') !== null);
  expect(focused).toBe(false);
});

test('geometry: the Counter box family, density-independent height, inline padding and an optical icon', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    for (const size of sizes) {
      const t = tokens[`typography.indicator.${size}`];
      const m = await measure(page, `#badge-neutral-subtle-${size}`);
      expect(m.height, `${density} ${size}`).toBeCloseTo(lineBox(t), 1);
      expect(m.width).toBeGreaterThanOrEqual(m.height - 0.01);
      expect(m.fontSize).toBe(`${typography(t).fontSize.value}px`);
      expect(m.fontWeight).toBe(String(typography(t).fontWeight));
      expect(m.paddingInline).toBe(`${px(tokens['space.content.xs'])}px`);
      expect(m.paddingInlineEnd).toBe(`${px(tokens['space.content.xs'])}px`);
      expect(m.radius).toBe(`${px(tokens['radius.indicator'])}px`);
      const icon = await measure(page, `#badge-icon-neutral-subtle-${size}`);
      const iconSize = px(tokens['size.icon.xs']);
      expect(icon.height).toBeCloseTo(lineBox(t), 1);
      expect(icon.iconSize).toBe(`${iconSize}x${iconSize}`);
      expect(icon.iconOffsetInline).toBeCloseTo(px(tokens['space.content.xs']) - iconSize / 8, 1);
      expect(icon.iconGap).toBe(`${px(tokens['space.content.xs'])}px`);
      // The drawing, not the box, sits at leadingGap from the label (the box overlaps the gap by 1/8).
      expect(icon.iconToLabel).toBeCloseTo(px(tokens['space.content.xs']) - iconSize / 8, 1);
      // Same line, same height as a Counter of the same size.
      const badge = (await page.locator(`#line-badge-${size}`).boundingBox())!;
      const counter = (await page.locator(`#line-counter-${size}`).boundingBox())!;
      expect(badge.height).toBeCloseTo(counter.height, 1);
      expect(badge.y).toBeCloseTo(counter.y, 1);
    }
  }
});

test('the label truncates with an ellipsis in a narrow cell; the icon stays whole and nothing overflows', async ({
  page
}) => {
  for (const width of [3, 5, 8]) {
    await page.locator('#cell').fill(String(width));
    const m = await measure(page, '#truncated');
    const cell = (await page.getByTestId('cell').boundingBox())!;
    const badge = (await page.locator('#truncated').boundingBox())!;
    expect(badge.x + badge.width).toBeLessThanOrEqual(cell.x + cell.width + 0.5);
    expect(m.truncated, `${width}em`).toBe(true);
    expect(m.iconSize).toBe('12x12');
  }
  expect((await measure(page, '#badge-warning-subtle-md')).truncated).toBe(false);
  await expect(page.locator('#truncated .ggb-badge__label')).toHaveCSS('text-overflow', 'ellipsis');
  // Clipped horizontally only: descenders are never cut, whatever the browser's support for overflow-clip-margin.
  await expect(page.locator('#truncated .ggb-badge__label')).toHaveCSS('overflow-x', 'clip');
  await expect(page.locator('#truncated .ggb-badge__label')).toHaveCSS('overflow-y', 'visible');
  await expect(page.locator('#truncated .ggb-badge__label')).toHaveCSS('overflow-clip-margin', '0px');
  await expect(page.locator('#long')).toHaveCSS('white-space', 'nowrap');
});

test('computed values match the resolved tokens for every intent, appearance and size in every context', async ({
  page
}) => {
  test.setTimeout(300_000);
  const records: Record<string, unknown>[] = [];
  const record = (context: string, props: Record<string, string>, values: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(values))
      records.push({ context, props, state: 'default', property, value });
  };
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        for (const intent of intents)
          for (const appearance of appearances)
            for (const size of sizes) {
              const role = (r: string) => tokens[`color.status.${intent}.${r}`];
              const m = await measure(page, `#badge-icon-${intent}-${appearance}-${size}`);
              const label = `${context} ${intent} ${appearance} ${size}`;
              if (appearance === 'subtle') {
                expect(m.backgroundColor, label).toBe(rgb(role('surface')));
                expect(m.color, label).toBe(rgb(role('content')));
                expect(m.iconColor, label).toBe(rgb(role('icon')));
                expect(m.boxShadow, label).toBe(
                  `${rgb(role('border'))} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
                );
              } else {
                expect(m.backgroundColor, label).toBe(rgb(role('surfaceStrong')));
                expect(m.color, label).toBe(rgb(role('contentStrong')));
                expect(m.iconColor, label).toBe(rgb(role('contentStrong')));
                expect(m.boxShadow, label).toBe(
                  `rgba(0, 0, 0, 0) 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
                );
              }
              expect(m.labelColor).toBe(m.color);
              expect(m.height).toBeCloseTo(lineBox(tokens[`typography.indicator.${size}`]), 1);
              record(context, { intent, appearance, size, leading: 'icon' }, m);
            }
      }
  writeEvidence(`${out}/computed.json`, computedJson(records));
  expect(records.length).toBeGreaterThan(0);
});

test('no motion; forced colors keep the box visible with an edge in the system text color', async ({ page }) => {
  await expect(page.locator('#badge-success-subtle-md')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('#badge-success-subtle-md')).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ forcedColors: 'active' });
  for (const id of ['#badge-success-subtle-md', '#badge-danger-strong-md']) {
    await expect(page.locator(id)).toHaveCSS('outline-style', 'solid');
    await expect(page.locator(id)).toHaveCSS('outline-width', '1px');
    const [outline, text] = await page.locator(id).evaluate((el) => {
      const c = getComputedStyle(el);
      return [c.outlineColor, c.color];
    });
    expect(outline).toBe(text);
  }
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    await settle(page);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target}`))).toEqual([]);
    await capture(page, `${out}/review-${mode}.png`, { fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await capture(page, `${out}/review-mobile.png`, { fullPage: true });
});
