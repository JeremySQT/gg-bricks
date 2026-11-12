// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Breadcrumb section of the Navigation page: _Breadcrumb/Slash (the code path), _Breadcrumb/Separator, Breadcrumb/Item,
// Breadcrumb/More and Breadcrumb. The hover underline is an Underline layer under the label (part 3): Figma keeps one
// text decoration for every text layer bound to the same Text property, so a per-variant decoration cannot be set on
// the bound label (it was lost, then spread to every variant; repaired by recreating the Label property). Part 4 refills
// the Breadcrumb slots after the repair.
// ---- Part 1: Build Breadcrumb section: _Breadcrumb/Slash, _Breadcrumb/Separator, Breadcrumb/Item, Breadcrumb/More, Breadcrumb ----
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
for (const s of ['body/sm', 'body/md', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const CARET = await figma.getNodeByIdAsync('200:4707');
const HOUSE = await figma.getNodeByIdAsync('200:5200');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Breadcrumb');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Breadcrumb';
  page.appendChild(section);
  section.x = 0;
  section.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
// _Breadcrumb/Slash: the code's slash on the 256 grid, drawn like a Phosphor glyph (24 px box, scales with its box).
const svg = figma.createNodeFromSvg(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M168.3,33.3a8,8,0,0,1,4.4,10.4l-72,176a8,8,0,0,1-14.8-6l72-176A8,8,0,0,1,168.3,33.3Z" fill="#000"/></svg>'
);
const slash = figma.createComponent();
slash.name = '_Breadcrumb/Slash';
section.appendChild(slash);
slash.resize(24, 24);
slash.fills = [];
slash.clipsContent = false;
for (const ch of [...svg.children]) {
  slash.appendChild(ch);
  ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  ch.name = 'Vector';
}
svg.remove();
slash.description =
  'Slash separator of the Breadcrumb (separator slash): the path of the code, on the 256-unit grid of the glyph set with its round caps; scales with its box.';
slash.x = 80;
slash.y = 80;
// _Breadcrumb/Separator: Size × Shape.
const seps = [];
for (const s of ['sm', 'md'])
  for (const sh of ['chevron', 'slash']) {
    const c = figma.createComponent();
    c.name = `Size=${s}, Shape=${sh}`;
    c.fills = [];
    c.clipsContent = false;
    bind(c, ['width', 'height'], `size/icon/${s}`);
    const g = (sh === 'chevron' ? CARET : slash).createInstance();
    g.name = 'Glyph';
    c.appendChild(g);
    g.x = 0;
    g.y = 0;
    bind(g, ['width', 'height'], `size/icon/${s}`);
    g.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    for (const v of g.findAll((n) => n.type === 'VECTOR')) v.fills = [paint('color/content/tertiary', v)];
    seps.push(c);
  }
const sepSet = figma.combineAsVariants(seps, section);
sepSet.name = '_Breadcrumb/Separator';
sepSet.description =
  'Separator between Breadcrumb items: a chevron (caret-right) or a slash of size/icon/{size} in color/content/tertiary, decorative, mirrored in right-to-left text.';
sepSet.children.forEach((v, j) => {
  v.x = 24 + (j % 2) * 56;
  v.y = 24 + Math.floor(j / 2) * 56;
});
sepSet.resizeWithoutConstraints(24 * 2 + 56 + 20, 24 * 2 + 56 + 20);
sepSet.fills = [];
sepSet.x = slash.x + 80;
sepSet.y = 80;
const sepOf = (s, sh) => sepSet.children.find((v) => v.name === `Size=${s}, Shape=${sh}`);
const COLOR = {
  link: 'color/content/secondary',
  hover: 'color/content/primary',
  text: 'color/content/secondary',
  current: 'color/content/primary'
};
const glyphs = [];
const entry = (c, s, st, label) => {
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.counterAxisAlignItems = 'CENTER';
  c.fills = [];
  c.clipsContent = false;
  bind(c, ['itemSpacing'], 'space/content/xs');
  const box = figma.createAutoLayout('HORIZONTAL', { name: 'Item' });
  box.fills = [];
  box.clipsContent = false;
  box.counterAxisAlignItems = 'CENTER';
  c.appendChild(box);
  bind(box, ['itemSpacing'], 'space/content/xs');
  bind(box, RADII, 'radius/indicator');
  const t = figma.createText();
  t.textStyleId = style(`body/${s}`).id;
  t.characters = label;
  t.autoRename = false;
  t.name = 'Label';
  t.fills = [paint(COLOR[st], t)];
  if (st === 'hover') t.textDecoration = 'UNDERLINE';
  return { box, t };
};
const ring = (box) => {
  const r = figma.createFrame();
  r.name = 'Focus ring';
  r.fills = [];
  box.appendChild(r);
  r.layoutPositioning = 'ABSOLUTE';
  r.x = -2;
  r.y = -2;
  r.resize(box.width + 4, box.height + 4);
  r.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  r.strokes = [paint('color/focus/ring', r)];
  r.strokeAlign = 'OUTSIDE';
  bind(r, STROKES, 'focus/width');
  bind(r, RADII, 'radius/focus');
  r.visible = false;
  const tg = figma.createFrame();
  tg.name = 'Target';
  tg.fills = [];
  box.appendChild(tg);
  tg.layoutPositioning = 'ABSOLUTE';
  bind(tg, ['height'], 'size/target/min');
  tg.resize(box.width, tg.height);
  tg.x = 0;
  tg.y = (box.height - tg.height) / 2;
  tg.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
};
// Breadcrumb/Item: Size × State.
const items = [];
for (const s of ['sm', 'md'])
  for (const st of ['link', 'hover', 'text', 'current']) {
    const c = figma.createComponent();
    c.name = `Size=${s}, State=${st}`;
    const { box, t } = entry(c, s, st, 'Projects');
    const lead = HOUSE.createInstance();
    lead.name = 'Leading';
    box.appendChild(lead);
    bind(lead, ['width', 'height'], `size/icon/${s}`);
    glyphs.push([lead, COLOR[st]]);
    lead.visible = false;
    box.appendChild(t);
    if (st === 'link' || st === 'hover') ring(box);
    if (st !== 'current') {
      const sp = sepOf(s, 'chevron').createInstance();
      sp.name = 'Separator';
      c.appendChild(sp);
    }
    items.push(c);
  }
const itemSet = figma.combineAsVariants(items, section);
itemSet.name = 'Breadcrumb/Item';
const iLabel = itemSet.addComponentProperty('Label', 'TEXT', 'Projects');
const iLead = itemSet.addComponentProperty('Show leading', 'BOOLEAN', false);
const iShowLabel = itemSet.addComponentProperty('Show label', 'BOOLEAN', true);
const iSep = itemSet.addComponentProperty('Show separator', 'BOOLEAN', true);
const iFocus = itemSet.addComponentProperty('Focus', 'BOOLEAN', false);
const iIcon = itemSet.addComponentProperty('Leading icon', 'INSTANCE_SWAP', HOUSE.id);
for (const v of itemSet.children) {
  const box = v.findChild((n) => n.name === 'Item');
  box.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: iLabel, visible: iShowLabel };
  box.findChild((n) => n.name === 'Leading').componentPropertyReferences = { visible: iLead, mainComponent: iIcon };
  const r = box.findChild((n) => n.name === 'Focus ring');
  if (r) r.componentPropertyReferences = { visible: iFocus };
  const sp = v.findChild((n) => n.name === 'Separator');
  if (sp) {
    sp.componentPropertyReferences = { visible: iSep };
    sp.isExposedInstance = true;
  }
  const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
  for (const g of box.findChild((n) => n.name === 'Leading').findAll((n) => n.type === 'VECTOR'))
    g.fills = [paint(COLOR[q.State], g)];
}
itemSet.description =
  'Breadcrumb item (navigation/breadcrumb, child item) followed by its separator. State link: an ancestor with its own page, in color/content/secondary; hover: underlined, color/content/primary; text: a level without its own page (plain text, color/content/secondary); current: the current page, last, never a link, color/content/primary, without separator. Label in body/{size}, one line (the code truncates ancestors first when the line lacks room, down to three characters). Show leading adds a decorative icon of size/icon/{size} in the item color (a home icon on the first item; Leading icon swap); Show label off hides the label when a leading icon is shown (hideLabel: the label stays the accessible name and is shown on hover). Separator: chevron or slash (select it to change its Shape, like the other items). Focus shows the ring (focus/width, color/focus/ring, radius/indicator corners) on a link. Gaps: space/content/xs between icon, label and separator.';
itemSet.children.forEach((v, j) => {
  v.x = 24 + (j % 4) * 160;
  v.y = 24 + Math.floor(j / 4) * 64;
});
itemSet.resizeWithoutConstraints(24 * 2 + 4 * 160 - 40, 24 * 2 + 64 + 24);
itemSet.fills = [];
itemSet.x = sepSet.x + sepSet.width + 80;
itemSet.y = 80;
// Breadcrumb/More: Size × State.
const mores = [];
for (const s of ['sm', 'md'])
  for (const st of ['default', 'hover']) {
    const c = figma.createComponent();
    c.name = `Size=${s}, State=${st}`;
    const { box, t } = entry(c, s, st === 'hover' ? 'hover' : 'link', '…');
    box.appendChild(t);
    ring(box);
    const sp = sepOf(s, 'chevron').createInstance();
    sp.name = 'Separator';
    c.appendChild(sp);
    const nm = figma.createText();
    nm.textStyleId = style('label/md').id;
    nm.characters = 'Show hidden pages';
    nm.autoRename = false;
    nm.name = 'Label (accessible name, not shown)';
    c.appendChild(nm);
    nm.layoutPositioning = 'ABSOLUTE';
    nm.visible = false;
    mores.push(c);
  }
const moreSet = figma.combineAsVariants(mores, section);
moreSet.name = 'Breadcrumb/More';
const mFocus = moreSet.addComponentProperty('Focus', 'BOOLEAN', false);
const mLabel = moreSet.addComponentProperty('Label', 'TEXT', 'Show hidden pages');
for (const v of moreSet.children) {
  v.findChild((n) => n.name === 'Item').findChild((n) => n.name === 'Focus ring').componentPropertyReferences = {
    visible: mFocus
  };
  v.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: mLabel
  };
  v.findChild((n) => n.name === 'Separator').isExposedInstance = true;
}
moreSet.description =
  'Breadcrumb more (part more): replaces the hidden items when maxItems is reached (after the first item). A button showing an ellipsis, painted and spaced like an ancestor link, named by Label (moreLabel, not shown), followed by a separator. It opens a Menu listing the hidden items as links, in order (Menu, overlays/menu).';
