// Button specification page builder (use_figma bodies), 2026-10-12. Run the parts in order; part 1 creates the
// Wireframe collection when missing and the frame “Button — Specification”, part 2 redraws the anatomy diagrams
// (replace the root id with the one part 1 returned), part 3 adds States, Behavior & sizing and Usage examples.
// IDs (page 8:4, set 48:1586, property keys, fixture icon names) come from reports/components/button/figma/ledger.json.

// ---- Part 1 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter(
  (n) => n.name === 'Button — Specification' || n.name.startsWith('_parity') || n.name === '_probe'
))
  n.remove();
const set = await figma.getNodeByIdAsync('48:1586');
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
// Wireframe collection (grays aliased to the neutral primitives), reused if present
let wf = col('Wireframe');
if (!wf) {
  wf = figma.variables.createVariableCollection('Wireframe');
  wf.renameMode(wf.modes[0].modeId, 'default');
  const P = (n) => vars.find((v) => v.name === 'primitive/color/neutral/' + n);
  const defs = {
    'wireframe/canvas': '0',
    'wireframe/root': '50',
    'wireframe/container': '200',
    'wireframe/icon-box': '300',
    'wireframe/slot': '500',
    'wireframe/label': '600',
    'wireframe/outline': '700',
    'wireframe/overlay': '900',
    'wireframe/annotation': '900',
    'wireframe/on-dark': '0',
    'wireframe/spacing/edge': '400',
    'wireframe/spacing/label': '300',
    'wireframe/spacing/slot': '200'
  };
  for (const [name, step] of Object.entries(defs)) {
    const v = figma.variables.createVariable(name, wf, 'COLOR');
    v.scopes = ['ALL_FILLS', 'STROKE_COLOR'];
    v.setValueForMode(wf.modes[0].modeId, figma.variables.createVariableAlias(P(step)));
  }
  vars = await figma.variables.getLocalVariablesAsync();
}
const V = (name) => vars.find((v) => v.name === name);
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
for (const st of ['Medium', 'Semi Bold', 'Regular']) await figma.loadFontAsync({ family: 'Inter', style: st });
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash) => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  if (dash) node.dashPattern = dash;
};
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
const caption = (inst, cap) => {
  const f = stack('Example', 'VERTICAL', 8);
  f.appendChild(inst);
  f.appendChild(text(cap, 'caption/md', 'color/content/secondary'));
  return f;
};
const root = stack('Button — Specification', 'VERTICAL', 64, 64);
root.x = 0;
root.y = 2900;
fill(root, 'color/surface/canvas');
for (const [c, m] of [
  ['Brand', 'base'],
  ['Appearance', 'light'],
  ['Density', 'standard']
])
  root.setExplicitVariableModeForCollection(col(c), mode(col(c), m));
const section = (title, intro) => {
  const s = stack(title, 'VERTICAL', 24);
  s.appendChild(text(title, 'heading/lg'));
  if (intro) s.appendChild(text(intro, 'body/md', 'color/content/secondary', 1000));
  root.appendChild(s);
  return s;
};

// Overview
const ov = section('Overview');
ov.appendChild(text('Button', 'display/sm'));
ov.appendChild(
  text(
    'A button starts an action or moves the user to the next step of a task. It shows a short text label, with an optional icon before it and an optional icon, counter or keyboard shortcut after it. When the button leads to another page, the same component is rendered as a link.',
    'body/lg',
    'color/content/secondary',
    1000
  )
);
ov.appendChild(
  text(
    'The contract and the code in the ggbrick repository (components/actions/button) are the reference. This page documents the Figma component set “Button” on this page. Every button shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
    'body/sm',
    'color/content/tertiary',
    1000
  )
);
const hero = stack('Hero', 'HORIZONTAL', 12);
hero.counterAxisAlignItems = 'CENTER';
hero.appendChild(btn({ label: 'Create project', lead: true }));
hero.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Cancel' }));
hero.appendChild(btn({ a: 'ghost', label: 'Learn more', trail: 'icon' }));
hero.appendChild(btn({ i: 'danger', label: 'Delete', lead: true, leadIcon: 'trash' }));
ov.appendChild(hero);

