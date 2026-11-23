// Wave 5 Figma parity report (parity by hash), 2026-11-14.
//   node authoring/adapters/figma/wave5-parity-report.mjs <measured.json> [--lines <context>|<id>]
// <measured.json> is the object returned by wave5-parity.plugin.js: { "<context>|<id>": [count, fnv1a], … }, from the
// Figma masters measured with explicit Brand, Appearance and Density modes in the four contexts of the browser report.
// For every component, the same lines (`<props JSON>|<property>=<value>`, sorted) are built from
// reports/components/<id>/svelte/computed.json; an equal hash proves every record equal. Writes
// reports/components/<id>/figma/parity.json (one record per computed record) and exits 1 on a difference.
import fs from 'node:fs';

const [file, flag, which] = process.argv.slice(2);
const measured = JSON.parse(fs.readFileSync(file, 'utf8'));
const fnv = (str) => {
  let h = 0x811c9dc5;
  for (let k = 0; k < str.length; k++) {
    h ^= str.charCodeAt(k);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
};
let failed = 0;
const ids = [...new Set(Object.keys(measured).map((k) => k.split('|')[1]))];
for (const id of ids) {
  const records = JSON.parse(fs.readFileSync(`reports/components/${id}/svelte/computed.json`, 'utf8')).records;
  const byContext = {};
  for (const r of records) (byContext[r.context] ||= []).push(r);
  const out = [];
  for (const [context, list] of Object.entries(byContext)) {
    const lines = list.map((r) => `${JSON.stringify(r.props)}|${r.property}=${String(r.value)}`).sort();
    if (flag === '--lines' && which === `${context}|${id}`) console.log(lines.join('\n'));
    const m = measured[`${context}|${id}`];
    const passed = !!m && m[0] === lines.length && m[1] === fnv(lines.join('\n'));
    if (!passed) failed++;
    for (const r of list)
      out.push({
        context,
        props: r.props,
        state: r.state,
        part: r.part ?? null,
        property: r.property,
        expected: r.value,
        observed: passed ? r.value : null,
        passed,
        note: passed
          ? 'hash equal for the context'
          : `hash differs (expected ${lines.length} lines ${fnv(lines.join('\n'))}, measured ${m ? m.join(' ') : 'none'})`
      });
  }
  fs.mkdirSync(`reports/components/${id}/figma`, { recursive: true });
  fs.writeFileSync(
    `reports/components/${id}/figma/parity.json`,
    JSON.stringify(
      {
        method:
          'Parity by hash (wave5-parity.plugin.js and wave5-parity-report.mjs): Figma masters measured with explicit Brand, Appearance and Density modes in the four contexts of computed.json; per context, the FNV-1a hash of the sorted lines equals the hash of the browser records.',
        records: out
      },
      null,
      1
    ) + '\n'
  );
  console.log(id, out.length, 'records', out.filter((r) => !r.passed).length, 'failures');
}
process.exit(failed ? 1 : 0);
