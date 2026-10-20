import fs from 'node:fs';
// Usage: node authoring/adapters/figma/link-parity-report.mjs --expected
//        node authoring/adapters/figma/link-parity-report.mjs <measurement result json>
// The measurement body is link-parity.plugin.js (use_figma). Per context, the field strings of the 13 cases are
// hashed (FNV-1a of the sorted "key=fields" lines); this script builds the same strings from
// reports/components/link/svelte/computed.json, so equal hashes prove every field equal (a differing context
// needs its lines, DETAIL in the measurement). Writes reports/components/link/figma/parity.json, one record per
// computed record.
const { records } = JSON.parse(fs.readFileSync('reports/components/link/svelte/computed.json', 'utf8'));
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
const num = (v) => (v === '' ? '' : String(Math.round(parseFloat(v) * 1000) / 1000));
const color = (v) => (v ? hex(v) : '');
const FIELDS = [
  'color',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'decoLine',
  'decoThickness',
  'decoColor',
  'metaDeco',
  'metaColor',
  'glyphW',
  'glyphH',
  'glyphColor',
  'glyphOpacity',
  'glyphGap',
  'ring',
  'radius'
];
const map = {
  color: ['color', color],
  fontSize: ['fontSize', num],
  parentFontSize: ['fontSize', num],
  fontWeight: ['fontWeight', num],
  parentFontWeight: ['fontWeight', num],
  lineHeight: ['lineHeight', num],
  parentLineHeight: ['lineHeight', num],
  decorationLine: ['decoLine', String],
  decorationThickness: ['decoThickness', num],
  decorationColor: ['decoColor', color],
  metaDecoration: ['metaDeco', String],
  metaColor: ['metaColor', color],
  glyphWidth: ['glyphW', num],
  glyphHeight: ['glyphH', num],
  glyphColor: ['glyphColor', color],
  glyphOpacity: ['glyphOpacity', num],
  glyphGap: ['glyphGap', num],
  outline: [
    'ring',
    (v) => {
      const m = v.match(/^(\w+) ([\d.]+)px (rgba?\([^)]+\)) (-?[\d.]+)px$/);
      return m[1] === 'none' ? '' : `${hex(m[3])}/${parseFloat(m[2])}/${parseFloat(m[4])}`;
    }
  ],
  radius: ['radius', num]
};
// The browser records the inherit cases under the name of their context (info … inverse): Figma keys them the same way.
const keyOf = (r) => `${r.context}|${r.props.tone}|${r.props.destination}|${r.state}`;
const expected = {};
for (const r of records) {
  if (r.property === 'parentColor') continue;
  const k = keyOf(r);
  const [field, f] = map[r.property];
  const v = f(r.value);
  (expected[k] = expected[k] || {})[field] = v;
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
  if (process.argv[3]) for (const k of byContext[process.argv[3]]) console.log(`${k}=${line(k)}`);
  process.exit(0);
}
const m = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const notes = {
  color:
    'Label fill bound to link/content: color/content/link (Color accent) or the content color of the context (Color on info … on inverse)',
  fontSize:
    'Label bound to link/font-size, alias of typography/body/md/fontSize (Size md, the body text around the link)',
  fontWeight: 'Label bound to link/font-weight (Size md)',
  lineHeight: 'Label bound to link/line-height (Size md); the link box is at least one line high',
  decoLine: 'Label text decoration underline; Meta and Indicator are separate layers without decoration',
  decoThickness:
    'justified: Figma cannot bind the underline thickness to a variable; literal 1 px (State=default) and 2 px (hover, pressed), the values of border/width/default and border/width/strong',
  decoColor: 'underline color AUTO: the label fill',
  metaDeco: 'Meta text decoration none',
  metaColor: 'Meta fill bound to link/quiet: color/content/tertiary (Color accent) or the content color of the context',
  glyphW: 'Indicator icon width bound to link/font-size (one em)',
  glyphH: 'Indicator icon height bound to link/font-size (one em)',
  glyphColor: 'glyph fill bound to link/quiet (as Meta)',
  glyphOpacity:
    'Indicator icon opacity bound to link/indicator-opacity: 100 (Color accent) or opacity/muted (Color on …, 70 %, read as 0.7)',
  glyphGap: 'Indicator frame padding-left bound to space/content/xs',
  ring: 'Focus ring: outside stroke bound to color/focus/ring and focus/width, 2 px outside (focus.offset)',
  radius: 'link box corners bound to radius/indicator (the focus ring corners too)'
};
const out = [];
for (const r of records) {
  const k = keyOf(r);
  const ctx = m[r.context];
  const proven = ctx && ctx.hash === expectedHash[r.context].hash && ctx.n === expectedHash[r.context].n;
  if (r.property === 'parentColor') {
    // The surrounding text is outside the component. With tone inherit the label must take its color: the label
    // color (proven by the hash) is compared with the parent color of the browser; tone accent does not use it.
    const rec = {
      context: r.context,
      props: r.props,
      state: r.state,
      part: 'context',
      property: r.property,
      expected: r.value
    };
    if (r.props.tone === 'inherit') {
      const observed = proven ? expected[k].color : null;
      out.push({
        ...rec,
        observed,
        passed: observed === hex(r.value),
        note: 'Color on … : the label color equals the text color of the context'
      });
    } else
      out.push({
        ...rec,
        observed: null,
        passed: true,
        note: 'justified: the text around the link is not part of the component; Color accent does not use its color'
      });
    continue;
  }
  const [field, f] = map[r.property];
  const exp = f(r.value);
  let observed = null;
  if (proven) observed = exp;
  else if (ctx && ctx.lines && ctx.lines[k] !== undefined) observed = ctx.lines[k].split('|')[FIELDS.indexOf(field)];
  let note = notes[field];
  if (field === 'ring' && exp === '') note = 'no focus: the Focus ring layer is hidden';
  out.push({
    context: r.context,
    props: r.props,
    state: r.state,
    part: field,
    property: r.property,
    expected: r.value,
    observed,
    passed: observed === exp,
    note
  });
}
const failures = out.filter((r) => !r.passed).length;
fs.mkdirSync('reports/components/link/figma', { recursive: true });
fs.writeFileSync(
  'reports/components/link/figma/parity.json',
  JSON.stringify(
    {
      recordedOn: '2026-10-20',
      file: 'TDPqojP4KvbWJlKSYc4zKC',
      componentSet: '232:659',
      method:
        'Per context, the measured field strings of the 13 cases are hashed in Figma (FNV-1a of the sorted key=fields lines) and compared with the same strings built from computed.json; an equal hash proves each field equal, so observed repeats expected in its Figma form. The parent text of the code is represented by the Size (md) and Color variants in Figma.',
      contexts: Object.fromEntries(
        Object.keys(expectedHash).map((c) => [
          c,
          { expected: expectedHash[c], observed: m[c] ? { n: m[c].n, hash: m[c].hash } : null }
        ])
      ),
      summary: { records: out.length, failures },
      records: out
    },
    null,
    2
  ) + '\n'
);
console.log({ records: out.length, failures });
