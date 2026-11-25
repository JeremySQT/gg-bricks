import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
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

const out = 'reports/components/time-input/svelte';
const seg = (id: string, part: string) => `#${id} [data-part="${part}"]`;

/** Computed values of one time input: field colors, ring, geometry and text start. */
async function measure(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((container) => {
    const c = getComputedStyle(container);
    const segments = container.querySelector('.ggb-time-input__segments') as HTMLElement;
    const first = container.querySelector('[data-part]') as HTMLElement;
    const r = container.getBoundingClientRect();
    return {
      surface: c.backgroundColor,
      content: getComputedStyle(container.querySelector('[data-part]:not([data-empty])') ?? first).color,
      placeholder: getComputedStyle(container.querySelector('[data-empty]') ?? segments).color,
      boxShadow: c.boxShadow,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      height: r.height,
      fontSize: getComputedStyle(segments).fontSize,
      textStart: first.getBoundingClientRect().left - r.left
    };
  });
}

const fieldColors = (tokens: TokenMap, condition: string) => ({
  surface: rgb(tokens[`color.input.${condition}.surface`]),
  boxShadow: insetBorder(tokens[`color.input.${condition}.border`], tokens['border.width.default']),
  placeholder: rgb(tokens[`color.input.${condition}.placeholder`])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/time-input/');
  await page.evaluate(() => document.fonts.ready);
});

test('a group named by the Field label; each part a spin button named by the label and the part in the locale', async ({
  page
}) => {
  const group = await accessible(page, '#play');
  expect(group.role).toBe('group');
  expect(group.name).toBe('Opening time');
  const hour = await accessible(page, seg('play', 'hour'));
  expect(hour.role).toBe('spinbutton');
  expect(hour.name).toBe('Opening time hour');
  expect(hour.description).toBe('Local time of the shop.');
  expect((await accessible(page, seg('play', 'dayPeriod'))).name).toBe('Opening time AM/PM');
  await expect(page.locator(seg('play', 'hour'))).toHaveAttribute('aria-valuetext', '09');
  await page.selectOption('#opt-locale', 'fr');
  expect((await accessible(page, seg('play', 'hour'))).name).toBe('Opening time heure');
  await expect(page.locator(seg('play', 'dayPeriod'))).toHaveCount(0);
  // Empty parts expose no value; standalone use is named by the label prop.
  const empty = page.locator(seg('cond-default-empty', 'hour'));
  await expect(empty).not.toHaveAttribute('aria-valuenow', /.*/);
  expect((await accessible(page, seg('cond-default-empty', 'minute'))).name).toBe('Arrival, empty (default) minute');
  await page.check('#opt-required');
  await page.check('#opt-invalid');
  const states = await accessible(page, seg('play', 'minute'));
  expect(states.properties.required).toBe(true);
  expect(states.properties.invalid).toBe('true');
});

test('typing: digits fill and advance, A and P choose the period; value emitted once complete', async ({ page }) => {
  await page.locator(seg('cond-default-empty', 'hour')).click();
  await page.keyboard.type('7');
  await expect(page.locator(seg('cond-default-empty', 'minute'))).toBeFocused();
  await page.keyboard.type('45p');
  await expect(page.locator('#cond-default-empty')).toHaveText(/07:45\s*PM/);
  // The playground: clear then type a full time; the value is set only when complete.
  await page.locator(seg('play', 'hour')).click();
  await page.keyboard.press('Backspace');
  await expect(page.getByTestId('value')).toHaveText('Value: “”');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
  await page.keyboard.type('11');
  await expect(page.getByTestId('value')).toHaveText('Value: “11:30”');
  await expect(page.locator(seg('play', 'minute'))).toBeFocused(); // 11 cannot take a third digit
  await page.keyboard.type('5');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('p');
  await expect(page.getByTestId('value')).toHaveText('Value: “23:05”');
  // Backspace on an empty part moves to the previous part.
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(page.locator(seg('play', 'minute'))).toBeFocused();
  // 24-hour clock: 2 waits for a second digit, 25 restarts at 5.
  await page.selectOption('#opt-cycle', 'h23');
  await page.locator(seg('play', 'hour')).click();
  await page.keyboard.type('25');
  await expect(page.locator(seg('play', 'hour'))).toHaveText('05');
  await expect(page.locator(seg('play', 'minute'))).toBeFocused();
});

