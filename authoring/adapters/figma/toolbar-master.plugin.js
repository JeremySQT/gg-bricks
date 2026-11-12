// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Toolbar section of the Actions page (343:2): Toolbar/Separator and Toolbar (Orientation × Size).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:2');
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
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
await figma.loadFontAsync(style('label/md').fontName);
const IB = await figma.getNodeByIdAsync('211:1167');
const BTN = await figma.getNodeByIdAsync('48:1586');
const MENU = await figma.getNodeByIdAsync('437:795');
const G = {
  copy: '200:4794',
  pencil: '200:5394',
  trash: '200:5762',
  dots: '200:4868',
  bold: '200:5705',
  italic: '200:5715',
  underline: '200:5722',
  link: '200:5218'
};
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Toolbar');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Toolbar';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
// Toolbar/Separator: Orientation of the toolbar (a vertical line in a horizontal toolbar).
const seps = [];
for (const o of ['horizontal', 'vertical']) {
  const c = figma.createComponent();
  c.name = `Orientation=${o}`;
  c.fills = [];
  c.clipsContent = false;
  c.layoutMode = o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
  c.resize(o === 'horizontal' ? 9 : 40, o === 'horizontal' ? 40 : 9);
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  bind(c, o === 'horizontal' ? ['paddingLeft', 'paddingRight'] : ['paddingTop', 'paddingBottom'], 'space/content/xs');
  const l = figma.createFrame();
  l.name = 'Line';
  c.appendChild(l);
  l.fills = [paint('color/border/subtle', l)];
  if (o === 'horizontal') {
    bind(l, ['width'], 'border/width/default');
    l.layoutSizingVertical = 'FILL';
  } else {
    bind(l, ['height'], 'border/width/default');
    l.layoutSizingHorizontal = 'FILL';
  }
  seps.push(c);
}
const sepSet = figma.combineAsVariants(seps, section);
sepSet.name = 'Toolbar/Separator';
for (const v of sepSet.children) {
  v.primaryAxisSizingMode = 'AUTO';
  v.counterAxisSizingMode = 'FIXED';
}
sepSet.description =
  'Toolbar separator (actions/toolbar, child separator): a line of border/width/default in color/border/subtle between groups of controls, with space/content/xs on both sides, across the toolbar (set it to fill the toolbar height, or width when vertical). Skipped by the keyboard. Orientation is the toolbar orientation.';
