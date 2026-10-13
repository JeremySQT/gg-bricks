import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

type Token = { $type: string; $value: unknown };
type TokenMap = Record<string, Token>;
type Color = { components: number[]; alpha?: number };

const out = 'reports/components/button/svelte';
const intents = ['accent', 'neutral', 'danger'];
const appearances = ['solid', 'outline', 'ghost'];
const sizes = ['sm', 'md', 'lg'];
const brands = ['base', 'brick', 'orchid'];
const modes = ['light', 'dark'];
const densities = ['compact', 'standard', 'comfortable'];
/** Contexts measured for every state; all 18 contexts are measured for the default state. */
const representative = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];

const tokensFor = (context: string): TokenMap =>
  JSON.parse(fs.readFileSync(`packages/tokens/resolved/${context}.json`, 'utf8'));
const rgb = (t: Token): string => {
  const c = t.$value as Color;
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  const a = c.alpha ?? 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};
const px = (t: Token): number => (t.$value as { value: number }).value;

async function setContext(page: Page, brand: string, mode: string, density: string) {
  await page.selectOption('#ctx-brand', brand);
  await page.selectOption('#ctx-mode', mode);
  await page.selectOption('#ctx-density', density);
}

/** Computed values of one button: root color, container surface, border (outline inset shadow) and geometry. */
async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const container = el.querySelector('.ggb-button__container') as HTMLElement;
    const c = getComputedStyle(container);
    const r = container.getBoundingClientRect();
    return {
      content: getComputedStyle(el).color,
      surface: c.backgroundColor,
      boxShadow: c.boxShadow,
      outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} ${c.outlineOffset}`,
      radius: c.borderTopLeftRadius,
      paddingInline: c.paddingInlineStart,
      paddingBlock: c.paddingBlockStart,
      gap: c.columnGap,
      labelMargin: getComputedStyle(el.querySelector('.ggb-button__label')!).marginInlineStart,
      fontSize: getComputedStyle(el).fontSize,
      fontWeight: getComputedStyle(el).fontWeight,
      letterSpacing: getComputedStyle(el).letterSpacing,
      height: r.height,
      width: r.width
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/button/');
  await page.evaluate(() => document.fonts.ready);
});

test('activation by pointer, Enter and Space; forms submit and reset only on request', async ({ page }) => {
  const action = page.locator('#play-action');
  await expect(action).toHaveRole('button');
  await expect(action).toHaveAccessibleName('Save changes');
  await action.click();
  await action.press('Enter');
  await action.press('Space');
  await expect(page.getByTestId('activations')).toHaveText('Activations: 3');

  await page.locator('#ordinary').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 0');
  await page.locator('#submit').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 1');
  await page.locator('#reset').click();
  await expect(page.getByTestId('resets')).toHaveText('Resets: 1');
  await page.locator('#item-name').fill('');
  await page.locator('#submit').click();
  await expect(page.getByTestId('submissions')).toHaveText('Submissions: 1');
});

test('loading keeps focus, name and width, and blocks activation, submission and navigation', async ({ page }) => {
  const action = page.locator('#play-action');
  await page.check('#opt-leading');
  await page.selectOption('#opt-trailing', 'counter');
  await action.focus();
  const before = await action.boundingBox();
  await page.locator('#opt-loading').evaluate((el: HTMLInputElement) => el.click());
  await expect(action).toBeFocused();
  await expect(action).toHaveAccessibleName('Save changes');
  await expect(action).toHaveAttribute('aria-busy', 'true');
  // aria-disabled signals that activation is unavailable, but the native control stays enabled and focusable.
  expect(await action.evaluate((el) => (el as HTMLButtonElement).disabled)).toBe(false);
  expect(await action.boundingBox()).toEqual(before);
  await expect(action.locator('.ggb-button__loadingIndicator svg')).toBeVisible();
  await expect(action.locator('.ggb-button__label')).toHaveCSS('opacity', '0');
  await action.press('Enter');
  await action.press('Space');
  await action.evaluate((el: HTMLElement) => el.click());
  await expect(page.getByTestId('activations')).toHaveText('Activations: 0');

  const link = page.locator('#play-link');
  await expect(link).toHaveAttribute('href', '#new-item');
  await link.focus();
  await link.press('Enter');
  await link.click({ force: true }); // aria-disabled makes Playwright wait for an enabled element
  expect(new URL(page.url()).hash).toBe('');

  // Asynchronous example: repeated presses while busy are ignored.
  const async = page.locator('#async');
  await async.click();
  await expect(async).toHaveAttribute('aria-busy', 'true');
  await async.click({ force: true });
  await async.press('Enter');
  await expect(async).not.toHaveAttribute('aria-busy');
  await expect(page.getByTestId('saved')).toHaveText('Saved: 1');

  // Disabled wins; the indicator stays visible.
  await page.check('#opt-disabled');
  await expect(action).toBeDisabled();
  await expect(action).toHaveAttribute('data-disabled', '');
  await expect(action).not.toHaveAttribute('aria-busy');
  await expect(action.locator('.ggb-button__loadingIndicator svg')).toBeVisible();
});

test('disabled leaves the tab order and never navigates; links keep link semantics', async ({ page }) => {
  const link = page.locator('#link');
  await expect(link).toHaveRole('link');
  await expect(link).toHaveAccessibleName('Create project');
  await link.press('Enter');
  expect(new URL(page.url()).hash).toBe('#new-item');

  const disabledLink = page.locator('#link-disabled');
  await expect(disabledLink).not.toHaveAttribute('href');
  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');

  // Real keyboard walk from the control before the playground to the first option after it.
  const tabWalk = async () => {
    await page.locator('#ctx-targets').focus();
    const visited: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => document.activeElement?.id ?? '');
      if (id === 'opt-intent') return visited;
      visited.push(id);
    }
    throw Error(`Tab never reached the options: ${visited.join(', ')}`);
  };
  expect(await tabWalk()).toEqual(['play-action', 'play-link']);
  await page.check('#opt-loading');
  expect(await tabWalk()).toEqual(['play-action', 'play-link']); // loading stays in the tab order
  await page.uncheck('#opt-loading');
  await page.check('#opt-disabled');
  expect(await tabWalk()).toEqual([]); // disabled leaves it, for the button and the link

  // A disabled button cannot take focus at all; a disabled link leaves the sequential focus order.
  await page.locator('#play-action').evaluate((el: HTMLElement) => el.focus());
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe('play-action');
  await expect(page.locator('#play-link')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#play-link')).not.toHaveAttribute('href');
  await page.locator('#play-action').evaluate((el: HTMLElement) => el.click());
  await expect(page.getByTestId('activations')).toHaveText('Activations: 0');
});

test('slot content is decorative, inherits the content color and uses the icon size', async ({ page }) => {
  const both = page.locator('#slot-both');
  await expect(both).toHaveAccessibleName('Download');
  await expect(both.locator('.ggb-button__leading')).toHaveAttribute('aria-hidden', 'true');
  await expect(both.locator('.ggb-button__trailing')).toHaveAttribute('aria-hidden', 'true');
  const tokens = tokensFor('base-light-standard');
  for (const size of sizes) {
    const b = page.locator(`#slot-size-${size}`);
    const color = await b.evaluate((el) => getComputedStyle(el).color);
    const icon = await b.locator('.ggb-button__leading svg').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height, fill: getComputedStyle(el).fill };
    });
    expect(icon.w).toBe(px(tokens[`size.icon.${size}`]));
    expect(icon.h).toBe(px(tokens[`size.icon.${size}`]));
    expect(icon.fill).toBe(color);
    await expect(b.locator('[data-testid="fixture-counter"]')).toHaveCSS('color', color);
  }
  // Spacing: the icon drawing sits at edgeInline + slotInline from the edge and slotInline + labelInline from
  // the label; without slots the label is edgeInline + labelInline from both edges.
  for (const size of sizes) {
    const edge = px(tokens[`space.control.edge-inline.${size}`]);
    const label = px(tokens[`space.control.label-inline.${size}`]);
    const slot = px(tokens[`space.control.slot-inline.${size}`]);
    const g = await page.locator(`#slot-size-${size}`).evaluate((el) => {
      const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
      // The drawing (path bounds), not the svg box: spacing is optical.
      const lead = el.querySelector('.ggb-button__leading path')!.getBoundingClientRect();
      const text = el.querySelector('.ggb-button__label')!.getBoundingClientRect();
      const trail = el.querySelector('.ggb-button__trailing')!.getBoundingClientRect();
      return [lead.left - c.left, text.left - lead.right, trail.left - text.right, c.right - trail.right];
    });
    expect(g).toEqual([edge + slot, slot + label, label + slot, slot + edge]);
    const plain = await page.locator(`#short-${size}`).evaluate((el) => {
      const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
      const text = el.querySelector('.ggb-button__label')!.getBoundingClientRect();
      return [text.left - c.left, c.right - text.right];
    });
    expect(plain).toEqual([edge + label, edge + label]);
  }
  // Order: leading, label, trailing, in both directions.
  for (const id of ['#slot-both', '#rtl']) {
    const order = await page.locator(id).evaluate((el) => {
      const x = (s: string) => el.querySelector(s)!.getBoundingClientRect().left;
      return [x('.ggb-button__leading'), x('.ggb-button__label'), x('.ggb-button__trailing')];
    });
    const rtl = id === '#rtl';
    expect(rtl ? order[0] > order[1] && order[1] > order[2] : order[0] < order[1] && order[1] < order[2]).toBe(true);
  }
});

