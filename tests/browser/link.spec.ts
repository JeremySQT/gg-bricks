import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { capture, computedJson, writeEvidence } from './helpers.ts';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Color = { components: number[]; alpha?: number };

const out = 'reports/components/link/svelte';
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
const destinations = ['page', 'external', 'email', 'phone', 'file', 'print'];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const px = (t: Token): number => (t.$value as { value: number }).value;
const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};

async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
  await settle(page);
}

/**
 * Waits until no CSS transition runs. A context switch transitions colors (motion duration); an audit or a measure
 * taken meanwhile reads intermediate colors, which made the axe contrast audit fail intermittently in CI.
 */
async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition)));
}

/** Computed values of one link: color, underline of the label, meta, glyph geometry, focus ring, font. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const c = getComputedStyle(el);
    const label = getComputedStyle(el.querySelector('.ggb-link__label')!);
    const meta = el.querySelector('.ggb-link__meta');
    const glyph = el.querySelector('.ggb-link__indicator');
    const g = glyph?.getBoundingClientRect();
    return {
      color: c.color,
      parentColor: getComputedStyle(el.parentElement!).color,
      fontSize: c.fontSize,
      parentFontSize: getComputedStyle(el.parentElement!).fontSize,
      fontWeight: c.fontWeight,
      parentFontWeight: getComputedStyle(el.parentElement!).fontWeight,
      lineHeight: c.lineHeight,
      parentLineHeight: getComputedStyle(el.parentElement!).lineHeight,
      decorationLine: label.textDecorationLine,
      decorationThickness: label.textDecorationThickness,
      decorationColor: label.textDecorationColor,
      metaDecoration: meta ? getComputedStyle(meta).textDecorationLine : '',
      metaColor: meta ? getComputedStyle(meta).color : '',
      glyphWidth: g?.width ?? 0,
      glyphHeight: g?.height ?? 0,
      glyphColor: glyph ? getComputedStyle(glyph).fill : '',
      glyphOpacity: glyph ? getComputedStyle(glyph).opacity : '',
      glyphGap: glyph ? getComputedStyle(glyph).marginInlineStart : '',
      // A hidden outline (style none) is recorded 0 px wide: Chromium versions disagree on its computed width
      // (0 px or the specified 3 px), and the Figma parity ignores it (no focus ring layer).
      outline: `${c.outlineStyle} ${c.outlineStyle === 'none' ? '0px' : c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius
    };
  });
}

/** Role and name as exposed by Chromium's accessibility tree (through CDP). */
async function accessible(page: Page, selector: string): Promise<{ role: string; name: string }> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const n = nodes.find((x) => x.backendDOMNodeId === node.backendNodeId);
    if (!n) throw Error(`${selector} is not in the accessibility tree`);
    return { role: String(n.role?.value), name: String(n.name?.value ?? '') };
  } finally {
    await cdp.detach();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/link/');
  await page.evaluate(() => document.fonts.ready);
});

test('every destination announces what it leads to; the glyph is hidden', async ({ page }) => {
  const expected: Record<string, string> = {
    page: 'Billing settings',
    external: 'Svelte documentation (opens in a new tab)',
    email: 'support@example.com (email)',
    phone: '+33 1 23 45 67 89 (phone)',
    file: 'Annual report (PDF, 2.4 MB)',
    print: 'Printable invoice (printable version)'
  };
  for (const d of destinations) {
    expect(await accessible(page, `#dest-${d}`), d).toEqual({ role: 'link', name: expected[d] });
    await expect(page.locator(`#dest-${d} .ggb-link__indicator`)).toHaveCount(d === 'page' ? 0 : 1);
    if (d !== 'page')
      await expect(page.locator(`#dest-${d} .ggb-link__indicator`)).toHaveAttribute('aria-hidden', 'true');
  }
  // Translated suffixes and file formats without a size or a type.
  expect((await accessible(page, '#fr-external')).name).toBe("documentation (s'ouvre dans un nouvel onglet)");
  expect((await accessible(page, '#fr-email')).name).toBe('support (adresse e-mail)');
  expect((await accessible(page, '#file-none')).name).toBe('Attachment');
  expect((await accessible(page, '#file-epub')).name).toBe('Handbook (EPUB, 320 kB)');
  // The playground readout follows the options.
  await page.selectOption('#opt-destination', 'external');
  expect((await accessible(page, '#play')).name).toBe('Annual report (opens in a new tab)');
  await page.fill('#opt-suffix', 'nouvel onglet');
  expect((await accessible(page, '#play')).name).toBe('Annual report (nouvel onglet)');
});