sepSet.children.forEach((v, j) => {
  v.x = 24 + j * 60;
  v.y = 24;
});
sepSet.resizeWithoutConstraints(24 * 2 + 60 + 40, 24 * 2 + 40);
sepSet.fills = [];
sepSet.x = 80;
sepSet.y = 80;
const ib = (s, intent, glyph, label) => {
  const i = IB.children
    .find((x) => x.name === `Intent=${intent}, Appearance=ghost, Size=${s}, State=default`)
    .createInstance();
  setP(i, 'Icon', glyph);
  setP(i, 'Label', label);
  return i;
};
const btn = (s, label, app) => {
  const i = BTN.children
    .find((x) => x.name === `Intent=neutral, Appearance=${app}, Size=${s}, State=default`)
    .createInstance();
  setP(i, 'Label', label);
  return i;
};
const comps = [];
for (const o of ['horizontal', 'vertical'])
  for (const s of ['md', 'sm', 'lg']) {
    const c = figma.createComponent();
    c.name = `Orientation=${o}, Size=${s}`;
    c.fills = [];
    c.clipsContent = false;
    c.layoutMode = o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
    c.counterAxisAlignItems = o === 'horizontal' ? 'CENTER' : 'MIN';
    bind(c, ['itemSpacing'], `space/control/gap/${s}`);
    const sl = c.createSlot();
    sl.name = 'Items';
    sl.fills = [];
    sl.clipsContent = false;
    sl.layoutMode = o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
    sl.primaryAxisSizingMode = 'AUTO';
    sl.counterAxisSizingMode = 'AUTO';
    sl.counterAxisAlignItems = o === 'horizontal' ? 'CENTER' : 'MIN';
    bind(sl, ['itemSpacing'], `space/control/gap/${s}`);
    c.appendChild(sl);
    const add = (n) => {
      sl.appendChild(n);
      return n;
    };
    const sep = () => {
      const i = add(sepSet.children.find((v) => v.name === `Orientation=${o}`).createInstance());
      if (o === 'horizontal') i.layoutSizingVertical = 'FILL';
      else i.layoutSizingHorizontal = 'FILL';
    };
    if (o === 'horizontal') {
      add(ib(s, 'neutral', G.copy, 'Copy'));
      add(ib(s, 'neutral', G.pencil, 'Rename'));
      add(ib(s, 'danger', G.trash, 'Delete'));
      sep();
      add(btn(s, 'Download', 'ghost'));
      add(btn(s, 'Share', 'outline'));
    } else {
      add(ib(s, 'neutral', G.bold, 'Bold'));
      add(ib(s, 'neutral', G.italic, 'Italic'));
      add(ib(s, 'neutral', G.underline, 'Underline'));
      sep();
      add(ib(s, 'neutral', G.link, 'Link'));
    }
    // The controls clear the 44 px target reserved by their masters, so that the gaps separate the visible surfaces.
    for (const i of sl.children) if (i.type === 'INSTANCE' && !i.name.startsWith('Toolbar')) i.minHeight = null;
    const more = ib(s, 'neutral', G.dots, 'More actions');
    more.name = 'Overflow';
    c.appendChild(more);
    more.minHeight = null;
    more.visible = false;
    if (o === 'horizontal') {
      c.primaryAxisSizingMode = 'FIXED';
      c.counterAxisSizingMode = 'AUTO';
      c.resize(520, c.height);
    } else {
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
    }
    const nm = figma.createText();
    nm.textStyleId = style('label/md').id;
    nm.characters = 'Selection actions';
    nm.autoRename = false;
    nm.name = 'Label (accessible name, not shown)';
    c.appendChild(nm);
    nm.layoutPositioning = 'ABSOLUTE';
    nm.visible = false;
    comps.push(c);
  }
const set = figma.combineAsVariants(comps, section);
set.name = 'Toolbar';
for (const v of set.children) {
  const hz = v.name.includes('horizontal');
  v.primaryAxisSizingMode = hz ? 'FIXED' : 'AUTO';
  v.counterAxisSizingMode = 'AUTO';
}
const g = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children) v.findOne((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: g[0] };
for (const k of g.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(g[0], {
  name: 'Items',
  description:
    'Button, IconButton, Menu, Popover and Toolbar/Separator instances, in order, of the Toolbar size (the code imposes the size); no toggle buttons in v1. Clear the minimum height of the buttons so that the gaps separate the visible surfaces.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: IB.key },
    { type: 'COMPONENT_SET', key: BTN.key },
    { type: 'COMPONENT_SET', key: MENU.key },
    { type: 'COMPONENT_SET', key: sepSet.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const pOver = set.addComponentProperty('Show overflow', 'BOOLEAN', false);
const pLabel = set.addComponentProperty('Label', 'TEXT', 'Selection actions');
for (const v of set.children) {
  v.findChild((n) => n.name === 'Overflow').componentPropertyReferences = { visible: pOver };
  v.findChild((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: pLabel
  };
}
set.description =
  'Toolbar (actions/toolbar): a set of controls acting on the same context (selection actions, a text editor). Named by Label (required, not shown). Items in order, space/control/gap/{size} apart; Toolbar/Separator between groups. Orientation horizontal: one row that fills the width it is given (520 px by default, resize the instance); the controls that do not fit move, from the end, into an overflow Menu behind Overflow (an IconButton named overflowLabel: switch on Show overflow and remove the moved controls). Vertical: one column, as wide as its widest control. Roving focus (arrow keys) and the overflow measurement are behaviors of the code.';
set.children.forEach((v, j) => {
  v.x = 32 + (j % 3) * 600;
  v.y = 32 + Math.floor(j / 3) * 120;
});
set.resizeWithoutConstraints(64 + 3 * 600 - 60, 64 + 120 + Math.max(...set.children.map((v) => v.height)));
set.fills = [];
set.x = 80;
set.y = sepSet.y + sepSet.height + 80;
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 1.5 });
return {
  section: section.id,
  separator: sepSet.id,
  set: set.id,
  sizes: set.children.map((v) => [v.name, Math.round(v.width), Math.round(v.height)])
};
