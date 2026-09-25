// Generate distributable token outputs and per-component token evidence from the JSON sources.
// Outputs: packages/tokens/* (resolved maps, CSS, Figma manifest and expectations),
// reports/tokens/traces/* and reports/components/<id>/* for every component contract.
import { paths, write, readJson } from './lib/paths.mjs';
import { resolveAllContexts, cssValue, cssVariable, config } from './lib/tokens.mjs';
import { checkContract, expandCombinations, resolveTemplate } from './lib/contract.mjs';
import { listComponents } from './lib/catalog.mjs';

const round = (n) => Math.round(n * 1e6) / 1e6;
const lum = (c) => c.reduce((sum, x, i) => sum + [0.2126, 0.7152, 0.0722][i] * (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4), 0);
const ratio = (a, b) => round((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05));
const blend = (f, b) => f.components.map((v, i) => v * (f.alpha ?? 1) + b[i] * (1 - (f.alpha ?? 1)));

const cfg = config();
const contexts = resolveAllContexts();
const components = listComponents();
const reportFor = (id) => `${paths.reports}/components/${id}`;

// 1. Validate every source token and every contract against every context.
for (const ctx of contexts) {
  for (const [p, v] of Object.entries(ctx.tokens)) {
    const x = v.$value;
    if (v.$type === 'dimension' && (!Number.isFinite(x.value) || x.value < 0 || x.unit !== 'px')) throw Error('Invalid dimension ' + p);
    if (v.$type === 'color' && (x.colorSpace !== 'srgb' || x.components.length !== 3 || x.components.some((c) => c < 0 || c > 1) || x.alpha < 0 || x.alpha > 1)) throw Error('Invalid color ' + p);
  }
  for (const c of components) {
    const check = checkContract(c.contract, { tokens: ctx.tokens });
    if (!check.valid) throw Error(`Contract ${c.id} fails in ${ctx.id}: ` + JSON.stringify(check.errors.slice(0, 5)));
  }
}

// 2. Resolved maps, provenance traces and CSS.
let css = '/* Generated from foundations/tokens. Do not edit. */\n';
const flatten = (tokens) => {
  const flat = {};
  for (const [p, v] of Object.entries(tokens)) {
    if (v.$type === 'typography') {
      flat[p + '.fontSize'] = { $type: 'dimension', $value: v.$value.fontSize };
      flat[p + '.lineHeight'] = { $type: 'dimension', $value: { value: v.$value.lineHeight * v.$value.fontSize.value, unit: 'px' } };
    }
    flat[p] = v;
  }
  return flat;
};
for (const ctx of contexts) {
  write(`${paths.tokensPackage}/resolved/${ctx.id}.json`, ctx.tokens);
  write(`${paths.reports}/tokens/traces/${ctx.id}.json`, ctx.trace);
  const flat = flatten(ctx.tokens);
  css += `[data-ggb-brand="${ctx.brand}"][data-ggb-appearance="${ctx.appearance}"][data-ggb-density="${ctx.density}"] {\n` +
    Object.entries(flat).map(([p, v]) => `  ${cssVariable(p)}: ${cssValue(v)};`).join('\n') + '\n}\n';
}
write(`${paths.tokensPackage}/tokens.css`, css);

// 3. Per-component evidence: coverage, contrast on documented backdrops, minimum target.
const summary = {};
for (const c of components) {
  const contract = c.contract;
  const requirements = checkContract(contract).requiredTokenPaths;
  const combos = expandCombinations(contract);
  const coverage = [];
  const contrast = [];
  for (const ctx of contexts) {
    const t = ctx.tokens;
    coverage.push({ context: ctx.id, coverage: checkContract(contract, { tokens: t }).checks.tokenCoverage });
    if ('minTarget' in contract.tokens && t[resolveTemplate(contract, 'minTarget', {})].$value.value < 44) throw Error(`${c.id}: minimum target below 44 in ${ctx.id}`);
    const backdrops = Object.entries(t).filter(([p, v]) => /^color\.surface\.[a-z-]+$/.test(p) && v.$type === 'color').map(([p, v]) => [p.split('.').pop(), v.$value.components]);
    for (const [backdrop, bg] of backdrops) {
      if (combos.surface && combos.content) {
        for (const { params, path } of combos.content) {
          const surface = blend(t[resolveTemplate(contract, 'surface', params)].$value, bg);
          const informational = Object.values(params).includes('disabled');
          const r = ratio(blend(t[path].$value, surface), surface);
          contrast.push({ context: ctx.id, backdrop, ...params, role: 'content', ratio: r, minimum: informational ? null : 4.5, passed: informational || r >= 4.5 });
        }
      }
      if (combos.border) {
        for (const { params, path } of combos.border) {
          if (Object.values(params).includes('disabled')) continue;
          const r = ratio(t[path].$value.components, bg);
          contrast.push({ context: ctx.id, backdrop, ...params, role: 'border', ratio: r, minimum: 3, passed: r >= 3 });
        }
      }
      if (combos.focusColor) {
        const r = ratio(t[combos.focusColor[0].path].$value.components, bg);
        contrast.push({ context: ctx.id, backdrop, role: 'focus', ratio: r, minimum: 3, passed: r >= 3 });
      }
    }
  }
  write(`${reportFor(c.id)}/token-requirements.json`, requirements);
  write(`${reportFor(c.id)}/token-coverage.json`, { contexts: contexts.length, requiredPaths: requirements.length, records: coverage });
  write(`${reportFor(c.id)}/contract-validation.json`, checkContract(contract, { tokens: contexts[0].tokens }));
  if (contrast.length) {
    const failures = contrast.filter((x) => !x.passed);
    write(`${reportFor(c.id)}/contrast.json`, {
      method: 'WCAG relative luminance; alpha composited on every color.surface.* backdrop. Parameters valued "disabled" are informational, not a conformance claim.',
      checks: contrast.length,
      failures,
      minimumActiveText: Math.min(...contrast.filter((x) => x.role === 'content' && x.minimum !== null).map((x) => x.ratio)),
      results: contrast
    });
    if (failures.length) process.exitCode = 1;
  }
  summary[c.id] = { requiredPaths: requirements.length, contrastChecks: contrast.length, contrastFailures: contrast.filter((x) => !x.passed).length };
}

