import { test, expect, type Page } from '@playwright/test';
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

const out = 'reports/components/avatar/svelte';
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
type Typography = { fontSize: { value: number }; fontWeight: number; lineHeight: number };

test.beforeEach(async ({ page }) => {
  await page.goto('/avatar/');
  await page.evaluate(() => document.fonts.ready);
});

async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const initials = el.querySelector('.ggb-avatar__initials') as HTMLElement | null;
    const icon = el.querySelector('.ggb-avatar__icon');
    const ic = initials ? getComputedStyle(initials) : null;
    const ir = initials?.getBoundingClientRect();
    const gr = icon?.getBoundingClientRect();
    return {
      width: r.width,
      height: r.height,
      radius: c.borderTopLeftRadius,
      backgroundColor: c.backgroundColor,
      color: c.color,
      fontSize: ic?.fontSize ?? null,
      fontWeight: ic?.fontWeight ?? null,
      initialsOffset: ir
        ? [ir.left + ir.width / 2 - (r.left + r.width / 2), ir.top + ir.height / 2 - (r.top + r.height / 2)]
        : null,
      iconSize: gr ? [gr.width, gr.height] : null,
      iconOffset: gr
        ? [gr.left + gr.width / 2 - (r.left + r.width / 2), gr.top + gr.height / 2 - (r.top + r.height / 2)]
        : null
    };
  });
}

test('sizes, shapes, fallback colors, initials and glyph follow the tokens in every representative context', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const t = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const shape of ['circle', 'square'])
      for (const size of sizes) {
        const side = px(t[`component.avatar.size.${size}`]);
        const radius = shape === 'circle' ? px(t['radius.full']) : px(t[`component.avatar.radius.${size}`]);
        const ty = t[`component.avatar.typography.${size}`].$value as Typography;
        const initials = await measure(page, `#m-initials-${shape}-${size}`);
        expect(initials.width).toBe(side);
        expect(initials.height).toBe(side);
        expect(initials.radius).toBe(`${radius}px`);
        expect(initials.backgroundColor).toBe(rgb(t['color.surface.muted']));
        expect(initials.color).toBe(rgb(t['color.content.secondary']));
        expect(initials.fontSize).toBe(`${ty.fontSize.value}px`);
        expect(initials.fontWeight).toBe(String(ty.fontWeight));
        // Centered on the capital height (text-box trims the box to cap height and baseline).
        for (const d of initials.initialsOffset!) expect(Math.abs(d)).toBeLessThanOrEqual(0.5);
        const glyph = await measure(page, `#m-glyph-${shape}-${size}`);
        const icon = px(t[`component.avatar.icon-size.${size}`]);
        expect(glyph.iconSize).toEqual([icon, icon]);
        for (const d of glyph.iconOffset!) expect(Math.abs(d)).toBeLessThanOrEqual(0.5);
        const props = { size, shape };
        report.add(context, { ...props, content: 'initials' }, 'default', {
          width: initials.width,
          height: initials.height,
          radius: initials.radius,
          'background-color': initials.backgroundColor,
          color: initials.color,
          'font-size': initials.fontSize,
          'font-weight': initials.fontWeight
        });
        report.add(context, { ...props, content: 'glyph' }, 'default', {
          'icon-width': glyph.iconSize![0],
          'icon-height': glyph.iconSize![1]
        });
      }
  }
  report.write('avatar');
});

test('initials: two graphemes, one for a single word and at xs, given initials, glyph without letters', async ({
  page
}) => {
  const text = (id: string) => page.locator(`#${id} .ggb-avatar__initials`).textContent();
  expect(await text('m-initials-circle-md')).toBe('DW');
  expect(await text('m-initials-circle-xs')).toBe('D');
  expect(await text('initials-1')).toBe('JF');
  expect(await text('initials-2')).toBe('C');
  expect(await text('initials-3')).toBe('ÉD');
  expect(await text('initials-4')).toBe('ОП');
  expect(await text('initials-5')).toBe('李');
  expect(await text('initials-given')).toBe('ACM');
  await expect(page.locator('#initials-8 .ggb-avatar__icon')).toBeVisible();
  await expect(page.locator('#initials-9 .ggb-avatar__icon')).toBeVisible();
});

test('the picture shows only once loaded; while loading and after an error the fallback stays', async ({ page }) => {
  // Hold the playground portrait: the avatar stays in the loading state, with its initials and the picture hidden.
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(
    (url) => url.pathname === '/held-picture.svg',
    async (route) => {
      await held;
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#7fb3d5"/></svg>'
      });
    }
  );
  // The held picture keeps the load event pending: wait for the document only.
  await page.goto('/avatar/?src=/held-picture.svg', { waitUntil: 'domcontentloaded' });
  const play = page.locator('#play');
  await expect(play).toHaveAttribute('data-image', 'loading');
  await expect(play.locator('.ggb-avatar__initials')).toHaveText('OR');
  await expect(play.locator('.ggb-avatar__image')).toBeHidden();
  release();
  await expect(play).toHaveAttribute('data-image', 'loaded');
  await expect(play.locator('.ggb-avatar__image')).toBeVisible();
  await expect(play.locator('.ggb-avatar__initials')).toHaveCount(0);
  const cover = await play.locator('.ggb-avatar__image').evaluate((el) => getComputedStyle(el).objectFit);
  expect(cover).toBe('cover');
  // A failing picture keeps the initials, or the glyph without a name.
  await page.selectOption('#opt-src', 'broken');
  await expect(play).toHaveAttribute('data-image', 'error');
  await expect(play.locator('.ggb-avatar__initials')).toHaveText('OR');
  await expect(page.locator('#state-error')).toHaveAttribute('data-image', 'error');
  await expect(page.locator('#state-error-glyph .ggb-avatar__icon')).toBeVisible();
  // A new source after a loaded picture starts again from loading and ends loaded (never a broken picture).
  await page.selectOption('#opt-src', 'portrait');
  await expect(play).toHaveAttribute('data-image', 'loaded');
  await page.selectOption('#opt-src', 'none');
  await expect(play).toHaveAttribute('data-image', 'none');
  await expect(play.locator('img')).toHaveCount(0);
});

test('accessible name, decorative and nameless avatars, no focus', async ({ page }) => {
  expect(await accessible(page, '#play')).toMatchObject({ role: 'image', name: 'Olivia Rhye' });
  expect(await accessible(page, '#m-initials-circle-md')).toMatchObject({ role: 'image', name: 'Demi Wilkinson' });
  await expect(page.locator('#initials-9')).toHaveAttribute('aria-hidden', 'true');
  await page.check('#opt-decorative');
  await expect(page.locator('#play')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#play')).not.toHaveAttribute('role', 'img');
  expect(await page.locator('.ggb-avatar[tabindex]').count()).toBe(0);
});

test('forced colors: an edge and the initials in the system text color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await page.locator('#m-initials-circle-xl').evaluate((el) => {
    const c = getComputedStyle(el);
    return { outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineColor: c.outlineColor, color: c.color };
  });
  expect(m.outlineStyle).toBe('solid');
  expect(m.outlineWidth).toBe('1px');
  expect(m.outlineColor).toBe(m.color);
  expect(m.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
  await page.locator('#matrix').scrollIntoViewIfNeeded();
  await capture(page, `${out}/forced-colors.png`);
});

test('review page passes axe in light and dark and fits a phone', async ({ page }) => {
  await auditAndCapture(page, 'avatar');
});
