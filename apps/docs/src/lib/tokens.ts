// Build-time access to the generated token outputs: every resolved context, the provenance traces (to show
// which alias a role points to) and the foundations config. Pages show values for every context and the
// ThemeSelect override reveals the ones of the reader's context.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './root';

export interface Token {
  $type: string;
  $value: unknown;
  $description?: string;
}
type TokenMap = Record<string, Token>;
type Trace = { source: string; value: unknown }[];
interface Dimension {
  value: number;
  unit: string;
}
interface Color {
  components: [number, number, number];
  alpha?: number;
}
interface Shadow {
  offsetX: Dimension;
  offsetY: Dimension;
  blur: Dimension;
  spread: Dimension;
  color: Color;
  inset?: boolean;
}
interface Typography {
  fontFamily: string[];
  fontWeight: number;
  fontSize: Dimension;
  lineHeight: number;
  letterSpacing: Dimension;
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(repoRoot, path), 'utf8')) as T;

export const config = readJson<{
  brands: string[];
  appearances: string[];
  densities: string[];
  defaults: { appearance: string; density: string };
}>('foundations/tokens/config.json');

export const contexts = config.brands.flatMap((b) =>
  config.appearances.flatMap((a) => config.densities.map((d) => `${b}-${a}-${d}`))
);
export const defaultContext = `${config.brands[0]}-${config.defaults.appearance}-${config.defaults.density}`;

const resolved: Record<string, TokenMap> = Object.fromEntries(
  contexts.map((c) => [c, readJson<TokenMap>(`packages/tokens/resolved/${c}.json`)])
);
const traces: Record<string, Record<string, Trace>> = Object.fromEntries(
  contexts.map((c) => [c, readJson<Record<string, Trace>>(`reports/tokens/traces/${c}.json`)])
);

/** Token paths of the default context that start with a prefix, in source order. */
export const paths = (prefix: string): string[] =>
  Object.keys(resolved[defaultContext]).filter((p) => p === prefix || p.startsWith(prefix + '.'));

export const token = (path: string, context = defaultContext): Token | undefined => resolved[context][path];
export const cssVar = (path: string) => `--ggb-${path.replaceAll('.', '-')}`;

const hexByte = (x: number) =>
  Math.round(Math.min(1, Math.max(0, x)) * 255)
    .toString(16)
    .padStart(2, '0');
export const hex = (c: Color) => '#' + c.components.map(hexByte).join('');
const px = (d: Dimension) => `${d.value}${d.unit}`;

export function format(t: Token): string {
  const v = t.$value;
  switch (t.$type) {
    case 'color': {
      const c = v as Color;
      const a = c.alpha ?? 1;
      return a < 1 ? `${hex(c)} at ${Math.round(a * 100)} %` : hex(c);
    }
    case 'dimension':
    case 'duration':
      return px(v as Dimension);
    case 'cubicBezier':
      return `cubic-bezier(${(v as number[]).join(', ')})`;
    case 'fontFamily':
      return (v as string[])[0];
    case 'typography': {
      const ty = v as Typography;
      const tracking = ty.letterSpacing.value ? `, tracking ${px(ty.letterSpacing)}` : '';
      return `${ty.fontFamily[0]} ${ty.fontWeight}, ${px(ty.fontSize)} / ${ty.lineHeight}${tracking}`;
    }
    case 'shadow': {
      const layers = v as Shadow[];
      if (!layers.length) return 'none';
      return layers
        .map(
          (s) =>
            `${px(s.offsetX)} ${px(s.offsetY)} ${px(s.blur)} ${px(s.spread)} ${format({ $type: 'color', $value: s.color })}`
        )
        .join(' · ');
    }
    default:
      return Array.isArray(v) ? v.join(', ') : String(v);
  }
}

/** The alias a role points to in a context (the last source wins), without braces; undefined for a literal. */
export function alias(path: string, context = defaultContext): string | undefined {
  const trace = traces[context][path];
  const value = trace?.[trace.length - 1]?.value;
  return typeof value === 'string' && value.startsWith('{') ? value.slice(1, -1) : undefined;
}

export interface Variant {
  value: string;
  alias?: string;
  contexts: string[];
}

/** The distinct displays of a token across the 18 contexts, each with the contexts that show it. */
export function variants(path: string): Variant[] {
  const out: Variant[] = [];
  for (const context of contexts) {
    const t = token(path, context);
    if (!t) continue;
    const value = format(t);
    const a = alias(path, context);
    const existing = out.find((v) => v.value === value && v.alias === a);
    if (existing) existing.contexts.push(context);
    else out.push({ value, alias: a, contexts: [context] });
  }
  return out;
}

/** Which axes change a token's value or alias: shown as a hint next to its name. */
export function axes(path: string): string[] {
  const list = variants(path);
  if (list.length < 2) return [];
  const varies = (index: number) =>
    list.some((v) => {
      const parts = new Set(v.contexts.map((c) => c.split('-')[index]));
      return parts.size < [config.brands, config.appearances, config.densities][index].length;
    });
  return ['brand', 'appearance', 'density'].filter((_, i) => varies(i));
}

export const contrastReport = readJson<{
  checks: number;
  pairs: number;
  failures: unknown[];
  results: { context: string; content: string; surface: string; ratio: number; minimum: number }[];
}>('reports/tokens/contrast.json');