test('Up and Down step and wrap; Left and Right follow the screen; Tab leaves the field; readonly and disabled', async ({
  page
}) => {
  await page.locator(seg('play', 'minute')).click();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: “09:31”');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator(seg('play', 'hour'))).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: “00:31”'); // 9, 10, 11, 12 AM
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator(seg('play', 'dayPeriod'))).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('value')).toHaveText('Value: “12:31”');
  await page.keyboard.press('Tab');
  await expect(page.locator('#opt-size')).toBeFocused();
  // Right to left: the time keeps its order on screen, Right goes to the part on the right.
  await page.locator(seg('rtl', 'hour')).click();
  const hourX = (await page.locator(seg('rtl', 'hour')).boundingBox())!.x;
  const minuteX = (await page.locator(seg('rtl', 'minute')).boundingBox())!.x;
  expect(hourX).toBeLessThan(minuteX);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator(seg('rtl', 'minute'))).toBeFocused();
  // Readonly: focusable, unchanged by keys and typing. Disabled: not in the tab order.
  await page.locator(seg('cond-readonly', 'hour')).focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.type('3');
  await expect(page.locator('#cond-readonly')).toHaveText(/02:05\s*PM/);
  const order = await tabOrder(page, seg('cond-readonly-empty', 'dayPeriod'), 1);
  expect(order[0]).not.toMatch(/cond-disabled/);
  await expect(page.locator(seg('cond-disabled', 'hour'))).not.toHaveAttribute('tabindex', /.*/);
});

test('afternoon on a 12-hour clock in Korean and in French h12: right period, value kept while editing', async ({
  page
}) => {
  await expect(page.locator('#pm-ko')).toHaveText(/오후\s*02:05/);
  await expect(page.locator('#pm-fr')).toHaveText(/02:05\s*PM/);
  await page.locator(seg('pm-fr', 'hour')).click();
  await page.keyboard.type('3');
  await expect(page.getByTestId('pm-fr')).toHaveText('Value: “15:05”');
  await page.locator(seg('pm-ko', 'dayPeriod')).click();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('pm-ko')).toHaveText('Value: “02:05”');
});

test('bounds 09:00 to 18:00: Up starts at 9 and skips later hours; a typed time outside becomes the bound on leaving', async ({
  page
}) => {
  await page.locator(seg('bounded', 'hour')).click();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator(seg('bounded', 'hour'))).toHaveText('09');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator(seg('bounded', 'hour'))).toHaveText('18');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator(seg('bounded', 'hour'))).toHaveText('09');
  // Typing is free; leaving the field brings a complete time back within the bounds.
  await page.keyboard.type('1930');
  await expect(page.getByTestId('bounded')).toHaveText('Value: “19:30”');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('bounded')).toHaveText('Value: “18:00”');
  await page.locator(seg('bounded', 'hour')).click();
  await page.keyboard.type('0705');
  await page.locator(seg('bounded', 'minute')).click(); // focus stays in the field: unchanged
  await expect(page.getByTestId('bounded')).toHaveText('Value: “07:05”');
  await page.click('body', { position: { x: 5, y: 5 } });
  await expect(page.getByTestId('bounded')).toHaveText('Value: “09:00”');
});

test('value set by the application, form submission, a press beside the parts focuses the first part', async ({
  page
}) => {
  await page.click('#set-noon');
  await expect(page.locator('#external')).toHaveText(/12:00\s*PM/);
  await page.click('#set-bad');
  await expect(page.locator(seg('external', 'hour'))).toHaveText('––');
  await page.click('#set-clear');
  await expect(page.getByTestId('external')).toHaveText('Value: “”');
  await page.locator(seg('form-departure', 'hour')).click();
  await page.keyboard.type('0615a');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted: departure=06:15&checkin=15:00');
  await page.locator('#cond-default').scrollIntoViewIfNeeded();
  const box = (await page.locator('#cond-default').boundingBox())!;
  await page.mouse.click(box.x + box.width - 8, box.y + box.height / 2);
  await expect(page.locator(seg('cond-default', 'hour'))).toBeFocused();
});

