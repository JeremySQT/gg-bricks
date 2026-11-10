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

const out = 'reports/components/tabs/svelte';
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');
const tab = (base: string, value: string) => `#${base}-tab-${value}`;
const visiblePanels = (page: Page, base: string) =>
  page.locator(`#${base} .ggb-tabs__panel:not([hidden])`).evaluateAll((p) => p.map((e) => e.id));

test.beforeEach(async ({ page }) => {
  await page.goto('/tabs/');
  await page.evaluate(() => document.fonts.ready);
});

test('one tab stop on the selected tab; arrows wrap and skip the disabled tab; Home and End; Tab enters the panel', async ({
  page
}) => {
  await page.focus('#before');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('play-tab-overview');
  // Automatic activation: moving focus selects.
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('play-tab-activity');
  await expect(page.getByTestId('value')).toHaveText('Value: activity');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
  expect(await visiblePanels(page, 'play')).toEqual(['play-panel-activity']);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  // Billing is disabled: skipped.
  expect(await focused(page)).toBe('play-tab-settings');
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('play-tab-overview');
  await page.keyboard.press('ArrowLeft');
  expect(await focused(page)).toBe('play-tab-settings');
  await page.keyboard.press('Home');
  expect(await focused(page)).toBe('play-tab-overview');
  await page.keyboard.press('End');
  expect(await focused(page)).toBe('play-tab-settings');
  // Vertical arrows do nothing in a horizontal list.
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('play-tab-settings');
  // The panel of Settings has no focusable content: it is the next stop; then After.
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('play-panel-settings');
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('after');
  // Back into the list lands on the selected tab.
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await focused(page)).toBe('play-tab-settings');
});

test('a panel with focusable content is not a stop; Tab goes to its first control', async ({ page }) => {
  await page.click(tab('play', 'activity'));
  await page.keyboard.press('Tab');
  expect(await focused(page)).toBe('activity-more');
  // Not a stop in sequential focus (Bits UI renders tabindex -1 where the first version rendered none).
  expect(await page.locator('#play-panel-activity').getAttribute('tabindex')).toBe('-1');
});

test('manual activation moves focus without selecting; Enter and Space select; pointer selects', async ({ page }) => {
  await page.selectOption('#opt-activation', 'manual');
  await page.focus(tab('play', 'overview'));
  await page.keyboard.press('ArrowRight');
  expect(await focused(page)).toBe('play-tab-activity');
  await expect(page.getByTestId('value')).toHaveText('Value: overview');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('value')).toHaveText('Value: activity');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press(' ');
  await expect(page.getByTestId('value')).toHaveText('Value: files');
  await page.click(tab('play', 'settings'));
  await expect(page.getByTestId('value')).toHaveText('Value: settings');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 3');
  // A disabled tab ignores presses.
  await page.click(tab('play', 'billing'), { force: true });
  await expect(page.getByTestId('value')).toHaveText('Value: settings');
});

test('the application selects silently; a value that matches no enabled tab shows the first enabled one', async ({
  page
}) => {
  await page.click('#set-files');
  await expect(page.locator(tab('play', 'files'))).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('changes')).toHaveText('Changes: 0');
  await expect(page.locator(tab('fallback', 'first'))).toHaveAttribute('aria-selected', 'true');
  expect(await visiblePanels(page, 'fallback')).toEqual(['fallback-panel-first']);
});

test('vertical: Down and Up move, wrapping; the indicator sits on the inline-end line; RTL reverses the arrows', async ({
  page
}) => {
  await page.click(tab('vertical', 'profile'));
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('vertical-tab-notifications');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('vertical-tab-danger');
  await page.keyboard.press('ArrowDown');
  expect(await focused(page)).toBe('vertical-tab-profile');
  await page.keyboard.press('ArrowUp');
  expect(await focused(page)).toBe('vertical-tab-danger');
  const geometry = await page.locator('#vertical').evaluate((root) => {
    const list = root.querySelector('.ggb-tabs__list')!.getBoundingClientRect();
    const t = root.querySelector('#vertical-tab-profile')!;
    const after = getComputedStyle(t, '::after');
    return { listRight: list.right, tabRight: t.getBoundingClientRect().right, width: after.width, right: after.right };
  });
  expect(geometry.width).toBe('2px');
  expect(geometry.right).toBe('-1px');
  // RTL: Left Arrow moves to the next tab.
  await page.click(tab('rtl', 'one'));
  await page.keyboard.press('ArrowLeft');
  expect(await focused(page)).toBe('rtl-tab-two');
});

