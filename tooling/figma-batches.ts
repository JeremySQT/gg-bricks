// Write ready-to-run Plugin API scripts for the Figma MCP server from the generated manifest:
//   dist/figma/variables-<n>.js   sync batches (collections + a slice of variables, primitives first)
//   dist/figma/styles.js          text and effect styles
//   dist/figma/prune.js           explicit migration: list or remove variables absent from the manifest
//   dist/figma/verify.js          native resolution hashes per brand × appearance × density (tooling/check-figma.ts)
// Each file is the adapter body from authoring/adapters/figma/ with its data prepended, sized under the
// tool's code limit. Run them in order (variables-1 … n, then styles, then verify).
//   node tooling/figma-batches.ts [--max-chars 45000]
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { abs, paths, readJson, readText, write } from './lib/paths.ts';

interface Manifest {
  collections: Record<string, string[]>;
  defaults: Record<string, string>;
  variables: { collection: string; name: string; [k: string]: unknown }[];
  typography: unknown[];
  effects: unknown[];
}
const maxChars = Number(process.argv[process.argv.indexOf('--max-chars') + 1]) || 45000;
const manifest = readJson<Manifest>(`${paths.tokensPackage}/figma-manifest.json`);
const adapters = 'authoring/adapters/figma';
const out = `${paths.dist}/figma`;

// Order: Primitives, Brand primitives, Brand semantic, Appearance, Density; inside a rank, alias targets of
// the same collection precede the variables that reference them (stable topological order).
type Variable = Manifest['variables'][number] & { values: Record<string, unknown> };
// Collection names carry the “Foundations · ” prefix; the rank reads the axis after it.
const axisOf = (v: Variable) => v.collection.replace(/^Foundations · /, '');
const rank = (v: Variable) =>
  axisOf(v) === 'Primitives'
    ? 0
    : axisOf(v) === 'Brand'
      ? v.name.startsWith('primitive/')
        ? 1
        : 2
      : axisOf(v) === 'Appearance'
        ? 3
        : 4;
const key = (v: Variable) => `${v.collection}:${v.name}`;
const deps = (v: Variable): string[] =>
  Object.values(v.values)
    .filter((x): x is { alias: string } => !!x && typeof x === 'object' && 'alias' in x)
    .map((x) => x.alias)
    .filter((a) => a.startsWith(v.collection + ':'));
const topo = (list: Variable[]): Variable[] => {
  const byKey = new Map(list.map((v) => [key(v), v]));
  const done = new Set<string>();
  const out: Variable[] = [];
  const visit = (v: Variable, stack: string[]) => {
    const k = key(v);
    if (done.has(k)) return;
    if (stack.includes(k)) throw Error('Alias cycle: ' + [...stack, k].join(' -> '));
    for (const d of deps(v)) {
      const t = byKey.get(d);
      if (t) visit(t, [...stack, k]);
    }
    done.add(k);
    out.push(v);
  };
  for (const v of list) visit(v, []);
  return out;
};
const ranks = [0, 1, 2, 3, 4].map((r) => topo((manifest.variables as Variable[]).filter((v) => rank(v) === r)));
const ordered = ranks.flat();
/** Compact tuple: [collection, name, type, scopes, values]; identical values across modes collapse to one. */
const compact = (v: Variable): string => {
  const entries = Object.values(v.values).map((x) => JSON.stringify(x));
  const values = entries.every((e) => e === entries[0]) ? JSON.parse(entries[0]) : v.values;
  return JSON.stringify([v.collection, v.name, v.type, v.scopes, values]);
};
const syncBody = readText(`${adapters}/sync-variables.plugin.js`);
const batches: string[][] = [];
let current: string[] = [];
let size = 0;
for (const v of ordered) {
  const json = compact(v);
  const boundary = current.length && rank(v) !== rank(ordered[ordered.indexOf(v) - 1]);
  if (current.length && (size + json.length + syncBody.length + 400 > maxChars || boundary)) {
    batches.push(current);
    current = [];
    size = 0;
  }
  current.push(json);
  size += json.length + 1;
}
if (current.length) batches.push(current);
// Remove stale batches from a previous run before writing the new ones.
if (existsSync(abs(out))) for (const f of readdirSync(abs(out))) if (/^variables-\d+\.js$/.test(f)) rmSync(abs(out, f));
const files: string[] = [];
batches.forEach((batch, i) => {
  const defs = `const defs = ${JSON.stringify({ collections: manifest.collections, defaults: manifest.defaults }).slice(
    0,
    -1
  )},"variables":[${batch.join(',')}]};\n`;
  const file = `${out}/variables-${i + 1}.js`;
  write(file, defs + syncBody);
  files.push(file);
});
write(
  `${out}/styles.js`,
  `const defs = ${JSON.stringify({ typography: manifest.typography, effects: manifest.effects })};\n` +
    readText(`${adapters}/sync-styles.plugin.js`)
);
write(
  `${out}/prune.js`,
  `const defs = ${JSON.stringify({ keep: manifest.variables.map((v) => `${v.collection}:${v.name}`) })};\n` +
    readText(`${adapters}/prune-variables.plugin.js`)
);
const cfg = readJson<{ brands: string[]; appearances: string[]; densities: string[] }>(paths.config);
// The verification script resolves every brand × appearance × density explicitly; defaults do not matter to it.
// It hashes exactly the manifest's semantic variables (names per collection, in the check-figma order) and
// reports any other variable of those collections (an adapter variable such as checkbox/focus-radius) apart.
const semantic = ['Foundations · Brand', 'Foundations · Appearance', 'Foundations · Density'];
const names = Object.fromEntries(
  semantic.map((c) => [
    c,
    manifest.variables
      .filter((v) => v.collection === c && !v.name.startsWith('primitive/') && !v.name.startsWith('_resolved/'))
      .map((v) => v.name)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  ])
);
write(
  `${out}/verify.js`,
  `const defs = ${JSON.stringify({ brands: cfg.brands, appearances: cfg.appearances, densities: cfg.densities, names })};\n` +
    readText(`${adapters}/verify-resolution.plugin.js`)
);
console.log(JSON.stringify({ variableBatches: files.length, variables: ordered.length, dir: out }));
