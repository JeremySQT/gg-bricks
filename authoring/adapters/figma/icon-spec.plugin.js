// Icon specification page builder (use_figma body), 2026-10-14. One part.
// Builds the frame “Icon — Specification” on the page content/icon (149:4) in the layout of the Button page
// (white header on a gray page, hero card, blueprint anatomy board, white cards in the body). Explanatory
// instances come from the Icon set (149:20); glyphs are the review fixtures (_Fixture/Icon, 74:2). The node ids and
// property keys the script relies on are listed in reports/components/icon/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:4');
await figma.setCurrentPageAsync(page);
const NAME = 'Icon — Specification';
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
const GRID = '349e013eedf533dd9a34627a53f989e11cc9a869';
const callC = await figma.getNodeByIdAsync('115:6');
const markC = await figma.getNodeByIdAsync('115:8');
const numKey = Object.keys(callC.componentPropertyDefinitions)[0];
const set = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const FX = { plus: '42:7', 'arrow-right': '42:10', trash: '42:13', 'download-simple': '42:16', check: '42:19' };
const bset = await figma.getNodeByIdAsync('48:1586');
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
// Icon instance: size variant, glyph by fixture name, optional color override of the glyph drawing
// (the Figma equivalent of the inherited content color: a nested fill override on the instance).
const icon = (s = 'md', name = 'plus', color) => {
  const inst = set.children.find((c) => c.name === 'Size=' + s).createInstance();
  inst.setProperties({ [GLYPH]: FX[name] });
  if (color) for (const v of inst.findAll((n) => n.type === 'VECTOR')) fill(v, color);
  return inst;
};
const bvariant = (i, a, s, t) =>
  bset.children.find((c) => c.name === `Intent=${i}, Appearance=${a}, Size=${s}, State=${t}`);