// Anatomy: grayscale diagram at 2x of md · standard
const an = section(
  'Anatomy',
  'The diagram shows how a button is built. Gray levels come from the Wireframe collection; they are not the colors of the real component. The example on the right is the real button with the same parts.'
);
const row = stack('Anatomy row', 'HORIZONTAL', 48);
row.counterAxisAlignItems = 'MIN';
const dg = figma.createFrame();
dg.name = 'Anatomy diagram';
dg.resize(392, 200);
fill(dg, 'wireframe/canvas');
dg.cornerRadius = 8;
dg.clipsContent = false;
const rect = (name, x, y, w, h, fillName, r = 0) => {
  const f = figma.createFrame();
  f.name = name;
  f.x = x;
  f.y = y;
  f.resize(w, h);
  f.cornerRadius = r;
  f.clipsContent = false;
  if (fillName) fill(f, fillName);
  else f.fills = [];
  dg.appendChild(f);
  return f;
};
const OX = 40,
  OY = 36; // root origin inside the diagram
const rootR = rect('1 Root', OX, OY, 308, 88, 'wireframe/root');
stroke(rootR, 'wireframe/outline', 2, [6, 4]);
const ring = rect('7 Focus ring', OX - 4, OY, 316, 88, null, 16);
stroke(ring, 'wireframe/outline', 4);
ring.strokeAlign = 'OUTSIDE';
const cont = rect('2 Container', OX, OY + 4, 308, 80, 'wireframe/container', 12);
const slot = (name, x) => {
  rect(name + ' (icon box)', OX + x - 5, OY + 24, 40, 40, 'wireframe/icon-box', 4);
  rect(name + ' (drawing)', OX + x, OY + 24, 30, 40, 'wireframe/slot', 2);
};
slot('3 Leading', 24);
slot('5 Trailing', 254);
rect('4 Label', OX + 70, OY + 24, 168, 40, 'wireframe/label', 4);
const ld = figma.createEllipse();
ld.name = '6 Loading indicator';
ld.x = OX + 134;
ld.y = OY + 24;
ld.resize(40, 40);
ld.fills = [];
stroke(ld, 'wireframe/overlay', 3, [5, 4]);
dg.appendChild(ld);
// spacing bands under the root
const band = (name, x, w, fillName) => rect(name, OX + x, OY + 100, w, 6, fillName);
for (const [x, w] of [
  [0, 20],
  [288, 20]
])
  band('A edge padding', x, w, 'wireframe/spacing/edge');
for (const [x, w] of [
  [58, 12],
  [238, 12]
])
  band('B label margin', x, w, 'wireframe/spacing/label');
for (const [x, w] of [
  [20, 4],
  [54, 4],
  [250, 4],
  [284, 4]
])
  band('C slot margin', x, w, 'wireframe/spacing/slot');
