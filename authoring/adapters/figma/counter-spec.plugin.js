// Counter specification page builder (use_figma body), 2026-10-14. One call builds the frame
// “Counter — Specification” on the page content/counter (149:1547), following the Button specification layout
// (white header on a gray page, hero card, blueprint Anatomy board with the _Spec/* documentation components and the
// Wireframe collection, white cards with a light border in the body). Explanatory instances of the Counter master
// (149:1568) only; no master is modified. Node ids and property keys come from
// reports/components/counter/figma/ledger.json. Rerunning the script replaces the frame.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:1547');
await figma.setCurrentPageAsync(page);
const NAME = 'Counter — Specification';
for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const wf = col('Wireframe');
const L = mode(wf, 'light'),
  B = mode(wf, 'blueprint');
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
const boardC = await figma.getNodeByIdAsync('113:17');
const callC = await figma.getNodeByIdAsync('115:6');
const markC = await figma.getNodeByIdAsync('115:8');
const numKey = Object.keys(callC.componentPropertyDefinitions)[0];
const set = await figma.getNodeByIdAsync('149:1568');
const P = { value: 'Value#149:6', overflow: 'Overflow text#149:13' };
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
const panel = (name, dir = 'VERTICAL', gap = 12, pad = 24) => {
  const f = stack(name, dir, gap, pad);
  fill(f, 'wireframe/panel');
  f.cornerRadius = 12;
  return f;
};
const board = (name, w, h) => {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.clipsContent = false;
  f.cornerRadius = 12;
  f.fills = boardC.fills;
  stroke(f, 'wireframe/card', 8, null, 'OUTSIDE');
  shadow(f);
  f.setExplicitVariableModeForCollection(wf, B);
  return f;
};
const variant = (s, o) => set.children.find((c) => c.name === `Size=${s}, Overflow=${o}`);
// Counter instance: o.s size, o.v value, o.over overflow, o.text overflow text.
const ctr = (o = {}) => {
  const inst = variant(o.s || 'md', !!o.over).createInstance();
  inst.setProperties({ [P.value]: o.v === undefined ? '8' : String(o.v), [P.overflow]: o.text || '99+' });
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
// A label with a counter after it, aligned on the text line (the integration case).
const labelled = (chars, o = {}, style = 'label/md') => {
  const r = stack('Labelled', 'HORIZONTAL', 6);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(text(chars, style));
  r.appendChild(ctr(o));
  return r;
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
// Callout at (cx, cy) joined to the marker at (tx, ty); the leader starts at the callout's rim.
const pin = (parent, n, cx, cy, tx, ty) => {
  const d = Math.hypot(tx - cx, ty - cy) || 1;
  leader(parent, cx + ((tx - cx) / d) * 11, cy + ((ty - cy) / d) * 11, tx, ty);
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
const divider = (parent) => {
  const d = figma.createFrame();
  d.name = 'Divider';
  d.resize(100, 1);
  fill(d, 'wireframe/divider');
  parent.appendChild(d);
  d.layoutSizingHorizontal = 'FILL';
};

const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 400;
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

// ---- Header: title, summary, hero, reference note, Anatomy ----
const header = stack('Header', 'VERTICAL', 48, [64, 72, 96, 72]);
fill(header, 'wireframe/canvas');
root.appendChild(header);
header.layoutSizingHorizontal = 'FILL';
const title = stack('Title', 'VERTICAL', 28);
title.appendChild(text('CONTENT / COUNTER', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Counter', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'A counter shows a quantity, such as unread messages, items or selected rows, as a small rectangle next to the thing it counts. It is drawn in the color of the surrounding text, with a thin lighter border and no fill, so it follows its host: a tab label, a list header or a button. Above its maximum it shows the maximum followed by a plus sign, 99+ by default.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'HORIZONTAL', 40, [32, 16, 32, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
hero.appendChild(labelled('Inbox', { v: 8 }));
hero.appendChild(labelled('Notifications', { over: true }));
hero.appendChild(labelled('Selected', { v: 42, s: 'lg' }, 'label/lg'));
hero.appendChild(labelled('Drafts', { v: 3, s: 'sm' }, 'label/sm'));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/content/counter) are the reference. This page documents the Figma component set “Counter”; every counter shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
    'body/sm',
    'color/content/tertiary',
    900
  )
);
divider(header);
const an = stack('Anatomy', 'VERTICAL', 32);
header.appendChild(an);
an.layoutSizingHorizontal = 'FILL';
heading(
  an,
  'Anatomy',
  'How a counter is built. The drawing is enlarged eight times and simplified; real counters are shown underneath.'
);
const anRow = stack('Anatomy row', 'HORIZONTAL', 44);
anRow.counterAxisAlignItems = 'MIN';
const dg = board('Anatomy diagram', 700, 340);
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
const digits = (parent, chars, size, w, h) => {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: 'Medium' };
  t.fontSize = size;
  t.characters = chars;
  t.textAlignHorizontal = 'CENTER';
  fill(t, 'wireframe/ink');
  parent.appendChild(t);
  t.x = (w - t.width) / 2;
  t.y = (h - t.height) / 2;
  return t;
};
// Two-digit md counter at ×8: height 16.8 → 134, side padding 4 → 32, digits 12 → 96, radius 4 → 32.
const k = 8,
  OX = 96,
  OY = 100,
  H = 134,
  PAD = 32,
  W = 2 * PAD + 128;
const cont = rect('1 Container', OX, OY, W, H, 'wireframe/tint/8', 32);
cont.clipsContent = true;
const padL = rect('Side padding', 0, 0, PAD, H, 'wireframe/tint/16', 0, cont);
const padR = rect('Side padding', W - PAD, 0, PAD, H, 'wireframe/tint/16', 0, cont);
padL.opacity = padR.opacity = 0.8;
const val = rect('2 Value', PAD, 0, W - 2 * PAD, H, null, 0, cont);
digits(val, '42', 96, W - 2 * PAD, H);
const bord = rect('3 Border', OX, OY, W, H, null, 32);
stroke(bord, 'wireframe/tint/48', 8);
// One-digit counter at ×8: a square, minimum width equal to the height.
const OX2 = OX + W + 150;
const sq = rect('Container (one digit)', OX2, OY, H, H, 'wireframe/tint/8', 32);
digits(sq, '8', 96, H, H);
const sqb = rect('Border (one digit)', OX2, OY, H, H, null, 32);
stroke(sqb, 'wireframe/tint/48', 8);
// Callouts: 1 container (top), 2 value (bottom), 3 border (right).
pin(dg, 1, OX + 40, 44, OX + 40, OY);
pin(dg, 2, OX + W / 2, OY + H + 96, OX + W / 2, OY + H - 24);
pin(dg, 3, OX + W + 72, OY + 32, OX + W - 4, OY + H / 2 - 30);
// Dimension lines: A side padding, B height (line box), C minimum width.
const dimH = (ch, x, w, y) => {
  const l = figma.createLine();
  l.resize(w, 0);
  l.x = x;
  l.y = y;
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  dg.appendChild(l);
  for (const tx of [x, x + w]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.rotation = 90;
    t.x = tx;
    t.y = y + 4;
    stroke(t, 'wireframe/ink', 1.5, null, 'CENTER');
    dg.appendChild(t);
  }
  callout(ch, dg, x + w / 2, y + 22);
};
const dimV = (ch, x, y, h) => {
  const l = figma.createLine();
  l.resize(h, 0);
  l.rotation = 90;
  l.x = x;
  l.y = y + h;
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  dg.appendChild(l);
  for (const ty of [y, y + h]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.x = x - 4;
    t.y = ty;
    stroke(t, 'wireframe/ink', 1.5, null, 'CENTER');
    dg.appendChild(t);
  }
  callout(ch, dg, x + 24, y + h / 2);
};
dimH('A', OX, PAD, OY + H + 20);
dimH('C', OX2, H, OY + H + 20);
dimV('B', OX2 + H + 24, OY, H);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
const items = [
  [
    '1',
    'Container: the box the host places. It has no fill, so whatever is behind shows through, and its corners are slightly rounded: a rectangle, not a pill.'
  ],
  [
    '2',
    'Value: the digits, centered, in the indicator type of the size with tabular figures, so counters with the same number of digits have the same width.'
  ],
  ['3', 'Border: a thin line just inside the edge, in the same color as the digits but lighter (70 %).'],
  ['A', 'Side padding, on both sides. It follows the density of the frame: 2, 4 or 6 px.'],
  [
    'B',
    'Height: the line box of the digits, with no vertical padding, so one and two digits sit in boxes of the same height.'
  ],
  ['C', 'Minimum width, equal to the height: a single digit sits in a square (at compact and standard density).']
];
for (const [n, s] of items) {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  callout(n, r);
  r.appendChild(text(s, 'body/sm', 'color/content/secondary', 316));
  legend.appendChild(r);
}
anRow.appendChild(legend);
legend.layoutSizingHorizontal = 'FILL';
legend.layoutSizingVertical = 'FILL';
an.appendChild(anRow);
anRow.layoutSizingHorizontal = 'FILL';
dg.layoutSizingVertical = 'FILL';
const real = stack('Real parts', 'HORIZONTAL', 32, 28);
fill(real, 'wireframe/panel');
stroke(real, 'wireframe/card-border-accent', 1);
real.cornerRadius = 12;
real.counterAxisAlignItems = 'MAX';
real.appendChild(caption(ctr({ s: 'sm', v: 8 }), 'size sm, one digit'));
real.appendChild(caption(ctr({ s: 'md', v: 42 }), 'size md, two digits'));
real.appendChild(caption(ctr({ s: 'lg', v: 8 }), 'size lg, one digit'));
real.appendChild(caption(ctr({ s: 'md', over: true }), 'overflow: above the maximum'));
real.appendChild(caption(ctr({ s: 'md', v: 0 }), 'zero is shown'));
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, the digits are the “Value” text property. Size is a variant, and Overflow is a switch: on, the counter shows the maximum followed by a plus sign; edit “Overflow text” for another maximum (999+). The brand, the light or dark appearance and the density come from the modes of the frame, not from the component.',
    'body/md',
    'color/content/secondary',
    1000
  )
);
divider(root);

