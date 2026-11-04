// Menu master builder (use_figma body), 2026-11-03.
// 2026-11-04 (user review of the Figma parity): the boolean Show trigger of Menu, off by default, shows its Trigger slot;
// the public children are named Menu/Item, Menu/Separator and Menu/Group, so that the Assets panel groups them under
// Menu (renamed in place; user decision at the gate, 2026-11-04). Their instance layers keep the code names.
// On the Overlays library page (407:119), section Menu: MenuItem (Intent neutral, danger × State default, hover,
// disabled; 6 variants), MenuSeparator, MenuGroup (Indent yes, no) and Menu (Side × Align, 6 variants).
// MenuItem: a horizontal auto layout 240 wide, min height size/control/sm, padding space/control/padding-inline/sm ×
// space/control/padding-block/sm, gap space/control/gap/sm, radius/container, fill color/item/{state}/surface; Leading (a
// Phosphor glyph behind the Icon swap property, size/icon/sm), Label (body/sm, one line, truncated) and Trailing (a
// Shortcut sm) in color/item/{state}/content, danger in color/status/danger/content unless disabled. Properties Label,
// Show leading, Show trailing, Icon. MenuSeparator: a line of border/width/default in color/border/subtle with
// space/content/xs above and below. MenuGroup: a Heading (caption/md, color/content/secondary, padding
// space/control/padding-inline/sm × space/content/xs; Indent=yes keeps a room of size/icon/sm + gap) above the slot Items
// (MenuItem only). Menu: the slot Trigger (Button or IconButton) and the Panel (color/surface/overlay, inside edge
// color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs, max width size/overlay/panel) holding
// the slot Items (MenuItem, MenuSeparator, MenuGroup), stacked with the gap space/content/xs and aligned by Align. Rerunning
// replaces the section's content.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:119');
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
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/sm', 'caption/md', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/overlay');
const PENCIL = await figma.getNodeByIdAsync('200:5392');
const COPY = await figma.getNodeByIdAsync('200:4794');
const TRASH = await figma.getNodeByIdAsync('200:5762');
const DOTS = await figma.getNodeByIdAsync('200:4868');
const SHORT = await figma.getNodeByIdAsync('151:110');
const IB = await figma.getNodeByIdAsync('211:1167');
const BTN = await figma.getNodeByIdAsync('48:1586');
const shortSm = SHORT.children.find((c) => c.name === 'Appearance=Plain, Size=sm, Platform=Mac');
const ibOutline = IB.children.find(
  (c) =>
    /Intent=neutral/.test(c.name) &&
    /Appearance=outline/.test(c.name) &&
    /Size=md/.test(c.name) &&
    /State=default/.test(c.name)
);
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Menu');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Menu';
  page.appendChild(section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
// Slots of the same name share one SLOT property; merge them when combineAsVariants did not.
const mergeSlots = (set) => {
  const g = {};
  for (const [k, d] of Object.entries(set.componentPropertyDefinitions))
    if (d.type === 'SLOT') (g[k.split('#')[0]] ??= []).push(k);
  for (const [nm, keys] of Object.entries(g))
    if (keys.length > 1) {
      for (const v of set.children)
        v.findOne((n) => n.type === 'SLOT' && n.name === nm).componentPropertyReferences = { slotContentId: keys[0] };
      for (const k of keys.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
    }
  return Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v[0]]));
};
const role = (intent, st) =>
  intent === 'danger' && st !== 'disabled' ? 'color/status/danger/content' : `color/item/${st}/content`;
// MenuItem.
const items = [];
for (const intent of ['neutral', 'danger'])
  for (const st of ['default', 'hover', 'disabled']) {
    const c = figma.createComponent();
    c.name = `Intent=${intent}, State=${st}`;
    c.layoutMode = 'HORIZONTAL';
    c.resize(240, 32);
    c.primaryAxisSizingMode = 'FIXED';
    c.counterAxisSizingMode = 'AUTO';
    c.counterAxisAlignItems = 'CENTER';
    c.clipsContent = false;
    bind(c, ['paddingLeft', 'paddingRight'], 'space/control/padding-inline/sm');
    bind(c, ['paddingTop', 'paddingBottom'], 'space/control/padding-block/sm');
    bind(c, ['itemSpacing'], 'space/control/gap/sm');
    bind(c, RADII, 'radius/container');
    bind(c, ['minHeight'], 'size/control/sm');
    c.fills = [paint(`color/item/${st}/surface`, c)];
    const lead = PENCIL.createInstance();
    lead.name = 'Leading';
    c.appendChild(lead);
    bind(lead, ['width', 'height'], 'size/icon/sm');
    const t = figma.createText();
    t.textStyleId = style('body/sm').id;
    t.characters = 'Edit';
    t.name = 'Label';
    c.appendChild(t);
    t.fills = [paint(role(intent, st), t)];
    t.layoutSizingHorizontal = 'FILL';
    t.textTruncation = 'ENDING';
    t.maxLines = 1;
    const tr = shortSm.createInstance();
    tr.name = 'Trailing';
    c.appendChild(tr);
    items.push(c);
  }
