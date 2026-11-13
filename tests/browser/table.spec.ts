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

const out = 'reports/components/table/svelte';
type Typography = { fontSize: { value: number }; fontWeight: number; lineHeight: number };
const line = (color: string, y: number) => `${color} 0px ${y}px 0px 0px inset`;

test.beforeEach(async ({ page }) => {
  await page.goto('/table/');
  await page.evaluate(() => document.fonts.ready);
});

test('frame, header band, lines, typographies and row heights follow the tokens in every representative context', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const t = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of ['sm', 'md', 'lg']) {
      const m = await page.locator(`#size-${size}`).evaluate((el) => {
        const frame = getComputedStyle(el.querySelector('.ggb-table__frame')!, '::after');
        const heading = el.querySelector('.ggb-table__heading') as HTMLElement;
        const hc = getComputedStyle(heading);
        const rows = [...el.querySelectorAll('tbody tr')] as HTMLElement[];
        const cells = rows.map((r) => getComputedStyle(r.firstElementChild!));
        const caption = getComputedStyle(el.querySelector('.ggb-table__caption')!);
        return {
          frame: [frame.borderTopWidth, frame.borderTopColor, frame.borderTopLeftRadius],
          headingBackground: hc.backgroundColor,
          headingShadow: hc.boxShadow.split(', rgba(0, 0, 0, 0)')[0],
          headingFont: `${hc.fontSize} ${hc.fontWeight}`,
          headingColor: hc.color,
          headingPadding: hc.paddingLeft,
          headerHeight: heading.getBoundingClientRect().height,
          rowHeights: rows.map((r) => r.getBoundingClientRect().height),
          cellFont: `${cells[0].fontSize} ${cells[0].fontWeight}`,
          cellColor: cells[0].color,
          cellNumeric: cells[0].fontVariantNumeric,
          rowShadows: cells.map((c) => c.boxShadow.split(', rgba(0, 0, 0, 0)')[0]),
          captionFont: `${caption.fontSize} ${caption.fontWeight}`
        };
      });
      const height = px(t[`size.control.${size}`]);
      const ht = t['typography.label.md'].$value as Typography;
      const ct = t['typography.body.sm'].$value as Typography;
      const subtle = rgb(t['color.border.subtle']);
      const w = px(t['border.width.default']);
      expect(m.frame).toEqual([`${w}px`, subtle, `${px(t['radius.container'])}px`]);
      expect(m.headingBackground).toBe(rgb(t['color.surface.subtle']));
      expect(m.headingShadow).toBe(line(subtle, -w));
      expect(m.headingFont).toBe(`${ht.fontSize.value}px ${ht.fontWeight}`);
      expect(m.headingColor).toBe(rgb(t['color.content.secondary']));
      expect(m.headingPadding).toBe(`${px(t['space.content.md'])}px`);
      expect(m.headerHeight).toBe(height);
      expect(m.rowHeights).toEqual([height, height, height]);
      expect(m.cellFont).toBe(`${ct.fontSize.value}px ${ct.fontWeight}`);
      expect(m.cellColor).toBe(rgb(t['color.content.primary']));
      expect(m.cellNumeric).toBe('tabular-nums');
      expect(m.rowShadows[0]).toBe(line(subtle, -w));
      expect(m.rowShadows[2]).toBe('rgba(0, 0, 0, 0) 0px 0px 0px 0px');
      report.add(context, { size }, 'default', {
        'frame-width': m.frame[0],
        'frame-color': m.frame[1],
        radius: m.frame[2],
        'header-background': m.headingBackground,
        'header-line': m.headingShadow,
        'heading-font': m.headingFont,
        'heading-color': m.headingColor,
        'padding-inline': m.headingPadding,
        'row-height': m.rowHeights[0],
        'cell-font': m.cellFont,
        'cell-color': m.cellColor,
        'row-line': m.rowShadows[0]
      });
    }
  }
  report.write('table');
});

