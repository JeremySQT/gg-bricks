import { existsSync, readdirSync } from 'node:fs';
import { abs, paths, readJson } from './paths.mjs';

/** Flatten a DTCG group tree into a map of dotted paths to token objects. */
export function flatten(group, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && '$value' in value) out[path] = value;
    else flatten(value, path, out);
  }
  return out;
}

const isAlias = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);

/** Resolve `{path}` aliases (including nested composite values) after merging. */
export function resolveAliases(raw) {
  const done = {};
  function token(path, stack = []) {
    if (done[path]) return done[path];
    if (stack.includes(path)) throw Error('Circular alias: ' + [...stack, path].join(' -> '));
    if (!raw[path]) throw Error('Missing token: ' + path);
    const t = raw[path];
    if (!t.$type) throw Error('Missing type: ' + path);
    const value = (v) => {
      if (isAlias(v)) return token(v.slice(1, -1), [...stack, path]).$value;
      if (Array.isArray(v)) return v.map(value);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)]));
      return v;
    };
    if (isAlias(t.$value)) {
      const ref = token(t.$value.slice(1, -1), [...stack, path]);
      if (ref.$type !== t.$type) throw Error('Alias type mismatch: ' + path);
    }
    return (done[path] = { ...t, $value: value(t.$value) });
  }
  for (const path of Object.keys(raw)) token(path);
  return done;
}

export function config() {
  return readJson(paths.config);
}

function files(dir) {
  const full = abs(dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).filter((f) => f.endsWith('.tokens.json')).sort().map((f) => dir + '/' + f);
}

/**
 * Ordered source files for one context. Precedence (later wins):
 * base primitives, brand primitives, base common, base appearance, base density,
 * brand common, brand appearance, brand density. Brand files are optional.
 */
export function sources(brand, appearance, density) {
  const cfg = config();
  if (!cfg.brands.includes(brand) || !cfg.appearances.includes(appearance) || !cfg.densities.includes(density))
    throw Error('Unknown configuration');
  const t = paths.tokens;
  const list = [
    ...files(`${t}/base/primitives`),
    ...(brand === 'base' ? [] : files(`${t}/${brand}/primitives`)),
    `${t}/base/semantic/common.tokens.json`,
    `${t}/base/semantic/appearance.${appearance}.tokens.json`,
    `${t}/base/semantic/density.${density}.tokens.json`,
    ...files(`${t}/base/components`)
  ];
  if (brand !== 'base') {
    for (const f of ['common', `appearance.${appearance}`, `density.${density}`]) {
      const p = `${t}/${brand}/semantic/${f}.tokens.json`;
      if (existsSync(abs(p))) list.push(p);
    }
    list.push(...files(`${t}/${brand}/components`));
  }
  return list;
}

/** Merge the ordered sources, keeping a provenance trace, then resolve aliases. */
export function resolveSources(files) {
  const raw = {};
  const trace = {};
  for (const file of files) {
    for (const [name, token] of Object.entries(flatten(readJson(file)))) {
      raw[name] = token;
      (trace[name] ??= []).push({ source: file, value: token.$value });
    }
  }
  return { tokens: resolveAliases(raw), trace };
}

/** Every configured brand × appearance × density context, resolved. */
export function resolveAllContexts() {
  const cfg = config();
  const contexts = [];
  for (const brand of cfg.brands)
    for (const appearance of cfg.appearances)
      for (const density of cfg.densities) {
        const id = `${brand}-${appearance}-${density}`;
        contexts.push({ id, brand, appearance, density, ...resolveSources(sources(brand, appearance, density)) });
      }
  return contexts;
}

export function cssValue(t) {
  const v = t.$value;
  switch (t.$type) {
    case 'color':
      return `rgb(${v.components.map((c) => Math.round(c * 255)).join(' ')} / ${v.alpha ?? 1})`;
    case 'dimension':
      return `${v.value}${v.unit}`;
    case 'fontFamily':
      return v.map((x) => JSON.stringify(x)).join(', ');
    case 'fontWeight':
    case 'number':
      return String(v);
    case 'duration':
      return `${v.value}${v.unit}`;
    case 'cubicBezier':
      return `cubic-bezier(${v.join(', ')})`;
    case 'typography':
      return `${v.fontWeight} ${v.fontSize.value}${v.fontSize.unit}/${v.lineHeight} ${v.fontFamily.map((x) => JSON.stringify(x)).join(', ')}`;
    case 'shadow': {
      const list = Array.isArray(v) ? v : [v];
      return list.map((s) => `${s.inset ? 'inset ' : ''}${s.offsetX.value}${s.offsetX.unit} ${s.offsetY.value}${s.offsetY.unit} ${s.blur.value}${s.blur.unit} ${s.spread.value}${s.spread.unit} ${cssValue({ $type: 'color', $value: s.color })}`).join(', ');
    }
    default:
      throw Error('Unsupported CSS type: ' + t.$type);
  }
}

export const cssVariable = (path) => `--ggb-${path.replaceAll('.', '-')}`;
