import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Typography = {
  fontSize: { value: number };
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: { value: number };
  fontFeatures?: string[];
};
type Color = { components: number[]; alpha?: number };

const out = 'reports/components/counter/svelte';
const sizes = ['sm', 'md', 'lg'];
const intents = ['accent', 'neutral', 'danger'];
const appearances = ['solid', 'outline', 'ghost'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
const values = [0, 1, 8, 42, 99, 100, 1234];
/** Contexts in which the counter is measured inside Buttons; the standalone geometry is measured in all 18. */
const representative = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const px = (t: Token): number => (t.$value as { value: number }).value;
/**
 * The attenuated border color as Chromium serializes rgb(from currentColor r g b / a): a color(srgb …) with
 * six significant digits per channel.
 */
const faded = (color: string, alpha: number): string => {
  const [r, g, b] = color
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map((x) => Number((Number(x) / 255).toPrecision(6)));
  return `color(srgb ${r} ${g} ${b} / ${alpha})`;
};
const typography = (t: Token): Typography => t.$value as Typography;
const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};
/** Line box of a typography token in px (unrounded: 15.4, 16.8, 19.6 for the indicator family). */
const lineBox = (t: Token): number => typography(t).fontSize.value * typography(t).lineHeight;

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

/** Computed values and geometry of one counter: container (root) and value part. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const value = el.querySelector('.ggb-counter__value') as HTMLElement;
    const v = getComputedStyle(value);
    const vr = value.getBoundingClientRect();
    return {
      text: value.textContent ?? '',
      overflow: el.hasAttribute('data-overflow'),
      color: c.color,
      backgroundColor: c.backgroundColor,
      boxShadow: c.boxShadow,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      paddingInline: c.paddingInlineStart,
      paddingInlineEnd: c.paddingInlineEnd,
      paddingBlock: `${c.paddingBlockStart} ${c.paddingBlockEnd}`,
      borderWidth: c.borderTopWidth,
      minInlineSize: c.minInlineSize,
      fontSize: c.fontSize,
      fontWeight: c.fontWeight,
      lineHeight: c.lineHeight,
      letterSpacing: c.letterSpacing,
      fontFeatureSettings: c.fontFeatureSettings,
      fontVariantNumeric: c.fontVariantNumeric,
      whiteSpace: c.whiteSpace,
      display: c.display,
      height: r.height,
      width: r.width,
      valueColor: v.color,
      valueHeight: vr.height,
      valueWidth: vr.width,
      valueOffsetInline: vr.left - r.left,
      valueOffsetBlock: vr.top - r.top,
      // Cap-height centering applies where text-box is supported (Chromium 133+); elsewhere the line box centers.
      capTrim: CSS.supports('text-box: trim-both cap alphabetic')
    };
  });
}

/**
 * Text of an element as exposed by Chromium's accessibility tree (through CDP), concatenated in order
 * from its static text descendants: the real announced text, including the whitespace the tree keeps.
 */
async function accessibleText(page: Page, selector: string): Promise<string> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    type AxNode = (typeof nodes)[number];
    const byId = new Map<string, AxNode>(nodes.map((n) => [n.nodeId, n]));
    const start = nodes.find((n) => n.backendDOMNodeId === node.backendNodeId);
    if (!start) throw Error(`${selector} is not in the accessibility tree`);
    const parts: string[] = [];
    const walk = (n: AxNode) => {
      if (n.role?.value === 'StaticText' && !n.ignored) parts.push(String(n.name?.value ?? ''));
      for (const id of n.childIds ?? []) {
        const child = byId.get(id);
        if (child) walk(child);
      }
    };
    walk(start);
    return parts.join('');
  } finally {
    await cdp.detach();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/counter/');
  await page.evaluate(() => document.fonts.ready);
});

