import { test, expect, type Page } from '@playwright/test';
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

const out = 'reports/components/data-field/svelte';
type Typography = { fontSize: { value: number }; fontWeight: number; lineHeight: number };

test.beforeEach(async ({ page }) => {
  await page.goto('/data-field/');
  await page.evaluate(() => document.fonts.ready);
});

/** Geometry of a field: label and value boxes and the first baseline of each (an empty inline-block at its start). */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const label = el.querySelector('.ggb-data-field__label') as HTMLElement;
    const value = el.querySelector('.ggb-data-field__value') as HTMLElement;
    const baseline = (node: HTMLElement) => {
      const probe = document.createElement('span');
      probe.style.display = 'inline-block';
      node.prepend(probe);
      const y = probe.getBoundingClientRect().bottom;
      probe.remove();
      return y;
    };
    const lr = label.getBoundingClientRect();
    const vr = value.getBoundingClientRect();
    const lc = getComputedStyle(label);
    const vc = getComputedStyle(value);
    return {
      label: { left: lr.left, top: lr.top, width: lr.width, bottom: lr.bottom },
      value: { left: vr.left, top: vr.top },
      labelFont: `${lc.fontSize} ${lc.fontWeight}`,
      valueFont: `${vc.fontSize} ${vc.fontWeight}`,
      labelColor: lc.color,
      valueColor: vc.color,
      baselines: [baseline(label), baseline(value)]
    };
  });
}

test('typographies, colors and gaps follow the tokens in both orientations and sizes, in every representative context', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const t = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const orientation of ['vertical', 'horizontal'])
      for (const size of ['sm', 'md']) {
        const m = await measure(page, `#m-${orientation}-${size}`);
        const lt = t[`typography.label.${size}`].$value as Typography;
        const vt = t[`typography.body.${size}`].$value as Typography;
        expect(m.labelFont).toBe(`${lt.fontSize.value}px ${lt.fontWeight}`);
        expect(m.valueFont).toBe(`${vt.fontSize.value}px ${vt.fontWeight}`);
        expect(m.labelColor).toBe(rgb(t['color.content.secondary']));
        expect(m.valueColor).toBe(rgb(t['color.content.primary']));
        if (orientation === 'vertical') {
          expect(m.value.top - m.label.bottom).toBeCloseTo(px(t['space.content.xs']), 1);
          expect(m.value.left).toBe(m.label.left);
        } else {
          expect(m.label.width).toBe(px(t['component.data-field.label-inline-size']));
          expect(m.value.left - (m.label.left + m.label.width)).toBeCloseTo(px(t['space.content.md']), 1);
          expect(Math.abs(m.baselines[0] - m.baselines[1])).toBeLessThanOrEqual(0.5);
        }
        report.add(context, { orientation, size }, 'default', {
          'label-font': m.labelFont,
          'value-font': m.valueFont,
          'label-color': m.labelColor,
          'value-color': m.valueColor,
          ...(orientation === 'horizontal' ? { 'label-width': m.label.width } : { gap: m.value.top - m.label.bottom })
        });
      }
    const empty = await page
      .locator('#m-vertical-md-empty .ggb-data-field__empty')
      .evaluate((el) => getComputedStyle(el).color);
    expect(empty).toBe(rgb(t['color.content.tertiary']));
  }
  report.write('data-field');
});

test('horizontal stacks below twice the label column and returns beside it when wide again', async ({ page }) => {
  await page.selectOption('#opt-orientation', 'horizontal');
  const layout = () =>
    page.locator('#play').evaluate((el) => {
      const l = el.querySelector('.ggb-data-field__label')!.getBoundingClientRect();
      const v = el.querySelector('.ggb-data-field__value')!.getBoundingClientRect();
      return { stacked: v.top >= l.bottom, labelWidth: l.width, fieldWidth: el.getBoundingClientRect().width };
    });
  await expect.poll(async () => (await layout()).stacked).toBe(false);
  expect((await layout()).labelWidth).toBe(160);
  // The frame has 12 px padding on each side and a 1 px border: 340 px wide leaves a 314 px field (under 320).
  await page.locator('#opt-width').fill('340');
  await expect.poll(async () => (await layout()).stacked).toBe(true);
  expect((await layout()).labelWidth).toBeCloseTo((await layout()).fieldWidth, 1);
  await page.locator('#opt-width').fill('360');
  await expect.poll(async () => (await layout()).stacked).toBe(false);
  await expect(page.locator('#h-narrow .ggb-data-field__value')).toBeVisible();
  const narrow = await page.locator('#h-narrow').evaluate((el) => {
    const l = el.querySelector('.ggb-data-field__label')!.getBoundingClientRect();
    const v = el.querySelector('.ggb-data-field__value')!.getBoundingClientRect();
    return v.top >= l.bottom;
  });
  expect(narrow).toBe(true);
});

test('a group named by its label; an empty value is announced; rich content is kept', async ({ page }) => {
  expect(await accessible(page, '#play')).toMatchObject({ role: 'group', name: 'Email' });
  await page.fill('#opt-value', '');
  await expect(page.locator('#play .ggb-data-field__empty')).toHaveText('—No value');
  await expect(page.locator('#play .ggb-data-field__empty [aria-hidden="true"]')).toHaveText('—');
  await page.check('#opt-rich');
  await expect(page.locator('#play .ggb-badge')).toHaveText('Active');
  expect(await page.locator('.ggb-data-field[tabindex]').count()).toBe(0);
});

test('long identifiers wrap instead of overflowing', async ({ page }) => {
  const m = await page.locator('#d-id').evaluate((el) => {
    const v = el.querySelector('.ggb-data-field__value') as HTMLElement;
    return { scroll: v.scrollWidth, client: v.clientWidth };
  });
  expect(m.scroll).toBeLessThanOrEqual(m.client);
});

test('forced colors: label, value and em dash in the system text color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await page.locator('#m-vertical-md-empty').evaluate((el) => ({
    label: getComputedStyle(el.querySelector('.ggb-data-field__label')!).color,
    empty: getComputedStyle(el.querySelector('.ggb-data-field__empty')!).color
  }));
  expect(m.label).toBe(m.empty);
  await page.locator('#matrix').scrollIntoViewIfNeeded();
  await capture(page, `${out}/forced-colors.png`);
});

test('review page passes axe in light and dark and fits a phone', async ({ page }) => {
  await auditAndCapture(page, 'data-field');
});
