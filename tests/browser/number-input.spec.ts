import { test, expect, webkit, devices, type Page } from '@playwright/test';
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
  tokensFor,
  type TokenMap
} from './helpers.ts';

const out = 'reports/components/number-input/svelte';

/** Computed values of one number input: field colors, ring, geometry, steppers. */
async function measure(page: Page, inputSelector: string) {
  return page.locator(inputSelector).evaluate((input) => {
    const container = input.closest('.ggb-number-input') as HTMLElement;
    const c = getComputedStyle(container);
    const i = getComputedStyle(input);
    const r = container.getBoundingClientRect();
    const ir = input.getBoundingClientRect();
    const dec = container.querySelector('.ggb-number-input__decrease') as HTMLElement | null;
    const inc = container.querySelector('.ggb-number-input__increase') as HTMLElement | null;
    const after = dec ? getComputedStyle(dec, '::after') : null;
    const size = after ? parseFloat(after.width) : 0;
    const decBox = dec?.getBoundingClientRect();
    const incBox = inc?.getBoundingClientRect();
    return {
      surface: c.backgroundColor,
      content: i.color,
      boxShadow: c.boxShadow,
      placeholder: getComputedStyle(input, '::placeholder').color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      height: r.height,
      fontSize: i.fontSize,
      textStart: ir.left + parseFloat(i.paddingLeft) - r.left,
      stepperSize: size,
      stepperRadius: after?.borderTopLeftRadius ?? '',
      stepperFill: after?.backgroundColor ?? '',
      stepperIcon: dec ? getComputedStyle(dec).color : '',
      iconSize: dec?.querySelector('svg')?.getBoundingClientRect().width ?? 0,
      startInset: decBox ? decBox.left + (decBox.width - size) / 2 - r.left : 0,
      endInset: incBox ? r.right - (incBox.right - (incBox.width - size) / 2) : 0
    };
  });
}

const fieldColors = (tokens: TokenMap, condition: string) => ({
  surface: rgb(tokens[`color.input.${condition}.surface`]),
  content: rgb(tokens[`color.input.${condition}.content`]),
  boxShadow: insetBorder(tokens[`color.input.${condition}.border`], tokens['border.width.default']),
  placeholder: rgb(tokens[`color.input.${condition}.placeholder`])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/number-input/');
  await page.evaluate(() => document.fonts.ready);
});

test('a spin button named by the Field label, exposing value, bounds and formatted text', async ({ page }) => {
  const play = await accessible(page, '#play');
  expect(play.role).toBe('spinbutton');
  expect(play.name).toBe('Quantity');
  expect(play.description).toBe('Between the minimum and the maximum.');
  await expect(page.locator('#play')).toHaveAttribute('aria-valuenow', '3');
  await expect(page.locator('#play')).toHaveAttribute('aria-valuemin', '0');
  await expect(page.locator('#play')).toHaveAttribute('aria-valuemax', '99');
  expect((await accessible(page, '#size-md')).name).toBe('Guests (md)');
  await expect(page.locator('#locale-fr')).toHaveAttribute('aria-valuetext', '1\u202f234\u202f567,89');
  // The steppers are named buttons outside the tab order: Tab goes from one field to the next.
  await expect(page.getByRole('button', { name: 'Increase' }).first()).toHaveAttribute('tabindex', '-1');
  await page.focus('#size-sm');
  await page.keyboard.press('Tab');
  await expect(page.locator('#text-sm')).toBeFocused();
  await page.check('#opt-required');
  await page.check('#opt-invalid');
  const states = await accessible(page, '#play');
  expect(states.properties.required).toBe(true);
  expect(states.properties.invalid).toBe('true');
});

test('keyboard: arrows by one step, Shift and Page keys by ten, Home and End to the bounds, no wheel', async ({
  page
}) => {
  const play = page.locator('#play');
  await play.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 4');
  await page.keyboard.press('Shift+ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 14');
  await page.keyboard.press('PageUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 24');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('value')).toHaveText('Value: 3');
  await page.keyboard.press('End');
  await expect(page.getByTestId('value')).toHaveText('Value: 99');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 99');
  await page.keyboard.press('Home');
  await expect(page.getByTestId('value')).toHaveText('Value: 0');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 8');
  // The mouse wheel over the focused field changes nothing.
  await play.hover();
  await page.mouse.wheel(0, -200);
  await expect(page.getByTestId('value')).toHaveText('Value: 0');
  // Decimal stepping: 0.2 + 0.1 is 0.3.
  await page.focus('#ratio');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('ratio')).toHaveText('Value: 0.3');
  await expect(page.locator('#ratio')).toHaveValue('0.3');
  // Stepping goes to the next multiple of the step counted from min: 3 -> 6 with min 1 and step 5.
  await page.focus('#step-five');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#step-five')).toHaveValue('6');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#step-five')).toHaveValue('1');
});

