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

const out = 'reports/components/input-text/svelte';

/** Computed values of one input: container colors, border, ring, geometry and text start. */
async function measure(page: Page, inputSelector: string) {
  return page.locator(inputSelector).evaluate((input) => {
    const container = input.closest('.ggb-input-text') as HTMLElement;
    const c = getComputedStyle(container);
    const i = getComputedStyle(input);
    const r = container.getBoundingClientRect();
    const ir = input.getBoundingClientRect();
    const glyph = container.querySelector('.ggb-input-text__leading svg')?.getBoundingClientRect();
    return {
      surface: c.backgroundColor,
      content: i.color,
      boxShadow: c.boxShadow,
      placeholder: getComputedStyle(input, '::placeholder').color,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      height: r.height,
      fontSize: i.fontSize,
      lineHeight: i.lineHeight,
      textStart: ir.left + parseFloat(i.paddingLeft) - r.left,
      iconSize: glyph?.width ?? 0,
      iconStart: glyph ? glyph.left - r.left : 0
    };
  });
}

const fieldColors = (tokens: TokenMap, condition: string) => ({
  surface: rgb(tokens[`color.field.${condition}.surface`]),
  content: rgb(tokens[`color.field.${condition}.content`]),
  boxShadow: insetBorder(tokens[`color.field.${condition}.border`], tokens['border.width.default']),
  placeholder: rgb(tokens[`color.field.${condition}.placeholder`])
});

test.beforeEach(async ({ page }) => {
  await page.goto('/input-text/');
  await page.evaluate(() => document.fonts.ready);
});

test('the Field label names the input, the description describes it; alone, the label prop names it', async ({
  page
}) => {
  const play = await accessible(page, '#play');
  expect(play.role).toBe('textbox');
  expect(play.name).toBe('Full name');
  expect(play.description).toBe('As it appears on your ID.');
  // A placeholder is never the name.
  expect((await accessible(page, '#cond-default-empty')).name).toBe('Email, empty (default)');
  expect((await accessible(page, '#size-md')).name).toBe('Search (md)');
  // A press on the Field label focuses the input.
  await page.click('label[for="play"]');
  await expect(page.locator('#play')).toBeFocused();
  // Required and invalid reach the accessibility tree.
  await page.check('#opt-required');
  await page.check('#opt-invalid');
  const states = await accessible(page, '#play');
  expect(states.properties.required).toBe(true);
  expect(states.properties.invalid).toBe('true');
});

test('typing edits the value and emits on every edit; readonly and disabled do not', async ({ page }) => {
  await page.click('#play');
  await page.keyboard.type('Ada');
  await expect(page.getByTestId('value')).toHaveText('Value: “Ada”');
  await expect(page.getByTestId('edits')).toHaveText('Edits: 3');
  // Readonly: focusable and selectable, not editable.
  await page.focus('#cond-readonly');
  await expect(page.locator('#cond-readonly')).toBeFocused();
  await page.keyboard.type('x');
  await expect(page.locator('#cond-readonly')).toHaveValue('ada@example.com');
  // Disabled: skipped by Tab.
  const order = await tabOrder(page, '#cond-readonly-empty', 2);
  expect(order[0]).not.toBe('cond-disabled');
  expect(order).not.toContain('cond-disabled');
  // A press on a decorative icon focuses the input.
  await page.locator('#cond-default').evaluate((el) => (el as HTMLInputElement).blur());
  await page.click('#cond-default >> xpath=.. >> .ggb-input-text__leading');
  await expect(page.locator('#cond-default')).toBeFocused();
  // Enter submits the enclosing form.
  await page.click('#coupon');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted');
});

test('height, text start and icons match the Button of the same size in every density; 44 px target', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const m = await measure(page, `#size-${size}`);
      expect(m.height, `${density} ${size} height`).toBe(px(tokens[`size.control.${size}`]));
      expect(m.iconSize).toBe(px(tokens[`size.icon.${size}`]));
      // Optical placement: the drawing (1/8 inside the box) starts at edgeInline + slotInline.
      expect(m.iconStart + m.iconSize / 8).toBeCloseTo(
        px(tokens[`space.control.edge-inline.${size}`]) + px(tokens[`space.control.slot-inline.${size}`]),
        1
      );
      const button = (await page.locator(`#align-button-${size} .ggb-button__container`).boundingBox())!;
      const input = (await page.locator(`#size-${size} >> xpath=..`).boundingBox())!;
      expect(input.height).toBe(button.height);
      expect(input.y).toBeCloseTo(button.y, 1);
    }
    // Without slots the text starts at the padding of a text-only Button (edge + label inline).
    const plain = await measure(page, '#cond-default-empty');
    expect(plain.textStart).toBe(px(tokens['space.control.padding-inline.md']));
  }
  // The sm input (32 px) has a 44 px target: 21 px above and below its center still focus it.
  await page.selectOption('#ctx-density', 'standard');
  await page.locator('#size-sm').scrollIntoViewIfNeeded();
  const box = (await page.locator('#size-sm >> xpath=..').boundingBox())!;
  for (const dy of [-21, 21]) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + dy);
    await expect(page.locator('#size-sm')).toBeFocused();
    await page.locator('#size-sm').evaluate((el) => (el as HTMLInputElement).blur());
  }
});