// ---- Body: Variants, States, Behavior & sizing, Usage examples ----
const body = stack('Body', 'VERTICAL', 64, [64, 72, 96, 72]);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const label = (s, w = 80, color = 'color/content/secondary') => {
  const l = text(s, 'label/md', color);
  l.textAutoResize = 'NONE';
  l.resize(w, l.height);
  return l;
};
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
const cell = (inst, w = 72, h = 28) => {
  const c = stack('Cell', 'HORIZONTAL', 0);
  c.resize(w, h);
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.counterAxisAlignItems = 'CENTER';
  c.appendChild(inst);
  return c;
};

const va = section(
  'Variants',
  'Size follows the host: sm, md and lg are named like the Button sizes, and a counter inside a button takes the button’s size. The digits are one step smaller than the host’s label. The value is a whole number from 0; 0 is shown as 0, and hiding an empty count is the integration’s choice. Above the maximum (99 unless the integration raises it) the counter shows the maximum followed by a plus sign.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const grid = card('Size × value', 'VERTICAL', 12);
const head = stack('Header', 'HORIZONTAL', 16);
head.appendChild(label('', 40));
for (const h of ['0', '8', '99', '100', 'max 999']) head.appendChild(label(h, 72, 'color/content/tertiary'));
grid.appendChild(head);
for (const s of ['sm', 'md', 'lg']) {
  const r = stack(s, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(s, 40));
  r.appendChild(cell(ctr({ s, v: 0 })));
  r.appendChild(cell(ctr({ s, v: 8 })));
  r.appendChild(cell(ctr({ s, v: 99 })));
  r.appendChild(cell(ctr({ s, over: true })));
  r.appendChild(cell(ctr({ s, v: 1234, over: false })));
  grid.appendChild(r);
}
grid.appendChild(
  text(
    '100 is above the default maximum of 99, so it is shown as 99+. The last column shows 1234 in a counter whose maximum was raised to 9999: large maximums make wide counters, so keep them rare.',
    'body/sm',
    'color/content/secondary',
    460
  )
);
vrow.appendChild(grid);
grid.layoutSizingHorizontal = 'FILL';
const sizes = card('Sizes next to text', 'VERTICAL', 16);
for (const [s, st] of [
  ['sm', 'label/sm'],
  ['md', 'label/md'],
  ['lg', 'label/lg']
]) {
  const r = stack(s, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(s, 32));
  r.appendChild(labelled('Inbox', { s, v: 8 }, st));
  r.appendChild(labelled('Archive', { s, over: true }, st));
  sizes.appendChild(r);
}
sizes.appendChild(
  text('Each size sits next to the label of the same size.', 'body/sm', 'color/content/secondary', 300)
);
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
  const f = stack(`${b} ${a}`, 'VERTICAL', 14, 20);
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
  f.appendChild(labelled('Inbox', { v: 8 }));
  f.appendChild(labelled('Archive', { over: true }));
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}
va.appendChild(
  text(
    'The counter takes the text color of its context: dark text on a light surface, light text on a dark one. The brick brand rounds the corners less than base and orchid.',
    'body/sm',
    'color/content/secondary',
    1000
  )
);

