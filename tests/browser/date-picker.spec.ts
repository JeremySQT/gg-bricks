import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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

const out = 'reports/components/date-picker/svelte';
const seg = (id: string, part: string) => `#${id} [data-segment="${part}"]`;
const button = (id: string) => `#${id} .ggb-date-picker__button`;
const panel = '.ggb-date-picker__panel:popover-open';
const day = (iso: string) => `${panel} [data-bits-day][data-value^="${iso}"]`;

async function openCalendar(page: Page, id: string) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.click(button(id));
  await expect(page.locator(panel)).toBeVisible();
}
const focusedDay = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement)?.dataset.value);

/** Computed values of one date picker field: colors, ring, geometry, the calendar button. */
async function measure(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((field) => {
    const c = getComputedStyle(field);
    const r = field.getBoundingClientRect();
    const btn = field.querySelector('.ggb-date-picker__button') as HTMLElement;
    const after = getComputedStyle(btn, '::after');
    const size = parseFloat(after.width);
    const b = btn.getBoundingClientRect();
    const segments = field.querySelector('.ggb-date-picker__segments') as HTMLElement;
    const first = field.querySelector('[data-segment]') as HTMLElement;
    return {
      surface: c.backgroundColor,
      content: getComputedStyle(field.querySelector('[role="spinbutton"]:not([data-empty])') ?? first).color,
      placeholder: getComputedStyle(field.querySelector('[data-empty]') ?? segments).color,
      boxShadow: c.boxShadow,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      height: r.height,
      fontSize: getComputedStyle(segments).fontSize,
      textStart: first.getBoundingClientRect().left - r.left,
      buttonSize: size,
      buttonFill: after.backgroundColor,
      buttonIcon: getComputedStyle(btn).color,
      iconSize: btn.querySelector('svg')!.getBoundingClientRect().width,
      buttonEndInset: r.right - (b.right - (b.width - size) / 2)
    };
  });
}

const fieldColors = (tokens: TokenMap, condition: string) => ({
  surface: rgb(tokens[`color.input.${condition}.surface`]),
  boxShadow: insetBorder(tokens[`color.input.${condition}.border`], tokens['border.width.default']),
  placeholder: rgb(tokens[`color.input.${condition}.placeholder`])
});

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T10:00:00'));
  await page.goto('/date-picker/');
  await page.evaluate(() => document.fonts.ready);
});

test('names: a group, spin buttons named by the label and the part, a calendar button, a dialog named by the month', async ({
  page
}) => {
  const group = await accessible(page, '#play');
  expect(group.role).toBe('group');
  expect(group.name).toBe('Appointment');
  const month = await accessible(page, seg('play', 'month'));
  expect(month.role).toBe('spinbutton');
  expect(month.name).toBe('Appointment month');
  expect(month.description).toBe('Day of your visit.');
  const btn = await accessible(page, button('play'));
  expect(btn.role).toBe('button');
  expect(btn.name).toBe('Choose date');
  await expect(page.locator(button('play'))).toHaveAttribute('aria-expanded', 'false');
  await page.selectOption('#opt-locale', 'fr');
  expect((await accessible(page, seg('play', 'year'))).name).toBe('Appointment année');
  await expect(page.locator('#play .ggb-date-picker__segments')).toHaveText('23/11/2026');
  // Empty parts expose no value; a date outside min..max is not marked invalid by the component.
  await expect(page.locator(seg('cond-default-empty', 'day'))).not.toHaveAttribute('aria-valuenow', /.*/);
  await openCalendar(page, 'play');
  await expect(page.locator(button('play'))).toHaveAttribute('aria-expanded', 'true');
  const dialog = await accessible(page, panel);
  expect(dialog.role).toBe('dialog');
  expect(dialog.name).toBe('novembre 2026');
  expect((await accessible(page, day('2026-11-23'))).name).toBe('lundi 23 novembre 2026');
  await expect(page.locator(`${panel} .ggb-date-picker__weekday`).first()).toHaveText('lun.');
  await expect(page.locator(`${panel} .ggb-date-picker__weekday`).first()).toHaveAttribute('aria-label', 'lundi');
});

