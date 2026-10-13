// Check the foundations against foundations/inventory.json in every configured context:
//   - every declared semantic role exists, has the declared type and is defined on the declared axis
//     (common, appearance or density file layer);
//   - no undeclared semantic token exists (primitive.* and component tokens are exempt);
//   - primitives hold no aliases; semantic colors hold no literal values;
//   - every declared invariant holds (a derived dimension role equals the sum of other roles);
//   - every contrast pair reaches its WCAG minimum, written to reports/tokens/contrast.json.
// Exit code 1 on any failure. Run by `npm run validate`.
//   node tooling/check-foundations.ts
import { paths, readJson, write } from './lib/paths.ts';
import { flatten, isAlias, resolveAllContexts, tokenFiles } from './lib/tokens.ts';
import { composite, contrast, type Rgb } from './lib/color.ts';
import type { Color, Context, TokenGroup } from './lib/types.ts';

type Axis = 'common' | 'appearance' | 'density';
interface Inventory {
  roles: { path: string; type: string; axis: Axis }[];
  contrast: { content: string; surface: string; minimum: number; note?: string }[];
  /** Dimension roles that must equal the sum of other dimension roles, in every context. */
  invariants?: { equals: string; sum: string[]; note?: string }[];
}
export interface ContrastRecord {
  context: string;
  content: string;
  surface: string;
  backdrop: string | null;
  ratio: number;
  minimum: number;
  passed: boolean;
}

const inventoryPath = 'foundations/inventory.json';
const inventory = readJson<Inventory>(inventoryPath);
const contexts = resolveAllContexts();
const errors: string[] = [];
const round = (n: number) => Math.round(n * 100) / 100;

const axisOf = (source: string): Axis | 'primitives' | 'components' =>
  /\/primitives\//.test(source)
    ? 'primitives'
    : /\/components\//.test(source)
      ? 'components'
      : /\/appearance\./.test(source)
        ? 'appearance'
        : /\/density\./.test(source)
          ? 'density'
          : 'common';

// 1. Structural rules on the source files themselves (independent of context).
const t = paths.tokens;
const cfg = readJson<{ brands: string[] }>(paths.config);
const hasAlias = (v: unknown): boolean =>
  isAlias(v) ||
  (Array.isArray(v) && v.some(hasAlias)) ||
  (!!v && typeof v === 'object' && Object.values(v as object).some(hasAlias));
for (const brand of cfg.brands) {
  for (const file of tokenFiles(`${t}/${brand}/primitives`)) {
    for (const [p, token] of Object.entries(flatten(readJson<TokenGroup>(file)))) {
      if (!p.startsWith('primitive.')) errors.push(`${file}: ${p} is not a primitive path`);
      if (hasAlias(token.$value)) errors.push(`${file}: primitive ${p} holds an alias`);
    }
  }
  for (const name of [
    'common',
    'appearance.light',
    'appearance.dark',
    'density.compact',
    'density.standard',
    'density.comfortable'
  ]) {
    const file = `${t}/${brand}/semantic/${name}.tokens.json`;
    let group: TokenGroup;
    try {
      group = readJson<TokenGroup>(file);
    } catch {
      continue; // sparse brands may omit files
    }
    for (const [p, token] of Object.entries(flatten(group))) {
      if (p.startsWith('primitive.')) errors.push(`${file}: ${p} defines a primitive in a semantic file`);
      if (token.$type === 'color' && !isAlias(token.$value)) errors.push(`${file}: semantic color ${p} is a literal`);
    }
  }
}

