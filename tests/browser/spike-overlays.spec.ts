import { test, expect, type Page } from '@playwright/test';
import { rgb, tokensFor } from './helpers.ts';

// Overlay spike (decision of 2026-10-31, top layer): the facts the decision rests on, checked in both positioning
// engines (CSS anchor positioning and the measured fallback). The prototypes live in examples/spike-overlays/.

const engines = [
  ['native', '/spike-overlays/'],
  ['measured', '/spike-overlays/?positioning=measured']
] as const;

const background = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).backgroundColor);
const isOpen = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.matches(':popover-open') || (el as HTMLDialogElement).open === true);
const box = (page: Page, selector: string) => page.locator(selector).boundingBox() as Promise<DOMRect>;
/** True when a point just inside the element's top-left corner hits the element (nothing paints above it). */
const onTop = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + 8, r.top + 8));
  });
const settled = (page: Page) => page.waitForTimeout(400);

for (const [engine, url] of engines) {
  test.describe(`overlays in the top layer (${engine} positioning)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(url);
      await page.waitForSelector('#pop-root-trigger');
      await expect(page.getByTestId('positioning')).toContainText(engine === 'native' ? 'native' : 'measured');
    });

    test('an overlay inherits the theme of the subtree that opens it, portal-free', async ({ page }) => {
      const light = tokensFor('base-light-standard');
      const dark = tokensFor('base-dark-standard');
      const brick = tokensFor('brick-light-compact');
      await page.click('#pop-root-trigger');
      await settled(page);
      expect(await background(page, '#pop-root')).toBe(rgb(light['color.surface.overlay']));
      await page.keyboard.press('Escape');
      await settled(page);
      expect(await isOpen(page, '#pop-root')).toBe(false);
      // Dark subtree: popover, dialog and the Bits UI popover placed by the same attachment.
      await page.click('#pop-dark-trigger');
      await settled(page);
      expect(await background(page, '#pop-dark')).toBe(rgb(dark['color.surface.overlay']));
      expect(await page.locator('#pop-dark').evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(
        rgb(dark['color.elevation.border'])
      );
      await page.mouse.click(1200, 880);
      await settled(page);
      expect(await isOpen(page, '#pop-dark'), 'a press outside closes an auto popover').toBe(false);
      await page.click('#dlg-dark-trigger');
      await settled(page);
      expect(await background(page, '#dlg-dark')).toBe(rgb(dark['color.surface.overlay']));
      expect(await page.evaluate(() => document.getElementById('dlg-dark')!.contains(document.activeElement))).toBe(
        true
      );
      await page.keyboard.press('Escape');
      await settled(page);
      expect(await isOpen(page, '#dlg-dark')).toBe(false);
      expect(await page.evaluate(() => document.activeElement?.id), 'focus returns to the trigger').toBe(
        'dlg-dark-trigger'
      );
      await page.click('#pop-bits-dark-trigger');
      await settled(page);
      expect(await background(page, '#pop-bits-dark')).toBe(rgb(dark['color.surface.overlay']));
      await page.keyboard.press('Escape');
      await settled(page);
      await expect(page.locator('#pop-bits-dark')).toHaveCount(0);
      // Another brand and density: the content inside takes them too.
      await page.click('#pop-brick-trigger');
      await settled(page);
      expect(await background(page, '#pop-brick .ggb-button__container >> nth=0')).toBe(
        rgb(brick['color.action.accent.solid.default.surface'])
      );
      await page.keyboard.press('Escape');
    });

    test('a dialog holds a popover above it; Escape closes the innermost overlay first', async ({ page }) => {
      await page.click('#dlg-root-trigger');
      await settled(page);
      const dialog = await box(page, '#dlg-root');
      const viewport = page.viewportSize()!;
      expect(Math.abs(dialog.x + dialog.width / 2 - viewport.width / 2), 'the dialog is centered').toBeLessThan(2);
      await page.click('#pop-in-dialog-trigger');
      await settled(page);
      expect([await isOpen(page, '#dlg-root'), await isOpen(page, '#pop-in-dialog')]).toEqual([true, true]);
      expect(await onTop(page, '#pop-in-dialog'), 'the later overlay paints above the dialog').toBe(true);
      await page.keyboard.press('Escape');
      await settled(page);
      expect([await isOpen(page, '#dlg-root'), await isOpen(page, '#pop-in-dialog')]).toEqual([true, false]);
      await page.keyboard.press('Escape');
      await settled(page);
      expect(await isOpen(page, '#dlg-root')).toBe(false);
    });

    test('a popover escapes a clipping, transformed, scrolling container and follows its anchor', async ({ page }) => {
      await page.locator('.clip-inner').evaluate((el) => (el.scrollTop = 40));
      await page.click('#pop-clipped-trigger');
      await settled(page);
      const clip = await box(page, '[data-testid="clip"]');
      const popover = await box(page, '#pop-clipped');
      const outside = popover.y + popover.height > clip.y + clip.height + 1 || popover.y < clip.y - 1;
      expect(outside, 'part of the popover lies outside the clipping container').toBe(true);
      expect(await onTop(page, '#pop-clipped')).toBe(true);
      await page.locator('.clip-inner').evaluate((el) => (el.scrollTop = 70));
      await settled(page);
      const moved = await box(page, '#pop-clipped');
      expect(moved.y, 'the popover moves with the scrolled anchor').toBeLessThan(popover.y);
    });

    test('sides and alignments are honored and a popover flips away from the viewport edge', async ({ page }) => {
      await page.click('#pop-top-end-trigger');
      await settled(page);
      const trigger = await box(page, '#pop-top-end-trigger');
      const popover = await box(page, '#pop-top-end');
      expect(popover.y + popover.height).toBeLessThanOrEqual(trigger.y + 1);
      expect(Math.abs(popover.x + popover.width - (trigger.x + trigger.width))).toBeLessThan(2);
      await page.keyboard.press('Escape');
      await settled(page);
      await page.locator('#pop-flip-trigger').evaluate((el) => el.scrollIntoView({ block: 'end' }));
      await page.click('#pop-flip-trigger');
      await settled(page);
      const edge = await box(page, '#pop-flip-trigger');
      const flipped = await box(page, '#pop-flip');
      expect(flipped.y + flipped.height, 'preferred bottom, flipped above').toBeLessThanOrEqual(edge.y + 1);
      expect(flipped.y).toBeGreaterThanOrEqual(0);
    });

    test('motion: a closed overlay sits at its distance; reduced motion removes the movement', async ({ page }) => {
      const distance = tokensFor('base-light-standard')['motion.distance.sm'];
      const translate = () => page.locator('#pop-root').evaluate((el) => getComputedStyle(el).translate);
      await settled(page);
      expect(await translate(), 'no transition plays at load: popover is written in the markup').toBe(
        `0px -${(distance.$value as { value: number }).value}px`
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      expect(await translate()).toBe('0px');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
  });
}
