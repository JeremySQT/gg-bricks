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

const out = 'reports/components/tooltip/svelte';
const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((t) => t.matches(':popover-open'));

test.beforeEach(async ({ page }) => {
  await page.goto('/tooltip/');
  await page.evaluate(() => document.fonts.ready);
});

test('keyboard focus opens at once; the tooltip describes its trigger unless it repeats the name; Escape closes and keeps focus', async ({
  page
}) => {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await isOpen(page, 'tip-copy')).toBe(true);
  await expect(page.locator('#tip-copy')).toHaveAttribute('role', 'tooltip');
  expect((await accessible(page, '#copy')).description).toBe('Copy the link');
  await expect(page.getByTestId('open')).toHaveText('Open: true');
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'tip-copy')).toBe(false);
  await expect(page.locator('#copy')).toBeFocused();
  // Edit: the IconButton is already named by the same text, so no description is added.
  await expect(page.locator('#edit')).not.toHaveAttribute('aria-describedby');
  expect((await accessible(page, '#save')).description).toBe('Saves a copy in your drafts folder');
  // Moving focus closes it and opens the next one; only one is open at a time.
  await page.keyboard.press('Tab');
  expect(await isOpen(page, 'tip-copy')).toBe(false);
  expect(await isOpen(page, 'tip-edit')).toBe(true);
});

test('inside a Popover or a Dialog, Escape closes the tooltip only; the next Escape closes the host', async ({
  page
}) => {
  // Opened from the keyboard, so that focus moving into the host is keyboard focus, which opens a tooltip.
  const popOpen = () => page.locator('#host-pop').evaluate((p) => p.matches(':popover-open'));
  await page.focus('#host-pop-trigger');
  await page.keyboard.press('Enter');
  await expect.poll(popOpen).toBe(true);
  await expect(page.locator('#in-pop')).toBeFocused();
  await expect.poll(() => isOpen(page, 'tip-in-pop')).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'tip-in-pop')).toBe(false);
  expect(await popOpen()).toBe(true);
  await expect(page.locator('#in-pop')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect.poll(popOpen).toBe(false);

  const dialogOpen = () => page.locator('#host-dialog').evaluate((d) => (d as HTMLDialogElement).open);
  await page.focus('#host-dialog-open');
  await page.keyboard.press('Enter');
  await expect.poll(dialogOpen).toBe(true);
  for (let k = 0; k < 4 && !(await page.locator('#in-dialog').evaluate((b) => b === document.activeElement)); k++)
    await page.keyboard.press('Tab');
  await expect(page.locator('#in-dialog')).toBeFocused();
  await expect.poll(() => isOpen(page, 'tip-in-dialog')).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'tip-in-dialog')).toBe(false);
  expect(await dialogOpen()).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(dialogOpen).toBe(false);
});

test('hover opens after the delay, then at once on the next trigger; leaving and activation close it', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const delay = (tokens['component.tooltip.delay'].$value as { value: number }).value;
  await page.hover('#save');
  await page.waitForTimeout(delay / 3);
  expect(await isOpen(page, 'tip-save')).toBe(false);
  await expect.poll(() => isOpen(page, 'tip-save'), { timeout: delay * 3 }).toBe(true);
  // The next trigger opens without delay.
  await page.hover('#edit');
  await page.waitForTimeout(120);
  expect(await isOpen(page, 'tip-edit')).toBe(true);
  expect(await isOpen(page, 'tip-save')).toBe(false);
  // Pointing at the tooltip keeps it open.
  const tip = (await page.locator('#tip-edit').boundingBox())!;
  await page.mouse.move(tip.x + tip.width / 2, tip.y + tip.height / 2, { steps: 4 });
  await page.waitForTimeout(250);
  expect(await isOpen(page, 'tip-edit')).toBe(true);
  await page.mouse.move(5, 5);
  await expect.poll(() => isOpen(page, 'tip-edit')).toBe(false);
  await page.hover('#copy');
  await expect.poll(() => isOpen(page, 'tip-copy'), { timeout: delay * 3 }).toBe(true);
  await page.click('#copy');
  expect(await isOpen(page, 'tip-copy')).toBe(false);
});

