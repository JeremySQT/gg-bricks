import fs from 'node:fs';
// Wave 3 parity by hash (2026-11-03). Usage:
//   node authoring/adapters/figma/wave3-parity-report.mjs <id> --lines <context>   print the expected lines of a context
//   node authoring/adapters/figma/wave3-parity-report.mjs <id> <measurement.json>  write reports/components/<id>/figma/parity.json
// The measurement body (<id>-parity.plugin.js) returns { hashes: { <context>: fnv }, lines?: { <context>: [...] } }:
// per context the FNV-1a hash of the sorted lines "key=fields" it measured on the master. This script builds the same
// lines from reports/components/<id>/svelte/computed.json with the component's FIELDS below; an equal hash proves
// every field of the context equal. Properties listed in JUSTIFIED are recorded as justified differences (Figma cannot
// express them) and stay out of the lines. Writes one parity record per computed record.
const [id, arg, ctxArg] = process.argv.slice(2);
const { records } = JSON.parse(fs.readFileSync(`reports/components/${id}/svelte/computed.json`, 'utf8'));
export const hex = (v) => {
  if (v === '' || v === null || v === undefined) return '';
  const m = String(v).match(/rgba?\(([^)]+)\)/);
  if (!m) return String(v);
  const p = m[1].split(',').map((s) => parseFloat(s));
  if (p.length === 3) p.push(1);
  return p
    .map((x, i) =>
      Math.round(i === 3 ? x * 255 : x)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
};
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const num = (v, d = 1) => String(Math.round(parseFloat(v) * 10 ** d) / 10 ** d);
const px = (v) => num(String(v).replace('px', ''), 2);
// Per component: the key of a record's case, the ordered fields of a line, and the justified properties.
const COMPONENTS = {
  progress: {
    key: (r) => `${r.props.intent},${r.props.size}`,
    fields: {
      trackColor: hex,
      trackHeight: px,
      trackRadius: px,
      indicatorColor: hex,
      indicatorWidth: (v) => num(v, 1),
      trackWidth: (v) => num(v, 1),
      labelColor: hex,
      labelFont: px,
      valueColor: hex,
      gap: px
    },
    justified: {
      valueNumeric:
        'Justified: tabular figures (font-variant-numeric) cannot be set through the Plugin API; the numeral/sm style and the set description say to switch them on by hand.'
    }
  }
};
const C = COMPONENTS[id];
if (!C) throw new Error('unknown component ' + id);
const byCtx = {};
for (const r of records) {
  if (C.justified[r.property]) continue;
  const k = C.key(r);
  ((byCtx[r.context] ??= {})[k] ??= {})[r.property] = C.fields[r.property](r.value);
}
const linesOf = (ctx) =>
  Object.entries(byCtx[ctx])
    .map(
      ([k, f]) =>
        `${k}=${Object.keys(C.fields)
          .map((p) => f[p] ?? '')
          .join(',')}`
    )
    .sort();
if (arg === '--lines') {
  console.log(JSON.stringify(linesOf(ctxArg), null, 1));
  process.exit(0);
}
const m = JSON.parse(fs.readFileSync(arg, 'utf8'));
const ok = {};
for (const ctx of Object.keys(byCtx)) ok[ctx] = m.hashes[ctx] === fnv(linesOf(ctx).join('\n'));
const out = records.map((r) => {
  const base = {
    context: r.context,
    props: r.props,
    state: r.state,
    part: 'root',
    property: r.property,
    expected: r.value
  };
  if (C.justified[r.property])
    return { ...base, observed: 'not expressible', passed: true, note: C.justified[r.property] };
  const v = C.fields[r.property](r.value);
  return {
    ...base,
    observed: ok[r.context] ? v : 'differs (see hash)',
    passed: ok[r.context],
    note: `compared as ${v} in the context hash`
  };
});
fs.mkdirSync(`reports/components/${id}/figma`, { recursive: true });
fs.writeFileSync(
  `reports/components/${id}/figma/parity.json`,
  JSON.stringify(
    { method: 'hash of sorted field lines per context (wave3-parity-report.mjs)', records: out },
    null,
    2
  ) + '\n'
);
const failed = Object.entries(ok)
  .filter(([, v]) => !v)
  .map(([k]) => k);
console.log(
  JSON.stringify({
    records: out.length,
    failures: out.filter((r) => !r.passed).length,
    justified: out.filter((r) => r.note && r.note.startsWith('Justified')).length,
    failedContexts: failed
  })
);
