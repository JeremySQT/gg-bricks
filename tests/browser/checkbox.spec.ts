import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
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

const out = 'reports/components/checkbox/svelte';
const conditions = ['default', 'readonly', 'disabled', 'invalid'];
const selections = ['off', 'on', 'indeterminate'];

/** Computed values of one checkbox: box colors, border, mark color, geometry and label line. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((control) => {
    const label = control.closest('.ggb-checkbox') as HTMLElement;
    const c = getComputedStyle(control);
    const r = control.getBoundingClientRect();
    const text = label.querySelector('.ggb-checkbox__label') as HTMLElement;
    const t = text.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
    const mark = control.querySelector('svg');
    return {
      surface: c.backgroundColor,
      boxShadow: c.boxShadow,
      mark: c.color,
      markSize: mark ? mark.getBoundingClientRect().width : 0,
      labelColor: getComputedStyle(text).color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      size: r.width,
      height: r.height,
      gap: t.left - r.right,
      firstLineOffset: r.top + r.height / 2 - (t.top + lineHeight / 2),
      fontSize: getComputedStyle(text).fontSize
    };
  });
}

const choiceColors = (tokens: TokenMap, selection: string, condition: string) => {
  const s = selection === 'off' ? 'off' : 'on';
  return {
    surface: rgb(tokens[`color.choice.${s}.${condition}.surface`]),
    boxShadow: insetBorder(tokens[`color.choice.${s}.${condition}.border`], tokens['border.width.default']),
    mark: rgb(tokens[`color.choice.${s}.${condition}.content`])
  };
};

test.beforeEach(async ({ page }) => {
  await page.goto('/checkbox/');
  await page.evaluate(() => document.fonts.ready);
});

test('a checkbox named by its label and described by its description; mixed state exposed', async ({ page }) => {
  const play = await accessible(page, '#play');
  expect(play.role).toBe('checkbox');
  expect(play.name).toBe('Email me about product updates');
  expect(play.properties.checked).toBe('false');
  const described = await accessible(page, '#desc-2');
  expect(described.name).toBe('Mentions');
  expect(described.description).toBe(
    'When someone mentions you in a comment or a task, including long threads that wrap.'
  );
  expect((await accessible(page, '#cb-default-indeterminate-md')).properties.checked).toBe('mixed');
  // Chromium does not expose readonly on the checkbox role in its tree; the attribute is the platform contract.
  await expect(page.locator('#cb-readonly-on-md')).toHaveAttribute('aria-readonly', 'true');
  // Hidden label: still the name.
  expect((await accessible(page, '#select-all')).name).toBe('Select all invoices');
});

test('box, label and description toggle; Space toggles, Enter does not; indeterminate checks', async ({ page }) => {
  const state = page.getByTestId('state');
  const changes = page.getByTestId('changes');
  await page.click('#play');
  await expect(state).toHaveText('checked: true · indeterminate: false');
  await page.click('#playground .ggb-checkbox__label');
  await expect(state).toHaveText('checked: false · indeterminate: false');
  await page.fill('#opt-description', 'Twice a month');
  await page.click('#playground .ggb-checkbox__description');
  await expect(state).toHaveText('checked: true · indeterminate: false');
  await page.focus('#play');
  await page.keyboard.press('Space');
  await expect(state).toHaveText('checked: false · indeterminate: false');
  await page.keyboard.press('Enter');
  await expect(state).toHaveText('checked: false · indeterminate: false');
  await expect(changes).toHaveText('Changes: 4');
  await page.check('#opt-indeterminate');
  await page.click('#play');
  await expect(state).toHaveText('checked: true · indeterminate: false');
  // Readonly ignores activation but stays focusable; disabled is skipped.
  await page.check('#opt-readonly');
  await page.click('#play');
  await page.focus('#play');
  await page.keyboard.press('Space');
  await expect(state).toHaveText('checked: true · indeterminate: false');
  await expect(page.locator('#play')).toBeFocused();
  await page.uncheck('#opt-readonly');
  await page.check('#opt-disabled');
  await expect(page.locator('#play')).toBeDisabled();
  await page.click('#playground .ggb-checkbox__label', { force: true });
  await expect(state).toHaveText('checked: true · indeterminate: false');
});

test('select all: indeterminate when some rows are selected; activating it selects every row', async ({ page }) => {
  await expect(page.locator('#select-all')).toHaveAttribute('aria-checked', 'mixed');
  await page.click('#select-all');
  await expect(page.getByTestId('selected')).toHaveText('3 selected');
  await expect(page.locator('#select-all')).toHaveAttribute('aria-checked', 'true');
  await page.click('#select-all');
  await expect(page.getByTestId('selected')).toHaveText('0 selected');
  await page.click('#row-1025');
  await expect(page.locator('#select-all')).toHaveAttribute('aria-checked', 'mixed');
});

test('box size, gap and first-line alignment in every density; 44 px targets, also with a hidden label', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const m = await measure(page, `#cb-default-on-${size}`);
      expect(m.size, `${density} ${size}`).toBe(px(tokens[`size.choice.${size}`]));
      expect(m.height).toBe(px(tokens[`size.choice.${size}`]));
      expect(m.markSize).toBe(m.size);
      expect(m.gap).toBeCloseTo(px(tokens[`space.control.gap.${size}`]), 1);
      expect(Math.abs(m.firstLineOffset)).toBeLessThanOrEqual(0.5);
    }
  }
  // Long label: the box stays on the first line.
  expect(Math.abs((await measure(page, '#long')).firstLineOffset)).toBeLessThanOrEqual(0.5);
  // Hidden label: 21 px around the box center in every direction still toggles it.
  await page.locator('#select-all').scrollIntoViewIfNeeded();
  const r = (await page.locator('#row-1026').boundingBox())!;
  const before = await page.locator('#row-1026').getAttribute('aria-checked');
  let toggles = 0;
  for (const [dx, dy] of [
    [21, 0],
    [-21, 0],
    [0, 21],
    [0, -21]
  ]) {
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('.ggb-checkbox')?.querySelector('button')?.id ?? '',
      [r.x + r.width / 2 + dx, r.y + r.height / 2 + dy]
    );
    if (hit === 'row-1026') toggles++;
  }
  // Rows 1025 and 1024 sit above, so the upward probe may land on a neighbour's target.
  expect(toggles).toBeGreaterThanOrEqual(3);
  expect(await page.locator('#row-1026').getAttribute('aria-checked')).toBe(before);
});

test('computed values match the resolved tokens for every selection, condition, size and context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.mouse.move(0, 0);
    for (const size of sizes)
      for (const condition of conditions)
        for (const selection of selections) {
          const m = await measure(page, `#cb-${condition}-${selection}-${size}`);
          const expected = choiceColors(tokens, selection, condition);
          expect(
            { surface: m.surface, boxShadow: m.boxShadow },
            `${context} ${size} ${condition} ${selection}`
          ).toEqual({
            surface: expected.surface,
            boxShadow: expected.boxShadow
          });
          if (selection !== 'off') expect(m.mark).toBe(expected.mark);
          expect(m.labelColor).toBe(
            rgb(tokens[condition === 'disabled' ? 'color.content.disabled' : 'color.content.primary'])
          );
          expect(m.radius).toBe(`${px(tokens['radius.indicator'])}px`);
          report.add(context, { size, selection }, condition, m);
        }
  }
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    // Hover alone: drop the focus left by the previous context's focus check.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    for (const selection of selections) {
      await page.hover(`#cb-default-${selection}-md >> xpath=../..`);
      const hover = await measure(page, `#cb-default-${selection}-md`);
      const expected = choiceColors(tokens, selection, 'hover');
      expect(hover.surface, `${context} hover ${selection}`).toBe(expected.surface);
      expect(hover.boxShadow).toBe(expected.boxShadow);
      report.add(context, { size: 'md', selection }, 'hover', hover);
    }
    // Hover does not override invalid, readonly or disabled.
    await page.hover('#cb-invalid-on-md >> xpath=../..');
    expect((await measure(page, '#cb-invalid-on-md')).surface).toBe(choiceColors(tokens, 'on', 'invalid').surface);
    await page.mouse.move(0, 0);
    await page.focus('#cb-default-off-md');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focus = await measure(page, '#cb-default-off-md');
    expect(focus.outline).toBe(
      `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
    );
    report.add(context, { size: 'md', selection: 'off' }, 'focus', focus);
  }
  report.write('checkbox');
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors keep the box', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const control = page.locator('#cb-default-off-md');
  await expect(control).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(control).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(control).toHaveCSS('outline-style', 'solid');
  await expect(control).toHaveCSS('outline-width', '1px');
  const on = await page
    .locator('#cb-default-on-md')
    .evaluate((el) => getComputedStyle(el).backgroundColor !== getComputedStyle(el.closest('.page')!).backgroundColor);
  expect(on).toBe(true);
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'checkbox');
});
