import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
  px,
  rgb,
  setContext,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/progress/svelte';
const intents = ['accent', 'success', 'warning', 'danger'];
const sizes = ['sm', 'md', 'lg'];
const ms = (t: { $value: unknown }) => (t.$value as { value: number }).value;

async function measure(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((track) => {
    const root = track.closest('.ggb-progress') as HTMLElement;
    const indicator = track.querySelector('.ggb-progress__indicator') as HTMLElement;
    const label = root.querySelector('.ggb-progress__label') as HTMLElement;
    const value = root.querySelector('.ggb-progress__valueText') as HTMLElement | null;
    const t = getComputedStyle(track);
    const i = getComputedStyle(indicator);
    return {
      trackColor: t.backgroundColor,
      trackHeight: track.getBoundingClientRect().height,
      trackRadius: t.borderTopLeftRadius,
      indicatorColor: i.backgroundColor,
      indicatorWidth: indicator.getBoundingClientRect().width,
      trackWidth: track.getBoundingClientRect().width,
      labelColor: getComputedStyle(label).color,
      labelFont: getComputedStyle(label).fontSize,
      valueColor: value ? getComputedStyle(value).color : null,
      valueNumeric: value ? getComputedStyle(value).fontVariantNumeric : null,
      gap: getComputedStyle(root).rowGap
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/progress/');
  await page.evaluate(() => document.fonts.ready);
});

test('a progress bar named by its label, with value and bounds; indeterminate exposes no value', async ({ page }) => {
  const bar = await accessible(page, '#play');
  expect(bar.role).toBe('progressbar');
  expect(bar.name).toBe('Uploading quarterly-report.pdf');
  await expect(page.locator('#play')).toHaveAttribute('aria-valuenow', '40');
  await expect(page.locator('#play')).toHaveAttribute('aria-valuemax', '100');
  await page.uncheck('#opt-label');
  expect((await accessible(page, '#play')).name).toBe('Uploading quarterly-report.pdf');
  await page.check('#opt-indeterminate');
  await expect(page.locator('#play')).not.toHaveAttribute('aria-valuenow');
  expect((await accessible(page, '#processing')).name).toBe('Processing the import');
});

test('the indicator covers the clamped fraction and moves over the base duration; the percentage follows', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const transition = await page
    .locator('#play .ggb-progress__indicator')
    .evaluate((i) => [getComputedStyle(i).transitionDuration, getComputedStyle(i).transitionProperty]);
  expect(transition).toEqual([`${ms(tokens['motion.duration.base']) / 1000}s`, 'inline-size']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [value, fraction, text] of [
    ['40', 0.4, '40%'],
    ['130', 1, '100%'],
    ['-10', 0, '0%']
  ] as const) {
    await page.fill('#opt-value', value);
    const m = await measure(page, 'play');
    expect(m.indicatorWidth).toBeCloseTo(m.trackWidth * fraction, 0);
    await expect(page.locator('#playground .ggb-progress__valueText')).toHaveText(text);
  }
  await expect(page.locator('#play .ggb-progress__indicator')).toBeHidden();
  await page.fill('#opt-value', '3');
  await page.fill('#opt-max', '5');
  await expect(page.locator('#playground .ggb-progress__valueText')).toHaveText('60%');
});

test('indeterminate sweeps a third of the track once per loop, three times slower under reduced motion', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const m = await page.locator('#processing .ggb-progress__indicator').evaluate((i) => ({
    width: i.getBoundingClientRect().width,
    track: i.parentElement!.getBoundingClientRect().width,
    name: getComputedStyle(i).animationName,
    duration: getComputedStyle(i).animationDuration
  }));
  expect(m.width).toBeCloseTo(m.track / 3, 0);
  expect(m.name).toBe('ggb-progress-sweep');
  expect(m.duration).toBe(`${ms(tokens['motion.duration.loop']) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const slow = await page
    .locator('#processing .ggb-progress__indicator')
    .evaluate((i) => getComputedStyle(i).animationDuration);
  expect(slow).toBe(`${(3 * ms(tokens['motion.duration.loop'])) / 1000}s`);
});

test('computed values match the resolved tokens for every intent, size and context', async ({ page }) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of intents)
      for (const size of sizes) {
        const m = await measure(page, `pr-${intent}-${size}`);
        expect(m.trackColor, `${context} ${intent} ${size}`).toBe(rgb(tokens['color.surface.muted']));
        expect(m.indicatorColor).toBe(rgb(tokens[`color.status.${intent}.icon`]));
        expect(m.trackHeight).toBe(px(tokens[`component.progress.thickness.${size}`]));
        expect(m.trackRadius).toBe(`${px(tokens['radius.full'])}px`);
        expect(m.labelColor).toBe(rgb(tokens['color.content.primary']));
        expect(m.labelFont).toBe(
          `${px({ $type: '', $value: (tokens['typography.label.md'].$value as { fontSize: unknown }).fontSize })}px`
        );
        expect(m.valueColor).toBe(rgb(tokens['color.content.secondary']));
        expect(m.valueNumeric).toContain('tabular-nums');
        expect(m.gap).toBe(`${px(tokens['space.content.xs'])}px`);
        expect(m.indicatorWidth).toBeCloseTo(m.trackWidth * 0.6, 0);
        report.add(context, { intent, size }, 'default', m);
      }
  }
  report.write('progress');
});

test('forced colors keep the track edge and paint the indicator in the highlight color', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const border = await page.locator('#play').evaluate((t) => getComputedStyle(t).borderTopStyle);
  expect(border).toBe('solid');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'progress');
});
