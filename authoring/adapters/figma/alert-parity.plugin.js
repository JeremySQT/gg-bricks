// Alert Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 contexts, the five Title=yes variants with actions and dismiss shown: line
// "intent=surface,content,edge hex/width,radius,padding,icon gap,content font size,icon color,icon size,title font
// size,title weight", hashed per context for `wave3-parity-report.mjs alert`. Extra checks (bad lists failures): the
// accent solid surface and neutral outline label of the actions and the dismiss glyph resolve to the action family of
// the intent; the icon and the dismiss button are centered on the title line (±0.6 px).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:113');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('422:715');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const app = col('Appearance');
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const all = await figma.variables.getLocalVariablesAsync();
const role = (n) => all.find((v) => v.name === n && v.variableCollectionId === app.id);
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
const cy = (n) => n.absoluteTransform[1][2] + n.height / 2;
const P = (inst, name) => Object.keys(inst.componentProperties).find((k) => k.split('#')[0] === name);
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
      f.setExplicitVariableModeForCollection(app, mode(app, a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const L = [];
      for (const i of ['neutral', 'info', 'success', 'warning', 'danger']) {
        const inst = set.children.find((c) => c.name === `Intent=${i}, Title=yes`).createInstance();
        f.appendChild(inst);
        inst.setProperties({ [P(inst, 'Show actions')]: true, [P(inst, 'Dismissible')]: true });
        const icon = inst.findOne((n) => n.name === 'Icon');
        const glyph = icon.findOne((n) => n.type === 'VECTOR');
        const ti = inst.findOne((n) => n.name === 'Title');
        const co = inst.findOne((n) => n.name === 'Content');
        L.push(
          `${i}=${[
            await paint(inst),
            await paint(co),
            `${await paint(inst, 'strokes')}/${await res(inst, 'strokeTopWeight')}`,
            num(await res(inst, 'topLeftRadius'), 2),
            num(await res(inst, 'paddingTop'), 2),
            num(await res(inst, 'itemSpacing'), 2),
            num(co.fontSize, 2),
            await paint(glyph),
            num(icon.width, 2),
            num(ti.fontSize, 2),
            String(ti.fontWeight)
          ].join(',')}`
        );
        const items = inst.findAll((n) => n.type === 'INSTANCE' && n.name === 'Button');
        const want = (r) => hex(role(r).resolveForConsumer(f).value);
        const pairs = [
          [
            await paint(items[0].findChild((n) => n.name === 'Container')),
            want(`color/action/${i}/solid/default/surface`),
            'accent solid'
          ],
          [
            await paint(items[1].findOne((n) => n.type === 'TEXT')),
            want(`color/action/${i}/outline/default/content`),
            'neutral outline label'
          ],
          [
            await paint(
              inst.findOne((n) => n.name === 'Dismiss').findOne((n) => n.type === 'VECTOR' && n.visible !== false)
            ),
            want(`color/action/${i}/ghost/default/content`),
            'dismiss'
          ]
        ];
        for (const [got, exp, what] of pairs) {
          checks++;
          if (got !== exp) bad.push(`${ctx} ${i} ${what} ${got} vs ${exp}`);
        }
        const dis = inst.findOne((n) => n.name === 'Dismiss');
        checks += 2;
        if (Math.abs(cy(icon) - cy(ti)) > 0.6) bad.push(`${ctx} ${i} icon off the title line`);
        if (Math.abs(cy(dis) - cy(ti)) > 0.6) bad.push(`${ctx} ${i} dismiss off the title line`);
      }
      f.remove();
      L.sort();
      hashes[ctx] = fnv(L.join('\n'));
    }
return { hashes, checks, bad };
