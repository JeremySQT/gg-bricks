// Wave 5 (use_figma bodies), 2026-11-17, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Table section of the Data page. The table has no size (user, 2026-11-17): rows follow the Density mode only. Cells,
// headers and footer cells bind minHeight to size/control/md and their block padding to the Figma-only Density variable
// table/padding-block (hidden from publishing; min(space/content/sm, (size/control/md − 21) / 2) = 8, 4, 11.5 in
// standard, compact, comfortable: Figma has no min()). No Components collection mode is used (a mode of a hidden
// adapter collection on the Table was tried on 2026-11-17 and removed the same day at the user's request). Part 1:
// Table/Cell (Align × Content × Line: text, badge, avatar, link, actions), Table/Heading (Align), Table/Footer cell
// (Align). Part 2: Table/Column (Align) and Table, a single component (Caption, Frame, Columns slot).
// ---- Part 1 ----
const page = await figma.getNodeByIdAsync('540:63');
await figma.setCurrentPageAsync(page);
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const dens = cols.find((c) => c.name === 'Foundations · Density');
const get = (name, col, type) =>
  vars.find((x) => x.name === name && x.variableCollectionId === col.id) ||
  figma.variables.createVariable(name, col, type);
const pb = get('table/padding-block', dens, 'FLOAT');
pb.scopes = ['GAP'];
pb.hiddenFromPublishing = true;
const VAL = { standard: 8, compact: 4, comfortable: 11.5 };
for (const m of dens.modes) pb.setValueForMode(m.modeId, VAL[m.name]);
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
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const n of ['label/md', 'body/sm', 'heading/xs', 'indicator/sm', 'body/md'])
  await figma.loadFontAsync(style(n).fontName);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Table');
for (const n of [...section.children]) n.remove();
const BADGE = await figma.getNodeByIdAsync('220:293'),
  LINK = await figma.getNodeByIdAsync('232:659');
const IB = await figma.getNodeByIdAsync('211:1167'),
  AV = await figma.getNodeByIdAsync('543:605');
const DOTS = await figma.getNodeByIdAsync('200:4868');
const pick = (set, want) =>
  set.children.find((v) => Object.entries(want).every(([k, x]) => v.name.includes(`${k}=${x}`)));
