import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Color = { components: number[]; alpha?: number };
type Typography = {
  fontSize: { value: number };
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: { value: number };
};

const out = 'reports/components/shortcut/svelte';
const sizes = ['sm', 'md', 'lg'];
const appearances = ['plain', 'keycap'];
const platforms = ['mac', 'other'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
const intents = ['accent', 'neutral', 'danger'];
const buttonAppearances = ['solid', 'outline', 'ghost'];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};
const px = (t: Token): number => (t.$value as { value: number }).value;
const typography = (t: Token): Typography => t.$value as Typography;

async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
}

/** Computed values and geometry of one shortcut: root typography and color, container gap, first key box, separator. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const root = getComputedStyle(el);
    const container = el.querySelector('.ggb-shortcut__container') as HTMLElement;
    const keys = [...el.querySelectorAll('.ggb-shortcut__key')] as HTMLElement[];
    const separators = [...el.querySelectorAll('.ggb-shortcut__separator')] as HTMLElement[];
    const k = getComputedStyle(keys[0]);
    const rect = (e: Element) => e.getBoundingClientRect();
    const items = [...container.children].map((c) => ({ cls: c.className, left: rect(c).left, right: rect(c).right }));
    return {
      platform: el.getAttribute('data-platform'),
      color: root.color,
      fontFamily: root.fontFamily,
      fontSize: root.fontSize,
      fontWeight: root.fontWeight,
      lineHeight: root.lineHeight,
      letterSpacing: root.letterSpacing,
      fontFeatureSettings: root.fontFeatureSettings,
      whiteSpace: root.whiteSpace,
      verticalAlign: root.verticalAlign,
      display: root.display,
      gap: getComputedStyle(container).columnGap,
      keyColor: k.color,
      keyFontSize: k.fontSize,
      keyFontFamily: k.fontFamily,
      surface: k.backgroundColor,
      borderColor: k.borderTopColor,
      borderWidth: k.borderTopWidth,
      borderStyle: k.borderTopStyle,
      radius: k.borderTopLeftRadius,
      paddingInline: k.paddingInlineStart,
      paddingBlock: `${k.paddingBlockStart} ${k.paddingBlockEnd}`,
      minInlineSize: k.minInlineSize,
      keyHeights: keys.map((e) => rect(e).height),
      keyWidths: keys.map((e) => rect(e).width),
      textWidths: keys.map((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        return range.getBoundingClientRect().width;
      }),
      rootHeight: rect(el).height,
      separatorColor: separators[0] ? getComputedStyle(separators[0]).color : null,
      texts: keys.map((e) => e.textContent),
      separators: separators.map((e) => e.textContent),
      name: el.querySelector('.ggb-shortcut__name')?.textContent ?? null,
      containerHidden: container.getAttribute('aria-hidden'),
      items
    };
  });
}

/** Expected texts per platform for the combinations table of the review page. */
const expected: Record<string, { mac: string[]; other: string[]; spoken: [string, string] }> = {
  'mod-k': { mac: ['⌘', 'K'], other: ['Ctrl', 'K'], spoken: ['Command K', 'Control K'] },
  'ctrl-shift-p': {
    mac: ['⌃', '⇧', 'P'],
    other: ['Ctrl', 'Shift', 'P'],
    spoken: ['Control Shift P', 'Control Shift P']
  },
  'shift-enter': { mac: ['⇧', '↩'], other: ['Shift', 'Enter'], spoken: ['Shift Enter', 'Shift Enter'] },
  'alt-arrowup': { mac: ['⌥', '↑'], other: ['Alt', '↑'], spoken: ['Option Up arrow', 'Alt Up arrow'] },
  escape: { mac: ['⎋'], other: ['Esc'], spoken: ['Escape', 'Escape'] },
  f5: { mac: ['F5'], other: ['F5'], spoken: ['F5', 'F5'] },
  'mod-plus': { mac: ['⌘', '+'], other: ['Ctrl', '+'], spoken: ['Command plus', 'Control plus'] },
  literal: { mac: ['G'], other: ['G'], spoken: ['G', 'G'] },
  unordered: {
    mac: ['⌃', '⌥', '⇧', '⌘', 'K'],
    other: ['Win', 'Ctrl', 'Alt', 'Shift', 'K'],
    spoken: ['Control Option Shift Command K', 'Windows Control Alt Shift K']
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto('/shortcut/');
  await page.evaluate(() => document.fonts.ready);
});

