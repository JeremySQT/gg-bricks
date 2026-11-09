import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  auditAndCapture,
  px,
  representative,
  rgb,
  setContext,
  tokensFor
} from './helpers.ts';

const isOpen = (page: Page, selector: string) => page.locator(selector).evaluate((el) => el.matches(':popover-open'));

test.beforeEach(async ({ page }) => {
  await page.goto('/breadcrumb/');
  await page.evaluate(() => document.fonts.ready);
});

test('a navigation landmark with a list; links are Tab stops; the current page is not a link', async ({ page }) => {
  const nav = await accessible(page, '#play');
  expect(nav.role).toBe('navigation');
  expect(nav.name).toBe('Breadcrumb');
  await page.focus('#before');
  const order: string[] = [];
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''));
  }
  expect(order).toEqual(['Home', 'Projects', 'Acme website', 'Settings', 'After']);
  await expect(page.locator('#play [aria-current="page"]')).toHaveText('Members');
  expect(await page.locator('#play [aria-current="page"]').evaluate((e) => e.tagName)).toBe('SPAN');
  // Separators are decorative.
  expect(await page.locator('#play .ggb-breadcrumb__separator').first().getAttribute('aria-hidden')).toBe('true');
});

test('collapse: the hidden levels are links in a menu opened by the ellipsis button', async ({ page }) => {
  const labels = await page.locator('#long .ggb-breadcrumb__item-label').allTextContents();
  expect(labels).toEqual(['Home', '2026', 'Spring launch', 'Assets']);
  const more = page.locator('#long .ggb-breadcrumb__more button');
  await expect(more).toHaveAttribute('aria-label', 'Show hidden pages');
  await more.focus();
  await page.keyboard.press('Enter');
  const menu = page.locator('#long .ggb-menu');
  await expect.poll(() => menu.evaluate((m) => m.matches(':popover-open'))).toBe(true);
  expect((await menu.locator('[role="menuitem"]').allTextContents()).map((t) => t.trim())).toEqual([
    'Workspaces',
    'Marketing',
    'Campaigns'
  ]);
  expect(await menu.locator('[role="menuitem"]').first().getAttribute('href')).toBe('#workspaces');
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  // maxItems on the playground.
  await page.selectOption('#opt-max', '3');
  expect(await page.locator('#play .ggb-breadcrumb__item-label').allTextContents()).toEqual([
    'Home',
    'Settings',
    'Members'
  ]);
  expect(await isOpen(page, '#play .ggb-menu')).toBe(false);
});

test('a narrow line truncates ancestors first and shows the full label on hover; RTL mirrors separators', async ({
  page
}) => {
  const widths = await page
    .locator('#narrow .ggb-breadcrumb__item-label')
    .evaluateAll((labels) => labels.map((l) => ({ truncated: l.scrollWidth > l.clientWidth, text: l.textContent })));
  expect(widths[0].truncated).toBe(true);
  const nav = (await page.locator('#narrow').boundingBox())!;
  const list = await page.locator('#narrow .ggb-breadcrumb__list').evaluate((l) => l.scrollWidth);
  expect(list).toBeLessThanOrEqual(nav.width + 1);
  await expect(page.locator('#narrow a').first()).toHaveAttribute('title', 'International partnerships');
  expect((await accessible(page, '#narrow a')).name).toBe('International partnerships');
  expect(
    await page
      .locator('#rtl .ggb-breadcrumb__separator')
      .first()
      .evaluate((s) => getComputedStyle(s).scale)
  ).toBe('-1 1');
});

test('computed values match the resolved tokens: links, hover, current, separator, sizes and target', async ({
  page
}) => {
  // Without transitions, so that colors are read settled.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of ['sm', 'md']) {
      await page.selectOption('#opt-size', size);
      const read = (selector: string) =>
        page.locator(selector).evaluate((e) => {
          const s = getComputedStyle(e);
          return { color: s.color, fontSize: s.fontSize };
        });
      const link = await read('#play a.ggb-breadcrumb__item >> nth=1');
      const current = await read('#play [aria-current="page"]');
      const separator = await page
        .locator('#play .ggb-breadcrumb__separator')
        .first()
        .evaluate((s) => ({ color: getComputedStyle(s).color, size: getComputedStyle(s).width }));
      const typo = tokens[`typography.body.${size}`].$value as { fontSize: { value: number } };
      expect(link.color, `${context} ${size}`).toBe(rgb(tokens['color.content.secondary']));
      expect(link.fontSize).toBe(`${typo.fontSize.value}px`);
      expect(current.color).toBe(rgb(tokens['color.content.primary']));
      expect(separator.color).toBe(rgb(tokens['color.content.tertiary']));
      expect(separator.size).toBe(`${px(tokens[`size.icon.${size}`])}px`);
      await page.hover('#play a.ggb-breadcrumb__item >> nth=1');
      const hover = await page.locator('#play a.ggb-breadcrumb__item >> nth=1').evaluate((e) => ({
        color: getComputedStyle(e).color,
        underline: getComputedStyle(e.querySelector('.ggb-breadcrumb__item-label')!).textDecorationLine
      }));
      expect(hover.color).toBe(rgb(tokens['color.content.primary']));
      expect(hover.underline).toBe('underline');
      await page.mouse.move(0, 0);
      const target = await page
        .locator('#play a.ggb-breadcrumb__item >> nth=1')
        .evaluate((e) => getComputedStyle(e, '::before').height);
      expect(target).toBe(`${px(tokens['size.target.min'])}px`);
      report.add(context, { size }, 'default', { ...link, separator: separator.color, separatorSize: separator.size });
      report.add(context, { size }, 'hover', hover);
      report.add(context, { size }, 'current', current);
    }
  }
  report.write('breadcrumb');
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'breadcrumb');
});