test('typing commits on Enter or blur: clamped, unreadable text reverted, empty clears, reformatted', async ({
  page
}) => {
  const play = page.locator('#play');
  await play.fill('42');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0'); // typing alone does not emit
  await play.press('Enter');
  await expect(page.getByTestId('value')).toHaveText('Value: 42');
  await play.fill('250');
  await play.blur();
  await expect(page.getByTestId('value')).toHaveText('Value: 99');
  await expect(play).toHaveValue('99');
  await play.fill('abc');
  await play.press('Enter');
  await expect(play).toHaveValue('99');
  await play.fill('');
  await play.press('Enter');
  await expect(page.getByTestId('value')).toHaveText('Value: none');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 3');
  // From no value, up starts at min.
  await play.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 0');
  // French: the comma and the period are decimal separators; the grouping is reformatted on commit.
  const fr = page.locator('#form-amount');
  await fr.fill('12345,6');
  await fr.press('Tab');
  await expect(fr).toHaveValue('12\u202f345,60');
  await fr.fill('7.5');
  await fr.blur();
  await expect(fr).toHaveValue('7,50');
  // German: the period groups digits.
  const de = page.locator('#locale-de');
  await de.fill('1.234,5');
  await de.blur();
  await expect(de).toHaveValue('1.234,50');
  // Negative numbers without bounds.
  await page.locator('#temperature').fill('-12,5');
  await page.locator('#temperature').blur();
  await expect(page.locator('#temperature')).toHaveValue('-125');
  await page.locator('#temperature').fill('-12.5');
  await page.locator('#temperature').blur();
  await expect(page.locator('#temperature')).toHaveValue('-12.5');
});

test('steppers: a press steps and keeps focus in the input; disabled at the bounds, readonly and disabled', async ({
  page
}) => {
  const container = page.locator('#at-min >> xpath=..');
  await expect(container.locator('.ggb-number-input__decrease')).toBeDisabled();
  await container.locator('.ggb-number-input__increase').click();
  await expect(page.locator('#at-min')).toHaveValue('1');
  await expect(page.locator('#at-min')).toBeFocused();
  await expect(container.locator('.ggb-number-input__decrease')).toBeEnabled();
  await expect(page.locator('#at-max >> xpath=.. >> .ggb-number-input__increase')).toBeDisabled();
  await expect(page.locator('#cond-readonly >> xpath=.. >> .ggb-number-input__increase')).toBeDisabled();
  await expect(page.locator('#cond-disabled >> xpath=.. >> .ggb-number-input__decrease')).toBeDisabled();
  // Readonly: focusable, but neither keys nor typing change it.
  await page.focus('#cond-readonly');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.type('7');
  await expect(page.locator('#cond-readonly')).toHaveValue('4');
  // The stepper's 44 px target: 20 px above the center of an sm field still steps (the field is 32 px tall).
  await page.selectOption('#ctx-density', 'standard');
  await page.locator('#size-sm').scrollIntoViewIfNeeded();
  const sm = (await page.locator('#size-sm >> xpath=.. >> .ggb-number-input__increase').boundingBox())!;
  await page.mouse.click(sm.x + sm.width / 2, sm.y + sm.height / 2 - 20);
  await expect(page.locator('#size-sm')).toHaveValue('3');
});

test('touch: a tap on a stepper steps in WebKit (iPhone) without moving focus to the input; the number is centered', async ({
  baseURL
}) => {
  // WebKit drops the click after a pointerdown whose default is prevented: the steppers step on pointerup.
  // The configuration's Chromium launch options would otherwise apply to this launch too.
  const browser = await webkit.launch({ executablePath: webkit.executablePath(), args: [] });
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], baseURL });
    const page = await context.newPage();
    await page.goto('/number-input/');
    const increase = page.locator('#play ~ .ggb-number-input__increase');
    const decrease = page.locator('.ggb-number-input__decrease:has(~ #play)');
    await increase.scrollIntoViewIfNeeded();
    await increase.tap();
    await increase.tap();
    await decrease.tap();
    await expect(page.getByTestId('value')).toHaveText('Value: 4');
    await expect(page.getByTestId('changes')).toHaveText('Changes: 3');
    await expect(page.locator('#play')).not.toBeFocused();
    await expect(page.locator('#play')).toHaveCSS('text-align', 'center');
    await expect(page.locator('#plain-md')).toHaveCSS('text-align', 'start');
    await expect(increase).toHaveCSS('touch-action', 'manipulation');
  } finally {
    await browser.close();
  }
});

test('the consumer onkeydown runs before the component; the form submits plain decimals', async ({ page }) => {
  await page.focus('#consumer');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('consumer-keys')).toHaveText('Keys seen by the application: 1');
  await expect(page.locator('#consumer')).toHaveValue('2');
  const amount = page.locator('#form-amount');
  await amount.fill('9876,5');
  await amount.press('Enter');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted: amount=9876.5&fee=2.5');
});

