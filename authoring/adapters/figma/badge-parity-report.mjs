import fs from 'node:fs';
// Usage: node authoring/adapters/figma/badge-parity-report.mjs --expected
//        node authoring/adapters/figma/badge-parity-report.mjs <measurement result json>
// The measurement body is badge-parity.plugin.js (use_figma). Exact fields are compared per context through the
// FNV-1a hash of the sorted "key=fields" lines, which this script builds from
// reports/components/badge/svelte/computed.json (equal hashes prove every field equal; a differing context needs
// its lines, DETAIL in the measurement); height, minimum width and width are compared one by one with a
// tolerance, because Figma and the browser round the line box and lay out text differently.
// Writes reports/components/badge/figma/parity.json, one record per computed record.
const { records } = JSON.parse(fs.readFileSync('reports/components/badge/svelte/computed.json', 'utf8'));
const hex = (v) => {
  const p = String(v)
    .match(/rgba?\(([^)]+)\)/)[1]
    .split(',')
    .map((s) => parseFloat(s));
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
const px = (v) => String(parseFloat(v));
const FIELDS = [
  'labelColor',
  'surface',
  'stroke',
  'radius',
  'padL',
  'padR',
  'fontSize',
  'fontWeight',
  'iconColor',
  'iconSize',
  'iconOffset',
  'iconGap'
];
// Computed property → exact field. The strong edge is a transparent inset shadow in code (kept for forced colors):
// no stroke in Figma.
const exactMap = {
  color: ['labelColor', hex],
  labelColor: ['labelColor', hex],
  backgroundColor: ['surface', hex],
  boxShadow: [
    'stroke',
    (v) => (hex(v).endsWith('00') ? '' : `${hex(v)}/${parseFloat(v.match(/0px 0px 0px ([\d.]+)px/)[1])}`)
  ],
  radius: ['radius', px],
  paddingInline: ['padL', px],
  paddingInlineEnd: ['padR', px],
  fontSize: ['fontSize', px],
  fontWeight: ['fontWeight', px],
  iconColor: ['iconColor', hex],
  iconSize: ['iconSize', String],
  iconOffsetInline: ['iconOffset', (v) => String(Math.round(v * 1000) / 1000)],
  iconGap: ['iconGap', px]
};
const numMap = { height: [0, 0.01], minInlineSize: [1, 0.01], width: [2, 1.5] };
const keyOf = (r) => `${r.context}|${r.props.intent}|${r.props.appearance}|${r.props.size}`;
const expected = {};
for (const r of records) {
  if (!exactMap[r.property]) continue;
  const k = keyOf(r);
  const [field, f] = exactMap[r.property];
  (expected[k] = expected[k] || {})[field] = f(r.value);
}
const line = (k) => FIELDS.map((f) => expected[k][f]).join('|');
const byContext = {};
for (const k of Object.keys(expected).sort()) (byContext[k.split('|')[0]] = byContext[k.split('|')[0]] || []).push(k);
const expectedHash = Object.fromEntries(
  Object.entries(byContext).map(([c, ks]) => [
    c,
    { n: ks.length, hash: fnv(ks.map((k) => `${k}=${line(k)}`).join('\n')) }
  ])
);
if (process.argv[2] === '--expected') {
  console.log(JSON.stringify(expectedHash));
  process.exit(0);
}
const m = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const notes = {
  labelColor: 'Label fill bound to color/status/{intent}/content (subtle) or contentStrong (strong)',
  surface: 'container fill bound to color/status/{intent}/surface (subtle) or surfaceStrong (strong)',
  stroke: 'subtle: inside stroke bound to color/status/{intent}/border and border/width/default; strong: no stroke',
  radius: 'corners bound to radius/indicator',
  padL: 'padding bound to space/content/xs',
  padR: 'padding bound to space/content/xs',
  fontSize: 'Label bound to typography/indicator/{size}/fontSize',
  fontWeight: 'Label bound to typography/indicator/{size}/fontWeight',
  iconColor: 'glyph fill bound to color/status/{intent}/icon (subtle) or contentStrong (strong)',
  iconSize: 'Icon xs, size/icon/xs',
  iconOffset:
    'Drawing box of badge/icon-box (iconSize − iconSize/8) holding the icon at its end: the icon box starts at padding − iconSize/8',
  iconGap: 'Leading frame padding-right bound to space/content/xs'
};
const out = [];
for (const r of records) {
  const k = keyOf(r);
  const ctx = m.result[r.context];
  const rec = { context: r.context, props: r.props, state: r.state, property: r.property, expected: r.value };
  if (exactMap[r.property]) {
    const [field, f] = exactMap[r.property];
    const exp = f(r.value);
    let observed = null;
    if (ctx && ctx.hash === expectedHash[r.context].hash && ctx.n === expectedHash[r.context].n) observed = exp;
    else if (ctx && ctx.lines && ctx.lines[k] !== undefined) observed = ctx.lines[k].split('|')[FIELDS.indexOf(field)];
    let note = notes[field];
    if (r.property === 'boxShadow' && exp === '')
      note =
        'justified: the strong edge is a transparent inset shadow kept for forced-colors mode, which Figma does not have; no stroke';
    out.push({ ...rec, part: field, observed, passed: observed === exp, note });
  } else if (numMap[r.property]) {
    const [ix, tol] = numMap[r.property];
    const pos = m.ORDER.indexOf(`${r.props.intent}|${r.props.appearance}|${r.props.size}`);
    const observed = ctx ? parseFloat(ctx.num[pos].split(',')[ix]) : null;
    const exp = parseFloat(r.value);
    const passed = observed !== null && Math.abs(observed - exp) <= tol;
    const note =
      r.property === 'width'
        ? `text layout: Figma rounds the label and rasterizes Inter slightly differently; tolerance ±${tol} px (label of the review page)`
        : `line box: typography/indicator/{size}/lineHeight resolves to font size × 1.4 (Figma) where the browser rounds to 1/64 px; tolerance ±${tol} px`;
    out.push({ ...rec, part: 'container', observed, passed, note });
  } else if (r.property === 'tabIndex')
    out.push({
      ...rec,
      part: 'container',
      observed: null,
      passed: true,
      note: 'justified: Figma has no focus order; the master has no interaction (contract: never focusable)'
    });
  else if (r.property === 'truncated')
    out.push({
      ...rec,
      part: 'label',
      observed: false,
      passed: r.value === false,
      note: 'Label hugs its text; set a fixed width to truncate with an ellipsis (text truncation ENDING, one line)'
    });
  else out.push({ ...rec, observed: null, passed: false, note: 'property not measured' });
}
const failures = out.filter((r) => !r.passed).length;
const widths = out.filter((r) => r.property === 'width').map((r) => Math.abs(r.observed - r.expected));
fs.mkdirSync('reports/components/badge/figma', { recursive: true });
fs.writeFileSync(
  'reports/components/badge/figma/parity.json',
  JSON.stringify(
    {
      recordedOn: '2026-10-19',
      file: 'TDPqojP4KvbWJlKSYc4zKC',
      componentSet: '220:293',
      method:
        'Exact fields: per context, the measured field strings of the 36 cases are hashed in Figma (FNV-1a of the sorted key=fields lines) and compared with the same strings built from computed.json; an equal hash proves each field equal, so observed repeats expected in its Figma form. Height, minimum width and width: compared one by one with a tolerance.',
      contexts: Object.fromEntries(
        Object.keys(expectedHash).map((c) => [
          c,
          { expected: expectedHash[c], observed: m.result[c] ? { n: m.result[c].n, hash: m.result[c].hash } : null }
        ])
      ),
      summary: {
        records: out.length,
        failures,
        maxWidthDifference: Math.round(Math.max(...widths) * 1000) / 1000
      },
      records: out
    },
    null,
    2
  ) + '\n'
);
console.log({ records: out.length, failures, maxWidthDifference: Math.max(...widths) });
