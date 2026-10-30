import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { capture, computedJson, writeEvidence } from './helpers.ts';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Color = { components: number[]; alpha?: number };

const out = 'reports/components/icon-button/svelte';
const sizes = ['sm', 'md', 'lg'];
const intents = ['accent', 'neutral', 'danger'];
const appearances = ['solid', 'outline', 'ghost'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
const representative = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const px = (t: Token): number => (t.$value as { value: number }).value;
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

/** Computed values of one icon button: root color, container surface, border, focus ring and geometry. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const container = el.querySelector('.ggb-icon-button__container') as HTMLElement;
    const c = getComputedStyle(container);
    const r = container.getBoundingClientRect();
    const glyph = el.querySelector('.ggb-icon-button__icon > svg, .ggb-icon-button__loadingIndicator > svg');
    const g = glyph?.getBoundingClientRect();
    return {
      content: getComputedStyle(el).color,
      surface: c.backgroundColor,
      boxShadow: c.boxShadow,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      width: r.width,
      height: r.height,
      iconWidth: g?.width ?? 0,
      iconHeight: g?.height ?? 0,
      iconOffsetX: g ? g.left + g.width / 2 - (r.left + r.width / 2) : 0,
      iconOffsetY: g ? g.top + g.height / 2 - (r.top + r.height / 2) : 0,
      glyphColor: glyph ? getComputedStyle(glyph).color : ''
    };
  });
}

/** Role and name of an element as exposed by Chromium's accessibility tree (through CDP). */
async function accessible(page: Page, selector: string): Promise<{ role: string; name: string; ignored: number }> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const start = nodes.find((n) => n.backendDOMNodeId === node.backendNodeId);
    if (!start) throw Error(`${selector} is not in the accessibility tree`);
    const byId = new Map(nodes.map((n) => [n.nodeId, n]));
    // Exposed descendants: an icon button has none (the icon is hidden, there is no text).
    let exposed = 0;
    const walk = (id: string) => {
      const n = byId.get(id);
      if (!n) return;
      if (!n.ignored && n.role?.value !== 'none' && n.role?.value !== 'generic') exposed++;
      for (const c of n.childIds ?? []) walk(c);
    };
    for (const c of start.childIds ?? []) walk(c);
    return { role: String(start.role?.value), name: String(start.name?.value ?? ''), ignored: exposed };
  } finally {
    await cdp.detach();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/icon-button/');
  await page.evaluate(() => document.fonts.ready);
});

test('the label is the accessible name; the icon is hidden and nothing is visible as text', async ({ page }) => {
  const a = await accessible(page, '#play');
  expect(a).toEqual({ role: 'button', name: 'Edit', ignored: 0 });
  await expect(page.locator('#play')).toHaveText('');
  await expect(page.locator('#play')).not.toHaveAttribute('title');
  await page.fill('#opt-label', 'Rename file');
  expect((await accessible(page, '#play')).name).toBe('Rename file');
  await page.check('#opt-link');
  expect(await accessible(page, '#play')).toEqual({ role: 'link', name: 'Rename file', ignored: 0 });
  // Default treatment: neutral ghost md.
  await page.uncheck('#opt-link');
  await expect(page.locator('#card-close')).toHaveAttribute('data-intent', 'neutral');
  await expect(page.locator('#card-close')).toHaveAttribute('data-appearance', 'ghost');
  await expect(page.locator('#card-close')).toHaveAttribute('data-size', 'md');
});

test('activation by pointer, Enter and Space; forms submit only on request', async ({ page }) => {
  const count = page.getByTestId('activations');
  await page.click('#play');
  await expect(count).toHaveText('Activations: 1');
  await page.focus('#play');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(count).toHaveText('Activations: 3');
  await page.click('#form-default');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted 0');
  await page.click('#form-submit');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted 1');
});

test('loading keeps focus and size, replaces the icon and blocks activation; disabled leaves the tab order', async ({
  page
}) => {
  const count = page.getByTestId('activations');
  const before = await measure(page, '#play');
  await page.check('#opt-loading');
  const loading = await measure(page, '#play');
  expect([loading.width, loading.height]).toEqual([before.width, before.height]);
  expect([loading.iconWidth, loading.iconHeight]).toEqual([before.iconWidth, before.iconHeight]);
  await expect(page.locator('#play .ggb-icon-button__icon')).toHaveCount(0);
  await expect(page.locator('#play')).toHaveAttribute('aria-busy', 'true');
  await page.focus('#play');
  await expect(page.locator('#play')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.click('#play', { force: true });
  await expect(count).toHaveText('Activations: 0');
  expect((await accessible(page, '#play')).name).toBe('Edit');

  await page.uncheck('#opt-loading');
  await page.check('#opt-disabled');
  await expect(page.locator('#play')).toBeDisabled();
  await page.click('#play', { force: true });
  await expect(count).toHaveText('Activations: 0');

  // Links: disabled has no destination and leaves the tab order; loading keeps it but never navigates.
  await expect(page.locator('#link-disabled')).not.toHaveAttribute('href');
  await expect(page.locator('#link-disabled')).toHaveAttribute('tabindex', '-1');
  const url = page.url();
  await page.click('#link-loading', { force: true });
  expect(page.url()).toBe(url);
  await page.click('#link');
  expect(page.url()).toMatch(/#states$/);

  // Async: loading while the request runs, then activatable again.
  await page.click('#async');
  await expect(page.locator('#async')).toHaveAttribute('data-loading', '');
  await page.click('#async', { force: true });
  await expect(page.getByTestId('saved')).toHaveText('Saved 1 times', { timeout: 4000 });
  await expect(page.locator('#async')).not.toHaveAttribute('data-loading');
});

test('a square of the control size in every density, a centered icon and a 44 px target', async ({ page }) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    for (const size of sizes) {
      const m = await measure(page, `#ib-accent-solid-${size}`);
      const box = px(tokens[`size.control.${size}`]);
      expect(m.width, `${density} ${size}`).toBe(box);
      expect(m.height).toBe(box);
      expect(m.iconWidth).toBe(px(tokens[`size.icon.${size}`]));
      expect(m.iconHeight).toBe(px(tokens[`size.icon.${size}`]));
      expect(Math.abs(m.iconOffsetX)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(m.iconOffsetY)).toBeLessThanOrEqual(0.5);
      // Same height as the Button of the same size beside it.
      const button = await page.locator(`#align-button-${size} .ggb-button__container`).boundingBox();
      const icon = await page.locator(`#align-ib-${size} .ggb-icon-button__container`).boundingBox();
      expect(icon!.height).toBe(button!.height);
      expect(icon!.y).toBeCloseTo(button!.y, 1);
      // Target: a point 21 px from the center in each direction still hits the control (the isolated
      // playground control: in the matrix, neighbours 12 px apart overlap each other's targets).
      await page.selectOption('#opt-size', size);
      const r = (await page.locator('#play').boundingBox())!;
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      for (const [dx, dy] of [
        [21, 0],
        [-21, 0],
        [0, 21],
        [0, -21]
      ]) {
        const hit = await page.evaluate(
          ([x, y]) => document.elementFromPoint(x, y)?.closest('.ggb-icon-button')?.id ?? '',
          [cx + dx, cy + dy]
        );
        expect(hit, `${size} target at ${dx},${dy}`).toBe('play');
      }
    }
  }
});

