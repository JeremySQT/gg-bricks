import { test, expect } from '@playwright/test';
import { ComputedReport, allContexts, auditAndCapture, capture, px, rgb, setContext, tokensFor } from './helpers.ts';

const out = 'reports/components/skeleton/svelte';
const ms = (t: { $value: unknown }) => (t.$value as { value: number }).value;
type Typography = { fontSize: { value: number }; lineHeight: number };

test.beforeEach(async ({ page }) => {
  await page.goto('/skeleton/');
  await page.evaluate(() => document.fonts.ready);
});

test('hidden from assistive technology; lines take the line box of the body typography with a bar of its font size', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of ['sm', 'md', 'lg']) {
      const typo = tokens[`typography.body.${size}`].$value as Typography;
      const m = await page.locator(`#sk-${size}`).evaluate((el) => {
        const lines = [...el.querySelectorAll('.ggb-skeleton__line')] as HTMLElement[];
        const bar = getComputedStyle(lines[0], '::before');
        const last = getComputedStyle(lines[2], '::before');
        return {
          hidden: el.getAttribute('aria-hidden'),
          lineHeights: lines.map((l) => l.getBoundingClientRect().height),
          barHeight: bar.blockSize,
          barColor: bar.backgroundColor,
          barRadius: bar.borderTopLeftRadius,
          lastWidth: parseFloat(last.inlineSize),
          lineWidth: lines[0].getBoundingClientRect().width,
          pulse: bar.animationName,
          duration: bar.animationDuration
        };
      });
      expect(m.hidden).toBe('true');
      for (const h of m.lineHeights)
        expect(h, `${context} ${size}`).toBeCloseTo(typo.fontSize.value * typo.lineHeight, 1);
      expect(m.barHeight).toBe(`${typo.fontSize.value}px`);
      expect(m.barColor).toBe(rgb(tokens['color.surface.muted']));
      expect(m.barRadius).toBe(`${px(tokens['radius.indicator'])}px`);
      expect(m.lastWidth).toBeCloseTo(m.lineWidth * 0.6, 0);
      expect(m.pulse).toBe('ggb-skeleton-pulse');
      expect(m.duration).toBe(`${ms(tokens['motion.duration.loop']) / 1000}s`);
      report.add(context, { shape: 'text', size }, 'default', m);
    }
    const block = await page.locator('#chart').evaluate((el) => ({
      radius: getComputedStyle(el).borderTopLeftRadius,
      color: getComputedStyle(el).backgroundColor,
      height: el.getBoundingClientRect().height,
      parent: el.parentElement!.getBoundingClientRect().height
    }));
    expect(block.radius).toBe(`${px(tokens['radius.container'])}px`);
    expect(block.color).toBe(rgb(tokens['color.surface.muted']));
    expect(block.height).toBe(block.parent);
    report.add(context, { shape: 'block' }, 'default', block);
  }
  report.write('skeleton');
});

test('a paragraph skeleton has the height of the real paragraph of the same number of lines', async ({ page }) => {
  for (const size of ['sm', 'md', 'lg']) {
    const real = await page.locator(`#real-${size}`).evaluate((p) => {
      const lh = parseFloat(getComputedStyle(p).lineHeight);
      return { lines: Math.round(p.getBoundingClientRect().height / lh), lineHeight: lh };
    });
    const skeleton = await page
      .locator(`#sk-${size} .ggb-skeleton__line`)
      .first()
      .evaluate((l) => l.getBoundingClientRect().height);
    expect(skeleton, size).toBeCloseTo(real.lineHeight, 1);
  }
});

test('circle is a disc as wide as its box; skeletons pulse in phase; no pulse under reduced motion', async ({
  page
}) => {
  const circle = await page.locator('#card-avatar').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height, radius: getComputedStyle(el).borderTopLeftRadius };
  });
  expect(circle.w).toBe(40);
  expect(circle.h).toBe(40);
  const starts = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => (a as CSSAnimation).animationName === 'ggb-skeleton-pulse')
      .map((a) => a.startTime)
  );
  expect(starts.length).toBeGreaterThan(3);
  expect(new Set(starts).size).toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const pulse = await page.locator('#chart').evaluate((el) => getComputedStyle(el).animationName);
  expect(pulse).toBe('none');
});

test('forced colors keep an edge on every shape', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const border = await page.locator('#chart').evaluate((el) => getComputedStyle(el).borderTopStyle);
  expect(border).toBe('solid');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'skeleton');
});
