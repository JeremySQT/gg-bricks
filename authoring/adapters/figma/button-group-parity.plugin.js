// ButtonGroup Figma parity measurement (use_figma body), 2026-11-03.
// In each of the 18 contexts, the Align=start variants of both orientations and the three sizes: line
// "size,orientation=gap,item surface height" (the item's Container), hashed per context for
// `wave3-parity-report.mjs button-group`; also checks that the visible distance between consecutive item surfaces
// equals the gap (bad lists any difference), and that an IconButton dropped into a horizontal group is centered on the
// cross axis with the buttons (checks, 2026-11-04).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:110');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('419:2913');
const IB = await figma.getNodeByIdAsync('211:1167');
let checks = 0;
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
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const num = (v, d = 1) => String(Math.round(parseFloat(v) * 10 ** d) / 10 ** d);
const ay = (n) => n.absoluteTransform[1][2];
const ax = (n) => n.absoluteTransform[0][2];
const hashes = {};
const bad = [];
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${b}-${a}-${d}`;
      const f = figma.createAutoLayout('VERTICAL');
      f.name = '_parity';
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const L = [];
      for (const s of ['sm', 'md', 'lg'])
        for (const o of ['horizontal', 'vertical']) {
          const i = set.children.find((c) => c.name === `Orientation=${o}, Align=start, Size=${s}`).createInstance();
          f.appendChild(i);
          const slot = i.findChild((n) => n.type === 'SLOT');
          const items = slot.children;
          const box = (it) => it.findChild((n) => n.name === 'Container') || it;
          const g = await res(slot, 'itemSpacing');
          L.push(`${s},${o}=${num(g, 2)},${num(box(items[0]).height, 2)}`);
          for (let k = 1; k < items.length; k++) {
            const p = box(items[k - 1]);
            const q = box(items[k]);
            const vis = o === 'horizontal' ? ax(q) - (ax(p) + p.width) : ay(q) - (ay(p) + p.height);
            if (num(vis, 2) !== num(g, 2)) bad.push(`${ctx} ${s} ${o} ${k}: ${num(vis, 2)} vs ${g}`);
          }
          // Items of a horizontal group are centered on the cross axis (user review, 2026-11-04): an IconButton
          // dropped from the library, with its own target height, lines up with the buttons.
          if (o === 'horizontal') {
            const ib = IB.children
              .find(
                (c) =>
                  /Intent=neutral/.test(c.name) &&
                  /Appearance=outline/.test(c.name) &&
                  new RegExp(`Size=${s}(,|$)`).test(c.name) &&
                  /State=default/.test(c.name)
              )
              .createInstance();
            slot.appendChild(ib);
            checks++;
            const cy = (n) => ay(n) + n.height / 2;
            const off = cy(box(ib)) - cy(box(items[0]));
            if (Math.abs(off) > 0.51) bad.push(`${ctx} ${s} icon button off center ${num(off, 2)}`);
          }
        }
      f.remove();
      L.sort();
      hashes[ctx] = fnv(L.join('\n'));
    }
return { hashes, checks, bad };