test('shows the value as an integer, overflows above max and exposes the derived state', async ({ page }) => {
  const format = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
  const expected: Record<number, string> = { 0: '0', 1: '1', 8: '8', 42: '42', 99: '99', 100: '99+', 1234: '99+' };
  for (const size of sizes)
    for (const value of values) {
      const counter = page.locator(`#size-${size}-value-${value}`);
      await expect(counter.locator('.ggb-counter__value')).toHaveText(expected[value]);
      await expect(counter).toHaveAttribute('data-size', size);
      if (value > 99) await expect(counter).toHaveAttribute('data-overflow', '');
      else await expect(counter).not.toHaveAttribute('data-overflow');
    }
  await expect(page.locator('#max-5 .ggb-counter__value')).toHaveText('5+');
  await expect(page.locator('#max-999 .ggb-counter__value')).toHaveText(`${format(999)}+`);
  await expect(page.locator('#max-9999 .ggb-counter__value')).toHaveText(format(1234));
  await expect(page.locator('#max-9999')).not.toHaveAttribute('data-overflow');
  await expect(page.locator('#max-grouped .ggb-counter__value')).toHaveText(format(12345));
  await expect(page.locator('#negative .ggb-counter__value')).toHaveText('0');
  await expect(page.locator('#fractional .ggb-counter__value')).toHaveText('7');
  await expect(page.locator('#nan .ggb-counter__value')).toHaveText('0');

  // Live updates through the playground: value, max and label.
  const play = page.locator('#play-counter');
  await expect(play.locator('.ggb-counter__value')).toHaveText('8');
  await page.fill('#opt-value', '150');
  await expect(play.locator('.ggb-counter__value')).toHaveText('99+');
  await expect(play).toHaveAttribute('data-overflow', '');
  await expect(page.getByTestId('shown')).toHaveText('Shown: 99+');
  await page.fill('#opt-max', '200');
  await expect(play.locator('.ggb-counter__value')).toHaveText('150');
  await expect(play).not.toHaveAttribute('data-overflow');
  await page.fill('#opt-value', '-3.5');
  await expect(play.locator('.ggb-counter__value')).toHaveText('0');
  await page.selectOption('#opt-size', 'lg');
  await expect(play).toHaveAttribute('data-size', 'lg');

  // Not interactive: no role, no tab stop, no pointer affordance.
  await expect(play).not.toHaveAttribute('role');
  await expect(play).not.toHaveAttribute('tabindex');
  await expect(play).toHaveCSS('cursor', 'auto');
  await page.locator('#opt-label').focus();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('opt-size');
});

test('the accessible text is the visible text followed by the label', async ({ page }) => {
  expect(await accessibleText(page, '#labelled')).toBe('8 unread messages');
  expect(await accessibleText(page, '#labelled-overflow')).toBe('99+ unread messages');
  expect(await accessibleText(page, '#unlabelled')).toBe('8');
  // The label is never visible: it takes no space and the box is the same as without it.
  const labelled = await page.locator('#labelled').boundingBox();
  const unlabelled = await page.locator('#unlabelled').boundingBox();
  expect(labelled!.width).toBe(unlabelled!.width);
  expect(labelled!.height).toBe(unlabelled!.height);
  await expect(page.locator('#labelled .ggb-counter__label')).toHaveCSS('position', 'absolute');
  await expect(page.locator('#labelled .ggb-counter__label')).toHaveCSS('width', '1px');
  // Playground: the label follows the option; an empty label is omitted.
  expect(await accessibleText(page, '#play-counter')).toBe('8 unread messages');
  await page.fill('#opt-label', 'selected rows');
  expect(await accessibleText(page, '#play-counter')).toBe('8 selected rows');
  await page.fill('#opt-label', '');
  await expect(page.locator('#play-counter .ggb-counter__label')).toHaveCount(0);
  expect(await accessibleText(page, '#play-counter')).toBe('8');
  // Inside a Button the trailing slot is hidden from assistive technology; the button keeps its own name.
  await expect(page.locator('#button-accent-solid')).toHaveAccessibleName('Inbox');
});