const letter = (ch, x) => {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: 'Semi Bold' };
  t.fontSize = 11;
  t.characters = ch;
  fill(t, 'wireframe/annotation');
  t.textAlignHorizontal = 'CENTER';
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.x = OX + x - t.width / 2;
  t.y = OY + 110;
  dg.appendChild(t);
};
letter('A', 10);
letter('C', 22);
letter('C', 56);
letter('B', 64);
letter('B', 244);
letter('C', 252);
letter('C', 286);
letter('A', 298);
const callout = (n, cx, cy, parent = dg) => {
  const g = figma.createFrame();
  g.name = 'Callout ' + n;
  g.resize(22, 22);
  g.cornerRadius = 11;
  fill(g, 'wireframe/annotation');
  g.layoutMode = 'HORIZONTAL';
  g.primaryAxisAlignItems = 'CENTER';
  g.counterAxisAlignItems = 'CENTER';
  g.primaryAxisSizingMode = 'FIXED';
  g.counterAxisSizingMode = 'FIXED';
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: 'Semi Bold' };
  t.fontSize = 12;
  t.characters = String(n);
  fill(t, 'wireframe/on-dark');
  g.appendChild(t);
  parent.appendChild(g);
  if (parent === dg) {
    g.x = cx - 11;
    g.y = cy - 11;
  }
  return g;
};
callout(1, OX + 290, OY + 88);
callout(2, OX + 100, OY + 4);
callout(3, OX + 39, OY + 44);
callout(4, OX + 190, OY + 44);
callout(5, OX + 269, OY + 44);
callout(6, OX + 154, OY + 20);
callout(7, OX - 4, OY + 44);
row.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 10);
const items = [
  'Root: the area that reacts to clicks and taps. It is at least 44 px tall, even when the visible button is smaller.',
  'Container: the visible button, with its background, border, corner radius and side padding.',
  'Leading: an optional icon before the label.',
  'Label: the text of the button. It is required and gives the button its name for screen readers.',
  'Trailing: an optional element after the label, which can be an icon, a counter or a keyboard shortcut.',
  'Loading indicator: shown in the middle while the action runs. The other content is hidden but keeps its place, so the width does not change.',
  'Focus ring: drawn 2 px outside the container when the button is focused with the keyboard.'
];
items.forEach((s, k) => {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  callout(k + 1, 0, 0, r);
  r.appendChild(text(s, 'body/sm', 'color/content/secondary', 520));
  legend.appendChild(r);
});
legend.appendChild(
  text(
    'Spacing: A is the side padding of the container, B the margin on each side of the label, C the margin on each side of an icon, counter or shortcut. An icon is placed by its drawing (dark box) rather than by its full square (light box), so it looks as close to the text as a counter does.',
    'body/sm',
    'color/content/secondary',
    552
  )
);
row.appendChild(legend);
an.appendChild(row);
const real = stack('Real parts', 'HORIZONTAL', 16);
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
    'the real button with a leading icon, a trailing icon and the focus ring'
  )
);
an.appendChild(real);
an.appendChild(
  text(
    'In Figma, the label is a text property. “Show leading” and “Show trailing” add the optional parts; the leading icon is chosen by its name, and the trailing item has a type (Icon, Counter or Shortcut). Intent, Appearance, Size and State are variants, and Focus is a separate switch.',
    'body/md',
    'color/content/secondary',
    1000
  )
);
const slots = stack('Slot combinations', 'HORIZONTAL', 16);
slots.counterAxisAlignItems = 'MAX';
slots.appendChild(caption(btn({ label: 'Continue' }), 'label only'));
slots.appendChild(caption(btn({ label: 'Add item', lead: true }), 'with a leading icon'));
slots.appendChild(caption(btn({ label: 'Next', trail: 'icon' }), 'with a trailing icon'));
slots.appendChild(
  caption(
    btn({ a: 'outline', i: 'neutral', label: 'Inbox', lead: true, leadIcon: 'check', trail: 'counter' }),
    'with a leading icon and a counter'
  )
);
slots.appendChild(
  caption(btn({ a: 'ghost', i: 'neutral', label: 'Search', trail: 'shortcut' }), 'with a keyboard shortcut')
);
an.appendChild(slots);

