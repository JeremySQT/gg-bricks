// Skeleton Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 contexts: the three text sizes with 3 lines at the width of the code's review page, and a block of
// 160 px; lines "shape,size=line heights,bar height,bar color,bar radius,last width,line width,radius,color,height,parent"
// hashed per context (wave3-parity-report.mjs skeleton). Also checks the centering of the bars, the full-line widths and
// the circle radius (extra).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:115');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('417:74');
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
const paint = async (node) => {
  const p = node.fills[0];
  const id = p && p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  return id ? hex((await varOf(id)).resolveForConsumer(node).value) : 'literal';
};
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const num = (v, d = 1) => String(Math.round(parseFloat(v) * 10 ** d) / 10 ** d);
const hashes = {};
const extra = new Set();
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const f = figma.createAutoLayout('VERTICAL');
      f.name = '_parity';
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const L = [];
      for (const s of ['sm', 'md', 'lg']) {
        const i = set.children.find((c) => c.name === `Shape=text, Size=${s}, Lines=3`).createInstance();
        f.appendChild(i);
        i.resize(W[d], i.height);
        const lines = i.children;
        const bars = lines.map((l) => l.children[0]);
        L.push(
          `text,${s}=${[
            lines.map((l) => num(l.height, 1)).join('/'),
            num(bars[0].height, 2),
            await paint(bars[0]),
            num(await res(bars[0], 'topLeftRadius'), 2),
            num(bars[2].width, 1),
            num(lines[0].width, 1),
            '',
            '',
            '',
            ''
          ].join(',')}`
        );
        extra.add(
          `${s}:${num(bars[0].y, 2)}=${num((lines[0].height - bars[0].height) / 2, 2)},${num(bars[1].width, 1)}=${num(lines[1].width, 1)}`
        );
      }
      const bl = set.children.find((c) => c.name === 'Shape=block, Size=md, Lines=1').createInstance();
      f.appendChild(bl);
      bl.resize(W[d], 160);
      L.push(
        `block,=${['', '', '', '', '', '', num(await res(bl, 'topLeftRadius'), 2), await paint(bl), num(bl.height, 1), num(bl.height, 1)].join(',')}`
      );
      const ci = set.children.find((c) => c.name === 'Shape=circle, Size=md, Lines=1').createInstance();
      f.appendChild(ci);
      ci.resize(64, 64);
      extra.add(`circle:${await res(ci, 'topLeftRadius')}/${(await paint(ci)) === (await paint(bl))}`);
      f.remove();
      L.sort();
      hashes[`${b}-${a}-${d}`] = fnv(L.join('\n'));
    }
return { hashes, extra: [...extra] };
