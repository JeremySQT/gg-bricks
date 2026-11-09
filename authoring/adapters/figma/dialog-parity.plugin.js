// Dialog Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 contexts, a _Dialog/Backdrop and the three Scrolled=no sizes: line "size=surface,title color,width,
// padding,radius,backdrop color,title font size,description color", hashed (sorted) for the four contexts of
// computed.json (`wave3-parity-report.mjs dialog`). Extra checks in all contexts (bad lists failures): the close button
// on the title line, the last footer action at the end of the panel's content box, space/content/lg between header,
// body and footer.
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync('433:525');
const bd = await figma.getNodeByIdAsync('433:526');
const page = await figma.getNodeByIdAsync('407:120');
await figma.setCurrentPageAsync(page);
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
const cy = (n) => bb(n).y + bb(n).height / 2;
const REP = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const lg = all.find((v) => v.name === 'space/content/lg');
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
      const back = bd.createInstance();
      f.appendChild(back);
      const L = [];
      for (const s of ['sm', 'md', 'lg']) {
        const i = set.children.find((c) => c.name === `Size=${s}, Scrolled=no`).createInstance();
        f.appendChild(i);
        const ti = i.findOne((n) => n.name === 'Title');
        const de = i.findOne((n) => n.name === 'Description');
        L.push(
          `${s}=${[
            await paint(i),
            await paint(ti),
            num(i.width, 1),
            num(await res(i, 'paddingTop'), 2),
            num(await res(i, 'topLeftRadius'), 2),
            await paint(back),
            num(ti.fontSize, 2),
            await paint(de)
          ].join(',')}`
        );
        const close = i.findOne((n) => n.name === 'Close');
        const head = i.findOne((n) => n.name === 'Header');
        const body = i.findOne((n) => n.type === 'SLOT' && n.name === 'Body');
        const foot = i.findOne((n) => n.type === 'SLOT' && n.name === 'Footer');
        const items = foot.findOne((n) => n.type === 'SLOT').children;
        const last = items[items.length - 1];
        const gap = lg.resolveForConsumer(f).value;
        checks += 4;
        if (Math.abs(cy(close) - cy(ti)) > 0.6) bad.push(`${ctx} ${s} close off the title line`);
        if (Math.abs(bb(last).x + bb(last).width - (bb(i).x + bb(i).width - (await res(i, 'paddingRight')))) > 0.6)
          bad.push(`${ctx} ${s} footer not at the end`);
        if (Math.abs(bb(body).y - (bb(head).y + bb(head).height) - gap) > 0.01) bad.push(`${ctx} ${s} header-body gap`);
        if (Math.abs(bb(foot).y - (bb(body).y + bb(body).height) - gap) > 0.01) bad.push(`${ctx} ${s} body-footer gap`);
      }
      f.remove();
      L.sort();
      if (REP.includes(ctx)) hashes[ctx] = fnv(L.join('\n'));
    }
return { hashes, checks, bad };