test('typing: digits fill the parts in the order of the locale; the value is set when complete, cleared by Backspace', async ({
  page
}) => {
  await page.locator(seg('cond-default-empty', 'month')).click();
  await page.keyboard.type('07142026');
  await expect(page.locator('#cond-default-empty .ggb-date-picker__segments')).toHaveText('07/14/2026');
  // The playground: clear one part, then type it again.
  await page.locator(seg('play', 'day')).click();
  await page.keyboard.press('Backspace');
  await expect(page.getByTestId('value')).toHaveText('Value: “”');
  await page.keyboard.type('5');
  await expect(page.getByTestId('value')).toHaveText('Value: “2026-11-05”');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 2');
  // 5 cannot take a second digit: focus moved on to the year; Left comes back to the day.
  await expect(page.locator(seg('play', 'year'))).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('value')).toHaveText('Value: “2026-11-06”');
  // Tab goes from the parts to the calendar button.
  await page.locator(seg('play', 'year')).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator(button('play'))).toBeFocused();
});

test('calendar keyboard: arrows, Page keys by month and year, Home and End, Enter chooses and returns focus', async ({
  page
}) => {
  await openCalendar(page, 'play');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-23');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-24');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedDay(page)).toBe('2026-12-01');
  await expect(page.locator(`${panel} .ggb-date-picker__heading`)).toHaveText('December 2026');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-23');
  await page.keyboard.press('Home');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-22'); // Sunday starts the week in English
  await page.keyboard.press('End');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-28');
  await page.keyboard.press('PageDown');
  await expect.poll(() => focusedDay(page)).toBe('2026-12-28');
  await page.keyboard.press('Shift+PageUp');
  await expect.poll(() => focusedDay(page)).toBe('2025-12-28');
  await page.keyboard.press('Shift+PageDown');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('PageUp');
  await expect.poll(() => focusedDay(page)).toBe('2026-09-28');
  await page.keyboard.press('Enter');
  await expect(page.locator(panel)).toHaveCount(0);
  await expect(page.getByTestId('value')).toHaveText('Value: “2026-09-28”');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
  await expect(page.locator(button('play'))).toBeFocused();
  // The last day of a shorter month: 31 January, Page Down, 28 February.
  await page.click('#set-clear');
  await page.locator(seg('external', 'month')).click();
  await page.keyboard.type('01312026');
  await openCalendar(page, 'external');
  await expect.poll(() => focusedDay(page)).toBe('2026-01-31');
  await page.keyboard.press('PageDown');
  await expect.poll(() => focusedDay(page)).toBe('2026-02-28');
  await page.keyboard.press('Escape');
  await expect(page.locator(panel)).toHaveCount(0);
  await expect(page.locator(button('external'))).toBeFocused();
  await expect(page.getByTestId('external')).toHaveText('Value: “2026-01-31”');
});

test('month buttons keep focus; Tab moves through the panel and leaving it closes; a press outside closes', async ({
  page
}) => {
  await openCalendar(page, 'play');
  // Order in the panel: previous month, next month, the grid.
  await expect.poll(() => focusedDay(page)).toBe('2026-11-23');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe('Previous month');
  await page.keyboard.press('Enter');
  await expect(page.locator(`${panel} .ggb-date-picker__heading`)).toHaveText('October 2026');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe('Previous month');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator(`${panel} .ggb-date-picker__heading`)).toHaveText('November 2026');
  await page.keyboard.press('Tab'); // into the grid
  await expect.poll(() => focusedDay(page)).toBeTruthy();
  await page.keyboard.press('Tab'); // out of the panel
  await expect(page.locator(panel)).toHaveCount(0);
  await expect(page.getByTestId('open')).toHaveText('Open: false');
  await openCalendar(page, 'play');
  await page.mouse.click(5, 5);
  await expect(page.locator(panel)).toHaveCount(0);
  // A press on the button toggles it closed again; opening from the application emits nothing.
  await openCalendar(page, 'play');
  await page.click(button('play'));
  await expect(page.locator(panel)).toHaveCount(0);
  await expect(page.getByTestId('opens')).toHaveText('Opens: 3');
  await page.click('#opt-open');
  await expect(page.locator(panel)).toBeVisible();
  await expect(page.getByTestId('opens')).toHaveText('Opens: 3');
});