test('height and text start match InputText in every size and density; 44 px target', async ({ page }) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const m = await measure(page, `size-${size}`);
      const text = (await page.locator(`#text-${size} >> xpath=..`).boundingBox())!;
      expect(m.height, `${density} ${size}`).toBe(px(tokens[`size.control.${size}`]));
      expect(m.height).toBe(text.height);
      expect(m.textStart).toBeCloseTo(px(tokens[`space.control.padding-inline.${size}`]), 1);
    }
  }
  await page.selectOption('#ctx-density', 'standard');
  await page.locator('#size-sm').scrollIntoViewIfNeeded();
  const box = (await page.locator('#size-sm').boundingBox())!;
  await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2 - 20);
  await expect(page.locator(seg('size-sm', 'hour'))).toBeFocused();
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
    for (const size of sizes) {
      const m = await measure(page, `size-${size}`);
      expect(m.height).toBe(px(tokens[`size.control.${size}`]));
      expect(m.fontSize).toBe(
        `${(tokens[`typography.body.${size}`].$value as { fontSize: { value: number } }).fontSize.value}px`
      );
      expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
      report.add(context, { size }, 'default', m);
    }
    for (const condition of ['default', 'readonly', 'disabled', 'invalid']) {
      const m = await measure(page, `cond-${condition}-empty`);
      expect(
        { surface: m.surface, boxShadow: m.boxShadow, placeholder: m.placeholder },
        `${context} ${condition}`
      ).toEqual(fieldColors(tokens, condition));
      const filled = await measure(page, `cond-${condition}`);
      expect(filled.content).toBe(rgb(tokens[`color.input.${condition}.content`]));
      report.add(context, { size: 'md' }, condition, { ...m, content: filled.content });
    }
  }
  const ring = (tokens: TokenMap) =>
    `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`;
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.hover('#cond-default-empty');
    const hover = await measure(page, 'cond-default-empty');
    expect(hover.boxShadow).toBe(fieldColors(tokens, 'hover').boxShadow);
    report.add(context, { size: 'md' }, 'hover', hover);
    await page.mouse.move(0, 0);
    await page.locator(seg('cond-default', 'hour')).focus();
    const focus = await measure(page, 'cond-default');
    expect(focus.boxShadow).toBe(fieldColors(tokens, 'focus').boxShadow);
    expect(focus.outline).toBe(ring(tokens));
    const part = await page.locator(seg('cond-default', 'hour')).evaluate((el) => {
      const s = getComputedStyle(el);
      return { fill: s.backgroundColor, text: s.color, radius: s.borderTopLeftRadius };
    });
    expect(part).toEqual({
      fill: rgb(tokens['color.selection.surface']),
      text: rgb(tokens['color.selection.content']),
      radius: `${px(tokens['radius.indicator'])}px`
    });
    report.add(context, { size: 'md' }, 'focus', { ...focus, segmentFocus: part });
    await page.locator(seg('cond-invalid', 'hour')).focus();
    const invalidFocus = await measure(page, 'cond-invalid');
    expect(invalidFocus.boxShadow).toBe(fieldColors(tokens, 'invalid').boxShadow);
    expect(invalidFocus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'invalid+focus', invalidFocus);
    await page.locator(seg('cond-invalid', 'hour')).blur();
  }
  report.write('time-input');
});

test('transitions follow the motion tokens; forced colors: focused part in Highlight, disabled in GrayText', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#cond-default-empty');
  await expect(container).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('outline-width', '1px');
  await page.locator(seg('cond-default', 'minute')).focus();
  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const sys = (c: string) => ((probe.style.color = c), getComputedStyle(probe).color);
    const result = { highlight: sys('Highlight'), highlightText: sys('HighlightText'), gray: sys('GrayText') };
    probe.remove();
    const part = getComputedStyle(document.querySelector('#cond-default [data-part="minute"]')!);
    return {
      ...result,
      partFill: part.backgroundColor,
      partText: part.color,
      adjust: part.getPropertyValue('forced-color-adjust'),
      disabled: getComputedStyle(document.querySelector('#cond-disabled [data-part="hour"]')!).color
    };
  });
  expect(colors.partFill).toBe(colors.highlight);
  expect(colors.partText).toBe(colors.highlightText);
  expect(colors.adjust).toBe('none');
  expect(colors.disabled).toBe(colors.gray);
  await expect(page.locator('#cond-default')).toHaveCSS('outline-width', '2px');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'time-input');
});
