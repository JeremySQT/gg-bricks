// Counter Figma parity measurement (use_figma body), 2026-10-14.
// In every brand × appearance × density, instantiates the six Counter variants (Size sm, md, lg × Overflow false,
// true) in a temporary frame with explicit modes, resolves the bound variables with resolveForConsumer, reads the
// laid-out geometry, removes the frame and returns:
//   out["<context>|<size>|<state>"] = "textFill|borderStroke|borderOpacity (effective node opacity)|strokeWeight|radius|
//     paddingLeft|paddingTop|minWidth|height|width|fontSize|lineHeight|letterSpacing|fontStyle|characters|tnum|fills|
//     strokeAlign|borderRadius|borderSize|textHeight|borderOpacityVariable (percent)"
//   host["<context>|button-<intent>-<appearance>"] = "foreground|opacity|borderWidth" (adapter variable the Button binds
//     its slot content to, resolved in the four representative contexts with the default state mode; opacity from
//     opacity/muted in percent, divided by 100)
//   tabular: widths of 00, 11, 88 and 10 at md in base-light-standard (Inter's default figures in Figma).
// Save the returned object as reports/components/counter/figma/measurements.json (not committed) and run
// node authoring/adapters/figma/counter-parity-report.mjs <file>.
// IDs (page 149:1547, set 149:1568, property keys) come from reports/components/counter/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:1547');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'FRAME' && n.name.startsWith('_parity '))) n.remove();
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const set = await figma.getNodeByIdAsync('149:1568');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const vars = await figma.variables.getLocalVariablesAsync();
const VN = (name, colName) => vars.find((v) => v.name === name && v.variableCollectionId === col(colName).id);
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
const r3 = (x) => Math.round(x * 1000) / 1000;
const variant = (s, o) => set.children.find((c) => c.name === `Size=${s}, Overflow=${o}`);
const P = { value: 'Value#149:6', overflow: 'Overflow text#149:13' };
const ctxFrame = (name, b, a, d) => {
  const f = figma.createAutoLayout('HORIZONTAL', { name: '_parity ' + name, itemSpacing: 8 });
  f.x = -4000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  return f;
};
const out = {};
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${b}-${a}-${d}`;
      const frame = ctxFrame(ctx, b, a, d);
      try {
        for (const s of ['sm', 'md', 'lg'])
          for (const o of [false, true]) {
            const inst = variant(s, o).createInstance();
            frame.appendChild(inst);
            inst.setProperties({ [P.value]: '8', [P.overflow]: '99+' });
            const t = inst.findOne((n) => n.type === 'TEXT' && n.name === 'Value');
            const bd = inst.findOne((n) => n.name === 'Border');
            out[`${ctx}|${s}|${o ? 'overflow' : 'default'}`] = [
              await paint(t, 'fills'),
              await paint(bd, 'strokes'),
              r3(bd.opacity),
              await res(bd, 'strokeTopWeight'),
              await res(inst, 'topLeftRadius'),
              await res(inst, 'paddingLeft'),
              inst.paddingTop,
              r3(await res(inst, 'minWidth')),
              r3(inst.height),
              r3(inst.width),
              await res(t, 'fontSize'),
              r3(await res(t, 'lineHeight')),
              await res(t, 'letterSpacing'),
              t.fontName.style,
              t.characters,
              t.openTypeFeatures && t.openTypeFeatures.TNUM ? 'tnum' : 'default',
              inst.fills.length,
              bd.strokeAlign,
              await res(bd, 'topLeftRadius'),
              `${r3(bd.width)}x${r3(bd.height)}`,
              t.height,
              await res(bd, 'opacity')
            ].join('|');
          }
      } finally {
        frame.remove();
      }
    }
// Host proxies: the adapter variable the Button binds its slot content to, resolved per intent × appearance.
const host = {};
const style = col('Components · button style'),
  state = col('Components · button state');
for (const ctx of ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable']) {
  const [b, a, d] = ctx.split('-');
  for (const i of ['accent', 'neutral', 'danger'])
    for (const ap of ['solid', 'outline', 'ghost']) {
      const f = ctxFrame(`${ctx} ${i}-${ap}`, b, a, d);
      f.setExplicitVariableModeForCollection(style, mode(style, `${i}-${ap}`));
      f.setExplicitVariableModeForCollection(state, mode(state, 'default'));
      try {
        host[`${ctx}|button-${i}-${ap}`] = [
          hex(VN('button/foreground', 'Components · button style').resolveForConsumer(f).value),
          r3(VN('opacity/muted', 'Brand').resolveForConsumer(f).value / 100),
          VN('border/width/default', 'Brand').resolveForConsumer(f).value
        ].join('|');
      } finally {
        f.remove();
      }
    }
}
// Tabular figures: Inter's default digits in Figma, measured on the md variant.
const tabular = {};
const tf = ctxFrame('tabular', 'base', 'light', 'standard');
try {
  for (const v of ['00', '11', '88', '10', '1', '8']) {
    const inst = variant('md', false).createInstance();
    tf.appendChild(inst);
    inst.setProperties({ [P.value]: v });
    tabular[v] = r3(inst.findOne((n) => n.type === 'TEXT').width);
  }
} finally {
  tf.remove();
}
return { out, host, tabular, remaining: page.children.filter((n) => n.name.startsWith('_parity ')).length };
