import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAliases, resolveSources, sources } from '../tooling/lib/tokens.ts';
test('rejects missing, cyclic and differently typed aliases', () => {
  assert.throws(() => resolveAliases({ a: { $type: 'color', $value: '{missing}' } }), /Missing token/);
  assert.throws(
    () => resolveAliases({ a: { $type: 'color', $value: '{b}' }, b: { $type: 'color', $value: '{a}' } }),
    /Circular alias/
  );
  assert.throws(
    () =>
      resolveAliases({
        a: { $type: 'color', $value: '{b}' },
        b: { $type: 'dimension', $value: { value: 2, unit: 'px' } }
      }),
    /type mismatch/
  );
});
test('sparse brand inherits complete colors while overriding radius and accent ramp', () => {
  const base = resolveSources(sources('base', 'dark', 'compact')).tokens;
  const brand = resolveSources(sources('orchid', 'dark', 'compact')).tokens;
  assert.equal((brand['radius.control'].$value as { value: number }).value, 12);
  assert.deepEqual(
    brand['color.action.danger.ghost.pressed.content'],
    base['color.action.danger.ghost.pressed.content']
  );
  assert.deepEqual(brand['color.action.accent.solid.default.surface'], base['primitive.color.violet.600']);
  assert.deepEqual(base['color.action.accent.solid.default.surface'], base['primitive.color.blue.600']);
});
test('density affects spacing without altering typography, icons or target', () => {
  const a = resolveSources(sources('brick', 'light', 'compact')).tokens,
    b = resolveSources(sources('brick', 'light', 'comfortable')).tokens;
  assert.notDeepEqual(a['size.control.md'], b['size.control.md']);
  for (const p of ['size.target.min', 'size.icon.md', 'typography.label.md']) assert.deepEqual(a[p], b[p]);
});
test('loading aliases default and remains independent of disabled values', () => {
  const t = resolveSources(sources('orchid', 'dark', 'standard')).tokens;
  assert.deepEqual(
    t['color.action.accent.solid.loading.content'].$value,
    t['color.action.accent.solid.default.content'].$value
  );
  assert.notDeepEqual(
    t['color.action.accent.solid.disabled.content'].$value,
    t['color.action.accent.solid.default.content'].$value
  );
});
test('unknown configuration fails before reading overlays', () => {
  assert.throws(() => sources('typo-brand', 'light', 'standard'), /Unknown configuration/);
});

// Layered CSS parity. The resolver models what browsers do with custom properties: on each element the
// winning declaration per property is chosen by specificity then source order, var() references are
// substituted on that element (own declarations first, then values inherited from the parent), and the
// substituted value is what descendants inherit. Elements are chains of attribute sets (the root first).
import { buildLayeredCss, cssSourceValue } from '../tooling/lib/css.ts';
import { config, cssValue } from '../tooling/lib/tokens.ts';
type Attrs = Record<string, string>;
type Rule = { specificity: number; order: number; declarations: Record<string, string> };
const SIMPLE = /\[(data-ggb-\w+)(?:="([^"]+)")?\]|:root|:not\(\[(data-ggb-\w+)\]\)/g;
/** Parse the stylesheet into rules; a selector list yields one rule per selector. */
function parse(css: string): Rule[] {
  const rules: Rule[] = [];
  let order = 0;
  for (const m of css.matchAll(/^([^{\n]+) \{\n([\s\S]*?)\n\}/gm)) {
    const declarations: Record<string, string> = {};
    for (const line of m[2].split('\n')) {
      const match = line.match(/^\s*(--[^:]+): (.+);$/);
      if (!match) throw Error('Unexpected line: ' + line);
      declarations[match[1]] = match[2];
    }
    for (const selector of m[1].split(', ')) {
      const parts = [...selector.matchAll(SIMPLE)];
      if (parts.map((p) => p[0]).join('') !== selector) throw Error('Unsupported selector: ' + selector);
      const matches = (attrs: Attrs, isRoot: boolean) =>
        parts.every(([whole, attr, value, notAttr]) =>
          whole === ':root'
            ? isRoot
            : notAttr
              ? !(notAttr in attrs)
              : value === undefined
                ? attr in attrs
                : attrs[attr] === value
        );
      rules.push({ specificity: parts.length, order: order++, declarations, ...{ matches } } as Rule & {
        matches: typeof matches;
      });
    }
  }
  return rules;
}
/** Computed custom properties of the last element of a chain of attribute sets. */
function computed(css: string, chain: Attrs[]): Record<string, string> {
  const rules = parse(css) as (Rule & { matches: (a: Attrs, r: boolean) => boolean })[];
  let inherited: Record<string, string> = {};
  chain.forEach((attrs, index) => {
    const own: Record<string, { value: string; specificity: number; order: number }> = {};
    for (const rule of rules) {
      if (!rule.matches(attrs, index === 0)) continue;
      for (const [name, value] of Object.entries(rule.declarations)) {
        const current = own[name];
        if (
          !current ||
          rule.specificity > current.specificity ||
          (rule.specificity === current.specificity && rule.order > current.order)
        )
          own[name] = { value, specificity: rule.specificity, order: rule.order };
      }
    }
    const result: Record<string, string> = { ...inherited };
    const resolve = (v: string, depth = 0): string => {
      if (depth > 20) throw Error('deep');
      return v.replace(/var\((--[^)]+)\)/g, (_, n: string) => {
        const source = own[n]?.value ?? inherited[n];
        if (source === undefined) throw Error('unset ' + n);
        return resolve(source, depth + 1);
      });
    };
    for (const [name, decl] of Object.entries(own)) result[name] = resolve(decl.value);
    inherited = result;
  });
  return inherited;
}
const cfg = config();
const css = buildLayeredCss(cfg);
const name = (p: string) => '--ggb-' + p.replaceAll('.', '-');
const expectContext = (
  vars: Record<string, string>,
  brand: string,
  appearance: string,
  density: string,
  only?: RegExp
) => {
  let compared = 0;
  for (const [p, t] of Object.entries(resolveSources(sources(brand, appearance, density)).tokens)) {
    if (only && !only.test(p)) continue;
    assert.ok(name(p) in vars, `${name(p)} missing for ${brand}/${appearance}/${density}`);
    assert.equal(vars[name(p)], cssValue(t), `${name(p)} differs for ${brand}/${appearance}/${density}`);
    compared++;
  }
  return compared;
};
test('layered CSS resolves to the same values as the resolved maps in every context', () => {
  let compared = 0;
  for (const brand of cfg.brands)
    for (const appearance of cfg.appearances)
      for (const density of cfg.densities)
        compared += expectContext(
          computed(css, [{ 'data-ggb-brand': brand, 'data-ggb-appearance': appearance, 'data-ggb-density': density }]),
          brand,
          appearance,
          density
        );
  assert.ok(compared > 1000);
});
test('without any attribute the document is base with the default appearance and density', () => {
  expectContext(computed(css, [{}]), 'base', cfg.defaults.appearance, cfg.defaults.density);
});
test('a brand attribute alone gets that brand with the default appearance and density', () => {
  for (const brand of cfg.brands)
    expectContext(
      computed(css, [{}, { 'data-ggb-brand': brand }]),
      brand,
      cfg.defaults.appearance,
      cfg.defaults.density
    );
});
test('appearance or density can be overridden alone in a subtree', () => {
  const root = { 'data-ggb-brand': 'brick', 'data-ggb-appearance': 'light', 'data-ggb-density': 'standard' };
  expectContext(computed(css, [root, { 'data-ggb-appearance': 'dark' }]), 'brick', 'dark', 'standard');
  expectContext(computed(css, [root, { 'data-ggb-density': 'compact' }]), 'brick', 'light', 'compact');
  expectContext(
    computed(css, [root, {}, { 'data-ggb-appearance': 'dark' }, { 'data-ggb-density': 'comfortable' }]),
    'brick',
    'dark',
    'comfortable'
  );
});
test('a brand switch in a subtree works when it restates appearance and density, and only then', () => {
  const root = { 'data-ggb-brand': 'base', 'data-ggb-appearance': 'dark', 'data-ggb-density': 'compact' };
  expectContext(
    computed(css, [root, { 'data-ggb-brand': 'orchid', 'data-ggb-appearance': 'dark', 'data-ggb-density': 'compact' }]),
    'orchid',
    'dark',
    'compact'
  );
  // Documented limitation: a brand attribute alone re-declares the default appearance and density on its
  // element (the ancestor's dark and compact roles were computed with the ancestor's palette and cannot
  // follow the new brand), so the subtree is orchid with the defaults, not orchid dark compact.
  expectContext(
    computed(css, [root, { 'data-ggb-brand': 'orchid' }]),
    'orchid',
    cfg.defaults.appearance,
    cfg.defaults.density
  );
});

