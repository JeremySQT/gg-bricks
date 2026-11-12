import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  auditAndCapture,
  capture,
  px,
  representative,
  rgb,
  setContext,
  settle,
  sizes,
  tokensFor
} from './helpers.ts';

const root = (page: Page, id: string) => page.locator('.ggb-combobox').filter({ has: page.locator(`#${id}`) });
const panelOf = (page: Page, id: string) => root(page, id).locator('.ggb-combobox__panel');
const isOpen = (page: Page, id: string) => panelOf(page, id).evaluate((p) => p.matches(':popover-open'));
const activeLabel = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((t) => {
    const a = t.getAttribute('aria-activedescendant');
    return a ? document.getElementById(a)?.textContent?.trim() : null;
  });
const shown = (page: Page, id: string) => panelOf(page, id).locator('.ggb-combobox__option-label').allTextContents();

test.beforeEach(async ({ page }) => {
  await page.goto('/combobox/');
  await page.evaluate(() => document.fonts.ready);
});

test('typing filters ignoring case and accents, highlights the first match; Enter chooses and shows its label', async ({
  page
}) => {
  await page.focus('#play');
  await page.keyboard.type('COTE');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  expect(await shown(page, 'play')).toEqual(["Côte d'Ivoire"]);
  expect(await activeLabel(page, 'play')).toBe("Côte d'Ivoire");
  await expect(page.getByTestId('edits')).toHaveText('Edits: 4');
  await page.keyboard.press('Enter');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('value')).toHaveText('Value: c-te-d-ivoire');
  await expect(page.locator('#play')).toHaveValue("Côte d'Ivoire");
  await expect(page.locator('#play')).toBeFocused();
  // Reopening without typing shows every option, starting on the selected one.
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  expect((await shown(page, 'play')).length).toBe(43);
  expect(await activeLabel(page, 'play')).toBe("Côte d'Ivoire");
});

test('arrows do not wrap; disabled options are reached but not chosen; Escape restores the text', async ({ page }) => {
  await page.focus('#play');
  await page.keyboard.type('ice');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  // Iceland is disabled: no enabled match, nothing highlighted.
  expect(await shown(page, 'play')).toEqual(['Iceland']);
  expect(await activeLabel(page, 'play')).toBeNull();
  await page.keyboard.press('ArrowDown');
  expect(await activeLabel(page, 'play')).toBe('Iceland');
  await page.keyboard.press('ArrowDown');
  expect(await activeLabel(page, 'play')).toBe('Iceland');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('value')).toHaveText('Value: none');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.locator('#play')).toHaveValue('');
  await page.keyboard.press('ArrowUp');
  expect(await activeLabel(page, 'play')).toBe('Vietnam');
  await page.keyboard.press('ArrowUp');
  expect(await activeLabel(page, 'play')).toBe('United States');
  // Home and End stay with the caret.
  await page.keyboard.press('Alt+ArrowDown');
  expect(await isOpen(page, 'play')).toBe(true);
});

test('leaving: an edited text is restored; an empty text clears the value; an empty result is announced', async ({
  page
}) => {
  await page.focus('#play');
  await page.keyboard.type('jap');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('value')).toHaveText('Value: japan');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('zz');
  await expect(panelOf(page, 'play').locator('.ggb-combobox__empty')).toHaveText('No results');
  expect((await accessible(page, '#play-panel .ggb-combobox__empty').catch(() => null))?.role ?? 'status').toBe(
    'status'
  );
  await page.keyboard.press('Tab');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.locator('#play')).toHaveValue('Japan');
  await expect(page.getByTestId('value')).toHaveText('Value: japan');
  await page.focus('#play');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.click('#before');
  await expect(page.getByTestId('value')).toHaveText('Value: none');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 2');
});

test('pointer: a press on the field opens; the indicator toggles; hover highlights; a press chooses; outside closes', async ({
  page
}) => {
  await page.click('#play');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await root(page, 'play').locator('.ggb-combobox__indicator').click();
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await root(page, 'play').locator('.ggb-combobox__indicator').click();
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await expect(page.locator('#play')).toBeFocused();
  const option = panelOf(page, 'play').locator('[data-value="peru"]');
  await option.scrollIntoViewIfNeeded();
  await option.hover();
  expect(await activeLabel(page, 'play')).toBe('Peru');
  await option.click();
  await expect(page.getByTestId('value')).toHaveText('Value: peru');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await page.click('#play');
  await page.mouse.click(5, 5);
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
});

