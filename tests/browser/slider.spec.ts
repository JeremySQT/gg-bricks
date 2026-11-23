import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
  px,
  representative,
  rgb,
  setContext,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/slider/svelte';
const thumb = (id: string) => `#${id}`;

/** Computed values of one slider: colors and geometry of the track, range and thumb, value text. */
async function measure(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((t) => {
    const root = t.closest('.ggb-slider') as HTMLElement;
    const control = root.querySelector('.ggb-slider__control') as HTMLElement;
    const track = root.querySelector('.ggb-slider__track') as HTMLElement;
    const range = root.querySelector('.ggb-slider__range') as HTMLElement;
    const ts = getComputedStyle(t);
    const r = root.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const cr = control.getBoundingClientRect();
    const kr = track.getBoundingClientRect();
    const value = root.querySelector('.ggb-slider__value') as HTMLElement | null;
    return {
      height: r.height,
      trackColor: getComputedStyle(track).backgroundColor,
      trackThickness: kr.height,
      trackRadius: getComputedStyle(track).borderTopLeftRadius,
      rangeColor: getComputedStyle(range).backgroundColor,
      rangeWidth: range.getBoundingClientRect().width,
      thumbFill: ts.backgroundColor,
      thumbBorder: ts.borderTopColor,
      thumbBorderWidth: ts.borderTopWidth,
      thumbShadow: ts.boxShadow,
      thumbSize: tr.width,
      thumbCenterOffset: tr.left + tr.width / 2 - cr.left,
      thumbCenterY: tr.top + tr.height / 2 - r.top,
      controlStart: cr.left - r.left,
      controlWidth: cr.width,
      outline: `${ts.outlineStyle} ${ts.outlineWidth} ${ts.outlineColor} ${ts.outlineOffset}`,
      valueColor: value ? getComputedStyle(value).color : '',
      valueWidth: value?.getBoundingClientRect().width ?? 0,
      valueFont: value ? getComputedStyle(value).fontSize : ''
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/slider/');
  await page.evaluate(() => document.fonts.ready);
});

test('the thumb is a slider named by the Field label, with value, bounds and value text', async ({ page }) => {
  const a = await accessible(page, thumb('play'));
  expect(a.role).toBe('slider');
  expect(a.name).toBe('Volume');
  expect(a.description).toBe('Applies to every speaker.');
  await expect(page.locator(thumb('play'))).toHaveAttribute('aria-valuenow', '40');
  await expect(page.locator(thumb('play'))).toHaveAttribute('aria-valuetext', '40');
  await expect(page.locator(thumb('locale-fr'))).toHaveAttribute('aria-valuetext', '0,5');
  expect((await accessible(page, thumb('cond-default'))).name).toBe('Brightness (default)');
  // The thumb is the only tab stop of the slider; disabled sliders are skipped.
  await expect(page.locator('#cond-disabled')).not.toHaveAttribute('tabindex', '0');
});

test('keyboard: arrows by one step, Page keys by ten, Home and End; one change and one commit per key', async ({
  page
}) => {
  await page.focus(thumb('play'));
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('value')).toHaveText('Value: 41');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('PageUp');
  await expect(page.getByTestId('value')).toHaveText('Value: 52');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('value')).toHaveText('Value: 40');
  await page.keyboard.press('End');
  await expect(page.getByTestId('value')).toHaveText('Value: 100');
  await page.keyboard.press('ArrowRight'); // at max: no change, no commit
  await page.keyboard.press('Home');
  await expect(page.getByTestId('value')).toHaveText('Value: 0');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 8');
  await expect(page.getByTestId('commits')).toHaveText('Commits: 8');
  // Max is reachable when the range is not a multiple of the step: 0, 3, 6, 9, 10.
  await page.focus(thumb('thirds'));
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('thirds')).toHaveText('Value: 10');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('thirds')).toHaveText('Value: 9');
  // Right to left: Left increases.
  await page.focus(thumb('rtl'));
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator(thumb('rtl'))).toHaveAttribute('aria-valuenow', '26');
  // The consumer's onkeydown runs before the component's, which still handles the key.
  await page.focus(thumb('consumer'));
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('consumer-keys')).toHaveText('Keys seen by the application: 1');
  await expect(page.locator(thumb('consumer'))).toHaveAttribute('aria-valuenow', '11');
});

