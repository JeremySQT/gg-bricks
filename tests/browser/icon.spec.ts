import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
const out = 'reports/components/icon/svelte';
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const px = (t: Token): number => (t.$value as { value: number }).value;
const rgb = (t: Token): string => {
  const c = t.$value as { components: number[]; alpha?: number };
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  return (c.alpha ?? 1) === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${c.alpha})`;
};
async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
}
const measure = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    return { width: r.width, height: r.height, fill: c.fill, color: c.color, display: c.display, flex: c.flexShrink };
  });

test.beforeEach(async ({ page }) => {
  await page.goto('/icon/');
  await page.evaluate(() => document.fonts.ready);
});

test('sizes follow size.icon in every context and never change with density', async ({ page }) => {
  const records: Record<string, unknown>[] = [];
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        for (const size of sizes) {
          const m = await measure(page, `#size-plus-${size}`);
          const expected = px(tokens[`size.icon.${size}`]);
          expect(m.width, `${context} ${size} width`).toBe(expected);
          expect(m.height, `${context} ${size} height`).toBe(expected);
          expect(m.fill).toBe(m.color);
          for (const [property, value] of Object.entries({ width: m.width, height: m.height, fill: m.fill }))
            records.push({ context, props: { size }, state: 'default', part: 'box', property, value });
        }
      }
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    `${out}/computed.json`,
    `{ "records": [\n${records.map((r) => JSON.stringify(r)).join(',\n')}\n] }\n`
  );
  expect(records.length).toBe(18 * sizes.length * 3);
});

test('decorative icons are hidden, named icons are images with their label', async ({ page }) => {
  await expect(page.locator('#deco-1')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('#deco-1').getAttribute('role')).toBeNull();
  await expect(page.locator('#named-1')).toHaveRole('img');
  await expect(page.locator('#named-1')).toHaveAccessibleName('Paid');
  await expect(page.locator('#named-2')).toHaveAccessibleName('Attention needed');
  // The playground toggles between the two through its label field.
  await expect(page.locator('#play-icon')).toHaveAttribute('aria-hidden', 'true');
  await page.fill('#opt-label', 'Add item');
  await expect(page.locator('#play-icon')).toHaveRole('img');
  await expect(page.locator('#play-icon')).toHaveAccessibleName('Add item');
  await page.fill('#opt-label', '');
  await expect(page.locator('#play-icon')).toHaveAttribute('aria-hidden', 'true');
  await page.selectOption('#opt-size', 'xl');
  await expect(page.locator('#play-icon')).toHaveAttribute('data-size', 'xl');
  expect((await measure(page, '#play-icon')).width).toBe(px(tokensFor('base-light-standard')['size.icon.xl']));
});

test('a host sizes its slot icons; the icon keeps its box in a flexible layout and follows the color', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  for (const size of ['sm', 'md', 'lg']) {
    const m = await measure(page, `#button-${size} .ggb-button__leading > svg`);
    expect(m.width, `button ${size}`).toBe(px(tokens[`size.icon.${size}`]));
    expect(m.height).toBe(px(tokens[`size.icon.${size}`]));
  }
  // The trailing icon declares size xs; the md button renders it at the md icon size.
  expect((await measure(page, '#button-trailing .ggb-button__trailing > svg')).width).toBe(px(tokens['size.icon.md']));
  const content = await page.locator('#button-ghost').evaluate((el) => getComputedStyle(el).color);
  expect((await measure(page, '#button-ghost .ggb-button__leading > svg')).fill).toBe(content);

  const squeezed = await measure(page, '#squeezed');
  expect(squeezed.width).toBe(px(tokens['size.icon.lg']));
  expect(squeezed.flex).toBe('0');
  expect((await measure(page, '#color-danger')).fill).toBe(rgb(tokens['color.status.danger.content']));
  expect((await measure(page, '#color-tertiary')).fill).toBe(rgb(tokens['color.content.tertiary']));
  // Another grid maps to the same box: a square spanning 18 of 24 units renders at 18/24 of the lg size.
  const grid24 = await page.locator('#grid-24 path').evaluate((el) => el.getBoundingClientRect().width);
  expect(grid24).toBe((px(tokens['size.icon.lg']) * 18) / 24);
});

test('next to text, the box is centered on the cap height of the surrounding text', async ({ page }) => {
  // Each "Inline with every text size" row: the icon center must meet the middle of the capitals (baseline minus
  // half of 1cap), within half a pixel. vertical-align: middle centered it on the x-height, 1.1 to 1.8 px low.
  const rows = await page.locator('p.inline').evaluateAll((ps) =>
    ps.map((p) => {
      const probe = (css: string) => {
        const el = document.createElement('span');
        el.style.cssText = css;
        p.appendChild(el);
        const r = el.getBoundingClientRect();
        el.remove();
        return r;
      };
      const baseline = probe('display:inline-block;width:0;height:0;vertical-align:baseline').bottom;
      const cap = probe('display:inline-block;width:0;height:1cap').height;
      const icon = p.querySelector('svg.ggb-icon')!.getBoundingClientRect();
      return { text: p.textContent!.trim(), offset: (icon.top + icon.bottom) / 2 - (baseline - cap / 2) };
    })
  );
  expect(rows.length).toBe(4);
  for (const row of rows) expect(Math.abs(row.offset), row.text).toBeLessThan(0.5);
});

test('automated accessibility audit and screenshots in light and dark', async ({ page }) => {
  fs.mkdirSync(out, { recursive: true });
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    await page.screenshot({ path: `${out}/review-${mode}.png`, fullPage: true });
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});