test('long labels truncate without losing the name; targets reach 44 px without growing the surface', async ({
  page
}) => {
  const long = 'Create a new item with a deliberately long action label';
  const button = page.locator('#truncated');
  await expect(button).toHaveAccessibleName(long);
  const label = await button.locator('.ggb-button__label').evaluate((el) => ({
    visible: el.querySelector('[aria-hidden="true"]')?.textContent ?? '',
    hidden: el.querySelector('.ggb-button__name')?.textContent ?? '',
    whiteSpace: getComputedStyle(el).whiteSpace,
    textOverflow: getComputedStyle(el).textOverflow
  }));
  // The component renders the truncated text (ending with an ellipsis) and keeps the whole label, visually
  // hidden, as the accessible name; the native one-line ellipsis stays as the no-script fallback.
  expect(label.visible.endsWith('…')).toBe(true);
  expect(long.startsWith(label.visible.slice(0, -1).trimEnd())).toBe(true);
  expect(label.visible.length).toBeLessThan(long.length);
  expect(label.hidden).toBe(long);
  expect(label.whiteSpace).toBe('nowrap');
  expect(label.textOverflow).toBe('ellipsis');
  const box = await button.boundingBox();
  const parent = await page.locator('.constrained').evaluate((el) => el.clientWidth);
  expect(box!.width).toBeLessThanOrEqual(parent);

  for (const density of densities) {
    await page.selectOption('#ctx-density', density);
    const tokens = tokensFor(`base-light-${density}`);
    for (const size of sizes) {
      const m = await page.locator(`#short-${size}`).evaluate((el) => {
        const target = el.getBoundingClientRect();
        const before = getComputedStyle(el, '::before');
        const surface = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
        return {
          targetHeight: target.height,
          targetWidth: Math.max(target.width, parseFloat(before.width)),
          surfaceHeight: surface.height,
          surfaceWidth: surface.width,
          rootWidth: target.width
        };
      });
      expect(m.targetHeight).toBeGreaterThanOrEqual(44);
      expect(m.targetWidth).toBeGreaterThanOrEqual(44);
      expect(m.surfaceHeight).toBe(px(tokens[`size.control.${size}`]));
      expect(m.surfaceWidth).toBe(m.rootWidth);
    }
  }
  // The layout can stretch the button; the visible surface follows.
  const stretched = await page
    .locator('#stretched')
    .evaluate((el) => [
      el.getBoundingClientRect().width,
      el.querySelector('.ggb-button__container')!.getBoundingClientRect().width,
      el.parentElement!.clientWidth
    ]);
  expect(stretched[0]).toBeCloseTo(stretched[2], 0);
  expect(stretched[1]).toBeCloseTo(stretched[0], 1);
});

