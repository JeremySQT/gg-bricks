// Wave 5 (use_figma bodies), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Table section of the Data page. Part 1: Figma-only Density variables table/padding-block/{size} (hidden from
// publishing; min(space/content/sm, (size/control/{size} − 21) / 2), the block padding of the code where one body/sm
// line fits minHeight: Figma has no min()), then Table/Cell (Size × Align × Line), Table/Heading (Size × Align) and
// Table/Footer cell (Size × Align). Part 2 (after the marker): Table/Column (Size × Align) and Table (Size).
const page = await figma.getNodeByIdAsync('540:63');
await figma.setCurrentPageAsync(page);
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const dens = cols.find((c) => c.name === 'Foundations · Density');
const PB = {
  standard: { sm: 5.5, md: 8, lg: 8 },
  compact: { sm: 3.5, md: 4, lg: 4 },
  comfortable: { sm: 7.5, md: 11.5, lg: 12 }
};
for (const s of ['sm', 'md', 'lg']) {
  const name = 'table/padding-block/' + s;
  let v = vars.find((x) => x.name === name);
  if (!v) v = figma.variables.createVariable(name, dens, 'FLOAT');
  v.scopes = ['GAP'];
  v.hiddenFromPublishing = true;
  v.description =
    'Figma only: min(space/content/sm, (size/control/' + s + ' − 21) / 2), the cell block padding of the code (Table).';
  for (const m of dens.modes) v.setValueForMode(m.modeId, PB[m.name][s]);
}
vars = await figma.variables.getLocalVariablesAsync();
const V = (n) => {
  const v = vars.find((x) => x.name === n);
  if (!v) throw new Error('missing ' + n);
  return v;
};
const paint = (n, node) => {
  const v = V(n);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, f, name) => {
  for (const x of f) n.setBoundVariable(x, V(name));
};
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const n of ['label/md', 'body/sm', 'heading/xs']) await figma.loadFontAsync(style(n).fontName);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Table');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Table';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const SIZES = ['md', 'sm', 'lg'];
const ALIGN = { start: 'MIN', center: 'CENTER', end: 'MAX' };
const cell = (name, s, a, kind) => {
  const c = figma.createComponent();
  c.name = name;
  section.appendChild(c);
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'AUTO';
  c.resize(160, 40);
  c.counterAxisSizingMode = 'AUTO';
  c.primaryAxisAlignItems = ALIGN[a];
  c.counterAxisAlignItems = 'CENTER';
  bind(c, ['minHeight'], 'size/control/' + s);
  bind(c, ['paddingLeft', 'paddingRight'], 'space/content/md');
  bind(c, ['paddingTop', 'paddingBottom'], 'table/padding-block/' + s);
  c.fills = kind === 'heading' ? [paint('color/surface/subtle', c)] : [];
  c.clipsContent = false;
  return c;
};
const line = (c, side) => {
  c.strokes = [paint('color/border/subtle', c)];
  c.strokeAlign = 'INSIDE';
  c.strokesIncludedInLayout = false;
  for (const w of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) c[w] = 0;
  bind(c, [side === 'bottom' ? 'strokeBottomWeight' : 'strokeTopWeight'], 'border/width/default');
};
const label = (c, st, chars, color, a) => {
  const t = figma.createText();
  t.textStyleId = style(st).id;
  t.characters = chars;
  t.autoRename = false;
  t.name = 'Text';
  c.appendChild(t);
  t.fills = [paint(color, t)];
  t.textAlignHorizontal = { start: 'LEFT', center: 'CENTER', end: 'RIGHT' }[a];
  t.layoutSizingHorizontal = 'FILL';
  t.textAutoResize = 'HEIGHT';
  return t;
};
const cells = [],
  heads = [],
  foots = [];
