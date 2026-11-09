// Spinner Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 brand × appearance × density contexts, instantiates the four Spinner variants (408:15) in a
// temporary frame with explicit modes and returns per context one line per size:
// "size,width,height,track stroke hex,indicator stroke hex,track opacity variable,track layer opacity,track stroke
// width,indicator stroke width,indicator cap". spinner-parity-report.mjs <result.json> writes parity.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:116');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('408:15');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
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
const paint = async (node, kind) => {
  const p = node[kind][0];
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  return id ? hex((await varOf(id)).resolveForConsumer(node).value) : 'literal';
};
const out = {};
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const f = figma.createFrame();
      f.name = '_parity';
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const lines = [];
      for (const s of ['sm', 'md', 'lg', 'xl']) {
        const i = set.children.find((c) => c.name === 'Size=' + s).createInstance();
        f.appendChild(i);
        const T = i.findOne((n) => n.name === 'Track');
        const A = i.findOne((n) => n.name === 'Indicator');
        lines.push(
          [
            s,
            await res(i, 'width'),
            await res(i, 'height'),
            await paint(T, 'strokes'),
            await paint(A, 'strokes'),
            Math.round((await res(T, 'opacity')) * 1000) / 1000,
            Math.round(T.opacity * 1000) / 1000,
            +T.strokeWeight.toFixed(3),
            +A.strokeWeight.toFixed(3),
            A.strokeCap
          ].join(',')
        );
      }
      f.remove();
      out[`${b}-${a}-${d}`] = lines.join(';');
    }
return { out };