test('the action is an IconButton one size smaller with equal insets, a separate tab stop, never at sm', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const [size, inner] of [
      ['md', 'sm'],
      ['lg', 'md']
    ]) {
      const container = (await page.locator(`#action-${size} >> xpath=..`).boundingBox())!;
      const button = (await page.locator(`#action-${size} >> xpath=.. >> .ggb-icon-button`).boundingBox())!;
      expect(button.height, `${density} ${size}`).toBe(px(tokens[`size.control.${inner}`]));
      const block = button.y - container.y;
      const end = container.x + container.width - (button.x + button.width);
      expect(block).toBeCloseTo((px(tokens[`size.control.${size}`]) - button.height) / 2, 1);
      expect(end).toBeCloseTo(block, 1);
    }
  }
  await expect(page.locator('#action-sm >> xpath=.. >> .ggb-input-text__action')).toHaveCount(0);
  await expect(page.locator('#search >> xpath=.. >> .ggb-icon-button')).toHaveAttribute('data-appearance', 'ghost');
  await expect(page.locator('#search >> xpath=.. >> .ggb-icon-button')).toHaveAttribute('data-intent', 'neutral');
  // Tab order: input, then its action.
  await page.focus('#search');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe('Clear search');
  await page.keyboard.press('Enter');
  await expect(page.locator('#search')).toHaveValue('');
  // The input ring does not show while the action has focus: the container keeps its transparent 1 px outline.
  await expect(page.locator('#search >> xpath=..')).toHaveCSS('outline-width', '1px');
  await expect(page.locator('#search >> xpath=..')).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
  // Disabled input: its action is disabled too; readonly keeps it.
  await expect(page.locator('#action-disabled >> xpath=.. >> .ggb-icon-button')).toBeDisabled();
  await expect(page.locator('#action-readonly >> xpath=.. >> .ggb-icon-button')).toBeEnabled();
  // Show password toggles the type.
  await page.click('#reveal');
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
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
      report.add(context, { size }, 'default', m);
    }
    for (const condition of ['default', 'readonly', 'disabled', 'invalid']) {
      const m = await measure(page, `#cond-${condition}-empty`);
      expect(
        { surface: m.surface, content: m.content, boxShadow: m.boxShadow, placeholder: m.placeholder },
        `${context} ${condition}`
      ).toEqual(fieldColors(tokens, condition));
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
    await page.mouse.move(0, 0);
    await page.focus('#cond-default-empty');
    const focus = await measure(page, '#cond-default-empty');
    expect(focus.boxShadow).toBe(fieldColors(tokens, 'focus').boxShadow);
    expect(focus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'focus', focus);
    // An invalid input keeps its border while focused; the ring shows the focus. Readonly shows the ring too.
    await page.focus('#cond-invalid-empty');
    const invalidFocus = await measure(page, '#cond-invalid-empty');
    expect(invalidFocus.boxShadow).toBe(fieldColors(tokens, 'invalid').boxShadow);
    expect(invalidFocus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'invalid+focus', invalidFocus);
    await page.focus('#cond-readonly-empty');
    const readonlyFocus = await measure(page, '#cond-readonly-empty');
    expect(readonlyFocus.boxShadow).toBe(fieldColors(tokens, 'readonly').boxShadow);
    expect(readonlyFocus.outline).toBe(ring(tokens));
    await page.locator('#cond-readonly-empty').evaluate((el) => (el as HTMLInputElement).blur());
  }
  report.write('input-text');
});

test('transitions follow the motion tokens and stop under reduced motion; forced colors keep the boundary', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#cond-default-empty >> xpath=..');
  await expect(container).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await expect(container).toHaveCSS('transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(container).toHaveCSS('outline-style', 'solid');
  await expect(container).toHaveCSS('outline-width', '1px');
  await page.focus('#cond-default-empty');
  await expect(container).toHaveCSS('outline-width', '2px');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'input-text');
});
