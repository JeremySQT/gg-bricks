import fs from 'node:fs';
// Usage: node authoring/adapters/figma/icon-parity-report.mjs <measurement result json>
// The measurement body is icon-parity.plugin.js (use_figma): keys "<context>|<size>", fields
// width|height|fill|widthVar|heightVar|vecW|vecH|vecX|vecY. Compares with reports/components/icon/svelte/computed.json
// and writes reports/components/icon/figma/parity.json, one record per computed record plus the glyph inset check.
const m = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { records } = JSON.parse(fs.readFileSync('reports/components/icon/svelte/computed.json', 'utf8'));
const toHex = (v) => {
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
const out = [];
for (const r of records) {
  const raw = m.out[`${r.context}|${r.props.size}`];
  const rec = {
    context: r.context,
    props: r.props,
    state: r.state,
    part: r.part,
    property: r.property,
    expected: r.value
  };
  if (!raw) {
    out.push({ ...rec, observed: null, passed: false, note: 'no measurement' });
    continue;
  }
  const [w, h, fill, wv, hv] = raw.split('|');
  if (r.property === 'width' || r.property === 'height') {
    const obs = parseFloat(r.property === 'width' ? w : h);
    const bound = parseFloat(r.property === 'width' ? wv : hv);
    const passed = obs === r.value && bound === r.value;
    out.push({ ...rec, observed: obs, passed, note: `bound to size/icon/${r.props.size} (resolves to ${bound})` });
  } else if (r.property === 'fill') {
    const exp = toHex(r.value);
    out.push({
      ...rec,
      observed: fill,
      passed: fill === exp,
      note: 'glyph fill bound to color/content/primary (the host content color; Button overrides it with button/foreground)'
    });
  } else out.push({ ...rec, observed: null, passed: false, note: 'property not measured' });
}
// Glyph inset: the drawing of the reference set (Phosphor plus, 18/24 of the box) must scale with the box.
const inset = [];
for (const [key, raw] of Object.entries(m.out)) {
  const [context, size] = key.split('|');
  const [w, , , , , vw, vh, vx, vy] = raw.split('|').map(parseFloat);
  const expDraw = (w * 18) / 24;
  const expInset = w / 8;
  inset.push({
    context,
    props: { size },
    state: 'default',
    part: 'glyph',
    property: 'drawingBox',
    expected: `${expDraw}×${expDraw} at (${expInset}, ${expInset})`,
    observed: `${vw}×${vh} at (${vx}, ${vy})`,
    passed: vw === expDraw && vh === expDraw && vx === expInset && vy === expInset,
    note: 'Phosphor “plus” fixture: drawing 18/24 of the box, inset 1/8, scaled by the box (constraints scale)'
  });
}
const all = [...out, ...inset];
const failures = all.filter((r) => !r.passed).length;
fs.mkdirSync('reports/components/icon/figma', { recursive: true });
fs.writeFileSync(
  'reports/components/icon/figma/parity.json',
  JSON.stringify(
    {
      recordedOn: '2026-10-14',
      file: 'TDPqojP4KvbWJlKSYc4zKC',
      componentSet: '149:20',
      bindings: m.bindings,
      summary: { records: all.length, computedRecords: out.length, insetRecords: inset.length, failures },
      records: all
    },
    null,
    2
  ) + '\n'
);
console.log({ records: all.length, failures });
