// Tooltip and Popover Figma parity measurement (use_figma body), 2026-11-03.
// computed.json records one tooltip and one popover in the four representative contexts: lines
// "default=surface,label color,radius,padding inline,padding block,font size,max width" (Tooltip) and
// "default=surface,text color,edge hex/width;drop shadows,radius,padding,max width,font size" (Popover), hashed per
// context for `wave3-parity-report.mjs tooltip|popover`. Extra checks in the 18 contexts (bad lists failures): for every
// placement of both sets, the gap between trigger and overlay equals space/content/xs and their start, center or end
// edges line up (±0.51 px).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:123');
await figma.setCurrentPageAsync(page);
const tip = await figma.getNodeByIdAsync('430:103');
const pop = await figma.getNodeByIdAsync('430:239');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const all = await figma.variables.getLocalVariablesAsync();
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const res = async (node, field) => {
  const b = node.boundVariables && node.boundVariables[field];
  const ref = Array.isArray(b) ? b[0] : b;
  return ref ? (await varOf(ref.id)).resolveForConsumer(node).value : null;
};
const hex = (c) =>
  [c.r, c.g, c.b, c.a === undefined ? 1 : c.a]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
const paint = async (node, kind = 'fills') => {
  const p = node[kind][0];
  const id = p && p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  return id ? hex((await varOf(id)).resolveForConsumer(node).value) : 'literal';
};
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const num = (v, d = 1) => String(Math.round(parseFloat(v) * 10 ** d) / 10 ** d);
const bb = (n) => n.absoluteBoundingBox;
const xs = all.find((v) => v.name === 'space/content/xs');
const REP = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const hashes = { tooltip: {}, popover: {} };
const bad = [];
let checks = 0;
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${b}-${a}-${d}`;
      const f = figma.createAutoLayout('VERTICAL');
      f.name = '_parity';
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      if (REP.includes(ctx)) {
        const t = tip.children.find((c) => c.name === 'Side=top, Align=center').createInstance();
        f.appendChild(t);
        const bu = t.findChild((n) => n.name === 'Tooltip');
        const lb = bu.findChild((n) => n.type === 'TEXT');
        hashes.tooltip[ctx] = fnv(
          `default=${[
            await paint(bu),
            await paint(lb),
            num(await res(bu, 'topLeftRadius'), 2),
            num(await res(bu, 'paddingLeft'), 2),
            num(await res(bu, 'paddingTop'), 2),
            num(lb.fontSize, 2),
            num(await res(bu, 'maxWidth'), 2)
          ].join(',')}`
        );
        const p = pop.children.find((c) => c.name === 'Side=bottom, Align=start').createInstance();
        f.appendChild(p);
        const pa = p.findChild((n) => n.name === 'Panel');
        const tx = pa.findOne((n) => n.type === 'TEXT' && n.name === 'Text');
        const sh = pa.effects
          .filter((e) => e.type === 'DROP_SHADOW')
          .map((e) => `${num(e.color.a, 3)} ${e.offset.x},${e.offset.y},${e.radius},${e.spread}`)
          .join(';');
        hashes.popover[ctx] = fnv(
          `default=${[
            await paint(pa),
            await paint(tx),
            `${await paint(pa, 'strokes')}/${await res(pa, 'strokeTopWeight')};${sh}`,
            num(await res(pa, 'topLeftRadius'), 2),
            num(await res(pa, 'paddingTop'), 2),
            num(await res(pa, 'maxWidth'), 2),
            num(tx.fontSize, 2)
          ].join(',')}`
        );
      }
      const off = xs.resolveForConsumer(f).value;
      for (const [set, ov] of [
        [tip, 'Tooltip'],
        [pop, 'Panel']
      ])
        for (const v of set.children) {
          const i = v.createInstance();
          f.appendChild(i);
          const o = i.findChild((n) => n.name === ov);
          const tr = i.findChild((n) => n.type === 'SLOT').children[0];
          const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
          const gap = q.Side === 'top' ? bb(tr).y - (bb(o).y + bb(o).height) : bb(o).y - (bb(tr).y + bb(tr).height);
          const al =
            q.Align === 'start'
              ? bb(o).x - bb(tr).x
              : q.Align === 'end'
                ? bb(o).x + bb(o).width - (bb(tr).x + bb(tr).width)
                : bb(o).x + bb(o).width / 2 - (bb(tr).x + bb(tr).width / 2);
          checks += 2;
          if (Math.abs(gap - off) > 0.01) bad.push(`${ctx} ${ov} ${v.name} gap ${gap} vs ${off}`);
          if (Math.abs(al) > 0.51) bad.push(`${ctx} ${ov} ${v.name} align ${al}`);
        }
      f.remove();
    }
return { hashes, checks, bad };