// 4. Figma adapter manifest. Axis routing is derived from the source file that defines each token
// (appearance.* → Appearance, density.* → Density, otherwise Brand). Technical `_resolved` variables
// are compilation detail for the tested Figma model, not a source layer.
const base = contexts.find((c) => c.id === `base-${cfg.appearances[0]}-${cfg.densities[0]}`);
const flatByContext = Object.fromEntries(contexts.map((c) => [c.id, Object.fromEntries(Object.entries(flatten(c.tokens)).filter(([, v]) => ['color', 'dimension'].includes(v.$type)))]));
const axisOf = (p) => {
  const source = (base.trace[p] ?? base.trace[p.replace(/\.(fontSize|lineHeight)$/, '')] ?? []).at(-1)?.source ?? '';
  return /\/appearance\./.test(source) ? 'Appearance' : /\/density\./.test(source) ? 'Density' : 'Brand';
};
const scopes = (p) => p.startsWith('primitive.') ? [] : p.includes('radius') ? ['CORNER_RADIUS'] : p.includes('padding') || p.includes('gap') ? ['GAP'] : p.endsWith('fontSize') ? ['FONT_SIZE'] : p.endsWith('lineHeight') ? ['LINE_HEIGHT'] : p.endsWith('.content') || p.startsWith('color.content') ? ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'] : p.includes('focus.ring') || p.endsWith('.border') ? ['STROKE_COLOR'] : p.startsWith('color.') ? ['FRAME_FILL', 'SHAPE_FILL'] : p.includes('width') ? ['STROKE_FLOAT'] : ['WIDTH_HEIGHT'];
const convert = (t) => t.$type === 'color' ? { r: t.$value.components[0], g: t.$value.components[1], b: t.$value.components[2], a: t.$value.alpha ?? 1 } : t.$value.value;
const figmaName = (p) => p.replaceAll('.', '/');
const manifest = { collections: { Brand: cfg.brands, Appearance: cfg.appearances, Density: cfg.densities }, variables: [], typography: [] };
for (const p of Object.keys(flatByContext[base.id])) {
  const type = flatByContext[base.id][p].$type === 'color' ? 'COLOR' : 'FLOAT';
  const axis = axisOf(p);
  const at = (brand, appearance, density) => convert(flatByContext[`${brand}-${appearance}-${density}`][p]);
  if (axis === 'Brand') {
    manifest.variables.push({ collection: 'Brand', name: figmaName(p), path: p, type, scopes: scopes(p), values: Object.fromEntries(cfg.brands.map((b) => [b, at(b, base.appearance, base.density)])) });
    continue;
  }
  const modes = axis === 'Appearance' ? cfg.appearances : cfg.densities;
  for (const mode of modes) {
    const name = `_resolved/${axis.toLowerCase()}/${mode}/${figmaName(p)}`;
    manifest.variables.push({ collection: 'Brand', name, path: p, type, scopes: [], values: Object.fromEntries(cfg.brands.map((b) => [b, axis === 'Appearance' ? at(b, mode, base.density) : at(b, base.appearance, mode)])) });
  }
  manifest.variables.push({ collection: axis, name: figmaName(p), path: p, type, scopes: scopes(p), values: Object.fromEntries(modes.map((m) => [m, { alias: `Brand:_resolved/${axis.toLowerCase()}/${m}/${figmaName(p)}` }])) });
}
const styleOf = (weight) => ({ 100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black' })[weight] ?? String(weight);
for (const [p, v] of Object.entries(base.tokens)) {
  if (v.$type !== 'typography') continue;
  manifest.typography.push({ name: figmaName(p), family: v.$value.fontFamily[0], style: styleOf(v.$value.fontWeight), size: v.$value.fontSize.value, lineHeight: v.$value.lineHeight * v.$value.fontSize.value });
}
write(`${paths.tokensPackage}/figma-manifest.json`, manifest);
const expectations = {};
for (const ctx of contexts) {
  (expectations[ctx.brand] ??= {})[`${ctx.appearance}-${ctx.density}`] = Object.fromEntries(Object.entries(flatByContext[ctx.id]).filter(([p]) => !p.startsWith('primitive.')).map(([p, v]) => [figmaName(p), convert(v)]));
}
write(`${paths.tokensPackage}/figma-expectations.json`, expectations);

console.log(JSON.stringify({ contexts: contexts.length, tokens: Object.keys(base.tokens).length, variables: manifest.variables.length, components: summary }));