test('geometry: line-box height, square minimum, inline padding only, same height for one and two digits', async ({
  page
}) => {
  for (const density of densities) {
    await page.selectOption('#ctx-density', density);
    const tokens = tokensFor(`base-light-${density}`);
    const padding = px(tokens['space.content.xs']);
    for (const size of sizes) {
      const box = lineBox(tokens[`typography.indicator.${size}`]);
      const one = await measure(page, `#size-${size}-value-8`);
      const two = await measure(page, `#size-${size}-value-42`);
      const over = await measure(page, `#size-${size}-value-1234`);
      const zero = await measure(page, `#size-${size}-value-0`);
      // Block size is the line box of the typography whatever the digit count. With text-box support the
      // value is trimmed to its cap height and a symmetric block padding restores the line box; otherwise
      // there is no block padding and the value spans the line box.
      for (const m of [one, two, over, zero]) {
        expect(m.height, `${density} ${size} height`).toBeCloseTo(box, 1);
        const [top, bottom] = m.paddingBlock.split(' ').map(parseFloat);
        expect(top, `${density} ${size} symmetric block padding`).toBeCloseTo(bottom, 2);
        if (m.capTrim) {
          expect(top).toBeGreaterThan(0);
          expect(m.valueHeight + 2 * top, `${density} ${size} cap height plus padding`).toBeCloseTo(box, 1);
          expect(m.valueOffsetBlock, `${density} ${size} value centered`).toBeCloseTo(top, 1);
        } else {
          expect(top).toBe(0);
          expect(m.valueHeight, `${density} ${size} value line box`).toBeCloseTo(box, 1);
          expect(m.valueOffsetBlock, `${density} ${size} value centered`).toBeCloseTo(0, 1);
        }
      }
      // One digit: the minimum inline size equals the block size (a square); more digits widen the box.
      // The lh unit resolves to layout units (1/64 px): the minimum is the laid-out block size, not the decimal;
      // with cap trimming the block size is cap height plus padding, which rounds one layout unit apart.
      expect(parseFloat(one.minInlineSize), `${density} ${size} min inline size = block size`).toBeCloseTo(
        one.height,
        1
      );
      expect(parseFloat(one.minInlineSize)).toBeCloseTo(box, 1);
      // Contract: the minimum inline size equals the block size; the padded digit may exceed it (comfortable:
      // 6 px of padding on each side of an sm digit is already wider than the 15.4 px line box).
      const oneWidth = Math.max(box, one.valueWidth + 2 * padding);
      expect(one.width, `${density} ${size} one digit: max(line box, digit + padding)`).toBeCloseTo(oneWidth, 1);
      expect(zero.width).toBeCloseTo(Math.max(box, zero.valueWidth + 2 * padding), 1);
      if (one.valueWidth + 2 * padding <= box) expect(one.width, `${density} ${size} square`).toBeCloseTo(box, 1);
      expect(two.width).toBeGreaterThan(one.width);
      expect(over.width).toBeGreaterThan(two.width);
      expect(two.width, `${density} ${size} two digits: content plus padding`).toBeCloseTo(
        two.valueWidth + 2 * padding,
        1
      );
      expect(two.valueOffsetInline).toBeCloseTo(padding, 1);
      // Inline padding on both sides from the token; the single digit is centered in its square.
      expect(one.paddingInline).toBe(`${padding}px`);
      expect(one.paddingInlineEnd).toBe(`${padding}px`);
      expect(one.valueOffsetInline, `${density} ${size} single digit centered`).toBeCloseTo(
        (one.width - one.valueWidth) / 2,
        1
      );
      expect(one.whiteSpace).toBe('nowrap');
      expect(one.display).toBe('inline-grid');
    }
  }
  // Tabular figures: same width for 11 and 88 (and 10 and 99).
  const w = async (id: string) => (await page.locator(id).boundingBox())!.width;
  expect(await w('#tabular-11')).toBe(await w('#tabular-88'));
  expect(await w('#tabular-10')).toBe(await w('#tabular-99'));
  await expect(page.locator('#tabular-11')).toHaveCSS('font-feature-settings', '"tnum"');
  await expect(page.locator('#tabular-11')).toHaveCSS('font-variant-numeric', 'tabular-nums');
  // Never wrapped or truncated: a constrained parent overflows instead.
  const constrained = await page.locator('#constrained').evaluate((el) => ({
    lines: el.querySelector('.ggb-counter__value')!.getClientRects().length,
    width: el.getBoundingClientRect().width,
    parent: el.parentElement!.clientWidth,
    scroll: el.scrollWidth <= el.clientWidth
  }));
  expect(constrained.lines).toBe(1);
  expect(constrained.width).toBeGreaterThan(constrained.parent);
  expect(constrained.scroll).toBe(true);
  // Next to text: the counter sits on the text baseline (its bottom edge above the descender of the text).
  for (const size of sizes) {
    const aligned = await page.locator(`#text-${size}`).evaluate((el) => {
      const counter = el.getBoundingClientRect();
      const line = el.parentElement!.getBoundingClientRect();
      return counter.top >= line.top && counter.bottom <= line.bottom;
    });
    expect(aligned, `${size} counter inside its line`).toBe(true);
  }
});

