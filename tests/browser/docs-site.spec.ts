import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { capture } from './helpers.ts';

// Documentation site (apps/docs): every page renders without errors and without axe violations in light
// and dark, every live block of documentation/ is rendered and hydrated, and the context selects drive
// the ggbrick attributes and the token values shown on foundations pages.
const site = 'http://127.0.0.1:4321';
const out = 'reports/site/docs';

const sitemap = fs.readFileSync('apps/docs/dist/sitemap-0.xml', 'utf8');
const pages = [...sitemap.matchAll(/<loc>https:\/\/docs\.ggbrick\.design([^<]*)<\/loc>/g)].map((m) => m[1]);
const index = JSON.parse(fs.readFileSync('documentation/index.json', 'utf8')) as {
  components: { id: string; documentation: string }[];
};

async function open(page: Page, path: string, theme: 'light' | 'dark', brand = 'base', density = 'standard') {
  await page.addInitScript(
    ([t, b, d]) => {
      localStorage.setItem('starlight-theme', t);
      localStorage.setItem('ggbrick-brand', b);
      localStorage.setItem('ggbrick-density', d);
    },
    [theme, brand, density]
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(site + path, { waitUntil: 'networkidle' });
  return errors;
}

test('the sitemap lists the expected pages', () => {
  expect(pages).toContain('/');
  for (const c of index.components) expect(pages).toContain(`/components/${c.id}/`);
  expect(pages.length).toBeGreaterThanOrEqual(index.components.length + 10);
});

for (const theme of ['light', 'dark'] as const) {
  test(`every page renders without errors or axe violations (${theme})`, async ({ page }) => {
    test.setTimeout(240000);
    const failures: string[] = [];
    for (const path of pages) {
      const errors = await open(page, path, theme);
      await expect(page.locator('html')).toHaveAttribute('data-ggb-appearance', theme);
      const axe = await new AxeBuilder({ page })
        .exclude('[data-ggb-docs-informational]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      for (const v of axe.violations) {
        for (const node of v.nodes) {
          const target = node.target.join(' ');
          // Documented exception (user decision at the wave 1 implementation gate, 2026-10-14), the same as in
          // tests/browser/button.spec.ts and shortcut.spec.ts: a plain Shortcut in a Button trailing slot is
          // attenuated to opacity.muted, which takes its hint text below 4.5:1 inside some buttons.
          // Documented exception (wave 2, raised at the implementation gate), the same as in auditAndCapture of
          // tests/browser/helpers.ts: text of an inactive component (inside an element marked data-disabled) is
          // exempt from contrast (WCAG 1.4.3); axe flags the description of a disabled Radio or Switch.
          const exception =
            v.id === 'color-contrast' &&
            (await page
              .locator(target)
              .first()
              .evaluate(
                (el) =>
                  !!el.closest('.ggb-button__trailing .ggb-shortcut[data-appearance="plain"]') ||
                  !!el.closest('[data-disabled]')
              ));
          if (!exception) failures.push(`${path}: ${v.id} ${target}`);
        }
      }
      for (const e of errors) failures.push(`${path}: console ${e}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
}

// A page without live blocks, with the reason: its examples are code and the playground is the live case.
// The element a playground shows, when it is not the component root: the Toast playground previews a toast in its
// frame and sends live ones into the page's region with Show live.
const playgroundTarget: Record<string, string> = { toast: '.ggb-toast__item' };
const noLiveBlocks: Record<string, string> = {
  toast: 'one notifications region per page: the playground renders it, the examples are shown as code'
};

// Overlays, and components an example shows after an action, are not visible until the reader acts: hover the first
// button or link of the block (a tooltip), then press it (a popover, a menu, a dialog, an alert after a failed save);
// the component must then be visible. Escape closes what opened, so that the rest of the page stays usable.
async function reveal(page: Page, scope: Locator, selector: string) {
  const target = scope.locator(selector).first();
  if (await target.isVisible()) return target;
  const control = scope.locator('button, a[href]').first();
  await control.hover();
  // A tooltip opens after its hover delay; anything else opens on a press.
  await page.waitForTimeout(1500);
  if (!(await target.isVisible())) await control.click();
  await expect(target).toBeVisible();
  await page.keyboard.press('Escape');
  // A dialog that ignores Escape (an explicit choice) is closed by its last footer button.
  for (let k = 0; k < 3 && (await page.locator('dialog[open]').count()); k++)
    await page.locator('dialog[open]').last().locator('button').last().click();
  await page.mouse.move(0, 0);
  return target;
}

for (const component of index.components) {
  test(`${component.id}: playground, blueprints and every live block`, async ({ page }) => {
    const markdown = fs.readFileSync(`documentation/components/${component.documentation}`, 'utf8');
    const blocks = (markdown.match(/^```svelte live$/gm) ?? []).length;
    if (noLiveBlocks[component.id]) expect(blocks, noLiveBlocks[component.id]).toBe(0);
    else expect(blocks).toBeGreaterThan(0);
    const errors = await open(page, `/components/${component.id}/`, 'light');
    const frames = page.locator('[data-ggb-docs-live]');
    await expect(frames).toHaveCount(blocks);
    for (let i = 0; i < blocks; i++) {
      const frame = frames.nth(i);
      await frame.scrollIntoViewIfNeeded();
      // Hydrated first (client:visible), so that hovering or pressing reaches the component.
      await expect(frame.locator('astro-island')).not.toHaveAttribute('ssr', /.*/);
      await reveal(page, frame, `.ggb-${component.id}`);
    }
    // The page opens with a playground whose first select changes the component.
    const playground = page.locator('.ggb-docs-playground');
    await expect(playground).toHaveCount(1);
    await playground.scrollIntoViewIfNeeded();
    const target = await reveal(page, playground, playgroundTarget[component.id] ?? `.ggb-${component.id}`);
    const select = playground.locator('select').first();
    const options = await select.locator('option').allTextContents();
    const before = await target.evaluate((el) => el.outerHTML);
    await select.selectOption(options[options.length - 1]);
    await expect.poll(() => target.evaluate((el) => el.outerHTML)).not.toBe(before);
    // Anatomy shows the Figma blueprint boards.
    const blueprints = page.locator('img.ggb-docs-blueprint');
    expect(await blueprints.count()).toBeGreaterThan(0);
    for (const img of await blueprints.all()) {
      await img.scrollIntoViewIfNeeded();
      expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page.locator('a[href*="/edit/main/"]').first()).toHaveAttribute(
      'href',
      `https://github.com/JeremySQT/design-system/edit/main/documentation/components/${component.documentation}`
    );
    expect(errors).toEqual([]);
    await capture(page, `${out}/${component.id}-light.png`, { fullPage: false });
  });
}

test('the context selects set the attributes, persist and reveal the matching token values', async ({ page }) => {
  await open(page, '/foundations/shape/', 'light');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-ggb-brand', 'base');
  const control = page.locator('[data-ggb-contexts]').filter({ hasText: '6px' }).first();
  await expect(control).toBeVisible();

  const [brand, density] = await page.locator('header ggbrick-context-select select').all();
  await brand.selectOption('brick');
  await density.selectOption('compact');
  await expect(root).toHaveAttribute('data-ggb-brand', 'brick');
  await expect(root).toHaveAttribute('data-ggb-density', 'compact');
  const radius = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--ggb-radius-control').trim()
  );
  expect(radius).toBe('2px');
  const visible = page.locator('tr', { hasText: '--ggb-radius-control' }).locator('[data-ggb-contexts]:visible');
  await expect(visible).toHaveCount(1);
  await expect(visible).toContainText('2px');
  await expect(visible).toHaveAttribute('data-ggb-contexts', /brick-light-compact/);

  // A new page of the same browser context (without the initial storage script) restores the choice.
  const next = await page.context().newPage();
  await next.goto(site + '/', { waitUntil: 'networkidle' });
  await expect(next.locator('html')).toHaveAttribute('data-ggb-brand', 'brick');
  await expect(next.locator('html')).toHaveAttribute('data-ggb-density', 'compact');
  await expect(next.locator('header ggbrick-context-select select').first()).toHaveValue('brick');
});

test('home page screenshots in both appearances', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await open(page, '/', theme);
    await capture(page, `${out}/home-${theme}.png`);
  }
});