moreSet.children.forEach((v, j) => {
  v.x = 24 + (j % 2) * 96;
  v.y = 24 + Math.floor(j / 2) * 64;
});
moreSet.resizeWithoutConstraints(24 * 2 + 96 + 60, 24 * 2 + 64 + 24);
moreSet.fills = [];
moreSet.x = itemSet.x + itemSet.width + 80;
moreSet.y = 80;
// Breadcrumb: Size × Separator.
const crumbs = [];
const itemOf = (s, st) => itemSet.children.find((v) => v.name === `Size=${s}, State=${st}`);
for (const s of ['sm', 'md'])
  for (const sh of ['chevron', 'slash']) {
    const c = figma.createComponent();
    c.name = `Size=${s}, Separator=${sh}`;
    c.layoutMode = 'HORIZONTAL';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.counterAxisAlignItems = 'CENTER';
    c.fills = [];
    c.clipsContent = false;
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
    for (const [lab, st, home] of [
      ['Home', 'link', true],
      ['Projects', 'link', false],
      ['ggbrick', 'current', false]
    ]) {
      const i = itemOf(s, st).createInstance();
      sl.appendChild(i);
      setP(i, 'Label', lab);
      if (home) setP(i, 'Show leading', true);
      const sp = i.findOne((n) => n.type === 'INSTANCE' && n.name === 'Separator');
      if (sp && sh === 'slash') sp.setProperties({ Shape: 'slash' });
    }
    const nm = figma.createText();
    nm.textStyleId = style('label/md').id;
    nm.characters = 'Breadcrumb';
    nm.autoRename = false;
    nm.name = 'Label (accessible name, not shown)';
    c.appendChild(nm);
    nm.layoutPositioning = 'ABSOLUTE';
    nm.visible = false;
    crumbs.push(c);
  }