test('only external opens a new tab, without opener; other destinations navigate in place', async ({ page }) => {
  await expect(page.locator('#dest-external')).toHaveAttribute('target', '_blank');
  await expect(page.locator('#dest-external')).toHaveAttribute('rel', 'noopener noreferrer');
  for (const d of ['page', 'email', 'phone', 'file', 'print']) {
    await expect(page.locator(`#dest-${d}`)).not.toHaveAttribute('target');
    await expect(page.locator(`#dest-${d}`)).not.toHaveAttribute('rel');
  }
  await page.click('#dest-page');
  expect(page.url()).toMatch(/#destinations$/);
  await page.focus('#standalone-page');
  await page.keyboard.press('Enter');
  expect(page.url()).toMatch(/#prose$/);
  // No disabled state exists.
  expect(await page.locator('.ggb-link[aria-disabled], .ggb-link:not([href])').count()).toBe(0);
});

test('the file glyph follows the format; unknown formats get the generic file', async ({ page }) => {
  const d = (id: string) => page.locator(`#${id} .ggb-link__indicator path`).getAttribute('d');
  const generic = await d('file-none');
  expect(await d('file-epub')).toBe(generic);
  const families = ['pdf', 'docx', 'xlsx', 'csv', 'pptx', 'txt', 'zip', 'png', 'mp3', 'mp4'];
  const paths = await Promise.all(families.map((f) => d(`file-${f}`)));
  expect(new Set([...paths, generic]).size).toBe(families.length + 1);
  await expect(page.locator('#file-pdf .ggb-link__meta')).toHaveText(' (PDF, 320 kB)');
  await expect(page.locator('#file-none .ggb-link__meta')).toHaveCount(0);
});

test('the link takes the font of its text; meta and glyph stay with the last word when the line wraps', async ({
  page
}) => {
  for (const id of ['prose-lg', 'prose-md', 'prose-sm', 'prose-caption', 'prose-heading']) {
    const m = await measure(page, `#${id}`);
    expect(m.fontSize, id).toBe(m.parentFontSize);
    expect(m.fontWeight, id).toBe(m.parentFontWeight);
    expect(m.lineHeight, id).toBe(m.parentLineHeight);
    if (m.glyphWidth) {
      expect(m.glyphWidth).toBe(parseFloat(m.fontSize));
      expect(m.glyphHeight).toBe(parseFloat(m.fontSize));
    }
  }
  // At every column width, the glyph sits on the line of the last word of its label.
  for (let width = 8; width <= 30; width += 1) {
    await page.locator('#narrow').fill(String(width));
    for (const id of ['wrap-file', 'wrap-external', 'wrap-email']) {
      const sameLine = await page.locator(`#${id}`).evaluate((el) => {
        const labels = el.querySelectorAll('.ggb-link__label');
        const rects = labels[labels.length - 1].getClientRects();
        const last = rects[rects.length - 1];
        const g = el.querySelector('.ggb-link__indicator')!.getBoundingClientRect();
        return g.top >= last.top - 1 && g.bottom <= last.bottom + 1;
      });
      expect(sameLine, `${id} at ${width}em`).toBe(true);
    }
  }
});

test('underlined in every state; hover and press thicken the underline without changing the color', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const rest = await measure(page, '#dest-file');
  expect(rest.decorationLine).toBe('underline');
  expect(rest.decorationThickness).toBe(`${px(tokens['border.width.default'])}px`);
  expect(rest.metaDecoration).toBe('none');
  await page.hover('#dest-file .ggb-link__label');
  const hover = await measure(page, '#dest-file');
  expect(hover.decorationThickness).toBe(`${px(tokens['border.width.strong'])}px`);
  expect(hover.color).toBe(rest.color);
  await page.mouse.down();
  const pressed = await measure(page, '#dest-file');
  expect(pressed.decorationThickness).toBe(`${px(tokens['border.width.strong'])}px`);
  expect(pressed.color).toBe(rest.color);
  await page.mouse.up();
  await expect(page.locator('#dest-file')).toHaveCSS('transition-duration', '0s');
});

test('computed values match the resolved tokens in every context; tone inherit takes the text color', async ({
  page
}) => {
  test.setTimeout(240_000);
  const records: Record<string, unknown>[] = [];
  const record = (context: string, props: Record<string, string>, state: string, values: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(values)) records.push({ context, props, state, property, value });
  };
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        await page.mouse.move(0, 0);
        for (const d of destinations) {
          const m = await measure(page, `#dest-${d}`);
          expect(m.color, `${context} ${d}`).toBe(rgb(tokens['color.content.link']));
          expect(m.decorationColor).toBe(m.color);
          expect(m.decorationThickness).toBe(`${px(tokens['border.width.default'])}px`);
          // Meta and glyph are a subtle complement in a neutral color (user choice D at the implementation
          // review, 2026-10-19).
          if (d !== 'page') {
            expect(m.glyphColor, `${context} ${d} glyph`).toBe(rgb(tokens['color.content.tertiary']));
            expect(m.glyphOpacity).toBe('1');
            expect(m.glyphGap).toBe(`${px(tokens['space.content.xs'])}px`);
          }
          if (d === 'file') expect(m.metaColor, `${context} meta`).toBe(rgb(tokens['color.content.tertiary']));
          record(context, { tone: 'accent', destination: d }, 'default', m);
        }
        for (const s of ['info', 'success', 'warning', 'danger', 'inverse']) {
          const m = await measure(page, `#inherit-${s}`);
          expect(m.color, `${context} inherit ${s}`).toBe(m.parentColor);
          expect(m.decorationLine).toBe('underline');
          record(context, { tone: 'inherit', destination: 'page' }, s, m);
        }
        // Tone inherit: meta in the context color, glyph in the context color at opacity.muted.
        const inherit = await measure(page, '#inherit-file');
        expect(inherit.color).toBe(inherit.parentColor);
        expect(inherit.metaColor).toBe(inherit.parentColor);
        expect(inherit.glyphColor).toBe(inherit.parentColor);
        expect(inherit.glyphOpacity).toBe(String(tokens['opacity.muted'].$value));
        record(context, { tone: 'inherit', destination: 'file' }, 'default', inherit);
        // Focus ring, reached by keyboard.
        await page.locator('#dest-page').focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        const focus = await measure(page, '#dest-page');
        expect(focus.outline).toBe(
          `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`
        );
        expect(focus.radius).toBe(`${px(tokens['radius.indicator'])}px`);
        record(context, { tone: 'accent', destination: 'page' }, 'focus', focus);
        await page.locator('#dest-page').blur();
      }
  writeEvidence(`${out}/computed.json`, computedJson(records));
  expect(records.length).toBeGreaterThan(0);
});

test('forced colors use the system link color and keep the underline and the focus ring', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const m = await measure(page, '#inherit-danger');
  expect(m.decorationLine).toBe('underline');
  const linkText = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'LinkText';
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  expect(m.color).toBe(linkText);
  await page.locator('#dest-page').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#dest-page')).toHaveCSS('outline-style', 'solid');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    await settle(page);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target}`))).toEqual([]);
    await capture(page, `${out}/review-${mode}.png`, { fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await capture(page, `${out}/review-mobile.png`, { fullPage: true });
});
