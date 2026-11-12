// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Tabs section of the Navigation page (495:16): Tabs/Trigger and Tabs/Vertical trigger (Appearance × Size × State,
// 24 variants each), then the Tabs set (Appearance × Orientation × Size) with the Tabs and Panel slots.
// ---- Part 1: Build Tabs section on Navigation page: Tabs/Trigger and Tabs/Vertical trigger sets (Appearance × Size × State) ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
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
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['label/sm', 'label/md', 'label/lg']) await figma.loadFontAsync(style(s).fontName);
const raised = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/raised');
const GEAR = await figma.getNodeByIdAsync('200:5078');
const nested = await figma.getNodeByIdAsync('278:261');
const counterNested = nested.children.find((c) => c.name === 'Overflow=false');
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Tabs');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Tabs';
  page.appendChild(section);
  section.x = 0;
  section.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const A = ['contained', 'line'];
const S = ['md', 'sm', 'lg'];
const ST = ['selected', 'default', 'hover', 'disabled'];
const content = (a, st) =>
  st === 'disabled'
    ? 'color/item/disabled/content'
    : st === 'hover'
      ? 'color/item/hover/content'
      : a === 'line' && st === 'default'
        ? 'color/content/secondary'
        : 'color/item/default/content';
const surface = (a, st) =>
  a === 'contained' && st === 'selected'
    ? 'color/surface/overlay'
    : `color/item/${st === 'selected' ? 'default' : st}/surface`;
