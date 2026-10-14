// Icon Figma parity measurement (use_figma body), 2026-10-14.
// In each of the 18 brand × appearance × density contexts, instantiates the five Size variants of the Icon set
// (149:20) in a temporary frame with explicit modes, reads the box width and height, the variables they are
// bound to (resolved with resolveForConsumer), the glyph's resolved fill and the drawing's box, then removes the
// frame. Returns { fields, bindings, out: { "<context>|<size>": "width|height|fill|widthVar|heightVar|vecW|vecH|vecX|vecY" } }.
// Save the result as JSON and run `node authoring/adapters/figma/icon-parity-report.mjs <file>`.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:4');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'FRAME' && n.name.startsWith('_parity '))) n.remove();
const set = await figma.getNodeByIdAsync('149:20');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const hex = (c) =>
  [c.r, c.g, c.b, c.a === undefined ? 1 : c.a]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
const out = {};
let bindings = null;
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${b}-${a}-${d}`;
      const frame = figma.createAutoLayout('HORIZONTAL', { name: '_parity ' + ctx, itemSpacing: 8 });
      frame.x = -2000;
      frame.y = 0;
      frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      for (const s of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const inst = set.children.find((c) => c.name === 'Size=' + s).createInstance();
        frame.appendChild(inst);
        const vec = inst.findOne((n) => n.type === 'VECTOR');
        const fillId =
          vec.fills[0].boundVariables && vec.fills[0].boundVariables.color && vec.fills[0].boundVariables.color.id;
        const fill = fillId ? hex((await varOf(fillId)).resolveForConsumer(vec).value) : 'literal';
        const wId = inst.boundVariables.width && inst.boundVariables.width.id;
        const hId = inst.boundVariables.height && inst.boundVariables.height.id;
        const wv = wId ? (await varOf(wId)).resolveForConsumer(inst).value : null;
        const hv = hId ? (await varOf(hId)).resolveForConsumer(inst).value : null;
        out[`${ctx}|${s}`] =
          `${inst.width}|${inst.height}|${fill}|${wv}|${hv}|${vec.width}|${vec.height}|${vec.x}|${vec.y}`;
        if (!bindings)
          bindings = {
            width: wId,
            height: hId,
            fill: fillId,
            widthName: (await varOf(wId)).name,
            fillName: (await varOf(fillId)).name
          };
      }
      frame.remove();
    }
return { fields: 'width|height|fill|widthVar|heightVar|vecW|vecH|vecX|vecY', bindings, out };
