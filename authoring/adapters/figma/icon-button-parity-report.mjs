import fs from 'node:fs';
// Usage: node authoring/adapters/figma/icon-button-parity-report.mjs --expected
//        node authoring/adapters/figma/icon-button-parity-report.mjs <measurement result json>
// The measurement body is icon-button-parity.plugin.js (use_figma). For each case it builds the field string
// glyph|surface|stroke/width|radius|width|height|iconW|iconH|iconDX|iconDY|ring color/width/offset|target
// and returns, per context, the case count and the FNV-1a hash of the sorted "key=fields" lines; a context
// listed in DETAIL also returns its lines. This script builds the same strings from
// reports/components/icon-button/svelte/computed.json, so equal hashes prove that every field of the
// context matches; a differing context is compared field by field from its lines. --expected prints the
// expected hashes. Writes reports/components/icon-button/figma/parity.json, one record per computed record.
const { records } = JSON.parse(fs.readFileSync('reports/components/icon-button/svelte/computed.json', 'utf8'));
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
const FIELDS = [
  'glyph',
  'surface',
  'stroke',
  'radius',
  'width',
  'height',
  'iconW',
  'iconH',
  'iconDX',
  'iconDY',
  'ring'
];
// Computed property → field and expected field value. The transparent 1 px outline exists only for
// forced-colors mode, which Figma does not have: it maps to “no ring” (justified difference).
const map = {
  content: ['glyph', hex],
  glyphColor: ['glyph', hex],
  surface: ['surface', hex],
  boxShadow: ['stroke', (v) => (v === 'none' ? '' : `${hex(v)}/${parseFloat(v.match(/0px 0px 0px ([\d.]+)px/)[1])}`)],
  radius: ['radius', (v) => String(parseFloat(v))],
  width: ['width', String],
  height: ['height', String],
  iconWidth: ['iconW', String],
  iconHeight: ['iconH', String],
  iconOffsetX: ['iconDX', String],
  iconOffsetY: ['iconDY', String],
  outline: [
    'ring',
    (v) => {
      const m = v.match(/^solid ([\d.]+)px (rgba?\([^)]+\)) (-?[\d.]+)px$/);
      return hex(m[2]).endsWith('00') ? '' : `${hex(m[2])}/${parseFloat(m[1])}/${parseFloat(m[3])}`;
    }
  ]
};
const keyOf = (r) => `${r.context}|${r.props.intent}|${r.props.appearance}|${r.props.size}|${r.state}`;
const expected = {};
for (const r of records) {
  const k = keyOf(r);
  const [field, f] = map[r.property];
  expected[k] = expected[k] || {};
  expected[k][field] = f(r.value);
}
const TARGET = '44/44/0/0'; // size.target.min in both dimensions, centered on the container (contract rule)
const line = (k) => [...FIELDS.map((f) => expected[k][f]), TARGET].join('|');
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
  glyph:
    'glyph vector fill (loading: the spinner arc stroke) bound to button/foreground through the Components · button style and state modes of the variant',
  surface: 'Container fill bound to color/action/{intent}/{appearance}/{state}/surface',
  stroke:
    'Container inside stroke bound to color/action/{intent}/outline/{state}/border, weight border/width/default (outline only)',
  radius: 'Container corners bound to radius/control',
  width: 'root and Container bound to size/control/{size}',
  height: 'root and Container bound to size/control/{size}',
  iconW: 'Icon instance of the size (size/icon/{size}); loading: Loading indicator bound to size/icon/{size}',
  iconH: 'Icon instance of the size (size/icon/{size}); loading: Loading indicator bound to size/icon/{size}',
  iconDX: 'centered by its box (auto layout, center)',
  iconDY: 'centered by its box (auto layout, center)',
  ring: 'Focus ring: outside stroke bound to color/focus/ring and focus/width, 2 px outside the container (focus.offset), corners radius/focus'
};
const out = [];
for (const r of records) {
  const k = keyOf(r);
  const ctx = m[r.context];
  const [field, f] = map[r.property];
  const exp = f(r.value);
  let observed = null;
  let passed = false;
  if (ctx && ctx.hash === expectedHash[r.context].hash && ctx.n === expectedHash[r.context].n) {
    observed = exp;
    passed = true;
  } else if (ctx && ctx.lines && ctx.lines[k] !== undefined) {
    observed = ctx.lines[k].split('|')[FIELDS.indexOf(field)];
    passed = observed === exp;
  }
  let note = notes[field];
  if (r.property === 'outline' && exp === '')
    note = 'justified: the transparent 1 px outline exists for forced-colors mode, which Figma does not have; no layer';
  if (r.state === 'loading' && field === 'ring')
    note =
      'justified: the browser measures a loading icon button with keyboard focus (it stays focusable); Figma combines State=loading with Focus on';
  out.push({
    context: r.context,
    props: r.props,
    state: r.state,
    part: field,
    property: r.property,
    expected: r.value,
    observed,
    passed,
    note
  });
}
const target = Object.keys(expected).map((k) => {
  const [context, intent, appearance, size, state] = k.split('|');
  const ctx = m[context];
  const observed =
    ctx && ctx.hash === expectedHash[context].hash ? TARGET : ctx && ctx.lines ? ctx.lines[k]?.split('|')[11] : null;
  return {
    context,
    props: { intent, appearance, size },
    state,
    part: 'target',
    property: 'target',
    expected: TARGET,
    observed,
    passed: observed === TARGET,
    note: 'Target layer bound to size/target/min (width/height), centered on the container (dx/dy), outside the layout'
  };
});
const all = [...out, ...target];
const failures = all.filter((r) => !r.passed).length;
fs.mkdirSync('reports/components/icon-button/figma', { recursive: true });
fs.writeFileSync(
  'reports/components/icon-button/figma/parity.json',
  JSON.stringify(
    {
      recordedOn: '2026-10-19',
      file: 'TDPqojP4KvbWJlKSYc4zKC',
      componentSet: '211:1167',
      method:
        'Per context, the measured field strings of every case are hashed in Figma (FNV-1a of the sorted key=fields lines) and compared with the same strings built from computed.json; an equal hash proves each field equal, so observed repeats expected in its Figma form (hex color, number); a differing context is detailed field by field.',
      contexts: Object.fromEntries(
        Object.keys(expectedHash).map((c) => [
          c,
          { expected: expectedHash[c], observed: m[c] ? { n: m[c].n, hash: m[c].hash } : null }
        ])
      ),
      summary: { records: all.length, computedRecords: out.length, targetRecords: target.length, failures },
      records: all
    },
    null,
    2
  ) + '\n'
);
console.log({ records: all.length, failures });
