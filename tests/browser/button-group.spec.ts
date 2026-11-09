import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  densities,
  px,
  setContext,
  settle,
  sizes,
  tabOrder,
  tokensFor
} from './helpers.ts';

/** Boxes of the items of a group, in source order. */
const boxes = (page: Page, group: string) =>
  page.locator(`${group} > *`).evaluateAll((items) =>
    items.map((i) => {
      const r = i.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    })
  );
const frame = (page: Page, group: string) =>
  page.locator(group).evaluate((g) => {
    const r = g.getBoundingClientRect();
    const s = getComputedStyle(g);
    return {
      left: r.left + parseFloat(s.paddingLeft),
      right: r.right - parseFloat(s.paddingRight),
      width: g.clientWidth
    };
  });

test.beforeEach(async ({ page }) => {
  await page.goto('/button-group/');
  await page.evaluate(() => document.fonts.ready);
});

test('every item is its own tab stop in source order; no arrow navigation; activation reaches the item', async ({
  page
}) => {
  expect(await tabOrder(page, '#before', 4)).toEqual(['play-cancel', 'play-draft', 'play-publish', 'after']);
  await page.focus('#play-cancel');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#play-cancel')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('last')).toHaveText('Last: cancel');
  await page.click('#play-publish');
  await expect(page.getByTestId('last')).toHaveText('Last: publish');
  await expect(page.getByTestId('activations')).toHaveText('Activations: 2');
});

test('no semantics without a label; a label names the group', async ({ page }) => {
  await expect(page.locator('#play')).not.toHaveAttribute('role', 'group');
  await page.check('#opt-named');
  const group = await accessible(page, '#play');
  expect(group.role).toBe('group');
  expect(group.name).toBe('Document actions');
  expect((await accessible(page, '#icons')).name).toBe('Text formatting');
});

test('the group size sets every item height, the item asking for lg included; the gap follows size and density', async ({
  page
}) => {
  for (const density of densities) {
    const tokens = tokensFor(`base-light-${density}`);
    await page.selectOption('#ctx-density', density);
    for (const size of sizes) {
      await page.selectOption('#opt-size', size);
      await settle(page);
      const items = await boxes(page, '#play');
      // The visible surface of every item is the control height of the group size (Publish asks for lg on its own).
      const surfaces = await page
        .locator('#play .ggb-button__container')
        .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
      for (const height of surfaces) expect(height, `${density} ${size}`).toBe(px(tokens[`size.control.${size}`]));
      await expect(page.locator('#play-publish')).toHaveAttribute('data-size', size);
      expect(items[1].left - items[0].right).toBeCloseTo(px(tokens[`space.control.gap.${size}`]), 1);
    }
  }
});

test('Menu and Popover triggers in a group take its size; the popover content keeps its own size', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  const lg = px(tokens['size.control.lg']);
  for (const id of ['#triggers-save', '#triggers-pop-trigger', '#triggers-menu-trigger'])
    await expect(page.locator(id), id).toHaveAttribute('data-size', 'lg');
  const heights = await page
    .locator(
      ['#triggers-save', '#triggers-pop-trigger', '#triggers-menu-trigger']
        .map((id) => `${id} .ggb-button__container, ${id} .ggb-icon-button__container`)
        .join(', ')
    )
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(heights).toEqual([lg, lg, lg]);
  await page.click('#triggers-pop-trigger');
  await expect(page.locator('#triggers-pop-copy')).toHaveAttribute('data-size', 'sm');
});

test('alignment: start, center, end, stretch on a line; vertical always stacks every item at full width', async ({
  page
}) => {
  const f = await frame(page, '#play');
  let items = await boxes(page, '#play');
  expect(items[0].left).toBeCloseTo(f.left, 0);
  await page.selectOption('#opt-align', 'end');
  items = await boxes(page, '#play');
  expect(items[2].right).toBeCloseTo(f.right, 0);
  await page.selectOption('#opt-align', 'center');
  items = await boxes(page, '#play');
  expect(items[0].left - f.left).toBeCloseTo(f.right - items[2].right, 0);
  await page.selectOption('#opt-align', 'stretch');
  items = await boxes(page, '#play');
  expect(items[0].width).toBeCloseTo(items[1].width, 0);
  expect(items[2].right).toBeCloseTo(f.right, 0);
  await page.selectOption('#opt-orientation', 'vertical');
  for (const align of ['start', 'center', 'end', 'stretch']) {
    await page.selectOption('#opt-align', align);
    items = await boxes(page, '#play');
    for (let i = 1; i < items.length; i++) expect(items[i].top).toBeGreaterThan(items[i - 1].bottom - 0.5);
    for (const item of items) expect(item.width, align).toBeCloseTo(f.width, 0);
  }
  // The vertical groups of the matrix: Buttons at full width, the IconButton square at the inline start.
  const matrix = await frame(page, '#bg-vertical-md');
  const [back, next, more] = await boxes(page, '#bg-vertical-md');
  expect(back.width).toBeCloseTo(matrix.width, 0);
  expect(next.width).toBeCloseTo(matrix.width, 0);
  expect(more.width).toBeCloseTo(more.height, 0);
  expect(more.left).toBeCloseTo(matrix.left, 0);
});

test('a line that does not fit stacks at full width, in source order, and comes back; it never wraps', async ({
  page
}) => {
  await page.fill('#opt-width', '20');
  await expect(page.locator('#play')).toHaveAttribute('data-stacked', '');
  const f = await frame(page, '#play');
  let items = await boxes(page, '#play');
  for (const item of items) expect(item.width).toBeCloseTo(f.width, 0);
  expect(items.map((i) => i.top)).toEqual([...items.map((i) => i.top)].sort((a, b) => a - b));
  await page.fill('#opt-width', '100');
  await expect(page.locator('#play')).not.toHaveAttribute('data-stacked', '');
  items = await boxes(page, '#play');
  expect(new Set(items.map((i) => Math.round(i.top))).size).toBe(1);
  await expect(page.locator('#narrow')).toHaveAttribute('data-stacked', '');
});

test('computed gap and item heights match the resolved tokens in every context', async ({ page }) => {
  test.setTimeout(300_000);
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of sizes)
      for (const orientation of ['horizontal', 'vertical']) {
        const gap = await page.locator(`#bg-${orientation}-${size}`).evaluate((g) => getComputedStyle(g).gap);
        const expected = `${px(tokens[`space.control.gap.${size}`])}px`;
        expect(gap, `${context} ${size} ${orientation}`).toBe(expected);
        const height = await page
          .locator(`#bg-${orientation}-${size}-b .ggb-button__container`)
          .evaluate((e) => e.getBoundingClientRect().height);
        expect(height, `${context} ${size}`).toBe(px(tokens[`size.control.${size}`]));
        report.add(context, { size, orientation }, 'default', { gap, itemHeight: height });
      }
  }
  report.write('button-group');
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'button-group');
});
