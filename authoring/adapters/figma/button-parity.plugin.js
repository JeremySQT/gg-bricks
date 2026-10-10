// Button Figma parity measurement (use_figma body), 2026-10-07.
// Instantiates the default matrix and, in representative contexts, the md states in a temporary
// frame with explicit Brand/Appearance/Density modes, reads resolved bound values and geometry,
// removes the frame and returns { "<context>|<intent>|<appearance>|<size>|<state>": "<fields>" }.
// Fields: content|surface|border|borderWidth|radius|edgeInline|paddingBlock|gap|labelInline|
// fontSize|fontStyle|letterSpacing|containerHeight|containerWidth|rootHeight|ring(color/width/offset).
// IDs (page 8:4, set 48:1586, property keys) come from reports/components/button/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
// Parameters: one brand and its appearances per run (the MCP output limit is about 20 kB).
const BRAND = 'base',
  APS = ['light'];
const REPRESENTATIVE = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'FRAME' && n.name.startsWith('_parity '))) n.remove();
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const set = await figma.getNodeByIdAsync('48:1586');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const P = { label: 'Label#48:360', lead: 'Show leading#48:361', focus: 'Focus#48:367' };
const variant = (i, a, s, t) =>
  set.children.find((c) => c.name === `Intent=${i}, Appearance=${a}, Size=${s}, State=${t}`);
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const res = async (node, field) => {
  const b = node.boundVariables && node.boundVariables[field];
  const ref = Array.isArray(b) ? b[0] : b;
  if (!ref) return '';
  return (await varOf(ref.id)).resolveForConsumer(node).value;
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
  if (!id) return 'literal';
  return hex((await varOf(id)).resolveForConsumer(node).value);
};
const out = {};
const I = ['accent', 'neutral', 'danger'],
  A = ['solid', 'outline', 'ghost'],
  S = ['sm', 'md', 'lg'];
for (const ap of APS)
  for (const d of ['compact', 'standard', 'comfortable']) {
    const ctx = `${BRAND}-${ap}-${d}`;
    const frame = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx, itemSpacing: 8 });
    frame.x = -4000;
    frame.y = 0;
    frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), BRAND));
    frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
    frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
    const cases = [];
    for (const i of I)
      for (const a of A)
        for (const s of S)
          cases.push({
            i,
            a,
            s,
            t: 'default',
            st: 'default',
            label: i === 'danger' ? 'Delete' : 'Continue',
            lead: s === 'md',
            focus: false
          });
    if (REPRESENTATIVE.includes(ctx))
      for (const i of I)
        for (const a of A)
          for (const t of ['hover', 'pressed', 'focus', 'loading', 'disabled'])
            cases.push({
              i,
              a,
              s: 'md',
              t: t === 'focus' ? 'default' : t,
              st: t,
              label: 'Save changes',
              lead: false,
              focus: t === 'focus'
            });
    const made = cases.map((k) => {
      const inst = variant(k.i, k.a, k.s, k.t).createInstance();
      frame.appendChild(inst);
      inst.setProperties({ [P.label]: k.label, [P.lead]: k.lead, [P.focus]: k.focus });
      return [k, inst];
    });
    try {
      for (const [k, inst] of made) {
        const c = inst.findOne((n) => n.name === 'Container');
        const lw = inst.findOne((n) => n.name === 'Label');
        const t = lw.findOne((n) => n.type === 'TEXT' && n.name === 'Text');
        const ring = inst.findOne((n) => n.name === 'Focus ring');
        const rw = await res(ring, 'strokeTopWeight');
        out[`${ctx}|${k.i}|${k.a}|${k.s}|${k.st}`] = [
          await paint(t, 'fills'),
          await paint(c, 'fills'),
          c.strokes.length ? await paint(c, 'strokes') : '',
          c.strokes.length ? await res(c, 'strokeTopWeight') : '',
          await res(c, 'topLeftRadius'),
          await res(c, 'paddingLeft'),
          await res(c, 'paddingTop'),
          c.itemSpacing,
          await res(lw, 'paddingLeft'),
          await res(t, 'fontSize'),
          t.fontName.style,
          await res(t, 'letterSpacing'),
          Math.round(c.height * 100) / 100,
          Math.round(c.width * 100) / 100,
          inst.height,
          ring.visible ? `${await paint(ring, 'strokes')}/${rw}/${-ring.x}` : ''
        ].join('|');
      }
    } finally {
      frame.remove();
    }
  }
return out;