// Variants
const va = section(
  'Variants',
  'Intent says what the action means: accent for the main action, neutral for secondary actions, danger for actions that delete or cannot be undone. Appearance sets the visual weight: solid, outline or ghost. Size follows the density of the surrounding interface. The brand, the light or dark appearance and the density come from the modes of the frame, not from the component.'
);
const grid = stack('Intent × appearance', 'VERTICAL', 12);
for (const i of ['accent', 'neutral', 'danger']) {
  const r = stack(i, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  const l = text(i, 'label/md', 'color/content/secondary');
  l.textAutoResize = 'NONE';
  l.resize(80, l.height);
  r.appendChild(l);
  for (const a of ['solid', 'outline', 'ghost'])
    r.appendChild(btn({ i, a, label: i === 'danger' ? 'Delete' : 'Continue' }));
  grid.appendChild(r);
}
va.appendChild(grid);
const sizes = stack('Sizes', 'HORIZONTAL', 16);
sizes.counterAxisAlignItems = 'MAX';
for (const s of ['sm', 'md', 'lg']) sizes.appendChild(caption(btn({ s, label: 'Continue', lead: true }), `size ${s}`));
va.appendChild(sizes);
const ctx = stack('Contexts', 'HORIZONTAL', 0);
for (const [b, a] of [
  ['base', 'light'],
  ['base', 'dark'],
  ['brick', 'light'],
  ['brick', 'dark'],
  ['orchid', 'light'],
  ['orchid', 'dark']
]) {
  const f = stack(`${b} ${a}`, 'VERTICAL', 12, 24);
  fill(f, 'color/surface/canvas');
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.appendChild(text(`${b} · ${a}`, 'label/sm', 'color/content/secondary'));
  for (const ap of ['solid', 'outline', 'ghost']) f.appendChild(btn({ a: ap, label: 'Continue' }));
  ctx.appendChild(f);
}
va.appendChild(ctx);
return { root: root.id, wf: wf.id, diagram: dg.id };

// ---- Part 2 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync('105:1579');
const an = root.findOne((n) => n.name === 'Anatomy');
const row = an.findOne((n) => n.name === 'Anatomy row');
row.findOne((n) => n.name === 'Anatomy diagram').remove();
const legend = row.findOne((n) => n.name === 'Legend');
legend.children[legend.children.length - 1].remove(); // old spacing paragraph
for (const n of an.findAll((x) => x.name === 'Spacing row')) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name);
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash) => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  if (dash) node.dashPattern = dash;
};
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
const mk = (dg) => ({
  rect: (name, x, y, w, h, fillName, r = 0) => {
    const f = figma.createFrame();
    f.name = name;
    f.x = x;
    f.y = y;
    f.resize(w, h);
    f.cornerRadius = r;
    f.clipsContent = false;
    if (fillName) fill(f, fillName);
    else f.fills = [];
    dg.appendChild(f);
    return f;
  },
  letter: (ch, x, y) => {
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: 'Semi Bold' };
    t.fontSize = 11;
    t.characters = ch;
    fill(t, 'wireframe/annotation');
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
    t.x = x - t.width / 2;
    t.y = y;
    dg.appendChild(t);
    return t;
  },
  callout: (n, cx, cy) => {
    const g = figma.createFrame();
    g.name = 'Callout ' + n;
    g.resize(22, 22);
    g.cornerRadius = 11;
    fill(g, 'wireframe/annotation');
    g.layoutMode = 'HORIZONTAL';
    g.primaryAxisAlignItems = 'CENTER';
    g.counterAxisAlignItems = 'CENTER';
    g.primaryAxisSizingMode = 'FIXED';
    g.counterAxisSizingMode = 'FIXED';
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: 'Semi Bold' };
    t.fontSize = 12;
    t.characters = String(n);
    fill(t, 'wireframe/on-dark');
    g.appendChild(t);
    dg.appendChild(g);
    g.x = cx - 11;
    g.y = cy - 11;
    return g;
  }
});
// Structure diagram, 2x of md · standard; the root is drawn taller than it is so that its outline stays visible
const dg = figma.createFrame();
dg.name = 'Anatomy diagram';
dg.resize(392, 176);
fill(dg, 'wireframe/canvas');
dg.cornerRadius = 8;
dg.clipsContent = false;
const d = mk(dg);
const OX = 42,
  OY = 24;
const rootR = d.rect('1 Root', OX, OY, 308, 112, 'wireframe/root', 4);
stroke(rootR, 'wireframe/outline', 2, [6, 4]);
const ring = d.rect('7 Focus ring', OX - 4, OY + 12, 316, 88, null, 16);
stroke(ring, 'wireframe/outline', 4);
ring.strokeAlign = 'OUTSIDE';
d.rect('2 Container', OX, OY + 16, 308, 80, 'wireframe/container', 12);
const slot = (name, x) => {
  d.rect(name + ' (icon box)', OX + x - 5, OY + 36, 40, 40, 'wireframe/icon-box', 4);
  d.rect(name + ' (drawing)', OX + x, OY + 36, 30, 40, 'wireframe/slot', 2);
};
slot('3 Leading', 24);
slot('5 Trailing', 254);
d.rect('4 Label', OX + 70, OY + 36, 168, 40, 'wireframe/label', 4);
const ld = figma.createEllipse();
ld.name = '6 Loading indicator';
ld.x = OX + 134;
ld.y = OY + 36;
ld.resize(40, 40);
ld.fills = [];
stroke(ld, 'wireframe/overlay', 3, [5, 4]);
dg.appendChild(ld);
d.callout(1, OX + 154, OY + 112);
d.callout(2, OX + 100, OY + 16);
d.callout(3, OX + 39, OY + 56);
d.callout(4, OX + 200, OY + 56);
d.callout(5, OX + 269, OY + 56);
d.callout(6, OX + 154, OY + 32);
d.callout(7, OX - 6, OY + 56);
row.insertChild(0, dg);
legend.appendChild(
  text(
    'The diagram is not to scale: the root is drawn taller than it really is so that its outline stays visible next to the focus ring.',
    'caption/md',
    'color/content/tertiary',
    552
  )
);
// Spacing diagram, 4x zoom on the left half of a md · standard button
const sp = stack('Spacing row', 'HORIZONTAL', 48);
sp.counterAxisAlignItems = 'MIN';
const sd = figma.createFrame();
sd.name = 'Spacing diagram';
sd.resize(392, 176);
fill(sd, 'wireframe/canvas');
sd.cornerRadius = 8;
sd.clipsContent = true;
const s = mk(sd);
const SX = 24,
  SY = 24;
