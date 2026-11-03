// Dialog master builder (use_figma body), 2026-11-03.
// On the Overlays library page (407:119), section Dialog: the set “Dialog” (Size md, sm, lg × Scrolled no, yes; 6
// variants) and the internal part _Dialog/Backdrop. Panel: a vertical auto layout bound to
// component/dialog/inline-size/{size}, padding space/layout/md, gap space/content/lg, radius/overlay, color/surface/
// overlay with an inside edge color/elevation/border and the effect style shadow/modal, clipping. Header: Heading (Title
// heading/sm color/content/primary, Description body/sm color/content/secondary, gap space/content/xs) and the Close box
// as tall as the title line with the IconButton sm neutral ghost (close glyph, label Close). Slots Body (a body/md text)
// and Footer (a ButtonGroup md aligned at the end: Cancel neutral outline, then Delete danger solid, the primary action
// last). Scrolled=yes adds the dividers (color/border/subtle, border/width/default) around the body. Properties Title,
// Description, Show description, Dismissible, Show footer. _Dialog/Backdrop: a 1280 × 800 frame in color/surface/scrim
// with the slot Dialog centered and padding space/layout/md. Rerunning replaces both.
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
for (const s of ['heading/sm', 'body/sm', 'body/md', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const modal = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/modal');
const X = await figma.getNodeByIdAsync('200:4368');
const IB = await figma.getNodeByIdAsync('211:1167');
const BG = await figma.getNodeByIdAsync('419:2913');
const BTN = await figma.getNodeByIdAsync('48:1586');
const ibSm = IB.children.find(
  (c) =>
    /Intent=neutral/.test(c.name) &&
    /Appearance=ghost/.test(c.name) &&
    /Size=sm/.test(c.name) &&
    /State=default/.test(c.name)
);
const bgEnd = BG.children.find((c) => c.name === 'Orientation=horizontal, Align=end, Size=md');
const danger = BTN.children.find((c) => c.name === 'Intent=danger, Appearance=solid, Size=md, State=default');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Dialog');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Dialog';
  page.appendChild(section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Dialog' || n.name === '_Dialog/Backdrop')) n.remove();
const text = (name, st, chars, color, parent) => {
  const t = figma.createText();
  t.textStyleId = style(st).id;
  t.characters = chars;
  t.name = name;
  parent.appendChild(t);
  t.fills = [paint(color, t)];
  t.layoutSizingHorizontal = 'FILL';
  t.textAutoResize = 'HEIGHT';
  return t;
};
const W = { sm: 400, md: 560, lg: 720 };
const comps = [];
for (const sc of ['no', 'yes'])
  for (const s of ['md', 'sm', 'lg']) {
    const c = figma.createComponent();
    c.name = `Size=${s}, Scrolled=${sc}`;
    c.layoutMode = 'VERTICAL';
    c.resize(W[s], 200);
    c.counterAxisSizingMode = 'FIXED';
    c.primaryAxisSizingMode = 'AUTO';
    c.clipsContent = true;
    bind(c, ['width'], `component/dialog/inline-size/${s}`);
    bind(c, PADS, 'space/layout/md');
    bind(c, ['itemSpacing'], 'space/content/lg');
    bind(c, RADII, 'radius/overlay');
    c.fills = [paint('color/surface/overlay', c)];
    c.strokes = [paint('color/elevation/border', c)];
    c.strokeAlign = 'INSIDE';
    bind(c, STROKES, 'border/width/default');
    c.strokesIncludedInLayout = false;
    await c.setEffectStyleIdAsync(modal.id);
    const head = figma.createAutoLayout('HORIZONTAL', { name: 'Header' });
    head.fills = [];
    head.clipsContent = false;
    head.counterAxisAlignItems = 'MIN';
    c.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    bind(head, ['itemSpacing'], 'space/content/sm');
    const ht = figma.createAutoLayout('VERTICAL', { name: 'Heading' });
    ht.fills = [];
    ht.clipsContent = false;
    head.appendChild(ht);
    ht.layoutSizingHorizontal = 'FILL';
    bind(ht, ['itemSpacing'], 'space/content/xs');
    text('Title', 'heading/sm', 'Delete this report?', 'color/content/primary', ht);
    text('Description', 'body/sm', 'It stays in the trash for 30 days.', 'color/content/secondary', ht);
    const cb = figma.createAutoLayout('HORIZONTAL', { name: 'Close box' });
    cb.fills = [];
    cb.clipsContent = false;
    cb.counterAxisAlignItems = 'CENTER';
    head.appendChild(cb);
    cb.counterAxisSizingMode = 'FIXED';
    bind(cb, ['height'], 'typography/heading/sm/lineHeight');
    const close = ibSm.createInstance();
    close.name = 'Close';
    cb.appendChild(close);
    setP(close, 'Icon', X.id);
    setP(close, 'Label', 'Close');
    const body = c.createSlot();
    body.name = 'Body';
    body.fills = [];
    body.clipsContent = false;
    body.layoutMode = 'VERTICAL';
    body.primaryAxisSizingMode = 'AUTO';
    body.counterAxisSizingMode = 'AUTO';
    c.appendChild(body);
    body.layoutSizingHorizontal = 'FILL';
    bind(body, ['itemSpacing'], 'space/content/md');
    text(
      'Text',
      'body/md',
      'Quarterly report.pdf will be moved to the trash. Members who shared it will lose access.',
      'color/content/primary',
      body
    );
    if (sc === 'yes')
      for (const [nm, idx] of [
        ['Divider (header)', 1],
        ['Divider (footer)', 3]
      ]) {
        const d = figma.createFrame();
        d.name = nm;
        d.resize(100, 1);
        d.fills = [paint('color/border/subtle', d)];
        c.insertChild(idx, d);
        d.layoutSizingHorizontal = 'FILL';
        bind(d, ['height'], 'border/width/default');
      }
    const foot = c.createSlot();
    foot.name = 'Footer';
    foot.fills = [];
    foot.clipsContent = false;
    foot.layoutMode = 'HORIZONTAL';
    foot.primaryAxisSizingMode = 'AUTO';
    foot.counterAxisSizingMode = 'AUTO';
    c.appendChild(foot);
    foot.layoutSizingHorizontal = 'FILL';
    const grp = bgEnd.createInstance();
    foot.appendChild(grp);
    grp.layoutSizingHorizontal = 'FILL';
    const gslot = grp.findOne((n) => n.type === 'SLOT');
    const [save, cancel] = gslot.children;
    setP(cancel, 'Label', 'Cancel');
    gslot.insertChild(0, cancel);
    save.swapComponent(danger);
    setP(save, 'Label', 'Delete');
    save.setBoundVariable('minHeight', null);
    save.minHeight = null;
    comps.push(c);
  }
const set = figma.combineAsVariants(comps, section);
set.name = 'Dialog';
const slots = {};
for (const [k, d] of Object.entries(set.componentPropertyDefinitions))
  if (d.type === 'SLOT') (slots[k.split('#')[0]] ??= []).push(k);
for (const [nm, keys] of Object.entries(slots))
  if (keys.length > 1) {
    for (const v of set.children)
      v.findOne((n) => n.type === 'SLOT' && n.name === nm).componentPropertyReferences = { slotContentId: keys[0] };
    for (const k of keys.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
    slots[nm] = [keys[0]];
  }
set.editComponentProperty(slots.Body[0], {
  name: 'Body',
  description:
    'The content of the dialog in body/md: text, a form. It scrolls when the dialog is taller than the viewport allows (Scrolled=yes shows the dividers).'
});
set.editComponentProperty(slots.Footer[0], {
  name: 'Footer',
  description: 'At most one ButtonGroup aligned at the end; the primary action is the last item.',
  preferredValues: [{ type: 'COMPONENT_SET', key: BG.key }],
  slotSettings: { allowPreferredValuesOnly: true }
});
const pTitle = set.addComponentProperty('Title', 'TEXT', 'Delete this report?');
const pDesc = set.addComponentProperty('Description', 'TEXT', 'It stays in the trash for 30 days.');
const pShowDesc = set.addComponentProperty('Show description', 'BOOLEAN', true);
const pDis = set.addComponentProperty('Dismissible', 'BOOLEAN', true);
const pFoot = set.addComponentProperty('Show footer', 'BOOLEAN', true);
for (const v of set.children) {
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Title').componentPropertyReferences = { characters: pTitle };
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Description').componentPropertyReferences = {
    characters: pDesc,
    visible: pShowDesc
  };
  v.findOne((n) => n.name === 'Close box').componentPropertyReferences = { visible: pDis };
  const f = v.findOne((n) => n.type === 'SLOT' && n.name === 'Footer');
  f.componentPropertyReferences = { ...f.componentPropertyReferences, visible: pFoot };
  const d2 = v.findOne((n) => n.name === 'Divider (footer)');
  if (d2) d2.componentPropertyReferences = { visible: pFoot };
}
set.description =
  'Dialog (overlays/dialog): a modal window for a short task or a decision that must be completed or abandoned before going back to the page. Size sets the width (component/dialog/inline-size/{size}: 400, 560, 720; narrower than the viewport less space/layout/md on each side). Header: Title (heading/sm), Description (body/sm, secondary), the close IconButton (Dismissible). Body slot (body/md); Footer slot: one ButtonGroup aligned at the end, the primary action last. Scrolled=yes shows the dividers (color/border/subtle) while the body scrolls. Panel: color/surface/overlay, edge color/elevation/border, shadow/modal, radius/overlay, padding space/layout/md, gaps space/content/lg. Place it on _Dialog/Backdrop for the scrim. Alert dialogs, focus, Escape and the motion are behaviors of the code.';
set.children.forEach((v, j) => {
  v.x = 32 + [0, 600, 1200][j % 3];
  v.y = 32 + Math.floor(j / 3) * 380;
});
set.resizeWithoutConstraints(32 + 1200 + 720 + 32, 32 + 2 * 380);
set.x = 80;
set.y = 80;
const bd = figma.createComponent();
bd.name = '_Dialog/Backdrop';
section.appendChild(bd);
bd.layoutMode = 'VERTICAL';
bd.resize(1280, 800);
bd.primaryAxisSizingMode = 'FIXED';
bd.counterAxisSizingMode = 'FIXED';
bd.primaryAxisAlignItems = 'CENTER';
bd.counterAxisAlignItems = 'CENTER';
bd.clipsContent = true;
bd.fills = [paint('color/surface/scrim', bd)];
bind(bd, PADS, 'space/layout/md');
const ds = bd.createSlot();
ds.name = 'Dialog';
ds.fills = [];
ds.clipsContent = false;
ds.layoutMode = 'VERTICAL';
ds.primaryAxisSizingMode = 'AUTO';
ds.counterAxisSizingMode = 'AUTO';
ds.appendChild(set.defaultVariant.createInstance());
const bk = Object.keys(bd.componentPropertyDefinitions).find((k) => bd.componentPropertyDefinitions[k].type === 'SLOT');
bd.editComponentProperty(bk, {
  name: 'Dialog',
  description: 'One Dialog, centered over the scrim.',
  preferredValues: [{ type: 'COMPONENT_SET', key: set.key }],
  slotSettings: { allowPreferredValuesOnly: true }
});
bd.description =
  'Internal part of Dialog (backdrop): the scrim color/surface/scrim over the whole viewport behind the panel, the dialog centered, at least space/layout/md from the edges. The page under it is inert and does not scroll (code behavior).';
bd.x = set.x;
bd.y = set.y + set.height + 80;
section.resizeWithoutConstraints(Math.max(set.width, bd.width) + 160, bd.y + bd.height + 80);
return { section: section.id, set: set.id, backdrop: bd.id };