test('geometry: InputText height, steppers one step smaller with equal insets, in every size and density', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const m = await measure(page, `#size-${size}`);
      const text = (await page.locator(`#text-${size} >> xpath=..`).boundingBox())!;
      expect(m.height, `${density} ${size}`).toBe(px(tokens[`size.control.${size}`]));
      expect(m.height).toBe(text.height);
      expect(m.stepperSize).toBe(px(tokens[`size.control.nested.${size}`]));
      expect(m.iconSize).toBe(px(tokens[`size.icon.${size}`]));
      const block = (m.height - m.stepperSize) / 2;
      expect(m.startInset).toBeCloseTo(block, 1);
      expect(m.endInset).toBeCloseTo(block, 1);
      // The text starts textInline after the stepper square.
      expect(m.textStart).toBeCloseTo(m.height + px(tokens[`space.control.label-inline.${size}`]), 1);
      // Without steppers, the text starts where an InputText's does.
      const plain = await measure(page, `#plain-${size}`);
      expect(plain.textStart).toBe(px(tokens[`space.control.padding-inline.${size}`]));
    }
  }
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
      const m = await measure(page, `#size-${size}`);
      expect(m.height).toBe(px(tokens[`size.control.${size}`]));
      expect(m.fontSize).toBe(
        `${(tokens[`typography.body.${size}`].$value as { fontSize: { value: number } }).fontSize.value}px`
      );
      expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
      expect(m.stepperRadius).toBe(`${px(tokens['radius.control'])}px`);
      expect(m.stepperIcon).toBe(rgb(tokens['color.action.neutral.ghost.default.content']));
      report.add(context, { size }, 'default', m);
    }
    for (const condition of ['default', 'readonly', 'disabled', 'invalid']) {
      const m = await measure(page, `#cond-${condition}-empty`);
      expect(
        { surface: m.surface, content: m.content, boxShadow: m.boxShadow, placeholder: m.placeholder },
        `${context} ${condition}`
      ).toEqual(fieldColors(tokens, condition));
      // Readonly and disabled fields disable their steppers; an invalid field keeps them enabled.
      if (condition === 'readonly' || condition === 'disabled')
        expect(m.stepperIcon).toBe(rgb(tokens['color.action.neutral.ghost.disabled.content']));
      report.add(context, { size: 'md' }, condition, m);
    }
  }
  const ring = (tokens: TokenMap) =>
    `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`;
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.hover('#cond-default-empty');
    const hover = await measure(page, '#cond-default-empty');
    expect(hover.boxShadow).toBe(fieldColors(tokens, 'hover').boxShadow);
    report.add(context, { size: 'md' }, 'hover', hover);
    await page.hover('#cond-default >> xpath=.. >> .ggb-number-input__increase');
    const stepperHover = await page
      .locator('#cond-default >> xpath=.. >> .ggb-number-input__increase')
      .evaluate((el) => getComputedStyle(el, '::after').backgroundColor);
    expect(stepperHover).toBe(rgb(tokens['color.action.neutral.ghost.hover.surface']));
    report.add(context, { size: 'md' }, 'stepper-hover', { stepperFill: stepperHover });
    await page.mouse.move(0, 0);
    await page.focus('#cond-default-empty');
    const focus = await measure(page, '#cond-default-empty');
    expect(focus.boxShadow).toBe(fieldColors(tokens, 'focus').boxShadow);
    expect(focus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'focus', focus);
    await page.focus('#cond-invalid-empty');
    const invalidFocus = await measure(page, '#cond-invalid-empty');
    expect(invalidFocus.boxShadow).toBe(fieldColors(tokens, 'invalid').boxShadow);
    expect(invalidFocus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'invalid+focus', invalidFocus);
    await page.locator('#cond-invalid-empty').evaluate((el) => (el as HTMLInputElement).blur());
  }
  report.write('number-input');
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#cond-default-empty >> xpath=..');
  await expect(container).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('outline-style', 'solid');
  await expect(container).toHaveCSS('outline-width', '1px');
  // Disabled steppers and the disabled field in GrayText; enabled steppers in ButtonText.
  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    probe.style.color = 'GrayText';
    const gray = getComputedStyle(probe).color;
    probe.style.color = 'ButtonText';
    const button = getComputedStyle(probe).color;
    probe.remove();
    const stepper = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
    return {
      gray,
      button,
      disabledStepper: stepper('#cond-disabled ~ .ggb-number-input__increase'),
      enabledStepper: stepper('#cond-default ~ .ggb-number-input__increase'),
      disabledField: getComputedStyle(document.querySelector('#cond-disabled')!.closest('.ggb-number-input')!).color
    };
  });
  expect(colors.disabledStepper).toBe(colors.gray);
  expect(colors.disabledField).toBe(colors.gray);
  expect(colors.enabledStepper).toBe(colors.button);
  await page.focus('#cond-default-empty');
  await expect(container).toHaveCSS('outline-width', '2px');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'number-input');
});