const setP = (i, name, val) => {
  const k = Object.keys(i.componentProperties).find((x) => x.split('#')[0] === name);
  i.setProperties({ [k]: val });
};
const ALIGN = { start: 'MIN', center: 'CENTER', end: 'MAX' };
const cell = (name, a, kind) => {
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
  bind(c, ['minHeight'], 'size/control/md');
  bind(c, ['paddingTop', 'paddingBottom'], 'table/padding-block');
  bind(c, ['paddingLeft', 'paddingRight'], 'space/content/md');
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
const label = (c, st, chars, color, a, name = 'Text') => {
  const t = figma.createText();
  t.textStyleId = style(st).id;
  t.characters = chars;
  t.autoRename = false;
  t.name = name;
  c.appendChild(t);
  t.fills = [paint(color, t)];
  t.textAlignHorizontal = { start: 'LEFT', center: 'CENTER', end: 'RIGHT' }[a];
  t.layoutSizingHorizontal = 'FILL';
  t.textAutoResize = 'HEIGHT';
  return t;
};
const content = (sl, kind, a) => {
  if (kind === 'text')
    return label(sl, 'body/sm', a === 'end' ? '1,240.00' : 'Olivia Rhye', 'color/content/primary', a);
  if (kind === 'badge') {
    const b = pick(BADGE, { Intent: 'success', Appearance: 'subtle', Size: 'sm' }).createInstance();
    sl.appendChild(b);
    setP(b, 'Label', 'Paid');
    return b;
  }
  if (kind === 'link') {
    const l = pick(LINK, { Color: 'accent', Size: 'sm', State: 'default' }).createInstance();
    sl.appendChild(l);
    setP(l, 'Label', '#3066');
    return l;
  }
  if (kind === 'avatar') {
    sl.itemSpacing = 8;
    const av = pick(AV, { Size: 'xs', Shape: 'circle', Content: 'picture' }).createInstance();
    av.name = 'Avatar';
    sl.appendChild(av);
    const t = label(sl, 'body/sm', 'Olivia Rhye', 'color/content/primary', 'start', 'Name');
    t.layoutSizingHorizontal = 'HUG';
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
    return t;
  }
  const ib = pick(IB, { Intent: 'neutral', Appearance: 'ghost', Size: 'sm', State: 'default' }).createInstance();
  ib.name = 'Row actions';
  sl.appendChild(ib);
  setP(ib, 'Icon', DOTS.id);
  setP(ib, 'Label', 'More actions');
  return ib;
};
const cells = [],
  heads = [],
  foots = [];
for (const a of Object.keys(ALIGN)) {
  for (const kind of ['text', 'badge', 'avatar', 'link', 'actions'])
    for (const ln of ['true', 'false']) {
      const c = cell(`Align=${a}, Content=${kind}, Line=${ln}`, a, 'cell');
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
      content(sl, kind, a);
      cells.push(c);
    }
  const h = cell(`Align=${a}`, a, 'heading');
  line(h, 'bottom');
  label(h, 'label/md', a === 'end' ? 'Amount' : 'Customer', 'color/content/secondary', a);
  heads.push(h);
  const f = cell(`Align=${a}`, a, 'footer');
  line(f, 'top');
  label(f, 'label/md', a === 'end' ? '17,655.75' : a === 'start' ? 'Total' : '', 'color/content/primary', a);
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
  'Table cell (data/table, child cell). Content: text (body/sm in color/content/primary, tabular figures in the code), badge (Badge sm), avatar (Avatar xs and a name), link (Link sm) or actions (an IconButton ghost sm opening a Menu); the Content slot takes any content. Align start, center or end (end for numbers). Height at least size/control/md and block padding from the density mode (8, 4, 11.5 px in standard, compact, comfortable); padding space/content/md inline. Line draws the row line (border/width/default, color/border/subtle) at the bottom: off for the last row.'
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
lay(cellSet, 80, 80, 10);
lay(headSet, 80, cellSet.y + cellSet.height + 80, 3);
lay(footSet, headSet.x + headSet.width + 80, headSet.y, 3);
section.resizeWithoutConstraints(cellSet.x + cellSet.width + 80, headSet.y + headSet.height + 80);
return { cell: cellSet.id, heading: headSet.id, footer: footSet.id, n: cellSet.children.length };
// ---- Part 2 (CELL, HEAD, FOOT: the set IDs returned by part 1) ----
const page = await figma.getNodeByIdAsync('540:63');
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = false;
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
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
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const n of ['label/md', 'body/sm', 'heading/xs']) await figma.loadFontAsync(style(n).fontName);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Table');
// Set IDs of part 1 (run of 2026-11-17).
const CELL = await figma.getNodeByIdAsync('558:2604'),
  HEAD = await figma.getNodeByIdAsync('558:2605'),
  FOOT = await figma.getNodeByIdAsync('558:2606');
const pick = (set, name) => set.children.find((v) => v.name === name);
// A variant and a slot can share a name (Content): pick the property that is not a slot.
const setP = (i, name, val) => {
  const k = Object.keys(i.componentProperties).find(
    (x) => x.split('#')[0] === name && i.componentProperties[x].type !== 'SLOT'
  );
  i.setProperties({ [k]: val });
};
for (const n of section.children.filter(
  (n) => n.name === 'Table/Column' || n.name === 'Table' || /^Align=/.test(n.name)
))
  n.remove();
const colsList = [];
for (const a of ['start', 'center', 'end']) {
  const c = figma.createComponent();
  c.name = `Align=${a}`;
  section.appendChild(c);
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(160, 200);
  c.primaryAxisSizingMode = 'AUTO';
  c.fills = [];
  c.clipsContent = false;
  const h = pick(HEAD, `Align=${a}`).createInstance();
  h.name = 'Heading';
  c.appendChild(h);
  h.layoutSizingHorizontal = 'FILL';
  const sl = c.createSlot();
  sl.name = 'Cells';
  sl.fills = [];
  sl.clipsContent = false;
  sl.layoutMode = 'VERTICAL';
  sl.primaryAxisSizingMode = 'AUTO';
  sl.counterAxisSizingMode = 'AUTO';
  c.appendChild(sl);
  sl.layoutSizingHorizontal = 'FILL';
  for (let r = 0; r < 4; r++) {
    const i = pick(CELL, `Align=${a}, Content=text, Line=${r < 3}`).createInstance();
    sl.appendChild(i);
    i.layoutSizingHorizontal = 'FILL';
  }
  const f = pick(FOOT, `Align=${a}`).createInstance();
  f.name = 'Footer';
  c.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
  const ln = figma.createRectangle();
  ln.name = 'Column line';
  c.appendChild(ln);
  ln.layoutPositioning = 'ABSOLUTE';
  ln.resize(1, c.height);
  ln.x = c.width - 1;
  ln.y = 0;
  ln.constraints = { horizontal: 'MAX', vertical: 'STRETCH' };
  ln.fills = [paint('color/border/subtle', ln)];
  bind(ln, ['width'], 'border/width/default');
  colsList.push(c);
}
const colSet = figma.combineAsVariants(colsList, section);
colSet.name = 'Table/Column';
for (const v of colSet.children) {
  v.primaryAxisSizingMode = 'AUTO';
  v.counterAxisSizingMode = 'FIXED';
}
const slots = Object.entries(colSet.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of colSet.children)
  v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slots[0] };
