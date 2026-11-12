// Wave 4 Figma parity report, 2026-11-10.
//   node authoring/adapters/figma/wave4-parity-report.mjs <id> <measured.json> [<measured.json> …]
// <measured.json> is the list returned by a wave 4 parity body (`PARITY:<name> [[ "<context>|<id>", "<props JSON>",
// state, property, value ], …]`), measured on the Figma masters with explicit Brand, Appearance and Density modes in the
// four contexts of the browser report. Every record of reports/components/<id>/svelte/computed.json is matched by
// context, props, state and property and compared: colors by channel (±1 of 255, alpha ±0.01; two transparent colors
// are equal whatever their channels), lengths at ±0.01 px, edges ("<color> 0px 0px 0px <w>px inset") by color and width,
// other values as strings. Writes reports/components/<id>/figma/parity.json; exits 1 when a record has no measurement or
// fails without a justified note (JUSTIFIED below).
import fs from 'node:fs';

const [id, ...files] = process.argv.slice(2);
if (!id || !files.length) {
  console.error('usage: wave4-parity-report.mjs <id> <measured.json>…');
  process.exit(2);
}
// Differences recorded rather than hidden, per component: key `${property}` or `${state}:${property}`.
const JUSTIFIED =
  {
    tabs: {
      'list:panelGap':
        'The Figma Tabs is the tab list only (user request at the Figma parity gate, 2026-11-12): the designer places the content of the selected tab space/content/lg from the list; the code renders the panels. Not part of the master.'
    }
  }[id] ?? {};
const norm = (props) =>
  JSON.stringify(Object.fromEntries(Object.entries(props || {}).sort(([a], [b]) => (a < b ? -1 : 1))));
const measured = new Map();
for (const f of files)
  for (const [ctx, props, state, property, value] of JSON.parse(fs.readFileSync(f, 'utf8'))) {
    const [context, comp] = ctx.split('|');
    if (comp !== id) continue;
    measured.set([context, norm(JSON.parse(props)), state, property].join('§'), value);
  }
const color = (s) => {
  const m = /^rgba?\(([^)]+)\)/.exec(s.trim());
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(',').map(Number);
  return [r, g, b, a];
};
const sameColor = (a, b) => {
  if (a[3] === 0 && b[3] === 0) return true;
  return (
    Math.abs(a[0] - b[0]) <= 1 &&
    Math.abs(a[1] - b[1]) <= 1 &&
    Math.abs(a[2] - b[2]) <= 1 &&
    Math.abs(a[3] - b[3]) <= 0.01
  );
};
const edge = (s) => {
  const m = /^(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+inset$/.exec(s.trim());
  return m ? { c: color(m[1]), d: [m[2], m[3], m[4], m[5]].map(Number) } : null;
};
const num = (s) => (/^-?[\d.]+(px)?$/.test(String(s).trim()) ? parseFloat(s) : null);
const equal = (e, o) => {
  if (e === o) return true;
  const ec = color(e),
    oc = color(o);
  if (ec && oc && !/inset/.test(e)) return sameColor(ec, oc);
  const ee = edge(e),
    oe = edge(o);
  if (ee && oe) return sameColor(ee.c, oe.c) && ee.d.every((x, i) => Math.abs(x - oe.d[i]) <= 0.01);
  const en = num(e),
    on = num(o);
  if (en !== null && on !== null) return Math.abs(en - on) <= 0.01;
  return false;
};
const computed = JSON.parse(fs.readFileSync(`reports/components/${id}/svelte/computed.json`, 'utf8')).records;
const records = computed.map((r) => {
  const key = [r.context, norm(r.props), r.state, r.property].join('§');
  const observed = measured.has(key) ? measured.get(key) : null;
  const passed = observed !== null && equal(String(r.value), String(observed));
  const note = JUSTIFIED[`${r.state}:${r.property}`] ?? JUSTIFIED[r.property];
  return {
    context: r.context,
    props: r.props,
    state: r.state,
    property: r.property,
    expected: r.value,
    observed,
    passed,
    ...(passed || !note ? {} : { note })
  };
});
const failed = records.filter((r) => !r.passed && !r.note);
const missing = records.filter((r) => r.observed === null);
fs.mkdirSync(`reports/components/${id}/figma`, { recursive: true });
fs.writeFileSync(
  `reports/components/${id}/figma/parity.json`,
  JSON.stringify(
    {
      method:
        'Figma masters measured with explicit Brand, Appearance and Density modes in the four contexts of the browser report (resolved variable values: fills, strokes, sizes, paddings, radii, typography), compared record by record with reports/components/' +
        id +
        '/svelte/computed.json (authoring/adapters/figma/wave4-parity-report.mjs).',
      summary: {
        records: records.length,
        passed: records.filter((r) => r.passed).length,
        justified: records.filter((r) => r.note).length,
        failed: failed.length,
        missing: missing.length
      },
      records
    },
    null,
    2
  ) + '\n'
);
console.log(JSON.stringify({ id, records: records.length, failed: failed.length, missing: missing.length }));
for (const r of failed.slice(0, 20))
  console.log(
    '  FAIL',
    r.context,
    JSON.stringify(r.props),
    r.state,
    r.property,
    'expected',
    r.expected,
    'observed',
    r.observed
  );
process.exit(failed.length ? 1 : 0);
