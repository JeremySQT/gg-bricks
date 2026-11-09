import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  auditAndCapture,
  capture,
  px,
  representative,
  rgb,
  setContext,
  settle,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/accordion/svelte';
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');
const expanded = (page: Page, id: string) => page.locator(`#${id}-trigger`).getAttribute('aria-expanded');

test.beforeEach(async ({ page }) => {
  await page.goto('/accordion/');
  await page.evaluate(() => document.fonts.ready);
});

test('single: expanding one collapses the other; the expanded one can be collapsed; value and event follow', async ({
  page
}) => {
  expect(await expanded(page, 'shipping')).toBe('true');
  await page.click('#returns-trigger');
  expect(await expanded(page, 'returns')).toBe('true');
  expect(await expanded(page, 'shipping')).toBe('false');
  await expect(page.getByTestId('value')).toHaveText('Value: returns');
  await page.click('#returns-trigger');
  await expect(page.getByTestId('value')).toHaveText('Value: none');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 2');
  // A disabled item cannot be toggled.
  await page.click('#gift-trigger', { force: true });
  expect(await expanded(page, 'gift')).toBe('false');
});

test('multiple: items expand independently; the application sets value silently', async ({ page }) => {
  await page.check('#opt-multiple');
  await page.click('#returns-trigger');
  await expect(page.getByTestId('value')).toHaveText('Value: shipping,returns');
  await page.click('#set-returns');
  expect(await expanded(page, 'shipping')).toBe('false');
  expect(await expanded(page, 'returns')).toBe('true');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
});

test('keyboard: Tab through triggers and expanded content; arrows wrap and skip the disabled; Enter and Space toggle', async ({
  page
}) => {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('shipping-trigger');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('returns-trigger');
  await page.keyboard.press('Enter');
  expect(await expanded(page, 'returns')).toBe('true');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('returns-start');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('ArrowDown');
  // Gift is disabled: skipped.
  expect(await focused(page)).toBe('long-trigger');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('shipping-trigger');
  await page.keyboard.press('ArrowUp');
  expect(await focused(page)).toBe('long-trigger');
  await page.keyboard.press('Home');
  expect(await focused(page)).toBe('shipping-trigger');
  await page.keyboard.press('End');
  expect(await focused(page)).toBe('long-trigger');
  await page.keyboard.press(' ');
  expect(await expanded(page, 'long')).toBe('true');
});

test('collapsed content is hidden from every user; nested accordions keep their own arrows and indicators', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('#returns-content').evaluate((c) => getComputedStyle(c).visibility)).toBe('hidden');
  expect(await page.locator('#returns-start').isVisible()).toBe(false);
  const region = await accessible(page, '#shipping-content');
  expect(region.role).toBe('region');
  expect(region.name).toBe('How long does shipping take?');
  const inner = page.locator('#inner .ggb-accordion__trigger').first();
  await inner.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#inner .ggb-accordion__trigger').nth(1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(inner).toBeFocused();
  // Collapsed inner items point down although their parent is expanded.
  expect(await inner.locator('.ggb-accordion__item-indicator').evaluate((i) => getComputedStyle(i).rotate)).toBe(
    'none'
  );
});

test('computed values match the resolved tokens: trigger, hover, disabled, indicator, content and lines', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const read = (id: string) =>
      page.locator(`#${id}-trigger`).evaluate((t) => {
        const s = getComputedStyle(t);
        const i = getComputedStyle(t.querySelector('.ggb-accordion__item-indicator')!);
        return {
          surface: s.backgroundColor,
          content: s.color,
          height: t.getBoundingClientRect().height,
          paddingInline: s.paddingLeft,
          fontSize: s.fontSize,
          radius: s.borderTopLeftRadius,
          indicator: i.color,
          indicatorSize: i.width
        };
      });
    const plain = await read('shipping');
    const typo = tokens['typography.label.lg'].$value as { fontSize: { value: number } };
    expect(plain.surface, context).toBe(rgb(tokens['color.item.default.surface']));
    expect(plain.content).toBe(rgb(tokens['color.item.default.content']));
    expect(plain.height).toBeGreaterThanOrEqual(px(tokens['size.control.lg']));
    expect(plain.paddingInline).toBe(`${px(tokens['space.content.sm'])}px`);
    expect(plain.fontSize).toBe(`${typo.fontSize.value}px`);
    expect(plain.radius).toBe(`${px(tokens['radius.control'])}px`);
    expect(plain.indicator).toBe(rgb(tokens['color.content.secondary']));
    expect(plain.indicatorSize).toBe(`${px(tokens['size.icon.md'])}px`);
    await page.hover('#returns-trigger');
    const hover = await read('returns');
    expect(hover.surface).toBe(rgb(tokens['color.item.hover.surface']));
    await page.mouse.move(0, 0);
    const disabled = await read('gift');
    expect(disabled.content).toBe(rgb(tokens['color.item.disabled.content']));
    const body = await page.locator('#shipping-content .ggb-accordion__item-inner').evaluate((b) => {
      const s = getComputedStyle(b);
      return { color: s.color, fontSize: s.fontSize, paddingBottom: s.paddingBottom };
    });
    const bodyTypo = tokens['typography.body.md'].$value as { fontSize: { value: number } };
    expect(body.color).toBe(rgb(tokens['color.content.primary']));
    expect(body.fontSize).toBe(`${bodyTypo.fontSize.value}px`);
    expect(body.paddingBottom).toBe(`${px(tokens['space.content.lg'])}px`);
    const line = await page
      .locator('#play .ggb-accordion__item')
      .first()
      .evaluate((i) => {
        const s = getComputedStyle(i);
        return { color: s.borderBottomColor, width: s.borderBottomWidth };
      });
    expect(line.color).toBe(rgb(tokens['color.border.subtle']));
    expect(line.width).toBe(`${px(tokens['border.width.default'])}px`);
    report.add(context, {}, 'default', plain);
    report.add(context, {}, 'hover', hover);
    report.add(context, {}, 'disabled', disabled);
    report.add(context, {}, 'content', body);
    report.add(context, {}, 'line', line);
  }
  report.write('accordion');
});

test('expansion animates the block size; reduced motion makes it immediate; forced colors keep the lines', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const duration = await page.locator('#returns-content').evaluate((c) => getComputedStyle(c).transitionDuration);
  expect(duration.split(', ')[0]).toBe(`${(tokens['motion.duration.base'].$value as { value: number }).value / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('#returns-content').evaluate((c) => getComputedStyle(c).transitionDuration)).toBe('0s');
  await page.emulateMedia({ forcedColors: 'active' });
  await settle(page);
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'accordion');
});