test('pointer: a press jumps, a drag follows step by step, the release commits once', async ({ page }) => {
  const control = (await page.locator('#play >> xpath=..').boundingBox())!;
  const y = control.y + control.height / 2;
  await page.mouse.move(control.x + control.width * 0.75, y);
  await page.mouse.down();
  await expect(page.getByTestId('value')).toHaveText('Value: 75');
  await expect(page.locator(thumb('play'))).toBeFocused();
  await expect(page.getByTestId('commits')).toHaveText('Commits: 0');
  await page.mouse.move(control.x + control.width * 0.2, y, { steps: 5 });
  await expect(page.getByTestId('value')).toHaveText('Value: 20');
  await expect(page.locator('#play >> xpath=../..')).toHaveAttribute('data-dragging', '');
  // Beyond the end the value stays at the bound.
  await page.mouse.move(control.x - 40, y);
  await expect(page.getByTestId('value')).toHaveText('Value: 0');
  await page.mouse.up();
  await expect(page.getByTestId('commits')).toHaveText('Commits: 1');
  await expect(page.getByTestId('last-commit')).toHaveText('Last commit: 0');
  // A press in the half-thumb inset at the end of the track goes to max.
  await page.mouse.click(control.x + control.width + 6, y);
  await expect(page.getByTestId('value')).toHaveText('Value: 100');
  // A disabled slider ignores the pointer.
  const disabled = (await page.locator('#cond-disabled >> xpath=..').boundingBox())!;
  await page.mouse.click(disabled.x + 4, disabled.y + disabled.height / 2);
  await expect(page.locator(thumb('cond-disabled'))).toHaveAttribute('aria-valuenow', '60');
});

test('a value set by the application is shown within the range, kept and not emitted; the form submits', async ({
  page
}) => {
  await expect(page.locator(thumb('outside'))).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByTestId('outside')).toHaveText('Value: 150');
  await page.click('#submit');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted: zoom=1.5');
});

test('geometry: 44 px tall, thumb at the value with half a thumb of inset, value width reserved', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  for (const id of ['cond-min', 'cond-default', 'cond-max']) {
    const m = await measure(page, id);
    const fraction = { 'cond-min': 0, 'cond-default': 0.6, 'cond-max': 1 }[id]!;
    expect(m.height).toBe(px(tokens['size.target.min']));
    expect(m.thumbSize).toBe(px(tokens['component.slider.thumb-size']));
    expect(m.trackThickness).toBe(px(tokens['component.slider.track-thickness']));
    expect(m.controlStart).toBe(m.thumbSize / 2);
    expect(m.thumbCenterOffset).toBeCloseTo(fraction * m.controlWidth, 0);
    expect(m.thumbCenterY).toBeCloseTo(m.height / 2, 0);
    expect(m.rangeWidth).toBeCloseTo(fraction * m.controlWidth, 0);
  }
  // The value text keeps the width of the widest bound: the track does not move as the value changes.
  const before = await measure(page, 'price');
  await page.focus(thumb('price'));
  for (let i = 0; i < 16; i++) await page.keyboard.press('ArrowRight');
  const after = await measure(page, 'price');
  expect(after.valueWidth).toBe(before.valueWidth);
  expect(after.controlWidth).toBe(before.controlWidth);
  // The thumb's target is 44 px: 20 px above its center still grabs it.
  await page.locator(thumb('cond-default')).scrollIntoViewIfNeeded();
  const t = (await page.locator(thumb('cond-default')).boundingBox())!;
  await page.mouse.click(t.x + t.width / 2, t.y + t.height / 2 - 20);
  await expect(page.locator(thumb('cond-default'))).toBeFocused();
});

