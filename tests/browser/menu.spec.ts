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
  tokensFor
} from './helpers.ts';

const out = 'reports/components/menu/svelte';
const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((m) => m.matches(':popover-open'));
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id ?? '');

test.beforeEach(async ({ page }) => {
  await page.goto('/menu/');
  await page.evaluate(() => document.fonts.ready);
});

test('a menu button: roles, names and the trigger state', async ({ page }) => {
  const trigger = page.locator('#actions-trigger');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const menu = await accessible(page, '#actions');
  expect(menu.role).toBe('menu');
  expect(menu.name).toBe('Actions');
  expect((await accessible(page, '#mi-edit')).role).toBe('menuitem');
  expect((await accessible(page, '#mi-edit')).name).toBe('Edit');
  expect((await accessible(page, '#mi-archive')).properties.disabled).toBe(true);
  expect((await accessible(page, '#actions .ggb-menu__group')).name).toBe('Danger zone');
  await expect(page.locator('#actions [role="separator"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.click('#row-trigger');
  expect((await accessible(page, '#row')).name).toBe('Report actions');
});

test('keyboard: Enter opens on the first item, arrows wrap and skip separators, Home, End, typeahead', async ({
  page
}) => {
  await page.focus('#actions-trigger');
  await page.keyboard.press('Enter');
  expect(await isOpen(page, 'actions')).toBe(true);
  await expect.poll(() => focused(page)).toBe('mi-edit');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focused(page)).toBe('mi-delete');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('mi-edit');
  await page.keyboard.press('End');
  await expect.poll(() => focused(page)).toBe('mi-delete');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('mi-archive'); // disabled items are reached
  await page.keyboard.press('Enter');
  expect(await isOpen(page, 'actions')).toBe(true);
  await expect(page.getByTestId('count')).toHaveText('Count: 0');
  await page.keyboard.press('s');
  await expect.poll(() => focused(page)).toBe('mi-share');
  // Characters typed within half a second build one prefix; after a pause a new search starts.
  await page.keyboard.press('h');
  await expect.poll(() => focused(page)).toBe('mi-share');
  await page.waitForTimeout(600);
  await page.keyboard.press('d');
  await expect.poll(() => focused(page)).toBe('mi-delete');
  await page.keyboard.press('Enter');
  expect(await isOpen(page, 'actions')).toBe(false);
  await expect(page.getByTestId('selected')).toHaveText('Selected: delete');
  await expect(page.locator('#actions-trigger')).toBeFocused();
});

test('ArrowDown and ArrowUp on the trigger open on the first and the last item; Escape and Tab close', async ({
  page
}) => {
  await page.focus('#actions-trigger');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('mi-edit');
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'actions')).toBe(false);
  await expect(page.locator('#actions-trigger')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focused(page)).toBe('mi-delete');
  await page.keyboard.press('Tab');
  expect(await isOpen(page, 'actions')).toBe(false);
  await expect(page.locator('#after')).toBeFocused();
});

test('opening by keyboard starts on the first or last enabled item; disabled items stay reachable', async ({
  page
}) => {
  await page.focus('#locked-trigger');
  await page.keyboard.press('Enter');
  await expect.poll(() => focused(page)).toBe('locked-copy');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focused(page)).toBe('locked-edit'); // reached, not skipped
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'locked')).toBe(false);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('locked-copy');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'locked')).toBe(false);
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focused(page)).toBe('locked-export');
  await page.keyboard.press('End');
  await expect.poll(() => focused(page)).toBe('locked-delete');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'locked')).toBe(false);
  // Opened by pointer: the first arrow key starts on an enabled item too.
  await page.click('#locked-trigger');
  await expect.poll(() => focused(page)).toBe('locked');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('locked-copy');
  await page.keyboard.press('Escape');
  await expect.poll(() => isOpen(page, 'locked')).toBe(false);
  await page.click('#locked-trigger');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focused(page)).toBe('locked-export');
});

test('inside a dark section of a light page, the panel and its items follow the section, not the page', async ({
  page
}) => {
  await page.click('#dark-trigger');
  await expect.poll(() => isOpen(page, 'dark')).toBe(true);
  await settle(page);
  const dark = tokensFor('base-dark-standard');
  const light = tokensFor('base-light-standard');
  expect(await page.locator('#dark').evaluate((m) => getComputedStyle(m).backgroundColor)).toBe(
    rgb(dark['color.surface.overlay'])
  );
  const item = await page.locator('#dark-a').evaluate((i) => getComputedStyle(i).color);
  expect(item).toBe(rgb(dark['color.item.default.content']));
  expect(item).not.toBe(rgb(light['color.item.default.content']));
});

test('pointer: opening focuses the menu without a highlight; hover highlights; a press activates; outside closes', async ({
  page
}) => {
  await page.click('#actions-trigger');
  await expect.poll(() => focused(page)).toBe('actions');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toBe('mi-edit');
  await page.hover('#mi-share');
  await expect.poll(() => focused(page)).toBe('mi-share');
  await page.mouse.move(5, 5);
  await expect.poll(() => focused(page)).toBe('actions');
  await page.click('#mi-copy');
  await expect(page.getByTestId('selected')).toHaveText('Selected: duplicate');
  expect(await isOpen(page, 'actions')).toBe(false);
  await page.click('#actions-trigger');
  // A disabled item ignores presses (forced: Playwright never presses an element announced as disabled).
  await page.click('#mi-archive', { force: true });
  expect(await isOpen(page, 'actions')).toBe(true);
  await page.mouse.click(5, 5);
  expect(await isOpen(page, 'actions')).toBe(false);
});