test('a list that overflows scrolls and shows the selected tab; tabs never shrink or wrap', async ({ page }) => {
  const state = await page.locator('#months .ggb-tabs__list').evaluate((list) => {
    const box = list.getBoundingClientRect();
    const t = list.querySelector('#months-tab-November')!.getBoundingClientRect();
    return {
      scrolls: list.scrollWidth > list.clientWidth,
      visible: t.left >= box.left - 1 && t.right <= box.right + 1
    };
  });
  expect(state).toEqual({ scrolls: true, visible: true });
  const heights = await page
    .locator('#months .ggb-tabs__trigger')
    .evaluateAll((t) => [...new Set(t.map((e) => e.getBoundingClientRect().height))]);
  expect(heights.length).toBe(1);
});

test('overflow: no scrollbar; edges with hidden tabs show a scroll button that scrolls; buttons are not stops', async ({
  page
}) => {
  const list = page.locator('#months .ggb-tabs__list');
  expect(await list.evaluate((l) => getComputedStyle(l).scrollbarWidth)).toBe('none');
  // November is selected: tabs are hidden on both sides.
  const bar = page.locator('#months .ggb-tabs__bar');
  await expect(bar).toHaveAttribute('data-overflow-start', '');
  const start = page.locator('#months .ggb-tabs__scroll--start button');
  await expect(start).toHaveAttribute('tabindex', '-1');
  await expect(start).toHaveAttribute('aria-hidden', 'true');
  // The selected tab clears the scroll buttons.
  const clear = await page.locator('#months').evaluate((root) => {
    const tab = root.querySelector('#months-tab-November')!.getBoundingClientRect();
    return [...root.querySelectorAll('.ggb-tabs__scroll')].every((b) => {
      const r = b.getBoundingClientRect();
      return r.right <= tab.left + 0.5 || r.left >= tab.right - 0.5;
    });
  });
  expect(clear).toBe(true);
  const before = await list.evaluate((l) => l.scrollLeft);
  await start.click();
  await expect.poll(() => list.evaluate((l) => l.scrollLeft)).toBeLessThan(before);
  // Pressing until the start is reached: the start button goes away there.
  for (let i = 0; i < 10 && (await page.locator('#months .ggb-tabs__scroll--start').count()); i++) {
    await page.locator('#months .ggb-tabs__scroll--start button').click();
    await page.waitForTimeout(400);
  }
  await expect.poll(() => list.evaluate((l) => l.scrollLeft)).toBeLessThanOrEqual(1);
  await expect(bar).not.toHaveAttribute('data-overflow-start', '');
  await expect(page.locator('#months .ggb-tabs__scroll--start')).toHaveCount(0);
  await expect(page.locator('#months .ggb-tabs__scroll--end')).toHaveCount(1);
  // The playground list fits: no scroll button.
  await expect(page.locator('#play .ggb-tabs__scroll')).toHaveCount(0);
});

test('accessibility tree: tab list named, tabs selected and controlling their panels', async ({ page }) => {
  const list = await accessible(page, '#play .ggb-tabs__list');
  expect(list.role).toBe('tablist');
  expect(list.name).toBe('Project');
  const overview = await accessible(page, tab('play', 'overview'));
  expect(overview.role).toBe('tab');
  expect(overview.name).toBe('Overview');
  expect(overview.properties.selected).toBe(true);
  const billing = await accessible(page, tab('play', 'billing'));
  expect(billing.properties.disabled).toBe(true);
  const panel = await accessible(page, '#play-panel-overview');
  expect(panel.role).toBe('tabpanel');
  expect(panel.name).toBe('Overview');
});