test('parsed order, glyphs, separators and spoken text with the platform forced to mac and other', async ({ page }) => {
  for (const [slug, e] of Object.entries(expected))
    for (const appearance of ['', '-keycap']) {
      const mac = await measure(page, `#combo-${slug}-mac${appearance}`);
      expect(mac.platform).toBe('mac');
      expect(mac.texts, `${slug} mac`).toEqual(e.mac);
      expect(mac.separators, `${slug} mac has no separator part`).toEqual([]);
      expect(mac.name).toBe(e.spoken[0]);
      const other = await measure(page, `#combo-${slug}-other${appearance}`);
      expect(other.platform).toBe('other');
      expect(other.texts, `${slug} other`).toEqual(e.other);
      expect(other.separators, `${slug} other: one + between consecutive keys`).toEqual(
        Array(e.other.length - 1).fill('+')
      );
      expect(other.name).toBe(e.spoken[1]);
      // Document order alternates key, separator, key on other; keys only on mac.
      const order = other.items.map((i) => (i.cls.includes('separator') ? 's' : 'k')).join('');
      expect(order).toBe(Array(e.other.length).fill('k').join('s'));
    }

  // Platform auto resolves from this browser (Chromium on Linux: other) and the playground re-renders on change.
  const detected = await page.getByTestId('detected-platform').textContent();
  const play = page.locator('#play-shortcut');
  await expect(play).toHaveAttribute('data-platform', /^(mac|other)$/);
  const auto = await play.getAttribute('data-platform');
  expect(auto).toBe(/^(mac|iphone|ipad|ipod|ios)/i.test(detected ?? '') ? 'mac' : 'other');
  await page.selectOption('#opt-platform', 'mac');
  await expect(play).toHaveAttribute('data-platform', 'mac');
  expect((await measure(page, '#play-shortcut')).texts).toEqual(['⇧', '⌘', 'P']);
  await expect(page.getByTestId('spoken')).toHaveText('Spoken: Shift Command P');
  await page.selectOption('#opt-platform', 'other');
  expect((await measure(page, '#play-shortcut')).texts).toEqual(['Ctrl', 'Shift', 'P']);
  await expect(page.getByTestId('spoken')).toHaveText('Spoken: Control Shift P');
  await page.locator('#opt-keys').fill('alt + f4');
  expect((await measure(page, '#play-shortcut')).texts).toEqual(['Alt', 'F4']);
  await page.locator('#opt-keys').fill('Mod+Ctrl+x');
  expect((await measure(page, '#play-shortcut')).texts).toEqual(['Ctrl', 'X']); // Mod and Ctrl are one modifier on other
  await page.selectOption('#opt-platform', 'mac');
  expect((await measure(page, '#play-shortcut')).texts).toEqual(['⌃', '⌘', 'X']);

  // Difficult content: unknown literal shown as written, empty token dropped, lowercase canonicalized.
  expect((await measure(page, '#unknown')).texts).toEqual(['⌘', 'Foo']);
  expect((await measure(page, '#empty-token')).texts).toEqual(['Ctrl', 'K']);
  expect((await measure(page, '#long-literal')).texts).toEqual(['Ctrl', 'NumLock']);
  expect((await measure(page, '#lowercase')).texts).toEqual(['Ctrl', 'Shift', 'A']);
});

