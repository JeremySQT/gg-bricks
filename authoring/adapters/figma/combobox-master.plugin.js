// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Combobox section of the Forms page: the Combobox set (Size × Content × State), on the shared Listbox parts. Part 2
// renames and binds the Text and Placeholder layers (autoRename had named them after their characters).
// ---- Part 1: Remove Select check frame; build Combobox section and component set (Size × Content × State) ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1640');
await figma.setCurrentPageAsync(page);
const chk = await figma.getNodeByIdAsync('498:1290');
if (chk) chk.remove();
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
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/sm', 'body/md', 'body/lg', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/overlay');
const SEARCH = await figma.getNodeByIdAsync('200:5872');
const CARET = await figma.getNodeByIdAsync('200:4648');
const optSet = await figma.getNodeByIdAsync('496:1323');
const grp = await figma.getNodeByIdAsync('496:1324');
const emp = await figma.getNodeByIdAsync('496:1338');
const optOf = (s, st) => optSet.children.find((v) => v.name === `Size=${s}, State=${st}`);
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Combobox');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Combobox';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
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
const C = ['placeholder', 'text'];
const ST = ['default', 'hover', 'readonly', 'disabled', 'invalid'];
const comps = [];
for (const s of S)
  for (const content of C)
    for (const st of ST) {
      const c = figma.createComponent();
      c.name = `Size=${s}, Content=${content}, State=${st}`;
      c.layoutMode = 'VERTICAL';
      c.resize(240, 40);
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'FIXED';
      c.fills = [];
      c.clipsContent = false;
      bind(c, ['itemSpacing'], 'space/content/sm');
      c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
      const t = figma.createAutoLayout('HORIZONTAL', { name: 'Container' });
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
      const lead = slot('Leading', SEARCH, s, `color/input/${st}/placeholder`);
      t.appendChild(lead);
      lead.visible = false;
      const val = figma.createAutoLayout('HORIZONTAL', { name: 'Input' });
      val.fills = [];
      val.counterAxisAlignItems = 'CENTER';
      t.appendChild(val);
      val.layoutSizingHorizontal = 'FILL';
      bind(val, ['paddingLeft', 'paddingRight'], `space/control/label-inline/${s}`);
      const tx = figma.createText();
      tx.name = content === 'text' ? 'Text' : 'Placeholder';
      await tx.setTextStyleIdAsync(style(`body/${s}`).id);
      tx.characters = content === 'text' ? 'France' : 'Search a country';
      tx.fills = [paint(`color/input/${st}/${content === 'text' ? 'content' : 'placeholder'}`, tx)];
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
      const list =
        content === 'text'
          ? [
              ['France', 'selected-hover'],
              ['French Guiana', 'default'],
              ['French Polynesia', 'default']
            ]
          : [
              ['Belgium', 'hover'],
              ['France', 'default'],
              ['Germany', 'default'],
              ['Italy', 'disabled'],
              ['Spain', 'default']
            ];
      for (const [lab, os] of list) {
        const i = optOf(s, os).createInstance();
        sl.appendChild(i);
        i.layoutSizingHorizontal = 'FILL';
        setP(i, 'Label', lab);
      }
      p.visible = false;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, section);
set.name = 'Combobox';
for (const v of set.children) v.primaryAxisSizingMode = 'AUTO';
const g = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children)
  v.findOne((n) => n.type === 'SLOT' && n.name === 'Options').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(g[0], {
  name: 'Options',
  description:
    'The matching options (Listbox/Option, Listbox/Group) at the size of the Combobox, filling the panel; or Listbox/Empty when nothing matches. Typing highlights the first enabled match (hover).',
  preferredValues: [
    { type: 'COMPONENT_SET', key: optSet.key },
    { type: 'COMPONENT', key: grp.key },
    { type: 'COMPONENT', key: emp.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const TEXT = set.addComponentProperty('Text', 'TEXT', 'France');
const PH = set.addComponentProperty('Placeholder', 'TEXT', 'Search a country');
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Country');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
const OPEN = set.addComponentProperty('Open', 'BOOLEAN', false);
const LEAD = set.addComponentProperty('Show leading', 'BOOLEAN', false);
const LICON = set.addComponentProperty('Leading icon', 'INSTANCE_SWAP', SEARCH.id);
for (const v of set.children) {
  const t = v.findChild((n) => n.name === 'Container');
  const val = t.findOne((n) => n.name === 'Text');
  if (val) val.componentPropertyReferences = { characters: TEXT };
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
  if (!/State=(disabled|readonly)/.test(v.name))
    v.findChild((n) => n.name === 'Panel').componentPropertyReferences = { visible: OPEN };
}
for (const [icon, color] of glyphs)
  for (const gl of icon.findAll((n) => n.type === 'VECTOR')) gl.fills = [paint(color, gl)];
set.description =
  'Combobox (forms/combobox): one value chosen from a long list by typing to narrow it (a country, a person, a project); free text is not a value. Looks and sizes like an InputText of the same Size: Leading (optional decorative icon, Leading icon swap), Input (the Text in the content color, or the Placeholder while the text is empty) and Indicator (caret-down of size/icon/{size} in the placeholder color; a press toggles the list and keeps focus in the input). State mirrors the code conditions; Focus shows the ring and, on default and hover, the focus border; focus stays in the input while the list is open, so switch Focus on with Open. Open shows the Panel at space/content/sm under the field (color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs, at most size/overlay/list tall), as wide as the field. Options slot: the matching Listbox/Option and Listbox/Group at the same Size, or Listbox/Empty. A disabled or readonly combobox never opens. Filtering, keyboard, caret and placement are behaviors of the code.';
const GAP = 32,
  COL = 272,
  ROW = 88;
set.children.forEach((v, k) => {
  v.x = GAP + (k % ST.length) * COL;
  v.y = GAP + Math.floor(k / ST.length) * ROW;
});
set.resizeWithoutConstraints(GAP * 2 + ST.length * COL - 32, GAP * 2 + 6 * ROW - 48);
set.fills = [];
set.x = 80;
set.y = 80;
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
return {
  section: section.id,
  set: set.id,
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions),
  h: set.defaultVariant.height
};

// ---- Part 2: Rename and bind Combobox Text/Placeholder and verify Select placeholder bindings ----
const page = await figma.getNodeByIdAsync('343:1640');
await figma.setCurrentPageAsync(page);
const report = {};
for (const [id, field, valueName, valueProp] of [
  ['499:2549', 'Input', 'Text', 'Text'],
  ['497:2541', 'Value', 'Value text', 'Value']
]) {
  const set = await figma.getNodeByIdAsync(id);
  const defs = set.componentPropertyDefinitions;
  const key = (n) => Object.keys(defs).find((k) => k.split('#')[0] === n);
  let fixed = 0;
  for (const v of set.children) {
    const box = v.findOne((n) => n.type === 'FRAME' && n.name === field);
    const t = box.findChild((n) => n.type === 'TEXT');
    await figma.loadFontAsync(t.fontName);
    const isPh = v.name.includes('Content=placeholder');
    t.autoRename = false;
    t.name = isPh ? 'Placeholder' : valueName;
    t.componentPropertyReferences = { characters: key(isPh ? 'Placeholder' : valueProp) };
    fixed++;
  }
  report[set.name] = fixed;
}
return report;
