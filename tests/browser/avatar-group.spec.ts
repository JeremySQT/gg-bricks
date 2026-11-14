import { test, expect } from '@playwright/test';
import {
  accessible,
  auditAndCapture,
  capture,
  ComputedReport,
  px,
  representative,
  rgb,
  setContext,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/avatar-group/svelte';
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

test.beforeEach(async ({ page }) => {
  await page.goto('/avatar-group/');
  await page.evaluate(() => document.fonts.ready);
});

test('overlap, ring, size and shape follow the tokens in every representative context; each avatar is drawn above the previous one', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const t = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const shape of ['circle', 'square'])
      for (const size of sizes) {
        await page.locator(`#m-${shape}-${size}`).scrollIntoViewIfNeeded();
        const m = await page.locator(`#m-${shape}-${size}`).evaluate((el) => {
          const avatars = [...el.querySelectorAll(':scope > li > .ggb-avatar')] as HTMLElement[];
          const boxes = avatars.map((a) => a.getBoundingClientRect());
          const first = boxes[0];
          const second = boxes[1];
          // The point in the overlap of the first two avatars, on their center line.
          const top = document.elementFromPoint(first.right - 2, first.top + first.height / 2)?.closest('.ggb-avatar');
          return {
            count: avatars.length,
            sizes: avatars.map((a) => a.dataset.size),
            shapes: avatars.map((a) => a.dataset.shape),
            width: first.width,
            overlap: first.right - second.left,
            shadow: getComputedStyle(avatars[1]).boxShadow,
            secondOnTop: top === avatars[1]
          };
        });
        const side = px(t[`component.avatar.size.${size}`]);
        const overlap = px(t[`component.avatar-group.overlap.${size}`]);
        const ring = `${rgb(t['color.surface.default'])} 0px 0px 0px ${px(t['border.width.strong'])}px`;
        expect(m.width).toBe(side);
        expect(m.overlap).toBeCloseTo(overlap, 3);
        expect(m.shadow).toBe(ring);
        expect(m.secondOnTop).toBe(true);
        expect(new Set(m.sizes)).toEqual(new Set([size]));
        expect(new Set(m.shapes)).toEqual(new Set([shape]));
        report.add(context, { size, shape }, 'default', {
          'avatar-size': m.width,
          overlap: m.overlap,
          'box-shadow': m.shadow
        });
      }
  }
  report.write('avatar-group');
});

test('max counts the +N box, total extends the count, +99 at most, max 0 shows everyone', async ({ page }) => {
  const items = (id: string) => page.locator(`#${id} > li`);
  const overflow = (id: string) => page.locator(`#${id} .ggb-avatar-group__overflow .ggb-avatar__initials`);
  await expect(items('b-one')).toHaveCount(1);
  await expect(items('b-five')).toHaveCount(5);
  await expect(page.locator('#b-five .ggb-avatar-group__overflow')).toHaveCount(0);
  await expect(items('b-six')).toHaveCount(5);
  await expect(overflow('b-six')).toHaveText('+2');
  await expect(overflow('b-total')).toHaveText('+5');
  await expect(overflow('b-cap')).toHaveText('+99');
  await expect(items('b-all')).toHaveCount(9);
  // Playground: 7 people, max 5 → 4 avatars and +3; max 0 → 7; total 20 → +13.
  await expect(overflow('play')).toHaveText('+3');
  await page.fill('#opt-max', '0');
  await expect(items('play')).toHaveCount(7);
  await page.fill('#opt-total', '20');
  await expect(overflow('play')).toHaveText('+13');
});

test('a list named by label; each avatar named; the +N box named by the count and moreLabel', async ({ page }) => {
  expect(await accessible(page, '#b-six')).toMatchObject({ role: 'list', name: 'Team' });
  expect(await accessible(page, '#b-six > li:first-child .ggb-avatar')).toMatchObject({
    role: 'image',
    name: 'Olivia Rhye'
  });
  expect(await accessible(page, '#b-six .ggb-avatar-group__overflow .ggb-avatar')).toMatchObject({
    role: 'image',
    name: '2 more'
  });
  expect(await page.locator('#b-six [tabindex]').count()).toBe(0);
});

test('the ring color can be set by the integration on another surface', async ({ page }) => {
  const shadow = (id: string) =>
    page.locator(`#${id} > li:nth-child(2) .ggb-avatar`).evaluate((el) => getComputedStyle(el).boxShadow);
  const t = tokensFor('base-light-standard');
  expect(await shadow('s-subtle')).toContain(rgb(t['color.surface.subtle']));
  expect(await shadow('s-subtle-raw')).toContain(rgb(t['color.surface.default']));
});

test('forced colors: the ring becomes an outline in the system background color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await page.locator('#m-circle-xl > li:nth-child(2)').evaluate((el) => {
    const c = getComputedStyle(el);
    const avatar = getComputedStyle(el.querySelector('.ggb-avatar')!);
    return { outline: c.outlineStyle, width: c.outlineWidth, shadow: avatar.boxShadow, edge: avatar.outlineStyle };
  });
  expect(m.outline).toBe('solid');
  expect(m.width).toBe('2px');
  expect(m.shadow).toBe('none');
  expect(m.edge).toBe('solid');
  await page.locator('#matrix').scrollIntoViewIfNeeded();
  await capture(page, `${out}/forced-colors.png`);
});

test('review page passes axe in light and dark and fits a phone', async ({ page }) => {
  await auditAndCapture(page, 'avatar-group');
});
