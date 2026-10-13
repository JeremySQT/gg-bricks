// Button specification page builder (use_figma bodies), 2026-10-13. Run the parts in order.
// Part 1 creates or updates the Wireframe collection (modes light and blueprint), updates the documentation
// components _Spec/Board, _Spec/Callout and _Spec/Marker, and builds the frame “Button — Specification”: light
// header band (breadcrumb, title, summary, hero, reference note) and the Anatomy section with its blueprint
// boards (structure and spacing diagrams, legends, real parts). Part 2 adds the body: Variants, States,
// Behavior & sizing and Usage examples (replace the root id with the one part 1 returned).
// The grid tile is a 16 px PNG with one white line on its top and left edges (hash GRID); the tiles are listed in
// reports/components/button/figma/ledger.json with the node ids and property keys the scripts rely on.

// ---- Part 1 ----
figma.skipInvisibleInstanceChildren = false;
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const PR = (n) => vars.find((v) => v.name === 'primitive/color/' + n);
const wf = col('Wireframe');
if (wf.modes.length === 1) {
  wf.renameMode(wf.modes[0].modeId, 'light');
  wf.addMode('blueprint');
}
const L = mode(wf, 'light'),
  B = mode(wf, 'blueprint');
const WHITE = { r: 1, g: 1, b: 1 };
const b800 = PR('blue/800').valuesByMode[Object.keys(PR('blue/800').valuesByMode)[0]];
const withA = (c, a) => ({ r: c.r, g: c.g, b: c.b, a });
const defs = {
  'wireframe/board': { light: 'neutral/50', blueprint: 'blue/800' },
  'wireframe/grid': { light: 'blue/600', blueprint: 'neutral/0' },
  'wireframe/ink': { light: 'blue/800', blueprint: 'neutral/0' },
  'wireframe/on-ink': { light: 'neutral/0', blueprint: 'blue/800' },
  'wireframe/panel': { light: 'neutral/50', blueprint: 'neutral/50' },
  'wireframe/divider': { light: 'neutral/200', blueprint: 'neutral/200' },
  'wireframe/text': { light: 'neutral/700', blueprint: 'neutral/0' },
  'wireframe/canvas': { light: 'neutral/0', blueprint: 'neutral/0' },
  'wireframe/tint/4': 0.04,
  'wireframe/tint/8': 0.08,
  'wireframe/tint/16': 0.16,
  'wireframe/tint/28': 0.28,
  'wireframe/tint/48': 0.48
};
for (const [n, d] of Object.entries(defs)) {
  const v =
    vars.find((x) => x.name === n && x.variableCollectionId === wf.id) ||
    figma.variables.createVariable(n, wf, 'COLOR');
  v.scopes = ['ALL_FILLS', 'STROKE_COLOR'];
  if (typeof d === 'number') {
    v.setValueForMode(L, withA(b800, d));
    v.setValueForMode(B, withA(WHITE, d));
  } else {
    v.setValueForMode(L, figma.variables.createVariableAlias(PR(d.light)));
    v.setValueForMode(B, figma.variables.createVariableAlias(PR(d.blueprint)));
  }
}
for (const v of vars.filter((v) => v.variableCollectionId === wf.id && !(v.name in defs))) v.remove();
vars = await figma.variables.getLocalVariablesAsync();
const V = (name) =>
  vars.find((v) => v.name === name && v.variableCollectionId === wf.id) || vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash) => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  node.dashPattern = dash || [];
};
const GRID = '349e013eedf533dd9a34627a53f989e11cc9a869';
// documentation components
const util = await figma.getNodeByIdAsync('8:10');
await figma.setCurrentPageAsync(util);
const canvasC = await figma.getNodeByIdAsync('113:17');
canvasC.fills = [
  paint('wireframe/board'),
  { type: 'IMAGE', scaleMode: 'TILE', imageHash: GRID, scalingFactor: 1, opacity: 0.1 }
];
canvasC.setExplicitVariableModeForCollection(wf, B);
canvasC.name = '_Spec/Board';
canvasC.description =
  'Blueprint board for specification diagrams: Wireframe collection in blueprint mode, white grid tile at 10%. Documentation tooling, not part of the library API.';