test('the accessible name is the spoken equivalent, glyphs and separators are never read, label replaces it', async ({
  page
}) => {
  // Hosts that take their name from content read the hidden words, not the glyphs.
  await expect(page.locator('#menu-item-0')).toHaveAccessibleName('Undo Command Z');
  await expect(page.locator('#menu-item-3')).toHaveAccessibleName('Delete line Shift Command K');
  await expect(page.locator('#tooltip')).toHaveAccessibleName('Save changes Control S');
  await expect(page.locator('#tooltip-label')).toHaveAccessibleName('Enregistrer Commande S');
  const m = await measure(page, '#combo-mod-k-mac');
  expect(m.containerHidden).toBe('true');
  expect(m.name).toBe('Command K');
  // kbd semantics: a kbd root holding one kbd per key, no ARIA role or aria-label.
  const semantics = await page.locator('#combo-mod-k-mac').evaluate((el) => ({
    root: el.tagName,
    keys: [...el.querySelectorAll('.ggb-shortcut__key')].map((k) => k.tagName),
    role: el.getAttribute('role'),
    ariaLabel: el.getAttribute('aria-label')
  }));
  expect(semantics).toEqual({ root: 'KBD', keys: ['KBD', 'KBD'], role: null, ariaLabel: null });
  // The hidden words take no visible space.
  const hidden = await page.locator('#combo-mod-k-mac .ggb-shortcut__name').boundingBox();
  expect(hidden!.width).toBeLessThanOrEqual(1);
  expect(hidden!.height).toBeLessThanOrEqual(1);
  // label through the playground.
  await page.locator('#opt-label').fill('Palette de commandes');
  await expect(page.locator('#play-shortcut .ggb-shortcut__name')).toHaveText('Palette de commandes');
  await page.locator('#opt-label').fill('   ');
  await expect(page.locator('#play-shortcut .ggb-shortcut__name')).toHaveText('Control Shift P');
  // Inside a Button the trailing slot is hidden by the Button itself.
  await expect(page.locator('#button-accent-solid')).toHaveAccessibleName('Save');
});

test('keycaps are the line box plus two borders tall, at least as wide as tall, spaced by keyGap; plain draws nothing', async ({
  page
}) => {
  for (const density of densities) {
    await page.selectOption('#ctx-density', density);
    const tokens = tokensFor(`base-light-${density}`);
    const gap = px(tokens['space.content.xs']);
    const border = px(tokens['border.width.default']);
    for (const size of sizes) {
      const font = typography(tokens[`typography.indicator.${size}`]);
      const lineBox = font.fontSize.value * font.lineHeight;
      for (const platform of platforms) {
        const single = await measure(page, `#single-${size}-keycap-${platform}`);
        expect(single.keyHeights[0], `${density} ${size} cap height`).toBeCloseTo(lineBox + 2 * border, 1);
        // Contract: at least as wide as tall, so a single character is square unless its glyph plus the inline
        // padding is wider than the square (comfortable density: 6 px padding). Chromium resolves 1lh a fraction
        // of a pixel above the laid-out line box (0.17 px at 11 px), hence the half-pixel tolerance.
        expect(single.keyWidths[0], `${density} ${size} single cap never narrower than tall`).toBeGreaterThanOrEqual(
          single.keyHeights[0] - 0.01
        );
        const content = single.textWidths[0] + 2 * gap + 2 * border;
        expect(
          single.keyWidths[0] - Math.max(single.keyHeights[0], content),
          `${density} ${size} single cap: square, or as wide as its glyph and padding`
        ).toBeLessThanOrEqual(0.5);
        expect(single.paddingBlock).toBe('0px 0px');
        expect(single.paddingInline).toBe(`${gap}px`);
        expect(single.borderWidth).toBe(`${border}px`);
        const wide = await measure(page, `#wide-${size}-keycap-${platform}`);
        for (const [i, h] of wide.keyHeights.entries()) {
          expect(h, `${density} ${size} ${platform} key ${i} height`).toBeCloseTo(lineBox + 2 * border, 1);
          expect(wide.keyWidths[i]).toBeGreaterThanOrEqual(h - 0.01);
        }
        // Consecutive items (cap, cap on mac; cap, +, cap on other) are keyGap apart; the separator is outside any cap.
        for (let i = 1; i < wide.items.length; i++)
          expect(wide.items[i].left - wide.items[i - 1].right, `${density} ${size} ${platform} gap ${i}`).toBeCloseTo(
            gap,
            1
          );
        if (platform === 'other') {
          expect(wide.items.map((i) => i.cls)).toEqual([
            'ggb-shortcut__key',
            'ggb-shortcut__separator',
            'ggb-shortcut__key'
          ]);
          const sep = await page
            .locator(`#wide-${size}-keycap-${platform} .ggb-shortcut__separator`)
            .evaluate((el) => ({
              bg: getComputedStyle(el).backgroundColor,
              border: getComputedStyle(el).borderTopWidth
            }));
          expect(sep).toEqual({ bg: 'rgba(0, 0, 0, 0)', border: '0px' });
        }
        const plain = await measure(page, `#wide-${size}-plain-${platform}`);
        expect(plain.surface).toBe('rgba(0, 0, 0, 0)');
        expect(plain.borderWidth).toBe('0px');
        expect(plain.paddingInline).toBe('0px');
        expect(plain.gap).toBe('0px');
        expect(plain.keyHeights[0]).toBeCloseTo(lineBox, 1);
      }
    }
  }
});