test('a link item navigates and reports its value; long labels truncate; long menus scroll; width follows the trigger', async ({
  page
}) => {
  await page.click('#row-trigger');
  await expect.poll(() => isOpen(page, 'row')).toBe(true);
  await settle(page);
  const tokens = tokensFor('base-light-standard');
  await expect
    .poll(() =>
      page.locator('#row-download .ggb-menu__item-label').evaluate((label) => label.scrollWidth > label.clientWidth)
    )
    .toBe(true);
  const width = await page.locator('#row').evaluate((menu) => menu.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(px(tokens['size.overlay.panel']));
  await page.click('#row-open');
  await expect(page.getByTestId('selected')).toHaveText('Selected: open');
  expect(await page.evaluate(() => location.hash)).toBe('#report');
  // In a short viewport the long menu is taller than the room around its trigger: it scrolls.
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.click('#long-trigger');
  await expect.poll(() => isOpen(page, 'long')).toBe(true);
  await settle(page);
  const long = await page.locator('#long').evaluate((menu) => ({
    // The items scroll in the inner list since wave 4 (thin scrollbar inside the padding).
    scrolls: (() => {
      const list = menu.querySelector('.ggb-menu__list')!;
      return list.scrollHeight > list.clientHeight && getComputedStyle(list).scrollbarWidth === 'thin';
    })(),
    width: menu.getBoundingClientRect().width,
    trigger: document.getElementById('long-trigger')!.getBoundingClientRect().width
  }));
  expect(long.scrolls).toBe(true);
  const box = (await page.locator('#long').boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(600);
  expect(long.width).toBeGreaterThanOrEqual(long.trigger - 0.5);
  await page.keyboard.press('End');
  expect(await page.locator('#long-years').isVisible()).toBe(true);
});

test('computed values match the resolved tokens: panel, items default, highlighted, disabled and danger', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    await page.focus('#actions-trigger');
    await page.keyboard.press('Enter');
    await settle(page);
    const item = (id: string) =>
      page.locator(`#${id}`).evaluate((i) => {
        const s = getComputedStyle(i);
        return { surface: s.backgroundColor, content: s.color, height: i.getBoundingClientRect().height };
      });
    const hover = await item('mi-edit');
    const plain = await item('mi-share');
    const disabled = await item('mi-archive');
    const danger = await item('mi-delete');
    const panel = await page.locator('#actions').evaluate((menu) => {
      const s = getComputedStyle(menu);
      return { surface: s.backgroundColor, radius: s.borderTopLeftRadius, padding: s.paddingTop };
    });
    expect(hover.surface, context).toBe(rgb(tokens['color.item.hover.surface']));
    expect(hover.content).toBe(rgb(tokens['color.item.hover.content']));
    expect(plain.surface).toBe(rgb(tokens['color.item.default.surface']));
    expect(plain.content).toBe(rgb(tokens['color.item.default.content']));
    expect(plain.height).toBeGreaterThanOrEqual(px(tokens['size.control.sm']));
    expect(disabled.content).toBe(rgb(tokens['color.item.disabled.content']));
    expect(danger.content).toBe(rgb(tokens['color.status.danger.content']));
    expect(panel.surface).toBe(rgb(tokens['color.surface.overlay']));
    expect(panel.radius).toBe(`${px(tokens['radius.overlay'])}px`);
    expect(panel.padding).toBe(`${px(tokens['space.content.xs'])}px`);
    report.add(context, { item: 'edit' }, 'hover', hover);
    report.add(context, { item: 'share' }, 'default', plain);
    report.add(context, { item: 'archive' }, 'disabled', disabled);
    report.add(context, { item: 'delete', intent: 'danger' }, 'default', danger);
    report.add(context, {}, 'panel', panel);
    await page.keyboard.press('Escape');
  }
  report.write('menu');
});

test('forced colors keep an edge on the panel and show the highlighted label', async ({ page }) => {
  await page.focus('#actions-trigger');
  await page.keyboard.press('Enter');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.locator('#actions').evaluate((m) => getComputedStyle(m).borderTopStyle)).toBe('solid');
  // The focused item paints its own system colors: no Canvas backplate hides its HighlightText label.
  await expect(page.locator('#actions .ggb-menu__item:focus')).toHaveCSS('forced-color-adjust', 'none');
  // Colors are read once the transitions into forced colors have ended.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  // A disabled item is in the system disabled color, unlike the others; focused, it shows a Highlight outline.
  const itemColor = (selector: string) =>
    page
      .locator(`#actions ${selector}`)
      .first()
      .evaluate((i) => getComputedStyle(i).color);
  const disabledColor = await itemColor('#mi-archive');
  expect(disabledColor).not.toBe(await itemColor('.ggb-menu__item:not([data-disabled]):not(:focus)'));
  await page.keyboard.type('a');
  await expect(page.locator('#mi-archive')).toBeFocused();
  await expect(page.locator('#mi-archive')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#mi-archive')).toHaveCSS('color', disabledColor);
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'menu');
});
