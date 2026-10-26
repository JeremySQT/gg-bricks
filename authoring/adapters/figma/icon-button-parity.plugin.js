// IconButton Figma parity measurement (use_figma body), 2026-10-19.
// In each of the 18 brand × appearance × density contexts, instantiates the 27 default cases and, in the
// representative contexts of reports/components/icon-button/svelte/computed.json, the 45 md state cases (hover,
// pressed, focus, loading, disabled), inside a temporary frame with explicit Brand/Appearance/Density modes;
// reads resolved bound values and geometry into the field string
// glyph|surface|stroke/width|radius|width|height|iconW|iconH|iconDX|iconDY|ring color/width/offset|targetW/targetH/targetDX/targetDY
// per "<context>|<intent>|<appearance>|<size>|<state>" key, removes the frame and returns per context
// { n, hash } (FNV-1a of the sorted "key=fields" lines), plus the lines of the contexts listed in DETAIL.
// icon-button-parity-report.mjs compares the hashes with the strings it builds from computed.json.
// IDs (page and set) come from reports/components/icon-button/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const DETAIL = [];
const REPRESENTATIVE = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const page = await figma.getNodeByIdAsync('211:2');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name.startsWith('_parity '))) n.remove();
const set = await figma.getNodeByIdAsync('211:1167');
const FOCUS = Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith('Focus'));
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const res = async (node, field) => {
  const b = node.boundVariables && node.boundVariables[field];
  const ref = Array.isArray(b) ? b[0] : b;
  return ref ? (await varOf(ref.id)).resolveForConsumer(node).value : '';
};
const hex = (c) =>
  [c.r, c.g, c.b, c.a === undefined ? 1 : c.a]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
const paint = async (node, kind) => {
  const p = node[kind] && node[kind][0];
  if (!p) return '';
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  return id ? hex((await varOf(id)).resolveForConsumer(node).value) : 'literal';
};
const r2 = (x) => Math.round(x * 100) / 100;
const center = (n) => {
  const t = n.absoluteTransform;
  return [t[0][2] + n.width / 2, t[1][2] + n.height / 2];
};
const I = ['accent', 'neutral', 'danger'],
  A = ['solid', 'outline', 'ghost'],
  S = ['sm', 'md', 'lg'];
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const result = {};
for (const BRAND of ['base', 'brick', 'orchid'])
  for (const ap of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${BRAND}-${ap}-${d}`;
      const frame = figma.createAutoLayout('HORIZONTAL', { name: '_parity ' + ctx, itemSpacing: 16 });
      frame.layoutWrap = 'WRAP';
      frame.resize(1200, 100);
      frame.x = -4000;
      frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), BRAND));
      frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
      frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const cases = [];
      for (const i of I) for (const a of A) for (const s of S) cases.push({ i, a, s, t: 'default', st: 'default' });
      if (REPRESENTATIVE.includes(ctx))
        for (const i of I)
          for (const a of A)
            for (const st of ['hover', 'pressed', 'focus', 'loading', 'disabled'])
              cases.push({ i, a, s: 'md', t: st === 'focus' ? 'default' : st, st });
      const out = {};
      const made = cases.map((k) => {
        const inst = set.children
          .find((c) => c.name === `Intent=${k.i}, Appearance=${k.a}, Size=${k.s}, State=${k.t}`)
          .createInstance();
        frame.appendChild(inst);
        // The browser measures loading with focus (a loading icon button stays focusable).
        inst.setProperties({ [FOCUS]: k.st === 'focus' || k.st === 'loading' });
        return [k, inst];
      });
      try {
        for (const [k, inst] of made) {
          const box = inst.findOne((n) => n.name === 'Container');
          const shown = inst.findOne((n) => n.name === (k.t === 'loading' ? 'Loading indicator' : 'Icon'));
          const vec = shown.findOne((n) => n.type === 'VECTOR' && (k.t === 'loading' ? n.name === 'Arc' : true));
          const ring = inst.findOne((n) => n.name === 'Focus ring');
          const target = inst.findOne((n) => n.name === 'Target');
          const [bx, by] = center(box),
            [ix, iy] = center(shown),
            [tx, ty] = center(target);
          out[`${ctx}|${k.i}|${k.a}|${k.s}|${k.st}`] = [
            await paint(vec, k.t === 'loading' ? 'strokes' : 'fills'),
            await paint(box, 'fills'),
            box.strokes.length ? `${await paint(box, 'strokes')}/${await res(box, 'strokeTopWeight')}` : '',
            await res(box, 'topLeftRadius'),
            r2(box.width),
            r2(box.height),
            r2(shown.width),
            r2(shown.height),
            r2(ix - bx),
            r2(iy - by),
            ring.visible ? `${await paint(ring, 'strokes')}/${await res(ring, 'strokeTopWeight')}/${-ring.x}` : '',
            `${r2(target.width)}/${r2(target.height)}/${r2(tx - bx)}/${r2(ty - by)}`
          ].join('|');
        }
      } finally {
        frame.remove();
      }
      const keys = Object.keys(out).sort();
      result[ctx] = { n: keys.length, hash: fnv(keys.map((k) => `${k}=${out[k]}`).join('\n')) };
      if (DETAIL.includes(ctx)) result[ctx].lines = out;
    }
return result;