test('inherits the content color inside every Button intent, appearance and state, and in menu items', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  await page.mouse.move(0, 0);
  for (const intent of intents)
    for (const appearance of buttonAppearances) {
      const button = page.locator(`#button-${intent}-${appearance}`);
      const shortcut = `#button-${intent}-${appearance} .ggb-shortcut`;
      const expectInherited = async (state: string) => {
        const color = await button.evaluate((el) => getComputedStyle(el).color);
        expect(color, `${intent} ${appearance} ${state}`).toBe(
          rgb(tokens[`color.action.${intent}.${appearance}.${state}.content`])
        );
        const m = await measure(page, shortcut);
        expect(m.color, `${intent} ${appearance} ${state} root`).toBe(color);
        expect(m.keyColor, `${intent} ${appearance} ${state} key`).toBe(color);
        expect(m.separatorColor, `${intent} ${appearance} ${state} separator`).toBe(color);
        expect(m.surface).toBe('rgba(0, 0, 0, 0)');
      };
      await expectInherited('default');
      await button.hover();
      await expectInherited('hover');
      await page.mouse.move(0, 0);
    }
  // Disabled and loading parents: the shortcut follows them through the inherited color.
  const disabledColor = await page.locator('#button-disabled').evaluate((el) => getComputedStyle(el).color);
  expect(disabledColor).toBe(rgb(tokens['color.action.accent.solid.disabled.content']));
  expect((await measure(page, '#button-disabled .ggb-shortcut')).keyColor).toBe(disabledColor);
  await expect(page.locator('#button-loading .ggb-button__trailing')).toHaveCSS('opacity', '0');
  // Sizes: the Button's size passed unchanged gives the indicator typography of that size.
  for (const size of sizes) {
    const m = await measure(page, `#button-size-${size} .ggb-shortcut`);
    expect(m.fontSize).toBe(`${typography(tokens[`typography.indicator.${size}`]).fontSize.value}px`);
    const color = await page.locator(`#button-size-${size}`).evaluate((el) => getComputedStyle(el).color);
    expect(m.color).toBe(color);
  }
  // A menu item colors its shortcut; disabled falls back to the item's disabled color.
  const item = await page.locator('#menu-item-0 .ggb-shortcut').evaluate((el) => getComputedStyle(el).color);
  expect(item).toBe(rgb(tokens['color.content.tertiary']));
  const disabledItem = await page.locator('#menu-item-disabled').evaluate((el) => getComputedStyle(el).color);
  expect(await page.locator('#menu-item-disabled .ggb-shortcut').evaluate((el) => getComputedStyle(el).color)).toBe(
    disabledItem
  );
});

