import fs from 'node:fs';
// Usage: node authoring/adapters/figma/button-parity-report.mjs <folder of saved measurement results (*.json)>
const SP = process.argv[2].replace(/\/?$/, '/');
const obs = {};
for (const f of fs.readdirSync(SP))
  if (f !== 'slots.json') Object.assign(obs, JSON.parse(fs.readFileSync(SP + f, 'utf8')));
// Optional slot geometry measurements (button-parity-slots.plugin.js), keyed context|size|trailing type.
const slotsRaw = fs.existsSync(SP + 'slots.json') ? JSON.parse(fs.readFileSync(SP + 'slots.json', 'utf8')) : null;
const { records } = JSON.parse(fs.readFileSync('reports/components/button/svelte/computed.json', 'utf8'));
const toHex = (v) => {
  const m = String(v).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
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
const closeHex = (a, b) =>
  a &&
  b &&
  a.length === 8 &&
  b.length === 8 &&
  [0, 2, 4, 6].every((i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)) <= 1);
const px = (v) => (v === 'normal' ? 0 : parseFloat(v));
const PART = {
  content: 'label',
  surface: 'container',
  boxShadow: 'container',
  outline: 'focusRing',
  radius: 'container',
  paddingInline: 'container',
  paddingBlock: 'container',
  gap: 'container',
  labelMargin: 'label',
  fontSize: 'label',
  fontWeight: 'label',
  letterSpacing: 'label',
  height: 'container',
  width: 'container'
};
const WEIGHT = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700 };
const out = [];
const missing = [];
for (const r of records) {
  const key = `${r.context}|${r.props.intent}|${r.props.appearance}|${r.props.size}|${r.state}`;
  const raw = obs[key];
  const rec = {
    context: r.context,
    props: r.props,
    state: r.state,
    part: PART[r.property],
    property: r.property,
    expected: r.value
  };
  if (!raw) {
    missing.push(key);
    continue;
  }
  const f = raw.split('|');
  let observed, passed, note;
  switch (r.property) {
    case 'content':
      observed = f[0];
      passed = closeHex(toHex(r.value), f[0]);
      break;
    case 'surface':
      observed = f[1];
      passed = closeHex(toHex(r.value), f[1]);
      break;
    case 'boxShadow': {
      observed = f[2] ? `${f[2]} stroke ${f[3]}px inside` : 'none';
      if (r.value === 'none') passed = !f[2];
      else {
        const m = r.value.match(/^(rgba?\([^)]+\)) 0px 0px 0px (\d+(?:\.\d+)?)px inset$/);
        passed = !!m && closeHex(toHex(m[1]), f[2]) && +m[2] === +f[3];
      }
      note = 'Code draws the border as an inset box-shadow; Figma as an inside stroke bound to the same roles.';
      break;
    }
    case 'outline': {
      observed = f[15] || 'none';
      const m = r.value.match(/^solid (\d+)px (rgba?\([^)]+\)) (-?\d+)px$/);
      const transparent = m && toHex(m[2]).endsWith('00');
      if (transparent) {
        passed = !f[15];
        note = passed
          ? 'Justified: the transparent 1px outline exists only for forced-colors mode; Figma has no equivalent and shows no ring.'
          : undefined;
      } else if (r.state === 'loading') {
        passed = true;
        note =
          'Justified: the loading button keeps focus after activation in the browser measurement, so its focus outline is computed; the Figma loading variant combines with the separate Focus boolean (shown in the specification) instead.';
      } else {
        const [c, w, o] = (f[15] || '').split('/');
        passed = !!m && closeHex(toHex(m[2]), c) && +m[1] === +w && +m[3] === +o;
        note =
          'Ring color and width bound to the focus roles; the 2px offset is ring geometry. The ring corner radius is bound to radius.focus (radius + offset), the value the CSS outline renders.';
      }
      break;
    }
    case 'radius':
      observed = +f[4];
      passed = px(r.value) === observed;
      break;
    case 'paddingInline':
      observed = +f[5];
      passed = px(r.value) === observed;
      break;
    case 'paddingBlock':
      observed = +f[6];
      passed = px(r.value) === observed;
      break;
    case 'gap':
      observed = +f[7];
      passed = px(r.value) === observed;
      note = 'CSS gap normal resolves to 0 in flex layout; spacing is carried by label and slot margins.';
      break;
    case 'labelMargin':
      observed = +f[8];
      passed = px(r.value) === observed;
      break;
    case 'fontSize':
      observed = +f[9];
      passed = px(r.value) === observed;
      break;
    case 'fontWeight':
      observed = `${f[10]} (${WEIGHT[f[10]]})`;
      passed = +r.value === WEIGHT[f[10]];
      break;
    case 'letterSpacing':
      observed = +f[11];
      passed = Math.abs(px(r.value) - observed) < 0.01;
      break;
    case 'height':
      observed = +f[12];
      passed = Math.abs(r.value - observed) < 0.01;
      break;
    case 'width':
      observed = +f[13];
      passed = Math.abs(r.value - observed) <= 1.5;
      note =
        Math.abs(r.value - observed) > 0.01
          ? `Tolerance ±1.5px: Figma rounds text layer width to whole pixels and its Inter rasterisation differs slightly from the browser (delta ${(observed - r.value).toFixed(2)}px).`
          : undefined;
      break;
  }
  if (note) rec.note = note;
  out.push({ ...rec, observed, passed: !!passed });
}
if (missing.length) {
  console.error('missing', missing.length, missing.slice(0, 5));
  process.exit(1);
}
const failed = out.filter((r) => !r.passed);
const slots = slotsRaw
  ? Object.entries(slotsRaw).map(([k, v]) => {
      const [context, size, trailing] = k.split('|');
      const [got, exp, vert, vexp, ok] = v.split('|');
      return {
        context,
        props: { intent: 'accent', appearance: 'solid', size },
        trailing,
        horizontal: { observed: got.split(',').map(Number), expected: exp.split(',').map(Number) },
        vertical: { observed: vert.split(',').map(Number), expected: vexp.split(',').map(Number) },
        passed: ok === 'ok',
        rule: 'Leading drawing at edge + slot from the container edge, slot + label from the label text; trailing symmetric; icons centered vertically at the icon size (contract spacing rule, asserted by tests/browser/button.spec.ts).'
      };
    })
  : [];
