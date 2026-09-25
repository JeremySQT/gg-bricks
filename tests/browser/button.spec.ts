import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

test.beforeEach(async ({ page }) => {
  await page.goto('/button/');
  await page.evaluate(() => document.fonts.ready);
});

test('native activation, keyboard and form behavior', async ({ page }) => {
  const action = page.locator('#play-action');
  await action.click();
  await action.press('Enter');
  await action.press('Space');
  await expect(page.getByTestId('activations')).toHaveText('Activations: 3');
  await page.locator('#ordinary').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 0');
  await page.locator('#submit').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 1');
  await page.getByLabel('Item name').fill('');
  await page.locator('#submit').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 1');
});

test('loading preserves focus, name and geometry, blocks activation and navigation', async ({ page }) => {
  const action = page.locator('#play-action');
  await action.focus();
  const before = await action.boundingBox();
  await page.getByLabel('Loading', { exact: true }).evaluate((el: HTMLInputElement) => el.click());
  await expect(action).toBeFocused();
  await expect(action).toHaveAccessibleName('Save changes');
  await expect(action).toHaveAttribute('aria-busy', 'true');
  expect(await action.boundingBox()).toEqual(before);
  await action.press('Enter');
  await action.press('Space');
  await action.evaluate((el: HTMLElement) => el.click());
  await expect(page.getByTestId('activations')).toHaveText('Activations: 0');
  const navigation = page.locator('#play-navigation');
  await expect(navigation).not.toHaveAttribute('href');
  await navigation.focus();
  await navigation.press('Enter');
  expect(new URL(page.url()).hash).toBe('');
  await page.locator('#submit').evaluate((el: HTMLElement) => el.click());
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 0');
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(action).toBeDisabled();
  await expect(action.locator('.ds-button__spinner')).toBeVisible();
  await expect(action).toHaveAttribute('data-disabled', '');
});

test('navigation keeps native link semantics and disabled blocks programmatic clicks', async ({ page }) => {
  const navigation = page.locator('#play-navigation');
  await expect(navigation).toHaveRole('link');
  await navigation.press('Enter');
  expect(new URL(page.url()).hash).toBe('#new-item');
  await page.goto('/button/');
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(page.locator('#play-navigation')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#play-navigation')).not.toHaveAttribute('href');
  await page.locator('#play-action').evaluate((el: HTMLElement) => el.click());
  await expect(page.getByTestId('activations')).toHaveText('Activations: 0');
});

test('truncation preserves name; all sizes retain a real 44px target', async ({ page }) => {
  const button = page.locator('#truncated');
  await expect(button).toHaveAccessibleName('Create a new item with a deliberately long action label');
  const metrics = await button.locator('.ds-button__label').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, whiteSpace: getComputedStyle(el).whiteSpace, overflow: getComputedStyle(el).textOverflow }));
  expect(metrics.scroll).toBeGreaterThan(metrics.width);
  expect(metrics.whiteSpace).toBe('nowrap');
  expect(metrics.overflow).toBe('ellipsis');
  for (const density of ['compact', 'standard', 'comfortable']) {
    await page.getByLabel('Density', { exact: true }).selectOption(density);
    for (const size of ['sm', 'md', 'lg']) {
      const box = await page.locator(`#size-${size}`).boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('computed colors and geometry match JSON across brands, themes and densities', async ({ page }) => {
  let assertions = 0;
  for (const brand of ['base', 'brand-a', 'brand-b']) for (const theme of ['light', 'dark']) for (const density of ['compact', 'standard', 'comfortable']) {
    await page.getByLabel('Brand', { exact: true }).selectOption(brand);
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await page.getByLabel('Density', { exact: true }).selectOption(density);
    await page.mouse.move(0, 0);
    const tokens = JSON.parse(fs.readFileSync(`packages/tokens/resolved/${brand}-${theme}-${density}.json`, 'utf8'));
    for (const intent of ['accent', 'neutral', 'danger']) for (const appearance of ['solid', 'outline', 'ghost']) {
      const actual = await page.locator(`#matrix-${intent}-${appearance}`).evaluate(el => {
        const root = getComputedStyle(el), surface = getComputedStyle(el.querySelector('.ds-button__surface')!);
        return { color: root.color, bg: surface.backgroundColor, radius: surface.borderRadius, padding: surface.paddingInlineStart,
          height: el.querySelector('.ds-button__surface')!.getBoundingClientRect().height,
          slotColors: [...el.querySelectorAll('.ds-button__slot, .ds-button__slot kbd')].map(n => getComputedStyle(n).color),
          stroke: getComputedStyle(el.querySelector('path')!).stroke };
      });
      const rgb = (role: string) => {
        const v = tokens[`color.action.${intent}.${appearance}.default.${role}`].$value;
        const values = v.components.map((c: number) => Math.round(c * 255));
        return v.alpha === 0 ? 'rgba(0, 0, 0, 0)' : `rgb(${values.join(', ')})`;
      };
      expect(actual.color).toBe(rgb('content'));
      expect(actual.bg).toBe(rgb('surface'));
      expect(actual.slotColors.every(color => color === actual.color)).toBeTruthy();
      expect(actual.stroke).toBe(actual.color);
      expect(actual.radius).toBe(`${tokens['radius.control'].$value.value}px`);
      expect(actual.padding).toBe(`${tokens['space.control.padding-inline.md'].$value.value}px`);
      const font = tokens['typography.label.md'].$value;
      expect(actual.height).toBe(Math.max(tokens['size.control.md'].$value.value, font.fontSize.value * font.lineHeight + 2 * tokens['space.control.padding-block.md'].$value.value));
      assertions++;
    }
  }
  expect(assertions).toBe(162);
});

test('hover, pressed, focus and disabled priority follow tokens', async ({ page }) => {
  const button = page.locator('#play-action');
  const color = (state: string) => page.evaluate(state => {
    const root = document.querySelector('.demo')!;
    return getComputedStyle(root).getPropertyValue(`--color-action-accent-solid-${state}-surface`).trim();
  }, state);
  await button.hover();
  const hover = await color('hover');
  await expect(button.locator('.ds-button__surface')).toHaveCSS('background-color', hover.replace(/rgb\((\d+) (\d+) (\d+) \/ 1\)/, 'rgb($1, $2, $3)'));
  await page.mouse.down();
  const pressed = await color('pressed');
  await expect(button.locator('.ds-button__surface')).toHaveCSS('background-color', pressed.replace(/rgb\((\d+) (\d+) (\d+) \/ 1\)/, 'rgb($1, $2, $3)'));
  await page.mouse.up();
  await button.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(button.locator('.ds-button__surface')).toHaveCSS('outline-style', 'solid');
  await page.getByLabel('Loading', { exact: true }).check();
  await page.getByLabel('Disabled', { exact: true }).check();
  const disabled = await color('disabled');
  await expect(button.locator('.ds-button__surface')).toHaveCSS('background-color', disabled.replace(/rgb\((\d+) (\d+) (\d+) \/ 1\)/, 'rgb($1, $2, $3)'));
});

test('reduced motion and forced colors remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Loading', { exact: true }).check();
  await expect(page.locator('#play-action .ds-button__spinner')).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#play-action .ds-button__surface')).toHaveCSS('border-top-style', 'solid');
});

test('automated accessibility audit and desktop/mobile render', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: `reports/components/button/svelte/button-${theme}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'reports/components/button/svelte/button-mobile.png', fullPage: true });
});