test('computed values match the resolved tokens for every option, state and context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no transitions: read settled values
  const records: Record<string, unknown>[] = [];
  const record = (context: string, props: Record<string, string>, state: string, values: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(values)) records.push({ context, props, state, property, value });
  };
  const expectColors = (
    tokens: TokenMap,
    intent: string,
    appearance: string,
    state: string,
    m: Awaited<ReturnType<typeof measure>>
  ) => {
    const role = (r: string, a = appearance) => tokens[`color.action.${intent}.${a}.${state}.${r}`];
    expect(m.content, `${intent} ${appearance} ${state} content`).toBe(rgb(role('content')));
    expect(m.glyphColor, `${intent} ${appearance} ${state} glyph`).toBe(rgb(role('content')));
    expect(m.surface, `${intent} ${appearance} ${state} surface`).toBe(rgb(role('surface')));
    if (appearance === 'outline')
      expect(m.boxShadow).toBe(
        `${rgb(role('border', 'outline'))} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
    else expect(m.boxShadow).toBe('none');
  };

  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        await page.mouse.move(0, 0);
        for (const intent of intents)
          for (const appearance of appearances)
            for (const size of sizes) {
              const m = await measure(page, `#ib-${intent}-${appearance}-${size}`);
              expectColors(tokens, intent, appearance, 'default', m);
              expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
              expect(m.width).toBe(px(tokens[`size.control.${size}`]));
              expect(m.iconWidth).toBe(px(tokens[`size.icon.${size}`]));
              record(context, { intent, appearance, size }, 'default', m);
            }
      }

  const play = page.locator('#play');
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of intents)
      for (const appearance of appearances) {
        await page.selectOption('#opt-intent', intent);
        await page.selectOption('#opt-appearance', appearance);
        const props = { intent, appearance, size: 'md' };
        await play.hover();
        const hover = await measure(page, '#play');
        expectColors(tokens, intent, appearance, 'hover', hover);
        record(context, props, 'hover', hover);
        await page.mouse.down();
        const pressed = await measure(page, '#play');
        expectColors(tokens, intent, appearance, 'pressed', pressed);
        record(context, props, 'pressed', pressed);
        await page.mouse.up();
        await page.mouse.move(0, 0);
        await page.locator('#opt-intent').focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        await play.focus();
        await page.keyboard.press('Shift');
        const focus = await measure(page, '#play');
        expect(focus.outline).toBe(
          `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
        );
        record(context, props, 'focus', focus);
        await page.locator('#opt-loading').evaluate((el: HTMLInputElement) => el.click());
        const loading = await measure(page, '#play');
        expectColors(tokens, intent, appearance, 'loading', loading);
        record(context, props, 'loading', loading);
        await page.locator('#opt-loading').evaluate((el: HTMLInputElement) => el.click());
        await page.locator('#opt-disabled').evaluate((el: HTMLInputElement) => el.click());
        const disabled = await measure(page, '#play');
        expectColors(tokens, intent, appearance, 'disabled', disabled);
        record(context, props, 'disabled', disabled);
        await page.locator('#opt-disabled').evaluate((el: HTMLInputElement) => el.click());
        await page.mouse.move(0, 0);
      }
  }
  writeEvidence(`${out}/computed.json`, computedJson(records));
  expect(records.length).toBeGreaterThan(0);
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors stay usable', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#play .ggb-icon-button__container');
  const duration = px(tokens['motion.duration.fast']);
  await expect(container).toHaveCSS('transition-duration', `${duration / 1000}s`);
  await expect(container).toHaveCSS('transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.check('#opt-loading');
  await expect(page.locator('#play .ggb-icon-button__loadingIndicator svg')).toHaveCSS('animation-duration', '2.4s');

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(page.locator('#ib-accent-ghost-md .ggb-icon-button__container')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#ib-accent-ghost-md .ggb-icon-button__container')).toHaveCSS('outline-width', '1px');
  await page.locator('#card-close').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#card-close .ggb-icon-button__container')).toHaveCSS('outline-width', '2px');
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
