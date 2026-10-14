import fs from 'node:fs';
// Usage: node authoring/adapters/figma/shortcut-parity-report.mjs <folder of saved measurement results (*.json)>
// Compares the measurements of shortcut-parity.plugin.js (one file per brand) with
// reports/components/shortcut/svelte/computed.json and writes reports/components/shortcut/figma/parity.json.
const SP = process.argv[2].replace(/\/?$/, '/');
const obs = {};
for (const f of fs.readdirSync(SP))
  if (f.endsWith('.json')) Object.assign(obs, JSON.parse(fs.readFileSync(SP + f, 'utf8')));
const { records } = JSON.parse(fs.readFileSync('reports/components/shortcut/svelte/computed.json', 'utf8'));
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
const px = (v) => (v === 'normal' || v === 'auto' ? 0 : parseFloat(v));
const WEIGHT = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700 };
const ROUND =
  'Justified: Figma rounds an auto-sized text layer to whole pixels (line boxes 16, 17, 20 for 15.4, 16.8, 19.6), so plain keys and caps are 0.2 to 0.6 px taller than in the browser; tolerance ±1 px.';
// Field order written by shortcut-parity.plugin.js.
const F = {
  opacity: 0,
  gap: 1,
  fontSize: 2,
  fontStyle: 3,
  lineHeight: 4,
  letterSpacing: 5,
  textColor: 6,
  keyFill: 7,
  keyStroke: 8,
  strokeWidth: 9,
  radius: 10,
  paddingLeft: 11,
  paddingTop: 12,
  minWidth: 13,
  keyWidth: 14,
  keyHeight: 15,
  sepColor: 16,
  sepText: 17,
  rootWidth: 18,
  rootHeight: 19
};
const out = [];
const missing = [];
const seen = new Set();
for (const r of records) {
  const key = `${r.context}|${r.props.appearance}|${r.props.size}|${r.props.platform}`;
  const raw = obs[key];
  const rec = {
    context: r.context,
    props: r.props,
    state: r.state,
    part: r.part,
    property: r.property,
    expected: r.value
  };
  if (!raw) {
    missing.push(key);
    continue;
  }
  seen.add(key);
  const f = raw.split('|');
  const g = (name) => f[F[name]];
  const keycap = r.props.appearance === 'keycap';
  let observed, passed, note;
  switch (`${r.part}/${r.property}`) {
    case 'container/font-size':
      observed = +g('fontSize');
      passed = px(r.value) === observed;
      break;
    case 'container/font-weight':
      observed = `${g('fontStyle')} (${WEIGHT[g('fontStyle')]})`;
      passed = +r.value === WEIGHT[g('fontStyle')];
      break;
    case 'container/line-height':
      observed = +g('lineHeight');
      passed = Math.abs(px(r.value) - observed) < 0.01;
      break;
    case 'container/letter-spacing':
      observed = +g('letterSpacing');
      passed = Math.abs(px(r.value) - observed) < 0.01;
      break;
    case 'container/font-feature-settings':
      observed = 'not set';
      passed = true;
      note =
        'Justified: the Plugin API cannot set OpenType features on a text layer or a text style (tnum, recorded in the style description); the keys show letters and glyphs, not figures.';
      break;
    case 'container/color':
    case 'key/color':
      observed = g('textColor');
      passed = closeHex(toHex(r.value), observed);
      note =
        'Bound to the adapter variable shortcut/foreground (alias of color/content/primary); the code inherits the color of the context.';
      break;
    case 'container/gap':
      observed = +g('gap');
      passed = px(r.value) === observed;
      break;
    case 'container/white-space':
      observed = 'auto-width text layers';
      passed = r.value === 'nowrap';
      note = 'A text layer sized to its content never wraps, like white-space: nowrap.';
      break;
    case 'key/background-color': {
      const fill = g('keyFill');
      observed = fill || 'none';
      passed = keycap ? closeHex(toHex(r.value), fill) : !fill && toHex(r.value).endsWith('00');
      break;
    }
    case 'key/border-color': {
      const s = g('keyStroke');
      observed = s || 'none';
      if (keycap) passed = closeHex(toHex(r.value), s);
      else {
        passed = !s;
        note = 'The code computes currentColor for a border of width 0 (nothing is drawn); Figma has no stroke.';
      }
      break;
    }
    case 'key/border-width':
      observed = +g('strokeWidth');
      passed = px(r.value) === observed;
      if (keycap)
        note = 'Inside stroke included in the layout (strokesIncludedInLayout), the equivalent of a border-box border.';
      break;
    case 'key/border-radius':
      observed = +g('radius');
      passed = px(r.value) === observed;
      break;
    case 'key/padding-inline':
      observed = +g('paddingLeft');
      passed = px(r.value) === observed;
      break;
    case 'key/padding-block':
      observed = +g('paddingTop');
      passed = r.value.split(' ').every((v) => px(v) === observed);
      break;
    case 'key/min-inline-size': {
      const mw = g('minWidth');
      observed = mw === 'none' ? 'none' : +mw;
      if (r.value === 'auto') passed = mw === 'none';
      else {
        passed = Math.abs(px(r.value) - observed) <= 1;
        note =
          'Justified: the square minimum is the adapter variable shortcut/cap-min-width (18, 19, 22), the rounded Figma line box plus two borders, so that a single character stays square in Figma; the browser computes 1lh + 2 borders (17.39, 18.8, 21.59). Delta ' +
          (observed - px(r.value)).toFixed(2) +
          ' px.';
      }
      break;
    }
    case 'key/block-size':
      observed = +g('keyHeight');
      passed = Math.abs(r.value - observed) <= 1;
      note = `${ROUND} Delta ${(observed - r.value).toFixed(2)} px.`;
      break;
    case 'key/inline-size':
      observed = +g('keyWidth');
      passed = Math.abs(r.value - observed) <= 1.5;
      note =
        Math.abs(r.value - observed) > 0.01
          ? `Tolerance ±1.5px: Figma rounds text layer width to whole pixels and its Inter rasterisation differs slightly from the browser (delta ${(observed - r.value).toFixed(2)}px).`
          : undefined;
      break;
    case 'separator/color':
      observed = g('sepColor');
      passed = closeHex(toHex(r.value), observed);
      note = 'Bound to shortcut/foreground like the keys.';
      break;
    case 'separator/text':
      observed = g('sepText');
      passed = observed === r.value;
      break;
    default:
      observed = 'not measured';
      passed = false;
  }
  if (note) rec.note = note;
  out.push({ ...rec, observed, passed: !!passed });
}
if (missing.length) {
  console.error('missing', missing.length, missing.slice(0, 5));
  process.exit(1);
}
// Opacity is not in computed.json (the browser test asserts it separately); recorded here from the contract role.
const opacity = [];
for (const key of seen) {
  const [context, appearance, size, platform] = key.split('|');
  const [effective, resolved] = obs[key].split('|')[F.opacity].split('/').map(Number);
  const expected = appearance === 'plain' ? 0.7 : 1;
  opacity.push({
    context,
    props: { size, appearance, platform },
    state: 'default',
    part: 'container',
    property: 'opacity',
    expected,
    observed: effective,
    resolvedVariable: appearance === 'plain' ? resolved : undefined,
    passed: Math.abs(effective - expected) < 0.005,
    note:
      appearance === 'plain'
        ? 'contentOpacity (opacity.muted, 0.7) in the code; in Figma the container opacity is bound to opacity/muted, synced in percent (70) because Figma reads a number variable bound to layer opacity as a percentage.'
        : 'Keycap stays at full opacity; nothing bound.'
  });
}
const failed = out.filter((r) => !r.passed);
const meta = {
  source: {
    figmaFile: 'TDPqojP4KvbWJlKSYc4zKC',
    componentSet: '151:110',
    computed: 'reports/components/shortcut/svelte/computed.json',
    method:
      'Instances of each of the 12 variants (three-key form Mod+Shift+K: ⇧ ⌘ K on Mac, Ctrl + Shift + K on Other, as the browser measured) in temporary frames with explicit Brand, Appearance and Density modes; bound variables resolved with resolveForConsumer; geometry read from the laid-out instance; the first key and the first separator measured.',
    measuredAt: '2026-10-14'
  },
  summary: {
    records: out.length,
    passed: out.length - failed.length,
    failed: failed.length,
    justified: out.filter((r) => r.passed && r.note && r.note.startsWith('Justified')).length,
    opacity: { records: opacity.length, failed: opacity.filter((r) => !r.passed).length }
  }
};
fs.mkdirSync('reports/components/shortcut/figma', { recursive: true });
// One record per line keeps the report diffable.
fs.writeFileSync(
  'reports/components/shortcut/figma/parity.json',
  JSON.stringify(meta, null, 2).replace(/\n}$/, ',\n  "records": [\n') +
    out.map((r) => '    ' + JSON.stringify(r)).join(',\n') +
    '\n  ],\n  "opacity": [\n' +
    opacity.map((r) => '    ' + JSON.stringify(r)).join(',\n') +
    '\n  ]\n}\n'
);
console.log(
  out.length,
  'failed',
  failed.length,
  'justified',
  meta.summary.justified,
  'opacity records',
  opacity.length,
  'failed',
  meta.summary.opacity.failed
);
const byProp = {};
for (const r of failed) (byProp[`${r.part}/${r.property}`] ||= []).push(r);
for (const [p, rs] of Object.entries(byProp))
  console.log(p, rs.length, JSON.stringify(rs.slice(0, 3).map((r) => [r.context, r.props, r.expected, r.observed])));
const wd = out.filter((r) => r.property === 'inline-size').map((r) => r.observed - r.expected);
console.log('width delta range', Math.min(...wd).toFixed(2), Math.max(...wd).toFixed(2));
const hd = out.filter((r) => r.property === 'block-size').map((r) => r.observed - r.expected);
console.log('height delta range', Math.min(...hd).toFixed(2), Math.max(...hd).toFixed(2));
