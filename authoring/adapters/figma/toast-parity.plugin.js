// Toast Figma parity measurement (use_figma body), 2026-11-03.
// computed.json records the danger toast (neutral appearance, with a description) in the four representative
// contexts: line "danger=surface,title color,edge hex/width;drop shadows,radius,padding,width,icon,description",
// hashed per context for `wave3-parity-report.mjs toast`. Extra checks in the 18 contexts (bad lists failures): intense
// surface, edge, title and description per intent; the action label and border and the dismiss glyph in the action
// family of the intent; the action of a neutral toast kept neutral; single layout centered, multi icon and dismiss on
// the title line.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:117');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('426:819');
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
const REP = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
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
      const want = (r) => hex(role(r).resolveForConsumer(f).value);
      if (REP.includes(ctx)) {
        const t = set.children
          .find((c) => c.name === 'Layout=multi, Appearance=neutral, Intent=danger')
          .createInstance();
        f.appendChild(t);
        const sh = t.effects
          .filter((e) => e.type === 'DROP_SHADOW')
          .map((e) => `${num(e.color.a, 3)} ${e.offset.x},${e.offset.y},${e.radius},${e.spread}`)
          .join(';');
        hashes[ctx] = fnv(
          `danger=${[
            await paint(t),
            await paint(t.findOne((n) => n.name === 'Title')),
            `${await paint(t, 'strokes')}/${await res(t, 'strokeTopWeight')};${sh}`,
            num(await res(t, 'topLeftRadius'), 2),
            num(await res(t, 'paddingTop'), 2),
            num(t.width, 1),
            await paint(t.findOne((n) => n.name === 'Icon').findOne((n) => n.type === 'VECTOR')),
            await paint(t.findOne((n) => n.name === 'Description'))
          ].join(',')}`
        );
      }
      for (const i of ['neutral', 'info', 'success', 'warning', 'danger'])
        for (const ly of ['single', 'multi']) {
          const t = set.children
            .find((c) => c.name === `Layout=${ly}, Appearance=intense, Intent=${i}`)
            .createInstance();
          f.appendChild(t);
          t.setProperties({ [P(t, 'Show action')]: true });
          const ti = t.findOne((n) => n.name === 'Title');
          const icon = t.findOne((n) => n.name === 'Icon');
          const dis = t.findOne((n) => n.name === 'Dismiss');
          const act = t.findOne((n) => n.name === 'Action');
          const pairs = [
            [await paint(t), want(`color/status/${i}/surface`), 'surface'],
            [await paint(t, 'strokes'), want(`color/status/${i}/border`), 'edge'],
            [await paint(ti), want(`color/status/${i}/content`), 'title'],
            [
              await paint(act.findOne((n) => n.type === 'TEXT')),
              want(`color/action/${i}/outline/default/content`),
              'action label'
            ],
            [
              await paint(
                act.findChild((n) => n.name === 'Container'),
                'strokes'
              ),
              want(`color/action/${i}/outline/default/border`),
              'action border'
            ],
            [
              await paint(dis.findOne((n) => n.type === 'VECTOR' && n.visible !== false)),
              want(`color/action/${i}/ghost/default/content`),
              'dismiss'
            ]
          ];
          if (ly === 'multi')
            pairs.push([
              await paint(t.findOne((n) => n.name === 'Description')),
              want(`color/status/${i}/content`),
              'description'
            ]);
          for (const [g, e, w] of pairs) {
            checks++;
            if (g !== e) bad.push(`${ctx} ${ly} ${i} ${w} ${g} vs ${e}`);
          }
          checks += 2;
          if (ly === 'single') {
            if ([icon, dis, act].some((n) => Math.abs(cy(n) - cy(t)) > 0.6))
              bad.push(`${ctx} single ${i} not centered`);
          } else if ([icon, dis].some((n) => Math.abs(cy(n) - cy(ti)) > 0.6))
            bad.push(`${ctx} multi ${i} off the title line`);
        }
      const n0 = set.children
        .find((c) => c.name === 'Layout=single, Appearance=neutral, Intent=success')
        .createInstance();
      f.appendChild(n0);
      n0.setProperties({ [P(n0, 'Show action')]: true });
      checks++;
      const gl = await paint(n0.findOne((n) => n.name === 'Action').findOne((n) => n.type === 'TEXT'));
      if (gl !== want('color/action/neutral/outline/default/content'))
        bad.push(`${ctx} neutral appearance action ${gl}`);
      f.remove();
    }
return { hashes, checks, bad };
