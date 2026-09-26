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
test('sparse brand inherits complete colors while overriding radius', () => {
  const base = resolveSources(sources('base', 'dark', 'compact')).tokens;
  const brand = resolveSources(sources('brand-a', 'dark', 'compact')).tokens;
  assert.equal((brand['radius.control'].$value as { value: number }).value, 8);
  assert.deepEqual(
    brand['color.action.danger.ghost.pressed.content'],
    base['color.action.danger.ghost.pressed.content']
  );
});
test('density affects spacing without altering typography, icons or target', () => {
  const a = resolveSources(sources('brand-b', 'light', 'compact')).tokens,
    b = resolveSources(sources('brand-b', 'light', 'comfortable')).tokens;
  assert.notDeepEqual(a['size.control.md'], b['size.control.md']);
  for (const p of ['size.target.min', 'size.icon.md', 'typography.label.md']) assert.deepEqual(a[p], b[p]);
});
test('loading aliases default and remains independent of disabled values', () => {
  const t = resolveSources(sources('brand-b', 'dark', 'standard')).tokens;
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

// Layered CSS parity: applying the cascade for a context and resolving var() must give the
// same literal values as the resolved JSON map. A minimal resolver, not a CSS engine.
import { buildLayeredCss, cssSourceValue } from '../tooling/lib/css.ts';
import { config, cssValue } from '../tooling/lib/tokens.ts';
function cascade(css: string, attrs: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const m of css.matchAll(/^([^{\n]+) \{\n([\s\S]*?)\n\}/gm)) {
    const selectors = [...m[1].matchAll(/\[data-ggb-(\w+)(?:="([^"]+)")?\]/g)];
    if (!selectors.every(([, k, v]) => (v === undefined ? k in attrs : attrs[k] === v))) continue;
    for (const line of m[2].split('\n')) {
      const match = line.match(/^\s*(--[^:]+): (.+);$/);
      if (!match) throw Error('Unexpected line: ' + line);
      vars[match[1]] = match[2];
    }
  }
  const resolve = (v: string, depth = 0): string => {
    if (depth > 20) throw Error('deep');
    return v.replace(/var\((--[^)]+)\)/g, (_, n: string) => {
      if (!(n in vars)) throw Error('unset ' + n);
      return resolve(vars[n], depth + 1);
    });
  };
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, resolve(v)]));
}
test('layered CSS resolves to the same values as the resolved maps in every context', () => {
  const cfg = config();
  const css = buildLayeredCss(cfg);
  let compared = 0;
  for (const brand of cfg.brands)
    for (const appearance of cfg.appearances)
      for (const density of cfg.densities) {
        const vars = cascade(css, { brand, appearance, density });
        const tokens = resolveSources(sources(brand, appearance, density)).tokens;
        for (const [p, t] of Object.entries(tokens)) {
          const name = '--ggb-' + p.replaceAll('.', '-');
          assert.ok(name in vars, `${name} missing for ${brand}/${appearance}/${density}`);
          assert.equal(vars[name], cssValue(t), `${name} differs for ${brand}/${appearance}/${density}`);
          compared++;
        }
      }
  assert.ok(compared > 1000);
});
test('a single overridden attribute changes only its layer', () => {
  const css = buildLayeredCss(config());
  const a = cascade(css, { brand: 'base', appearance: 'light', density: 'standard' }),
    b = cascade(css, { brand: 'base', appearance: 'light', density: 'compact' });
  assert.notEqual(a['--ggb-size-control-md'], b['--ggb-size-control-md']);
  assert.equal(a['--ggb-color-surface-canvas'], b['--ggb-color-surface-canvas']);
  assert.equal(
    cssSourceValue({ $type: 'dimension', $value: '{primitive.dimension.v4}' }),
    'var(--ggb-primitive-dimension-v4)'
  );
});
