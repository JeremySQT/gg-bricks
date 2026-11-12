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

const out = 'reports/components/select/svelte';
const panelOf = (page: Page, id: string) => page.locator(`#${id}`).locator('xpath=..').locator('.ggb-select__panel');
const isOpen = (page: Page, id: string) => panelOf(page, id).evaluate((p) => p.matches(':popover-open'));
const activeLabel = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((t) => {
    const a = t.getAttribute('aria-activedescendant');
    return a ? document.getElementById(a)?.textContent?.trim() : null;
  });
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');

test.beforeEach(async ({ page }) => {
  await page.goto('/select/');
  await page.evaluate(() => document.fonts.ready);
});

test('keyboard: opening keys highlight the first enabled option; arrows do not wrap; disabled reached, not chosen', async ({
  page
}) => {
  await page.focus('#play');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  expect(await activeLabel(page, 'play')).toBe('English');
  await expect(page.locator('#play')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  expect(await activeLabel(page, 'play')).toBe('English');
  await page.keyboard.press('End');
  expect(await activeLabel(page, 'play')).toBe('Português');
  await page.keyboard.press('ArrowDown');
  expect(await activeLabel(page, 'play')).toBe('Português');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  expect(await activeLabel(page, 'play')).toBe('Italiano');
  await page.keyboard.press('Enter');
  expect(await isOpen(page, 'play')).toBe(true);
  await expect(page.getByTestId('value')).toHaveText('Value: none');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('value')).toHaveText('Value: es');
  await expect(page.locator('#play .ggb-select__value')).toHaveText('Español');
  await expect(page.locator('#play')).toBeFocused();
  // Reopening highlights the selected option; Space chooses; Escape and Tab close without changing the value.
  await page.keyboard.press(' ');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  expect(await activeLabel(page, 'play')).toBe('Español');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('value')).toHaveText('Value: es');
  await page.keyboard.press('Enter');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('value')).toHaveText('Value: es');
  expect(await focused(page)).toBe('after');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
});

test('typeahead opens on the matching option and moves within the list; Home and End open on the ends', async ({
  page
}) => {
  await page.focus('#play');
  await page.keyboard.press('d');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  expect(await activeLabel(page, 'play')).toBe('Deutsch');
  await page.waitForTimeout(600);
  await page.keyboard.press('p');
  expect(await activeLabel(page, 'play')).toBe('Português');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Home');
  expect(await activeLabel(page, 'play')).toBe('English');
  await page.keyboard.press('Escape');
  await page.keyboard.press('End');
  expect(await activeLabel(page, 'play')).toBe('Português');
});

test('pointer: a press toggles; hover highlights; a press chooses; focus stays on the trigger; outside closes', async ({
  page
}) => {
  await page.click('#play');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await page.hover('#play ~ .ggb-select__panel [data-value="ja"]');
  expect(await activeLabel(page, 'play')).toBe('日本語');
  await page.click('#play ~ .ggb-select__panel [data-value="ja"]');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('value')).toHaveText('Value: ja');
  await expect(page.locator('#play')).toBeFocused();
  await page.click('#play');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await page.click('#play ~ .ggb-select__panel [data-value="it"]', { force: true });
  expect(await isOpen(page, 'play')).toBe(true);
  await page.click('#play');
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
  await page.click('#play');
  await page.mouse.click(5, 5);
  await expect.poll(() => isOpen(page, 'play')).toBe(false);
});

test('states: readonly never opens; disabled is not focusable; the application sets the value silently', async ({
  page
}) => {
  await page.focus('#ro');
  await page.keyboard.press('ArrowDown');
  await page.click('#ro');
  expect(await isOpen(page, 'ro')).toBe(false);
  await expect(page.locator('#off')).toBeDisabled();
  await page.click('#set-de');
  await expect(page.locator('#play .ggb-select__value')).toHaveText('Deutsch');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0');
});

test('accessibility tree: a combobox named by the Field, its value, invalid; the list box and its options', async ({
  page
}) => {
  await page.check('#opt-invalid');
  const trigger = await accessible(page, '#play');
  expect(trigger.role).toBe('combobox');
  expect(trigger.name).toBe('Language');
  expect(trigger.properties.invalid).toBe('true');
  expect(trigger.description).toContain('Used for emails and the interface.');
  await page.focus('#play');
  await page.keyboard.press('ArrowDown');
  const list = await accessible(page, '#play ~ .ggb-select__panel [role="listbox"]');
  expect(list.role).toBe('listbox');
  expect(list.name).toBe('Language');
  await page.keyboard.press('Escape');
  await page.focus('#zones');
  await page.keyboard.press('ArrowDown');
  const zones = await accessible(page, '#zones ~ .ggb-select__panel [role="group"]');
  expect(zones.name).toBe('Europe');
});