test('tall content grows the row and keeps the block padding; footer line and typography; column lines', async ({
  page
}) => {
  const t = tokensFor('base-light-standard');
  const m = await page.locator('#play').evaluate((el) => {
    const cell = el.querySelector('tbody tr:first-child td:nth-child(4)') as HTMLElement;
    const content = cell.firstElementChild!.getBoundingClientRect();
    const r = cell.getBoundingClientRect();
    const foot = getComputedStyle(el.querySelector('tfoot .ggb-table__cell')!);
    return {
      padding: [content.top - r.top, r.bottom - content.bottom],
      footer: [foot.boxShadow.split(', rgba(0, 0, 0, 0)')[0], `${foot.fontSize} ${foot.fontWeight}`]
    };
  });
  for (const p of m.padding) expect(p).toBeCloseTo(px(t['space.content.sm']), 0);
  expect(m.footer).toEqual([line(rgb(t['color.border.subtle']), 1), '14px 500']);
  await page.check('#opt-lines');
  const lines = await page.locator('#play').evaluate((el) => {
    const first = getComputedStyle(el.querySelector('tbody tr:first-child > :first-child')!).boxShadow;
    const last = getComputedStyle(el.querySelector('tbody tr:first-child > :last-child')!).boxShadow;
    return { first, last };
  });
  expect(lines.first).toContain('-1px 0px 0px 0px inset');
  expect(lines.last).not.toContain('-1px 0px 0px 0px inset');
  const rtl = await page
    .locator('#rtl-table tbody tr:first-child > :first-child')
    .evaluate((el) => getComputedStyle(el).boxShadow);
  expect(rtl).toContain(' 1px 0px 0px 0px inset');
});

test('a native table named by its caption; headers scoped; the scroll area is a named focus stop only while it overflows', async ({
  page
}) => {
  expect(await accessible(page, '#play table')).toMatchObject({ role: 'table', name: 'Invoices' });
  expect(await accessible(page, '#play thead th:first-child')).toMatchObject({ role: 'columnheader', name: 'Invoice' });
  expect(await accessible(page, '#play tbody tr:first-child > th')).toMatchObject({ role: 'rowheader', name: '#3066' });
  const play = page.locator('#play .ggb-table__container');
  await expect(play).not.toHaveAttribute('tabindex');
  const wide = page.locator('#wide .ggb-table__container');
  await expect(wide).toHaveAttribute('tabindex', '0');
  expect(await accessible(page, '#wide .ggb-table__container')).toMatchObject({ role: 'region', name: 'Orders' });
  // Keyboard focus draws the indicator on the frame, above the sticky header.
  await page.focus('#wide .ggb-table__container');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const ring = await page
    .locator('#wide .ggb-table__frame')
    .evaluate(
      (el) => getComputedStyle(el, '::after').outlineStyle + ' ' + getComputedStyle(el, '::after').outlineWidth
    );
  expect(ring).toBe('solid 2px');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => wide.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  // Wide enough again: no longer a focus stop (layout measured after the resize).
  await page.locator('#wide').evaluate((el) => {
    const host = el.parentElement as HTMLElement;
    host.style.maxInlineSize = 'none';
    host.style.inlineSize = '900px';
  });
  await expect.poll(() => wide.getAttribute('tabindex')).toBeNull();
  // The play table caption hidden: still the accessible name.
  await page.check('#opt-hide');
  await expect(page.locator('#play .ggb-table__caption')).toHaveCount(0);
  expect(await accessible(page, '#play table')).toMatchObject({ role: 'table', name: 'Invoices' });
});

test('with a limited block size the header stays at the top of the scroll area', async ({ page }) => {
  const container = page.locator('#tall .ggb-table__container');
  await container.evaluate((el) => el.scrollTo(0, 120));
  await expect
    .poll(() =>
      container.evaluate((el) => {
        const th = el.querySelector('th')!.getBoundingClientRect();
        return Math.round(th.top - el.getBoundingClientRect().top);
      })
    )
    .toBe(0);
});

test('forced colors: frame and lines become borders in the system text color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await page.locator('#size-md').evaluate((el) => {
    const heading = getComputedStyle(el.querySelector('thead th')!);
    const cell = getComputedStyle(el.querySelector('tbody tr:first-child > *')!);
    return {
      header: [heading.borderBottomStyle, heading.borderBottomColor],
      row: [cell.borderBottomStyle, cell.borderBottomColor, cell.color],
      frame: getComputedStyle(el.querySelector('.ggb-table__frame')!, '::after').borderTopStyle
    };
  });
  expect(m.header[0]).toBe('solid');
  expect(m.row[0]).toBe('solid');
  expect(m.row[1]).toBe(m.row[2]);
  expect(m.frame).toBe('solid');
  await page.locator('#sizes').scrollIntoViewIfNeeded();
  await capture(page, `${out}/forced-colors.png`);
});

test('review page passes axe in light and dark and fits a phone', async ({ page }) => {
  await auditAndCapture(page, 'table');
});