const itemSet = figma.combineAsVariants(items, section);
itemSet.name = 'Menu/Item';
const pLabel = itemSet.addComponentProperty('Label', 'TEXT', 'Edit');
const pLead = itemSet.addComponentProperty('Show leading', 'BOOLEAN', true);
const pTrail = itemSet.addComponentProperty('Show trailing', 'BOOLEAN', false);
const pIcon = itemSet.addComponentProperty('Icon', 'INSTANCE_SWAP', PENCIL.id);
for (const v of itemSet.children) {
  v.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: pLabel };
  v.findChild((n) => n.name === 'Leading').componentPropertyReferences = { visible: pLead, mainComponent: pIcon };
  v.findChild((n) => n.name === 'Trailing').componentPropertyReferences = { visible: pTrail };
  // Glyph colors after binding the swap property, which can drop them.
  const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
  for (const g of v.findChild((n) => n.name === 'Leading').findAll((n) => n.type === 'VECTOR'))
    g.fills = [paint(role(q.Intent, q.State), g)];
}
itemSet.description =
  'MenuItem (overlays/menu, item): one action or link of a Menu. State default, hover (the highlighted item: pointer or keyboard) or disabled (never activated, skipped by typing but reachable by arrows). Intent danger for a destructive action (color/status/danger/content). Leading: an icon (Icon swap) at size/icon/sm; Trailing: a Shortcut sm. Label in body/sm, one line, truncated. Min height size/control/sm, padding space/control/padding-inline/sm × padding-block/sm, gap space/control/gap/sm, radius/container, colors color/item/{state}/*. A link item (href) looks the same.';
itemSet.children.forEach((v, j) => {
  v.x = 24 + (j % 3) * 272;
  v.y = 24 + Math.floor(j / 3) * 56;
});
itemSet.resizeWithoutConstraints(24 * 2 + 3 * 272 - 32, 24 * 2 + 2 * 56 - 24);
itemSet.x = 80;
itemSet.y = 80;
// MenuSeparator.
const sep = figma.createComponent();
sep.name = 'Menu/Separator';
section.appendChild(sep);
sep.layoutMode = 'VERTICAL';
sep.resize(240, 9);
sep.primaryAxisSizingMode = 'AUTO';
sep.counterAxisSizingMode = 'FIXED';
sep.fills = [];
bind(sep, ['paddingTop', 'paddingBottom'], 'space/content/xs');
const line = figma.createFrame();
line.name = 'Line';
sep.appendChild(line);
line.resize(240, 1);
line.layoutSizingHorizontal = 'FILL';
bind(line, ['height'], 'border/width/default');
line.fills = [paint('color/border/subtle', line)];
sep.description =
  'MenuSeparator (overlays/menu, separator): a line of border/width/default in color/border/subtle between groups of items, with space/content/xs above and below. Skipped by the keyboard.';