const btn = (o = {}) => {
  const inst = bvariant(o.i || 'accent', o.a || 'solid', o.s || 'md', o.t || 'default').createInstance();
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
const rowWithText = (name, s, glyph, chars, style = 'body/md', color = 'color/content/primary', gap = 8, iconColor) => {
  const r = stack(name, 'HORIZONTAL', gap);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(icon(s, glyph, iconColor || (color === 'color/content/primary' ? undefined : color)));
  r.appendChild(text(chars, style, color));
  return r;
};

// ---- Root and header ----
const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 200;
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
title.appendChild(text('CONTENT / ICON', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Icon', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'An icon shows a small vector drawing from the application’s icon set, in a square box at one of five sizes. It takes the color of the text around it, so the same icon works next to a label, inside a button or on its own. Without a label it is decorative; with a label it is an image that screen readers announce.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'HORIZONTAL', 40, [40, 16, 40, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
for (const g of ['plus', 'arrow-right', 'trash', 'download-simple', 'check']) hero.appendChild(icon('xl', g));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/content/icon) are the reference. This page documents the Figma component set “Icon”; every icon shown here is an instance, not a master. The glyphs are review fixtures from Phosphor Icons (regular weight): the library ships no icon set, the application brings its own. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
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
heading(an, 'Anatomy', 'How an icon is built. The drawing is enlarged; the real icons are shown underneath.');
const anRow = stack('Anatomy row', 'HORIZONTAL', 44);
anRow.counterAxisAlignItems = 'MIN';
const dg = board('Anatomy diagram', 700, 300);
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
const BX = 270,
  BY = 70,
  BS = 160; // the box, zoomed in: 160 px for a 32 px icon (×5)
const boxR = rect('1 Box', BX, BY, BS, BS, 'wireframe/tint/4', 6);
stroke(boxR, 'wireframe/ink', 1.5, [6, 4]);
boxR.opacity = 0.9;
const inset = BS / 8;
const drawR = rect(
  '2 Glyph (drawing area)',
  BX + inset,
  BY + inset,
  BS - 2 * inset,
  BS - 2 * inset,
  'wireframe/tint/16',
  4
);
stroke(drawR, 'wireframe/tint/48', 1.5);
// the plus drawing, as the fixture draws it (Phosphor “plus”, scaled to the drawing area)
const big = icon('xl', 'plus', 'wireframe/ink');
dg.appendChild(big);
big.x = BX;
big.y = BY;
big.resize(BS, BS);
big.name = 'Glyph (zoomed)';
// inset dimension line on the left side
const dimV = (x, y1, y2, ch, side = -1) => {
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
  callout(ch, dg, x + side * 24, (y1 + y2) / 2);
};
dimV(BX - 24, BY, BY + inset, 'A');
dimV(BX + BS + 24, BY, BY + BS, 'B', 1);
pin(dg, 1, BX + BS / 2 + 40, 34, BX + BS / 2 + 40, BY);
pin(dg, 2, BX + BS / 2 - 40, 266, BX + BS / 2 - 40, BY + BS - inset);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
const items = [
  [
    '1',
    'Box: a square whose side is the size (12, 16, 20, 24 or 32 px). It keeps its size in any layout and in any density, and clips what overflows it.'
  ],
  [
    '2',
    'Glyph: the drawing supplied by the application, scaled to fill the box without distortion, in one color: the content color of the host (the text color next to it, the button’s content color inside a button).'
  ],
  [
    'A',
    'Inset: the reference icon set (Phosphor) keeps its drawings inside a square grid with a margin of 1/8 of the box on each side (2.5 px at 20 px). Hosts rely on that margin for optical spacing: a button places an icon by its drawing, not by its box.'
  ],
  ['B', 'Size: the side of the box, bound to size/icon/{size}.']
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
real.appendChild(caption(icon('md', 'plus'), 'md, default glyph'));
real.appendChild(caption(icon('lg', 'trash'), 'lg, another glyph'));
real.appendChild(caption(icon('xl', 'check', 'color/status/success/icon'), 'xl, colored by its host'));
real.appendChild(
  caption(rowWithText('Next to text', 'md', 'arrow-right', 'Continue'), 'next to a label: same color as the text')
);
real.appendChild(caption(btn({ label: 'Add item', lead: true }), 'inside a button: the button’s size and color apply'));
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, Size is the only variant. The drawing is the “Glyph” property: swap it for any icon component that follows the same grid; the review fixtures (Phosphor) are offered first. The icon takes the content color of the frame by default; to color it like the surrounding text, override the fill of its drawing. A label has no visual effect, so it is not a Figma property.',
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
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
const PX = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };

const va = section(
  'Variants',
  'Size is the only option: xs for captions and dense tables, sm for small controls, md next to body text and in medium buttons (the default), lg for large buttons and headings, xl for empty states and feature headers. The glyph is content, not a variant: any drawing from the application’s icon set can be used. The brand and the light or dark appearance come from the modes of the frame.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const sizes = card('Sizes', 'HORIZONTAL', 24);
sizes.counterAxisAlignItems = 'MAX';
for (const s of SIZES) sizes.appendChild(caption(icon(s, 'plus'), `${s} · ${PX[s]} px`));
vrow.appendChild(sizes);
sizes.layoutSizingHorizontal = 'FILL';
const glyphs = card('Glyphs', 'HORIZONTAL', 24);
glyphs.counterAxisAlignItems = 'MAX';
for (const g of Object.keys(FX)) glyphs.appendChild(caption(icon('lg', g), g));
vrow.appendChild(glyphs);
glyphs.layoutSizingHorizontal = 'FILL';
glyphs.layoutSizingVertical = 'FILL';
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
  const f = stack(`${b} ${a}`, 'VERTICAL', 16, 20);
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
  const r = stack('Icons', 'HORIZONTAL', 12);
  r.counterAxisAlignItems = 'CENTER';
  for (const g of ['plus', 'trash', 'check']) r.appendChild(icon('md', g));
  f.appendChild(r);
  f.appendChild(rowWithText('With text', 'sm', 'arrow-right', 'Open', 'label/md', 'color/content/secondary', 6));
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}

const st = section(
  'States',
  'An icon has no state and no interaction of its own: it does not react to hover, press or focus, and it is never disabled by itself. It follows its host: a disabled button, a secondary caption or a status message passes its color to the icon. Interactive icons are a different component (IconButton).'
);
const colors = card('Inherited color', 'HORIZONTAL', 32);
colors.counterAxisAlignItems = 'MIN';
for (const [cap, c, g, chars] of [
  ['primary text', 'color/content/primary', 'plus', 'Add a member'],
  ['secondary text', 'color/content/secondary', 'arrow-right', 'See details'],
  ['tertiary text', 'color/content/tertiary', 'download-simple', 'Export'],
  ['disabled text', 'color/content/disabled', 'trash', 'Delete'],
  ['status color', 'color/status/success/icon', 'check', 'Saved']
]) {
  const r = rowWithText(cap, 'md', g, chars, 'body/md', c);
  colors.appendChild(caption(r, cap));
}
st.appendChild(colors);
colors.layoutSizingHorizontal = 'FILL';
const inBtn = card('In a host with states', 'HORIZONTAL', 32);
inBtn.counterAxisAlignItems = 'MIN';
inBtn.appendChild(caption(btn({ label: 'Add item', lead: true }), 'button, default'));
inBtn.appendChild(caption(btn({ label: 'Add item', lead: true, t: 'hover' }), 'button, hover'));
inBtn.appendChild(
  caption(btn({ label: 'Add item', lead: true, t: 'disabled' }), 'button, disabled: the icon takes the disabled color')
);
inBtn.appendChild(
  caption(
    btn({ a: 'outline', i: 'danger', label: 'Delete', lead: true, leadIcon: 'trash' }),
    'danger outline: the icon takes the danger color'
  )
);
st.appendChild(inBtn);
inBtn.layoutSizingHorizontal = 'FILL';

const bs = section(
  'Behavior & sizing',
  'The box is always a square of the chosen size. It does not grow or shrink with the available space, it does not change with the density of the frame, and the drawing scales to fill it without distortion. Inside a button, the button decides the size: sm buttons use 16 px icons, md 20 px, lg 24 px.'
);
const dens = card('Density × size', 'HORIZONTAL', 12);
bs.appendChild(dens);
dens.layoutSizingHorizontal = 'FILL';
for (const d of ['compact', 'standard', 'comfortable']) {
  const f = panel(d, 'VERTICAL', 12, 24);
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
  const r = stack('Sizes', 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  for (const s of SIZES) r.appendChild(icon(s, 'plus'));
  f.appendChild(r);
  f.appendChild(text('same sizes in every density', 'caption/md', 'color/content/tertiary'));
  dens.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
  f.layoutSizingVertical = 'FILL';
}
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
bs.appendChild(brow);
brow.layoutSizingHorizontal = 'FILL';
const flex = card('In a flexible row', 'VERTICAL', 16);
const narrow = stack('Narrow row', 'HORIZONTAL', 8, 12);
narrow.counterAxisAlignItems = 'MIN';
fill(narrow, 'color/surface/subtle');
narrow.cornerRadius = 8;
narrow.appendChild(icon('md', 'download-simple'));
const long = text(
  'The quarterly report is ready to download as a PDF document',
  'body/md',
  'color/content/primary',
  220
);
narrow.appendChild(long);
flex.appendChild(
  caption(narrow, 'the text wraps, the icon keeps its 20 px box (set the icon to Fixed, the text to Fill)')
);
brow.appendChild(flex);
flex.layoutSizingHorizontal = 'FILL';
const host = card('Sized by a button', 'VERTICAL', 16);
const hrow = stack('Buttons', 'HORIZONTAL', 12);
hrow.counterAxisAlignItems = 'CENTER';
for (const s of ['sm', 'md', 'lg'])
  hrow.appendChild(btn({ s, label: 'Download', lead: true, leadIcon: 'download-simple' }));
host.appendChild(caption(hrow, 'sm, md and lg buttons: 16, 20 and 24 px icons, placed by their drawing'));
brow.appendChild(host);
host.layoutSizingHorizontal = 'FILL';
host.layoutSizingVertical = 'FILL';

const ue = section(
  'Usage examples',
  'Use an icon to reinforce a short text, never to replace it, unless the meaning is universal and the icon carries a label. Keep one weight and one grid across the product. Pick the size of the text or control next to it. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
ex.counterAxisAlignItems = 'MIN';
const menu = stack('Menu', 'VERTICAL', 2, 8);
fill(menu, 'color/surface/raised');
stroke(menu, 'color/border/subtle');
menu.cornerRadius = 12;
for (const [g, chars] of [
  ['plus', 'New project'],
  ['download-simple', 'Download'],
  ['check', 'Mark as done'],
  ['trash', 'Delete']
]) {
  const r = stack('Menu item', 'HORIZONTAL', 10, [8, 12, 8, 12]);
  r.counterAxisAlignItems = 'CENTER';
  r.cornerRadius = 8;
  const isDanger = g === 'trash';
  r.appendChild(icon('md', g, isDanger ? 'color/status/danger/content' : undefined));
  r.appendChild(text(chars, 'body/md', isDanger ? 'color/status/danger/content' : 'color/content/primary'));
  menu.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
}
menu.resize(220, menu.height);
ex.appendChild(caption(menu, 'a menu: md icons next to body text'));
const mid = stack('Middle column', 'VERTICAL', 24);
const table = stack('Table', 'VERTICAL', 0);
fill(table, 'color/surface/raised');
stroke(table, 'color/border/subtle');
table.cornerRadius = 12;
table.clipsContent = true;
for (const [i, [name, ok]] of [
  ['Invoice 2041', true],
  ['Invoice 2042', false],
  ['Invoice 2043', true]
].entries()) {
  const r = stack('Row', 'HORIZONTAL', 16, [10, 16, 10, 16]);
  r.counterAxisAlignItems = 'CENTER';
  if (i) stroke(r, 'color/border/subtle');
  r.strokeTopWeight = i ? 1 : 0;
  r.strokeBottomWeight = r.strokeLeftWeight = r.strokeRightWeight = 0;
  const n = text(name, 'body/sm', 'color/content/primary');
  n.textAutoResize = 'NONE';
  n.resize(160, n.height);
  r.appendChild(n);
  const cell = stack('Status', 'HORIZONTAL', 6);
  cell.counterAxisAlignItems = 'CENTER';
  cell.appendChild(
    icon('sm', ok ? 'check' : 'arrow-right', ok ? 'color/status/success/icon' : 'color/status/warning/icon')
  );
  cell.appendChild(
    text(ok ? 'Paid' : 'Pending', 'label/sm', ok ? 'color/status/success/content' : 'color/status/warning/content')
  );
  r.appendChild(cell);
  table.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
}
mid.appendChild(caption(table, 'a status cell: the icon is named (“Paid”) in code so screen readers announce it'));
const dark = stack('Dark toolbar', 'HORIZONTAL', 12, 16);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.cornerRadius = 12;
dark.counterAxisAlignItems = 'CENTER';
dark.appendChild(text('Projects', 'heading/sm'));
dark.appendChild(rowWithText('Filter', 'sm', 'check', 'Done only', 'label/md', 'color/content/secondary', 6));
dark.appendChild(btn({ label: 'Create project', lead: true }));
mid.appendChild(caption(dark, 'a toolbar in the orchid brand, dark appearance'));
ex.appendChild(mid);
const empty = stack('Empty state', 'VERTICAL', 12, 32);
fill(empty, 'color/surface/subtle');
empty.cornerRadius = 12;
empty.counterAxisAlignItems = 'CENTER';
empty.appendChild(icon('xl', 'download-simple', 'color/content/tertiary'));
empty.appendChild(text('No downloads yet', 'heading/sm'));
const et = text('Files you download will show up here.', 'body/sm', 'color/content/secondary', 200);
et.textAlignHorizontal = 'CENTER';
empty.appendChild(et);
empty.appendChild(btn({ a: 'outline', i: 'neutral', s: 'sm', label: 'Browse files' }));
ex.appendChild(caption(empty, 'an empty state: xl icon in the tertiary color'));
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
return { root: root.id, h: Math.round(root.height), w: Math.round(root.width) };
