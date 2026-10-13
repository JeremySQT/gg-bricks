// Button specification page builder (use_figma bodies), 2026-10-13. Run the parts in order.
// The page follows the layout the user tuned by hand on 2026-10-13 (white header on a gray page, hero card with a
// white border and a soft shadow, blueprint boards as cards, white cards with a light border in the body); the
// builder reproduces it so that the page can be rebuilt after a content change.
// Part 1 adds the hero, card and border variables to the Wireframe collection (modes light and blueprint, created
// earlier) and builds the frame “Button — Specification”: header (breadcrumb, title, summary, hero, reference
// note, divider, Anatomy with its blueprint boards, legends and real parts) and the divider to the body.
// Part 2 adds the body: Variants, States, Behavior & sizing and Usage examples (replace the root id with the one
// part 1 returned). The grid tile is a 16 px PNG with one white line on its top and left edges (hash GRID); the
// node ids and property keys the scripts rely on are listed in reports/components/button/figma/ledger.json.

// ---- Part 1 ----
figma.skipInvisibleInstanceChildren = false;
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const PR = (n) => vars.find((v) => v.name === 'primitive/color/' + n);
const wf = col('Wireframe');
const L = mode(wf, 'light'),
  B = mode(wf, 'blueprint');
const hexc = (h) => ({
  r: parseInt(h.slice(0, 2), 16) / 255,
  g: parseInt(h.slice(2, 4), 16) / 255,
  b: parseInt(h.slice(4, 6), 16) / 255,
  a: 1
});
const extra = {
  'wireframe/hero': { lit: 'fbfbfb' },
  'wireframe/card': { alias: 'neutral/0' },
  'wireframe/card-border': { lit: 'e8ecf2' },
  'wireframe/card-border-accent': { lit: 'dce9fa' }
};
for (const [n, d] of Object.entries(extra)) {
  const v =
    vars.find((x) => x.name === n && x.variableCollectionId === wf.id) ||
    figma.variables.createVariable(n, wf, 'COLOR');
  v.scopes = ['ALL_FILLS', 'STROKE_COLOR'];
  for (const m of [L, B])
    v.setValueForMode(m, d.alias ? figma.variables.createVariableAlias(PR(d.alias)) : hexc(d.lit));
}
vars = await figma.variables.getLocalVariablesAsync();
const V = (name) =>
  vars.find((v) => v.name === name && v.variableCollectionId === wf.id) || vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash, align = 'INSIDE') => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  node.dashPattern = dash || [];
  node.strokeAlign = align;
};
const shadow = (n) => {
  n.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.08 },
      offset: { x: 0, y: 2 },
      radius: 10,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL'
    }
  ];
};
const GRID = '349e013eedf533dd9a34627a53f989e11cc9a869';
const callC = await figma.getNodeByIdAsync('115:6');
const markC = await figma.getNodeByIdAsync('115:8');
const numKey = Object.keys(callC.componentPropertyDefinitions)[0];
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
const NAME = 'Button — Specification';
for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
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
  if (Array.isArray(pad)) {
    [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = pad;
  } else if (pad) {
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
  }
  f.clipsContent = false;
  return f;
};
const card = (name, dir = 'HORIZONTAL', gap = 24, pad = 28) => {
  const f = stack(name, dir, gap, pad);
  fill(f, 'wireframe/card');
  stroke(f, 'wireframe/card-border', 1);
  f.cornerRadius = 12;
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
  stroke(f, 'wireframe/card', 8, null, 'OUTSIDE');
  shadow(f);
  f.setExplicitVariableModeForCollection(wf, B);
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
const chip = (chars, bordered) => {
  const c = stack('Caption', 'HORIZONTAL', 0, [3, 8, 3, 8]);
  c.cornerRadius = 6;
  fill(c, bordered ? 'wireframe/canvas' : 'wireframe/panel');
  if (bordered) stroke(c, 'wireframe/divider', 1);
  c.appendChild(text(chars, 'caption/md', 'color/content/secondary'));
  return c;
};
const caption = (inst, cap, bordered) => {
  const f = stack('Example', 'VERTICAL', 10);
  f.counterAxisAlignItems = 'MIN';
  f.appendChild(inst);
  f.appendChild(chip(cap, bordered));
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
  stroke(l, 'wireframe/ink', 1, [3, 3], 'CENTER');
  l.opacity = 0.7;
  parent.appendChild(l);
};
const pin = (parent, n, cx, cy, tx, ty) => {
  leader(parent, cx, cy + Math.sign(ty - cy) * 11, tx, ty);
  marker(parent, tx, ty);
  callout(n, parent, cx, cy);
};
const heading = (parent, title, intro, gap = 10) => {
  const s = stack('Title', 'VERTICAL', gap);
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

const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 2900;
fill(root, 'wireframe/panel');
root.resize(1232, 100);
root.layoutSizingHorizontal = 'FIXED';
for (const [c, m] of [
  ['Brand', 'base'],
  ['Appearance', 'light'],
  ['Density', 'standard']
])
  root.setExplicitVariableModeForCollection(col(c), mode(col(c), m));
root.setExplicitVariableModeForCollection(wf, L);
const header = stack('Header', 'VERTICAL', 48, [64, 72, 96, 72]);
fill(header, 'wireframe/canvas');
root.appendChild(header);
header.layoutSizingHorizontal = 'FILL';
const title = stack('Title', 'VERTICAL', 28);
title.appendChild(text('ACTIONS / BUTTON', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Button', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'A button starts an action or moves the user to the next step of a task. It shows a short text label, with an optional icon before it and an optional icon, counter or keyboard shortcut after it. When the button leads to another page, the same component is rendered as a link.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'HORIZONTAL', 16, [32, 16, 32, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
hero.appendChild(btn({ label: 'Create project', lead: true }));
hero.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Cancel' }));
hero.appendChild(btn({ a: 'ghost', label: 'Learn more', trail: 'icon' }));
hero.appendChild(btn({ i: 'danger', label: 'Delete', lead: true, leadIcon: 'trash' }));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/actions/button) are the reference. This page documents the Figma component set “Button”; every button shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
    'body/sm',
    'color/content/tertiary',
    900
  )
);
const hdiv = figma.createFrame();
hdiv.name = 'Divider';
hdiv.resize(100, 1);
fill(hdiv, 'wireframe/divider');
header.appendChild(hdiv);
hdiv.layoutSizingHorizontal = 'FILL';
const an = stack('Anatomy', 'VERTICAL', 32);
header.appendChild(an);
an.layoutSizingHorizontal = 'FILL';
heading(
  an,
  'Anatomy',
  'How a button is built. The drawing is simplified and not to scale; the real button is shown underneath.'
);
const anRow = stack('Anatomy row', 'HORIZONTAL', 44);
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
stroke(ring, 'wireframe/tint/48', 5, null, 'OUTSIDE');
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
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
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
legend.layoutSizingHorizontal = 'FILL';
legend.layoutSizingVertical = 'FILL';
an.appendChild(anRow);
anRow.layoutSizingHorizontal = 'FILL';
dg.layoutSizingVertical = 'FILL';
const spRow = stack('Spacing row', 'HORIZONTAL', 44);
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
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  sd.appendChild(l);
  for (const tx of [x, x + w]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.rotation = 90;
    t.x = SX + tx;
    t.y = y + 4;
    stroke(t, 'wireframe/ink', 1.5, null, 'CENTER');
    sd.appendChild(t);
  }
  callout(ch, sd, SX + x + w / 2, y + 24);
};
dim('A', 0, 40);
dim('C', 40, 8);
dim('C', 108, 8);
dim('B', 116, 24);
spRow.appendChild(sd);
const spCard = stack('Spacing legend', 'VERTICAL', 12);
fill(spCard, 'wireframe/canvas');
spCard.cornerRadius = 12;
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
spCard.layoutSizingHorizontal = 'FILL';
spCard.layoutSizingVertical = 'FILL';
an.appendChild(spRow);
spRow.layoutSizingHorizontal = 'FILL';
const real = stack('Real parts', 'HORIZONTAL', 32, 28);
fill(real, 'wireframe/panel');
stroke(real, 'wireframe/card-border-accent', 1);
real.cornerRadius = 12;
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
const rdiv = figma.createFrame();
rdiv.name = 'Divider';
rdiv.resize(100, 1);
fill(rdiv, 'wireframe/divider');
root.appendChild(rdiv);
rdiv.layoutSizingHorizontal = 'FILL';
return { root: root.id };

// ---- Part 2 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync('<root id returned by part 1>');
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
const stroke = (node, name, w = 1, dash, align = 'INSIDE') => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  node.dashPattern = dash || [];
  node.strokeAlign = align;
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
  if (Array.isArray(pad)) {
    [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = pad;
  } else if (pad) {
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
  }
  f.clipsContent = false;
  return f;
};
const card = (name, dir = 'HORIZONTAL', gap = 24, pad = 28) => {
  const f = stack(name, dir, gap, pad);
  fill(f, 'wireframe/card');
  stroke(f, 'wireframe/card-border', 1);
  f.cornerRadius = 12;
  return f;
};
const panel = (name, dir = 'VERTICAL', gap = 12, pad = 24) => {
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
  const c = stack('Caption', 'HORIZONTAL', 0, [3, 8, 3, 8]);
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
const body = stack('Body', 'VERTICAL', 64, [64, 72, 96, 72]);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const section = (title, intro) => {
  const s = stack(title, 'VERTICAL', 32);
  const t = stack('Title', 'VERTICAL', 20);
  const hd = stack('Heading', 'HORIZONTAL', 12);
  hd.counterAxisAlignItems = 'CENTER';
  const dot = figma.createFrame();
  dot.name = 'Bullet';
  dot.resize(8, 8);
  dot.cornerRadius = 4;
  fill(dot, 'wireframe/ink');
  hd.appendChild(dot);
  hd.appendChild(text(title, 'heading/lg'));
  t.appendChild(hd);
  if (intro) t.appendChild(text(intro, 'body/md', 'color/content/secondary', 1000));
  s.appendChild(t);
  const c = stack('Content', 'VERTICAL', 20);
  s.appendChild(c);
  body.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  c.layoutSizingHorizontal = 'FILL';
  return c;
};

const va = section(
  'Variants',
  'Intent says what the action means: accent for the main action, neutral for secondary actions, danger for actions that delete or cannot be undone. Appearance sets the visual weight: solid, outline or ghost. Size follows the density of the surrounding interface. The brand, the light or dark appearance and the density come from the modes of the frame, not from the component.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const grid = card('Intent × appearance', 'VERTICAL', 12);
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
grid.layoutSizingHorizontal = 'FILL';
const sizes = card('Sizes', 'HORIZONTAL', 12);
sizes.counterAxisAlignItems = 'MIN';
for (const s of ['sm', 'md', 'lg']) sizes.appendChild(caption(btn({ s, label: 'Continue', lead: true }), `size ${s}`));
vrow.appendChild(sizes);
sizes.layoutSizingHorizontal = 'FILL';
sizes.layoutSizingVertical = 'FILL';
const ctx = stack('Contexts', 'HORIZONTAL', 24);
va.appendChild(ctx);
ctx.layoutSizingHorizontal = 'FILL';
for (const [b, a] of [
  ['base', 'light'],
  ['base', 'dark'],
  ['brick', 'light'],
  ['brick', 'dark'],
  ['orchid', 'light'],
  ['orchid', 'dark']
]) {
  const f = stack(`${b} ${a}`, 'VERTICAL', 12, 20);
  f.cornerRadius = 12;
  f.counterAxisAlignItems = 'CENTER';
  if (a === 'light') {
    fill(f, 'wireframe/card');
    stroke(f, 'wireframe/card-border', 1);
  } else {
    fill(f, 'color/surface/canvas');
    stroke(f, 'color/border/subtle', 1);
  }
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.appendChild(text(`${b} · ${a}`, 'label/sm', 'color/content/secondary'));
  for (const ap of ['solid', 'outline', 'ghost']) f.appendChild(btn({ a: ap, label: 'Continue' }));
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}

const st = section(
  'States',
  'A button has five states: default, hover, pressed, loading and disabled. Focus is a separate switch that can be combined with any state. While loading, the button keeps its width and can still receive focus. When disabled, it cannot be focused or activated. If a button is both loading and disabled, it looks disabled and keeps its loading indicator.'
);
const states = ['default', 'hover', 'pressed', 'focus', 'loading', 'disabled'];
for (const ap of ['light', 'dark']) {
  const block = ap === 'light' ? card(`States ${ap}`, 'VERTICAL', 12, 44) : stack(`States ${ap}`, 'VERTICAL', 12, 44);
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
const combo = card('Combinations', 'HORIZONTAL', 32);
combo.counterAxisAlignItems = 'MIN';
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
const dens = card('Density × size', 'HORIZONTAL', 12);
bs.appendChild(dens);
dens.layoutSizingHorizontal = 'FILL';
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
  f.layoutSizingHorizontal = 'FILL';
  f.layoutSizingVertical = 'FILL';
}
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
bs.appendChild(brow);
brow.layoutSizingHorizontal = 'FILL';
const tr = card('Truncation', 'VERTICAL', 24);
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
const tgt = card('Target', 'HORIZONTAL', 24);
tgt.counterAxisAlignItems = 'CENTER';
const wrap = stack('Target outline', 'HORIZONTAL', 0);
wrap.appendChild(btn({ s: 'sm', label: 'Edit' }));
stroke(wrap, 'wireframe/ink', 1, [4, 4], 'OUTSIDE');
wrap.cornerRadius = 4;
tgt.appendChild(
  caption(
    wrap,
    'a small button is 32 px tall in standard density, but the area that reacts to clicks (dashed) is 44 px tall'
  )
);
brow.appendChild(tgt);
tgt.layoutSizingHorizontal = 'FILL';
tgt.layoutSizingVertical = 'FILL';

const ue = section(
  'Usage examples',
  'Use one solid accent button per area for the main action. Use outline or ghost neutral buttons for secondary actions. Use the danger intent for actions that delete something or cannot be undone. Keep labels short and start them with a verb. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
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
return { h: Math.round(root.height) };
