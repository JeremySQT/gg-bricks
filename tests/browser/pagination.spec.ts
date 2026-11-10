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

const pages = (page: Page, id: string) =>
  page.locator(`#${id} .ggb-pagination__entry`).evaluateAll((e) => e.map((x) => x.textContent?.trim()).join(' '));
const control = (id: string, direction: 'first' | 'previous' | 'next' | 'last') =>
  `#${id} [data-direction="${direction}"]`;

test.beforeEach(async ({ page }) => {
  await page.goto('/pagination/');
  await page.evaluate(() => document.fonts.ready);
});

test('a named navigation; previous disabled on page 1; the count of items stays constant while paging', async ({
  page
}) => {
  const nav = await accessible(page, '#play');
  expect(nav.role).toBe('navigation');
  expect(nav.name).toBe('Pagination');
  expect(await pages(page, 'play')).toBe('1 2 3 4 5 … 20');
  await expect(page.locator(control('play', 'previous'))).toBeDisabled();
  const before = (await page.locator(control('play', 'next')).boundingBox())!;
  for (let i = 0; i < 10; i++) await page.click(control('play', 'next'));
  await expect(page.getByTestId('page')).toHaveText('Page: 11');
  expect(await pages(page, 'play')).toBe('1 … 10 11 12 … 20');
  const after = (await page.locator(control('play', 'next')).boundingBox())!;
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  await page.click('#play [data-page="20"]');
  await expect(page.locator(control('play', 'next'))).toBeDisabled();
  await expect(page.getByTestId('changes')).toHaveText('Changes: 11');
  // The current page does nothing.
  await page.click('#play [data-page="20"]');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 11');
});

test('keyboard: every control is a Tab stop; focus stays on the activated control, or moves to the current page', async ({
  page
}) => {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  // Previous is disabled: the first stop is page 1.
  expect(await page.evaluate(() => document.activeElement?.textContent)).toBe('1');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('page')).toHaveText('Page: 2');
  expect(await page.evaluate(() => document.activeElement?.textContent)).toBe('2');
  await page.focus(control('play', 'previous'));
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('page')).toHaveText('Page: 1');
  // Previous became disabled: focus moved to the current page.
  await expect(page.locator('#play [aria-current="page"]')).toBeFocused();
});

test('siblings and few pages; the application sets the page silently; links carry the page number', async ({
  page
}) => {
  await page.selectOption('#opt-siblings', '2');
  expect(await pages(page, 'play')).toBe('1 2 3 4 5 6 7 … 20');
  await page.selectOption('#opt-count', '5');
  expect(await pages(page, 'play')).toBe('1 2 3 4 5');
  await page.selectOption('#opt-count', '20');
  await page.click('#set-ten');
  expect(await pages(page, 'play')).toBe('1 … 8 9 10 11 12 … 20');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0');
  await expect(page.locator('#links [data-page="5"]')).toHaveAttribute('href', '#page-5');
  await expect(page.locator(control('links', 'next'))).toHaveAttribute('href', '#page-5');
  await page.click('#links [data-page="5"]');
  expect(await page.evaluate(() => location.hash)).toBe('#page-5');
  await expect(page.locator('#links [aria-current="page"]')).toHaveText('5');
  expect(
    await page
      .locator('#rtl .ggb-pagination__chevron')
      .first()
      .evaluate((c) => getComputedStyle(c).scale)
  ).toBe('-1 1');
});

test('first and last buttons go to the ends, are disabled there and stay in place', async ({ page }) => {
  await expect(page.locator(control('play', 'first'))).toHaveCount(0);
  await page.check('#opt-edges');
  await expect(page.locator(control('play', 'first'))).toBeDisabled();
  await expect(page.locator(control('play', 'first'))).toHaveAttribute('aria-label', 'First page');
  const before = (await page.locator(control('play', 'last')).boundingBox())!;
  await page.click(control('play', 'last'));
  await expect(page.getByTestId('page')).toHaveText('Page: 20');
  await expect(page.locator(control('play', 'last'))).toBeDisabled();
  const after = (await page.locator(control('play', 'last')).boundingBox())!;
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  // Focus moves to the current page once the activated control is disabled.
  await expect(page.locator('#play [aria-current="page"]')).toBeFocused();
  await page.click(control('play', 'first'));
  await expect(page.getByTestId('page')).toHaveText('Page: 1');
  expect(await pages(page, 'edges')).toBe('1 … 37 … 120');
});

test('computed values match the resolved tokens: pages default, hover, current with its edge, ellipsis, sizes', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes) {
      const read = (selector: string) =>
        page.locator(selector).evaluate((e) => {
          const s = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          return {
            surface: s.backgroundColor,
            content: s.color,
            edge: s.boxShadow,
            width: r.width,
            height: r.height,
            fontSize: s.fontSize,
            radius: s.borderTopLeftRadius
          };
        });
      const plain = await read(`#size-${size} [data-page="49"]`);
      const current = await read(`#size-${size} [data-page="50"]`);
      const typo = tokens[`typography.label.${size}`].$value as { fontSize: { value: number } };
      const box = px(tokens[`size.control.${size}`]);
      expect(plain.surface, `${context} ${size}`).toBe(rgb(tokens['color.item.default.surface']));
      expect(plain.content).toBe(rgb(tokens['color.item.default.content']));
      expect(plain.height).toBe(box);
      expect(plain.width).toBe(box);
      expect(plain.fontSize).toBe(`${typo.fontSize.value}px`);
      expect(plain.radius).toBe(`${px(tokens['radius.control'])}px`);
      expect(current.surface).toBe(rgb(tokens['color.item.selected.surface']));
      expect(current.content).toBe(rgb(tokens['color.item.selected.content']));
      expect(current.edge).toBe(
        `${rgb(tokens['color.item.indicator'])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
      // The last page (100) is wider than the box only by its padding when it needs it.
      const wide = await read(`#size-${size} [data-page="100"]`);
      expect(wide.width).toBeGreaterThanOrEqual(box);
      await page.hover(`#size-${size} [data-page="51"]`);
      const hover = await read(`#size-${size} [data-page="51"]`);
      expect(hover.surface).toBe(rgb(tokens['color.item.hover.surface']));
      await page.hover(`#size-${size} [data-page="50"]`);
      const currentHover = await read(`#size-${size} [data-page="50"]`);
      expect(currentHover.surface).toBe(rgb(tokens['color.item.selected-hover.surface']));
      await page.mouse.move(0, 0);
      const ellipsis = await page
        .locator(`#size-${size} .ggb-pagination__ellipsis`)
        .first()
        .evaluate((e) => ({
          content: getComputedStyle(e).color,
          width: e.getBoundingClientRect().width
        }));
      expect(ellipsis.content).toBe(rgb(tokens['color.content.secondary']));
      expect(ellipsis.width).toBe(box);
      const gap = await page
        .locator(`#size-${size} .ggb-pagination__list`)
        .evaluate((l) => getComputedStyle(l).columnGap);
      expect(gap).toBe(`${px(tokens['space.content.xs'])}px`);
      report.add(context, { size }, 'default', plain);
      report.add(context, { size }, 'selected', current);
      report.add(context, { size }, 'hover', hover);
      report.add(context, { size }, 'selected-hover', currentHover);
      report.add(context, { size }, 'ellipsis', ellipsis);
    }
  }
  report.write('pagination');
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'pagination');
});