const set = figma.combineAsVariants(crumbs, section);
set.name = 'Breadcrumb';
const g = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children) v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(g[0], {
  name: 'Items',
  description:
    'Breadcrumb/Item instances in hierarchy order, the current page last (State current, no separator); Breadcrumb/More after the first item when items are hidden. Same Size and separator Shape on every item.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: itemSet.key },
    { type: 'COMPONENT_SET', key: moreSet.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const bLabel = set.addComponentProperty('Label', 'TEXT', 'Breadcrumb');
for (const v of set.children)
  v.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: bLabel
  };
for (const [icon, color] of glyphs)
  for (const gl of icon.findAll((n) => n.type === 'VECTOR')) gl.fills = [paint(color, gl)];
set.description =
  'Breadcrumb (navigation/breadcrumb): where the current page sits in the site hierarchy, from a top level to the current page, with a link to each ancestor. A navigation landmark named by Label (not shown) holding the items on one line, space/content/xs apart, each followed by a separator (chevron or slash, set by Separator on the default items) except the current page. Size sm or md sets the type and icon sizes. The code shrinks ancestors first when the line lacks room and collapses hidden items behind Breadcrumb/More with maxItems; it never wraps.';
set.children.forEach((v, j) => {
  v.x = 24 + (j % 2) * 320;
  v.y = 24 + Math.floor(j / 2) * 64;
});
set.resizeWithoutConstraints(24 * 2 + 320 + Math.max(...set.children.map((v) => v.width)), 24 * 2 + 64 + 28);
set.fills = [];
set.x = 80;
set.y = itemSet.y + itemSet.height + 80;
section.resizeWithoutConstraints(Math.max(moreSet.x + moreSet.width, set.x + set.width) + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return {
  section: section.id,
  slash: slash.id,
  separator: sepSet.id,
  item: itemSet.id,
  more: moreSet.id,
  set: set.id,
  sizes: set.children.map((v) => [v.name, Math.round(v.width), Math.round(v.height)])
};

// ---- Part 2: Recreate Breadcrumb/Item Label property after fixing per-variant formatting; report result ----
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('503:247');
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/sm', 'body/md']) await figma.loadFontAsync(style(s).fontName);
const defs = set.componentPropertyDefinitions;
const kOld = Object.keys(defs).find((k) => k.split('#')[0] === 'Label');
const kShow = Object.keys(defs).find((k) => k.split('#')[0] === 'Show label');
const labels = set.children.map((v) => [v, v.findOne((n) => n.type === 'TEXT' && n.name === 'Label')]);
for (const [, t] of labels) t.componentPropertyReferences = { visible: kShow };
set.deleteComponentProperty(kOld);
for (const [v, t] of labels) {
  const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
  await t.setTextStyleIdAsync(style(`body/${q.Size}`).id);
  t.textDecoration = q.State === 'hover' ? 'UNDERLINE' : 'NONE';
}
const before = labels.map(([v, t]) => [v.name, t.fontSize, t.textDecoration]);
const kNew = set.addComponentProperty('Label', 'TEXT', 'Projects');
for (const [, t] of labels) t.componentPropertyReferences = { characters: kNew, visible: kShow };
const after = labels.map(([v, t]) => [v.name, t.fontSize, t.textDecoration]);
return { before, after };

// ---- Part 3: Breadcrumb/Item hover: wrap the label in a Label box with an Underline layer; screenshot the item set ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('503:247');
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((x) => x.name === name);
const res = [];
for (const v of set.children) {
  if (!v.name.includes('State=hover')) continue;
  const t = v.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
  await figma.loadFontAsync(t.fontName);
  const item = t.parent;
  const idx = item.children.indexOf(t);
  const box = figma.createAutoLayout('HORIZONTAL', { name: 'Label box' });
  box.fills = [];
  box.clipsContent = false;
  item.insertChild(idx, box);
  box.appendChild(t);
  // The visibility follows Show label on the box (the label keeps its own binding).
  box.componentPropertyReferences = { visible: t.componentPropertyReferences.visible };
  const u = figma.createFrame();
  u.name = 'Underline';
  box.appendChild(u);
  u.layoutPositioning = 'ABSOLUTE';
  u.setBoundVariable('height', V('border/width/default'));
  const c = V('color/content/primary').resolveForConsumer(u).value;
  u.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } },
      'color',
      V('color/content/primary')
    )
  ];
  const size = v.name.includes('Size=md') ? 'md' : 'sm';
  // Under the baseline, as the code's underline (half the leading above the box bottom).
  const inset = size === 'md' ? 4 : 3;
  u.resize(box.width, u.height);
  u.x = 0;
  u.y = box.height - inset - u.height;
  u.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
  res.push([v.name, box.width, box.height, u.y]);
}
await set.screenshot({ scale: 3 });
return res;

