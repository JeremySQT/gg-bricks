// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Select section of the Forms page (343:1640). Part 1 builds the shared Listbox parts (Listbox/Option Size × State,
// Listbox/Group, Listbox/Empty); part 2 the Select set (Size × Content × State). After part 2, set primaryAxisSizingMode
// AUTO on every variant (resize() leaves it FIXED; part 2 of a rerun must do it, as combobox-master does) and name the
// value text after setting its characters (Figma renames a text layer after its content when autoRename is on).
// Instance layers in slots are renamed to the code names (Option, Group, Empty) for the specification helpers.
// ---- Part 1: Build Select section on Forms page: Listbox/Option, Listbox/Group, Listbox/Empty parts ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1640');
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
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/sm', 'body/md', 'body/lg', 'caption/md']) await figma.loadFontAsync(style(s).fontName);
const CHECK = await figma.getNodeByIdAsync('200:4715');
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Select');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Select';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
// Listbox/Option: Size × State.
const SIZES = ['md', 'sm', 'lg'];
const STATES = ['default', 'hover', 'selected', 'selected-hover', 'disabled'];
const opts = [];
for (const s of SIZES)
  for (const st of STATES) {
    const c = figma.createComponent();
    c.name = `Size=${s}, State=${st}`;
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
    const t = figma.createText();
    t.textStyleId = style(`body/${s}`).id;
    t.characters = 'France';
    t.name = 'Label';
    c.appendChild(t);
    t.fills = [paint(`color/item/${st}/content`, t)];
    t.layoutSizingHorizontal = 'FILL';
    t.textAutoResize = 'HEIGHT';
    t.textTruncation = 'ENDING';
    t.maxLines = 1;
    // Check keeps its room on every option; the glyph shows only on the selected option.
    const box = figma.createFrame();
    box.name = 'Check';
    box.fills = [];
    box.clipsContent = false;
    c.appendChild(box);
    bind(box, ['width', 'height'], 'size/icon/sm');
    const g = CHECK.createInstance();
    g.name = 'Check glyph';
    box.appendChild(g);
    g.x = 0;
    g.y = 0;
    bind(g, ['width', 'height'], 'size/icon/sm');
    g.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    for (const v of g.findAll((n) => n.type === 'VECTOR')) v.fills = [paint('color/item/indicator', v)];
    g.visible = st === 'selected' || st === 'selected-hover';
    opts.push(c);
  }
const optSet = figma.combineAsVariants(opts, section);
optSet.name = 'Listbox/Option';
const pLabel = optSet.addComponentProperty('Label', 'TEXT', 'France');
for (const v of optSet.children)
  v.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: pLabel };
optSet.description =
  'Option of a Select or a Combobox (forms/select and forms/combobox, child option; the two contracts define it identically). Size follows the Select or Combobox size (the label typography body/{size}); the box is the same at every size: min height size/control/sm, padding space/control/padding-inline/sm × space/control/padding-block/sm, gap space/control/gap/sm, radius/container. State: default, hover (the highlighted option, by pointer or keyboard; at most one), selected (the current value: check mark), selected-hover, disabled (listed and reachable, never chosen). Label in color/item/{state}/content, one line, truncated; the Check room (size/icon/sm) is kept on every option so that labels do not move; the check mark is color/item/indicator.';
