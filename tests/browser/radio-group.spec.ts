import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  densities,
  px,
  representative,
  rgb,
  setContext,
  settle,
  sizes,
  tokensFor,
  type TokenMap
} from './helpers.ts';

const out = 'reports/components/radio-group/svelte';
const conditions = ['default', 'readonly', 'disabled', 'invalid'];

/** Computed values of one radio: circle colors, border, dot, geometry and label line. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((control) => {
    const root = control.closest('.ggb-radio') as HTMLElement;
    const c = getComputedStyle(control);
    const r = control.getBoundingClientRect();
    const ring = getComputedStyle(control.querySelector('.ggb-radio__ring') as SVGCircleElement);
    const dot = control.querySelector('.ggb-radio__mark') as SVGCircleElement | null;
    const label = root.querySelector('.ggb-radio__label') as HTMLElement;
    const l = label.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
    return {
      surface: ring.fill,
      border: `${ring.stroke} ${ring.strokeWidth}`,
      dot: dot ? getComputedStyle(dot).fill : '',
      dotSize: dot?.getBoundingClientRect().width ?? 0,
      labelColor: getComputedStyle(label).color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      size: r.width,
      gap: l.left - r.right,
      firstLineOffset: r.top + r.height / 2 - (l.top + lineHeight / 2)
    };
  });
}

const choiceColors = (tokens: TokenMap, selection: string, condition: string) => ({
  surface: rgb(tokens[`color.choice.${selection}.${condition}.surface`]),
  border: `${rgb(tokens[`color.choice.${selection}.${condition}.border`])} ${px(tokens['border.width.default'])}px`
});
const active = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');

test.beforeEach(async ({ page }) => {
  await page.goto('/radio-group/');
  await page.evaluate(() => document.fonts.ready);
});

test('a named radiogroup of radios named by their labels; Field label and description name a group', async ({
  page
}) => {
  const group = await accessible(page, '#play');
  expect(group.role).toBe('radiogroup');
  expect(group.name).toBe('Delivery speed');
  const radio = await accessible(page, '#play-express');
  expect(radio.role).toBe('radio');
  expect(radio.name).toBe('Express');
  const delivery = await accessible(page, '#delivery');
  expect(delivery.name).toBe('How should we deliver?');
  expect(delivery.description).toBe('You can change it until the order ships.');
  expect((await accessible(page, '#delivery-locker')).description).toBe('Open 24/7, near you.');
  await expect(page.locator('#delivery')).toHaveAttribute('aria-required', 'true');
});

test('one tab stop; arrows move and select in both axes and wrap; Space selects; no way back to none', async ({
  page
}) => {
  const value = page.getByTestId('value');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await active(page)).toBe('play-standard');
  await page.keyboard.press('Tab');
  expect(await active(page)).toBe('after');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Space');
  await expect(value).toHaveText('Value: “standard”');
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('Value: “express”');
  await page.keyboard.press('ArrowRight');
  await expect(value).toHaveText('Value: “pickup”');
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('Value: “standard”');
  await page.keyboard.press('ArrowUp');
  await expect(value).toHaveText('Value: “pickup”');
  await page.keyboard.press('ArrowLeft');
  await expect(value).toHaveText('Value: “express”');
  // Back into the group: focus lands on the selected radio.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await active(page)).toBe('play-express');
  // A pointer press on a label selects; pressing the selected radio again keeps it.
  await page.click('#playground .ggb-radio:has(#play-pickup) .ggb-radio__label');
  await expect(value).toHaveText('Value: “pickup”');
  await page.click('#play-pickup');
  await expect(value).toHaveText('Value: “pickup”');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 7');
  // No selection yet: the first arrow press selects the radio it moves to.
  await page.click('#opt-reset');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('Value: “express”');
});

test('disabled radios are skipped; readonly moves focus without selecting; a disabled group is skipped', async ({
  page
}) => {
  const value = page.getByTestId('value');
  await page.check('#opt-express-disabled');
  await page.click('#play-standard');
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('Value: “pickup”');
  await page.uncheck('#opt-express-disabled');
  await page.check('#opt-readonly');
  await page.focus('#play-pickup');
  await page.keyboard.press('ArrowUp');
  expect(await active(page)).toBe('play-express');
  await page.keyboard.press('Space');
  await page.click('#play-standard');
  await expect(value).toHaveText('Value: “pickup”');
  await page.uncheck('#opt-readonly');
  await page.check('#opt-disabled');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await active(page)).toBe('after');
});

test('circle, dot, gaps and first-line alignment in every density; horizontal groups wrap in order', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const on = await measure(page, `#rg-default-${size}-team`);
      expect(on.size, `${density} ${size}`).toBe(px(tokens[`size.choice.${size}`]));
      expect(on.dotSize).toBeCloseTo((on.size * 3) / 8, 1);
      expect(on.gap).toBeCloseTo(px(tokens[`space.control.gap.${size}`]), 1);
      expect(Math.abs(on.firstLineOffset)).toBeLessThanOrEqual(0.5);
      const solo = (await page.locator(`#rg-default-${size}-solo >> xpath=..`).boundingBox())!;
      const team = (await page.locator(`#rg-default-${size}-team >> xpath=..`).boundingBox())!;
      expect(team.y - (solo.y + solo.height)).toBeCloseTo(px(tokens['space.content.sm']), 1);
    }
    const yes = (await page.locator('#yes >> xpath=..').boundingBox())!;
    const no = (await page.locator('#no >> xpath=..').boundingBox())!;
    expect(no.x - (yes.x + yes.width)).toBeCloseTo(px(tokens['space.content.lg']), 1);
    expect(no.y).toBeCloseTo(yes.y, 1);
  }
  // Narrow column: more than one line, source order kept.
  const tops = await page.locator('#wrap .ggb-radio').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(new Set(tops.map((t) => Math.round(t.top))).size).toBeGreaterThan(1);
  for (let i = 1; i < tops.length; i++)
    expect(tops[i].top > tops[i - 1].top || tops[i].left > tops[i - 1].left).toBe(true);
});

test('computed values match the resolved tokens for every selection, condition, size and context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const radio = new ComputedReport();
  const group = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.mouse.move(0, 0);
    for (const size of sizes)
      for (const condition of conditions)
        for (const [id, selection] of [
          ['solo', 'off'],
          ['team', 'on']
        ]) {
          const m = await measure(page, `#rg-${condition}-${size}-${id}`);
          const expected = choiceColors(tokens, selection, condition);
          expect({ surface: m.surface, border: m.border }, `${context} ${size} ${condition} ${selection}`).toEqual(
            expected
          );
          if (selection === 'on') expect(m.dot).toBe(rgb(tokens[`color.choice.on.${condition}.content`]));
          expect(m.radius).toBe(`${px(tokens['radius.full'])}px`);
          radio.add(context, { size, selection }, condition, m);
        }
    const gaps = await page.locator('#yes-no').evaluate((el) => getComputedStyle(el).gap);
    group.add(context, { orientation: 'horizontal' }, 'default', { gap: gaps });
    const vertical = await page.locator('#rg-default-md').evaluate((el) => getComputedStyle(el).gap);
    expect(vertical).toBe(`${px(tokens['space.content.sm'])}px`);
    group.add(context, { orientation: 'vertical' }, 'default', { gap: vertical });
  }
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    // Hover alone: drop the focus left by the previous context's focus check.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    for (const [id, selection] of [
      ['solo', 'off'],
      ['team', 'on']
    ]) {
      await page.hover(`#rg-default-md-${id}`);
      const hover = await measure(page, `#rg-default-md-${id}`);
      expect({ surface: hover.surface, border: hover.border }).toEqual(choiceColors(tokens, selection, 'hover'));
      radio.add(context, { size: 'md', selection }, 'hover', hover);
    }
    await page.mouse.move(0, 0);
    await page.focus('#rg-default-md-team');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focus = await measure(page, '#rg-default-md-team');
    expect(focus.outline).toBe(
      `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
    );
    radio.add(context, { size: 'md', selection: 'on' }, 'focus', focus);
  }
  radio.write('radio');
  group.write('radio-group');
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors keep the circle', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const control = page.locator('#rg-default-md-solo .ggb-radio__ring');
  await expect(control).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(control).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  const ring = page.locator('#rg-default-md-solo .ggb-radio__ring');
  await settle(page);
  const forced = await ring.evaluate((el) => {
    const probe = document.createElement('span');
    probe.style.color = 'CanvasText';
    document.body.append(probe);
    const text = getComputedStyle(probe).color;
    probe.remove();
    return { stroke: getComputedStyle(el).stroke, text };
  });
  expect(forced.stroke).toBe(forced.text);
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'radio-group');
});
