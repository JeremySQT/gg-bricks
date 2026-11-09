import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  auditAndCapture,
  px,
  representative,
  rgb,
  setContext,
  sizes,
  tokensFor
} from './helpers.ts';

const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');
const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((el) => el.matches(':popover-open'));

test.beforeEach(async ({ page }) => {
  await page.goto('/toolbar/');
  await page.evaluate(() => document.fonts.ready);
});

test('one tab stop; arrows wrap and skip the disabled item and the separator; Home and End; Tab leaves', async ({
  page
}) => {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('t-copy');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-rename');
  // Delete is disabled, then the separator: both skipped.
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-download');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-filter-trigger');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-more-trigger');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-copy');
  await page.keyboard.press('ArrowLeft');
  expect(await focused(page)).toBe('t-more-trigger');
  await page.keyboard.press('Home');
  expect(await focused(page)).toBe('t-copy');
  await page.keyboard.press('End');
  expect(await focused(page)).toBe('t-more-trigger');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('after');
  // The toolbar remembers the last focused item.
  await page.keyboard.press('Shift+Tab');
  expect(await focused(page)).toBe('t-more-trigger');
  // An enabled Delete joins the sequence.
  await page.check('#opt-delete-disabled', { force: true });
  await page.uncheck('#opt-delete-disabled');
  await page.focus('#t-rename');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-delete');
});

test('items keep their activation; a menu opens on Down Arrow and returns focus to its trigger', async ({ page }) => {
  await page.focus('#t-copy');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('last')).toHaveText('Last: copy');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('t-more-archive');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('last')).toHaveText('Last: archive');
  await expect.poll(() => focused(page)).toBe('t-more-trigger');
  // Arrow keys inside an open menu stay with the menu.
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('t-more-archive');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('t-more-share');
  await page.keyboard.press('Escape');
  await expect.poll(() => focused(page)).toBe('t-more-trigger');
  // A popover opens with Enter and gives focus back to its trigger on Escape.
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect.poll(() => isOpen(page, 't-filter')).toBe(true);
  await expect.poll(() => focused(page)).toBe('t-filter-name');
  // Arrow keys in the popover's field edit the field, not the toolbar.
  await page.keyboard.type('ab');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focused(page)).toBe('t-filter-name');
  await page.keyboard.press('Escape');
  await expect.poll(() => focused(page)).toBe('t-filter-trigger');
});

test('vertical: Down and Up move between items, also on a menu trigger', async ({ page }) => {
  await page.selectOption('#opt-orientation', 'vertical');
  await page.focus('#t-download');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('t-filter-trigger');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('t-more-trigger');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('t-copy');
  expect(await isOpen(page, 't-more')).toBe(false);
  await page.keyboard.press('ArrowUp');
  expect(await focused(page)).toBe('t-more-trigger');
  expect(await isOpen(page, 't-more')).toBe(false);
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('t-more-trigger');
});

test('the toolbar size reaches every button, the menu and popover triggers and the tooltip controls', async ({
  page
}) => {
  for (const size of sizes) {
    await page.selectOption('#opt-size', size);
    for (const id of ['t-copy', 't-rename', 't-download', 't-filter-trigger', 't-more-trigger'])
      await expect(page.locator(`#${id}`), `${size} ${id}`).toHaveAttribute('data-size', size);
  }
});

test('accessibility tree: a named toolbar; separators are perpendicular', async ({ page }) => {
  const bar = await accessible(page, '#play');
  expect(bar.role).toBe('toolbar');
  expect(bar.name).toBe('Selection actions');
  await expect(page.locator('#play .ggb-toolbar__separator')).toHaveAttribute('aria-orientation', 'vertical');
  await expect(page.locator('#vertical .ggb-toolbar__separator')).toHaveAttribute('aria-orientation', 'horizontal');
});

test('computed values match the resolved tokens: gap, separator, item heights; narrow toolbars wrap in order', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes) {
      const values = await page.locator(`#size-${size}`).evaluate((bar) => {
        const sep = bar.querySelector('.ggb-toolbar__separator')!;
        const s = getComputedStyle(sep);
        return {
          gap: getComputedStyle(bar).columnGap,
          separatorColor: s.backgroundColor,
          separatorWidth: s.width,
          separatorMargin: s.marginLeft,
          itemHeight: bar.querySelector('.ggb-icon-button__container')!.getBoundingClientRect().height
        };
      });
      expect(values.gap, `${context} ${size}`).toBe(`${px(tokens[`space.control.gap.${size}`])}px`);
      expect(values.separatorColor).toBe(rgb(tokens['color.border.subtle']));
      expect(values.separatorWidth).toBe(`${px(tokens['border.width.default'])}px`);
      expect(values.separatorMargin).toBe(`${px(tokens['space.content.xs'])}px`);
      expect(values.itemHeight).toBe(px(tokens[`size.control.${size}`]));
      report.add(context, { size }, 'default', values);
    }
  }
  const lines = await page
    .locator('#wrap .ggb-button')
    .evaluateAll((b) => [...new Set(b.map((e) => Math.round(e.getBoundingClientRect().top)))].length);
  expect(lines).toBeGreaterThan(1);
  report.write('toolbar');
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'toolbar');
});
