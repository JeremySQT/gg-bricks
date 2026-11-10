// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Pagination section of the Navigation page: Pagination/Item, Pagination/Ellipsis and Pagination (Size) with the
// IconButton controls (First and Last behind Show edges).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const paint = (name, node) => {
  const v = V(name);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, fields, name) => {
  for (const f of fields) n.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['label/sm', 'label/md', 'label/lg']) await figma.loadFontAsync(style(s).fontName);
const IB = await figma.getNodeByIdAsync('211:1167');
const G = { first: '200:4643', previous: '200:4622', next: '200:4707', last: '200:4660' };
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Pagination');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Pagination';
  page.appendChild(section);
  section.x = 0;
  section.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const S = ['md', 'sm', 'lg'];
const ST = ['default', 'hover', 'selected', 'selected-hover'];
const items = [];
for (const s of S)
  for (const st of ST) {
    const c = figma.createComponent();
    c.name = `Size=${s}, State=${st}`;
    c.layoutMode = 'HORIZONTAL';
    c.primaryAxisAlignItems = 'CENTER';
    c.counterAxisAlignItems = 'CENTER';
    c.clipsContent = false;
    c.resize(40, 40);
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'FIXED';
    bind(c, ['minWidth', 'height'], `size/control/${s}`);
    bind(c, ['paddingLeft', 'paddingRight'], `space/control/label-inline/${s}`);
    bind(c, RADII, 'radius/control');
    c.fills = [paint(`color/item/${st}/surface`, c)];
    if (st.startsWith('selected')) {
      c.strokes = [paint('color/item/indicator', c)];
      c.strokeAlign = 'INSIDE';
      c.strokesIncludedInLayout = false;
      bind(c, STROKES, 'border/width/default');
    }
    const t = figma.createText();
    t.textStyleId = style(`label/${s}`).id;
    t.characters = '1';
    t.autoRename = false;
    t.name = 'Number';
    c.appendChild(t);
    t.fills = [paint(`color/item/${st}/content`, t)];
    t.textAlignHorizontal = 'CENTER';
    const r = figma.createFrame();
    r.name = 'Focus ring';
    r.fills = [];
    c.appendChild(r);
    r.layoutPositioning = 'ABSOLUTE';
    r.x = -2;
    r.y = -2;
    r.resize(c.width + 4, c.height + 4);
    r.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    r.strokes = [paint('color/focus/ring', r)];
    r.strokeAlign = 'OUTSIDE';
    bind(r, STROKES, 'focus/width');
    bind(r, RADII, 'radius/focus');
    r.visible = false;
    items.push(c);
  }