test('one line never wrapped or truncated, baseline aligned, UA kbd styles reset', async ({ page }) => {
  const m = await measure(page, '#nowrap');
  expect(m.whiteSpace).toBe('nowrap');
  expect(m.verticalAlign).toBe('baseline');
  expect(m.display).toBe('flex'); // blockified: a flex item of the constrained box
  expect(m.keyFontFamily).toBe(m.fontFamily);
  expect(m.fontFamily.startsWith('Inter')).toBe(true);
  expect(m.keyFontSize).toBe(m.fontSize);
  for (const width of [24, 80, 320]) {
    await page.locator('#width').evaluate((el: HTMLInputElement, w) => {
      el.value = String(w);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, width);
    const g = await page.locator('#nowrap').evaluate((el) => {
      const keys = [...el.querySelectorAll('.ggb-shortcut__key')].map((k) => k.getBoundingClientRect());
      return {
        rootHeight: el.getBoundingClientRect().height,
        keyHeight: keys[0].height,
        tops: keys.map((k) => Math.round(k.top)),
        overflow: el.scrollWidth > (el.parentElement as HTMLElement).clientWidth
      };
    });
    expect(g.rootHeight, `${width}px: one line`).toBeCloseTo(g.keyHeight, 0);
    expect(new Set(g.tops).size, `${width}px: keys on one row`).toBe(1);
    expect(g.overflow).toBe(width < 320);
  }
  // Baseline: the key text sits on the baseline of the surrounding text (same bottom of the glyph box within 1 px
  // of the caps text baseline), for plain and keycap in running text.
  const baseline = await page.locator('.baseline').evaluate((p) => {
    const range = document.createRange();
    const textNode = [...p.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())!;
    range.selectNodeContents(textNode);
    const text = range.getBoundingClientRect();
    const key = (id: string) => {
      const k = document.querySelector(`#${id} .ggb-shortcut__key`)!;
      const r = document.createRange();
      r.selectNodeContents(k);
      return r.getBoundingClientRect();
    };
    const plain = key('inline-plain');
    const keycap = key('inline-keycap');
    // Compare the bottom of the inline text boxes: with the same font and no descender difference the baselines
    // coincide when the box bottoms are offset by the half-leading difference only.
    const descent = (r: DOMRect, size: number) => r.bottom - (r.height - size) / 2;
    return {
      text: descent(text, 14),
      plain: descent(plain, 12),
      keycap: descent(keycap, 12)
    };
  });
  expect(Math.abs(baseline.plain - baseline.text)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(baseline.keycap - baseline.text)).toBeLessThanOrEqual(1.5);
  // Right to left keeps the resolved order in reading direction.
  const rtl = await page.locator('#rtl').evaluate((el) => {
    const x = [...el.querySelectorAll('.ggb-shortcut__key')].map((k) => k.getBoundingClientRect().left);
    return x[0] > x[1];
  });
  expect(rtl).toBe(true);
});

test('computed values match the resolved tokens for every size, appearance and platform in every context', async ({
  page
}) => {
  test.setTimeout(240_000);
  const records: Record<string, unknown>[] = [];
  const record = (context: string, props: Record<string, string>, part: string, values: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(values))
      records.push({ context, props, state: 'default', part, property, value });
  };
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        for (const size of sizes)
          for (const appearance of appearances)
            for (const platform of platforms) {
              const props = { size, appearance, platform };
              const m = await measure(page, `#size-${size}-${appearance}-${platform}`);
              const font = typography(tokens[`typography.indicator.${size}`]);
              const lineBox = font.fontSize.value * font.lineHeight;
              const label = `${context} ${size} ${appearance} ${platform}`;
              expect(m.fontSize, label).toBe(`${font.fontSize.value}px`);
              expect(m.fontWeight, label).toBe(String(font.fontWeight));
              expect(parseFloat(m.lineHeight), label).toBeCloseTo(lineBox, 5);
              expect(m.letterSpacing, label).toBe(
                font.letterSpacing?.value ? `${font.letterSpacing.value}px` : 'normal'
              );
              expect(m.fontFeatureSettings, label).toBe('"tnum"');
              expect(m.color, label).toBe(rgb(tokens['color.content.primary'])); // the page color, inherited
              expect(m.keyColor, label).toBe(m.color);
              if (platform === 'other') expect(m.separatorColor, label).toBe(m.color);
              const gap = px(tokens['space.content.xs']);
              const border = px(tokens['border.width.default']);
              if (appearance === 'keycap') {
                expect(m.surface, label).toBe(rgb(tokens['color.surface.subtle']));
                expect(m.borderColor, label).toBe(rgb(tokens['color.border.default']));
                expect(m.borderWidth, label).toBe(`${border}px`);
                expect(m.borderStyle, label).toBe('solid');
                expect(m.radius, label).toBe(`${px(tokens['radius.control'])}px`);
                expect(m.paddingInline, label).toBe(`${gap}px`);
                expect(m.gap, label).toBe(`${gap}px`);
                expect(m.keyHeights[0], label).toBeCloseTo(lineBox + 2 * border, 1);
                expect(parseFloat(m.minInlineSize), label).toBeCloseTo(lineBox + 2 * border, 1);
              } else {
                expect(m.surface, label).toBe('rgba(0, 0, 0, 0)');
                expect(m.borderWidth, label).toBe('0px');
                expect(m.radius, label).toBe('0px');
                expect(m.paddingInline, label).toBe('0px');
                expect(m.gap, label).toBe('0px');
                expect(m.keyHeights[0], label).toBeCloseTo(lineBox, 1);
              }
              record(context, props, 'container', {
                'font-size': m.fontSize,
                'font-weight': m.fontWeight,
                'line-height': m.lineHeight,
                'letter-spacing': m.letterSpacing,
                'font-feature-settings': m.fontFeatureSettings,
                color: m.color,
                gap: m.gap,
                'white-space': m.whiteSpace
              });
              record(context, props, 'key', {
                color: m.keyColor,
                'background-color': m.surface,
                'border-color': m.borderColor,
                'border-width': m.borderWidth,
                'border-radius': m.radius,
                'padding-inline': m.paddingInline,
                'padding-block': m.paddingBlock,
                'min-inline-size': m.minInlineSize,
                'block-size': m.keyHeights[0],
                'inline-size': m.keyWidths[0]
              });
              if (platform === 'other') record(context, props, 'separator', { color: m.separatorColor, text: '+' });
            }
      }
  fs.mkdirSync(out, { recursive: true });
  // One record per line keeps the evidence file reviewable in diffs.
  fs.writeFileSync(
    `${out}/computed.json`,
    `{ "records": [\n${records.map((r) => JSON.stringify(r)).join(',\n')}\n] }\n`
  );
  expect(records.length).toBeGreaterThan(0);
});

