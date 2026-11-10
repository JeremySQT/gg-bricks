// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Accordion section of the Navigation page: Accordion/Item (State × Expanded) and the Accordion component.
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
for (const s of ['label/lg', 'body/md']) await figma.loadFontAsync(style(s).fontName);
const DOWN = await figma.getNodeByIdAsync('200:4648');
const UP = await figma.getNodeByIdAsync('200:4672');
const ICON = await figma.getNodeByIdAsync('200:5476');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Accordion');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Accordion';
  page.appendChild(section);
  section.x = 0;
  section.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const glyphs = [];
const items = [];
for (const st of ['default', 'hover', 'disabled'])
  for (const ex of ['false', 'true']) {
    const c = figma.createComponent();
    c.name = `State=${st}, Expanded=${ex}`;
    c.layoutMode = 'VERTICAL';
    c.resize(480, 49);
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'FIXED';
    c.fills = [];
    c.clipsContent = false;
    c.strokes = [paint('color/border/subtle', c)];
    c.strokeAlign = 'INSIDE';
    c.strokesIncludedInLayout = true;
    c.strokeTopWeight = 0;
    c.strokeLeftWeight = 0;
    c.strokeRightWeight = 0;
    bind(c, ['strokeBottomWeight'], 'border/width/default');
    const t = figma.createAutoLayout('HORIZONTAL', { name: 'Trigger' });
    t.clipsContent = false;
    t.counterAxisAlignItems = 'CENTER';
    c.appendChild(t);
    t.layoutSizingHorizontal = 'FILL';
    bind(t, ['minHeight'], 'size/control/lg');
    bind(t, ['paddingTop', 'paddingBottom'], 'space/control/padding-block/lg');
    bind(t, ['paddingLeft', 'paddingRight'], 'space/content/sm');
    bind(t, ['itemSpacing'], 'space/control/gap/lg');
    bind(t, RADII, 'radius/control');
    t.fills = [paint(`color/item/${st}/surface`, t)];
    const col = `color/item/${st}/content`;
    const lead = ICON.createInstance();
    lead.name = 'Leading';
    t.appendChild(lead);
    bind(lead, ['width', 'height'], 'size/icon/md');
    glyphs.push([lead, col]);
    lead.visible = false;
    const lb = figma.createText();
    lb.textStyleId = style('label/lg').id;
    lb.characters = 'What is included in the plan?';
    lb.autoRename = false;
    lb.name = 'Label';
    t.appendChild(lb);
    lb.fills = [paint(col, lb)];
    lb.layoutSizingHorizontal = 'FILL';
    lb.textAutoResize = 'HEIGHT';
    const ind = (ex === 'true' ? UP : DOWN).createInstance();
    ind.name = 'Indicator';
    t.appendChild(ind);
    bind(ind, ['width', 'height'], 'size/icon/md');
    glyphs.push([ind, st === 'disabled' ? col : 'color/content/secondary']);
    if (st !== 'disabled') {
      const r = figma.createFrame();
      r.name = 'Focus ring';
      r.fills = [];
      t.appendChild(r);
      r.layoutPositioning = 'ABSOLUTE';
      r.x = 0;
      r.y = 0;
      r.resize(t.width, t.height);
      r.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      r.strokes = [paint('color/focus/ring', r)];
      r.strokeAlign = 'INSIDE';
      bind(r, STROKES, 'focus/width');
      bind(r, RADII, 'radius/control');
      r.visible = false;
    }
    // Content: starts focus/width + focus/offset below the trigger (two nested paddings), aligned with the label.
    const outer = figma.createAutoLayout('VERTICAL', { name: 'Content' });
    outer.fills = [];
    outer.clipsContent = false;
    c.appendChild(outer);
    outer.layoutSizingHorizontal = 'FILL';
    bind(outer, ['paddingTop'], 'focus/width');
    const body = figma.createAutoLayout('VERTICAL', { name: 'Body' });
    body.fills = [];
    body.clipsContent = false;
    outer.appendChild(body);
    body.layoutSizingHorizontal = 'FILL';
    bind(body, ['paddingTop'], 'focus/offset');
    bind(body, ['paddingLeft', 'paddingRight'], 'space/content/sm');
    bind(body, ['paddingBottom'], 'space/content/lg');
    const sl = c.createSlot();
    sl.name = 'Content slot';
    sl.fills = [];
    sl.clipsContent = false;
    sl.layoutMode = 'VERTICAL';
    sl.primaryAxisSizingMode = 'AUTO';
    sl.counterAxisSizingMode = 'AUTO';
    body.appendChild(sl);
    sl.layoutSizingHorizontal = 'FILL';
    const tx = figma.createText();
    tx.textStyleId = style('body/md').id;
    tx.characters = 'Every plan includes unlimited projects, version history and priority support.';
    tx.autoRename = false;
    tx.name = 'Body text';
    sl.appendChild(tx);
    tx.fills = [paint('color/content/primary', tx)];
    tx.layoutSizingHorizontal = 'FILL';
    tx.textAutoResize = 'HEIGHT';
    outer.visible = ex === 'true';
    items.push(c);
  }