/**
 * Ink extent of a button's rendered pixels, in CSS px relative to its container: rows and columns whose
 * color differs from the container surface. Decoded in the page from a 4x screenshot.
 */
async function ink(page: Page, selector: string, region: 'label' | 'container' = 'container') {
  const box = await page.locator(selector).evaluate((el, region) => {
    const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
    const l = el.querySelector('.ggb-button__label')!.getBoundingClientRect();
    const bg = getComputedStyle(el.querySelector('.ggb-button__container')!).backgroundColor;
    const r = region === 'label' ? l : c;
    return { x: r.left - c.left, w: r.width, h: c.height, labelBottom: l.bottom - c.top, bg };
  }, region);
  const shot = await page.locator(`${selector} .ggb-button__container`).screenshot();
  return page.evaluate(
    async ({ b64, box }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const g = canvas.getContext('2d')!;
      g.drawImage(img, 0, 0);
      const s = Math.round(img.height / box.h); // device pixel ratio; the captured box may round up a row
      const data = g.getImageData(0, 0, img.width, img.height).data;
      const bg = box.bg.match(/\d+/g)!.slice(0, 3).map(Number);
      const on = (x: number, y: number) => {
        const i = (y * img.width + x) * 4;
        return Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 150;
      };
      const x0 = Math.floor(box.x * s);
      const x1 = Math.min(img.width, Math.ceil((box.x + box.w) * s));
      // The capture box is rounded to whole pixels and may add a partial row: locate the surface rows in
      // the image (a column just inside the container edge, outside the text) instead of assuming row 0.
      const xs = Math.max(0, Math.floor(Math.min(box.x - 2, 4) * s));
      const surface = (y: number) => !on(xs, y);
      let first = -1;
      let last = -1;
      for (let y = 0; y < img.height; y++)
        if (surface(y)) {
          if (first < 0) first = y;
          last = y;
        }
      let top = -1;
      let bottom = -1;
      let left = -1;
      let right = -1;
      for (let y = first + Math.ceil(2 * s); y < last - 2 * s; y++)
        for (let x = x0; x < x1; x++)
          if (on(x, y)) {
            if (top < 0) top = y;
            bottom = y;
            if (left < 0 || x < left) left = x;
            if (x > right) right = x;
          }
      return {
        top: (top - first) / s,
        bottom: (bottom + 1 - first) / s,
        left: left / s,
        right: (right + 1) / s,
        height: (last + 1 - first) / s,
        labelBottom: box.labelBottom
      };
    },
    { b64: shot.toString('base64'), box }
  );
}

