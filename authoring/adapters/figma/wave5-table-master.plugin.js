// Wave 5 (use_figma bodies), 2026-11-17, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Table section of the Data page, rebuilt after the user review of the Figma parity (2026-11-17): the table size is a
// mode, not a variant of the cells. Part 1: adapter variables table/min-height and table/padding-block in the hidden
// Components collection (modes sm, md, lg; aliases of size/control/{size} and of the Figma-only Density variables
// table/padding-block/{size} = min(space/content/sm, (size/control/{size} − 21) / 2)), then Table/Cell (Align × Line ×
// Content: text, badge, avatar, link, actions), Table/Heading (Align) and Table/Footer cell (Align). Part 2:
// Table/Column (Align) and Table (Size; each variant sets the Components mode, which reaches the cells in its slot).
// ---- Part 1 ----
const page = await figma.getNodeByIdAsync('540:63');
await figma.setCurrentPageAsync(page);
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const dens = cols.find((c) => c.name === 'Foundations · Density');
const comp = cols.find((c) => c.name === 'Components');
const PB = {
  standard: { sm: 5.5, md: 8, lg: 8 },
  compact: { sm: 3.5, md: 4, lg: 4 },
  comfortable: { sm: 7.5, md: 11.5, lg: 12 }
};
const get = (name, col, type) =>
  vars.find((x) => x.name === name && x.variableCollectionId === col.id) ||
  figma.variables.createVariable(name, col, type);
for (const s of ['sm', 'md', 'lg']) {
  const v = get('table/padding-block/' + s, dens, 'FLOAT');
  v.scopes = ['GAP'];
  v.hiddenFromPublishing = true;
  v.description =
    'Figma only: min(space/content/sm, (size/control/' + s + ' − 21) / 2), the cell block padding of the code (Table).';
  for (const m of dens.modes) v.setValueForMode(m.modeId, PB[m.name][s]);
}
vars = await figma.variables.getLocalVariablesAsync();
const byName = (n) => vars.find((x) => x.name === n);
const minH = get('table/min-height', comp, 'FLOAT');
const padB = get('table/padding-block', comp, 'FLOAT');
minH.scopes = ['WIDTH_HEIGHT'];
padB.scopes = ['GAP'];
minH.description =
  'Table: minimum row height of the table size (size/control/{size}); the Table variant sets the mode.';
padB.description =
  'Table: cell block padding of the table size (table/padding-block/{size}); the Table variant sets the mode.';
for (const m of comp.modes) {
  minH.setValueForMode(m.modeId, { type: 'VARIABLE_ALIAS', id: byName('size/control/' + m.name).id });
  padB.setValueForMode(m.modeId, { type: 'VARIABLE_ALIAS', id: byName('table/padding-block/' + m.name).id });
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
  bind(c, ['minHeight'], 'table/min-height');
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
  'Table cell (data/table, child cell). Content: text (body/sm in color/content/primary, tabular figures in the code), badge (Badge sm), avatar (Avatar xs and a name), link (Link sm) or actions (an IconButton ghost sm opening a Menu); the Content slot takes any content. Align start, center or end (end for numbers). Height at least table/min-height and block padding table/padding-block, both from the table size (Components mode set by the Table); padding space/content/md inline. Line draws the row line (border/width/default, color/border/subtle) at the bottom: off for the last row.'
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
const comp = cols.find((c) => c.name === 'Components');
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
  (n) => n.name === 'Table/Column' || n.name === 'Table' || /^(Align|Size)=/.test(n.name)
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
  'Table column (data/table): a column header (Table/Heading), the cells of the column in the Cells slot (Table/Cell, one per row) and an optional footer cell, aligned by Align; sized by the table (Components mode). Resize the column to its content. Column line draws the vertical line of columnLines at the inline end (off for the last column).';
colSet.children.forEach((v, j) => {
  v.x = 24 + j * 184;
  v.y = 24;
});
colSet.resizeWithoutConstraints(24 + 3 * 184, 24 + 300);
colSet.fills = [];
colSet.x = 80;
colSet.y = Math.max(...section.children.filter((n) => n !== colSet).map((n) => n.y + n.height)) + 80;
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
const tables = [];
for (const s of ['md', 'sm', 'lg']) {
  const t = figma.createComponent();
  t.name = `Size=${s}`;
  section.appendChild(t);
  t.setExplicitVariableModeForCollection(comp, comp.modes.find((m) => m.name === s).modeId);
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
  tables.push(t);
}
const tSet = figma.combineAsVariants(tables, section);
tSet.name = 'Table';
for (const v of tSet.children) {
  v.primaryAxisSizingMode = 'AUTO';
  v.counterAxisSizingMode = 'AUTO';
}
const ts = Object.entries(tSet.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of tSet.children)
  v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: ts[0] };
for (const k of ts.slice(1)) if (tSet.componentPropertyDefinitions[k]) tSet.deleteComponentProperty(k);
tSet.editComponentProperty(ts[0], {
  name: 'Columns',
  description: 'Table/Column instances in column order; the table size reaches them through the Components mode.',
  preferredValues: [{ type: 'COMPONENT_SET', key: colSet.key }],
  slotSettings: { minChildren: 1 }
});
const pShow = tSet.addComponentProperty('Show caption', 'BOOLEAN', true);
const pCap = tSet.addComponentProperty('Caption', 'TEXT', 'Invoices');
for (const v of tSet.children)
  v.findChild((n) => n.name === 'Caption').componentPropertyReferences = { visible: pShow, characters: pCap };
tSet.description =
  'Table (data/table): a native data table in a frame of border/width/default in color/border/subtle with radius/container corners; caption above in heading/xs (Show caption off for hideCaption), space/content/sm above the frame. Columns slot: Table/Column instances (header band, cells, optional footer, optional column lines). Size sets the minimum row height (size/control/{size}) through the Components mode, so it applies to the columns placed in the slot; text stays body/sm and label/md. Inline scrolling, the sticky header, row headers and the focusable scroll area are behaviors of the code.';
tSet.children.forEach((v, j) => {
  v.x = 24;
  v.y = 24 + j * 360;
});
tSet.resizeWithoutConstraints(24 + Math.max(...tSet.children.map((v) => v.width)) + 24, 24 + 3 * 360);
tSet.fills = [];
tSet.x = colSet.x + colSet.width + 80;
tSet.y = colSet.y;
section.resizeWithoutConstraints(
  Math.max(...section.children.map((n) => n.x + n.width)) + 80,
  Math.max(...section.children.map((n) => n.y + n.height)) + 80
);
await tSet.screenshot({ scale: 1 });
return { column: colSet.id, table: tSet.id, key: tSet.key, h: tSet.children.map((v) => v.name + ':' + v.height) };