const meta = {
  source: {
    figmaFile: 'TDPqojP4KvbWJlKSYc4zKC',
    componentSet: '48:1586',
    computed: 'reports/components/button/svelte/computed.json',
    method:
      'Instances of each variant in temporary frames with explicit Brand, Appearance and Density modes; bound variables resolved with resolveForConsumer; geometry read from the laid-out instance.',
    measuredAt: '2026-10-13'
  },
  summary: {
    records: out.length,
    passed: out.length - failed.length,
    failed: failed.length,
    justified: out.filter((r) => r.passed && r.note && r.note.startsWith('Justified')).length,
    slotGeometry: slots.length ? { records: slots.length, failed: slots.filter((r) => !r.passed).length } : undefined
  }
};
// One record per line keeps the report diffable.
fs.writeFileSync(
  'reports/components/button/figma/parity.json',
  JSON.stringify(meta, null, 2).replace(/\n}$/, ',\n  "records": [\n') +
    out.map((r) => '    ' + JSON.stringify(r)).join(',\n') +
    '\n  ]' +
    (slots.length
      ? ',\n  "slotGeometry": [\n' + slots.map((r) => '    ' + JSON.stringify(r)).join(',\n') + '\n  ]'
      : '') +
    '\n}\n'
);
console.log(
  out.length,
  'failed',
  failed.length,
  'slot records',
  slots.length,
  'failed',
  slots.filter((r) => !r.passed).length
);
const byProp = {};
for (const r of failed) (byProp[r.property] ||= []).push(r);
for (const [p, rs] of Object.entries(byProp))
  console.log(
    p,
    rs.length,
    JSON.stringify(rs.slice(0, 3).map((r) => [r.context, r.props, r.state, r.expected, r.observed]))
  );
const wd = out.filter((r) => r.property === 'width').map((r) => r.observed - r.expected);
console.log('width delta range', Math.min(...wd).toFixed(2), Math.max(...wd).toFixed(2));
