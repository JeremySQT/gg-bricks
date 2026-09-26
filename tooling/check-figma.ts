// Compare the native Figma resolution returned by authoring/adapters/figma/verify-resolution.plugin.js
// with packages/tokens/figma-expectations.json and write reports/foundations/figma/verification.json.
//   node tooling/check-figma.ts <result.json>     (the JSON returned by the verification script)
//   node tooling/check-figma.ts --expected        (print the expected hashes only)
import { paths, readJson, write } from './lib/paths.ts';
import fs from 'node:fs';

type FigmaValue = number | { r: number; g: number; b: number; a: number };
interface Manifest {
  variables: { collection: string; name: string }[];
}
interface Result {
  variables: number;
  results: Record<string, { count: number; hash: string; sample: string[] }>;
}
const canonical = (value: FigmaValue): string =>
  typeof value === 'object'
    ? [value.r, value.g, value.b, value.a]
        .map((x) =>
          Math.round(Math.fround(x) * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    : String(Math.round(value * 10000) / 10000);
const fnv = (s: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const manifest = readJson<Manifest>(`${paths.tokensPackage}/figma-manifest.json`);
const expectations = readJson<Record<string, Record<string, Record<string, FigmaValue>>>>(
  `${paths.tokensPackage}/figma-expectations.json`
);
const ordered = ['Brand', 'Appearance', 'Density'].flatMap((c) =>
  manifest.variables
    .filter((v) => v.collection === c && !v.name.startsWith('primitive/') && !v.name.startsWith('_resolved/'))
    .map((v) => v.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
);
const expected: Record<string, { count: number; hash: string; sample: string[] }> = {};
for (const [brand, contexts] of Object.entries(expectations))
  for (const [ctx, values] of Object.entries(contexts)) {
    const list = ordered.map((name) => canonical(values[name]));
    expected[`${brand}-${ctx}`] = { count: list.length, hash: fnv(list.join('|')), sample: list.slice(0, 3) };
  }
const arg = process.argv[2];
if (!arg || arg === '--expected') {
  console.log(JSON.stringify({ variables: ordered.length, expected }, null, 2));
  process.exit(0);
}
const result = JSON.parse(fs.readFileSync(arg, 'utf8')) as Result;
const records = Object.entries(expected).map(([ctx, e]) => {
  const o = result.results[ctx];
  return {
    context: ctx,
    expectedCount: e.count,
    observedCount: o?.count ?? 0,
    expectedHash: e.hash,
    observedHash: o?.hash ?? null,
    passed: !!o && o.count === e.count && o.hash === e.hash
  };
});
const failures = records.filter((r) => !r.passed);
write(`${paths.reports}/foundations/figma/verification.json`, {
  method:
    'Native Figma resolution (resolveForConsumer on a frame with explicit Brand, Appearance and Density modes) of every semantic variable, in deterministic order, hashed with FNV-1a over canonical values (8-digit hex colors from float32 channels, as Figma stores them; 4-decimal numbers) and compared with the same hash of packages/tokens/figma-expectations.json.',
  variables: ordered.length,
  contexts: records.length,
  failures: failures.length,
  records
});
console.log(JSON.stringify({ variables: ordered.length, contexts: records.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
