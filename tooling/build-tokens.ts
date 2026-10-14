// Generate distributable token outputs and per-component token evidence from the JSON sources.
// Outputs: packages/tokens/* (resolved maps, CSS, Figma manifest and expectations),
// reports/tokens/traces/* and reports/components/<id>/* for every component contract.
import { paths, write } from './lib/paths.ts';
import { resolveAllContexts, config, cssVariable } from './lib/tokens.ts';
import { buildLayeredCss } from './lib/css.ts';
import { checkContract, expandCombinations, resolveTemplate } from './lib/contract.ts';
import { listComponents } from './lib/catalog.ts';
import type { Color, Dimension, ResolvedToken, Shadow, TokenMap, Typography } from './lib/types.ts';

type Rgb = [number, number, number];
interface ContrastRecord {
  context: string;
  backdrop: string;
  role: 'content' | 'border' | 'focus';
  ratio: number;
  minimum: number | null;
  passed: boolean;
  [param: string]: string | number | boolean | null;
}
type FigmaValue = { r: number; g: number; b: number; a: number } | number | string | { alias: string };
interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: { r: number; g: number; b: number; a: number };
  offset: { x: number; y: number };
  radius: number;
  spread: number;
}
interface FigmaVariable {
  collection: string;
  name: string;
  path: string;
  type: 'COLOR' | 'FLOAT' | 'STRING';
  scopes: string[];
  codeSyntax?: { WEB: string };
  values: Record<string, FigmaValue>;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;
const lum = (c: Rgb) =>
  c.reduce(
    (sum, x, i) => sum + [0.2126, 0.7152, 0.0722][i] * (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4),
    0
  );
const ratio = (a: Rgb, b: Rgb) => round((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05));
const blend = (f: Color, b: Rgb): Rgb =>
  f.components.map((v, i) => v * (f.alpha ?? 1) + b[i] * (1 - (f.alpha ?? 1))) as Rgb;
const colorOf = (t: ResolvedToken) => t.$value as Color;
const dimOf = (t: ResolvedToken) => t.$value as Dimension;

const cfg = config();
const contexts = resolveAllContexts();
const components = listComponents();
const reportFor = (id: string) => `${paths.reports}/components/${id}`;

// 1. Validate every source token and every contract against every context.
for (const ctx of contexts) {
  for (const [p, v] of Object.entries(ctx.tokens)) {
    if (v.$type === 'dimension') {
      const x = dimOf(v);
      // Letter-spacing (tracking) is the one dimension family allowed to be negative.
      const negativeAllowed = /\.tracking\./.test(p);
      if (!Number.isFinite(x.value) || (x.value < 0 && !negativeAllowed) || x.unit !== 'px')
        throw Error('Invalid dimension ' + p);
    }
    if (v.$type === 'duration') {
      const x = dimOf(v);
      if (!Number.isFinite(x.value) || x.value < 0 || x.unit !== 'ms') throw Error('Invalid duration ' + p);
    }
    if (v.$type === 'number' && !Number.isFinite(v.$value as number)) throw Error('Invalid number ' + p);
    if (v.$type === 'color') {
      const x = colorOf(v);
      if (
        x.colorSpace !== 'srgb' ||
        x.components.length !== 3 ||
        x.components.some((c) => c < 0 || c > 1) ||
        (x.alpha !== undefined && (x.alpha < 0 || x.alpha > 1))
      )
        throw Error('Invalid color ' + p);
    }
  }
  for (const c of components) {
    const check = checkContract(c.contract, { tokens: ctx.tokens });
    if (!check.valid) throw Error(`Contract ${c.id} fails in ${ctx.id}: ` + JSON.stringify(check.errors.slice(0, 5)));
  }
}

// 2. Resolved maps, provenance traces and the layered CSS (see tooling/lib/css.ts).
const flatten = (tokens: TokenMap): TokenMap => {
  const flat: TokenMap = {};
  for (const [p, v] of Object.entries(tokens)) {
    if (v.$type === 'typography') {
      const ty = v.$value as Typography;
      const fontSize = ty.fontSize as Dimension;
      flat[p + '.fontSize'] = { $type: 'dimension', $value: fontSize };
      flat[p + '.lineHeight'] = {
        $type: 'dimension',
        $value: { value: (ty.lineHeight as number) * fontSize.value, unit: 'px' }
      };
      if (ty.letterSpacing) flat[p + '.letterSpacing'] = { $type: 'dimension', $value: ty.letterSpacing as Dimension };
      // Figma text styles bind their family, weight, size and letter spacing to variables; the line-height
      // ratio is kept as a percentage string (Figma cannot bind a percentage) and typed in the style.
      flat[p + '.fontFamily'] = { $type: 'fontFamily', $value: ty.fontFamily };
      flat[p + '.fontWeight'] = { $type: 'fontWeight', $value: ty.fontWeight };
      flat[p + '.lineHeightRatio'] = { $type: 'number', $value: ty.lineHeight as number };
    }
    flat[p] = v;
  }
  return flat;
};
for (const ctx of contexts) {
  write(`${paths.tokensPackage}/resolved/${ctx.id}.json`, ctx.tokens);
  write(`${paths.reports}/tokens/traces/${ctx.id}.json`, ctx.trace);
}
write(`${paths.tokensPackage}/tokens.css`, buildLayeredCss(cfg));

// 3. Per-component evidence: coverage, contrast on documented backdrops, minimum target.
const summary: Record<string, { requiredPaths: number; contrastChecks: number; contrastFailures: number }> = {};
for (const c of components) {
  const contract = c.contract;
  const requirements = checkContract(contract).requiredTokenPaths;
  const combos = expandCombinations(contract);
  const coverage: { context: string; coverage: string }[] = [];
  const contrast: ContrastRecord[] = [];
  for (const ctx of contexts) {
    const t = ctx.tokens;
    coverage.push({ context: ctx.id, coverage: checkContract(contract, { tokens: t }).checks.tokenCoverage });
    if ('minTarget' in contract.tokens && dimOf(t[resolveTemplate(contract, 'minTarget', {})]).value < 44)
      throw Error(`${c.id}: minimum target below 44 in ${ctx.id}`);
    const scope = c.status?.contrastScope;
    const backdrops = Object.entries(t)
      .filter(([p, v]) => /^color\.surface\.[a-z-]+$/.test(p) && v.$type === 'color')
      .map(([p, v]): [string, Rgb] => [p.split('.').pop() ?? p, colorOf(v).components])
      .filter(([name]) => !scope || scope.backdrops.includes(name));
    if (scope && backdrops.length !== scope.backdrops.length)
      throw Error(`${c.id}: contrastScope names a backdrop that is not a color.surface.* role in ${ctx.id}`);
    const appearance = ctx.id.split('-')[1];
    const exempt = (role: string, backdrop: string) =>
      (scope?.informational ?? []).some(
        (x) => x.role === role && x.backdrop === backdrop && (!x.appearance || x.appearance === appearance)
      );
    for (const [backdrop, bg] of backdrops) {
      if (combos.surface && combos.content) {
        for (const { params, path } of combos.content) {
          const surface = blend(colorOf(t[resolveTemplate(contract, 'surface', params)]), bg);
          const informational = Object.values(params).includes('disabled') || exempt('content', backdrop);
          const r = ratio(blend(colorOf(t[path]), surface), surface);
          contrast.push({
            context: ctx.id,
            backdrop,
            ...params,
            role: 'content',
            ratio: r,
            minimum: informational ? null : 4.5,
            passed: informational || r >= 4.5
          });
        }
      }
      if (combos.border) {
        for (const { params, path } of combos.border) {
          if (Object.values(params).includes('disabled')) continue;
          const r = ratio(colorOf(t[path]).components, bg);
          const minimum = exempt('border', backdrop) ? null : 3;
          contrast.push({
            context: ctx.id,
            backdrop,
            ...params,
            role: 'border',
            ratio: r,
            minimum,
            passed: minimum === null || r >= minimum
          });
        }
      }
      if (combos.focusColor) {
        const r = ratio(colorOf(t[combos.focusColor[0].path]).components, bg);
        const minimum = exempt('focus', backdrop) ? null : 3;
        contrast.push({
          context: ctx.id,
          backdrop,
          role: 'focus',
          ratio: r,
          minimum,
          passed: minimum === null || r >= minimum
        });
      }
    }
  }
  write(`${reportFor(c.id)}/token-requirements.json`, requirements);
  write(`${reportFor(c.id)}/token-coverage.json`, {
    contexts: contexts.length,
    requiredPaths: requirements.length,
    records: coverage
  });
  write(`${reportFor(c.id)}/contract-validation.json`, checkContract(contract, { tokens: contexts[0].tokens }));
  if (contrast.length) {
    const failures = contrast.filter((x) => !x.passed);
    write(`${reportFor(c.id)}/contrast.json`, {
      method:
        'WCAG relative luminance; alpha composited on each color.surface.* backdrop of the status contrastScope (all of them when absent). Parameters valued "disabled" and contrastScope.informational pairs are informational (minimum null), not a conformance claim.',
      checks: contrast.length,
      failures,
      minimumActiveText: Math.min(
        ...contrast.filter((x) => x.role === 'content' && x.minimum !== null).map((x) => x.ratio)
      ),
      results: contrast
    });
    if (failures.length) process.exitCode = 1;
  }
  summary[c.id] = {
    requiredPaths: requirements.length,
    contrastChecks: contrast.length,
    contrastFailures: contrast.filter((x) => !x.passed).length
  };
}

// 4. Figma adapter manifest. Axis routing is derived from the source file that defines each token
// (appearance.* → Appearance, density.* → Density, otherwise Brand). A primitive whose value is the same
// for every brand goes to the single-mode Primitives collection; a primitive a brand overrides stays in
// Brand with one value per brand mode. Values mirror the source aliases:
// a semantic variable aliases the palette or primitive variable it references, so the Figma chain reads
// like the token files. A technical `_resolved/*` variable (Brand collection, hidden) is emitted only when
// a token cannot be expressed as one alias per mode (a brand overlay of an appearance or density file,
// or an alias across the Appearance and Density axes); it is compilation detail, not a source layer.
const base = contexts.find((c) => c.id === `base-${cfg.defaults.appearance}-${cfg.defaults.density}`);
if (!base) throw Error('Base context missing');
const ctxById = Object.fromEntries(contexts.map((c) => [c.id, c]));
const flatByContext: Record<string, TokenMap> = Object.fromEntries(
  contexts.map((c) => [
    c.id,
    Object.fromEntries(
      Object.entries(flatten(c.tokens)).filter(([, v]) =>
        ['color', 'dimension', 'number', 'fontFamily', 'fontWeight'].includes(v.$type)
      )
    )
  ])
);
type Axis = 'Appearance' | 'Density' | 'Brand';
const derived = /\.(fontSize|lineHeight|letterSpacing|fontFamily|fontWeight|lineHeightRatio)$/;
const axisOf = (p: string): Axis => {
  const source = (base.trace[p] ?? base.trace[p.replace(derived, '')] ?? []).at(-1)?.source ?? '';
  return /\/appearance\./.test(source) ? 'Appearance' : /\/density\./.test(source) ? 'Density' : 'Brand';
};
/** Raw source value of a flat token path in one context (an alias string, a literal, or a derived value). */
const rawIn = (ctxId: string, p: string): unknown => {
  const ctx = ctxById[ctxId];
  const m = p.match(derived);
  if (!m) return ctx.trace[p].at(-1)?.value;
  const ty = (ctx.trace[p.replace(derived, '')].at(-1)?.value ?? {}) as Typography;
  if (m[1] === 'fontSize') return ty.fontSize;
  if (m[1] === 'letterSpacing') return ty.letterSpacing;
  if (m[1] === 'fontFamily') return ty.fontFamily;
  if (m[1] === 'fontWeight') return ty.fontWeight;
  if (m[1] === 'lineHeightRatio') return ty.lineHeight;
  return figmaValueOf(p, flatByContext[ctxId][p]); // line height in px is computed, never an alias
};
const scopes = (p: string): string[] =>
  p.startsWith('primitive.')
    ? []
    : p.startsWith('opacity.')
      ? ['OPACITY']
      : p.startsWith('layer.')
        ? []
        : p.includes('radius')
          ? ['CORNER_RADIUS']
          : p.includes('padding') || p.includes('gap') || p.startsWith('space.control.')
            ? ['GAP']
            : p.endsWith('fontFamily')
              ? ['FONT_FAMILY']
              : p.endsWith('fontWeight')
                ? ['FONT_WEIGHT']
                : p.endsWith('lineHeightRatio')
                  ? []
                  : p.endsWith('fontSize')
                    ? ['FONT_SIZE']
                    : p.endsWith('lineHeight')
                      ? ['LINE_HEIGHT']
                      : p.endsWith('letterSpacing')
                        ? ['LETTER_SPACING']
                        : /\.(content|contentStrong|placeholder|link|onAccent)$/.test(p) ||
                            p.startsWith('color.content')
                          ? ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR']
                          : p.includes('focus.ring') || p.endsWith('.border') || p.startsWith('color.border.')
                            ? ['STROKE_COLOR']
                            : p.startsWith('color.')
                              ? ['FRAME_FILL', 'SHAPE_FILL']
                              : p.includes('width')
                                ? ['STROKE_FLOAT']
                                : ['WIDTH_HEIGHT'];
const convert = (t: ResolvedToken): FigmaValue => {
  if (t.$type === 'color') {
    const c = colorOf(t);
    return { r: c.components[0], g: c.components[1], b: c.components[2], a: c.alpha ?? 1 };
  }
  if (t.$type === 'number') return t.$value as number;
  return dimOf(t).value;
};
/** Figma reads a number bound to layer opacity as a percentage: opacity tokens are emitted ×100 (0.7 → 70). */
const isOpacity = (p: string) => p.startsWith('opacity.') || p.startsWith('primitive.opacity.');
/** Line-height ratios are emitted as percentage strings ("140%"): Figma cannot bind a percentage, the text styles type it. */
const isLineHeightRatio = (p: string) => p.startsWith('primitive.font.lineHeight.') || p.endsWith('.lineHeightRatio');
const figmaTypeOf = (p: string, t: ResolvedToken): FigmaVariable['type'] =>
  t.$type === 'color' ? 'COLOR' : t.$type === 'fontFamily' || isLineHeightRatio(p) ? 'STRING' : 'FLOAT';
const figmaValueOf = (p: string, t: ResolvedToken): FigmaValue => {
  // Figma needs one installed family: the first of the stack.
  if (t.$type === 'fontFamily') return (Array.isArray(t.$value) ? t.$value[0] : t.$value) as string;
  if (t.$type === 'fontWeight') return t.$value as number;
  if (isLineHeightRatio(p)) return `${Math.round((t.$value as number) * 100 * 1000) / 1000}%`;
  return isOpacity(p) ? Math.round((convert(t) as number) * 100 * 10000) / 10000 : convert(t);
};
const figmaName = (p: string) => p.replaceAll('.', '/');
const primitivesMode = 'default';
const manifest: {
  collections: Record<string, string[]>;
  /** Default mode per collection (what a node without an explicit mode resolves to), from config defaults. */
  defaults: Record<string, string>;
  variables: FigmaVariable[];
  typography: {
    name: string;
    family: string;
    style: string;
    size: number;
    lineHeight: number;
    lineHeightPercent: number;
    letterSpacing: number;
    features: string[];
    variables: Record<'fontFamily' | 'fontWeight' | 'fontSize' | 'letterSpacing', string>;
  }[];
  effects: { name: string; layers: FigmaEffect[] }[];
} = {
  collections: {
    Primitives: [primitivesMode],
    Brand: cfg.brands,
    Appearance: cfg.appearances,
    Density: cfg.densities
  },
  defaults: {
    Primitives: primitivesMode,
    Brand: cfg.brands[0],
    Appearance: cfg.defaults.appearance,
    Density: cfg.defaults.density
  },
  variables: [],
  typography: [],
  effects: []
};
const isVariable = (p: string) => p in flatByContext[base.id];
/** Primitives shared by every brand live in the Primitives collection; brand-specific ones stay in Brand. */
const sharedPrimitive = (p: string): boolean =>
  p.startsWith('primitive.') &&
  axisOf(p) === 'Brand' &&
  cfg.brands.every(
    (b) =>
      JSON.stringify(figmaValueOf(p, flatByContext[`${b}-${base.appearance}-${base.density}`][p])) ===
      JSON.stringify(figmaValueOf(p, flatByContext[`${cfg.brands[0]}-${base.appearance}-${base.density}`][p]))
  );
const collectionOf = (p: string): string => (sharedPrimitive(p) ? 'Primitives' : axisOf(p));
/** Alias target expressed for Figma, or null when the source alias cannot be one Figma alias for this axis. */
const aliasFor = (raw: unknown, axis: Axis): FigmaValue | null => {
  if (typeof raw !== 'string' || !/^\{[^{}]+\}$/.test(raw)) return null;
  const q = raw.slice(1, -1);
  if (!isVariable(q)) return null;
  const target = collectionOf(q);
  if (target === 'Primitives' || target === 'Brand' || target === axis) return { alias: `${target}:${figmaName(q)}` };
  return null;
};
const isAliasString = (raw: unknown) => typeof raw === 'string' && /^\{[^{}]+\}$/.test(raw);
for (const p of Object.keys(flatByContext[base.id])) {
  const type = figmaTypeOf(p, flatByContext[base.id][p]);
  const axis = axisOf(p);
  const codeSyntax = { WEB: `var(${cssVariable(p)})` };
  const at = (brand: string, appearance: string, density: string) =>
    figmaValueOf(p, flatByContext[`${brand}-${appearance}-${density}`][p]);
  if (sharedPrimitive(p)) {
    manifest.variables.push({
      collection: 'Primitives',
      name: figmaName(p),
      path: p,
      type,
      scopes: scopes(p),
      codeSyntax,
      values: { [primitivesMode]: at(cfg.brands[0], base.appearance, base.density) }
    });
    continue;
  }
  if (axis === 'Brand') {
    manifest.variables.push({
      collection: 'Brand',
      name: figmaName(p),
      path: p,
      type,
      scopes: scopes(p),
      codeSyntax,
      values: Object.fromEntries(
        cfg.brands.map((b) => {
          const raw = rawIn(`${b}-${base.appearance}-${base.density}`, p);
          return [b, aliasFor(raw, 'Brand') ?? at(b, base.appearance, base.density)];
        })
      )
    });
    continue;
  }
  const modes = axis === 'Appearance' ? cfg.appearances : cfg.densities;
  const ctxOf = (b: string, m: string) =>
    axis === 'Appearance' ? `${b}-${m}-${base.density}` : `${b}-${base.appearance}-${m}`;
  const values: Record<string, FigmaValue> = {};
  let expressible = true;
  for (const mode of modes) {
    const raws = cfg.brands.map((b) => JSON.stringify(rawIn(ctxOf(b, mode), p) ?? null));
    const raw = rawIn(ctxOf(cfg.brands[0], mode), p);
    const sameAcrossBrands = raws.every((r) => r === raws[0]);
    const alias = aliasFor(raw, axis);
    if (!sameAcrossBrands || (isAliasString(raw) && !alias)) {
      expressible = false;
      break;
    }
    values[mode] =
      alias ??
      at(
        cfg.brands[0],
        ...((axis === 'Appearance' ? [mode, base.density] : [base.appearance, mode]) as [string, string])
      );
  }
  if (!expressible) {
    for (const mode of modes) {
      const name = `_resolved/${axis.toLowerCase()}/${mode}/${figmaName(p)}`;
      manifest.variables.push({
        collection: 'Brand',
        name,
        path: p,
        type,
        scopes: [],
        values: Object.fromEntries(cfg.brands.map((b) => [b, figmaValueOf(p, flatByContext[ctxOf(b, mode)][p])]))
      });
      values[mode] = { alias: `Brand:${name}` };
    }
  }
  manifest.variables.push({
    collection: axis,
    name: figmaName(p),
    path: p,
    type,
    scopes: scopes(p),
    codeSyntax,
    values
  });
}
const styleNames: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black'
};
for (const [p, v] of Object.entries(base.tokens)) {
  if (v.$type !== 'typography') continue;
  const ty = v.$value as Typography;
  const fontSize = ty.fontSize as Dimension;
  manifest.typography.push({
    name: figmaName(p),
    family: (ty.fontFamily as string[])[0],
    style: styleNames[ty.fontWeight as number] ?? String(ty.fontWeight),
    size: fontSize.value,
    lineHeight: (ty.lineHeight as number) * fontSize.value,
    lineHeightPercent: Math.round((ty.lineHeight as number) * 100 * 1000) / 1000,
    letterSpacing: (ty.letterSpacing as Dimension | undefined)?.value ?? 0,
    features: ty.fontFeatures ?? [],
    // Variables the text style binds (family, weight, size, letter spacing); the line height is typed as a percentage.
    variables: {
      fontFamily: `${figmaName(p)}/fontFamily`,
      fontWeight: `${figmaName(p)}/fontWeight`,
      fontSize: `${figmaName(p)}/fontSize`,
      letterSpacing: `${figmaName(p)}/letterSpacing`
    }
  });
}
// Semantic shadow roles become effect styles (one drop-shadow layer per composed shadow).
for (const [p, v] of Object.entries(base.tokens)) {
  if (v.$type !== 'shadow' || p.startsWith('primitive.')) continue;
  const list = (Array.isArray(v.$value) ? v.$value : [v.$value]) as Shadow[];
  manifest.effects.push({
    name: figmaName(p),
    layers: list.map((s) => ({
      type: s.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
      color: convert({ $type: 'color', $value: s.color as Color }) as { r: number; g: number; b: number; a: number },
      offset: { x: (s.offsetX as Dimension).value, y: (s.offsetY as Dimension).value },
      radius: (s.blur as Dimension).value,
      spread: (s.spread as Dimension).value
    }))
  });
}
write(`${paths.tokensPackage}/figma-manifest.json`, manifest);
const expectations: Record<string, Record<string, Record<string, FigmaValue>>> = {};
for (const ctx of contexts) {
  (expectations[ctx.brand] ??= {})[`${ctx.appearance}-${ctx.density}`] = Object.fromEntries(
    Object.entries(flatByContext[ctx.id])
      .filter(([p]) => !p.startsWith('primitive.'))
      .map(([p, v]) => [figmaName(p), figmaValueOf(p, v)])
  );
}
write(`${paths.tokensPackage}/figma-expectations.json`, expectations);

console.log(
  JSON.stringify({
    contexts: contexts.length,
    tokens: Object.keys(base.tokens).length,
    variables: manifest.variables.length,
    components: summary
  })
);