const glyphs = [];
const build = (orientation) => {
  const comps = [];
  for (const a of A)
    for (const s of S)
      for (const st of ST) {
        const c = figma.createComponent();
        c.name = `Appearance=${a}, Size=${s}, State=${st}`;
        c.layoutMode = 'HORIZONTAL';
        c.resize(orientation === 'vertical' ? 200 : 120, 40);
        c.primaryAxisSizingMode = orientation === 'vertical' ? 'FIXED' : 'AUTO';
        c.counterAxisSizingMode = 'AUTO';
        c.primaryAxisAlignItems = orientation === 'vertical' ? 'MIN' : 'CENTER';
        c.counterAxisAlignItems = 'CENTER';
        c.clipsContent = false;
        c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
        bind(c, ['minHeight'], `size/control/${s}`);
        bind(c, ['paddingLeft', 'paddingRight'], `space/control/padding-inline/${s}`);
        bind(c, ['itemSpacing'], `space/control/gap/${s}`);
        bind(c, RADII, a === 'contained' ? 'radius/container' : 'radius/control');
        c.fills = [paint(surface(a, st), c)];
        if (a === 'contained' && st === 'selected') {
          c.strokes = [paint('color/elevation/border', c)];
          c.strokeAlign = 'INSIDE';
          c.strokesIncludedInLayout = false;
          bind(c, STROKES, 'border/width/default');
          c.effectStyleId = raised.id;
        }
        const lead = figma.createAutoLayout('HORIZONTAL', { name: 'Leading' });
        lead.fills = [];
        lead.clipsContent = false;
        lead.primaryAxisAlignItems = 'CENTER';
        lead.counterAxisAlignItems = 'CENTER';
        c.appendChild(lead);
        lead.primaryAxisSizingMode = 'FIXED';
        lead.counterAxisSizingMode = 'FIXED';
        bind(lead, ['width'], 'input-text/icon-box');
        bind(lead, ['height'], `size/icon/${s}`);
        const icon = GEAR.createInstance();
        icon.name = 'Leading icon';
        lead.appendChild(icon);
        bind(icon, ['width', 'height'], `size/icon/${s}`);
        glyphs.push([icon, content(a, st)]);
        lead.visible = false;
        const t = figma.createText();
        t.textStyleId = style(`label/${s}`).id;
        t.characters = 'General';
        t.autoRename = false;
        t.name = 'Label';
        c.appendChild(t);
        t.fills = [paint(content(a, st), t)];
        const tr = c.createSlot();
        tr.name = 'Trailing';
        tr.fills = [];
        tr.clipsContent = false;
        tr.layoutMode = 'HORIZONTAL';
        tr.primaryAxisSizingMode = 'AUTO';
        tr.counterAxisSizingMode = 'AUTO';
        tr.counterAxisAlignItems = 'CENTER';
        c.appendChild(tr);
        const cn = counterNested.createInstance();
        tr.appendChild(cn);
        tr.visible = false;
        if (a === 'line') {
          const ind = figma.createFrame();
          ind.name = 'Indicator';
          c.appendChild(ind);
          ind.layoutPositioning = 'ABSOLUTE';
          ind.fills = [paint('color/item/indicator', ind)];
          if (orientation === 'vertical') {
            bind(ind, ['width'], 'border/width/strong');
            ind.resize(ind.width, c.height);
            ind.x = c.width - 1;
            ind.y = 0;
            ind.constraints = { horizontal: 'MAX', vertical: 'STRETCH' };
          } else {
            bind(ind, ['height'], 'border/width/strong');
            ind.resize(c.width, ind.height);
            ind.x = 0;
            ind.y = c.height - ind.height;
            ind.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
          }
          ind.visible = st === 'selected';
        }
        if (st !== 'disabled') {
          const ring = figma.createFrame();
          ring.name = 'Focus ring';
          ring.fills = [];
          c.appendChild(ring);
          ring.layoutPositioning = 'ABSOLUTE';
          ring.x = -2;
          ring.y = -2;
          ring.resize(c.width + 4, c.height + 4);
          ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
          ring.strokes = [paint('color/focus/ring', ring)];
          ring.strokeAlign = 'OUTSIDE';
          bind(ring, STROKES, 'focus/width');
          bind(ring, RADII, 'radius/focus');
          ring.visible = false;
        }
        comps.push(c);
      }
  const set = figma.combineAsVariants(comps, section);
  set.name = orientation === 'vertical' ? 'Tabs/Vertical trigger' : 'Tabs/Trigger';
  for (const v of set.children) {
    v.primaryAxisSizingMode = orientation === 'vertical' ? 'FIXED' : 'AUTO';
    v.counterAxisSizingMode = 'AUTO';
  }
  const g = Object.entries(set.componentPropertyDefinitions)
    .filter(([, d]) => d.type === 'SLOT')
    .map(([k]) => k);
  for (const v of set.children)
    v.findOne((n) => n.type === 'SLOT' && n.name === 'Trailing').componentPropertyReferences = { slotContentId: g[0] };
  for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
  const LABEL = set.addComponentProperty('Label', 'TEXT', 'General');
  const LEAD = set.addComponentProperty('Show leading', 'BOOLEAN', false);
  const TRAIL = set.addComponentProperty('Show trailing', 'BOOLEAN', false);
  const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
  const ICON = set.addComponentProperty('Leading icon', 'INSTANCE_SWAP', GEAR.id);
  for (const v of set.children) {
    v.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
    v.findChild((n) => n.name === 'Leading').componentPropertyReferences = { visible: LEAD };
    v.findChild((n) => n.name === 'Leading').findChild((n) => n.name === 'Leading icon').componentPropertyReferences = {
      mainComponent: ICON
    };
    const sl = v.findChild((n) => n.type === 'SLOT');
    sl.componentPropertyReferences = { ...sl.componentPropertyReferences, visible: TRAIL };
    const ring = v.findChild((n) => n.name === 'Focus ring');
    if (ring) ring.componentPropertyReferences = { visible: FOCUS };
  }
  return { set, slot: g[0] };
};
const H = build('horizontal');
const Vt = build('vertical');
const counterSet = await figma.getNodeByIdAsync('149:1568');
const badgeSet = await figma.getNodeByIdAsync('220:293');
for (const { set, slot } of [H, Vt]) {
  set.editComponentProperty(slot, {
    name: 'Trailing',
    description: 'One Counter or Badge of the Tabs size (a Counter that follows the size is in place).',
    preferredValues: [
      { type: 'COMPONENT_SET', key: nested.key },
      { type: 'COMPONENT_SET', key: counterSet.key },
      { type: 'COMPONENT_SET', key: badgeSet.key }
    ],
    slotSettings: { minChildren: 0, maxChildren: 1, allowPreferredValuesOnly: true }
  });
}
for (const [icon, color] of glyphs)
  for (const gl of icon.findAll((n) => n.type === 'VECTOR')) gl.fills = [paint(color, gl)];