// 2. Coverage, type and axis of every declared role in every context; no undeclared semantic token.
const declared = new Map(inventory.roles.map((r) => [r.path, r]));
for (const ctx of contexts) {
  for (const role of inventory.roles) {
    const token = ctx.tokens[role.path];
    if (!token) {
      errors.push(`${ctx.id}: missing role ${role.path}`);
      continue;
    }
    if (token.$type !== role.type)
      errors.push(`${ctx.id}: ${role.path} has type ${token.$type}, expected ${role.type}`);
    const source = ctx.trace[role.path]?.at(-1)?.source ?? '';
    if (axisOf(source) !== role.axis)
      errors.push(`${ctx.id}: ${role.path} is defined in ${source}, expected axis ${role.axis}`);
  }
  for (const p of Object.keys(ctx.tokens)) {
    if (p.startsWith('primitive.') || declared.has(p)) continue;
    const source = ctx.trace[p]?.at(-1)?.source ?? '';
    if (axisOf(source) !== 'components')
      errors.push(`${ctx.id}: undeclared semantic token ${p} (add it to ${inventoryPath})`);
  }
}

// 3. Derived roles maintained by hand (per brand or density) must keep their arithmetic relation.
const px = (ctx: Context, p: string): number | null => {
  const t = ctx.tokens[p];
  if (!t || t.$type !== 'dimension') return null;
  const d = t.$value as { value: number; unit: string };
  return d.unit === 'px' ? d.value : null;
};
for (const ctx of contexts)
  for (const inv of inventory.invariants ?? []) {
    const target = px(ctx, inv.equals);
    const parts = inv.sum.map((p) => px(ctx, p));
    if (target === null || parts.some((x) => x === null)) {
      errors.push(`${ctx.id}: invariant ${inv.equals} references a missing or non-px dimension role`);
      continue;
    }
    const total = (parts as number[]).reduce((a, b) => a + b, 0);
    if (total !== target)
      errors.push(`${ctx.id}: ${inv.equals} is ${target}px, expected ${inv.sum.join(' + ')} = ${total}px`);
  }

// 4. Contrast evidence for the declared pairs.
const records: ContrastRecord[] = [];
function measure(ctx: Context, pair: Inventory['contrast'][number]): ContrastRecord | null {
  const content = ctx.tokens[pair.content]?.$value as Color | undefined;
  const surface = ctx.tokens[pair.surface]?.$value as Color | undefined;
  const canvas = ctx.tokens['color.surface.default']?.$value as Color | undefined;
  if (!content || !surface || !canvas) {
    errors.push(`${ctx.id}: contrast pair ${pair.content} / ${pair.surface} references a missing color`);
    return null;
  }
  const translucent = (surface.alpha ?? 1) < 1;
  const backdrop: Rgb = translucent ? composite(surface, canvas.components) : surface.components;
  const front = composite(content, backdrop);
  const ratio = round(contrast(front, backdrop));
  return {
    context: ctx.id,
    content: pair.content,
    surface: pair.surface,
    backdrop: translucent ? 'color.surface.default' : null,
    ratio,
    minimum: pair.minimum,
    passed: ratio >= pair.minimum
  };
}
for (const ctx of contexts)
  for (const pair of inventory.contrast) {
    const r = measure(ctx, pair);
    if (r) records.push(r);
  }
const failures = records.filter((r) => !r.passed);
write(`${paths.reports}/tokens/contrast.json`, {
  method:
    'WCAG 2 relative luminance and contrast ratio on resolved sRGB values. Content is composited on its surface; a translucent surface is first composited on color.surface.default (recorded as backdrop). Minimum 4.5 for text, 3 for borders, icons and focus indicators. Pairs come from foundations/inventory.json.',
  contexts: contexts.length,
  pairs: inventory.contrast.length,
  checks: records.length,
  failures,
  results: records
});
for (const f of failures)
  errors.push(`${f.context}: ${f.content} on ${f.surface} is ${f.ratio}:1, minimum ${f.minimum}`);

const summary = {
  contexts: contexts.length,
  roles: inventory.roles.length,
  invariants: inventory.invariants?.length ?? 0,
  contrastChecks: records.length,
  contrastFailures: failures.length,
  errors: errors.length
};
console.log(JSON.stringify(summary));
if (errors.length) {
  console.error(errors.slice(0, 40).join('\n') + (errors.length > 40 ? `\n… ${errors.length - 40} more` : ''));
  process.exitCode = 1;
}
