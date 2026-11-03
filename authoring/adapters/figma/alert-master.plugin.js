// Alert master builder (use_figma body), 2026-11-03.
// On the Feedback library page (407:112), section Alert: the set “Alert” (Intent × Title, 10 variants). A horizontal
// auto layout 480 wide (fill in a layout): padding space/content/md, gap space/content/sm, radius/container, surface
// color/status/{intent}/surface with an inside edge border/width/default in color/status/{intent}/border. Children: an
// Icon box as tall as the first line (typography/label/md/lineHeight with a title, body/sm without) centering the
// intrinsic Phosphor glyph of the intent at size/icon/md in color/status/{intent}/icon; a Body column (gap
// space/content/md) with Text (gap space/content/xs: Title label/md, Content body/sm, both in
// color/status/{intent}/content, wrapping) and the slot Actions (a ButtonGroup sm by default); a Dismiss box on the
// first line with the ghost neutral IconButton sm (close glyph, label Dismiss). Each variant sets the mode of
// Components · action family to its intent (action-family.plugin.js), so that accent and neutral buttons follow it.
// Properties: Title text, Content, Show actions, Dismissible, Actions slot. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:112');
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
const PADS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const fam = cols.find((c) => c.name === 'Components · action family');
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['label/md', 'body/sm']) await figma.loadFontAsync(style(s).fontName);
const GLYPH = { neutral: '200:5169', info: '200:5169', success: '200:4685', warning: '200:5834', danger: '200:5831' };
const glyphs = {};
for (const [k, id] of Object.entries(GLYPH)) glyphs[k] = await figma.getNodeByIdAsync(id);
const X = await figma.getNodeByIdAsync('200:4368');
const IB = await figma.getNodeByIdAsync('211:1167');
const BG = await figma.getNodeByIdAsync('419:2913');
const ibSm = IB.children.find(
  (c) =>
    /Intent=neutral/.test(c.name) &&
    /Appearance=ghost/.test(c.name) &&
    /Size=sm/.test(c.name) &&
    /State=default/.test(c.name)
);
const bgSm = BG.children.find((c) => c.name === 'Orientation=horizontal, Align=start, Size=sm');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Alert');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Alert';
  page.appendChild(section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Alert')) n.remove();
const INT = ['info', 'neutral', 'success', 'warning', 'danger'];
const comps = [];
for (const t of ['yes', 'no'])
  for (const i of INT) {
    const r = (x) => `color/status/${i}/${x}`;
    const firstLine = t === 'yes' ? 'typography/label/md/lineHeight' : 'typography/body/sm/lineHeight';
    const c = figma.createComponent();
    c.name = `Intent=${i}, Title=${t}`;
    c.layoutMode = 'HORIZONTAL';
    c.resize(480, 60);
    c.primaryAxisSizingMode = 'FIXED';
    c.counterAxisSizingMode = 'AUTO';
    c.counterAxisAlignItems = 'MIN';
    c.clipsContent = false;
    bind(c, PADS, 'space/content/md');
    bind(c, ['itemSpacing'], 'space/content/sm');
    bind(c, RADII, 'radius/container');
    c.fills = [paint(r('surface'), c)];
    c.strokes = [paint(r('border'), c)];
    c.strokeAlign = 'INSIDE';
    bind(c, STROKES, 'border/width/default');
    c.strokesIncludedInLayout = false;
    c.setExplicitVariableModeForCollection(fam, fam.modes.find((m) => m.name === i).modeId);
    const ib = figma.createAutoLayout('HORIZONTAL', { name: 'Icon box' });
    ib.fills = [];
    ib.clipsContent = false;
    ib.counterAxisAlignItems = 'CENTER';
    c.appendChild(ib);
    ib.counterAxisSizingMode = 'FIXED';
    bind(ib, ['height'], firstLine);
    const g = glyphs[i].createInstance();
    g.name = 'Icon';
    ib.appendChild(g);
    bind(g, ['width', 'height'], 'size/icon/md');
    for (const v of g.findAll((n) => n.type === 'VECTOR')) v.fills = [paint(r('icon'), v)];
    const col = figma.createAutoLayout('VERTICAL', { name: 'Body' });
    col.fills = [];
    col.clipsContent = false;
    c.appendChild(col);
    col.layoutSizingHorizontal = 'FILL';
    bind(col, ['itemSpacing'], 'space/content/md');
    const txt = figma.createAutoLayout('VERTICAL', { name: 'Text' });
    txt.fills = [];
    txt.clipsContent = false;
    col.appendChild(txt);
    txt.layoutSizingHorizontal = 'FILL';
    bind(txt, ['itemSpacing'], 'space/content/xs');
    const addText = (name, st, chars) => {
      const x = figma.createText();
      x.name = name;
      x.textStyleId = style(st).id;
      x.characters = chars;
      txt.appendChild(x);
      x.fills = [paint(r('content'), x)];
      x.layoutSizingHorizontal = 'FILL';
      x.textAutoResize = 'HEIGHT';
    };
    if (t === 'yes') addText('Title', 'label/md', 'The changes were not saved');
    addText('Content', 'body/sm', 'The connection was lost. Your edits are kept on this device.');
    const slot = c.createSlot();
    slot.name = 'Actions';
    slot.fills = [];
    slot.clipsContent = false;
    col.appendChild(slot);
    slot.layoutMode = 'HORIZONTAL';
    slot.primaryAxisSizingMode = 'AUTO';
    slot.counterAxisSizingMode = 'AUTO';
    slot.layoutSizingHorizontal = 'FILL';
    const grp = bgSm.createInstance();
    slot.appendChild(grp);
    grp.layoutSizingHorizontal = 'FILL';
    const items = grp.findOne((n) => n.type === 'SLOT').children;
    setP(items[0], 'Label', 'Try again');
    setP(items[1], 'Label', 'Details');
    const db = figma.createAutoLayout('HORIZONTAL', { name: 'Dismiss box' });
    db.fills = [];
    db.clipsContent = false;
    db.counterAxisAlignItems = 'CENTER';
    c.appendChild(db);
    db.counterAxisSizingMode = 'FIXED';
    bind(db, ['height'], firstLine);
    const d = ibSm.createInstance();
    d.name = 'Dismiss';
    db.appendChild(d);
    setP(d, 'Icon', X.id);
    setP(d, 'Label', 'Dismiss');
    comps.push(c);
  }
const set = figma.combineAsVariants(comps, section);
set.name = 'Alert';
let slotDefs = Object.keys(set.componentPropertyDefinitions).filter(
  (k) => set.componentPropertyDefinitions[k].type === 'SLOT'
);
if (slotDefs.length > 1) {
  for (const v of set.children)
    v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slotDefs[0] };
  for (const k of slotDefs.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
  slotDefs = [slotDefs[0]];
}
set.editComponentProperty(slotDefs[0], {
  name: 'Actions',
  description:
    'At most one ButtonGroup of small (sm) buttons, under the content. Accent and neutral buttons take the action family of the alert intent (set by the variant through the Components · action family mode); danger buttons keep theirs.',
  preferredValues: [{ type: 'COMPONENT_SET', key: BG.key }],
  slotSettings: { allowPreferredValuesOnly: true }
});
const pTitle = set.addComponentProperty('Title text', 'TEXT', 'The changes were not saved');
const pContent = set.addComponentProperty(
  'Content',
  'TEXT',
  'The connection was lost. Your edits are kept on this device.'
);
const pActions = set.addComponentProperty('Show actions', 'BOOLEAN', false);
const pDismiss = set.addComponentProperty('Dismissible', 'BOOLEAN', false);
for (const v of set.children) {
  const ti = v.findOne((n) => n.type === 'TEXT' && n.name === 'Title');
  if (ti) ti.componentPropertyReferences = { characters: pTitle };
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Content').componentPropertyReferences = { characters: pContent };
  const sl = v.findOne((n) => n.type === 'SLOT');
  sl.componentPropertyReferences = { ...sl.componentPropertyReferences, visible: pActions };
  v.findChild((n) => n.name === 'Dismiss box').componentPropertyReferences = { visible: pDismiss };
}
set.description =
  'Alert (feedback/alert): a durable message in the flow of the page about the page, a section or a task. Intent sets the colors (color/status/{intent}/*) and the intrinsic glyph (info, check-circle, warning, warning-circle; swap the Icon layer to replace it). Title: yes shows the title in label/md; content in body/sm wraps. Actions slot: one ButtonGroup of sm buttons; accent and neutral buttons, the dismiss button included, take the action family of the intent (Components · action family mode set by the variant), danger keeps its own. Dismissible shows the ghost IconButton (close glyph, label Dismiss). Live announcements are behaviors of the code.';
['yes', 'no'].forEach((t, k) =>
  INT.forEach((i, j) => {
    const v = set.children.find((x) => x.name === `Intent=${i}, Title=${t}`);
    v.x = 32 + j * 520;
    v.y = 32 + k * 200;
  })
);
set.resizeWithoutConstraints(32 + 5 * 520, 32 + 2 * 200 + 32);
set.x = 80;
set.y = 80;
section.resizeWithoutConstraints(set.width + 160, set.height + 160);
return { section: section.id, set: set.id };
