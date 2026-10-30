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

const out = 'reports/components/switch/svelte';
const conditions = ['default', 'readonly', 'disabled'];
const selections = ['off', 'on'];

/** Computed values of one switch: track and thumb colors, geometry, thumb position and label line. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((track) => {
    const root = track.closest('.ggb-switch') as HTMLElement;
    const thumb = track.querySelector('.ggb-switch__thumb') as SVGCircleElement;
    const c = getComputedStyle(track);
    const r = track.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    const label = root.querySelector('.ggb-switch__label') as HTMLElement;
    const l = label.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
    return {
      surface: c.backgroundColor,
      boxShadow: c.boxShadow,
      thumb: getComputedStyle(thumb).fill,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      width: r.width,
      height: r.height,
      thumbSize: t.width,
      thumbStart: t.left - r.left,
      thumbEnd: r.right - t.right,
      thumbTop: t.top - r.top,
      firstLineOffset: r.top + r.height / 2 - (l.top + lineHeight / 2),
      rootWidth: root.getBoundingClientRect().width,
      trackEndGap: root.getBoundingClientRect().right - r.right
    };
  });
}

const choiceColors = (tokens: TokenMap, selection: string, condition: string) => ({
  surface: rgb(tokens[`color.choice.${selection}.${condition}.surface`]),
  boxShadow: insetBorder(tokens[`color.choice.${selection}.${condition}.border`], tokens['border.width.default']),
  thumb: rgb(tokens[`color.choice.${selection}.${condition}.content`])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/switch/');
  await page.evaluate(() => document.fonts.ready);
});

test('a switch named by its label; track and label toggle; Space toggles; readonly and disabled ignore', async ({
  page
}) => {
  const play = await accessible(page, '#play');
  expect(play.role).toBe('switch');
  expect(play.name).toBe('Dark mode');
  expect(play.properties.checked).toBe('false');
  expect((await accessible(page, '#set-notifications')).description).toBe('Push notifications on this device.');
  const state = page.getByTestId('state');
  await page.click('#play');
  await expect(state).toHaveText('checked: true');
  await page.click('#playground .ggb-switch__label');
  await expect(state).toHaveText('checked: false');
  await page.focus('#play');
  await page.keyboard.press('Space');
  await expect(state).toHaveText('checked: true');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 3');
  await page.check('#opt-readonly');
  await expect(page.locator('#play')).toHaveAttribute('aria-readonly', 'true');
  await page.click('#play');
  await page.click('#playground .ggb-switch__label');
  await page.focus('#play');
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(state).toHaveText('checked: true');
  await expect(page.locator('#play')).toBeFocused();
  await page.uncheck('#opt-readonly');
  await page.check('#opt-disabled');
  await expect(page.locator('#play')).toBeDisabled();
  await page.click('#playground .ggb-switch__label', { force: true });
  await expect(state).toHaveText('checked: true');
});

test('track, thumb and inset follow the switch size; the thumb moves to the end; first-line alignment', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    const bw = px(tokens['border.width.default']);
    for (const size of sizes) {
      const track = px(tokens[`size.switch.${size}`]);
      const off = await measure(page, `#sw-default-off-${size}`);
      const on = await measure(page, `#sw-default-on-${size}`);
      expect(off.height, `${density} ${size}`).toBe(track);
      expect(off.width).toBe(2 * track - 4 * bw);
      expect(off.thumbSize).toBe(track - 4 * bw);
      expect(off.thumbStart).toBe(2 * bw);
      expect(off.thumbTop).toBe(2 * bw);
      expect(on.thumbEnd).toBe(2 * bw);
      expect(Math.abs(off.firstLineOffset)).toBeLessThanOrEqual(0.5);
    }
  }
  // Label at the start: the row fills its container and the track sits at its end.
  const start = await measure(page, '#set-sounds');
  expect(start.trackEndGap).toBeCloseTo(0, 1);
  const text = (await page.locator('#set-sounds >> xpath=.. >> .ggb-switch__text').boundingBox())!;
  const track = (await page.locator('#set-sounds').boundingBox())!;
  expect(text.x).toBeLessThan(track.x);
  // Right to left: the on thumb sits at the inline end, on the left.
  await page.locator('#sw-default-on-md >> xpath=..').evaluate((el) => el.setAttribute('dir', 'rtl'));
  await settle(page);
  const rtl = await measure(page, '#sw-default-on-md');
  expect(rtl.thumbStart).toBe(2 * px(tokensFor('base-light-standard')['border.width.default']));
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
          const m = await measure(page, `#sw-${condition}-${selection}-${size}`);
          expect(
            { surface: m.surface, boxShadow: m.boxShadow, thumb: m.thumb },
            `${context} ${size} ${condition} ${selection}`
          ).toEqual(choiceColors(tokens, selection, condition));
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
      await page.hover(`#sw-default-${selection}-md`);
      const hover = await measure(page, `#sw-default-${selection}-md`);
      expect({ surface: hover.surface, boxShadow: hover.boxShadow, thumb: hover.thumb }).toEqual(
        choiceColors(tokens, selection, 'hover')
      );
      report.add(context, { size: 'md', selection }, 'hover', hover);
    }
    await page.mouse.move(0, 0);
    await page.focus('#sw-default-off-md');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focus = await measure(page, '#sw-default-off-md');
    expect(focus.outline).toBe(
      `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
    );
    report.add(context, { size: 'md', selection: 'off' }, 'focus', focus);
  }
  report.write('switch');
});

test('the thumb moves over the base duration and jumps under reduced motion; forced colors stay usable', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const thumb = page.locator('#play .ggb-switch__thumb');
  await expect(thumb).toHaveCSS('transition-duration', `${px(tokens['motion.duration.base']) / 1000}s`);
  await expect(thumb).toHaveCSS('transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(thumb).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(page.locator('#sw-default-off-md')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#sw-default-off-md')).toHaveCSS('outline-width', '1px');
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'switch');
});