for (const s of SIZES)
  for (const a of Object.keys(ALIGN)) {
    for (const ln of ['true', 'false']) {
      const c = cell(`Size=${s}, Align=${a}, Line=${ln}`, s, a, 'cell');
      if (ln === 'true') line(c, 'bottom');
      const sl = c.createSlot();
      sl.name = 'Content';
      sl.fills = [];
      sl.clipsContent = false;
      sl.layoutMode = 'HORIZONTAL';
      sl.primaryAxisSizingMode = 'AUTO';
      sl.counterAxisSizingMode = 'AUTO';
      sl.counterAxisAlignItems = 'CENTER';
      sl.primaryAxisAlignItems = ALIGN[a];
      c.appendChild(sl);
      sl.layoutSizingHorizontal = 'FILL';
      const t = label(sl, 'body/sm', a === 'end' ? '1,240.00' : 'Olivia Rhye', 'color/content/primary', a);
      cells.push(c);
    }
    const h = cell(`Size=${s}, Align=${a}`, s, a, 'heading');
    line(h, 'bottom');
    label(h, 'label/md', a === 'end' ? 'Amount' : 'Customer', 'color/content/secondary', a);
    heads.push(h);
    const f = cell(`Size=${s}, Align=${a}`, s, a, 'footer');
    line(f, 'top');
    label(f, 'label/md', a === 'end' ? '17,655.75' : 'Total', 'color/content/primary', a);
    foots.push(f);
  }
const finish = (list, name, desc, prop) => {
  const set = figma.combineAsVariants(list, section);
  set.name = name;
  for (const v of set.children) {
    v.primaryAxisSizingMode = 'FIXED';
    v.counterAxisSizingMode = 'AUTO';
  }
  if (prop) {
    const p = set.addComponentProperty(prop, 'TEXT', set.children[0].findOne((n) => n.name === 'Text').characters);
    for (const v of set.children) v.findOne((n) => n.name === 'Text').componentPropertyReferences = { characters: p };
  }
  const slots = Object.entries(set.componentPropertyDefinitions)
    .filter(([, d]) => d.type === 'SLOT')
    .map(([k]) => k);
  if (slots.length) {
    for (const v of set.children)
      v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slots[0] };
    for (const k of slots.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
    set.editComponentProperty(slots[0], {
      name: 'Content',
      description:
        'Plain text in body/sm (tabular figures in the code) or free content: Badge, Link, Avatar with a name, row actions.',
      slotSettings: { minChildren: 0 }
    });
  }
  set.description = desc;
  set.fills = [];
  return set;
};
const cellSet = finish(
  cells,
  'Table/Cell',
  'Table cell (data/table, child cell): body/sm in color/content/primary, aligned by Align (end for numbers). Height at least size/control/{size} of the table size, padding space/content/md inline and table/padding-block/{size} (the code: space/content/sm, reduced so that one line fits); taller content grows the row. Line draws the row line (border/width/default, color/border/subtle) at the bottom: off for the last row. Row header is a behavior of the code.'
);
const headSet = finish(
  heads,
  'Table/Heading',
  'Column header (data/table, child heading): label/md in color/content/secondary on the header band color/surface/subtle, with the header line (border/width/default, color/border/subtle) at the bottom; geometry of the cells.',
  'Label'
);
const footSet = finish(
  foots,
  'Table/Footer cell',
  'Footer cell (data/table, child footer): a summary (Total) in label/md and color/content/primary, with a line (border/width/default, color/border/subtle) at the top; geometry of the cells.',
  'Text'
);
const lay = (set, x0, y0, perRow) => {
  set.children.forEach((v, j) => {
    v.x = 24 + (j % perRow) * 184;
    v.y = 24 + Math.floor(j / perRow) * 72;
  });
  set.resizeWithoutConstraints(24 + perRow * 184, 24 + Math.ceil(set.children.length / perRow) * 72);
  set.x = x0;
  set.y = y0;
};
lay(cellSet, 80, 80, 6);
lay(headSet, 80, cellSet.y + cellSet.height + 80, 3);
lay(footSet, headSet.x + headSet.width + 80, headSet.y, 3);
section.resizeWithoutConstraints(cellSet.x + cellSet.width + 80, headSet.y + headSet.height + 80);
await section.screenshot({ scale: 1 });
return {
  section: section.id,
  cell: cellSet.id,
  heading: headSet.id,
  footer: footSet.id,
  h: cellSet.children.map((v) => v.name + ':' + v.height).slice(0, 4)
};
// ---- Part 2: Table/Column (Size × Align) and Table (Size), run after part 1 (set IDs from its result) ----
// const page = 540:63; same helpers as part 1 (V, paint, bind, style, ALIGN) — see the run of 2026-11-14.