test('panel: as wide as the trigger at least, wider for long labels; a long list scrolls within the cap', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  await page.click('#narrow');
  await expect.poll(() => isOpen(page, 'narrow')).toBe(true);
  await settle(page);
  const narrow = await page.locator('#narrow').evaluate((t) => ({
    trigger: t.getBoundingClientRect().width,
    panel: t.parentElement!.querySelector('.ggb-select__panel')!.getBoundingClientRect().width
  }));
  expect(narrow.panel).toBeGreaterThan(narrow.trigger);
  expect(narrow.panel).toBeLessThanOrEqual(px(tokens['size.overlay.panel']) + 0.5);
  await page.keyboard.press('Escape');
  await page.click('#many');
  await expect.poll(() => isOpen(page, 'many')).toBe(true);
  await settle(page);
  // Since round 2 the list scrolls inside the panel's padding, with a thin scrollbar in its token color.
  const long = await panelOf(page, 'many').evaluate((p) => {
    const list = p.querySelector('.ggb-select__list')!;
    const s = getComputedStyle(list);
    return {
      height: p.getBoundingClientRect().height,
      scrolls: list.scrollHeight > list.clientHeight,
      width: s.scrollbarWidth,
      color: s.scrollbarColor
    };
  });
  expect(long.width).toBe('thin');
  expect(long.color.startsWith(rgb(tokens['color.border.default']))).toBe(true);
  expect(long.scrolls).toBe(true);
  expect(long.height).toBeLessThanOrEqual(px(tokens['size.overlay.list']) + 0.5);
  // The selected option (Project 20) is scrolled into view.
  expect(await page.locator('#many ~ .ggb-select__panel [data-value="item-20"]').isVisible()).toBe(true);
  await page.keyboard.press('PageDown');
  const after = await activeLabel(page, 'many');
  expect(Number(after?.slice(-2))).toBeGreaterThan(21);
});

test('the panel opens offset below the trigger, clear of its focus indicator', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  await page.focus('#play');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => isOpen(page, 'play')).toBe(true);
  await settle(page);
  const gap = await page.locator('#play').evaluate((t) => {
    const panel = t.parentElement!.querySelector('.ggb-select__panel')!.getBoundingClientRect();
    return panel.top - t.getBoundingClientRect().bottom;
  });
  expect(gap).toBeCloseTo(px(tokens['space.content.sm']), 0);
  expect(gap).toBeGreaterThan(px(tokens['focus.width']) + px(tokens['focus.offset']));
});

test('inherits a dark subtree and escapes a clipping container', async ({ page }) => {
  await page.click('#dark');
  await expect.poll(() => isOpen(page, 'dark')).toBe(true);
  await settle(page);
  const dark = tokensFor('base-dark-standard');
  expect(await panelOf(page, 'dark').evaluate((p) => getComputedStyle(p).backgroundColor)).toBe(
    rgb(dark['color.surface.overlay'])
  );
  const clip = (await page.locator('.clip').boundingBox())!;
  const box = (await panelOf(page, 'dark').boundingBox())!;
  // Placed outside the clipping box (below or, when the viewport lacks room, above it).
  expect(box.y + box.height > clip.y + clip.height || box.y < clip.y).toBe(true);
  expect(await panelOf(page, 'dark').isVisible()).toBe(true);
});

