import { existsSync, readdirSync } from 'node:fs';
import { abs, paths, readJson } from './paths.ts';
import type {
  Color,
  Config,
  Context,
  Dimension,
  ResolvedToken,
  Shadow,
  SourceToken,
  TokenGroup,
  TokenMap,
  TraceEntry,
  Typography
} from './types.ts';

/** Flatten a DTCG group tree into a map of dotted paths to token objects. */
export function flatten(group: TokenGroup, prefix = '', out: TokenMap<SourceToken> = {}): TokenMap<SourceToken> {
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && '$value' in value) out[path] = value as SourceToken;
    else flatten(value as TokenGroup, path, out);
  }
  return out;
}

export const isAlias = (v: unknown): v is string => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);

/** Resolve `{path}` aliases (including nested composite values) after merging. */
export function resolveAliases(raw: TokenMap<SourceToken>): TokenMap {
  const done: TokenMap = {};
  function token(path: string, stack: string[] = []): ResolvedToken {
    if (done[path]) return done[path];
    if (stack.includes(path)) throw Error('Circular alias: ' + [...stack, path].join(' -> '));
    if (!raw[path]) throw Error('Missing token: ' + path);
    const t = raw[path];
    if (!t.$type) throw Error('Missing type: ' + path);
    const value = (v: unknown): unknown => {
      if (isAlias(v)) return token(v.slice(1, -1), [...stack, path]).$value;
      if (Array.isArray(v)) return v.map(value);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)]));
      return v;
    };
    if (isAlias(t.$value)) {
      const ref = token(t.$value.slice(1, -1), [...stack, path]);
      if (ref.$type !== t.$type) throw Error('Alias type mismatch: ' + path);
    }
    return (done[path] = { ...t, $value: value(t.$value) } as ResolvedToken);
  }
  for (const path of Object.keys(raw)) token(path);
  return done;
}

export function config(): Config {
  return readJson<Config>(paths.config);
}

export function tokenFiles(dir: string): string[] {
  const full = abs(dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => f.endsWith('.tokens.json'))
    .sort()
    .map((f) => dir + '/' + f);
}

/**
 * Ordered source files for one context. Precedence (later wins):
 * base primitives, brand primitives, base common, base appearance, base density, base components,
 * brand common, brand appearance, brand density, brand components. Brand files are optional.
 */
export function sources(brand: string, appearance: string, density: string): string[] {
  const cfg = config();
  if (!cfg.brands.includes(brand) || !cfg.appearances.includes(appearance) || !cfg.densities.includes(density))
    throw Error('Unknown configuration');
  const t = paths.tokens;
  const list = [
    ...tokenFiles(`${t}/base/primitives`),
    ...(brand === 'base' ? [] : tokenFiles(`${t}/${brand}/primitives`)),
    `${t}/base/semantic/common.tokens.json`,
    `${t}/base/semantic/appearance.${appearance}.tokens.json`,
    `${t}/base/semantic/density.${density}.tokens.json`,
    ...tokenFiles(`${t}/base/components`)
  ];
  if (brand !== 'base') {
    for (const f of ['common', `appearance.${appearance}`, `density.${density}`]) {
      const p = `${t}/${brand}/semantic/${f}.tokens.json`;
      if (existsSync(abs(p))) list.push(p);
    }
    list.push(...tokenFiles(`${t}/${brand}/components`));
  }
  return list;
}

/** Merge the ordered sources, keeping a provenance trace, then resolve aliases. */
export function resolveSources(files: string[]): { tokens: TokenMap; trace: Record<string, TraceEntry[]> } {
  const raw: TokenMap<SourceToken> = {};
  const trace: Record<string, TraceEntry[]> = {};
  for (const file of files) {
    for (const [name, token] of Object.entries(flatten(readJson<TokenGroup>(file)))) {
      raw[name] = token;
      (trace[name] ??= []).push({ source: file, value: token.$value });
    }
  }
  return { tokens: resolveAliases(raw), trace };
}

/** Every configured brand × appearance × density context, resolved. */
export function resolveAllContexts(): Context[] {
  const cfg = config();
  const contexts: Context[] = [];
  for (const brand of cfg.brands)
    for (const appearance of cfg.appearances)
      for (const density of cfg.densities) {
        const id = `${brand}-${appearance}-${density}`;
        contexts.push({ id, brand, appearance, density, ...resolveSources(sources(brand, appearance, density)) });
      }
  return contexts;
}

const dim = (d: Dimension) => `${d.value}${d.unit}`;
const rgb = (c: Color) => `rgb(${c.components.map((x) => Math.round(x * 255)).join(' ')} / ${c.alpha ?? 1})`;
const family = (f: string[]) => f.map((x) => JSON.stringify(x)).join(', ');

/** CSS literal for a resolved token. */
export function cssValue(t: ResolvedToken): string {
  const v = t.$value;
  switch (t.$type) {
    case 'color':
      return rgb(v as Color);
    case 'dimension':
    case 'duration':
      return dim(v as Dimension);
    case 'fontFamily':
      return family(v as string[]);
    case 'fontWeight':
    case 'number':
      return String(v);
    case 'cubicBezier':
      return `cubic-bezier(${(v as number[]).join(', ')})`;
    case 'typography': {
      const ty = v as Typography;
      return `${ty.fontWeight} ${dim(ty.fontSize as Dimension)}/${ty.lineHeight} ${family(ty.fontFamily as string[])}`;
    }
    case 'shadow': {
      const list = (Array.isArray(v) ? v : [v]) as Shadow[];
      return list
        .map(
          (s) =>
            `${s.inset ? 'inset ' : ''}${dim(s.offsetX as Dimension)} ${dim(s.offsetY as Dimension)} ${dim(s.blur as Dimension)} ${dim(s.spread as Dimension)} ${rgb(s.color as Color)}`
        )
        .join(', ');
    }
    default:
      throw Error('Unsupported CSS type: ' + t.$type);
  }
}

export const cssVariable = (path: string): string => `--ggb-${path.replaceAll('.', '-')}`;
