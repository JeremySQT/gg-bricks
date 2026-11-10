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

const out = 'reports/components/popover/svelte';
const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((t) => t.matches(':popover-open'));

test.beforeEach(async ({ page }) => {
  await page.goto('/popover/');
  await page.evaluate(() => document.fonts.ready);
});

test('the trigger controls a named non-modal dialog; opening moves focus into the content', async ({ page }) => {
  const trigger = page.locator('#filters-trigger');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveAttribute('aria-controls', 'filters');
  await trigger.click();
  expect(await isOpen(page, 'filters')).toBe(true);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const panel = await accessible(page, '#filters');
  expect(panel.role).toBe('dialog');
  expect(panel.name).toBe('Filters');
  await expect(page.locator('#f-open')).toBeFocused();
  // The trigger toggles it closed again (no reopening by the same press).
  await trigger.click();
  expect(await isOpen(page, 'filters')).toBe(false);
  await expect(page.getByTestId('changes')).toHaveText('Changes: 2');
});

test('Escape returns focus to the trigger; a press outside and focus leaving close it where focus went', async ({
  page
}) => {
  await page.click('#filters-trigger');
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'filters')).toBe(false);
  await expect(page.locator('#filters-trigger')).toBeFocused();
  await page.click('#filters-trigger');
  await page.mouse.click(5, 5);
  expect(await isOpen(page, 'filters')).toBe(false);
  // Tab order: trigger, then the panel content, then what follows.
  await page.click('#filters-trigger');
  await page.focus('#f-apply');
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
  expect(await isOpen(page, 'filters')).toBe(false);
  // The application toggles without an event.
  const before = await page.getByTestId('changes').textContent();
  await page.click('#opt-open');
  expect(await isOpen(page, 'filters')).toBe(true);
  await expect(page.getByTestId('changes')).toHaveText(before!);
});

test('a popover opened inside another stays with it; Escape closes the innermost first', async ({ page }) => {
  await page.click('#rename-trigger');
  await page.click('#nested-trigger');
  expect(await isOpen(page, 'rename')).toBe(true);
  expect(await isOpen(page, 'nested')).toBe(true);
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'nested')).toBe(false);
  expect(await isOpen(page, 'rename')).toBe(true);
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'rename')).toBe(false);
});

test('placement at the offset; dark subtree and clipping container', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  await page.click('#filters-trigger');
  await settle(page);
  const trigger = (await page.locator('#filters-trigger').boundingBox())!;
  const panel = (await page.locator('#filters').boundingBox())!;
  expect(panel.y - (trigger.y + trigger.height)).toBeCloseTo(px(tokens['space.content.xs']), 0);
  expect(panel.x).toBeCloseTo(trigger.x, 0);
  await page.keyboard.press('Escape');
  await page.click('#dark-trigger');
  await settle(page);
  const dark = tokensFor('base-dark-standard');
  expect(await page.locator('#dark').evaluate((p) => getComputedStyle(p).backgroundColor)).toBe(
    rgb(dark['color.surface.overlay'])
  );
  const clip = (await page.locator('.clip').boundingBox())!;
  const box = (await page.locator('#dark').boundingBox())!;
  expect(box.y + box.height).toBeGreaterThan(clip.y + clip.height);
});

test('computed values match the resolved tokens in representative contexts', async ({ page }) => {
  const report = new ComputedReport();
  await page.click('#opt-open');
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const m = await page.locator('#filters').evaluate((p) => {
      const s = getComputedStyle(p);
      return {
        surface: s.backgroundColor,
        content: s.color,
        shadow: s.boxShadow,
        radius: s.borderTopLeftRadius,
        padding: s.paddingTop,
        maxInlineSize: s.maxWidth,
        fontSize: s.fontSize
      };
    });
    expect(m.surface, context).toBe(rgb(tokens['color.surface.overlay']));
    expect(m.content).toBe(rgb(tokens['color.content.primary']));
    expect(m.radius).toBe(`${px(tokens['radius.overlay'])}px`);
    expect(m.padding).toBe(`${px(tokens['space.content.md'])}px`);
    expect(m.maxInlineSize).toContain(`${px(tokens['size.overlay.panel'])}px`);
    expect(m.shadow).toContain(
      `${rgb(tokens['color.elevation.border'])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
    );
    report.add(context, {}, 'open', m);
  }
  report.write('popover');
});

test('forced colors keep an edge on the panel', async ({ page }) => {
  await page.click('#filters-trigger');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.locator('#filters').evaluate((p) => getComputedStyle(p).borderTopStyle)).toBe('solid');
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'popover');
});

test('the focus indicator of a control at the edge of the content is never cut by the scrolling area', async ({
  page
}) => {
  await page.click('#rename-trigger');
  await expect.poll(() => page.locator('#rename').evaluate((p) => p.matches(':popover-open'))).toBe(true);
  await settle(page);
  const fit = await page.locator('#rename').evaluate((panel) => {
    const area = panel.querySelector('.ggb-popover__content')!;
    const box = area.getBoundingClientRect();
    const input = panel.querySelector('input')!.closest('.ggb-input-text')!.getBoundingClientRect();
    const s = getComputedStyle(area);
    const ring = parseFloat(s.paddingLeft);
    return { ring, left: input.left - box.left, right: box.right - input.right };
  });
  expect(fit.ring).toBeGreaterThan(0);
  expect(fit.left).toBeGreaterThanOrEqual(fit.ring - 0.5);
  expect(fit.right).toBeGreaterThanOrEqual(fit.ring - 0.5);
});