const itemSet = figma.combineAsVariants(items, section);
itemSet.name = 'Accordion/Item';
for (const v of itemSet.children) {
  v.primaryAxisSizingMode = 'AUTO';
  v.counterAxisSizingMode = 'FIXED';
}
const g = Object.entries(itemSet.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of itemSet.children)
  v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (itemSet.componentPropertyDefinitions[k]) itemSet.deleteComponentProperty(k);
itemSet.editComponentProperty(g[0], {
  name: 'Content',
  description: 'Free content of the section, in body/md and color/content/primary by default.',
  slotSettings: { minChildren: 0 }
});
const pLabel = itemSet.addComponentProperty('Label', 'TEXT', 'What is included in the plan?');
const pLead = itemSet.addComponentProperty('Show leading', 'BOOLEAN', false);
const pIcon = itemSet.addComponentProperty('Leading icon', 'INSTANCE_SWAP', ICON.id);
const pFocus = itemSet.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of itemSet.children) {
  const t = v.findChild((n) => n.name === 'Trigger');
  t.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: pLabel };
  t.findChild((n) => n.name === 'Leading').componentPropertyReferences = { visible: pLead, mainComponent: pIcon };
  const r = t.findChild((n) => n.name === 'Focus ring');
  if (r) r.componentPropertyReferences = { visible: pFocus };
}
for (const [icon, color] of glyphs)
  for (const gl of icon.findAll((n) => n.type === 'VECTOR')) gl.fills = [paint(color, gl)];
itemSet.description =
  'Accordion item (navigation/accordion, child item): a heading holding a trigger, followed by the content, with a line of border/width/default in color/border/subtle below. Trigger: min height size/control/lg, padding space/control/padding-block/lg × space/content/sm, gap space/control/gap/lg, radius/control; Leading (decorative icon, Leading icon swap, size/icon/md), Label (label/lg, wraps onto several lines) and Indicator (caret of size/icon/md in color/content/secondary, down when collapsed, up when expanded). State default, hover (color/item/hover/surface behind the trigger), disabled (color/item/disabled/*, cannot be toggled, keeps its expanded state). Expanded shows the Content slot in body/md and color/content/primary, aligned with the label, starting focus/width + focus/offset below the trigger and with space/content/lg below. Focus shows the keyboard ring inside the trigger (focus/width, color/focus/ring).';
itemSet.children.forEach((v, j) => {
  v.x = 24 + (j % 2) * 520;
  v.y = 24 + Math.floor(j / 2) * 200;
});
itemSet.resizeWithoutConstraints(
  24 * 2 + 520 + 480,
  24 * 2 + 2 * 200 + Math.max(...itemSet.children.map((v) => v.height))
);
itemSet.fills = [];
itemSet.x = 80;
itemSet.y = 80;
const acc = figma.createComponent();
acc.name = 'Accordion';
section.appendChild(acc);
acc.layoutMode = 'VERTICAL';
acc.resize(480, 200);
acc.primaryAxisSizingMode = 'AUTO';
acc.counterAxisSizingMode = 'FIXED';
acc.fills = [];
acc.clipsContent = false;
acc.strokes = [paint('color/border/subtle', acc)];
acc.strokeAlign = 'INSIDE';
acc.strokesIncludedInLayout = true;
acc.strokeBottomWeight = 0;
acc.strokeLeftWeight = 0;
acc.strokeRightWeight = 0;
bind(acc, ['strokeTopWeight'], 'border/width/default');
const sl = acc.createSlot();
sl.name = 'Items';
sl.fills = [];
sl.clipsContent = false;
sl.layoutMode = 'VERTICAL';
sl.primaryAxisSizingMode = 'AUTO';
sl.counterAxisSizingMode = 'AUTO';
acc.appendChild(sl);
sl.layoutSizingHorizontal = 'FILL';
for (const [lab, ex] of [
  ['What is included in the plan?', 'true'],
  ['Can I change plans later?', 'false'],
  ['How does billing work?', 'false']
]) {
  const i = itemSet.children.find((v) => v.name === `State=default, Expanded=${ex}`).createInstance();
  sl.appendChild(i);
  i.layoutSizingHorizontal = 'FILL';
  setP(i, 'Label', lab);
}
const sk = Object.keys(acc.componentPropertyDefinitions).find(
  (k) => acc.componentPropertyDefinitions[k].type === 'SLOT'
);
acc.editComponentProperty(sk, {
  name: 'Items',
  description: 'Accordion/Item instances in order, filling the width. With multiple off, at most one is expanded.',
  preferredValues: [{ type: 'COMPONENT_SET', key: itemSet.key }],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
acc.description =
  'Accordion (navigation/accordion): a vertical stack of headings that each show or hide a section of content (questions and answers, settings sections). Items separated by lines of border/width/default in color/border/subtle, also above the first item and below the last; no surface of its own; it takes the width it is given (480 px by default, resize the instance). Heading level (headingLevel), single or multiple expansion, keyboard navigation and the expand animation are behaviors of the code.';
acc.x = 80;
acc.y = itemSet.y + itemSet.height + 80;
section.resizeWithoutConstraints(itemSet.x + itemSet.width + 80, acc.y + acc.height + 80);
await acc.screenshot({ scale: 2 });
return {
  section: section.id,
  item: itemSet.id,
  accordion: acc.id,
  h: [itemSet.children[0].height, itemSet.children[1].height],
  trig: itemSet.children[0].children[0].height
};