test('computed values match the resolved tokens in every context; hover, focus and disabled', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  const expected = (tokens: ReturnType<typeof tokensFor>, condition: string) => ({
    trackColor: rgb(tokens[`color.choice.off.${condition}.border`]),
    rangeColor: rgb(tokens[`color.choice.on.${condition}.surface`]),
    thumbFill: rgb(tokens[`color.choice.off.${condition}.surface`]),
    thumbBorder: rgb(tokens[`color.choice.on.${condition}.surface`])
  });
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.mouse.move(0, 0);
    for (const condition of ['default', 'disabled']) {
      const m = await measure(page, `cond-${condition}`);
      expect(
        { trackColor: m.trackColor, rangeColor: m.rangeColor, thumbFill: m.thumbFill, thumbBorder: m.thumbBorder },
        `${context} ${condition}`
      ).toEqual(expected(tokens, condition));
      expect(m.thumbBorderWidth).toBe(`${px(tokens['border.width.strong'])}px`);
      expect(m.valueColor).toBe(
        rgb(tokens[condition === 'disabled' ? 'color.content.disabled' : 'color.content.primary'])
      );
      expect(m.valueFont).toBe(
        `${(tokens['typography.numeral.sm'].$value as { fontSize: { value: number } }).fontSize.value}px`
      );
      expect(m.height).toBe(px(tokens['size.target.min']));
      report.add(context, {}, condition, m);
    }
  }
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.hover('#cond-default >> xpath=../../..');
    const hover = await measure(page, 'cond-default');
    expect({
      trackColor: hover.trackColor,
      rangeColor: hover.rangeColor,
      thumbFill: hover.thumbFill,
      thumbBorder: hover.thumbBorder
    }).toEqual(expected(tokens, 'hover'));
    report.add(context, {}, 'hover', hover);
    await page.mouse.move(0, 0);
    await page.focus(thumb('cond-default'));
    const focus = await measure(page, 'cond-default');
    expect(focus.outline).toBe(
      `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
    );
    report.add(context, {}, 'focus', focus);
    await page.locator(thumb('cond-default')).blur();
  }
  report.write('slider');
});

test('motion: a jump transitions, a drag does not, reduced motion stops it; forced colors', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  const t = page.locator(thumb('cond-default'));
  await expect(t).toHaveCSS('transition-duration', `${px(tokens['motion.duration.fast']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(t).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const sys = (c: string) => ((probe.style.color = c), getComputedStyle(probe).color);
    const result = { highlight: sys('Highlight'), text: sys('CanvasText'), gray: sys('GrayText') };
    probe.remove();
    const q = (s: string) => getComputedStyle(document.querySelector(s)!);
    return {
      ...result,
      track: q('#cond-default ~ * .ggb-slider__track, .ggb-slider:has(#cond-default) .ggb-slider__track')
        .backgroundColor,
      range: q('.ggb-slider:has(#cond-default) .ggb-slider__range').backgroundColor,
      thumbBorder: q('#cond-default').borderTopColor,
      disabledTrack: q('.ggb-slider:has(#cond-disabled) .ggb-slider__track').backgroundColor,
      disabledValue: q('.ggb-slider:has(#cond-disabled) .ggb-slider__value').color
    };
  });
  expect(colors.track).toBe(colors.text);
  expect(colors.range).toBe(colors.highlight);
  expect(colors.thumbBorder).toBe(colors.highlight);
  expect(colors.disabledTrack).toBe(colors.gray);
  expect(colors.disabledValue).toBe(colors.gray);
  await page.focus(thumb('cond-default'));
  await expect(t).toHaveCSS('outline-style', 'solid');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'slider');
});