sep.x = itemSet.x + itemSet.width + 80;
sep.y = itemSet.y;
// MenuGroup.
const groups = [];
for (const ind of ['yes', 'no']) {
  const c = figma.createComponent();
  c.name = `Indent=${ind}`;
  c.layoutMode = 'VERTICAL';
  c.resize(240, 60);
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.fills = [];
  c.clipsContent = false;
  const h = figma.createAutoLayout('HORIZONTAL', { name: 'Heading' });
  h.fills = [];
  c.appendChild(h);
  h.layoutSizingHorizontal = 'FILL';
  bind(h, ['paddingLeft', 'paddingRight'], 'space/control/padding-inline/sm');
  bind(h, ['paddingTop', 'paddingBottom'], 'space/content/xs');
  bind(h, ['itemSpacing'], 'space/control/gap/sm');
  if (ind === 'yes') {
    const sp = figma.createFrame();
    sp.name = 'Leading room';
    sp.fills = [];
    h.appendChild(sp);
    bind(sp, ['width', 'height'], 'size/icon/sm');
  }
  const t = figma.createText();
  t.textStyleId = style('caption/md').id;
  t.characters = 'Share';
  t.name = 'Heading text';
  h.appendChild(t);
  t.fills = [paint('color/content/secondary', t)];
  t.layoutSizingHorizontal = 'FILL';
  t.textAutoResize = 'HEIGHT';
  const slot = c.createSlot();
  slot.name = 'Items';
  slot.fills = [];
  slot.clipsContent = false;
  slot.layoutMode = 'VERTICAL';
  slot.primaryAxisSizingMode = 'AUTO';
  slot.counterAxisSizingMode = 'AUTO';
  c.appendChild(slot);
  slot.layoutSizingHorizontal = 'FILL';
  for (const [lab, icon] of [
    ['Copy link', COPY],
    ['Email', null]
  ]) {
    const i = itemSet.defaultVariant.createInstance();
    slot.appendChild(i);
    i.layoutSizingHorizontal = 'FILL';
    setP(i, 'Label', lab);
    if (icon) setP(i, 'Icon', icon.id);
    if (ind === 'no') setP(i, 'Show leading', false);
  }
  groups.push(c);
}
const groupSet = figma.combineAsVariants(groups, section);
groupSet.name = 'Menu/Group';
const gSlots = mergeSlots(groupSet);
groupSet.editComponentProperty(gSlots.Items, {
  name: 'Items',
  description: 'The items of the group (MenuItem only, at least one).',
  preferredValues: [{ type: 'COMPONENT_SET', key: itemSet.key }],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const gLabel = groupSet.addComponentProperty('Label', 'TEXT', 'Share');
for (const v of groupSet.children)
  v.findOne((n) => n.name === 'Heading text').componentPropertyReferences = { characters: gLabel };
groupSet.description =
  'MenuGroup (overlays/menu, group): a labelled set of items. Heading in caption/md, color/content/secondary, padding space/control/padding-inline/sm × space/content/xs; skipped by the keyboard, it names the group. Indent=yes keeps a room of size/icon/sm + space/control/gap/sm before the heading so that it aligns with the labels of items that show a leading icon.';
groupSet.children.forEach((v, j) => {
  v.x = 24 + j * 272;
  v.y = 24;
});
groupSet.resizeWithoutConstraints(24 * 2 + 2 * 272 - 32, 24 * 2 + Math.max(...groupSet.children.map((v) => v.height)));
groupSet.x = sep.x;
groupSet.y = sep.y + sep.height + 40;
// Menu.
const menus = [];
for (const side of ['bottom', 'top'])
  for (const al of ['start', 'center', 'end']) {
    const c = figma.createComponent();
    c.name = `Side=${side}, Align=${al}`;
    c.layoutMode = 'VERTICAL';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.fills = [];
    c.clipsContent = false;
    c.counterAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX' }[al];
    bind(c, ['itemSpacing'], 'space/content/xs');
    const ts = c.createSlot();
    ts.name = 'Trigger';
    ts.fills = [];
    ts.clipsContent = false;
    ts.layoutMode = 'HORIZONTAL';
    ts.primaryAxisSizingMode = 'AUTO';
    ts.counterAxisSizingMode = 'AUTO';
    const tr = ibOutline.createInstance();
    ts.appendChild(tr);
    setP(tr, 'Icon', DOTS.id);
    setP(tr, 'Label', 'Report actions');
    const p = figma.createAutoLayout('VERTICAL', { name: 'Panel' });
    p.clipsContent = false;
    c.appendChild(p);
    if (side === 'top') c.insertChild(0, p);
    bind(p, PADS, 'space/content/xs');
    bind(p, RADII, 'radius/overlay');
    p.fills = [paint('color/surface/overlay', p)];
    p.strokes = [paint('color/elevation/border', p)];
    p.strokeAlign = 'INSIDE';
    bind(p, STROKES, 'border/width/default');
    p.strokesIncludedInLayout = false;
    p.setBoundVariable('maxWidth', V('size/overlay/panel'));
    await p.setEffectStyleIdAsync(shadow.id);
    const s = c.createSlot();
    s.name = 'Items';
    s.fills = [];
    s.clipsContent = false;
    s.layoutMode = 'VERTICAL';
    s.primaryAxisSizingMode = 'AUTO';
    s.counterAxisSizingMode = 'AUTO';
    p.appendChild(s);
    const add = (node) => {
      s.appendChild(node);
      node.layoutSizingHorizontal = 'FILL';
      return node;
    };
    const it = (lab, icon, short, intent = 'neutral', st = 'default') => {
      const i = add(itemSet.children.find((v) => v.name === `Intent=${intent}, State=${st}`).createInstance());
      setP(i, 'Label', lab);
      if (icon) setP(i, 'Icon', icon.id);
      else setP(i, 'Show leading', false);
      setP(i, 'Show trailing', !!short);
      return i;
    };
    it('Edit', PENCIL, true, 'neutral', 'hover');
    it('Duplicate', COPY, true);
    it('Archive', null, false, 'neutral', 'disabled');
    add(sep.createInstance());
    it('Delete', TRASH, false, 'danger');
    s.counterAxisSizingMode = 'FIXED';
    s.resize(220, s.height);
    s.counterAxisSizingMode = 'AUTO';
    menus.push(c);
  }
const menuSet = figma.combineAsVariants(menus, section);
menuSet.name = 'Menu';
const mSlots = mergeSlots(menuSet);
menuSet.editComponentProperty(mSlots.Trigger, {
  name: 'Trigger',
  description: 'Exactly one Button or IconButton: it opens the menu and exposes whether it is expanded.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: BTN.key },
    { type: 'COMPONENT_SET', key: IB.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
menuSet.editComponentProperty(mSlots.Items, {
  name: 'Items',
  description:
    'MenuItem, MenuSeparator and MenuGroup instances, in order; give the items the width of the panel (fill).',
  preferredValues: [
    { type: 'COMPONENT_SET', key: itemSet.key },
    { type: 'COMPONENT', key: sep.key },
    { type: 'COMPONENT_SET', key: groupSet.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
// Show trigger, off by default (user review of the Figma parity, 2026-11-04): the menu is placed under a control
// already in the design; switched on, the Trigger slot shows the placement.
const mTrig = menuSet.addComponentProperty('Show trigger', 'BOOLEAN', false);
for (const v of menuSet.children) {
  const sl = v.findChild((n) => n.type === 'SLOT' && n.name === 'Trigger');
  sl.componentPropertyReferences = { ...sl.componentPropertyReferences, visible: mTrig };
}
const mLabel = menuSet.addComponentProperty('Label', 'TEXT', ' ');
for (const v of menuSet.children) {
  const t = figma.createText();
  v.appendChild(t);
  t.textStyleId = style('label/md').id;
  t.characters = ' ';
  t.name = 'Menu name (not shown)';
  t.visible = false;
  t.componentPropertyReferences = { characters: mLabel };
}
menuSet.description =
  'Menu (overlays/menu): a short list of actions or links in a panel opened from a trigger (row actions, an account menu, a More button). Side (bottom, top) and Align (start, center, end) place the panel at space/content/xs from the trigger; the code flips and shifts it. Panel: color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs, as wide as its widest item up to size/overlay/panel. Items slot: MenuItem, MenuSeparator, MenuGroup. Keyboard navigation, typeahead, focus and closing are behaviors of the code. Label (hidden) names the menu when not empty.';
const mw = Math.max(...menuSet.children.map((v) => v.width));
const mh = Math.max(...menuSet.children.map((v) => v.height));
menuSet.children.forEach((v, j) => {
  v.x = 32 + (j % 3) * (mw + 48);
  v.y = 32 + Math.floor(j / 3) * (mh + 48);
});
menuSet.resizeWithoutConstraints(64 + 3 * mw + 96, 64 + 2 * mh + 48);
menuSet.x = 80;
menuSet.y = itemSet.y + itemSet.height + 80;
section.resizeWithoutConstraints(
  Math.max(menuSet.x + menuSet.width, groupSet.x + groupSet.width) + 80,
  Math.max(menuSet.y + menuSet.height, groupSet.y + groupSet.height) + 80
);
// The instance layers keep the code names (an instance takes the name of its main component, and the specification
// helpers split layer paths on '/').
const LAYER = { 'Menu/Item': 'MenuItem', 'Menu/Separator': 'MenuSeparator', 'Menu/Group': 'MenuGroup' };
for (const i of section.findAllWithCriteria({ types: ['INSTANCE'] })) if (LAYER[i.name]) i.name = LAYER[i.name];
return { section: section.id, item: itemSet.id, separator: sep.id, group: groupSet.id, menu: menuSet.id };
