// Progress Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 contexts, instantiates the 12 determinate variants (Show value on) at the width of the code's
// review page in that density (368.66, 355.33, 328.66 px) and builds one line per case:
// "intent,size=track color,track height,track radius,indicator color,indicator width,track width,label color,label font
// size,value color,gap" (numbers rounded as in wave3-parity-report.mjs). Returns per context the FNV-1a hash of the
// sorted lines; `node authoring/adapters/figma/wave3-parity-report.mjs progress <result.json>` compares them with
// computed.json. Also returns the fraction of each Value step of the exposed Track.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:114');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('413:147');
const W = { compact: 368.65625, standard: 355.328125, comfortable: 328.65625 };
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
const P = (n) => Object.keys(set.componentPropertyDefinitions).find((k) => k.split('#')[0] === n);
const hashes = {};
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const f = figma.createAutoLayout('VERTICAL');
      f.name = '_parity';
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const L = [];
      for (const i of ['accent', 'success', 'warning', 'danger'])
        for (const s of ['sm', 'md', 'lg']) {
          const inst = set.children.find((c) => c.name === `Intent=${i}, Size=${s}`).createInstance();
          f.appendChild(inst);
          inst.setProperties({ [P('Show value')]: true });
          inst.resize(W[d], inst.height);
          const T = inst.findOne((n) => n.name === 'Track');
          const X = inst.findOne((n) => n.name === 'Indicator');
          const La = inst.findOne((n) => n.name === 'Label');
          const Va = inst.findOne((n) => n.name === 'Value');
          L.push(
            `${i},${s}=${[
              await paint(T),
              num(await res(T, 'height'), 2),
              num(await res(T, 'topLeftRadius'), 2),
              await paint(X),
              num(X.width, 1),
              num(T.width, 1),
              await paint(La),
              num(La.fontSize, 2),
              await paint(Va),
              num(await res(inst, 'itemSpacing'), 2)
            ].join(',')}`
          );
        }
      f.remove();
      L.sort();
      hashes[`${b}-${a}-${d}`] = fnv(L.join('\n'));
    }
const steps = [];
const v0 = set.children.find((c) => c.name === 'Intent=accent, Size=lg');
for (const val of ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']) {
  const inst = v0.createInstance();
  inst.resize(355.328125, inst.height);
  const T = inst.findOne((n) => n.name === 'Track');
  T.setProperties({ Value: val });
  const X = T.findOne((n) => n.name === 'Indicator');
  steps.push(`${val}:${X.visible ? Math.round((X.width / T.width) * 1000) / 10 : 0}/${X.height}`);
  inst.remove();
}
return { hashes, steps: steps.join(' ') };