test('an explicit attribute on the same element wins over the default of its axis', () => {
  const vars = computed(css, [{ 'data-ggb-brand': 'base', 'data-ggb-appearance': 'dark' }]);
  expectContext(vars, 'base', 'dark', cfg.defaults.density);
  assert.equal(
    cssSourceValue({ $type: 'dimension', $value: '{primitive.dimension.v4}' }),
    'var(--ggb-primitive-dimension-v4)'
  );
});

// Palette generation and color math used by the foundations check.
import { contrast, luminance, oklchToSrgb, toHex } from '../tooling/lib/color.ts';
import { generatePalette } from '../tooling/generate-palette.ts';
import { readJson } from '../tooling/lib/paths.ts';
import fs from 'node:fs';
test('OKLCH conversion hits sRGB anchors and stays in gamut', () => {
  assert.equal(toHex(oklchToSrgb(1, 0, 0)), '#ffffff');
  assert.equal(toHex(oklchToSrgb(0, 0, 0)), '#000000');
  assert.equal(toHex(oklchToSrgb(0.5, 0, 0)), '#636363');
  for (const c of [oklchToSrgb(0.7, 0.4, 30), oklchToSrgb(0.9, 0.3, 120)]) assert.ok(c.every((x) => x >= 0 && x <= 1));
  assert.equal(Math.round(contrast([1, 1, 1], [0, 0, 0])), 21);
  assert.equal(Math.round(luminance([1, 1, 1])), 1);
});
test('the committed palette is exactly what the committed parameters generate', () => {
  const generated = JSON.stringify(generatePalette(readJson('foundations/palette.config.json')), null, 2) + '\n';
  const committed = fs.readFileSync(
    new URL('../foundations/tokens/base/primitives/colors.tokens.json', import.meta.url),
    'utf8'
  );
  assert.equal(generated, committed);
});
test('every hue ramp shares the lightness steps so one index has comparable contrast', () => {
  const colors = resolveSources(sources('base', 'light', 'standard')).tokens;
  const hues = ['red', 'orange', 'amber', 'yellow', 'green', 'teal', 'cyan', 'blue', 'violet', 'pink'];
  for (const hue of hues) {
    const c600 = (colors[`primitive.color.${hue}.600`].$value as { components: [number, number, number] }).components;
    const c500 = (colors[`primitive.color.${hue}.500`].$value as { components: [number, number, number] }).components;
    assert.ok(contrast(c600, [1, 1, 1]) >= 4.5, `${hue}.600 on white`);
    assert.ok(contrast(c500, [1, 1, 1]) >= 3, `${hue}.500 on white`);
  }
});
