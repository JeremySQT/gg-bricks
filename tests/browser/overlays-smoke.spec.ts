// Smoke checks of the wave 3 overlays in every engine (Chromium, Firefox, WebKit projects): the top-layer behaviors
// the decision of 2026-10-31 relies on, where CSS anchor positioning or closedby may be missing and the fallbacks of
// lib/overlay take over. The detailed checks run in Chromium (tooltip, popover, dialog, menu and toast specs).
import { test, expect, type Page } from '@playwright/test';
import { px, rgb, settle, tokensFor } from './helpers.ts';

const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((el) => el.matches(':popover-open'));
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');

test('popover: opens under its trigger at the offset, takes focus, closes on Escape back to the trigger', async ({
  page
}) => {
  await page.goto('/popover/');
  await page.click('#filters-trigger');
  await expect.poll(() => isOpen(page, 'filters')).toBe(true);
  await settle(page);
  const offset = px(tokensFor('base-light-standard')['space.content.xs']);
  const trigger = (await page.locator('#filters-trigger').boundingBox())!;
  const panel = (await page.locator('#filters').boundingBox())!;
  expect(Math.abs(panel.y - (trigger.y + trigger.height) - offset)).toBeLessThanOrEqual(1);
  expect(Math.abs(panel.x - trigger.x)).toBeLessThanOrEqual(1);
  await expect.poll(() => focused(page)).toBe('f-open');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'filters')).toBe(false);
  await expect.poll(() => focused(page)).toBe('filters-trigger');
});

test('popover: inherits a dark subtree and escapes a clipping container', async ({ page }) => {
  await page.goto('/popover/');
  await page.click('#dark-trigger');
  await expect.poll(() => isOpen(page, 'dark')).toBe(true);
  await settle(page);
  const dark = tokensFor('base-dark-standard');
  expect(await page.locator('#dark').evaluate((p) => getComputedStyle(p).backgroundColor)).toBe(
    rgb(dark['color.surface.overlay'])
  );
  const clip = (await page.locator('.clip').boundingBox())!;
  const box = (await page.locator('#dark').boundingBox())!;
  expect(box.y + box.height).toBeGreaterThan(clip.y + clip.height);
});

test('tooltip: keyboard focus opens it; Escape closes it', async ({ page }) => {
  await page.goto('/tooltip/');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  await expect.poll(() => isOpen(page, 'tip-copy')).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'tip-copy')).toBe(false);
});

test('menu: ArrowDown opens on the first item, Enter selects and closes back to the trigger', async ({ page }) => {
  await page.goto('/menu/');
  await page.focus('#actions-trigger');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('mi-edit');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('selected')).toHaveText('Selected: duplicate');
  await expect.poll(() => isOpen(page, 'actions')).toBe(false);
  await expect.poll(() => focused(page)).toBe('actions-trigger');
});

test('dialog: modal, focus inside, Escape closes and returns focus; a backdrop press closes', async ({ page }) => {
  await page.goto('/dialog/');
  await page.click('#open');
  await expect.poll(() => page.locator('#play').evaluate((d) => (d as HTMLDialogElement).open)).toBe(true);
  await expect.poll(() => focused(page)).toBe('play-emails');
  await page.keyboard.press('Escape');
  await expect.poll(() => page.locator('#play').evaluate((d) => (d as HTMLDialogElement).open)).toBe(false);
  await expect.poll(() => focused(page)).toBe('open');
  await page.click('#open');
  await page.mouse.click(10, 10);
  await expect.poll(() => page.locator('#play').evaluate((d) => (d as HTMLDialogElement).open)).toBe(false);
});

test('toast: the region is in the top layer at its edge; a toast shows and is dismissed', async ({ page }) => {
  await page.goto('/toast/');
  await page.fill('#opt-duration', '0');
  await page.click('#send-saved');
  const item = page.locator('#region .ggb-toast__item');
  await expect(item).toHaveCount(1);
  await expect.poll(() => page.locator('#region').evaluate((r) => r.matches(':popover-open'))).toBe(true);
  await item.locator('.ggb-toast__dismiss button').click();
  await expect(item).toHaveCount(0);
});

// Shift along the edge (wave 4 contract gate, 2026-11-09): with its trigger against the inline end of a narrow
// viewport, each anchored overlay stays inside the viewport instead of overflowing it, in every engine.
async function pinToEnd(page: Page, selector: string) {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.locator(selector).evaluate((el) => {
    Object.assign((el as HTMLElement).style, { position: 'fixed', insetInlineEnd: '4px', insetBlockStart: '120px' });
  });
}
async function insideViewport(page: Page, id: string) {
  await settle(page);
  const box = (await page.locator(`#${id}`).boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(box.x).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
}

test('edge: popover, menu and tooltip shift along the inline end of the viewport', async ({ page }) => {
  await page.goto('/popover/');
  await pinToEnd(page, '#filters-trigger');
  await page.click('#filters-trigger');
  await expect.poll(() => isOpen(page, 'filters')).toBe(true);
  await insideViewport(page, 'filters');

  await page.goto('/menu/');
  await pinToEnd(page, '#actions-trigger');
  await page.focus('#actions-trigger');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => isOpen(page, 'actions')).toBe(true);
  await insideViewport(page, 'actions');

  await page.goto('/tooltip/');
  await pinToEnd(page, '#copy');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  await expect.poll(() => isOpen(page, 'tip-copy')).toBe(true);
  await insideViewport(page, 'tip-copy');
});
