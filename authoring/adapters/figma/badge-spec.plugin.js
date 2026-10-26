// Badge specification page builder (use_figma body), 2026-10-19. One part.
// Builds the frame “Badge — Specification” on the page content/badge (220:2) in the layout of the Button, Icon
// and IconButton pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body)
// and places the component set to its right. Explanatory instances come from the Badge set (220:293), the Counter
// set (149:1568) and the Icon set (149:20). The node ids and property keys the script relies on are listed in
// reports/components/badge/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('220:2');
await figma.setCurrentPageAsync(page);
const NAME = 'Badge — Specification';
for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
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
const GRID = '349e013eedf533dd9a34627a53f989e11cc9a869';
const callC = await figma.getNodeByIdAsync('115:6');
const markC = await figma.getNodeByIdAsync('115:8');
const numKey = Object.keys(callC.componentPropertyDefinitions)[0];
const set = await figma.getNodeByIdAsync('220:293');
const PROPS = Object.keys(set.componentPropertyDefinitions);
const LABEL = PROPS.find((k) => k.startsWith('Label'));
const LEAD = PROPS.find((k) => k.startsWith('Show leading'));
const LEAD_ICON = PROPS.find((k) => k.startsWith('Leading icon'));
// The glyph each intent shows on this page, as on the code's review page (the property's default is pencil-simple).
const INTENT_GLYPH = {
  neutral: '200:5392',
  accent: '200:5647',
  info: '200:5169',
  success: '200:4715',
  warning: '200:5831',
  danger: '200:5831'
};
const iconSet = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const cset = await figma.getNodeByIdAsync('149:1568');
const CVALUE = Object.keys(cset.componentPropertyDefinitions).find((k) => k.startsWith('Value'));
const G = {
  check: '200:4715',
  clock: '200:4778',
  sparkle: '200:5606',
  'lock-simple': '200:5251',
  tag: '200:5685',
  user: '200:5808',
  'x-circle': '200:5862',
  'check-circle': '200:4685'
};
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
  f.fills = [
    paint('wireframe/board'),
    { type: 'IMAGE', scaleMode: 'TILE', imageHash: GRID, scalingFactor: 1, opacity: 0.1 }
  ];
  stroke(f, 'wireframe/card', 8, null, 'OUTSIDE');
  shadow(f);
  f.setExplicitVariableModeForCollection(wf, B);
  return f;
};
// Badge instance: variant, label, optional leading icon (the intent's glyph unless g is given).
const bd = (o = {}) => {
  const inst = set.children
    .find((c) => c.name === `Intent=${o.i || 'neutral'}, Appearance=${o.a || 'subtle'}, Size=${o.s || 'md'}`)
    .createInstance();
  inst.setProperties({ [LABEL]: o.label || 'Badge', [LEAD]: !!o.icon });
  const g = o.g ? G[o.g] : INTENT_GLYPH[o.i || 'neutral'];
  if (o.icon && g !== set.componentPropertyDefinitions[LEAD_ICON].defaultValue) inst.setProperties({ [LEAD_ICON]: g });
  return inst;
};
const counter = (value, s = 'md') => {
  const inst = cset.children.find((c) => c.name === `Size=${s}, Overflow=false`).createInstance();
  inst.setProperties({ [CVALUE]: String(value) });
  return inst;
};
const chip = (chars, bordered = true) => {
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
const label = (s, w = 80, color = 'color/content/secondary') => {
  const l = text(s, 'label/md', color);
  l.textAutoResize = 'NONE';
  l.resize(w, l.height);
  return l;
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
const divider = (parent) => {
  const d = figma.createFrame();
  d.name = 'Divider';
  d.resize(100, 1);
  fill(d, 'wireframe/divider');
  parent.appendChild(d);
  d.layoutSizingHorizontal = 'FILL';
};
const row = (name, gap = 8, items = []) => {
  const r = stack(name, 'HORIZONTAL', gap);
  r.counterAxisAlignItems = 'CENTER';
  for (const it of items) r.appendChild(it);
  return r;
};
const I = ['neutral', 'accent', 'info', 'success', 'warning', 'danger'];
const WORDS = {
  neutral: 'Draft',
  accent: 'New',
  info: 'In review',
  success: 'Paid',
  warning: 'Due soon',
  danger: 'Overdue'
};

// ---- Root and header ----
const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 0;
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
title.appendChild(text('CONTENT / BADGE', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Badge', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'A badge labels an item with a short status or category: Paid, Draft, New. It is static text in a small box, never a button and never focusable. Its words carry the meaning and the color only reinforces them. It belongs to the box family of the Counter: both sit on the same line at the same height.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'HORIZONTAL', 20, [40, 16, 40, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
for (const o of [
  { i: 'success', label: 'Paid', icon: true },
  { i: 'neutral', label: 'Draft' },
  { i: 'info', label: 'In review' },
  { i: 'warning', label: 'Due soon', icon: true },
  { i: 'danger', a: 'strong', label: 'Overdue' },
  { i: 'accent', a: 'strong', label: 'New', icon: true, g: 'sparkle' }
])
  hero.appendChild(bd({ s: 'lg', ...o }));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/content/badge) are the reference. This page documents the Figma component set “Badge”; every badge shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
    'body/sm',
    'color/content/tertiary',
    900
  )
);
divider(header);

// ---- Anatomy ----
const an = stack('Anatomy', 'VERTICAL', 32);
header.appendChild(an);
an.layoutSizingHorizontal = 'FILL';
heading(
  an,
  'Anatomy',
  'How a badge is built. The drawing is enlarged six times; the real badges are shown underneath.'
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
// md badge “Paid” with its icon, zoomed ×6: padding 24, icon box 72 overlapping the padding and the gap by 9, gap 24.
const Z = 6,
  BX = 196,
  BY = 120,
  BH = 16.8 * Z,
  PAD = 4 * Z,
  ICON = 12 * Z,
  GAP = 4 * Z;
const word = text('Paid', 'body/md', 'wireframe/ink');
word.fontSize = 12 * Z;
word.fontName = { family: 'Inter', style: 'Medium' };
word.leadingTrim = 'CAP_HEIGHT';
word.lineHeight = { unit: 'PIXELS', value: BH };
const BW = PAD + (ICON - ICON / 4) + GAP + word.width + PAD;
const boxR = rect('1 Container', BX, BY, BW, BH, 'wireframe/tint/16', 4 * Z);
stroke(boxR, 'wireframe/tint/48', 1.5);
const iconBox = rect(
  '2 Leading icon (box)',
  BX + PAD - ICON / 8,
  BY + (BH - ICON) / 2,
  ICON,
  ICON,
  'wireframe/tint/4',
  4
);
stroke(iconBox, 'wireframe/tint/48', 1.5, [4, 3]);
const gl = iconSet.children.find((c) => c.name === 'Size=xl').createInstance();
gl.setProperties({ [GLYPH]: G.check });
for (const v of gl.findAll((n) => n.type === 'VECTOR')) fill(v, 'wireframe/ink');
dg.appendChild(gl);
gl.x = iconBox.x;
gl.y = iconBox.y;
gl.resize(ICON, ICON);
gl.name = 'Glyph (zoomed)';
dg.appendChild(word);
word.name = '3 Label';
word.x = BX + PAD + ICON - ICON / 4 + GAP;
word.y = BY + (BH - word.height) / 2;
const dimH = (x1, x2, y, ch, side = -1) => {
  const l = figma.createLine();
  l.resize(x2 - x1, 0);
  l.x = x1;
  l.y = y;
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  dg.appendChild(l);
  for (const xx of [x1, x2]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.rotation = -90;
    t.x = xx;
    t.y = y - 4;
    stroke(t, 'wireframe/ink', 1.5, null, 'CENTER');
    dg.appendChild(t);
  }
  callout(ch, dg, (x1 + x2) / 2, y + side * 22);
};
const dimV = (x, y1, y2, ch) => {
  const l = figma.createLine();
  l.resize(y2 - y1, 0);
  l.rotation = -90;
  l.x = x;
  l.y = y1;
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  dg.appendChild(l);
  for (const yy of [y1, y2]) {
    const t = figma.createLine();
    t.resize(8, 0);
    t.x = x - 4;
    t.y = yy;
    stroke(t, 'wireframe/ink', 1.5, null, 'CENTER');
    dg.appendChild(t);
  }
  callout(ch, dg, x + 24, (y1 + y2) / 2);
};
dimV(BX + BW + 28, BY, BY + BH, 'A');
dimH(BX, BX + PAD, BY + BH + 24, 'B', 1);
dimH(BX + PAD + ICON - ICON / 4, BX + PAD + ICON - ICON / 4 + GAP, BY + BH + 24, 'C', 1);
pin(dg, 1, BX + BW - 30, 60, BX + BW - 30, BY);
pin(dg, 2, BX + PAD + ICON / 2, 60, BX + PAD + ICON / 2, iconBox.y);
pin(dg, 3, word.x + word.width / 2, 60, word.x + word.width / 2, word.y);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
for (const [n, s] of [
  [
    '1',
    'Container: a box with the height of the label’s line, at least as wide as it is high, with a small corner radius. Subtle badges have a light surface and a thin edge; strong badges a solid surface.'
  ],
  [
    '2',
    'Leading icon (optional): one decorative icon of 12 px, placed by its drawing: its box overlaps the padding and the gap by 1/8 of its size on each side, so the drawing starts at the padding and ends at the gap.'
  ],
  ['3', 'Label: the text, on one line, centered on its capital height. It is always visible and carries the meaning.'],
  ['A', 'Height: the line box of the label (15.4, 16.8 or 19.6 px); it does not change with the density.'],
  ['B', 'Side padding: 2, 4 or 6 px in compact, standard and comfortable density.'],
  ['C', 'Gap between the drawing of the icon and the label: the same value as the padding.']
]) {
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
real.appendChild(caption(bd({ i: 'success', label: 'Paid', icon: true }), 'subtle, with an icon'));
real.appendChild(caption(bd({ i: 'neutral', label: 'Draft' }), 'default: neutral subtle'));
real.appendChild(caption(bd({ i: 'accent', a: 'strong', label: 'New' }), 'strong'));
real.appendChild(
  caption(
    row('With a counter', 6, [text('Inbox', 'body/sm'), counter(12), bd({ i: 'info', label: 'Synced' })]),
    'beside a Counter: same box, same height'
  )
);
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, Intent, Appearance and Size are variants. Label is a text property. Show leading adds the icon; choose its drawing with the Leading icon property (any glyph of the page assets/phosphor); its size is set by the badge. The badge has no State: it is not interactive.',
    'body/md',
    'color/content/secondary',
    1000
  )
);
divider(root);

// ---- Body ----
const body = stack('Body', 'VERTICAL', 64, [64, 72, 96, 72]);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const section = (t, introText) => {
  const s = stack(t, 'VERTICAL', 32);
  heading(s, t, introText, 20);
  const c = stack('Content', 'VERTICAL', 20);
  s.appendChild(c);
  body.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  c.layoutSizingHorizontal = 'FILL';
  return c;
};

const va = section(
  'Variants',
  'Intent names the color family. Neutral (the default) and accent are categories: neutral for a state without valence (Draft, Archived), accent for a highlighted category in the brand color (New, Beta). Info, success, warning and danger are statuses. Appearance sets the weight: subtle (the default) for most badges, strong to stand out, at most one or two on a screen. Size follows the text it labels. The brand and the light or dark appearance come from the modes of the frame.'
);
const matrix = card('Intent × appearance', 'VERTICAL', 14);
const mh = stack('Header', 'HORIZONTAL', 16);
mh.appendChild(label('', 110));
for (const i of I) mh.appendChild(label(i, 120, 'color/content/tertiary'));
matrix.appendChild(mh);
for (const [a, icon] of [
  ['subtle', false],
  ['subtle', true],
  ['strong', false],
  ['strong', true]
]) {
  const r = stack(`${a}${icon ? ' + icon' : ''}`, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(`${a}${icon ? ' + icon' : ''}`, 110));
  for (const i of I) {
    const cell = stack(i, 'HORIZONTAL', 0);
    cell.resize(120, 24);
    cell.primaryAxisSizingMode = 'FIXED';
    cell.counterAxisAlignItems = 'CENTER';
    cell.appendChild(bd({ i, a, label: WORDS[i], icon }));
    r.appendChild(cell);
  }
  matrix.appendChild(r);
}
va.appendChild(matrix);
matrix.layoutSizingHorizontal = 'FILL';
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const sizes = card('Sizes', 'HORIZONTAL', 32);
sizes.counterAxisAlignItems = 'MAX';
for (const [s, px] of [
  ['sm', '11 px text, 15.4 px high'],
  ['md', '12 px text, 16.8 px high'],
  ['lg', '14 px text, 19.6 px high']
])
  sizes.appendChild(caption(bd({ s, i: 'success', label: 'Paid', icon: true }), `${s} · ${px}`));
vrow.appendChild(sizes);
sizes.layoutSizingHorizontal = 'FILL';
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
  f.appendChild(row('Subtle', 6, [bd({ i: 'accent', label: 'New' }), bd({ i: 'success', label: 'Paid' })]));
  f.appendChild(
    row('Strong', 6, [
      bd({ i: 'accent', a: 'strong', label: 'New' }),
      bd({ i: 'danger', a: 'strong', label: 'Overdue' })
    ])
  );
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}

const st = section(
  'States',
  'A badge has no state: it does not react to hover, press or focus, it is never disabled and it is skipped by the keyboard. When its status changes, the application replaces it (Due soon becomes Overdue). Inside a hovered or selected row, it keeps its own colors.'
);
const rows = card('In rows with states', 'VERTICAL', 0, 12);
for (const [k, [name, i, rowFill]] of [
  ['Invoice 2041', 'success', null],
  ['Invoice 2042', 'warning', 'color/surface/subtle'],
  ['Invoice 2043', 'danger', 'color/surface/muted']
].entries()) {
  const r = stack('Row', 'HORIZONTAL', 16, [10, 16, 10, 16]);
  r.counterAxisAlignItems = 'CENTER';
  r.cornerRadius = 8;
  if (rowFill) fill(r, rowFill);
  const n = text(name, 'body/sm');
  n.textAutoResize = 'NONE';
  n.resize(160, n.height);
  r.appendChild(n);
  r.appendChild(bd({ i, label: WORDS[i] }));
  const note = text(['default row', 'hovered row', 'selected row'][k], 'caption/md', 'color/content/tertiary');
  r.appendChild(note);
  rows.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
}
st.appendChild(rows);
rows.layoutSizingHorizontal = 'FILL';

const bs = section(
  'Behavior & sizing',
  'A badge is as wide as its label, on one line. Its height and its text size do not change with the density; only the side padding and the gap do. When there is not enough room, the label is shortened with an ellipsis and the icon keeps its place: in Figma, give the instance a fixed width (the label truncates). Keep labels to one or two words so that this stays rare.'
);
const dens = card('Density × size', 'HORIZONTAL', 12);
bs.appendChild(dens);
dens.layoutSizingHorizontal = 'FILL';
for (const [d, px] of [
  ['compact', 'padding and gap 2 px'],
  ['standard', 'padding and gap 4 px'],
  ['comfortable', 'padding and gap 6 px']
]) {
  const f = panel(d, 'VERTICAL', 12, 24);
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
  f.appendChild(
    row(
      'Sizes',
      10,
      ['sm', 'md', 'lg'].map((s) => bd({ s, i: 'success', label: 'Paid', icon: true }))
    )
  );
  f.appendChild(text(px + '; same height', 'caption/md', 'color/content/tertiary'));
  dens.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
  f.layoutSizingVertical = 'FILL';
}
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
bs.appendChild(brow);
brow.layoutSizingHorizontal = 'FILL';
const trunc = card('Truncation', 'VERTICAL', 16);
const long = bd({ i: 'warning', label: 'Waiting for customer approval', icon: true, g: 'clock' });
long.resize(150, long.height);
long.findOne((n) => n.type === 'TEXT').layoutSizingHorizontal = 'FILL';
trunc.appendChild(caption(long, 'fixed width 150 px: the label ends with an ellipsis, the icon stays'));
brow.appendChild(trunc);
trunc.layoutSizingHorizontal = 'FILL';
const line = card('On a line of text', 'VERTICAL', 16);
for (const s of ['sm', 'md', 'lg']) {
  const style = { sm: 'body/sm', md: 'body/md', lg: 'body/lg' }[s];
  line.appendChild(
    row(`Line ${s}`, 8, [text('Invoice 2041', style), bd({ s, i: 'success', label: 'Paid' }), counter(3, s)])
  );
}
line.appendChild(chip('next to text and a Counter of the same size: one line, one height'));
brow.appendChild(line);
line.layoutSizingHorizontal = 'FILL';

const ue = section(
  'Usage examples',
  'Use a badge for a status or a category that the reader scans: in a table column, next to a title, on a card. Keep the words short and specific, one badge per status. Do not use it as a button or a link, for a number (use a Counter) or for a value people can remove or select (a Tag, to come). The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
ex.counterAxisAlignItems = 'MIN';
const table = stack('Table', 'VERTICAL', 0);
fill(table, 'color/surface/raised');
stroke(table, 'color/border/subtle');
table.cornerRadius = 12;
table.clipsContent = true;
for (const [k, [name, amount, i]] of [
  ['Invoice 2041', '1,200.00', 'success'],
  ['Invoice 2042', '480.00', 'warning'],
  ['Invoice 2043', '2,950.00', 'danger'],
  ['Invoice 2044', '75.00', 'neutral']
].entries()) {
  const r = stack('Row', 'HORIZONTAL', 16, [10, 16, 10, 16]);
  r.counterAxisAlignItems = 'CENTER';
  if (k) stroke(r, 'color/border/subtle');
  r.strokeTopWeight = k ? 1 : 0;
  r.strokeBottomWeight = r.strokeLeftWeight = r.strokeRightWeight = 0;
  const n = text(name, 'body/sm');
  n.textAutoResize = 'NONE';
  n.resize(110, n.height);
  r.appendChild(n);
  const m = text(amount, 'body/sm', 'color/content/secondary');
  m.textAutoResize = 'NONE';
  m.resize(70, m.height);
  r.appendChild(m);
  r.appendChild(bd({ i, label: WORDS[i] }));
  table.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
}
ex.appendChild(caption(table, 'a status column: subtle badges, one word each'));
const colB = stack('Column B', 'VERTICAL', 24);
const titleRow = row('Title', 10, [text('Usage analytics', 'heading/md'), bd({ i: 'accent', label: 'Beta' })]);
colB.appendChild(caption(titleRow, 'next to a heading: a category in the brand color'));
const cardEx = stack('Card', 'VERTICAL', 10, 16);
fill(cardEx, 'color/surface/raised');
stroke(cardEx, 'color/border/subtle');
cardEx.cornerRadius = 12;
cardEx.appendChild(text('Design system audit', 'heading/sm'));
cardEx.appendChild(
  row('Tags', 6, [
    bd({ s: 'sm', label: 'Internal', icon: true, g: 'lock-simple' }),
    bd({ s: 'sm', label: 'Q4' }),
    bd({ s: 'sm', i: 'info', label: 'In review' })
  ])
);
colB.appendChild(caption(cardEx, 'on a card: small neutral categories and one status'));
ex.appendChild(colB);
const dark = stack('Dark list', 'VERTICAL', 8, 16);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.cornerRadius = 12;
for (const [name, i, a, l] of [
  ['Checkout redesign', 'success', 'subtle', 'Shipped'],
  ['Search filters', 'accent', 'strong', 'New'],
  ['Legacy exports', 'neutral', 'subtle', 'Archived']
]) {
  const r = row('Item', 10, [text(name, 'body/md'), bd({ i, a, label: l })]);
  dark.appendChild(r);
}
ex.appendChild(caption(dark, 'a list, orchid brand, dark'));
ue.appendChild(ex);
ex.layoutSizingHorizontal = 'FILL';

// Center each blueprint board's drawing vertically; the legend elements keep their position relative to it.
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
set.x = root.width + 160;
set.y = 0;
return { root: root.id, h: Math.round(root.height), board: dg.id };
