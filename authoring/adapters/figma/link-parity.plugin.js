// Link Figma parity measurement (use_figma body), 2026-10-19.
// In each of the 18 brand × appearance × density contexts, instantiates the 13 cases of
// reports/components/link/svelte/computed.json in a temporary frame with explicit Brand/Appearance/Density modes:
// tone accent with the six destinations; tone inherit (page) in the info, success, warning, danger and inverse
// contexts (the instance's “Components · link context” mode stands for the parent text color); tone inherit (file)
// in the inverse context, as on the review page; tone accent (page) with focus. The text mode is body-md, the font of the review page.
// Fields: color|ctx|fontSize|fontWeight|lineHeight|decoLine|decoThickness|decoColor|metaDeco|metaColor|glyphW|glyphH|
// glyphColor|glyphOpacity|glyphGap|ring|radius. Returns per context { n, hash } (FNV-1a of the sorted "key=fields"
// lines) and the lines of the contexts listed in DETAIL; link-parity-report.mjs builds the same strings from
// computed.json. IDs come from reports/components/link/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const DETAIL = [];
const page = await figma.getNodeByIdAsync('225:2');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name.startsWith('_parity '))) n.remove();
const set = await figma.getNodeByIdAsync('225:276');
const FOCUS = Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith('Focus'));
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const ctxC = col('Components · link context');
const vars = await figma.variables.getLocalVariablesAsync();
const linkContext = vars.find((v) => v.name === 'link/context');
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
const variant = (tone, d) => set.children.find((c) => c.name === `Tone=${tone}, Destination=${d}, State=default`);
const result = {};
for (const brand of ['base', 'brick', 'orchid'])
  for (const ap of ['light', 'dark'])
    for (const den of ['compact', 'standard', 'comfortable']) {
      const ctx = `${brand}-${ap}-${den}`;
      const frame = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx, itemSpacing: 8 });
      frame.x = -4000;
      frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), brand));
      frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
      frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), den));
      const cases = [];
      for (const d of ['page', 'external', 'email', 'phone', 'file', 'print'])
        cases.push({ key: `accent|${d}|default`, tone: 'accent', d, context: 'primary' });
      for (const s of ['info', 'success', 'warning', 'danger', 'inverse'])
        cases.push({ key: `inherit|page|${s}`, tone: 'inherit', d: 'page', context: s });
      cases.push({ key: 'inherit|file|default', tone: 'inherit', d: 'file', context: 'inverse' });
      cases.push({ key: 'accent|page|focus', tone: 'accent', d: 'page', context: 'primary', focus: true });
      const out = {};
      try {
        for (const k of cases) {
          const inst = variant(k.tone, k.d).createInstance();
          frame.appendChild(inst);
          inst.setExplicitVariableModeForCollection(ctxC, mode(ctxC, k.context));
          inst.setProperties({ [FOCUS]: !!k.focus });
          const label = inst.findOne((n) => n.name === 'Label');
          const meta = inst.findOne((n) => n.name === 'Meta');
          const ind = inst.findOne((n) => n.name === 'Indicator');
          const icon = inst.findOne((n) => n.name === 'Indicator icon');
          const vec = icon && icon.findOne((n) => n.type === 'VECTOR');
          const ring = inst.findOne((n) => n.name === 'Focus ring');
          out[`${ctx}|${k.key}`] = [
            await paint(label, 'fills'),
            hex(linkContext.resolveForConsumer(inst).value),
            r3(await res(label, 'fontSize')),
            r3(await res(label, 'fontWeight')),
            r3(await res(label, 'lineHeight')),
            label.textDecoration.toLowerCase(),
            label.textDecorationThickness.value,
            label.textDecorationColor.value === 'AUTO' ? await paint(label, 'fills') : 'literal',
            meta ? meta.textDecoration.toLowerCase() : '',
            meta ? await paint(meta, 'fills') : '',
            icon ? r3(icon.width) : 0,
            icon ? r3(icon.height) : 0,
            vec ? await paint(vec, 'fills') : '',
            icon ? r3(icon.opacity) : '',
            ind ? await res(ind, 'paddingLeft') : '',
            ring.visible ? `${await paint(ring, 'strokes')}/${await res(ring, 'strokeTopWeight')}/${-ring.x}` : '',
            await res(inst, 'topLeftRadius')
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
