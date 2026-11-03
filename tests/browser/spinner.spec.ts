import { test, expect } from '@playwright/test';
import { ComputedReport, accessible, allContexts, auditAndCapture, capture, setContext, tokensFor } from './helpers.ts';

const out = 'reports/components/spinner/svelte';
const ms = (t: { $value: unknown }) => (t.$value as { value: number }).value;
const iconPx = (tokens: ReturnType<typeof tokensFor>, size: string) =>
  (tokens[`size.icon.${size}`].$value as { value: number }).value;

test.beforeEach(async ({ page }) => {
  await page.goto('/spinner/');
  await page.evaluate(() => document.fonts.ready);
});

test('decorative spinners are hidden; a labelled spinner is a status named by its label', async ({ page }) => {
  const named = await accessible(page, '#play');
  expect(named.role).toBe('status');
  expect(named.name).toBe('Loading comments');
  await expect(page.locator('#sp-md')).toHaveAttribute('aria-hidden', 'true');
  await page.uncheck('#opt-named');
  await expect(page.locator('#play')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#play')).not.toHaveAttribute('role', 'status');
});

test('size from the icon scale, current color for both parts, track opacity and one turn per spin duration', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of ['sm', 'md', 'lg', 'xl'])
      for (const variant of ['', '-secondary', '-inverse']) {
        const m = await page.locator(`#sp-${size}${variant}`).evaluate((el) => {
          const svg = el.querySelector('svg')!;
          const track = el.querySelector('.ggb-spinner__track')!;
          const indicator = el.querySelector('.ggb-spinner__indicator')!;
          const r = el.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            color: getComputedStyle(el).color,
            parentColor: getComputedStyle(el.parentElement!).color,
            trackStroke: getComputedStyle(track).stroke,
            indicatorStroke: getComputedStyle(indicator).stroke,
            trackOpacity: getComputedStyle(track).opacity,
            duration: getComputedStyle(svg).animationDuration,
            timing: getComputedStyle(svg).animationTimingFunction
          };
        });
        expect(m.width, `${context} ${size}`).toBe(iconPx(tokens, size));
        expect(m.height).toBe(iconPx(tokens, size));
        expect(m.color).toBe(m.parentColor);
        expect(m.trackStroke).toBe(m.color);
        expect(m.indicatorStroke).toBe(m.color);
        expect(Number(m.trackOpacity)).toBe(tokens['component.spinner.track-opacity'].$value);
        expect(m.duration).toBe(`${ms(tokens['component.spinner.duration']) / 1000}s`);
        expect(m.timing).toBe('linear');
        if (variant === '') report.add(context, { size }, 'default', m);
      }
  }
  report.write('spinner');
});

test('reduced motion turns three times slower; forced colors draw in the system text color', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('#sp-md svg').evaluate((s) => getComputedStyle(s).animationDuration);
  expect(duration).toBe(`${(3 * ms(tokens['component.spinner.duration'])) / 1000}s`);
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'spinner');
});