test('the digits are centered on their cap height (ink measured)', async ({ page }) => {
  // The ink of a digit must sit within a device pixel of the centre of the box (Chromium, Inter): the line box
  // alone sits it about 0.8 px high at md. The screenshot is decoded in the page through a canvas.
  for (const size of sizes) {
    const id = `#size-${size}-value-8`;
    const m = await measure(page, id);
    test.skip(!m.capTrim, 'text-box not supported by this browser');
    const png = (await page.locator(id).screenshot({ scale: 'device' })).toString('base64');
    const offset = await page.evaluate(
      async ({ png, height }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${png}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const { data, width } = ctx.getImageData(0, 0, img.width, img.height);
        const x0 = Math.floor(width * 0.3),
          x1 = Math.ceil(width * 0.7);
        let top = -1,
          bottom = -1;
        for (let y = 0; y < img.height; y++) {
          let ink = false;
          for (let x = x0; x < x1 && !ink; x++) {
            const i = (y * width + x) * 4;
            ink = data[i] < 120 && data[i + 3] > 200;
          }
          if (ink) {
            if (top < 0) top = y;
            bottom = y;
          }
        }
        const dpr = img.height / height;
        return { centre: (top + bottom + 1) / 2 / dpr, dpr };
      },
      { png, height: m.height }
    );
    expect(Math.abs(offset.centre - m.height / 2), `${size} ink centre offset`).toBeLessThanOrEqual(1 / offset.dpr);
  }
});

test('tint and digits use the inherited content color inside every Button intent, appearance and state', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // read the host's settled color after hover and press
  const tokens = tokensFor('base-light-standard');
  const check = async (buttonId: string, expectedColor?: string) => {
    const button = page.locator(buttonId);
    const color = await button.evaluate((el) => getComputedStyle(el).color);
    if (expectedColor) expect(color, `${buttonId} content color`).toBe(expectedColor);
    const m = await measure(page, `${buttonId} .ggb-counter`);
    expect(m.color, `${buttonId} counter color`).toBe(color);
    expect(m.valueColor, `${buttonId} digits color`).toBe(color);
    expect(m.backgroundColor, `${buttonId} tint`).toBe(faded(color, tokens['opacity.tint'].$value as number));
    expect(m.boxShadow).toBe('none');
    return m;
  };
  for (const intent of intents)
    for (const appearance of appearances)
      await check(
        `#button-${intent}-${appearance}`,
        rgb(tokens[`color.action.${intent}.${appearance}.default.content`])
      );
  for (const appearance of appearances) {
    await check(`#button-disabled-${appearance}`, rgb(tokens[`color.action.neutral.${appearance}.disabled.content`]));
    await check(`#button-loading-${appearance}`, rgb(tokens[`color.action.neutral.${appearance}.loading.content`]));
    const over = await check(`#button-overflow-${appearance}`);
    expect(over.text).toBe('99+');
    expect(over.overflow).toBe(true);
    // Loading fades the whole trailing slot (Button's rule); the counter itself changes nothing.
    await expect(page.locator(`#button-loading-${appearance} .ggb-button__trailing`)).toHaveCSS('opacity', '0');
    await expect(page.locator(`#button-loading-${appearance} .ggb-counter`)).toHaveCSS('opacity', '1');
  }
  // Hover and pressed: the counter follows the host's content color without a state of its own.
  const hosted = page.locator('#button-accent-solid');
  await hosted.hover();
  await check('#button-accent-solid', rgb(tokens['color.action.accent.solid.hover.content']));
  await page.mouse.down();
  await check('#button-accent-solid', rgb(tokens['color.action.accent.solid.pressed.content']));
  await page.mouse.up();
  await page.mouse.move(0, 0);
  // The counter takes the host's size: its typography is the indicator step of the button's size.
  for (const size of sizes) {
    const m = await measure(page, `#button-size-${size} .ggb-counter`);
    const font = typography(tokens[`typography.indicator.${size}`]);
    expect(m.fontSize).toBe(`${font.fontSize.value}px`);
    expect(m.height).toBeCloseTo(lineBox(tokens[`typography.indicator.${size}`]), 1);
    // Centered in the button's surface.
    const centered = await page.locator(`#button-size-${size}`).evaluate((el) => {
      const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
      const k = el.querySelector('.ggb-counter')!.getBoundingClientRect();
      return Math.abs((k.top + k.bottom) / 2 - (c.top + c.bottom) / 2);
    });
    expect(centered).toBeLessThanOrEqual(0.5);
  }
  // Nested opposite mode: standalone text color and the outline button's content color are both inherited.
  const nestedText = await page
    .locator('#nested-standalone')
    .evaluate((el) => getComputedStyle(el.parentElement!).color);
  await expect(page.locator('#nested-standalone')).toHaveCSS('color', nestedText);
  await check('#nested-button');
});