optSet.children.forEach((v, j) => {
  v.x = 24 + (j % 5) * 272;
  v.y = 24 + Math.floor(j / 5) * 64;
});
optSet.resizeWithoutConstraints(24 * 2 + 5 * 272 - 32, 24 * 2 + 3 * 64 - 24);
optSet.x = 80;
optSet.y = 80;
const optOf = (s, st) => optSet.children.find((v) => v.name === `Size=${s}, State=${st}`);
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
// Listbox/Group: heading above the slot Options.
const grp = figma.createComponent();
grp.name = 'Listbox/Group';
section.appendChild(grp);
grp.layoutMode = 'VERTICAL';
grp.resize(240, 80);
grp.primaryAxisSizingMode = 'AUTO';
grp.counterAxisSizingMode = 'FIXED';
grp.fills = [];
grp.clipsContent = false;
const h = figma.createAutoLayout('HORIZONTAL', { name: 'Heading' });
h.fills = [];
grp.appendChild(h);
h.layoutSizingHorizontal = 'FILL';
bind(h, ['paddingLeft', 'paddingRight'], 'space/control/padding-inline/sm');
bind(h, ['paddingTop', 'paddingBottom'], 'space/content/xs');
const ht = figma.createText();
ht.textStyleId = style('caption/md').id;
ht.characters = 'Europe';
ht.name = 'Heading text';
h.appendChild(ht);
ht.fills = [paint('color/content/secondary', ht)];
ht.layoutSizingHorizontal = 'FILL';
ht.textAutoResize = 'HEIGHT';
const gs = grp.createSlot();
gs.name = 'Options';
gs.fills = [];
gs.clipsContent = false;
gs.layoutMode = 'VERTICAL';
gs.primaryAxisSizingMode = 'AUTO';
gs.counterAxisSizingMode = 'AUTO';
grp.appendChild(gs);
gs.layoutSizingHorizontal = 'FILL';
for (const [lab, st] of [
  ['Belgium', 'default'],
  ['France', 'selected']
]) {
  const i = optOf('md', st).createInstance();
  gs.appendChild(i);
  i.layoutSizingHorizontal = 'FILL';
  setP(i, 'Label', lab);
}
const gSlotKey = Object.keys(grp.componentPropertyDefinitions).find(
  (k) => grp.componentPropertyDefinitions[k].type === 'SLOT'
);
grp.editComponentProperty(gSlotKey, {
  name: 'Options',
  description: 'The options of the group (Listbox/Option, at least one), at the size of the Select or Combobox.',
  preferredValues: [{ type: 'COMPONENT_SET', key: optSet.key }],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const gLabel = grp.addComponentProperty('Heading', 'TEXT', 'Europe');
ht.componentPropertyReferences = { characters: gLabel };
grp.description =
  'Group of options of a Select or a Combobox (child group): consecutive options that share a group, under a heading in caption/md and color/content/secondary with padding space/control/padding-inline/sm × space/content/xs, aligned with the option labels. The heading is never highlighted or chosen; it names the group. A group without matching options is hidden (Combobox).';
grp.x = optSet.x + optSet.width + 80;
grp.y = optSet.y;
// Listbox/Empty: the empty state of the Combobox panel.
const emp = figma.createComponent();
emp.name = 'Listbox/Empty';
section.appendChild(emp);
emp.layoutMode = 'HORIZONTAL';
emp.resize(240, 32);
emp.primaryAxisSizingMode = 'FIXED';
emp.counterAxisSizingMode = 'AUTO';
emp.fills = [];
emp.clipsContent = false;
bind(emp, ['paddingLeft', 'paddingRight'], 'space/control/padding-inline/sm');
bind(emp, ['paddingTop', 'paddingBottom'], 'space/control/padding-block/sm');
const et = figma.createText();
et.textStyleId = style('body/md').id;
et.characters = 'No results';
et.name = 'Empty label';
emp.appendChild(et);
et.fills = [paint('color/content/secondary', et)];
et.layoutSizingHorizontal = 'FILL';
et.textAutoResize = 'HEIGHT';
const eLabel = emp.addComponentProperty('Label', 'TEXT', 'No results');
et.componentPropertyReferences = { characters: eLabel };
emp.description =
  'Empty state of a Combobox panel (part empty): shown instead of the list when no option matches. emptyLabel in typography/body/{size} (the Combobox size; md here, set the text style on the instance for sm and lg) and color/content/secondary, padding space/control/padding-inline/sm × space/control/padding-block/sm. Not an option, never highlighted; announced politely when it appears.';
emp.x = grp.x;
emp.y = grp.y + 200;
return {
  section: section.id,
  option: optSet.id,
  variants: optSet.children.length,
  defaultVariant: optSet.defaultVariant.name,
  group: grp.id,
  empty: emp.id,
  groupH: grp.height,
  optH: optOf('md', 'default').height
};

// ---- Part 2: Build Select component set (Size × Content × State) in Select section with field, focus ring, open panel slot ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1640');
await figma.setCurrentPageAsync(page);
const section = await figma.getNodeByIdAsync('496:1247');
const old = section.children.find((n) => n.type === 'COMPONENT_SET' && n.name === 'Select');
if (old) old.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const AC = cols.find((c) => c.name === 'Components');
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
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/sm', 'body/md', 'body/lg', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/overlay');
const GLOBE = await figma.getNodeByIdAsync('200:5046');
const CARET = await figma.getNodeByIdAsync('200:4648');
const optSet = await figma.getNodeByIdAsync('496:1323');
const grp = await figma.getNodeByIdAsync('496:1324');
const optOf = (s, st) => optSet.children.find((v) => v.name === `Size=${s}, State=${st}`);
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
const glyphs = [];
const slot = (name, glyph, s, color) => {
  const f = figma.createAutoLayout('HORIZONTAL', { name });
  f.fills = [];
  f.clipsContent = false;
  f.counterAxisAlignItems = 'CENTER';
  bind(f, ['paddingLeft', 'paddingRight'], `space/control/slot-inline/${s}`);
  const draw = figma.createAutoLayout('HORIZONTAL', { name: 'Drawing box' });
  draw.fills = [];
  draw.clipsContent = false;
  draw.primaryAxisAlignItems = 'CENTER';
  draw.counterAxisAlignItems = 'CENTER';
  f.appendChild(draw);
  draw.primaryAxisSizingMode = 'FIXED';
  draw.counterAxisSizingMode = 'FIXED';
  bind(draw, ['width'], 'input-text/icon-box');
  bind(draw, ['height'], `size/icon/${s}`);
  const icon = glyph.createInstance();
  icon.name = name + ' icon';
  draw.appendChild(icon);
  bind(icon, ['width', 'height'], `size/icon/${s}`);
  glyphs.push([icon, color]);
  return f;
};
const S = ['md', 'sm', 'lg'];
const C = ['placeholder', 'value'];
const ST = ['default', 'hover', 'readonly', 'disabled', 'invalid'];
const comps = [];
for (const s of S)
  for (const content of C)
    for (const st of ST) {
      const c = figma.createComponent();
      c.name = `Size=${s}, Content=${content}, State=${st}`;
      c.layoutMode = 'VERTICAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'FIXED';
      c.resize(240, 40);
      c.fills = [];
      c.clipsContent = false;
      bind(c, ['itemSpacing'], 'space/content/sm');
      c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
      // Trigger: the visible field.
      const t = figma.createAutoLayout('HORIZONTAL', { name: 'Trigger' });
      t.clipsContent = false;
      t.counterAxisAlignItems = 'CENTER';
      t.itemSpacing = 0;
      c.appendChild(t);
      t.layoutSizingHorizontal = 'FILL';
      t.primaryAxisSizingMode = 'FIXED';
      t.counterAxisSizingMode = 'FIXED';
      bind(t, ['height'], `size/control/${s}`);
      bind(t, ['paddingLeft', 'paddingRight'], `space/control/edge-inline/${s}`);
      t.fills = [paint(`color/input/${st}/surface`, t)];
      t.strokes = [paint(`color/input/${st}/border`, t)];
      t.strokeAlign = 'INSIDE';
      t.strokesIncludedInLayout = false;
      bind(t, STROKES, 'border/width/default');
      bind(t, RADII, 'radius/control');
      const lead = slot('Leading', GLOBE, s, `color/input/${st}/placeholder`);
      t.appendChild(lead);
      lead.visible = false;
      const val = figma.createAutoLayout('HORIZONTAL', { name: 'Value' });
      val.fills = [];
      val.counterAxisAlignItems = 'CENTER';
      t.appendChild(val);
      val.layoutSizingHorizontal = 'FILL';
      bind(val, ['paddingLeft', 'paddingRight'], `space/control/label-inline/${s}`);
      const tx = figma.createText();
      tx.name = content === 'value' ? 'Value text' : 'Placeholder';
      await tx.setTextStyleIdAsync(style(`body/${s}`).id);
      tx.characters = content === 'value' ? 'France' : 'Choose a country';
      tx.fills = [paint(`color/input/${st}/${content === 'value' ? 'content' : 'placeholder'}`, tx)];
      val.appendChild(tx);
      tx.layoutSizingHorizontal = 'FILL';
      tx.textAutoResize = 'HEIGHT';
      tx.textTruncation = 'ENDING';
      tx.maxLines = 1;
      const ind = slot('Indicator', CARET, s, `color/input/${st}/placeholder`);
      t.appendChild(ind);
      if (st === 'default' || st === 'hover') {
        const fb = figma.createFrame();
        fb.name = 'Focus border';
        fb.fills = [];
        t.appendChild(fb);
        fb.layoutPositioning = 'ABSOLUTE';
        fb.x = 0;
        fb.y = 0;
        fb.resize(t.width, t.height);
        fb.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
        fb.strokes = [paint('color/input/focus/border', fb)];
        fb.strokeAlign = 'INSIDE';
        bind(fb, STROKES, 'border/width/default');
        bind(fb, RADII, 'radius/control');
        fb.visible = false;
      }
      const ring = figma.createFrame();
      ring.name = 'Focus ring';
      ring.fills = [];
      t.appendChild(ring);
      ring.layoutPositioning = 'ABSOLUTE';
      ring.x = -2;
      ring.y = -2;
      ring.resize(t.width + 4, t.height + 4);
      ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      ring.strokes = [paint('color/focus/ring', ring)];
      ring.strokeAlign = 'OUTSIDE';
      bind(ring, STROKES, 'focus/width');
      bind(ring, RADII, 'radius/focus');
      ring.visible = false;
      const target = figma.createFrame();
      target.name = 'Target';
      target.fills = [];
      t.appendChild(target);
      target.layoutPositioning = 'ABSOLUTE';
      bind(target, ['height'], 'size/target/min');
      target.resize(t.width, target.height);
      target.x = 0;
      target.y = (t.height - target.height) / 2;
      target.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      const name = figma.createText();
      name.name = 'Label (accessible name, not shown)';
      await name.setTextStyleIdAsync(style('label/md').id);
      name.characters = 'Country';
      t.appendChild(name);
      name.layoutPositioning = 'ABSOLUTE';
      name.visible = false;
      // Panel (shown by Open): the list of options under the field at space/content/sm.
      const p = figma.createAutoLayout('VERTICAL', { name: 'Panel' });
      p.clipsContent = true;
      c.appendChild(p);
      p.layoutSizingHorizontal = 'FILL';
      bind(p, PADS, 'space/content/xs');
      bind(p, RADII, 'radius/overlay');
      p.fills = [paint('color/surface/overlay', p)];
      p.strokes = [paint('color/elevation/border', p)];
      p.strokeAlign = 'INSIDE';
      bind(p, STROKES, 'border/width/default');
      p.strokesIncludedInLayout = false;
      p.setBoundVariable('maxHeight', V('size/overlay/list'));
      await p.setEffectStyleIdAsync(shadow.id);
      const sl = c.createSlot();
      sl.name = 'Options';
      sl.fills = [];
      sl.clipsContent = false;
      sl.layoutMode = 'VERTICAL';
      sl.primaryAxisSizingMode = 'AUTO';
      sl.counterAxisSizingMode = 'AUTO';
      p.appendChild(sl);
      sl.layoutSizingHorizontal = 'FILL';
      for (const [lab, os] of [
        ['Belgium', 'default'],
        ['France', content === 'value' ? 'selected' : 'default'],
        ['Germany', 'hover'],
        ['Italy', 'disabled'],
        ['Spain', 'default']
      ]) {
        const i = optOf(s, os).createInstance();
        sl.appendChild(i);
        i.layoutSizingHorizontal = 'FILL';
        setP(i, 'Label', lab);
      }
      p.visible = false;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, section);
set.name = 'Select';
// Merge the Options slots into one property.
const g = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children)
  v.findOne((n) => n.type === 'SLOT' && n.name === 'Options').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(g[0], {
  name: 'Options',
  description:
    'Listbox/Option and Listbox/Group instances in order, at the size of the Select (fill the panel width). Mark the current value selected and at most one option hover (highlighted).',
  preferredValues: [
    { type: 'COMPONENT_SET', key: optSet.key },
    { type: 'COMPONENT', key: grp.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const VALUE = set.addComponentProperty('Value', 'TEXT', 'France');
const PH = set.addComponentProperty('Placeholder', 'TEXT', 'Choose a country');
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Country');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
const OPEN = set.addComponentProperty('Open', 'BOOLEAN', false);
const LEAD = set.addComponentProperty('Show leading', 'BOOLEAN', false);
const LICON = set.addComponentProperty('Leading icon', 'INSTANCE_SWAP', GLOBE.id);
for (const v of set.children) {
  const t = v.findChild((n) => n.name === 'Trigger');
  const val = t.findOne((n) => n.name === 'Value text');
  if (val) val.componentPropertyReferences = { characters: VALUE };
  const ph = t.findOne((n) => n.name === 'Placeholder');
  if (ph) ph.componentPropertyReferences = { characters: PH };
  t.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
  t.findChild((n) => n.name === 'Leading').componentPropertyReferences = { visible: LEAD };
  t.findChild((n) => n.name === 'Leading').findOne((n) => n.name === 'Leading icon').componentPropertyReferences = {
    mainComponent: LICON
  };
  if (!v.name.includes('State=disabled'))
    t.findChild((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
  const fb = t.findChild((n) => n.name === 'Focus border');
  if (fb) fb.componentPropertyReferences = { visible: FOCUS };
  // A disabled or readonly select never opens.
  if (!/State=(disabled|readonly)/.test(v.name))
    v.findChild((n) => n.name === 'Panel').componentPropertyReferences = { visible: OPEN };
}
for (const [icon, color] of glyphs)
  for (const gl of icon.findAll((n) => n.type === 'VECTOR')) gl.fills = [paint(color, gl)];
set.description =
  'Select (forms/select): one value from a list of options, shown collapsed in a field. The trigger looks and sizes like an InputText of the same Size: Leading (optional decorative icon, Leading icon swap), Value (the selected option label, or the Placeholder in the placeholder color while no option matches) and Indicator (caret-down of size/icon/{size} in the placeholder color, decorative). State mirrors the code conditions; Focus shows the ring (whatever the modality) and, on default and hover, the focus border; the trigger keeps focus while the list is open, so switch Focus on with Open. Open shows the Panel at space/content/sm under the field (color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs, at most size/overlay/list tall: the options scroll beyond, a behavior of the code), as wide as the field (the code widens it for a long label up to size/overlay/panel). Options slot: Listbox/Option and Listbox/Group at the same Size. Label is the accessible name when no Field names it (not shown). A disabled or readonly select never opens. Keyboard, typeahead, placement (flip, shift) and scrolling are behaviors of the code.';
const GAP = 32,
  COL = 272,
  ROW = 88;
set.children.forEach((v, k) => {
  v.x = GAP + (k % ST.length) * COL;
  v.y = GAP + Math.floor(k / ST.length) * ROW;
});
set.resizeWithoutConstraints(GAP * 2 + ST.length * COL - 32, GAP * 2 + 6 * ROW - 48);
set.fills = [];
const optSetNode = optSet;
set.x = 80;
set.y = optSetNode.y + optSetNode.height + 80;
section.resizeWithoutConstraints(Math.max(set.x + set.width, grp.x + grp.width) + 80, set.y + set.height + 80);
return {
  set: set.id,
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions),
  triggerH: set.defaultVariant.children[0].height
};