const common =
  'State selected is the current tab: contained, raised (color/surface/overlay, edge color/elevation/border of border/width/default, shadow/raised, radius/container); line, the Indicator (color/item/indicator, border/width/strong) on the edge that faces the panels. default and hover are unselected tabs (hover: color/item/hover/surface behind the tab); disabled is never selected or focused. Labels: contained, color/item/default/content (hover: color/item/hover/content); line, color/content/secondary when idle, color/item/default/content when selected. Size: min height size/control/{size}, padding space/control/padding-inline/{size}, gap space/control/gap/{size}, label/{size}, icon size/icon/{size}. Leading: a decorative icon (Leading icon swap); Trailing: a Counter or Badge of the same size. Focus shows the ring (focus/width, color/focus/ring, radius/focus, outside) for the keyboard.';
H.set.description =
  'Tab of a horizontal Tabs list (navigation/tabs, child trigger). ' +
  common +
  ' Content is centered; in a contained list the tabs share the width equally (set them to fill).';
Vt.set.description =
  'Tab of a vertical Tabs list (navigation/tabs, child trigger, orientation vertical): as wide as the list, content aligned at the start; the line Indicator sits on the inline end, over the list line. ' +
  common;
const lay = (set, col, row) => {
  set.children.forEach((v, k) => {
    v.x = 24 + (k % 4) * col;
    v.y = 24 + Math.floor(k / 4) * row;
  });
  set.resizeWithoutConstraints(24 * 2 + 4 * col - 32, 24 * 2 + 6 * row - 32);
  set.fills = [];
};
lay(H.set, 152, 80);
lay(Vt.set, 232, 80);
H.set.x = 80;
H.set.y = 80;
Vt.set.x = H.set.x + H.set.width + 80;
Vt.set.y = 80;
section.resizeWithoutConstraints(Vt.set.x + Vt.set.width + 80, H.set.y + H.set.height + 80);
return {
  section: section.id,
  trigger: H.set.id,
  vertical: Vt.set.id,
  n: [H.set.children.length, Vt.set.children.length],
  def: H.set.defaultVariant.name,
  props: Object.keys(H.set.componentPropertyDefinitions),
  hMd: H.set.defaultVariant.height,
  wMd: H.set.defaultVariant.width
};