const cont = s.rect('Container (zoom)', SX, SY, 500, 112, 'wireframe/container', 24);
s.rect('Icon box', SX + 40 + 8 - 10, SY + 16, 80, 80, 'wireframe/icon-box', 8);
s.rect('Icon drawing', SX + 48, SY + 16, 60, 80, 'wireframe/slot', 4);
s.rect('Label', SX + 140, SY + 16, 400, 80, 'wireframe/label', 8);
const bands = [
  ['A', 0, 40, 'edge'],
  ['C', 40, 8, 'slot'],
  ['C', 108, 8, 'slot'],
  ['B', 116, 24, 'label']
];
for (const [ch, x, w, k] of bands) {
  s.rect(`${ch} ${k}`, SX + x, SY + 120, w, 8, 'wireframe/spacing/' + k);
  s.letter(ch, SX + x + w / 2, SY + 132);
}
sp.appendChild(sd);
sp.appendChild(
  text(
    'Spacing, zoomed in. A is the side padding of the container. B is the margin on each side of the label. C is the margin on each side of an icon, a counter or a shortcut. An icon is placed by its drawing (dark box) rather than by its full square (light box), so it looks as close to the text as a counter would. The right side of the button mirrors the left side.',
    'body/sm',
    'color/content/secondary',
    552
  )
);
an.insertChild(an.children.indexOf(row) + 1, sp);
return { dg: dg.id, sd: sd.id };

// ---- Part 3 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('8:4');
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync('105:1579');
for (const n of root.children.filter((n) => ['States', 'Behavior & sizing', 'Usage examples'].includes(n.name)))
  n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const wf = col('Wireframe');
const wm = wf.modes[0].modeId;
for (const [k, step] of [
  ['edge', '300'],
  ['label', '400'],
  ['slot', '700']
])
  V('wireframe/spacing/' + k).setValueForMode(
    wm,
    figma.variables.createVariableAlias(V('primitive/color/neutral/' + step))
  );
for (const b of (await figma.getNodeByIdAsync('106:834')).children.filter((n) => /^[ABC] /.test(n.name)))
  b.resize(b.width, 10);
const set = await figma.getNodeByIdAsync('48:1586');
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const stroke = (node, name, w = 1, dash) => {
  node.strokes = [paint(name)];
  node.strokeWeight = w;
  if (dash) node.dashPattern = dash;
};
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
const caption = (inst, cap) => {
  const f = stack('Example', 'VERTICAL', 8);
  f.appendChild(inst);
  f.appendChild(text(cap, 'caption/md', 'color/content/secondary'));
  return f;
};
const section = (title, intro) => {
  const s = stack(title, 'VERTICAL', 24);
  s.appendChild(text(title, 'heading/lg'));
  if (intro) s.appendChild(text(intro, 'body/md', 'color/content/secondary', 1000));
  root.appendChild(s);
  return s;
};
const label = (s, w = 80) => {
  const l = text(s, 'label/md', 'color/content/secondary');
  l.textAutoResize = 'NONE';
  l.resize(w, l.height);
  return l;
};

