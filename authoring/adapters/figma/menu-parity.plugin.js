// Menu Figma parity measurement (use_figma body), 2026-11-03.
// computed.json records, in the four representative contexts, the items edit (highlighted: State=hover), share (default),
// archive (disabled) and delete (danger) of the review menu and its panel: lines "item=surface,label color,height,,"
// and "panel=surface,,,radius,padding", measured on the default Menu variant (Edit hover, Duplicate default, Archive
// disabled, Delete danger) and hashed for `wave3-parity-report.mjs menu`. Extra checks in the 18 contexts (bad lists
// failures): a plain item as tall as the code (21 px line + 2 × padding-block, at least size/control/sm), the offset
// and alignment of the six placements, the group heading aligned with the labels (Indent yes and no).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:121');
await figma.setCurrentPageAsync(page);
const menu = await figma.getNodeByIdAsync('437:795');
const item = await figma.getNodeByIdAsync('437:343');
const group = await figma.getNodeByIdAsync('437:401');
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
const REP = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const xs = all.find((v) => v.name === 'space/content/xs');
const hashes = {};
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
      const m = menu.defaultVariant.createInstance();
      f.appendChild(m);
      const panel = m.findChild((n) => n.name === 'Panel');
      const [edit, dup, arch, del] = panel
        .findOne((n) => n.type === 'SLOT')
        .children.filter((n) => n.name === 'MenuItem');
      const line = async (k, n) =>
        `${k}=${[await paint(n), await paint(n.findChild((x) => x.name === 'Label')), num(n.height, 1), '', ''].join(',')}`;
      const L = [
        await line('edit', edit),
        await line('share', dup),
        await line('archive', arch),
        await line('delete', del),
        `panel=${[await paint(panel), '', '', num(await res(panel, 'topLeftRadius'), 2), num(await res(panel, 'paddingTop'), 2)].join(',')}`
      ];
      L.sort();
      if (REP.includes(ctx)) hashes[ctx] = fnv(L.join('\n'));
      const plain = item.defaultVariant.createInstance();
      f.appendChild(plain);
      plain.setProperties({
        [Object.keys(plain.componentProperties).find((k) => k.startsWith('Show leading'))]: false
      });
      const want = Math.max(await res(plain, 'minHeight'), 21 + 2 * (await res(plain, 'paddingTop')));
      checks++;
      if (Math.abs(plain.height - want) > 0.01) bad.push(`${ctx} plain item ${plain.height} vs ${want}`);
      const off = xs.resolveForConsumer(f).value;
      for (const v of menu.children) {
        const i = v.createInstance();
        f.appendChild(i);
        // Show trigger is off by default (2026-11-04); the placement is measured against the trigger.
        i.setProperties({ [Object.keys(i.componentProperties).find((k) => k.startsWith('Show trigger#'))]: true });
        const o = i.findChild((n) => n.name === 'Panel');
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
        if (Math.abs(gap - off) > 0.01) bad.push(`${ctx} ${v.name} gap`);
        if (Math.abs(al) > 0.51) bad.push(`${ctx} ${v.name} align ${al}`);
      }
      for (const g of group.children) {
        const gi = g.createInstance();
        f.appendChild(gi);
        gi.resize(240, gi.height);
        const ht = gi.findOne((n) => n.name === 'Heading text');
        const lab = gi.findOne((n) => n.type === 'SLOT').children[0].findChild((n) => n.name === 'Label');
        checks++;
        if (Math.abs(bb(ht).x - bb(lab).x) > 0.51) bad.push(`${ctx} ${g.name} heading off the labels`);
      }
      f.remove();
    }
return { hashes, checks, bad };