test('the label is centered on its capital letters, keeps descenders and ends at the ellipsis', async ({ page }) => {
  // Capital letters (no overshoot) centered in the surface, measured on pixels.
  for (const [size, id] of [
    ['sm', '#matrix-accent-solid-sm'],
    ['md', '#state-default-solid'],
    ['lg', '#matrix-accent-solid-lg']
  ]) {
    await page.locator(id).evaluate((el) => (el.querySelector('.ggb-button__label')!.textContent = 'HEH'));
    const m = await ink(page, id, 'label');
    expect(Math.abs((m.top + m.bottom) / 2 - m.height / 2), `${size} capital letters centered`).toBeLessThanOrEqual(
      0.5
    );
  }
  // Descenders below the trimmed label box are painted, not clipped.
  const d = await ink(page, '#slot-leading', 'label');
  await expect(page.locator('#slot-leading .ggb-button__label')).toHaveText('New project');
  expect(d.bottom).toBeGreaterThan(d.labelBottom + 1);

  // Tight ellipsis: the label box ends at the visible ellipsis and trailing keeps its spacing, at any width.
  const tokens = tokensFor('base-light-standard');
  const gap = px(tokens['space.control.label-inline.md']) + px(tokens['space.control.slot-inline.md']);
  const label = page.locator('#truncated .ggb-button__label');
  const shownText = () => label.evaluate((el) => el.querySelector('[aria-hidden="true"]')?.textContent ?? null);
  let previous = await shownText();
  for (const width of [150, 175, 200, 225, 250, 300]) {
    await page.locator('#width').evaluate((el: HTMLInputElement, w) => {
      el.value = String(w);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, width);
    // The component re-fits after the ResizeObserver fires: wait for the new truncated copy (each width
    // fits a different number of characters), not just for any truncated copy left from the previous width.
    await expect.poll(shownText, { message: `${width}px: refitted` }).not.toBe(previous);
    previous = await shownText();
    expect(previous, `${width}px truncates`).not.toBeNull();
    const m = await ink(page, '#truncated', 'label');
    const box = await page.locator('#truncated').evaluate((el) => {
      const l = el.querySelector('.ggb-button__label')!.getBoundingClientRect();
      const tr = el.querySelector('.ggb-button__trailing')!.getBoundingClientRect();
      const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
      return { labelRight: l.right - c.left, trailingLeft: tr.left - c.left };
    });
    expect(box.labelRight - m.right, `${width}px: space after the ellipsis`).toBeLessThanOrEqual(1.5);
    expect(box.trailingLeft - box.labelRight).toBeCloseTo(gap, 1);
    await expect(page.locator('#truncated')).toHaveAccessibleName(
      'Create a new item with a deliberately long action label'
    );
  }
  // With enough room the label is whole again and the box constraint is released.
  await page.locator('.constrained').evaluate((el: HTMLElement) => (el.style.inlineSize = '700px'));
  // Same refit timing: the truncated copy disappears one frame after the layout grows, so wait for that.
  await expect.poll(shownText, { message: '700px: truncated copy released' }).toBeNull();
  expect(await label.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(label).toHaveText('Create a new item with a deliberately long action label');
});

test('computed values match the resolved tokens for every option, state and context', async ({ page }) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no transitions: read settled values
  const records: Record<string, unknown>[] = [];
  const record = (context: string, props: Record<string, string>, state: string, values: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(values)) records.push({ context, props, state, property, value });
  };
  const expectColors = (
    tokens: TokenMap,
    intent: string,
    appearance: string,
    state: string,
    m: Awaited<ReturnType<typeof measure>>
  ) => {
    const role = (r: string, a = appearance) => tokens[`color.action.${intent}.${a}.${state}.${r}`];
    expect(m.content, `${intent} ${appearance} ${state} content`).toBe(rgb(role('content')));
    expect(m.surface, `${intent} ${appearance} ${state} surface`).toBe(rgb(role('surface')));
    if (appearance === 'outline')
      expect(m.boxShadow).toBe(
        `${rgb(role('border', 'outline'))} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
    else expect(m.boxShadow).toBe('none');
  };

  // Default state and geometry in all 18 contexts, for every intent x appearance x size.
  for (const brand of brands)
    for (const mode of modes)
      for (const density of densities) {
        const context = `${brand}-${mode}-${density}`;
        const tokens = tokensFor(context);
        await setContext(page, brand, mode, density);
        await page.mouse.move(0, 0);
        for (const intent of intents)
          for (const appearance of appearances)
            for (const size of sizes) {
              const m = await measure(page, `#matrix-${intent}-${appearance}-${size}`);
              expectColors(tokens, intent, appearance, 'default', m);
              const font = tokens[`typography.label.${size}`].$value as {
                fontSize: { value: number };
                fontWeight: number;
                letterSpacing?: { value: number };
              };
              expect(m.radius).toBe(`${px(tokens['radius.control'])}px`);
              expect(m.paddingInline).toBe(`${px(tokens[`space.control.edge-inline.${size}`])}px`);
              expect(m.paddingBlock).toBe(`${px(tokens[`space.control.padding-block.${size}`])}px`);
              expect(m.gap).toBe('normal');
              expect(m.labelMargin).toBe(`${px(tokens[`space.control.label-inline.${size}`])}px`);
              expect(m.fontSize).toBe(`${font.fontSize.value}px`);
              expect(m.fontWeight).toBe(String(font.fontWeight));
              expect(m.letterSpacing).toBe(font.letterSpacing?.value ? `${font.letterSpacing.value}px` : 'normal');
              expect(m.height).toBe(px(tokens[`size.control.${size}`]));
              record(context, { intent, appearance, size }, 'default', m);
            }
      }

  // Every interaction state on a representative set of contexts, through the playground button.
  const action = page.locator('#play-action');
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of intents)
      for (const appearance of appearances) {
        await page.selectOption('#opt-intent', intent);
        await page.selectOption('#opt-appearance', appearance);
        const props = { intent, appearance, size: 'md' };
        await action.hover();
        const hover = await measure(page, '#play-action');
        expectColors(tokens, intent, appearance, 'hover', hover);
        record(context, props, 'hover', hover);
        await page.mouse.down();
        const pressed = await measure(page, '#play-action');
        expectColors(tokens, intent, appearance, 'pressed', pressed);
        record(context, props, 'pressed', pressed);
        await page.mouse.up();
        await page.mouse.move(0, 0);
        await page.locator('#opt-appearance').focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        await action.focus();
        await page.keyboard.press('Shift');
        const focus = await measure(page, '#play-action');
        const focusExpected = `solid ${px(tokens['focus.width'])}px ${rgb(tokens['color.focus.ring'])} ${px(tokens['focus.offset'])}px`;
        expect(focus.outline).toBe(focusExpected);
        record(context, props, 'focus', focus);
        await page.locator('#opt-loading').evaluate((el: HTMLInputElement) => el.click());
        const loading = await measure(page, '#play-action');
        expectColors(tokens, intent, appearance, 'loading', loading);
        record(context, props, 'loading', loading);
        await page.locator('#opt-loading').evaluate((el: HTMLInputElement) => el.click());
        await page.locator('#opt-disabled').evaluate((el: HTMLInputElement) => el.click());
        const disabled = await measure(page, '#play-action');
        expectColors(tokens, intent, appearance, 'disabled', disabled);
        record(context, props, 'disabled', disabled);
        await page.locator('#opt-disabled').evaluate((el: HTMLInputElement) => el.click());
        await page.mouse.move(0, 0);
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

test('transitions follow the motion tokens and stop under reduced motion; forced colors stay usable', async ({
  page
}) => {
  const tokens = tokensFor('base-light-standard');
  const container = page.locator('#play-action .ggb-button__container');
  const duration = (tokens['motion.duration.fast'].$value as { value: number }).value;
  await expect(container).toHaveCSS('transition-duration', `${duration / 1000}s`);
  await expect(container).toHaveCSS('transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(container).toHaveCSS('transition-duration', '0s');
  await page.check('#opt-loading');
  await expect(page.locator('#play-action .ggb-button__loadingIndicator svg')).toHaveCSS('animation-duration', '2.4s');

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await expect(page.locator('#matrix-accent-ghost-md .ggb-button__container')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#matrix-accent-ghost-md .ggb-button__container')).toHaveCSS('outline-width', '1px');
  await page.locator('#ordinary').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#ordinary .ggb-button__container')).toHaveCSS('outline-width', '2px');
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
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    await page.screenshot({ path: `${out}/review-${mode}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `${out}/review-mobile.png`, fullPage: true });
});