// ---- Part 2: Build Tabs component set (Appearance × Orientation × Size) with Tabs and Panel slots ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const section = await figma.getNodeByIdAsync('501:2');
const old = section.children.find((n) => n.type === 'COMPONENT_SET' && n.name === 'Tabs');
if (old) old.remove();
const vars = await figma.variables.getLocalVariablesAsync();
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
const PADS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['body/md', 'label/sm', 'label/md', 'label/lg']) await figma.loadFontAsync(style(s).fontName);
const H = await figma.getNodeByIdAsync('501:249');
const VT = await figma.getNodeByIdAsync('501:496');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
const comps = [];
for (const a of ['contained', 'line'])
  for (const o of ['horizontal', 'vertical'])
    for (const s of ['md', 'sm', 'lg']) {
      const c = figma.createComponent();
      c.name = `Appearance=${a}, Orientation=${o}, Size=${s}`;
      c.layoutMode = o === 'horizontal' ? 'VERTICAL' : 'HORIZONTAL';
      c.resize(o === 'horizontal' ? 400 : 560, 120);
      c.primaryAxisSizingMode = o === 'horizontal' ? 'AUTO' : 'FIXED';
      c.counterAxisSizingMode = o === 'horizontal' ? 'FIXED' : 'AUTO';
      c.counterAxisAlignItems = 'MIN';
      c.fills = [];
      c.clipsContent = false;
      bind(c, ['itemSpacing'], 'space/content/lg');
      const bar = figma.createAutoLayout(o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL', { name: 'Bar' });
      bar.clipsContent = false;
      bar.fills = [];
      c.appendChild(bar);
      if (o === 'horizontal') {
        bar.layoutSizingHorizontal = 'FILL';
        bar.layoutSizingVertical = 'HUG';
      } else {
        bar.primaryAxisSizingMode = 'AUTO';
        bar.counterAxisSizingMode = 'FIXED';
        bar.resize(200, bar.height);
      }
      if (a === 'contained') {
        bind(bar, PADS, 'space/content/xs');
        bind(bar, RADII, 'radius/overlay');
        bar.fills = [paint('color/surface/inset', bar)];
      }
      const sl = c.createSlot();
      sl.name = 'Tabs';
      sl.fills = [];
      sl.clipsContent = false;
      sl.layoutMode = o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
      sl.primaryAxisSizingMode = 'AUTO';
      sl.counterAxisSizingMode = 'AUTO';
      bind(sl, ['itemSpacing'], 'space/content/xs');
      bar.appendChild(sl);
      if (o === 'horizontal') {
        sl.layoutSizingHorizontal = a === 'contained' ? 'FILL' : 'HUG';
      } else {
        sl.layoutSizingHorizontal = 'FILL';
        if (a === 'line') bind(bar, ['paddingRight'], 'border/width/default');
      }
      const set = o === 'horizontal' ? H : VT;
      for (const [lab, st] of [
        ['General', 'selected'],
        ['Members', 'default'],
        ['Security', 'default']
      ]) {
        const i = set.children.find((v) => v.name === `Appearance=${a}, Size=${s}, State=${st}`).createInstance();
        sl.appendChild(i);
        setP(i, 'Label', lab);
        if (o === 'vertical' || a === 'contained') i.layoutSizingHorizontal = 'FILL';
      }
      if (a === 'line') {
        const line = figma.createFrame();
        line.name = 'Line';
        bar.insertChild(0, line);
        line.layoutPositioning = 'ABSOLUTE';
        line.fills = [paint('color/border/subtle', line)];
        if (o === 'horizontal') {
          bind(line, ['height'], 'border/width/default');
          line.resize(bar.width, line.height);
          line.x = 0;
          line.y = bar.height - line.height;
          line.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
        } else {
          bind(line, ['width'], 'border/width/default');
          line.resize(line.width, bar.height);
          line.x = bar.width - line.width;
          line.y = 0;
          line.constraints = { horizontal: 'MAX', vertical: 'STRETCH' };
        }
      }
      const ps = c.createSlot();
      ps.name = 'Panel';
      ps.fills = [];
      ps.clipsContent = false;
      ps.layoutMode = 'VERTICAL';
      ps.primaryAxisSizingMode = 'AUTO';
      ps.counterAxisSizingMode = 'AUTO';
      c.appendChild(ps);
      ps.layoutSizingHorizontal = 'FILL';
      const t = figma.createText();
      t.textStyleId = style('body/md').id;
      t.characters = 'General settings of the workspace: name, language and time zone.';
      t.autoRename = false;
      t.name = 'Panel content';
      ps.appendChild(t);
      t.fills = [paint('color/content/primary', t)];
      t.layoutSizingHorizontal = 'FILL';
      t.textAutoResize = 'HEIGHT';
      // Hidden accessible name of the list.
      const nm = figma.createText();
      nm.textStyleId = style('label/md').id;
      nm.characters = 'Settings';
      nm.autoRename = false;
      nm.name = 'Label (accessible name, not shown)';
      c.appendChild(nm);
      nm.layoutPositioning = 'ABSOLUTE';
      nm.visible = false;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, section);
set.name = 'Tabs';
for (const v of set.children) {
  const hz = v.name.includes('horizontal');
  v.primaryAxisSizingMode = hz ? 'AUTO' : 'FIXED';
  v.counterAxisSizingMode = hz ? 'FIXED' : 'AUTO';
}
const merge = (nm) => {
  const g = Object.entries(set.componentPropertyDefinitions)
    .filter(([k, d]) => d.type === 'SLOT' && k.split('#')[0] === nm)
    .map(([k]) => k);
  for (const v of set.children)
    v.findOne((n) => n.type === 'SLOT' && n.name === nm).componentPropertyReferences = { slotContentId: g[0] };
  for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
  return g[0];
};
const kT = merge('Tabs');
const kP = merge('Panel');
set.editComponentProperty(kT, {
  name: 'Tabs',
  description:
    'The tabs in order: Tabs/Trigger (horizontal) or Tabs/Vertical trigger (vertical) of the same Appearance and Size; exactly one selected. In a contained horizontal list set each tab to fill, so that they share the width.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: H.key },
    { type: 'COMPONENT_SET', key: VT.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
set.editComponentProperty(kP, {
  name: 'Panel',
  description: 'The content of the selected tab (free content).',
  slotSettings: { minChildren: 0 }
});
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Settings');
for (const v of set.children)
  v.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
set.description =
  'Tabs (navigation/tabs): one of several panels of related content shown in the same place, with a list of tabs to switch between them. Appearance contained (the default): the list is a container in color/surface/inset with radius/overlay corners and space/content/xs padding, the selected tab raised; in a horizontal list it fills the width it is given and the tabs share it equally (the code keeps each tab at least as wide as its content). Appearance line: the tabs sit on a line of border/width/default in color/border/subtle, the selected tab marked by its indicator. Tabs are space/content/xs apart in both appearances. Orientation horizontal: list above the panel, space/content/lg between them; vertical: list at the inline start, every tab as wide as the list (set the list width on the Bar). Size sets the tabs size. Label (hidden) names the list. Overflow scrolling with faded edges and scroll buttons, roving focus, activation and the panel switch are behaviors of the code.';
const W = Math.max(...set.children.map((v) => v.width)),
  Hh = Math.max(...set.children.map((v) => v.height));
set.children.forEach((v, k) => {
  v.x = 32 + (k % 3) * 600;
  v.y = 32 + Math.floor(k / 3) * (Hh + 48);
});
set.resizeWithoutConstraints(64 + 3 * 600 - 40, 64 + 4 * (Hh + 48) - 48);
set.fills = [];
set.x = 80;
set.y = H.y + H.height + 80;
section.resizeWithoutConstraints(Math.max(set.x + set.width, VT.x + VT.width) + 80, set.y + set.height + 80);
return {
  set: set.id,
  n: set.children.length,
  def: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions),
  sizes: set.children.slice(0, 6).map((v) => [v.name, Math.round(v.width), Math.round(v.height)])
};

// ---- Part 3: the Tabs master becomes the tab list only (2026-11-12, user review of the Figma parity) ----
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync('502:530');
const kPanel = Object.keys(set.componentPropertyDefinitions).find((k) => k.split('#')[0] === 'Panel');
const res = [];
for (const v of set.children) {
  const p = v.findChild((n) => n.type === 'SLOT' && n.name === 'Panel');
  if (p) p.remove();
  v.setBoundVariable('itemSpacing', null);
  v.itemSpacing = 0;
  const hz = v.name.includes('horizontal');
  if (hz) {
    v.primaryAxisSizingMode = 'AUTO';
    v.counterAxisSizingMode = 'FIXED';
  } else {
    v.primaryAxisSizingMode = 'AUTO';
    v.counterAxisSizingMode = 'AUTO';
  }
  res.push([v.name, Math.round(v.width), Math.round(v.height)]);
}
if (kPanel && set.componentPropertyDefinitions[kPanel]) set.deleteComponentProperty(kPanel);
set.description =
  'Tabs (navigation/tabs): the list of tabs that switches between panels of related content shown in the same place. In Figma the component is the tab list only (user decision, 2026-11-12): place the content of the selected tab yourself, space/content/lg below the list (after it when vertical); the code renders the panels and links them to the tabs. Appearance contained (the default): the list is a container in color/surface/inset with radius/overlay corners and space/content/xs padding, the selected tab raised; in a horizontal list it fills the width it is given and the tabs share it equally (the code keeps each tab at least as wide as its content). Appearance line: the tabs sit on a line of border/width/default in color/border/subtle, the selected tab marked by its indicator. Tabs are space/content/xs apart in both appearances. Orientation vertical: every tab as wide as the list (set the list width on the instance). Size sets the tabs size. Label (hidden) names the list. Overflow scrolling with faded edges and scroll buttons, roving focus and activation are behaviors of the code.';
// Re-lay the set: the variants are shorter now.
const Hh = Math.max(...set.children.map((v) => v.height));
set.children.forEach((v, k) => {
  v.x = 32 + (k % 3) * 600;
  v.y = 32 + Math.floor(k / 3) * (Hh + 48);
});
set.resizeWithoutConstraints(64 + 3 * 600 - 40, 64 + 4 * (Hh + 48) - 48);
await set.screenshot({ scale: 1 });
return { res, props: Object.keys(set.componentPropertyDefinitions) };