const callC = await figma.getNodeByIdAsync('115:6');
fill(callC, 'wireframe/ink');
fill(
  callC.findOne((n) => n.type === 'TEXT'),
  'wireframe/on-ink'
);
const markC = await figma.getNodeByIdAsync('115:8');
fill(markC, 'wireframe/board');
stroke(markC, 'wireframe/ink', 1.5);
const numKey = Object.keys(callC.componentPropertyDefinitions)[0];
// page
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter(
  (n) => n.name === 'Button — Specification' || n.name.startsWith('_parity') || n.name === '_probe'
))
  n.remove();
const set = await figma.getNodeByIdAsync('48:1586');
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
for (const st of ['Medium', 'Semi Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
const text = (chars, style = 'body/md', color = 'color/content/primary', width) => {
  const t = figma.createText();
  t.textStyleId = S(style).id;
  t.characters = chars;
  fill(t, color);
  if (width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(width, t.height);
  }
  return t;
};
const stack = (name, dir = 'VERTICAL', gap = 16, pad = 0) => {
  const f = figma.createAutoLayout(dir, { name, itemSpacing: gap });
  f.fills = [];
  if (pad) {
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
  }
  f.clipsContent = false;
  return f;
};
const board = (name, w, h) => {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.clipsContent = false;
  f.cornerRadius = 12;
  f.fills = [
    paint('wireframe/board'),
    { type: 'IMAGE', scaleMode: 'TILE', imageHash: GRID, scalingFactor: 1, opacity: 0.1 }
  ];
  f.setExplicitVariableModeForCollection(wf, B);
  return f;
};
const panel = (name, dir = 'HORIZONTAL', gap = 24, pad = 28, fillName = 'wireframe/canvas') => {
  const f = stack(name, dir, gap, pad);
  fill(f, fillName);
  f.cornerRadius = 12;
  return f;
};
const variant = (i, a, s, t) =>
  set.children.find((c) => c.name === `Intent=${i}, Appearance=${a}, Size=${s}, State=${t}`);
const btn = (o = {}) => {
  const inst = variant(o.i || 'accent', o.a || 'solid', o.s || 'md', o.t || 'default').createInstance();
  inst.setProperties({
    'Label#48:360': o.label || 'Save changes',
    'Show leading#48:361': !!o.lead,
    'Show trailing#76:0': !!o.trail,
    'Focus#48:367': !!o.focus
  });
  if (o.lead && o.leadIcon)
    inst.exposedInstances.find((e) => e.name === 'Leading icon').setProperties({ Name: o.leadIcon });
  if (o.trail) {
    const t = inst.exposedInstances.find((e) => e.name === 'Trailing item');
    if (o.trail === 'icon') {
      if (o.trailIcon) t.findOne((n) => n.name === 'Icon').setProperties({ Name: o.trailIcon });
    } else t.setProperties({ Type: o.trail === 'counter' ? 'Counter' : 'Shortcut' });
  }
  return inst;
};
const chip = (chars) => {
  const c = stack('Caption', 'HORIZONTAL', 0);
  c.paddingLeft = c.paddingRight = 8;
  c.paddingTop = c.paddingBottom = 3;
  c.cornerRadius = 6;
  fill(c, 'wireframe/panel');
  c.appendChild(text(chars, 'caption/md', 'color/content/secondary'));
  return c;
};
const caption = (inst, cap) => {
  const f = stack('Example', 'VERTICAL', 10);
  f.counterAxisAlignItems = 'MIN';
  f.appendChild(inst);
  f.appendChild(chip(cap));
  return f;
};
const callout = (n, parent, cx, cy) => {
  const i = callC.createInstance();
  i.setProperties({ [numKey]: String(n) });
  parent.appendChild(i);
  if (cx !== undefined) {
    i.x = cx - 11;
    i.y = cy - 11;
  }
  return i;
};
const marker = (parent, cx, cy) => {
  const i = markC.createInstance();
  parent.appendChild(i);
  i.x = cx - 4;
  i.y = cy - 4;
  return i;
};
const leader = (parent, x1, y1, x2, y2) => {
  const l = figma.createLine();
  l.resize(Math.hypot(x2 - x1, y2 - y1), 0);
  l.rotation = (-Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  l.x = x1;
  l.y = y1;
  stroke(l, 'wireframe/ink', 1, [3, 3]);
  l.opacity = 0.7;
  parent.appendChild(l);
};
const pin = (parent, n, cx, cy, tx, ty) => {
  leader(parent, cx, cy + Math.sign(ty - cy) * 11, tx, ty);
  marker(parent, tx, ty);
  callout(n, parent, cx, cy);
};
const heading = (parent, title, intro) => {
  const s = stack(title, 'VERTICAL', 10);
  const h = stack('Heading', 'HORIZONTAL', 12);
  h.counterAxisAlignItems = 'CENTER';
  const dot = figma.createFrame();
  dot.name = 'Bullet';
  dot.resize(8, 8);
  dot.cornerRadius = 4;
  fill(dot, 'wireframe/ink');
  h.appendChild(dot);
  h.appendChild(text(title, 'heading/lg'));
  s.appendChild(h);
  if (intro) s.appendChild(text(intro, 'body/md', 'color/content/secondary', 1000));
  parent.appendChild(s);
  return s;
};

const root = stack('Button — Specification', 'VERTICAL', 0, 0);
root.x = 0;
root.y = 2900;
fill(root, 'wireframe/canvas');
root.resize(1232, 100);
root.layoutSizingHorizontal = 'FIXED';
for (const [c, m] of [
  ['Brand', 'base'],
  ['Appearance', 'light'],
  ['Density', 'standard']
])
  root.setExplicitVariableModeForCollection(col(c), mode(col(c), m));
root.setExplicitVariableModeForCollection(wf, L);
// Header band
const band = stack('Header', 'VERTICAL', 28, 64);
fill(band, 'wireframe/panel');
root.appendChild(band);
band.layoutSizingHorizontal = 'FILL';
const crumb = text('ACTIONS / BUTTON', 'label/sm', 'color/content/tertiary');
band.appendChild(crumb);
band.appendChild(text('Button', 'display/md'));
band.appendChild(
  text(
    'A button starts an action or moves the user to the next step of a task. It shows a short text label, with an optional icon before it and an optional icon, counter or keyboard shortcut after it. When the button leads to another page, the same component is rendered as a link.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = panel('Hero', 'HORIZONTAL', 12, 28);
hero.counterAxisAlignItems = 'CENTER';
hero.appendChild(btn({ label: 'Create project', lead: true }));
hero.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Cancel' }));
hero.appendChild(btn({ a: 'ghost', label: 'Learn more', trail: 'icon' }));
hero.appendChild(btn({ i: 'danger', label: 'Delete', lead: true, leadIcon: 'trash' }));
band.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
band.appendChild(
  text(
    'The contract and the code in the ggbrick repository (components/actions/button) are the reference. This page documents the Figma component set “Button”; every button shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
    'body/sm',
    'color/content/tertiary',
    900
  )
);
// Anatomy inside the band
const an = stack('Anatomy', 'VERTICAL', 20);
band.appendChild(an);
an.layoutSizingHorizontal = 'FILL';
heading(
  an,
  'Anatomy',
  'How a button is built. The drawing is simplified and not to scale; the real button is shown underneath.'
);
const anRow = stack('Anatomy row', 'HORIZONTAL', 24);
anRow.counterAxisAlignItems = 'MIN';
const dg = board('Anatomy diagram', 700, 352);
const rect = (name, x, y, w, h, fillName, r = 0, parent = dg) => {
  const f = figma.createFrame();
  f.name = name;
  f.x = x;
  f.y = y;
  f.resize(w, h);
  f.cornerRadius = r;
  f.clipsContent = false;
  if (fillName) fill(f, fillName);
  else f.fills = [];
  parent.appendChild(f);
  return f;
};
const k = 2.5,
  OX = 158,
  OY = 98,
  CW = 154 * k,
  CH = 40 * k;
const rootR = rect('1 Root', OX, OY, CW, CH + 40, 'wireframe/tint/4', 6);
stroke(rootR, 'wireframe/ink', 1.5, [6, 4]);
rootR.opacity = 0.9;
const ring = rect('7 Focus ring', OX - 5, OY + 15, CW + 10, CH + 10, null, 20);
stroke(ring, 'wireframe/tint/48', 5);
ring.strokeAlign = 'OUTSIDE';
const cont = rect('2 Container', OX, OY + 20, CW, CH, 'wireframe/tint/8', 15);
stroke(cont, 'wireframe/tint/48', 1.5);
const slot = (name, x) => {
  const b = rect(name + ' (icon box)', OX + x - 2.5 * k, OY + 20 + 10 * k, 20 * k, 20 * k, null, 5);
  stroke(b, 'wireframe/ink', 1, [4, 3]);
  b.opacity = 0.6;
  rect(name + ' (drawing)', OX + x, OY + 20 + 10 * k, 15 * k, 20 * k, 'wireframe/tint/28', 3);
};
slot('3 Leading', 12 * k);
slot('5 Trailing', 127 * k);
const lab = rect('4 Label', OX + 35 * k, OY + 20 + 10 * k, 84 * k, 20 * k, 'wireframe/tint/16', 5);
const lt = figma.createText();
lt.fontName = { family: 'Inter', style: 'Medium' };
lt.fontSize = 20;
lt.characters = 'Label';
fill(lt, 'wireframe/ink');
lab.appendChild(lt);
lt.x = 16;
lt.y = (20 * k - lt.height) / 2;
const ld = figma.createEllipse();
ld.name = '6 Loading indicator';
ld.x = OX + CW / 2 - 10 * k;
ld.y = OY + 20 + 10 * k;
ld.resize(20 * k, 20 * k);
fill(ld, 'wireframe/board');
stroke(ld, 'wireframe/ink', 2.5, [7, 5]);
dg.appendChild(ld);
const top = 40,
  bottom = 312;
pin(dg, 2, OX + 80, top, OX + 80, OY + 20);
pin(dg, 6, OX + CW / 2, top, OX + CW / 2, OY + 20 + 10 * k);
pin(dg, 7, OX + CW - 40, top, OX + CW - 40, OY + 10);
pin(dg, 1, OX + CW / 2, bottom, OX + CW / 2, OY + CH + 40);
pin(dg, 3, OX + 19.5 * k, bottom, OX + 19.5 * k, OY + 20 + 30 * k);
pin(dg, 4, OX + 100 * k, bottom, OX + 100 * k, OY + 20 + 30 * k);
pin(dg, 5, OX + 134.5 * k, bottom, OX + 134.5 * k, OY + 20 + 30 * k);
anRow.appendChild(dg);
const legend = panel('Legend', 'VERTICAL', 12, 24);
const items = [
  'Root: the area that reacts to clicks and taps. It is at least 44 px tall, even when the visible button is smaller.',
  'Container: the visible button, with its background, border, corner radius and side padding.',
  'Leading: an optional icon before the label.',
  'Label: the text of the button. It is required and gives the button its name for screen readers.',
  'Trailing: an optional element after the label: an icon, a counter or a keyboard shortcut.',
  'Loading indicator: shown in the middle while the action runs. The other content is hidden but keeps its place, so the width does not change.',
  'Focus ring: drawn just outside the container when the button is focused with the keyboard.'
];
items.forEach((s, i) => {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  callout(i + 1, r);
  r.appendChild(text(s, 'body/sm', 'color/content/secondary', 316));
  legend.appendChild(r);
});
anRow.appendChild(legend);
legend.layoutSizingVertical = 'FILL';
an.appendChild(anRow);
const spRow = stack('Spacing row', 'HORIZONTAL', 24);
spRow.counterAxisAlignItems = 'MIN';
const sd = board('Spacing diagram', 700, 236);
sd.clipsContent = true;
const SX = 40,
  SY = 40;
const c2 = rect('Container (zoom)', SX, SY, 800, 112, 'wireframe/tint/8', 24, sd);
stroke(c2, 'wireframe/tint/48', 1.5);
const ib = rect('Icon box', SX + 38, SY + 16, 80, 80, null, 8, sd);
stroke(ib, 'wireframe/ink', 1, [4, 3]);
ib.opacity = 0.6;
rect('Icon drawing', SX + 48, SY + 16, 60, 80, 'wireframe/tint/28', 4, sd);
const l2 = rect('Label', SX + 140, SY + 16, 700, 80, 'wireframe/tint/16', 8, sd);
const lt2 = figma.createText();
lt2.fontName = { family: 'Inter', style: 'Medium' };
lt2.fontSize = 28;
lt2.characters = 'Label';
fill(lt2, 'wireframe/ink');
l2.appendChild(lt2);
lt2.x = 24;
lt2.y = (80 - lt2.height) / 2;
const dim = (ch, x, w) => {
  const y = SY + 128;
  const l = figma.createLine();
  l.resize(w, 0);
  l.x = SX + x;
  l.y = y;
  stroke(l, 'wireframe/ink', 1.5);
  sd.appendChild(l);
  for (const tx of [x, x + w]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.rotation = 90;
    t.x = SX + tx;
    t.y = y + 4;
    stroke(t, 'wireframe/ink', 1.5);
    sd.appendChild(t);
  }
  callout(ch, sd, SX + x + w / 2, y + 24);
};
dim('A', 0, 40);
dim('C', 40, 8);
dim('C', 108, 8);
dim('B', 116, 24);
spRow.appendChild(sd);
const spCard = panel('Spacing legend', 'VERTICAL', 12, 24);
for (const [ch, s] of [
  ['A', 'Side padding of the container.'],
  ['B', 'Margin on each side of the label.'],
  ['C', 'Margin on each side of an icon, a counter or a shortcut.']
]) {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  callout(ch, r);
  r.appendChild(text(s, 'body/sm', 'color/content/secondary', 316));
  spCard.appendChild(r);
}
spCard.appendChild(
  text(
    'An icon is placed by its drawing (filled box) rather than by its full square (dashed box), so it looks as close to the text as a counter would. The right side mirrors the left side. Zoomed in four times.',
    'body/sm',
    'color/content/secondary',
    348
  )
);
spRow.appendChild(spCard);
spCard.layoutSizingVertical = 'FILL';
an.appendChild(spRow);
const real = panel('Real parts', 'HORIZONTAL', 32, 28);
real.counterAxisAlignItems = 'MAX';
real.appendChild(
  caption(
    btn({
      s: 'lg',
      a: 'outline',
      label: 'Download report',
      lead: true,
      leadIcon: 'download-simple',
      trail: 'icon',
      focus: true
    }),
    'leading icon, trailing icon and focus ring'
  )
);
real.appendChild(caption(btn({ label: 'Continue' }), 'label only'));
real.appendChild(caption(btn({ label: 'Add item', lead: true }), 'leading icon'));
real.appendChild(
  caption(
    btn({ a: 'outline', i: 'neutral', label: 'Inbox', lead: true, leadIcon: 'check', trail: 'counter' }),
    'leading icon and counter'
  )
);
real.appendChild(caption(btn({ a: 'ghost', i: 'neutral', label: 'Search', trail: 'shortcut' }), 'keyboard shortcut'));
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, the label is a text property. “Show leading” and “Show trailing” add the optional parts; the leading icon is chosen by its name, and the trailing item has a type: Icon, Counter or Shortcut. Intent, Appearance, Size and State are variants, and Focus is a separate switch.',
    'body/md',
    'color/content/secondary',
    1000
  )
);
return { root: root.id, dg: dg.id, sd: sd.id, modes: { L, B } };

// ---- Part 2 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync('126:1904');
for (const n of root.children.filter((n) => n.name === 'Body')) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const wf = col('Wireframe');
const V = (name) =>
  vars.find((v) => v.name === name && v.variableCollectionId === wf.id) || vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash) => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  node.dashPattern = dash || [];
};
const set = await figma.getNodeByIdAsync('48:1586');
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const text = (chars, style = 'body/md', color = 'color/content/primary', width) => {
  const t = figma.createText();
  t.textStyleId = S(style).id;
  t.characters = chars;
  fill(t, color);
  if (width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(width, t.height);
  }
  return t;
};
const stack = (name, dir = 'VERTICAL', gap = 16, pad = 0) => {
  const f = figma.createAutoLayout(dir, { name, itemSpacing: gap });
  f.fills = [];
  if (pad) {
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
  }
  f.clipsContent = false;
  return f;
};
const panel = (name, dir = 'HORIZONTAL', gap = 24, pad = 28) => {
  const f = stack(name, dir, gap, pad);
  fill(f, 'wireframe/panel');
  f.cornerRadius = 12;
  return f;
};
const variant = (i, a, s, t) =>
  set.children.find((c) => c.name === `Intent=${i}, Appearance=${a}, Size=${s}, State=${t}`);
const btn = (o = {}) => {
  const inst = variant(o.i || 'accent', o.a || 'solid', o.s || 'md', o.t || 'default').createInstance();
  inst.setProperties({
    'Label#48:360': o.label || 'Save changes',
    'Show leading#48:361': !!o.lead,
    'Show trailing#76:0': !!o.trail,
    'Focus#48:367': !!o.focus
  });
  if (o.lead && o.leadIcon)
    inst.exposedInstances.find((e) => e.name === 'Leading icon').setProperties({ Name: o.leadIcon });
  if (o.trail) {
    const t = inst.exposedInstances.find((e) => e.name === 'Trailing item');
    if (o.trail === 'icon') {
      if (o.trailIcon) t.findOne((n) => n.name === 'Icon').setProperties({ Name: o.trailIcon });
    } else t.setProperties({ Type: o.trail === 'counter' ? 'Counter' : 'Shortcut' });
  }
  return inst;
};
const chip = (chars) => {
  const c = stack('Caption', 'HORIZONTAL', 0);
  c.paddingLeft = c.paddingRight = 8;
  c.paddingTop = c.paddingBottom = 3;
  c.cornerRadius = 6;
  fill(c, 'wireframe/canvas');
  stroke(c, 'wireframe/divider', 1);
  c.appendChild(text(chars, 'caption/md', 'color/content/secondary'));
  return c;
};
const caption = (inst, cap) => {
  const f = stack('Example', 'VERTICAL', 10);
  f.counterAxisAlignItems = 'MIN';
  f.appendChild(inst);
  f.appendChild(chip(cap));
  return f;
};
const label = (s, w = 80, color = 'color/content/secondary') => {
  const l = text(s, 'label/md', color);
  l.textAutoResize = 'NONE';
  l.resize(w, l.height);
  return l;
};
const body = stack('Body', 'VERTICAL', 48, 64);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const section = (title, intro) => {
  const s = stack(title, 'VERTICAL', 20);
  const hd = stack('Heading', 'HORIZONTAL', 12);
  hd.counterAxisAlignItems = 'CENTER';
  const dot = figma.createFrame();
  dot.name = 'Bullet';
  dot.resize(8, 8);
  dot.cornerRadius = 4;
  fill(dot, 'wireframe/ink');
  hd.appendChild(dot);
  hd.appendChild(text(title, 'heading/lg'));
  s.appendChild(hd);
  if (intro) s.appendChild(text(intro, 'body/md', 'color/content/secondary', 1000));
  body.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  return s;
};

const va = section(
  'Variants',
  'Intent says what the action means: accent for the main action, neutral for secondary actions, danger for actions that delete or cannot be undone. Appearance sets the visual weight: solid, outline or ghost. Size follows the density of the surrounding interface. The brand, the light or dark appearance and the density come from the modes of the frame, not from the component.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
const grid = panel('Intent × appearance', 'VERTICAL', 12);
const head = stack('Header', 'HORIZONTAL', 16);
head.appendChild(label('', 80));
for (const a of ['solid', 'outline', 'ghost']) head.appendChild(label(a, 104, 'color/content/tertiary'));
grid.appendChild(head);
for (const i of ['accent', 'neutral', 'danger']) {
  const r = stack(i, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(i, 80));
  for (const a of ['solid', 'outline', 'ghost']) {
    const cell = stack(a, 'HORIZONTAL', 0);
    cell.resize(104, 44);
    cell.primaryAxisSizingMode = 'FIXED';
    cell.appendChild(btn({ i, a, label: i === 'danger' ? 'Delete' : 'Continue' }));
    r.appendChild(cell);
  }
  grid.appendChild(r);
}
vrow.appendChild(grid);
const sizes = panel('Sizes', 'HORIZONTAL', 24);
sizes.counterAxisAlignItems = 'MAX';
for (const s of ['sm', 'md', 'lg']) sizes.appendChild(caption(btn({ s, label: 'Continue', lead: true }), `size ${s}`));
vrow.appendChild(sizes);
va.appendChild(vrow);
const ctx = stack('Contexts', 'HORIZONTAL', 12);
for (const [b, a] of [
  ['base', 'light'],
  ['base', 'dark'],
  ['brick', 'light'],
  ['brick', 'dark'],
  ['orchid', 'light'],
  ['orchid', 'dark']
]) {
  const f = stack(`${b} ${a}`, 'VERTICAL', 12, 20);
  fill(f, 'color/surface/canvas');
  f.cornerRadius = 12;
  stroke(f, 'color/border/subtle', 1);
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.appendChild(text(`${b} · ${a}`, 'label/sm', 'color/content/secondary'));
  for (const ap of ['solid', 'outline', 'ghost']) f.appendChild(btn({ a: ap, label: 'Continue' }));
  ctx.appendChild(f);
}
va.appendChild(ctx);

const st = section(
  'States',
  'A button has five states: default, hover, pressed, loading and disabled. Focus is a separate switch that can be combined with any state. While loading, the button keeps its width and can still receive focus. When disabled, it cannot be focused or activated. If a button is both loading and disabled, it looks disabled and keeps its loading indicator.'
);
const states = ['default', 'hover', 'pressed', 'focus', 'loading', 'disabled'];
for (const ap of ['light', 'dark']) {
  const block = ap === 'light' ? panel(`States ${ap}`, 'VERTICAL', 12, 32) : stack(`States ${ap}`, 'VERTICAL', 12, 32);
  if (ap === 'dark') {
    fill(block, 'color/surface/canvas');
    block.cornerRadius = 12;
    block.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
  }
  block.appendChild(text(`base brand, ${ap} appearance`, 'label/sm', 'color/content/secondary'));
  const h = stack('Header', 'HORIZONTAL', 16);
  h.appendChild(label('', 120));
  for (const t of states) h.appendChild(label(t, 130, 'color/content/tertiary'));
  block.appendChild(h);
  for (const i of ['accent', 'neutral', 'danger'])
    for (const a of ['solid', 'outline', 'ghost']) {
      const r = stack(`${i} ${a}`, 'HORIZONTAL', 16);
      r.counterAxisAlignItems = 'CENTER';
      r.appendChild(label(`${i} ${a}`, 120));
      for (const t of states) {
        const cell = stack(t, 'HORIZONTAL', 0);
        cell.resize(130, 44);
        cell.primaryAxisSizingMode = 'FIXED';
        cell.appendChild(
          btn({
            i,
            a,
            t: t === 'focus' ? 'default' : t,
            focus: t === 'focus',
            label: i === 'danger' ? 'Delete' : 'Save'
          })
        );
        r.appendChild(cell);
      }
      block.appendChild(r);
    }
  st.appendChild(block);
  block.layoutSizingHorizontal = 'FILL';
}
const combo = panel('Combinations', 'HORIZONTAL', 32);
combo.counterAxisAlignItems = 'MAX';
combo.appendChild(caption(btn({ t: 'hover', focus: true, label: 'Save' }), 'hover with focus'));
combo.appendChild(caption(btn({ t: 'loading', focus: true, label: 'Save' }), 'loading with focus'));
const dl = btn({ t: 'disabled', a: 'outline', label: 'Save' });
for (const n of dl.findAll((x) => ['Leading', 'Label', 'Trailing'].includes(x.name))) n.opacity = 0;
dl.findOne((x) => x.name === 'Loading indicator').visible = true;
combo.appendChild(caption(dl, 'loading and disabled (adjusted by hand on this instance)'));
combo.appendChild(
  caption(
    btn({ t: 'disabled', a: 'outline', i: 'neutral', label: 'Inbox', lead: true, leadIcon: 'check', trail: 'counter' }),
    'disabled with an icon and a counter: they take the disabled color too'
  )
);
st.appendChild(combo);
combo.layoutSizingHorizontal = 'FILL';

const bs = section(
  'Behavior & sizing',
  'A button is as wide as its content. When there is not enough room, the label is shortened with an ellipsis and the icons keep their place. To try this in Figma, give the instance a fixed width, then set Container, Label and Text to “Fill”. The height depends on the size and on the density of the frame: compact, standard or comfortable.'
);
const dens = stack('Density × size', 'HORIZONTAL', 12);
for (const d of ['compact', 'standard', 'comfortable']) {
  const f = panel(d, 'VERTICAL', 12, 24);
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
  for (const s of ['sm', 'md', 'lg']) {
    const r = stack(s, 'HORIZONTAL', 12);
    r.counterAxisAlignItems = 'CENTER';
    r.appendChild(label(s, 24));
    r.appendChild(btn({ s, label: 'Continue', lead: true }));
    r.appendChild(btn({ s, a: 'outline', i: 'neutral', label: 'Inbox', trail: 'counter' }));
    f.appendChild(r);
  }
  dens.appendChild(f);
}
bs.appendChild(dens);
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
const tr = panel('Truncation', 'VERTICAL', 20);
for (const [w, o] of [
  [180, { label: 'Export all selected invoices as PDF', lead: true, leadIcon: 'download-simple' }],
  [180, { a: 'outline', i: 'neutral', label: 'Notifications from every project', trail: 'counter' }],
  [160, { a: 'ghost', label: 'Continue to the payment step', trail: 'icon' }]
]) {
  const b = btn(o);
  tr.appendChild(caption(b, `limited to ${w} px: the label is shortened, the icons stay in place`));
  b.layoutSizingHorizontal = 'FIXED';
  b.resize(w, b.height);
  for (const n of ['Container', 'Label']) b.findOne((x) => x.name === n).layoutSizingHorizontal = 'FILL';
  b.findOne((x) => x.type === 'TEXT' && x.name === 'Text').layoutSizingHorizontal = 'FILL';
}
brow.appendChild(tr);
const tgt = panel('Target', 'HORIZONTAL', 24);
tgt.counterAxisAlignItems = 'CENTER';
const wrap = stack('Target outline', 'HORIZONTAL', 0);
wrap.appendChild(btn({ s: 'sm', label: 'Edit' }));
stroke(wrap, 'wireframe/ink', 1, [4, 4]);
wrap.strokeAlign = 'OUTSIDE';
wrap.cornerRadius = 4;
tgt.appendChild(
  caption(
    wrap,
    'a small button is 32 px tall in standard density, but the area that reacts to clicks (dashed) is 44 px tall'
  )
);
brow.appendChild(tgt);
tgt.layoutSizingVertical = 'FILL';
bs.appendChild(brow);

const ue = section(
  'Usage examples',
  'Use one solid accent button per area for the main action. Use outline or ghost neutral buttons for secondary actions. Use the danger intent for actions that delete something or cannot be undone. Keep labels short and start them with a verb. The full guidance will be in the documentation page of the component.'
);
const ex = panel('Examples', 'HORIZONTAL', 32);
ex.counterAxisAlignItems = 'MIN';
const dialog = stack('Dialog footer', 'VERTICAL', 16, 24);
fill(dialog, 'color/surface/raised');
stroke(dialog, 'color/border/subtle');
dialog.cornerRadius = 12;
dialog.appendChild(text('Delete project?', 'heading/sm'));
dialog.appendChild(
  text('This removes 12 files for everyone. You can’t undo this.', 'body/sm', 'color/content/secondary', 320)
);
const foot = stack('Actions', 'HORIZONTAL', 8);
foot.primaryAxisAlignItems = 'MAX';
foot.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Cancel' }));
foot.appendChild(btn({ i: 'danger', label: 'Delete project' }));
dialog.appendChild(foot);
foot.layoutSizingHorizontal = 'FILL';
ex.appendChild(caption(dialog, 'confirming a destructive action'));
const right = stack('Right column', 'VERTICAL', 24);
const bar = stack('Toolbar', 'HORIZONTAL', 4, 8);
fill(bar, 'color/surface/subtle');
bar.cornerRadius = 8;
bar.counterAxisAlignItems = 'CENTER';
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Share' }));
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Download', lead: true, leadIcon: 'download-simple' }));
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Search', trail: 'shortcut' }));
right.appendChild(caption(bar, 'a toolbar with small ghost buttons'));
const form = stack('Form', 'HORIZONTAL', 8);
form.appendChild(btn({ t: 'loading', label: 'Save changes', focus: true }));
form.appendChild(btn({ a: 'ghost', i: 'neutral', label: 'Discard' }));
right.appendChild(caption(form, 'saving a form: the button keeps its width and its focus while loading'));
const dark = stack('Dark header', 'HORIZONTAL', 12, 20);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.cornerRadius = 12;
dark.counterAxisAlignItems = 'CENTER';
dark.appendChild(text('Projects', 'heading/sm'));
dark.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Import' }));
dark.appendChild(btn({ label: 'Create project', lead: true }));
right.appendChild(caption(dark, 'a page header in the orchid brand, dark appearance'));
ex.appendChild(right);
ue.appendChild(ex);
ex.layoutSizingHorizontal = 'FILL';
return {
  body: body.id,
  sections: body.children.map((n) => [n.id, n.name]),
  header: root.children[0].id,
  anatomy: root.children[0].findOne((n) => n.name === 'Anatomy').id
};
