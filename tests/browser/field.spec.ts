import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
  densities,
  px,
  rgb,
  setContext,
  settle,
  tokensFor,
  type TokenMap
} from './helpers.ts';

const out = 'reports/components/field/svelte';

/** Computed values of one field: colors, typography and the gaps between its parts. */
async function measure(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((field) => {
    const part = (name: string) => field.querySelector(`.ggb-field__${name}`) as HTMLElement | null;
    const box = (el: HTMLElement | null) => el?.getBoundingClientRect();
    const label = part('label')!;
    const description = part('description');
    const control = part('control')!;
    const message = part('message');
    const icon = field.querySelector('.ggb-field__messageIcon') as SVGElement | null;
    const text = part('messageText');
    const style = (el: Element | null) => (el ? getComputedStyle(el) : null);
    const iconBox = icon?.getBoundingClientRect();
    const textLine = text ? parseFloat(getComputedStyle(text).lineHeight) : 0;
    return {
      labelColor: style(label)!.color,
      labelFont: `${style(label)!.fontWeight} ${style(label)!.fontSize}`,
      requiredColor: style(part('requiredIndicator'))?.color ?? '',
      descriptionColor: style(description)?.color ?? '',
      descriptionFont: description ? `${style(description)!.fontWeight} ${style(description)!.fontSize}` : '',
      messageColor: style(message)?.color ?? '',
      messageFont: message ? `${style(message)!.fontWeight} ${style(message)!.fontSize}` : '',
      iconColor: style(icon)?.color ?? '',
      iconSize: iconBox?.width ?? 0,
      descriptionGap: description ? box(description)!.top - box(label)!.bottom : null,
      controlGap: box(control)!.top - (box(description) ?? box(label))!.bottom,
      messageGap: message ? box(message)!.top - box(control)!.bottom : null,
      iconToText: iconBox && text ? text.getBoundingClientRect().left - (iconBox.right - iconBox.width / 8) : null,
      iconLineOffset:
        iconBox && text ? iconBox.top + iconBox.height / 2 - (text.getBoundingClientRect().top + textLine / 2) : null
    };
  });
}

const font = (tokens: TokenMap, path: string) => {
  const v = tokens[path].$value as { fontWeight: number; fontSize: { value: number } };
  return `${v.fontWeight} ${v.fontSize.value}px`;
};

test.beforeEach(async ({ page }) => {
  await page.goto('/field/');
  await page.evaluate(() => document.fonts.ready);
});

test('the label names each control, description and message describe it; a press on the label focuses a text entry', async ({
  page
}) => {
  const input = await accessible(page, '#play-control');
  expect(input.name).toBe('Work email');
  expect(input.description).toBe('We send invoices to this address.');
  expect(input.properties.required).toBe(true);
  await page.click('#play-label');
  await expect(page.locator('#play-control')).toBeFocused();
  await page.check('#opt-invalid');
  const invalid = await accessible(page, '#play-control');
  expect(invalid.description).toBe('We send invoices to this address. Enter an email address like name@example.com.');
  expect(invalid.properties.invalid).toBe('true');
  await page.selectOption('#opt-control', 'textarea');
  expect((await accessible(page, '#play-control')).name).toBe('Work email');
  await page.selectOption('#opt-control', 'radio-group');
  const group = await accessible(page, '#play-control');
  expect(group.role).toBe('radiogroup');
  expect(group.name).toBe('Work email');
  await expect(page.locator('#play-label')).not.toHaveAttribute('for');
  await page.selectOption('#opt-control', 'checkbox');
  const checkbox = await accessible(page, '#play-control');
  expect(checkbox.name).toBe('I agree to receive invoices by email');
  expect(checkbox.description).toBe('We send invoices to this address. Enter an email address like name@example.com.');
  const wrapper = await accessible(page, '#play .ggb-checkbox__group');
  expect(wrapper).toMatchObject({ role: 'group', name: 'Work email' });
  // A press on the field label does not toggle the checkbox (it names the question).
  await page.click('#play-label');
  await expect(page.locator('#play-control')).toHaveAttribute('aria-checked', 'false');
});

test('required, invalid and disabled reach the control; the message appears only while invalid', async ({ page }) => {
  await expect(page.locator('#play .ggb-field__requiredIndicator')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#play .ggb-field__message')).toHaveCount(0);
  await page.check('#opt-disabled');
  await expect(page.locator('#play-control')).toBeDisabled();
  await page.uncheck('#opt-disabled');
  await page.uncheck('#opt-required');
  await expect(page.locator('#play .ggb-field__requiredIndicator')).toHaveCount(0);
  expect((await accessible(page, '#play-control')).properties.required).toBeFalsy();
  // Form section: submitting empty shows every message; fixing a value removes its message.
  await page.click('#form-submit');
  await expect(page.locator('#form .ggb-field__message')).toHaveCount(4);
  await page.fill('#form-name input', 'Ada');
  await expect(page.locator('#form-name .ggb-field__message')).toHaveCount(0);
  await expect(page.locator('#form-team [role="radiogroup"]')).toHaveAttribute('aria-invalid', 'true');
});

test('gaps follow density, typography does not; the message icon sits on the first line', async ({ page }) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    const m = await measure(page, 'state-invalid');
    expect(m.descriptionGap, density).toBeCloseTo(px(tokens['space.content.xs']), 1);
    expect(m.controlGap).toBeCloseTo(px(tokens['space.content.sm']), 1);
    expect(m.messageGap).toBeCloseTo(px(tokens['space.content.xs']), 1);
    expect(m.iconToText).toBeCloseTo(px(tokens['space.content.xs']), 1);
    expect(m.iconSize).toBe(px(tokens['size.icon.sm']));
    expect(Math.abs(m.iconLineOffset!)).toBeLessThanOrEqual(0.5);
    expect(m.labelFont).toBe(font(tokens, 'typography.label.md'));
    expect(m.descriptionFont).toBe(font(tokens, 'typography.body.sm'));
    expect(m.messageFont).toBe(font(tokens, 'typography.body.sm'));
    // The field text does not change with the control size.
    expect((await measure(page, 'size-sm')).labelFont).toBe(m.labelFont);
    expect((await measure(page, 'size-lg')).labelFont).toBe(m.labelFont);
  }
  // Long texts wrap; the icon stays on the first line of a wrapped message.
  expect(Math.abs((await measure(page, 'long')).iconLineOffset!)).toBeLessThanOrEqual(0.5);
});

test('computed colors match the resolved tokens in every context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const invalid = await measure(page, 'state-invalid');
    expect(invalid.labelColor, context).toBe(rgb(tokens['color.content.primary']));
    expect(invalid.requiredColor).toBe(rgb(tokens['color.content.secondary']));
    expect(invalid.descriptionColor).toBe(rgb(tokens['color.content.secondary']));
    expect(invalid.messageColor).toBe(rgb(tokens['color.status.danger.content']));
    expect(invalid.iconColor).toBe(rgb(tokens['color.status.danger.icon']));
    report.add(context, { required: true, invalid: true }, 'default', invalid);
    const disabled = await measure(page, 'state-disabled');
    for (const color of [disabled.labelColor, disabled.requiredColor, disabled.descriptionColor])
      expect(color).toBe(rgb(tokens['color.content.disabled']));
    report.add(context, { required: true, disabled: true }, 'disabled', disabled);
  }
  report.write('field');
});

test('forced colors keep the label, description and message readable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#state-invalid .ggb-field__messageIcon')).toBeVisible();
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await page.click('#form-submit');
  await auditAndCapture(page, 'field');
});