const itemSet = figma.combineAsVariants(items, section);
itemSet.name = 'Pagination/Item';
for (const v of itemSet.children) {
  v.primaryAxisSizingMode = 'AUTO';
  v.counterAxisSizingMode = 'FIXED';
}
const pNum = itemSet.addComponentProperty('Number', 'TEXT', '1');
const pFocus = itemSet.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of itemSet.children) {
  v.findChild((n) => n.name === 'Number').componentPropertyReferences = { characters: pNum };
  v.findChild((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: pFocus };
}
itemSet.description =
  'Page of a Pagination (navigation/pagination, child item): its number in label/{size} (the code sets tabular figures, so numbers keep their width; Figma cannot set them through its API: switch Tabular figures on the text if needed), centered in a box at least size/control/{size} wide and exactly as tall, growing with space/control/label-inline/{size} for long numbers, radius/control. State default and hover (pointer) for other pages; selected is the current page (color/item/selected/* and an inner edge of border/width/default in color/item/indicator, so that it is not conveyed by the tint alone), selected-hover under the pointer. Focus shows the keyboard ring (focus/width, color/focus/ring, radius/focus).';
itemSet.children.forEach((v, j) => {
  v.x = 24 + (j % 4) * 80;
  v.y = 24 + Math.floor(j / 4) * 80;
});
itemSet.resizeWithoutConstraints(24 * 2 + 4 * 80 - 24, 24 * 2 + 3 * 80 - 24);
itemSet.fills = [];
itemSet.x = 80;
itemSet.y = 80;
const ells = [];
for (const s of S) {
  const c = figma.createComponent();
  c.name = `Size=${s}`;
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.clipsContent = false;
  c.fills = [];
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  bind(c, ['width', 'height'], `size/control/${s}`);
  const t = figma.createText();
  t.textStyleId = style(`label/${s}`).id;
  t.characters = '…';
  t.autoRename = false;
  t.name = 'Ellipsis';
  c.appendChild(t);
  t.fills = [paint('color/content/secondary', t)];
  ells.push(c);
}
const ellSet = figma.combineAsVariants(ells, section);
ellSet.name = 'Pagination/Ellipsis';
ellSet.description =
  'Ellipsis of a Pagination (child ellipsis): a run of hidden pages, a horizontal ellipsis in label/{size} and color/content/secondary centered in a box of size/control/{size}. Not interactive, never focused, hidden from assistive technology.';
ellSet.children.forEach((v, j) => {
  v.x = 24 + j * 80;
  v.y = 24;
});
ellSet.resizeWithoutConstraints(24 * 2 + 3 * 80 - 24, 24 * 2 + 48);
ellSet.fills = [];
ellSet.x = itemSet.x + itemSet.width + 80;
ellSet.y = 80;
const ib = (s, state, glyph, label) => {
  const v = IB.children.find((x) => x.name === `Intent=neutral, Appearance=ghost, Size=${s}, State=${state}`);
  const i = v.createInstance();
  setP(i, 'Icon', glyph);
  setP(i, 'Label', label);
  return i;
};
const comps = [];
for (const s of S) {
  const c = figma.createComponent();
  c.name = `Size=${s}`;
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.counterAxisAlignItems = 'CENTER';
  c.fills = [];
  c.clipsContent = false;
  bind(c, ['itemSpacing'], 'space/content/xs');
  const first = ib(s, 'disabled', G.first, 'First page');
  first.name = 'First';
  c.appendChild(first);
  const prev = ib(s, 'disabled', G.previous, 'Previous page');
  prev.name = 'Previous';
  c.appendChild(prev);
  const sl = c.createSlot();
  sl.name = 'Items';
  sl.fills = [];
  sl.clipsContent = false;
  sl.layoutMode = 'HORIZONTAL';
  sl.primaryAxisSizingMode = 'AUTO';
  sl.counterAxisSizingMode = 'AUTO';
  sl.counterAxisAlignItems = 'CENTER';
  c.appendChild(sl);
  bind(sl, ['itemSpacing'], 'space/content/xs');
  for (const n of ['1', '2', '3', '4', '5', '…', '20']) {
    if (n === '…') {
      sl.appendChild(ellSet.children.find((v) => v.name === `Size=${s}`).createInstance());
      continue;
    }
    const i = itemSet.children
      .find((v) => v.name === `Size=${s}, State=${n === '1' ? 'selected' : 'default'}`)
      .createInstance();
    sl.appendChild(i);
    setP(i, 'Number', n);
  }
  const next = ib(s, 'default', G.next, 'Next page');
  next.name = 'Next';
  c.appendChild(next);
  const last = ib(s, 'default', G.last, 'Last page');
  last.name = 'Last';
  c.appendChild(last);
  // The IconButton masters reserve the 44 px target as a minimum height; inside the row the visible box sets the height.
  for (const b of [first, prev, next, last]) {
    b.isExposedInstance = true;
  }
  const nm = figma.createText();
  nm.textStyleId = style('label/md').id;
  nm.characters = 'Pagination';
  nm.autoRename = false;
  nm.name = 'Label (accessible name, not shown)';
  c.appendChild(nm);
  nm.layoutPositioning = 'ABSOLUTE';
  nm.visible = false;
  comps.push(c);
}
const set = figma.combineAsVariants(comps, section);
set.name = 'Pagination';
const g = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children) v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(g[0], {
  name: 'Items',
  description:
    'Pagination/Item and Pagination/Ellipsis of the same Size: page 1, the last page, the current page (State selected) and siblingCount pages on each side; a gap of hidden pages becomes an ellipsis, a gap of one page shows that page.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: itemSet.key },
    { type: 'COMPONENT_SET', key: ellSet.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const pEdges = set.addComponentProperty('Show edges', 'BOOLEAN', false);
const pLabel = set.addComponentProperty('Label', 'TEXT', 'Pagination');
for (const v of set.children) {
  for (const n of ['First', 'Last']) v.findChild((x) => x.name === n).componentPropertyReferences = { visible: pEdges };
  v.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: pLabel
  };
}
set.description =
  'Pagination (navigation/pagination): moves through a long list or table split into numbered pages. A navigation landmark named by Label (not shown) holding one row, space/content/xs apart: First (Show edges), Previous, the page items, Next, Last (Show edges). Previous, Next, First and Last are IconButtons of the same Size, neutral ghost, with chevrons (double chevrons for the edges); set their State to disabled on page 1 (First, Previous) and on the last page (Next, Last): they stay in place. The number of items is constant (siblingCount × 2 + 5) so that the controls do not move. The code reduces siblings when the row lacks room and links pages with href; it never wraps.';
set.children.forEach((v, j) => {
  v.x = 24;
  v.y = 24 + j * 80;
});
set.resizeWithoutConstraints(24 * 2 + Math.max(...set.children.map((v) => v.width)), 24 * 2 + 3 * 80 - 16);
set.fills = [];
set.x = 80;
set.y = itemSet.y + itemSet.height + 80;
section.resizeWithoutConstraints(Math.max(ellSet.x + ellSet.width, set.x + set.width) + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return {
  section: section.id,
  item: itemSet.id,
  ellipsis: ellSet.id,
  set: set.id,
  sizes: set.children.map((v) => [v.name, Math.round(v.width), Math.round(v.height)]),
  item1: itemSet.defaultVariant.width
};