test('the skip and close delays follow their tokens (component.tooltip.skip-delay and close-delay)', async ({
  page
}) => {
  // Lengthen both delays on the page: a slower close keeps the tooltip open well past the default 100 ms grace, and
  // a longer skip window still opens the next tooltip at once after the first one closed.
  // Set on the tooltips themselves: the page's [data-ggb-brand] wrapper redefines the component tokens below <html>.
  await page.locator('.ggb-tooltip').evaluateAll((tips) =>
    tips.forEach((tip) => {
      (tip as HTMLElement).style.setProperty('--ggb-tooltip-motionCloseDelay', '600ms');
      (tip as HTMLElement).style.setProperty('--ggb-tooltip-motionSkipDelay', '2s');
    })
  );
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await isOpen(page, 'tip-copy')).toBe(true);
  await page.keyboard.press('Escape');
  await page.hover('#save');
  await page.waitForTimeout(150);
  expect(await isOpen(page, 'tip-save')).toBe(true);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  expect(await isOpen(page, 'tip-save')).toBe(true);
  await expect.poll(() => isOpen(page, 'tip-save')).toBe(false);
  // Closed for more than the default 300 ms window, yet within the 2 s one: the next tooltip opens at once.
  await page.waitForTimeout(500);
  await page.hover('#edit');
  await page.waitForTimeout(120);
  expect(await isOpen(page, 'tip-edit')).toBe(true);
});

test('a disabled control shows no tooltip; the application controls open silently', async ({ page }) => {
  await page.hover('#disabled', { force: true });
  await page.waitForTimeout(900);
  expect(await isOpen(page, 'tip-disabled')).toBe(false);
  await page.check('#opt-open');
  expect(await isOpen(page, 'tip-copy')).toBe(true);
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0');
});

test('placed at the offset on the side and alignment; inherits a dark subtree and escapes clipping', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const offset = px(tokens['space.content.xs']);
  await page.check('#opt-open');
  await settle(page);
  const trigger = (await page.locator('#copy').boundingBox())!;
  let tip = (await page.locator('#tip-copy').boundingBox())!;
  expect(trigger.y - (tip.y + tip.height)).toBeCloseTo(offset, 0);
  expect(tip.x + tip.width / 2).toBeCloseTo(trigger.x + trigger.width / 2, 0);
  await page.selectOption('#opt-side', 'bottom');
  await page.selectOption('#opt-align', 'start');
  await settle(page);
  tip = (await page.locator('#tip-copy').boundingBox())!;
  expect(tip.y - (trigger.y + trigger.height)).toBeCloseTo(offset, 0);
  expect(tip.x).toBeCloseTo(trigger.x, 0);
  await page.uncheck('#opt-open');
  await page.focus('#dark');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await settle(page);
  const dark = tokensFor('base-dark-standard');
  expect(await page.locator('#tip-dark').evaluate((t) => getComputedStyle(t).backgroundColor)).toBe(
    rgb(dark['color.surface.inverse'])
  );
  const clip = (await page.locator('.clip').boundingBox())!;
  const darkTip = (await page.locator('#tip-dark').boundingBox())!;
  expect(darkTip.y + darkTip.height).toBeGreaterThan(clip.y + clip.height);
});

test('computed values match the resolved tokens; motion follows the tokens and only fades under reduced motion', async ({
  page
}) => {
  const report = new ComputedReport();
  await page.check('#opt-open');
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const m = await page.locator('#tip-copy').evaluate((t) => {
      const s = getComputedStyle(t);
      return {
        surface: s.backgroundColor,
        content: s.color,
        radius: s.borderTopLeftRadius,
        paddingInline: s.paddingLeft,
        paddingBlock: s.paddingTop,
        fontSize: s.fontSize,
        maxInlineSize: s.maxWidth,
        duration: s.transitionDuration.split(',')[0].trim()
      };
    });
    expect(m.surface, context).toBe(rgb(tokens['color.surface.inverse']));
    expect(m.content).toBe(rgb(tokens['color.content.inverse']));
    expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
    expect(m.paddingInline).toBe(`${px(tokens['space.content.sm'])}px`);
    expect(m.paddingBlock).toBe(`${px(tokens['space.content.xs'])}px`);
    expect(m.fontSize).toBe(
      `${(tokens['typography.caption.md'].$value as { fontSize: { value: number } }).fontSize.value}px`
    );
    expect(m.maxInlineSize).toContain(`${px(tokens['component.tooltip.max-inline-size'])}px`);
    expect(m.duration).toBe(`${(tokens['motion.duration.fast'].$value as { value: number }).value / 1000}s`);
    report.add(context, {}, 'open', m);
  }
  report.write('tooltip');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('#tip-copy').evaluate((t) => getComputedStyle(t).translate)).toMatch(/^(none|0px)$/);
});

test('forced colors keep an edge on the tooltip', async ({ page }) => {
  await page.check('#opt-open');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.locator('#tip-copy').evaluate((t) => getComputedStyle(t).borderTopStyle)).toBe('solid');
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'tooltip');
});
