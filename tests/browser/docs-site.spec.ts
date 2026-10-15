import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

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
          const exception =
            v.id === 'color-contrast' &&
            (await page
              .locator(target)
              .first()
              .evaluate((el) => !!el.closest('.ggb-button__trailing .ggb-shortcut[data-appearance="plain"]')));
          if (!exception) failures.push(`${path}: ${v.id} ${target}`);
        }
      }
      for (const e of errors) failures.push(`${path}: console ${e}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
}

for (const component of index.components) {
  test(`${component.id}: playground, blueprints and every live block`, async ({ page }) => {
    const markdown = fs.readFileSync(`documentation/components/${component.documentation}`, 'utf8');
    const blocks = (markdown.match(/^```svelte live$/gm) ?? []).length;
    expect(blocks).toBeGreaterThan(0);
    const errors = await open(page, `/components/${component.id}/`, 'light');
    const frames = page.locator('[data-ggb-docs-live]');
    await expect(frames).toHaveCount(blocks);
    for (let i = 0; i < blocks; i++) {
      const frame = frames.nth(i);
      await frame.scrollIntoViewIfNeeded();
      await expect(frame.locator(`.ggb-${component.id}`).first()).toBeVisible();
      await expect(frame.locator('astro-island')).not.toHaveAttribute('ssr', /.*/);
    }
    // The page opens with a playground whose first select changes the component.
    const playground = page.locator('.ggb-docs-playground');
    await expect(playground).toHaveCount(1);
    const target = playground.locator(`.ggb-${component.id}`).first();
    await expect(target).toBeVisible();
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
    fs.mkdirSync(out, { recursive: true });
    await page.screenshot({ path: `${out}/${component.id}-light.png`, fullPage: false });
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
  fs.mkdirSync(out, { recursive: true });
  for (const theme of ['light', 'dark'] as const) {
    await open(page, '/', theme);
    await page.screenshot({ path: `${out}/home-${theme}.png` });
  }
});