const st = section(
  'States',
  'A counter has one state of its own: overflow, when the value is above the maximum. It is never hovered, pressed, focused or disabled. Inside a button it simply takes the button’s content color, in every state of the button, so a disabled button shows a dimmed counter without the counter changing.'
);
const srow = stack('States row', 'HORIZONTAL', 24);
srow.counterAxisAlignItems = 'MIN';
st.appendChild(srow);
srow.layoutSizingHorizontal = 'FILL';
for (const ap of ['light', 'dark']) {
  const block = ap === 'light' ? card(`States ${ap}`, 'VERTICAL', 12, 28) : stack(`States ${ap}`, 'VERTICAL', 12, 28);
  if (ap === 'dark') {
    fill(block, 'color/surface/canvas');
    block.cornerRadius = 12;
    block.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
  }
  block.appendChild(text(`base brand, ${ap} appearance`, 'label/sm', 'color/content/secondary'));
  const h = stack('Header', 'HORIZONTAL', 16);
  h.appendChild(label('', 40));
  for (const t of ['default', 'overflow']) h.appendChild(label(t, 96, 'color/content/tertiary'));
  block.appendChild(h);
  for (const s of ['sm', 'md', 'lg']) {
    const r = stack(s, 'HORIZONTAL', 16);
    r.counterAxisAlignItems = 'CENTER';
    r.appendChild(label(s, 40));
    r.appendChild(cell(ctr({ s, v: 8 }), 96));
    r.appendChild(cell(ctr({ s, over: true }), 96));
    block.appendChild(r);
  }
  srow.appendChild(block);
  block.layoutSizingHorizontal = 'FILL';
}
st.appendChild(
  text(
    'Overflow is a derived state, not a choice: in the code it switches on by itself when the value passes the maximum. In Figma, switch it on to show the capped text.',
    'body/sm',
    'color/content/secondary',
    1000
  )
);