test('computed values match the resolved tokens: trigger sizes and conditions, panel, options', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes) {
      const trigger = await page.locator(`#size-${size}`).evaluate((t) => {
        const s = getComputedStyle(t);
        return {
          surface: s.backgroundColor,
          content: s.color,
          border: s.boxShadow,
          height: t.getBoundingClientRect().height,
          paddingInline: s.paddingLeft,
          fontSize: s.fontSize,
          radius: s.borderTopLeftRadius,
          indicator: getComputedStyle(t.querySelector('.ggb-select__indicator')!).width
        };
      });
      const typo = tokens[`typography.body.${size}`].$value as { fontSize: { value: number } };
      expect(trigger.surface, `${context} ${size}`).toBe(rgb(tokens['color.input.default.surface']));
      expect(trigger.content).toBe(rgb(tokens['color.input.default.content']));
      expect(trigger.border).toBe(
        `${rgb(tokens['color.input.default.border'])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
      expect(trigger.height).toBe(px(tokens[`size.control.${size}`]));
      expect(trigger.paddingInline).toBe(`${px(tokens[`space.control.edge-inline.${size}`])}px`);
      expect(trigger.fontSize).toBe(`${typo.fontSize.value}px`);
      expect(trigger.radius).toBe(`${px(tokens['radius.control'])}px`);
      expect(trigger.indicator).toBe(`${px(tokens[`size.icon.${size}`])}px`);
      report.add(context, { size }, 'default', trigger);
    }
    // Disabled, readonly and invalid conditions.
    const color = (id: string) =>
      page
        .locator(`#${id}`)
        .evaluate((t) => ({ surface: getComputedStyle(t).backgroundColor, content: getComputedStyle(t).color }));
    const disabled = await color('off');
    expect(disabled.surface).toBe(rgb(tokens['color.input.disabled.surface']));
    const readonly = await color('ro');
    expect(readonly.surface).toBe(rgb(tokens['color.input.readonly.surface']));
    report.add(context, {}, 'disabled', disabled);
    report.add(context, {}, 'readonly', readonly);
    // Open: panel and options (selected Français, highlighted, disabled).
    await page.focus('#size-md');
    await page.keyboard.press('ArrowDown');
    await settle(page);
    const panel = await panelOf(page, 'size-md').evaluate((p) => {
      const s = getComputedStyle(p);
      return { surface: s.backgroundColor, radius: s.borderTopLeftRadius, padding: s.paddingTop };
    });
    expect(panel.surface).toBe(rgb(tokens['color.surface.overlay']));
    expect(panel.radius).toBe(`${px(tokens['radius.overlay'])}px`);
    expect(panel.padding).toBe(`${px(tokens['space.content.xs'])}px`);
    const option = (value: string) =>
      page.locator(`#size-md ~ .ggb-select__panel [data-value="${value}"]`).evaluate((o) => {
        const s = getComputedStyle(o);
        return {
          surface: s.backgroundColor,
          content: s.color,
          height: o.getBoundingClientRect().height,
          check: getComputedStyle(o.querySelector('.ggb-select__option-check')!).color
        };
      });
    const selectedHover = await option('fr');
    const plain = await option('en');
    const off = await option('it');
    expect(selectedHover.surface).toBe(rgb(tokens['color.item.selected-hover.surface']));
    expect(selectedHover.check).toBe(rgb(tokens['color.item.indicator']));
    expect(plain.surface).toBe(rgb(tokens['color.item.default.surface']));
    expect(plain.content).toBe(rgb(tokens['color.item.default.content']));
    expect(plain.height).toBeGreaterThanOrEqual(px(tokens['size.control.sm']));
    expect(off.content).toBe(rgb(tokens['color.item.disabled.content']));
    await page.keyboard.press('ArrowDown');
    const selected = await option('fr');
    const highlighted = await option('de');
    expect(selected.surface).toBe(rgb(tokens['color.item.selected.surface']));
    expect(highlighted.surface).toBe(rgb(tokens['color.item.hover.surface']));
    report.add(context, {}, 'panel', panel);
    report.add(context, { option: 'fr' }, 'selected-hover', selectedHover);
    report.add(context, { option: 'fr' }, 'selected', selected);
    report.add(context, { option: 'de' }, 'hover', highlighted);
    report.add(context, { option: 'en' }, 'default', plain);
    report.add(context, { option: 'it' }, 'disabled', off);
    await page.keyboard.press('Escape');
    await page.focus('#before');
  }
  report.write('select');
});

test('focus ring whatever the modality; forced colors keep the boundary and show the highlighted label', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  await page.click('#size-md');
  await page.keyboard.press('Escape');
  const ring = await page
    .locator('#size-md')
    .evaluate((t) => ({ style: getComputedStyle(t).outlineStyle, color: getComputedStyle(t).outlineColor }));
  expect(ring).toEqual({ style: 'solid', color: rgb(tokens['color.focus.ring']) });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.keyboard.press('ArrowDown');
  // The highlighted option paints its own system colors: no Canvas backplate hides its HighlightText label.
  await expect(page.locator('.ggb-select__option[data-highlighted]').first()).toHaveCSS('forced-color-adjust', 'none');
  // Colors are read once the transitions into forced colors have ended.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  // A disabled option is in the system disabled color, unlike the others; highlighted, it shows a Highlight outline.
  const optionColor = (selector: string) =>
    page
      .locator(`.ggb-select__panel:popover-open ${selector}`)
      .first()
      .evaluate((o) => getComputedStyle(o).color);
  const disabledColor = await optionColor('.ggb-select__option[data-disabled]');
  expect(disabledColor).not.toBe(await optionColor('.ggb-select__option:not([data-disabled]):not([data-highlighted])'));
  await page.keyboard.type('it');
  const highlightedDisabled = page.locator('.ggb-select__option[data-highlighted][data-disabled]');
  await expect(highlightedDisabled).toHaveCSS('outline-style', 'solid');
  await expect(highlightedDisabled).toHaveCSS('color', disabledColor);
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'select');
});