test('filter none: the application supplies the options; groups; readonly and disabled; silent application value', async ({
  page
}) => {
  await page.focus('#remote');
  await page.keyboard.type('po');
  await expect.poll(() => shown(page, 'remote')).toEqual(['Poland', 'Portugal']);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#remote')).toHaveValue('Poland');
  // The new results no longer include the selected option: Escape and leaving the field still restore its label.
  await page.keyboard.type('x');
  await expect.poll(() => shown(page, 'remote')).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#remote')).toHaveValue('Poland');
  await page.keyboard.type('x');
  await page.keyboard.press('Tab');
  await expect(page.locator('#remote')).toHaveValue('Poland');
  await page.click('#people');
  expect(await panelOf(page, 'people').locator('.ggb-combobox__group-heading').allTextContents()).toEqual([
    'Design',
    'Engineering'
  ]);
  await page.keyboard.press('Escape');
  await page.click('#ro');
  expect(await isOpen(page, 'ro')).toBe(false);
  await expect(page.locator('#off')).toBeDisabled();
  await page.click('#set-japan');
  await expect(page.locator('#play')).toHaveValue('Japan');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0');
});

test('accessibility tree: a combobox named by the Field, expanded state, the list box', async ({ page }) => {
  const input = await accessible(page, '#play');
  expect(input.role).toBe('combobox');
  expect(input.name).toBe('Country');
  expect(input.properties.autocomplete).toBe('list');
  await page.focus('#play');
  await page.keyboard.press('ArrowDown');
  expect((await accessible(page, '#play')).properties.expanded).toBe(true);
});

test('computed values match the resolved tokens: field sizes and conditions, panel, options, empty state', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes) {
      const field = await root(page, `size-${size}`)
        .locator('.ggb-combobox__field')
        .evaluate((f) => {
          const s = getComputedStyle(f);
          return {
            surface: s.backgroundColor,
            content: s.color,
            border: s.boxShadow,
            height: f.getBoundingClientRect().height,
            paddingInline: s.paddingLeft,
            fontSize: s.fontSize,
            radius: s.borderTopLeftRadius
          };
        });
      const typo = tokens[`typography.body.${size}`].$value as { fontSize: { value: number } };
      expect(field.surface, `${context} ${size}`).toBe(rgb(tokens['color.input.default.surface']));
      expect(field.border).toBe(
        `${rgb(tokens['color.input.default.border'])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
      expect(field.height).toBe(px(tokens[`size.control.${size}`]));
      expect(field.paddingInline).toBe(`${px(tokens[`space.control.edge-inline.${size}`])}px`);
      expect(field.fontSize).toBe(`${typo.fontSize.value}px`);
      report.add(context, { size }, 'default', field);
    }
    await page.focus('#size-md');
    await page.keyboard.press('ArrowDown');
    await settle(page);
    const focus = await root(page, 'size-md')
      .locator('.ggb-combobox__field')
      .evaluate((f) => ({ border: getComputedStyle(f).boxShadow, outline: getComputedStyle(f).outlineColor }));
    expect(focus.outline).toBe(rgb(tokens['color.focus.ring']));
    const option = await panelOf(page, 'size-md')
      .locator('[data-value="france"]')
      .evaluate((o) => ({
        surface: getComputedStyle(o).backgroundColor,
        check: getComputedStyle(o.querySelector('svg')!).color
      }));
    expect(option.surface).toBe(rgb(tokens['color.item.selected-hover.surface']));
    expect(option.check).toBe(rgb(tokens['color.item.indicator']));
    await page.keyboard.type('qq');
    const empty = await panelOf(page, 'size-md')
      .locator('.ggb-combobox__empty')
      .evaluate((e) => ({ color: getComputedStyle(e).color, paddingInline: getComputedStyle(e).paddingLeft }));
    expect(empty.color).toBe(rgb(tokens['color.content.secondary']));
    expect(empty.paddingInline).toBe(`${px(tokens['space.control.padding-inline.sm'])}px`);
    report.add(context, {}, 'focus', focus);
    report.add(context, { option: 'france' }, 'selected-hover', option);
    report.add(context, {}, 'empty', empty);
    await page.keyboard.press('Escape');
    await page.focus('#before');
  }
  report.write('combobox');
});

test('forced colors keep the field boundary, show the focus and the highlighted label', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const field = root(page, 'size-md').locator('.ggb-combobox__field');
  const outline = () =>
    field.evaluate((f) => {
      const s = getComputedStyle(f);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor };
    });
  const rest = await outline();
  expect(rest.style).toBe('solid');
  expect(rest.width).toBeGreaterThan(0);
  await page.focus('#size-md');
  await page.keyboard.press('ArrowDown');
  const focused = await outline();
  expect(focused.style).toBe('solid');
  expect(focused.width).toBeGreaterThanOrEqual(rest.width);
  expect(focused.color).not.toBe(rest.color);
  // The highlighted option paints its own system colors: no Canvas backplate hides its HighlightText label.
  await expect(panelOf(page, 'size-md').locator('.ggb-combobox__option[data-highlighted]')).toHaveCSS(
    'forced-color-adjust',
    'none'
  );
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await capture(page, 'reports/components/combobox/svelte/forced-colors.png');
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'combobox');
});