test('computed values match the resolved tokens for every size and the overflow state in every context', async ({
  page
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // the host Button transitions its color on context change
  const records: Record<string, unknown>[] = [];
  const record = (
    context: string,
    props: Record<string, unknown>,
    state: string,
    part: string,
    values: Record<string, unknown>
  ) => {
    for (const [property, value] of Object.entries(values))
      records.push({ context, props, state, part, property, value });
  };
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        for (const size of sizes) {
          const font = typography(tokens[`typography.indicator.${size}`]);
          const box = lineBox(tokens[`typography.indicator.${size}`]);
          for (const [value, state] of [
            [8, 'default'],
            [100, 'overflow']
          ] as const) {
            const m = await measure(page, `#size-${size}-value-${value}`);
            expect(m.fontSize, `${context} ${size} font size`).toBe(`${font.fontSize.value}px`);
            expect(m.fontWeight).toBe(String(font.fontWeight));
            expect(parseFloat(m.lineHeight)).toBeCloseTo(box, 1);
            expect(m.letterSpacing).toBe(font.letterSpacing?.value ? `${font.letterSpacing.value}px` : 'normal');
            expect(m.fontFeatureSettings).toBe((font.fontFeatures ?? []).map((f) => `"${f}"`).join(', ') || 'normal');
            expect(m.radius, `${context} ${size} radius`).toBe(`${px(tokens['radius.indicator'])}px`);
            expect(m.paddingInline, `${context} ${size} padding`).toBe(`${px(tokens['space.content.xs'])}px`);
            expect(m.borderWidth).toBe('0px');
            expect(m.boxShadow).toBe('none');
            expect(m.backgroundColor, `${context} ${size} tint`).toBe(
              faded(m.color, tokens['opacity.tint'].$value as number)
            );
            expect(m.height).toBeCloseTo(box, 1);
            expect(parseFloat(m.minInlineSize)).toBeCloseTo(m.height, 1);
            expect(m.overflow).toBe(state === 'overflow');
            expect(m.text).toBe(state === 'overflow' ? '99+' : '8');
            // Standalone the counter inherits the page's primary content color.
            expect(m.color).toBe(rgb(tokens['color.content.primary']));
            const props = { size, value, max: 99 };
            record(context, props, state, 'container', {
              color: m.color,
              'background-color': m.backgroundColor,
              'border-radius': m.radius,
              'padding-inline': m.paddingInline,
              'padding-block': m.paddingBlock,
              'min-inline-size': m.minInlineSize,
              'block-size': `${m.height}px`,
              'inline-size': `${m.width}px`
            });
            record(context, props, state, 'value', {
              text: m.text,
              color: m.valueColor,
              'font-size': m.fontSize,
              'font-weight': m.fontWeight,
              'line-height': m.lineHeight,
              'letter-spacing': m.letterSpacing,
              'font-feature-settings': m.fontFeatureSettings
            });
          }
        }
      }
  // Inside Buttons on a representative set of contexts: the inherited color of each intent x appearance.
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of intents)
      for (const appearance of appearances) {
        const m = await measure(page, `#button-${intent}-${appearance} .ggb-counter`);
        const expected = rgb(tokens[`color.action.${intent}.${appearance}.default.content`]);
        expect(m.color, `${context} ${intent} ${appearance}`).toBe(expected);
        record(
          context,
          { size: 'md', value: 8, max: 99, host: `button-${intent}-${appearance}` },
          'default',
          'container',
          {
            color: m.color,
            'background-color': m.backgroundColor
          }
        );
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

test('no motion to reduce; forced colors keep the box visible with an edge in the system text color', async ({
  page
}) => {
  const counter = page.locator('#size-md-value-8');
  await expect(counter).toHaveCSS('transition-duration', '0s');
  await expect(counter).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(counter).toHaveCSS('transition-duration', '0s');

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  const tokens = tokensFor('base-light-standard');
  const border = px(tokens['border.width.default']);
  for (const id of [
    '#size-md-value-8',
    '#size-sm-value-1234',
    '#button-accent-solid .ggb-counter',
    '#button-disabled-outline .ggb-counter'
  ]) {
    const m = await measure(page, id);
    expect(m.outline, `${id} outline`).toBe(`solid ${border}px ${m.color} -${border}px`);
    // The tint is forced to the Canvas color: the edge carries the box.
    expect(m.backgroundColor, `${id} tint forced`).toMatch(/^rgba?\(\d+, \d+, \d+(, 0(\.12)?)?\)$/);
  }
  // Standalone the outline is the system text color (CanvasText); in a disabled button both follow GrayText.
  const canvasText = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'CanvasText';
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  expect((await measure(page, '#size-md-value-8')).color).toBe(canvasText);
  await page.screenshot({ path: `${out}/forced-colors.png`, fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  fs.mkdirSync(out, { recursive: true });
  for (const mode of modes) {
    await page.selectOption('#ctx-mode', mode);
    await settle(page);
    const results = await new AxeBuilder({ page })
      .include('.page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    await page.screenshot({ path: `${out}/review-${mode}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