test('forced colors keep a visible keycap boundary', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const key = page.locator('#size-md-keycap-other .ggb-shortcut__key').first();
  await expect(key).toHaveCSS('border-top-style', 'solid');
  await expect(key).toHaveCSS('border-top-width', '1px');
  const colors = await key.evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: s.borderTopColor, background: s.backgroundColor, text: s.color };
  });
  expect(colors.border).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.border).not.toBe(colors.background);
  expect(colors.text).not.toBe(colors.background);
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  fs.mkdirSync(out, { recursive: true });
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    // Documented exception (user decision, 2026-10-14): a plain shortcut is attenuated to opacity.muted, which
    // takes its hint text below 4.5:1 inside solid and some outline/ghost Buttons. Every other violation fails.
    const exception = (target: string) => /\.ggb-button__trailing.*data-appearance="plain"/.test(target);
    const violations = results.violations.flatMap((v) =>
      v.nodes
        .filter((n) => !(v.id === 'color-contrast' && n.target.every((t) => exception(String(t)))))
        .map((n) => `${v.id}: ${n.target}`)
    );
    expect(violations).toEqual([]);
    await page.screenshot({ path: `${out}/review-${mode}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `${out}/review-mobile.png`, fullPage: true });
});

test('a plain shortcut is attenuated beside its label; a keycap is not', async ({ page }) => {
  const tokens = tokensFor('base-light-standard');
  const muted = String(tokens['opacity.muted'].$value);
  await page.selectOption('#opt-appearance', 'plain');
  await expect(page.locator('#play-shortcut')).toHaveCSS('opacity', muted);
  await page.selectOption('#opt-appearance', 'keycap');
  await expect(page.locator('#play-shortcut')).toHaveCSS('opacity', '1');
  await expect(page.getByTestId('menu-shortcut').first()).toHaveCSS('opacity', muted);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.selectOption('#opt-appearance', 'plain');
  await expect(page.locator('#play-shortcut')).toHaveCSS('opacity', '1');
});