const st = section(
  'States',
  'A button has five states: default, hover, pressed, loading and disabled. Focus is a separate switch that can be combined with any state. While loading, the button keeps its width and can still receive focus. When disabled, it cannot be focused or activated. If a button is both loading and disabled, it looks disabled and keeps its loading indicator.'
);
const states = ['default', 'hover', 'pressed', 'focus', 'loading', 'disabled'];
const head = stack('Header', 'HORIZONTAL', 16);
head.paddingLeft = 24;
head.appendChild(label('', 120));
for (const t of states) head.appendChild(label(t, 130));
st.appendChild(head);
for (const ap of ['light', 'dark']) {
  const block = stack(`States ${ap}`, 'VERTICAL', 12, 24);
  fill(block, 'color/surface/canvas');
  block.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
  block.appendChild(text(`base brand, ${ap} appearance`, 'label/sm', 'color/content/secondary'));
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
}
const combo = stack('Combinations', 'HORIZONTAL', 24);
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

const bs = section(
  'Behavior & sizing',
  'A button is as wide as its content. When there is not enough room, the label is shortened with an ellipsis and the icons keep their place. To try this in Figma, give the instance a fixed width, then set Container, Label and Text to “Fill”. The height depends on the size and on the density of the frame: compact, standard or comfortable.'
);
const dens = stack('Density × size', 'HORIZONTAL', 0);
for (const d of ['compact', 'standard', 'comfortable']) {
  const f = stack(d, 'VERTICAL', 12, 24);
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
const tr = stack('Truncation', 'VERTICAL', 12);
for (const [w, o] of [
  [180, { label: 'Export all selected invoices as PDF', lead: true, leadIcon: 'download-simple' }],
  [180, { a: 'outline', i: 'neutral', label: 'Notifications from every project', trail: 'counter' }],
  [160, { a: 'ghost', label: 'Continue to the payment step', trail: 'icon' }]
]) {
  const b = btn(o);
  tr.appendChild(caption(b, `the same button limited to ${w} px: the label is shortened, the icons stay in place`));
  b.layoutSizingHorizontal = 'FIXED';
  b.resize(w, b.height);
  for (const n of ['Container', 'Label']) b.findOne((x) => x.name === n).layoutSizingHorizontal = 'FILL';
  b.findOne((x) => x.type === 'TEXT' && x.name === 'Text').layoutSizingHorizontal = 'FILL';
}
bs.appendChild(tr);
const tgt = stack('Target', 'HORIZONTAL', 24);
tgt.counterAxisAlignItems = 'CENTER';
const wrap = stack('Target outline', 'HORIZONTAL', 0);
wrap.appendChild(btn({ s: 'sm', label: 'Edit' }));
stroke(wrap, 'color/border/strong', 1, [4, 4]);
wrap.strokeAlign = 'OUTSIDE';
tgt.appendChild(
  caption(
    wrap,
    'a small button is 32 px tall in standard density, but the area that reacts to clicks (dashed) is 44 px tall'
  )
);
bs.appendChild(tgt);

const ue = section(
  'Usage examples',
  'Use one solid accent button per area for the main action. Use outline or ghost neutral buttons for secondary actions. Use the danger intent for actions that delete something or cannot be undone. Keep labels short and start them with a verb. The full guidance will be in the documentation page of the component.'
);
const ex = stack('Examples', 'HORIZONTAL', 32);
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
const bar = stack('Toolbar', 'HORIZONTAL', 4, 8);
fill(bar, 'color/surface/subtle');
bar.cornerRadius = 8;
bar.counterAxisAlignItems = 'CENTER';
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Share' }));
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Download', lead: true, leadIcon: 'download-simple' }));
bar.appendChild(btn({ s: 'sm', a: 'ghost', i: 'neutral', label: 'Search', trail: 'shortcut' }));
ex.appendChild(caption(bar, 'a toolbar with small ghost buttons'));
const form = stack('Form', 'HORIZONTAL', 8);
form.appendChild(btn({ t: 'loading', label: 'Save changes', focus: true }));
form.appendChild(btn({ a: 'ghost', i: 'neutral', label: 'Discard' }));
ex.appendChild(caption(form, 'saving a form: the button keeps its width and its focus while loading'));
ue.appendChild(ex);
const dark = stack('Dark header', 'HORIZONTAL', 12, 24);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.counterAxisAlignItems = 'CENTER';
dark.appendChild(text('Projects', 'heading/sm'));
dark.appendChild(btn({ a: 'outline', i: 'neutral', label: 'Import' }));
dark.appendChild(btn({ label: 'Create project', lead: true }));
ue.appendChild(caption(dark, 'a page header in the orchid brand, dark appearance'));
return root.children.map((n) => [n.id, n.name]);
