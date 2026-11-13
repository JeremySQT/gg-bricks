import { test, expect } from '@playwright/test';
import {
  accessible,
  auditAndCapture,
  capture,
  ComputedReport,
  px,
  representative,
  rgb,
  setContext,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/divider/svelte';

test.beforeEach(async ({ page }) => {
  await page.goto('/divider/');
  await page.evaluate(() => document.fonts.ready);
});

test('line color and thickness, label typography and gaps follow the tokens in every representative context', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const t = tokensFor(context);
    await setContext(page, brand, mode, density);
    const h = await page.locator('#h-sections').evaluate((el) => {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const p = getComputedStyle(el.parentElement!);
      return {
        width: c.borderTopWidth,
        color: c.borderTopColor,
        height: r.height,
        inline: r.width,
        parentInline: el.parentElement!.clientWidth - parseFloat(p.paddingLeft) - parseFloat(p.paddingRight),
        margin: c.margin
      };
    });
    const thickness = px(t['component.divider.thickness']);
    expect(h.width).toBe(`${thickness}px`);
    expect(h.height).toBe(thickness);
    expect(h.color).toBe(rgb(t['color.border.subtle']));
    expect(Math.abs(h.inline - h.parentInline)).toBeLessThan(1);
    expect(h.margin).toBe('0px');
    const l = await page.locator('#h-or').evaluate((el) => {
      const label = el.querySelector('.ggb-divider__label')!;
      const lr = label.getBoundingClientRect();
      const before = getComputedStyle(el, '::before');
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        gap: c.columnGap,
        color: c.color,
        font: `${c.fontSize} ${c.fontWeight}`,
        center: lr.left + lr.width / 2 - (r.left + r.width / 2),
        lineWidth: before.borderTopWidth,
        lineColor: before.borderTopColor
      };
    });
    const ty = t['typography.caption.md'].$value as { fontSize: { value: number }; fontWeight: number };
    expect(l.gap).toBe(`${px(t['space.content.sm'])}px`);
    expect(l.color).toBe(rgb(t['color.content.secondary']));
    expect(l.font).toBe(`${ty.fontSize.value}px ${ty.fontWeight}`);
    expect(Math.abs(l.center)).toBeLessThanOrEqual(0.5);
    expect(l.lineWidth).toBe(`${thickness}px`);
    expect(l.lineColor).toBe(rgb(t['color.border.subtle']));
    report.add(context, { orientation: 'horizontal' }, 'default', { 'border-width': h.width, 'border-color': h.color });
    report.add(context, { orientation: 'horizontal', label: 'Or' }, 'default', {
      gap: l.gap,
      color: l.color,
      font: l.font
    });
  }
  report.write('divider');
});

test('vertical: stretched to the row, the line box in running text, thickness kept', async ({ page }) => {
  const m = await page.evaluate(() => {
    const rect = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    const row = rect('#v-buttons');
    const button = document
      .querySelector('#v-buttons')!
      .parentElement!.querySelector('.ggb-button')!
      .getBoundingClientRect();
    const text = document.querySelector('#v-text')!;
    const lh = parseFloat(getComputedStyle(text).lineHeight);
    return { row: row.height, button: button.height, width: row.width, text: text.getBoundingClientRect().height, lh };
  });
  expect(m.row).toBeCloseTo(m.button, 1);
  expect(m.width).toBe(1);
  expect(m.text).toBeCloseTo(m.lh, 1);
});

test('semantics: a separator with its orientation, the label as its name, decorative hidden, never focusable', async ({
  page
}) => {
  expect(await accessible(page, '#h-sections')).toMatchObject({ role: 'separator' });
  expect(await accessible(page, '#h-or')).toMatchObject({ role: 'separator', name: 'Or' });
  await expect(page.locator('#v-buttons')).toHaveAttribute('aria-orientation', 'vertical');
  await expect(page.locator('#v-meta')).toHaveAttribute('aria-hidden', 'true');
  await page.selectOption('#opt-orientation', 'vertical');
  await page.fill('#opt-label', 'Ignored');
  await expect(page.locator('#play .ggb-divider__label')).toHaveCount(0);
  expect(await page.locator('.ggb-divider[tabindex]').count()).toBe(0);
});

test('forced colors: the line and the label in the system text color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await page.locator('#h-or').evaluate((el) => {
    const c = getComputedStyle(el);
    return { color: c.color, line: getComputedStyle(el, '::before').borderTopColor };
  });
  expect(m.line).toBe(m.color);
  await page.locator('#horizontal').scrollIntoViewIfNeeded();
  await capture(page, `${out}/forced-colors.png`);
});

test('review page passes axe in light and dark and fits a phone', async ({ page }) => {
  await auditAndCapture(page, 'divider');
});
