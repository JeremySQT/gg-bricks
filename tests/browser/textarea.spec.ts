import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  densities,
  insetBorder,
  px,
  representative,
  rgb,
  setContext,
  settle,
  sizes,
  tokensFor,
  type TokenMap
} from './helpers.ts';

const out = 'reports/components/textarea/svelte';

/** Computed values of one textarea: container colors and border, ring, geometry, padding and text metrics. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((textarea) => {
    const container = textarea.closest('.ggb-textarea') as HTMLElement;
    const c = getComputedStyle(container);
    const t = getComputedStyle(textarea);
    const r = container.getBoundingClientRect();
    return {
      surface: c.backgroundColor,
      content: t.color,
      boxShadow: c.boxShadow,
      placeholder: getComputedStyle(textarea, '::placeholder').color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      height: r.height,
      paddingTop: parseFloat(t.paddingTop),
      paddingLeft: parseFloat(t.paddingLeft),
      lineHeight: parseFloat(t.lineHeight),
      fontSize: t.fontSize,
      resize: t.resize
    };
  });
}

const fieldColors = (tokens: TokenMap, condition: string) => ({
  surface: rgb(tokens[`color.field.${condition}.surface`]),
  content: rgb(tokens[`color.field.${condition}.content`]),
  boxShadow: insetBorder(tokens[`color.field.${condition}.border`], tokens['border.width.default']),
  placeholder: rgb(tokens[`color.field.${condition}.placeholder`])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/textarea/');
  await page.evaluate(() => document.fonts.ready);
});

test('named by the Field label or its own label; typing edits and emits; Enter adds a line', async ({ page }) => {
  const play = await accessible(page, '#play');
  expect(play.role).toBe('textbox');
  expect(play.name).toBe('Feedback');
  expect(play.description).toBe('Visible to your team only.');
  expect(play.properties.multiline).toBe(true);
  expect((await accessible(page, '#cond-default')).name).toBe('Notes (default)');
  await page.click('#play');
  await page.keyboard.type('Good');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Better');
  await expect(page.locator('#play')).toHaveValue('Good\nBetter');
  await expect(page.getByTestId('edits')).toHaveText('Edits: 11');
  await page.focus('#cond-readonly');
  await page.keyboard.type('x');
  await expect(page.locator('#cond-readonly')).toHaveValue('Leave at the door.');
  await expect(page.locator('#cond-disabled')).toBeDisabled();
});

test('one row has the height and the text position of the InputText of the same size, in every density', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const input = (await page.locator(`#pair-input-${size} >> xpath=..`).boundingBox())!;
      const area = (await page.locator(`#pair-textarea-${size} >> xpath=..`).boundingBox())!;
      expect(area.height, `${density} ${size}`).toBeCloseTo(px(tokens[`size.control.${size}`]), 0);
      expect(area.height).toBeCloseTo(input.height, 0);
      const m = await measure(page, `#pair-textarea-${size}`);
      expect(m.paddingLeft).toBe(px(tokens[`space.control.padding-inline.${size}`]));
      expect(m.paddingTop).toBeCloseTo((px(tokens[`size.control.${size}`]) - m.lineHeight) / 2, 1);
    }
  }
});

test('rows set the initial height; vertical resizes, auto grows to maxRows then scrolls, none stays', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const control = px(tokens['size.control.md']);
  const rowsHeight = async (selector: string) => {
    const m = await measure(page, selector);
    return (m.height - (control - m.lineHeight)) / m.lineHeight;
  };
  expect(await rowsHeight('#resize-vertical')).toBeCloseTo(3, 1);
  expect((await measure(page, '#resize-vertical')).resize).toBe('vertical');
  expect((await measure(page, '#resize-none')).resize).toBe('none');
  expect(await rowsHeight('#resize-none')).toBeCloseTo(3, 1);
  // Auto: 2 rows empty, grows with the content to 5 rows, then scrolls; back to 2 when cleared.
  expect((await measure(page, '#resize-auto')).resize).toBe('none');
  expect(await rowsHeight('#resize-auto')).toBeCloseTo(2, 1);
  await page.click('#auto-fill');
  expect(await rowsHeight('#resize-auto')).toBeCloseTo(5, 1);
  const scrolls = await page
    .locator('#resize-auto')
    .evaluate((el) => (el as HTMLTextAreaElement).scrollHeight > el.clientHeight);
  expect(scrolls).toBe(true);
  await page.click('#auto-clear');
  expect(await rowsHeight('#resize-auto')).toBeCloseTo(2, 1);
  // The playground follows the rows option.
  await page.fill('#opt-rows', '5');
  expect(await rowsHeight('#play')).toBeCloseTo(5, 1);
});

test('computed values match the resolved tokens for every condition and context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.mouse.move(0, 0);
    for (const condition of ['default', 'readonly', 'disabled', 'invalid']) {
      const m = await measure(page, `#cond-${condition}`);
      const expected = fieldColors(tokens, condition);
      expect(m.surface, `${context} ${condition}`).toBe(expected.surface);
      expect(m.content).toBe(expected.content);
      expect(m.boxShadow).toBe(expected.boxShadow);
      expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
      if (condition === 'default') expect(m.placeholder).toBe(expected.placeholder);
      report.add(context, { size: 'md' }, condition, m);
    }
    for (const size of sizes) report.add(context, { size }, 'default', await measure(page, `#pair-textarea-${size}`));
  }
  const ring = (tokens: TokenMap) =>
    `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`;
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.hover('#cond-default');
    const hover = await measure(page, '#cond-default');
    expect(hover.boxShadow).toBe(fieldColors(tokens, 'hover').boxShadow);
    report.add(context, { size: 'md' }, 'hover', hover);
    await page.mouse.move(0, 0);
    await page.focus('#cond-default');
    const focus = await measure(page, '#cond-default');
    expect(focus.boxShadow).toBe(fieldColors(tokens, 'focus').boxShadow);
    expect(focus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'focus', focus);
    await page.focus('#cond-invalid');
    const invalidFocus = await measure(page, '#cond-invalid');
    expect(invalidFocus.boxShadow).toBe(fieldColors(tokens, 'invalid').boxShadow);
    expect(invalidFocus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'invalid+focus', invalidFocus);
    await page.locator('#cond-invalid').evaluate((el) => (el as HTMLTextAreaElement).blur());
  }
  report.write('textarea');
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors keep the boundary', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#cond-default >> xpath=..');
  await expect(container).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(container).toHaveCSS('outline-style', 'solid');
  await expect(container).toHaveCSS('outline-width', '1px');
  await page.focus('#cond-default');
  await expect(container).toHaveCSS('outline-width', '2px');
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'textarea');
});