for (const k of slots.slice(1)) if (colSet.componentPropertyDefinitions[k]) colSet.deleteComponentProperty(k);
colSet.editComponentProperty(slots[0], {
  name: 'Cells',
  description:
    'Table/Cell instances, one per row, the last one with Line off; pick their Content (text, badge, avatar, link, actions).',
  preferredValues: [{ type: 'COMPONENT_SET', key: CELL.key }],
  slotSettings: { minChildren: 0 }
});
const pFoot = colSet.addComponentProperty('Show footer', 'BOOLEAN', false);
const pLine = colSet.addComponentProperty('Column line', 'BOOLEAN', false);
for (const v of colSet.children) {
  v.findChild((n) => n.name === 'Footer').componentPropertyReferences = { visible: pFoot };
  v.findChild((n) => n.name === 'Column line').componentPropertyReferences = { visible: pLine };
}
colSet.description =
  'Table column (data/table): a column header (Table/Heading), the cells of the column in the Cells slot (Table/Cell, one per row) and an optional footer cell, aligned by Align; row heights follow the density mode. Resize the column to its content. Column line draws the vertical line of columnLines at the inline end (off for the last column).';
colSet.children.forEach((v, j) => {
  v.x = 24 + j * 184;
  v.y = 24;
});
colSet.resizeWithoutConstraints(24 + 3 * 184, 24 + 300);
colSet.fills = [];
colSet.x = 80;
colSet.y = Math.max(...section.children.filter((n) => n !== colSet).map((n) => n.y + n.height)) + 80;
let table;
const COLS = [
  ['Invoice', 'start', 110, 'link', ['#3066', '#3065', '#3064', '#3063']],
  ['Customer', 'start', 200, 'avatar', ['Olivia Rhye', 'Phoenix Baker', 'Lana Steiner', 'Demi Wilkinson']],
  [
    'Status',
    'start',
    130,
    'badge',
    [
      ['Paid', 'success'],
      ['Paid', 'success'],
      ['Refunded', 'neutral'],
      ['Pending', 'warning']
    ]
  ],
  ['Amount', 'end', 130, 'text', ['1,240.00', '89.50', '420.00', '12,500.00']]
];
{
  const t = figma.createComponent();
  t.name = 'Table';
  section.appendChild(t);
  t.layoutMode = 'VERTICAL';
  t.primaryAxisSizingMode = 'AUTO';
  t.counterAxisSizingMode = 'AUTO';
  bind(t, ['itemSpacing'], 'space/content/sm');
  t.fills = [];
  t.clipsContent = false;
  const cap = figma.createText();
  cap.textStyleId = style('heading/xs').id;
  cap.characters = 'Invoices';
  cap.autoRename = false;
  cap.name = 'Caption';
  t.appendChild(cap);
  cap.fills = [paint('color/content/primary', cap)];
  const fr = figma.createAutoLayout('HORIZONTAL', { name: 'Frame' });
  t.appendChild(fr);
  fr.clipsContent = true;
  fr.fills = [];
  fr.strokes = [paint('color/border/subtle', fr)];
  fr.strokeAlign = 'INSIDE';
  fr.strokesIncludedInLayout = false;
  bind(fr, ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'], 'border/width/default');
  bind(fr, ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'], 'radius/container');
  const sl = t.createSlot();
  sl.name = 'Columns';
  sl.fills = [];
  sl.clipsContent = false;
  sl.layoutMode = 'HORIZONTAL';
  sl.primaryAxisSizingMode = 'AUTO';
  sl.counterAxisSizingMode = 'AUTO';
  fr.appendChild(sl);
  for (const [lab, a, w, kind, data] of COLS) {
    const col = pick(colSet, `Align=${a}`).createInstance();
    sl.appendChild(col);
    col.resize(w, col.height);
    setP(
      col.findOne((n) => n.name === 'Heading'),
      'Label',
      lab
    );
    setP(
      col.findOne((n) => n.name === 'Footer'),
      'Text',
      lab === 'Invoice' ? 'Total' : lab === 'Amount' ? '14,249.50' : ''
    );
    col
      .findOne((n) => n.type === 'SLOT')
      .children.forEach((ce, r) => {
        if (kind !== 'text') setP(ce, 'Content', kind);
        const d = data[r];
        if (kind === 'text' || kind === 'avatar') {
          const tx = ce.findOne((n) => n.type === 'TEXT' && (n.name === 'Text' || n.name === 'Name'));
          tx.characters = d;
        }
        if (kind === 'link')
          setP(
            ce.findOne((n) => n.type === 'INSTANCE'),
            'Label',
            d
          );
        if (kind === 'badge') {
          const b = ce.findOne((n) => n.type === 'INSTANCE');
          setP(b, 'Label', d[0]);
          setP(b, 'Intent', d[1]);
        }
      });
  }
  const ts = Object.entries(t.componentPropertyDefinitions)
    .filter(([, d]) => d.type === 'SLOT')
    .map(([k]) => k);
  t.editComponentProperty(ts[0], {
    name: 'Columns',
    description: 'Table/Column instances in column order.',
    preferredValues: [{ type: 'COMPONENT_SET', key: colSet.key }],
    slotSettings: { minChildren: 1 }
  });
  const pShow = t.addComponentProperty('Show caption', 'BOOLEAN', true);
  const pCap = t.addComponentProperty('Caption', 'TEXT', 'Invoices');
  cap.componentPropertyReferences = { visible: pShow, characters: pCap };
  t.description =
    'Table (data/table): a native data table in a frame of border/width/default in color/border/subtle with radius/container corners; caption above in heading/xs (Show caption off for hideCaption), space/content/sm above the frame. Columns slot: Table/Column instances (header band, cells, optional footer, optional column lines). The table has no size: rows are at least size/control/md, which follows the density mode (32, 40, 44 px); text stays body/sm and label/md. An avatar or row actions make a row taller than size/control/md in some densities, as in the code: use them in every column of the row or not at all. Inline scrolling, the sticky header, row headers and the focusable scroll area are behaviors of the code.';
  t.x = colSet.x + colSet.width + 80;
  t.y = colSet.y;
  table = t;
}
section.resizeWithoutConstraints(
  Math.max(...section.children.map((n) => n.x + n.width)) + 80,
  Math.max(...section.children.map((n) => n.y + n.height)) + 80
);
await table.screenshot({ scale: 1 });
return { column: colSet.id, table: table.id, key: table.key, h: table.height };
// Built on 2026-11-17: Table 571:4860, Table/Column 561:2359, Table/Cell 558:2604, Table/Heading 558:2605, Table/Footer cell 558:2606.