const bs = section(
  'Behavior & sizing',
  'The height is the line box of the digits: there is no vertical padding, so one and two digits sit in boxes of the same height. The minimum width equals the height, so a single digit sits in a square at compact and standard density; at comfortable density the wider side padding makes it slightly wider than tall. The counter is as wide as its digits plus the padding, never wraps and is never cut: when there is not enough room, it overflows its container rather than shrinking. Its type does not change with density; only the side padding does.'
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
    r.appendChild(ctr({ s, v: 8 }));
    r.appendChild(ctr({ s, v: 42 }));
    r.appendChild(ctr({ s, over: true }));
    r.appendChild(ctr({ s, v: 1234, over: false }));
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
const brands = card('Brands', 'HORIZONTAL', 12);
for (const [b, r] of [
  ['base', '4 px'],
  ['brick', '2 px'],
  ['orchid', '4 px']
]) {
  const f = panel(b, 'VERTICAL', 12, 20);
  f.counterAxisAlignItems = 'CENTER';
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.appendChild(text(b, 'label/sm', 'color/content/secondary'));
  const row = stack('Row', 'HORIZONTAL', 8);
  row.counterAxisAlignItems = 'CENTER';
  row.appendChild(ctr({ s: 'lg', v: 8 }));
  row.appendChild(ctr({ s: 'lg', v: 42 }));
  row.appendChild(ctr({ s: 'lg', over: true }));
  f.appendChild(row);
  f.appendChild(text(`corners ${r}`, 'caption/md', 'color/content/tertiary'));
  brands.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}
brow.appendChild(brands);
brands.layoutSizingHorizontal = 'FILL';
const same = card('Same height, same width', 'VERTICAL', 16);
const sh = stack('Heights', 'HORIZONTAL', 8);
sh.counterAxisAlignItems = 'CENTER';
for (const v of [0, 8, 42, 99]) sh.appendChild(ctr({ s: 'lg', v }));
sh.appendChild(ctr({ s: 'lg', over: true }));
same.appendChild(caption(sh, 'one and two digits: the same height, the two-digit box is wider'));
const tw = stack('Tabular', 'HORIZONTAL', 8);
tw.counterAxisAlignItems = 'CENTER';
for (const v of [11, 88, 10, 47]) tw.appendChild(ctr({ s: 'lg', v }));
same.appendChild(caption(tw, 'tabular figures: every two-digit counter has the same width'));
brow.appendChild(same);
same.layoutSizingHorizontal = 'FILL';
same.layoutSizingVertical = 'FILL';

const ue = section(
  'Usage examples',
  'Place the counter right after the text it counts, aligned on the text line: a tab label, a navigation item, a list header. Give it the size of its host. A lone number says nothing: the surrounding text or an accessible label gives it its meaning (8 unread messages), which the integration provides. Inside a button, the counter is the trailing item and takes the button’s content color. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
ex.counterAxisAlignItems = 'MIN';
const left = stack('Left column', 'VERTICAL', 24);
const tabs = stack('Tabs', 'HORIZONTAL', 0, 0);
fill(tabs, 'color/surface/raised');
stroke(tabs, 'color/border/subtle');
tabs.cornerRadius = 12;
const tab = (chars, o, active) => {
  const t = stack('Tab', 'HORIZONTAL', 6, [12, 16, 12, 16]);
  t.counterAxisAlignItems = 'CENTER';
  t.appendChild(text(chars, 'label/md', active ? 'color/content/primary' : 'color/content/secondary'));
  if (o) t.appendChild(ctr(o));
  if (active) {
    const u = figma.createFrame();
    u.name = 'Underline';
    u.resize(10, 2);
    fill(u, 'color/content/primary');
    t.appendChild(u);
    u.layoutPositioning = 'ABSOLUTE';
    u.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
    u.x = 0;
    u.y = t.height - 2;
    u.resize(t.width, 2);
  }
  return t;
};
tabs.appendChild(tab('Inbox', { v: 8 }, true));
tabs.appendChild(tab('Drafts', { v: 3 }));
tabs.appendChild(tab('Sent'));
tabs.appendChild(tab('Spam', { over: true }));
left.appendChild(caption(tabs, 'tabs: the counter follows the label color of its tab'));
const list = stack('List header', 'HORIZONTAL', 8, [12, 16, 12, 16]);
fill(list, 'color/surface/subtle');
list.cornerRadius = 8;
list.counterAxisAlignItems = 'CENTER';
list.appendChild(text('Selected rows', 'heading/sm'));
list.appendChild(ctr({ s: 'lg', v: 42 }));
left.appendChild(caption(list, 'a list header: the counter takes the size of the heading (lg)'));
const nav = stack('Navigation', 'VERTICAL', 4, 8);
fill(nav, 'color/surface/raised');
stroke(nav, 'color/border/subtle');
nav.cornerRadius = 12;
for (const [chars, o] of [
  ['Inbox', { v: 8 }],
  ['Starred', null],
  ['Snoozed', { v: 2 }],
  ['Archive', { over: true }]
]) {
  const r = stack('Item', 'HORIZONTAL', 8, [8, 12, 8, 12]);
  r.cornerRadius = 8;
  r.counterAxisAlignItems = 'CENTER';
  r.resize(220, r.height);
  r.primaryAxisSizingMode = 'FIXED';
  const t = text(chars, 'label/md');
  r.appendChild(t);
  t.layoutSizingHorizontal = 'FILL';
  if (o) r.appendChild(ctr(o));
  nav.appendChild(r);
}
left.appendChild(caption(nav, 'navigation items: counters aligned at the end, the empty item shows nothing'));
ex.appendChild(left);
const right = stack('Right column', 'VERTICAL', 24);
const btnNote = stack('Inside a button', 'VERTICAL', 12, 20);
fill(btnNote, 'wireframe/panel');
btnNote.cornerRadius = 12;
btnNote.appendChild(text('Inside a button', 'heading/sm'));
btnNote.appendChild(
  text(
    'The Button’s trailing item will use this component, in the button’s size and content color, once the Counter is integrated into the Button master. Until then the Button page shows its stand-in counter; nothing changes for designers, who keep using the Button’s “Show trailing” switch with Type = Counter.',
    'body/sm',
    'color/content/secondary',
    420
  )
);
right.appendChild(btnNote);
const dark = stack('Dark header', 'HORIZONTAL', 24, 20);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.cornerRadius = 12;
dark.counterAxisAlignItems = 'CENTER';
dark.appendChild(labelled('Projects', { s: 'lg', v: 12 }, 'heading/sm'));
dark.appendChild(labelled('Alerts', { over: true }));
right.appendChild(caption(dark, 'a page header in the orchid brand, dark appearance'));
const narrow = stack('Constrained', 'HORIZONTAL', 8, 8);
fill(narrow, 'color/surface/subtle');
narrow.cornerRadius = 8;
narrow.counterAxisAlignItems = 'CENTER';
narrow.resize(64, narrow.height);
narrow.primaryAxisSizingMode = 'FIXED';
narrow.clipsContent = false;
narrow.appendChild(ctr({ s: 'md', v: 1234, over: false }));
right.appendChild(
  caption(narrow, 'not enough room: the counter overflows its 64 px container rather than shrinking or wrapping')
);
ex.appendChild(right);
ue.appendChild(ex);
ex.layoutSizingHorizontal = 'FILL';
// Center each blueprint board's drawing vertically (user review of 2026-10-14); the legend elements
// (callouts, markers, leader and dimension lines) keep their position relative to the drawing.
const centerBoards = (frame) => {
  const isLegend = (k) =>
    k.type === 'LINE' ||
    (k.type === 'INSTANCE' && ['115:6', '115:8'].includes(k.mainComponent.id)) ||
    (k.type === 'TEXT' && k.characters.length <= 2);
  for (const b of frame.findAll((n) => n.type === 'FRAME' && n.fills.some((f) => f.type === 'IMAGE'))) {
    const draw = b.children.filter((k) => !isLegend(k));
    const top = Math.min(...draw.map((k) => k.y)),
      bottom = Math.max(...draw.map((k) => k.y + k.height));
    const dy = Math.round(b.height / 2 - (top + bottom) / 2);
    for (const k of b.children) k.y += dy;
  }
};
centerBoards(root);
return {
  root: root.id,
  height: Math.round(root.height),
  header: header.id,
  anatomy: an.id,
  diagram: dg.id,
  body: body.id,
  sections: Object.fromEntries(body.children.map((c) => [c.name, c.id]))
};