test('bounds: days outside min..max are disabled and never focused; month buttons disabled at the bounds', async ({
  page
}) => {
  await openCalendar(page, 'bounded');
  await expect(page.locator(day('2026-11-09'))).toHaveAttribute('data-disabled', '');
  await expect(page.locator(day('2026-11-09'))).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled();
  await page.click(day('2026-11-09'), { force: true });
  await expect(page.getByTestId('bounded')).toHaveText('Value: “2026-11-23”');
  await expect(page.locator(panel)).toBeVisible(); // a disabled day is not chosen and does not close the calendar
  await page.focus(day('2026-11-23'));
  await page.keyboard.press('PageUp');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-10');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await expect.poll(() => focusedDay(page)).toBe('2026-12-10');
  await expect(page.getByRole('button', { name: 'Next month' })).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('bounded')).toHaveText('Value: “2026-12-10”');
});

test('today, the first day of the week, Gregorian Thai, right to left', async ({ page }) => {
  await openCalendar(page, 'cond-default-empty');
  await expect(page.locator(day('2026-11-23'))).toHaveAttribute('data-today', '');
  await expect.poll(() => focusedDay(page)).toBe('2026-11-23');
  await page.keyboard.press('Escape');
  await openCalendar(page, 'locale-th-TH');
  await expect(page.locator(`${panel} .ggb-date-picker__heading`)).toContainText('2026');
  await page.keyboard.press('Escape');
  await openCalendar(page, 'locale-de');
  await expect(page.locator(`${panel} .ggb-date-picker__weekday`).first()).toHaveText('Mo');
  await page.keyboard.press('Escape');
  await openCalendar(page, 'locale-ar-EG');
  await expect(page.locator(`${panel} .ggb-date-picker__weekday`).first()).toHaveText('س');
  await page.keyboard.press('Escape');
  await openCalendar(page, 'rtl');
  await expect.poll(() => focusedDay(page)).toBe('2026-07-14');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedDay(page)).toBe('2026-07-15');
  const d14 = (await page.locator(day('2026-07-14')).boundingBox())!;
  const d15 = (await page.locator(day('2026-07-15')).boundingBox())!;
  expect(d15.x).toBeLessThan(d14.x);
});

test('value set by the application, form submission, a press beside the parts', async ({ page }) => {
  await page.click('#set-leap');
  await expect(page.locator('#external .ggb-date-picker__segments')).toHaveText('02/29/2028');
  await page.click('#set-bad');
  await expect(page.locator(seg('external', 'day'))).toHaveText('dd');
  await page.click('#submit');
  await expect(page.getByTestId('submitted')).toHaveText('Submitted: arrival=2026-12-24&booked=2026-11-02');
  await page.locator('#cond-default').scrollIntoViewIfNeeded();
  const box = (await page.locator('#cond-default').boundingBox())!;
  await page.mouse.click(box.x + box.width - 60, box.y + box.height / 2);
  await expect(page.locator(seg('cond-default', 'month'))).toBeFocused();
  // Readonly: parts focusable, not editable, button disabled.
  await page.locator(seg('cond-readonly', 'day')).focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#cond-readonly .ggb-date-picker__segments')).toHaveText('07/14/2026');
  await expect(page.locator(button('cond-readonly'))).toBeDisabled();
  await expect(page.locator(button('cond-disabled'))).toBeDisabled();
});

