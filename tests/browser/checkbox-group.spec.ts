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
  tabOrder,
  tokensFor,
  type TokenMap
} from './helpers.ts';

const out = 'reports/components/checkbox-group/svelte';
const conditions = ['default', 'readonly', 'disabled', 'invalid'];

/** Computed values of one checkbox of a group: box colors, border, mark color, geometry and label. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((control) => {
    const label = control.closest('.ggb-checkbox') as HTMLElement;
    const c = getComputedStyle(control);
    const r = control.getBoundingClientRect();
    const text = label.querySelector('.ggb-checkbox__label') as HTMLElement;
    return {
      surface: c.backgroundColor,
      boxShadow: c.boxShadow,
      mark: c.color,
      labelColor: getComputedStyle(text).color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      size: r.width,
      fontSize: getComputedStyle(text).fontSize
    };
  });
}

const choiceColors = (tokens: TokenMap, selection: string, condition: string) => ({
  surface: rgb(tokens[`color.choice.${selection}.${condition}.surface`]),
  boxShadow: insetBorder(tokens[`color.choice.${selection}.${condition}.border`], tokens['border.width.default'])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/checkbox-group/');
  await page.evaluate(() => document.fonts.ready);
});

test('a named group of checkboxes named by their labels; a Field names, describes and states the requirement', async ({
  page
}) => {
  const group = await accessible(page, '#play');
  expect(group.role).toBe('group');
  expect(group.name).toBe('Notification channels');
  const email = await accessible(page, '#play-email');
  expect(email.role).toBe('checkbox');
  expect(email.name).toBe('Email');
  const channels = await accessible(page, '#channels');
  expect(channels.name).toBe('How can we reach you?');
  expect(channels.description).toBe('Select at least one channel.');
  expect((await accessible(page, '#channels-post')).description).toBe('Invoices only.');
  // Required is stated in words, never on the checkboxes: each one stays optional on its own.
  for (const id of ['channels-email', 'channels-phone', 'channels-post'])
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('aria-required', 'true');
  await expect(page.locator('#channels')).not.toHaveAttribute('aria-required', 'true');
  await expect(page.locator('#channels')).toHaveAttribute('data-required', '');
});

test('every checkbox is a tab stop; Space toggles; the value keeps the source order; application sets are silent', async ({
  page
}) => {
  const value = page.getByTestId('value');
  const changes = page.getByTestId('changes');
  expect(await tabOrder(page, '#before', 4)).toEqual(['play-email', 'play-sms', 'play-push', 'after']);
  await page.focus('#play-push');
  await page.keyboard.press('Space');
  await expect(value).toHaveText('Value: [push]');
  await page.focus('#play-email');
  await page.keyboard.press('Space');
  await expect(value).toHaveText('Value: [email, push]');
  await page.keyboard.press('Enter');
  await expect(value).toHaveText('Value: [email, push]');
  // Arrows do not move focus between checkboxes.
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#play-email')).toBeFocused();
  // A pointer press on a label toggles.
  await page.click('#playground .ggb-checkbox:has(#play-sms) .ggb-checkbox__label');
  await expect(value).toHaveText('Value: [email, sms, push]');
  await page.click('#play-email');
  await expect(value).toHaveText('Value: [sms, push]');
  await expect(changes).toHaveText('Changes: 4');
  // The application sets the value: checkboxes follow, no event.
  await page.click('#opt-set');
  await expect(value).toHaveText('Value: [push, email]');
  await expect(page.locator('#play-email')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#play-sms')).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('#playground .ggb-checkbox:has(#play-push)')).toHaveAttribute('data-selection', 'on');
  await page.click('#opt-reset');
  await expect(page.locator('#play-push')).toHaveAttribute('aria-checked', 'false');
  await expect(changes).toHaveText('Changes: 4');
});

test('a disabled checkbox is skipped; readonly ignores activation and stays focusable; a disabled group is skipped', async ({
  page
}) => {
  const value = page.getByTestId('value');
  await page.check('#opt-sms-disabled');
  expect(await tabOrder(page, '#before', 3)).toEqual(['play-email', 'play-push', 'after']);
  await page.uncheck('#opt-sms-disabled');
  await page.check('#opt-readonly');
  await expect(page.locator('#play-email')).toHaveAttribute('aria-readonly', 'true');
  await page.focus('#play-email');
  await page.keyboard.press('Space');
  await page.click('#play-sms');
  await expect(value).toHaveText('Value: []');
  await expect(page.locator('#play-sms')).toBeFocused();
  await page.uncheck('#opt-readonly');
  await page.check('#opt-disabled');
  for (const id of ['play-email', 'play-sms', 'play-push']) await expect(page.locator(`#${id}`)).toBeDisabled();
  expect(await tabOrder(page, '#before', 1)).toEqual(['after']);
  await page.uncheck('#opt-disabled');
  await page.check('#opt-invalid');
  for (const id of ['play-email', 'play-sms', 'play-push'])
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
});

test('required at least one: the application validates and the Field message describes the group', async ({ page }) => {
  await page.click('#channels-submit');
  await expect(page.locator('#channels')).toHaveAttribute('data-invalid', '');
  expect((await accessible(page, '#channels')).description).toBe(
    'Select at least one channel. Select at least one channel.'
  );
  await expect(page.locator('#channels-email')).toHaveAttribute('aria-invalid', 'true');
  await page.click('#channels-phone');
  await expect(page.locator('#channels')).not.toHaveAttribute('data-invalid', '');
  await expect(page.locator('#channels-email')).not.toHaveAttribute('aria-invalid', 'true');
});

test('select all stays outside the group and follows its value', async ({ page }) => {
  const all = page.locator('#toppings-all');
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
  await page.click('#toppings-all');
  await expect(all).toHaveAttribute('aria-checked', 'true');
  for (const v of ['cheese', 'ham', 'mushrooms', 'olives', 'peppers'])
    await expect(page.locator(`#toppings-${v}`)).toHaveAttribute('aria-checked', 'true');
  await page.click('#toppings-olives');
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
  await page.click('#toppings-all');
  await page.click('#toppings-all');
  await expect(all).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('#toppings [aria-checked="true"]')).toHaveCount(0);
  // Checkboxes of a group are never indeterminate.
  await expect(page.locator('#toppings [aria-checked="mixed"]')).toHaveCount(0);
});

test('gaps in every density and size; horizontal groups wrap in source order', async ({ page }) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const wifi = (await page.locator(`#cg-default-${size}-wifi >> xpath=..`).boundingBox())!;
      const parking = (await page.locator(`#cg-default-${size}-parking >> xpath=..`).boundingBox())!;
      expect(parking.y - (wifi.y + wifi.height), `${density} ${size}`).toBeCloseTo(px(tokens['space.content.sm']), 1);
      expect((await measure(page, `#cg-default-${size}-wifi`)).size).toBe(px(tokens[`size.choice.${size}`]));
    }
    const mon = (await page.locator('#days-mon >> xpath=..').boundingBox())!;
    const tue = (await page.locator('#days-tue >> xpath=..').boundingBox())!;
    expect(tue.x - (mon.x + mon.width)).toBeCloseTo(px(tokens['space.content.lg']), 1);
    expect(tue.y).toBeCloseTo(mon.y, 1);
  }
  const boxes = await page
    .locator('#days .ggb-checkbox')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBeGreaterThan(1);
  for (let i = 1; i < boxes.length; i++)
    expect(boxes[i].top > boxes[i - 1].top || boxes[i].left > boxes[i - 1].left).toBe(true);
});

test('computed values match the resolved tokens for every size, condition and context', async ({ page }) => {
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
        for (const [id, selection] of [
          ['parking', 'off'],
          ['wifi', 'on']
        ]) {
          const m = await measure(page, `#cg-${condition}-${size}-${id}`);
          expect(
            { surface: m.surface, boxShadow: m.boxShadow },
            `${context} ${size} ${condition} ${selection}`
          ).toEqual(choiceColors(tokens, selection, condition));
          if (selection === 'on') expect(m.mark).toBe(rgb(tokens[`color.choice.on.${condition}.content`]));
          expect(m.size).toBe(px(tokens[`size.choice.${size}`]));
          report.add(context, { size, selection }, condition, m);
        }
    const vertical = await page.locator('#cg-default-md').evaluate((el) => getComputedStyle(el).gap);
    expect(vertical).toBe(`${px(tokens['space.content.sm'])}px`);
    report.add(context, { orientation: 'vertical' }, 'default', { gap: vertical });
    const horizontal = await page.locator('#days').evaluate((el) => getComputedStyle(el).gap);
    expect(horizontal).toBe(`${px(tokens['space.content.sm'])}px ${px(tokens['space.content.lg'])}px`);
    report.add(context, { orientation: 'horizontal' }, 'default', { gap: horizontal });
  }
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    for (const [id, selection] of [
      ['parking', 'off'],
      ['wifi', 'on']
    ]) {
      await page.hover(`#cg-default-md-${id} >> xpath=..`);
      const hover = await measure(page, `#cg-default-md-${id}`);
      expect({ surface: hover.surface, boxShadow: hover.boxShadow }).toEqual(choiceColors(tokens, selection, 'hover'));
      report.add(context, { size: 'md', selection }, 'hover', hover);
    }
    await page.mouse.move(0, 0);
    await page.focus('#cg-default-md-parking');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focus = await measure(page, '#cg-default-md-parking');
    expect(focus.outline).toBe(
      `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
    );
    report.add(context, { size: 'md', selection: 'off' }, 'focus', focus);
  }
  report.write('checkbox-group');
});

test('forced colors keep the boxes', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await settle(page);
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'checkbox-group');
});