test('computed values match the resolved tokens: sizes, idle, selected, hover, disabled, indicator and line', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes) {
      const read = (id: string) =>
        page.locator(id).evaluate((t) => {
          const s = getComputedStyle(t);
          const a = getComputedStyle(t, '::after');
          return {
            surface: s.backgroundColor,
            content: s.color,
            height: t.getBoundingClientRect().height,
            paddingInline: s.paddingLeft,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            radius: s.borderTopLeftRadius,
            indicator: a.backgroundColor,
            indicatorThickness: a.height,
            indicatorOpacity: a.opacity
          };
        });
      const selected = await read(`#size-${size}-tab-general`);
      const idle = await read(`#size-${size}-tab-members`);
      const typo = tokens[`typography.label.${size}`].$value as { fontSize: { value: number }; fontWeight: number };
      expect(selected.content, `${context} ${size}`).toBe(rgb(tokens['color.item.default.content']));
      expect(selected.indicator).toBe(rgb(tokens['color.item.indicator']));
      expect(selected.indicatorThickness).toBe(`${px(tokens['border.width.strong'])}px`);
      expect(selected.indicatorOpacity).toBe('1');
      expect(idle.content).toBe(rgb(tokens['color.content.secondary']));
      expect(idle.indicatorOpacity).toBe('0');
      expect(idle.surface).toBe(rgb(tokens['color.item.default.surface']));
      expect(idle.height).toBe(px(tokens[`size.control.${size}`]));
      expect(idle.paddingInline).toBe(`${px(tokens[`space.control.padding-inline.${size}`])}px`);
      expect(idle.fontSize).toBe(`${typo.fontSize.value}px`);
      expect(idle.fontWeight).toBe(String(typo.fontWeight));
      expect(idle.radius).toBe(`${px(tokens['radius.control'])}px`);
      await page.hover(`#size-${size}-tab-security`);
      const hover = await read(`#size-${size}-tab-security`);
      expect(hover.surface).toBe(rgb(tokens['color.item.hover.surface']));
      expect(hover.content).toBe(rgb(tokens['color.item.hover.content']));
      report.add(context, { size }, 'selected', selected);
      report.add(context, { size }, 'default', idle);
      report.add(context, { size }, 'hover', hover);
      await page.mouse.move(0, 0);
    }
    const disabled = await page
      .locator(tab('play', 'billing'))
      .evaluate((t) => ({ content: getComputedStyle(t).color, surface: getComputedStyle(t).backgroundColor }));
    expect(disabled.content).toBe(rgb(tokens['color.item.disabled.content']));
    report.add(context, { size: 'md' }, 'disabled', disabled);
    const line = await page.locator('#size-md').evaluate((r) => ({
      // The line belongs to the bar since round 2 (the fade of overflowing edges must not reach it).
      line: getComputedStyle(r.querySelector('.ggb-tabs__bar')!).boxShadow,
      gap: getComputedStyle(r.querySelector('.ggb-tabs__list')!).columnGap
    }));
    expect(line.line).toBe(
      `${rgb(tokens['color.border.subtle'])} 0px -${px(tokens['border.width.default'])}px 0px 0px inset`
    );
    expect(line.gap).toBe(`${px(tokens['space.content.xs'])}px`);
    const panelGap = await page.locator('#size-md').evaluate((r) => getComputedStyle(r).rowGap);
    expect(panelGap).toBe(`${px(tokens['space.content.lg'])}px`);
    report.add(context, { size: 'md' }, 'list', { ...line, panelGap });
  }
  report.write('tabs');
});

test('keyboard focus shows the ring; reduced motion removes transitions; forced colors keep the line and indicator', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  await page.focus('#before');
  await page.keyboard.press('Tab');
  const ring = await page.locator(tab('play', 'overview')).evaluate((t) => ({
    style: getComputedStyle(t).outlineStyle,
    color: getComputedStyle(t).outlineColor,
    width: getComputedStyle(t).outlineWidth
  }));
  expect(ring).toEqual({
    style: 'solid',
    color: rgb(tokens['color.focus.ring']),
    width: `${px(tokens['focus.width'])}px`
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator(tab('play', 'overview')).evaluate((t) => getComputedStyle(t).transitionDuration)).toBe(
    '0s'
  );
  await page.emulateMedia({ forcedColors: 'active' });
  await settle(page);
  expect(await page.locator('#play .ggb-tabs__bar').evaluate((l) => getComputedStyle(l).borderBottomStyle)).toBe(
    'solid'
  );
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'tabs');
});