test('geometry: field like InputText, button one step smaller with equal insets, 44 px day cells', async ({ page }) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    await settle(page);
    for (const size of sizes) {
      const m = await measure(page, `size-${size}`);
      const text = (await page.locator(`#text-${size} >> xpath=..`).boundingBox())!;
      expect(m.height, `${density} ${size}`).toBe(px(tokens[`size.control.${size}`]));
      expect(m.height).toBe(text.height);
      expect(m.buttonSize).toBe(px(tokens[`size.control.nested.${size}`]));
      expect(m.iconSize).toBe(px(tokens[`size.icon.${size}`]));
      expect(m.buttonEndInset).toBeCloseTo((m.height - m.buttonSize) / 2, 1);
      expect(m.textStart).toBeCloseTo(px(tokens[`space.control.padding-inline.${size}`]), 1);
    }
    await openCalendar(page, 'play');
    const geo = await page.locator(panel).evaluate((p) => {
      const cell = p.querySelector('.ggb-date-picker__cell') as HTMLElement;
      const d = p.querySelector('.ggb-date-picker__day') as HTMLElement;
      return {
        width: p.getBoundingClientRect().width,
        padding: parseFloat(getComputedStyle(p).paddingLeft),
        cell: cell.getBoundingClientRect().width,
        cellHeight: cell.getBoundingClientRect().height,
        dayBox: d.getBoundingClientRect().width,
        rows: p.querySelectorAll('tbody tr').length
      };
    });
    expect(geo.cell).toBe(px(tokens['size.target.min']));
    expect(geo.cellHeight).toBe(px(tokens['size.target.min']));
    expect(geo.dayBox).toBe(px(tokens['size.control.sm']));
    expect(geo.padding).toBe(px(tokens['space.content.sm']));
    expect(geo.width).toBe(7 * geo.cell + 2 * geo.padding);
    expect(geo.rows).toBe(6);
    await page.keyboard.press('Escape');
  }
});