// ---- Part 4: Rebuild Breadcrumb set slot items from the repaired Item set; re-measure Breadcrumb parity ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const itemSet = await figma.getNodeByIdAsync('503:247');
const crumb = await figma.getNodeByIdAsync('503:405');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
for (const v of crumb.children) {
  const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
  const sl = v.findOne((n) => n.type === 'SLOT');
  for (const c of [...sl.children]) c.remove();
  for (const [lab, st, home] of [
    ['Home', 'link', true],
    ['Projects', 'link', false],
    ['ggbrick', 'current', false]
  ]) {
    const i = itemSet.children.find((x) => x.name === `Size=${q.Size}, State=${st}`).createInstance();
    sl.appendChild(i);
    setP(i, 'Label', lab);
    if (home) setP(i, 'Show leading', true);
    const sp = i.findOne((n) => n.type === 'INSTANCE' && n.name === 'Separator');
    if (sp && q.Separator === 'slash') sp.setProperties({ Shape: 'slash' });
  }
}
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    return rgb(r, r.a ?? 1);
  }
  return rgb(p.color, p.opacity ?? 1);
};
const vec = (n) => n.findOne((x) => x.type === 'VECTOR');
const out = {};
let cur;
const add = (props, state, prop, val) => cur.push([props, state, prop, String(val)]);
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  cur = out[ctx] = [];
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = (name) => {
    const i = itemSet.children.find((v) => v.name === name).createInstance();
    f.appendChild(i);
    return i;
  };
  for (const s of ['sm', 'md']) {
    const P = 'size=' + s;
    const l = mk(`Size=${s}, State=link`);
    const lt = l.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    const sp = l.findChild((n) => n.name === 'Separator');
    add(P, 'default', 'color', await paintOf(lt));
    add(P, 'default', 'fontSize', lt.fontSize + 'px');
    add(P, 'default', 'separator', await paintOf(vec(sp)));
    add(P, 'default', 'separatorSize', sp.width + 'px');
    const h = mk(`Size=${s}, State=hover`);
    const ht = h.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    const u = h.findOne((n) => n.name === 'Underline');
    add(P, 'hover', 'color', await paintOf(ht));
    add(P, 'hover', 'underline', (u && u.visible) || ht.textDecoration === 'UNDERLINE' ? 'underline' : 'none');
    const c = mk(`Size=${s}, State=current`);
    const ct = c.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    add(P, 'current', 'color', await paintOf(ct));
    add(P, 'current', 'fontSize', ct.fontSize + 'px');
  }
  f.remove();
}
return 'PARITY2:breadcrumb ' + JSON.stringify(out);
