// Badge Figma parity measurement (use_figma body), 2026-10-19; iconToLabel added on 2026-10-20.
// In each of the 18 brand × appearance × density contexts, instantiates the 36 cases of
// reports/components/badge/svelte/computed.json (every intent, appearance and size, with the leading icon and the
// label of the code's review page) in a temporary frame with explicit Brand/Appearance/Density modes, and reads:
// exact fields  labelColor|surface|stroke/width|radius|padL|padR|fontSize|fontWeight|iconColor|iconSize|iconOffset|iconGap|
//               iconToLabel (from the icon box end to the label start)
// numeric fields  height, minWidth, width (compared with a tolerance by the report: text rendering).
// Returns per context { n, hash } (FNV-1a of the sorted "key=exact fields" lines) and num, the numeric fields
// "height,minWidth,width" in the order of ORDER (the set's variant order, returned once), plus the exact lines
// of the contexts listed in DETAIL. badge-parity-report.mjs builds the same strings from computed.json.
// IDs come from reports/components/badge/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const DETAIL = [];
const page = await figma.getNodeByIdAsync('220:2');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name.startsWith('_parity '))) n.remove();
const set = await figma.getNodeByIdAsync('220:293');
const PROPS = Object.keys(set.componentPropertyDefinitions);
const LABEL = PROPS.find((k) => k.startsWith('Label'));
const LEAD = PROPS.find((k) => k.startsWith('Show leading'));
const WORDS = {
  neutral: 'Draft',
  accent: 'New',
  info: 'In review',
  success: 'Paid',
  warning: 'Due soon',
  danger: 'Overdue'
};
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
const r3 = (x) => Math.round(x * 1000) / 1000;
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const result = {};
for (const brand of ['base', 'brick', 'orchid'])
  for (const ap of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${brand}-${ap}-${d}`;
      const frame = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx, itemSpacing: 8 });
      frame.x = -4000;
      frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), brand));
      frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
      frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const made = [];
      for (const v of set.children) {
        const [, i, a, s] = v.name.match(/Intent=(\w+), Appearance=(\w+), Size=(\w+)/);
        const inst = v.createInstance();
        frame.appendChild(inst);
        inst.setProperties({ [LABEL]: WORDS[i], [LEAD]: true });
        made.push([`${ctx}|${i}|${a}|${s}`, inst]);
      }
      const exact = {},
        num = [];
      try {
        for (const [k, inst] of made) {
          const t = inst.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
          const lead = inst.findOne((n) => n.name === 'Leading');
          const icon = inst.findOne((n) => n.name === 'Leading icon');
          const vec = icon.findOne((n) => n.type === 'VECTOR');
          const ix = icon.absoluteTransform[0][2] - inst.absoluteTransform[0][2];
          exact[k] = [
            await paint(t, 'fills'),
            await paint(inst, 'fills'),
            inst.strokes.length ? `${await paint(inst, 'strokes')}/${await res(inst, 'strokeTopWeight')}` : '',
            await res(inst, 'topLeftRadius'),
            await res(inst, 'paddingLeft'),
            await res(inst, 'paddingRight'),
            await res(t, 'fontSize'),
            await res(t, 'fontWeight'),
            await paint(vec, 'fills'),
            `${r3(icon.width)}x${r3(icon.height)}`,
            r3(ix),
            await res(lead, 'paddingRight'),
            r3(t.absoluteTransform[0][2] - icon.absoluteTransform[0][2] - icon.width)
          ].join('|');
          num.push([r3(inst.height), r3(await res(inst, 'minWidth')), r3(inst.width)].join(','));
        }
      } finally {
        frame.remove();
      }
      const keys = Object.keys(exact).sort();
      result[ctx] = { n: keys.length, hash: fnv(keys.map((k) => `${k}=${exact[k]}`).join('\n')), num };
      if (DETAIL.includes(ctx)) result[ctx].lines = exact;
    }
return { ORDER: set.children.map((v) => v.name.replace(/\w+=/g, '').replaceAll(', ', '|')), result };