test('computed values match the resolved tokens: field conditions, button, panel and days, in every context', async ({
  page
}) => {
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
      expect(m.fontSize).toBe(
        `${(tokens[`typography.body.${size}`].$value as { fontSize: { value: number } }).fontSize.value}px`
      );
      expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
      expect(m.buttonIcon).toBe(rgb(tokens['color.action.neutral.ghost.default.content']));
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
    await page.locator(seg('cond-default', 'day')).focus();
    const focus = await measure(page, 'cond-default');
    expect(focus.boxShadow).toBe(fieldColors(tokens, 'focus').boxShadow);
    expect(focus.outline).toBe(ring(tokens));
    report.add(context, { size: 'md' }, 'focus', focus);
    // The calendar: panel, weekday, default, hover, selected, today and disabled days.
    await openCalendar(page, 'bounded');
    const cal = await page.locator(panel).evaluate((p) => {
      const s = (el: Element | null) => (el ? getComputedStyle(el) : null);
      const dayStyle = (v: string) => s(p.querySelector(`[data-bits-day][data-value^="${v}"]`))!;
      return {
        panelSurface: s(p)!.backgroundColor,
        panelShadow: s(p)!.boxShadow,
        panelRadius: s(p)!.borderTopLeftRadius,
        heading: s(p.querySelector('.ggb-date-picker__heading'))!.color,
        weekday: s(p.querySelector('.ggb-date-picker__weekday'))!.color,
        dayDefault: [dayStyle('2026-11-12').backgroundColor, dayStyle('2026-11-12').color],
        daySelected: [dayStyle('2026-11-23').backgroundColor, dayStyle('2026-11-23').color],
        today: dayStyle('2026-11-23').boxShadow,
        dayDisabled: dayStyle('2026-11-05').color,
        dayRadius: dayStyle('2026-11-12').borderTopLeftRadius,
        dayFont: dayStyle('2026-11-12').fontSize
      };
    });
    expect(cal.panelSurface).toBe(rgb(tokens['color.surface.overlay']));
    expect(cal.panelShadow).toContain(rgb(tokens['color.elevation.border']));
    expect(cal.panelRadius).toBe(`${px(tokens['radius.overlay'])}px`);
    expect(cal.heading).toBe(rgb(tokens['color.content.primary']));
    expect(cal.weekday).toBe(rgb(tokens['color.content.secondary']));
    expect(cal.dayDefault).toEqual([
      rgb(tokens['color.item.default.surface']),
      rgb(tokens['color.item.default.content'])
    ]);
    expect(cal.daySelected).toEqual([
      rgb(tokens['color.choice.on.default.surface']),
      rgb(tokens['color.choice.on.default.content'])
    ]);
    expect(cal.today).toBe(
      `${rgb(tokens['color.choice.on.default.content'])} 0px 0px 0px ${px(tokens['border.width.strong'])}px inset`
    );
    expect(cal.dayDisabled).toBe(rgb(tokens['color.item.disabled.content']));
    expect(cal.dayRadius).toBe(`${px(tokens['radius.full'])}px`);
    await page.hover(day('2026-11-12'));
    const hover = await page
      .locator(day('2026-11-12'))
      .evaluate((d) => [getComputedStyle(d).backgroundColor, getComputedStyle(d).color]);
    expect(hover).toEqual([rgb(tokens['color.item.hover.surface']), rgb(tokens['color.item.hover.content'])]);
    // The focused day draws the focus ring outside its box.
    const dayRing = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} ${s.outlineOffset}`;
    });
    expect(dayRing).toBe(ring(tokens));
    report.add(context, {}, 'calendar', { ...cal, hover, dayRing });
    await page.keyboard.press('Escape');
  }
  report.write('date-picker');
});

test('forced colors: selected day and focused part in Highlight, disabled in GrayText; motion; axe with the calendar open', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  await expect(page.locator('#cond-default-empty')).toHaveCSS(
    'transition-duration',
    `${px(tokens['motion.duration.fast']) / 1000}s`
  );
  // Axe with the calendar open, light and dark.
  for (const mode of ['light', 'dark']) {
    await page.selectOption('#ctx-mode', mode);
    await openCalendar(page, 'bounded');
    const results = await new AxeBuilder({ page })
      .include('.ggb-date-picker__panel')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const violations = results.violations
      .filter((v) => v.id !== 'color-contrast' || v.nodes.some((n) => !String(n.target).includes('data-disabled')))
      .flatMap((v) => v.nodes.map((n) => `${mode} ${v.id}: ${n.target}`));
    expect(violations).toEqual([]);
    await page.keyboard.press('Escape');
  }
  await page.selectOption('#ctx-mode', 'light');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openCalendar(page, 'bounded');
  await page.waitForTimeout(50);
  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const sys = (c: string) => ((probe.style.color = c), getComputedStyle(probe).color);
    const result = { highlight: sys('Highlight'), highlightText: sys('HighlightText'), gray: sys('GrayText') };
    probe.remove();
    const p = document.querySelector('.ggb-date-picker__panel:popover-open')!;
    const sel = getComputedStyle(p.querySelector('[data-bits-day][data-selected]')!);
    const dis = getComputedStyle(p.querySelector('[data-bits-day][data-disabled]')!);
    return {
      ...result,
      selFill: sel.backgroundColor,
      selText: sel.color,
      adjust: sel.getPropertyValue('forced-color-adjust'),
      disabled: dis.color
    };
  });
  expect(colors.selFill).toBe(colors.highlight);
  expect(colors.selText).toBe(colors.highlightText);
  expect(colors.adjust).toBe('none');
  expect(colors.disabled).toBe(colors.gray);
  await capture(page, `${out}/forced-colors.png`, { fullPage: false });
});

test('a 320 px screen: the seven columns share the room inside the panel, nothing is cut', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openCalendar(page, 'play');
  const box = await page.locator(panel).evaluate((p) => {
    const r = p.getBoundingClientRect();
    const last = p.querySelector('tbody tr td:last-child')!.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      overflow: p.scrollWidth - p.clientWidth,
      lastRight: last.right,
      cell: last.width
    };
  });
  expect(box.overflow).toBeLessThanOrEqual(0);
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(320);
  expect(box.lastRight).toBeLessThanOrEqual(box.right);
  expect(box.cell).toBeLessThan(44);
  expect(box.cell).toBeGreaterThan(36);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'date-picker');
});
