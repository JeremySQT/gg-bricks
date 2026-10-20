// IconButton specification page builder (use_figma body), 2026-10-19. One part.
// Builds the frame “IconButton — Specification” on the page actions/icon-button (211:2) in the layout of the
// Button and Icon pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the
// body) and places the component set to its right. Explanatory instances come from the IconButton set
// (211:1167) and the Button set (48:1586); glyphs are Phosphor components of the page assets/phosphor. The
// node ids and property keys the script relies on are listed in reports/components/icon-button/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('211:2');
await figma.setCurrentPageAsync(page);
const NAME = 'IconButton — Specification';
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
const set = await figma.getNodeByIdAsync('211:1167');
const PROPS = Object.keys(set.componentPropertyDefinitions);
const LABEL = PROPS.find((k) => k.startsWith('Label'));
const FOCUS = PROPS.find((k) => k.startsWith('Focus'));
const iconSet = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const G = {
  plus: '200:4367',
  'pencil-simple': '200:5392',
  trash: '200:5762',
  'magnifying-glass': '200:5872',
  gear: '200:5078',
  x: '200:4368',
  'dots-three-vertical': '200:4856',
  heart: '200:5133',
  'share-network': '200:5541',
  'text-b': '200:5705',
  'text-italic': '200:5715',
  'text-underline': '200:5722',
  link: '200:5218',
  'list-bullets': '200:5878',
  bell: '200:4596',
  copy: '200:4794',
  'caret-left': '200:4622',
  'caret-right': '200:4707',
  play: '200:5443',
  'download-simple': '200:4881'
};
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
// IconButton instance: variant, glyph (through the exposed Icon), label (accessible name) and focus.
const ib = (o = {}) => {
  const inst = set.children
    .find(
      (c) =>
        c.name ===
        `Intent=${o.i || 'neutral'}, Appearance=${o.a || 'ghost'}, Size=${o.s || 'md'}, State=${o.t || 'default'}`
    )
    .createInstance();
  inst.setProperties({ [LABEL]: o.label || 'Add', [FOCUS]: !!o.focus });
  // Never set the default glyph explicitly: Figma then resets the nested color override (button/foreground).
  if (o.g && o.g !== 'plus') inst.exposedInstances.find((e) => e.name === 'Icon').setProperties({ [GLYPH]: G[o.g] });
  return inst;
};
const btn = (o = {}) => {
  const inst = bset.children
    .find(
      (c) =>
        c.name ===
        `Intent=${o.i || 'accent'}, Appearance=${o.a || 'solid'}, Size=${o.s || 'md'}, State=${o.t || 'default'}`
    )
    .createInstance();
  inst.setProperties({
    'Label#48:360': o.label || 'Save changes',
    'Show leading#48:361': !!o.lead,
    'Show trailing#76:0': false,
    'Focus#48:367': false
  });
  if (o.lead && o.g) inst.exposedInstances.find((e) => e.name === 'Leading icon').setProperties({ [GLYPH]: G[o.g] });
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
title.appendChild(text('ACTIONS / ICON BUTTON', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('IconButton', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'An icon button starts an action with a single icon instead of a text label, where space is short and the icon is familiar: edit, delete, close, more. It has the intents, appearances, sizes and states of the Button, so the two sit side by side. Its label is never shown: it is the name screen readers announce, and a tooltip shows it on hover or focus.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'HORIZONTAL', 24, [40, 16, 40, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
for (const o of [
  { g: 'magnifying-glass', label: 'Search' },
  { g: 'bell', label: 'Notifications' },
  { g: 'gear', label: 'Settings' },
  { g: 'pencil-simple', a: 'outline', label: 'Edit' },
  { g: 'trash', i: 'danger', a: 'outline', label: 'Delete' },
  { g: 'plus', i: 'accent', a: 'solid', label: 'Add' }
])
  hero.appendChild(ib(o));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/actions/icon-button) are the reference. This page documents the Figma component set “IconButton”; every icon button shown here is an instance, not a master. Glyphs come from the page assets/phosphor through the Icon component. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
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
  'How an icon button is built. The drawing is simplified and not to scale; the real icon buttons are shown underneath.'
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
const BX = 270,
  BY = 90,
  BS = 160; // the container, zoomed in: 160 px for a 40 px icon button (×4)
const tgt = rect('1 Target', BX - 36, BY - 36, BS + 72, BS + 72, null, 4);
stroke(tgt, 'wireframe/ink', 1.5, [6, 4]);
tgt.opacity = 0.7;
const ring = rect('4 Focus ring', BX - 8, BY - 8, BS + 16, BS + 16, null, 32);
stroke(ring, 'wireframe/ink', 3);
const box = rect('2 Container', BX, BY, BS, BS, 'wireframe/tint/16', 24);
stroke(box, 'wireframe/tint/48', 1.5);
const glyphBox = rect('3 Icon', BX + 40, BY + 40, 80, 80, 'wireframe/tint/4', 4);
stroke(glyphBox, 'wireframe/tint/48', 1.5, [4, 3]);
const iconInst = iconSet.children.find((c) => c.name === 'Size=xl').createInstance();
iconInst.setProperties({ [GLYPH]: G.plus });
for (const v of iconInst.findAll((n) => n.type === 'VECTOR')) fill(v, 'wireframe/ink');
dg.appendChild(iconInst);
iconInst.x = BX + 40;
iconInst.y = BY + 40;
iconInst.resize(80, 80);
iconInst.name = 'Glyph (zoomed)';
const dimV = (x, y1, y2, ch, side = 1) => {
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
dimV(BX + BS + 60, BY, BY + BS, 'A');
dimV(BX - 60, BY + 40, BY + 120, 'B', -1);
pin(dg, 1, BX - 6, 26, BX - 6, BY - 36);
pin(dg, 3, BX + BS / 2 + 20, 26, BX + BS / 2 + 20, BY + 40);
pin(dg, 2, BX + 30, 314, BX + 30, BY + BS);
pin(dg, 4, BX + BS - 30, 314, BX + BS - 30, BY + BS + 8);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
for (const [n, s] of [
  [
    '1',
    'Target: the area that reacts to clicks and taps, at least 44 × 44 px even when the visible square is smaller. It takes no room in the layout.'
  ],
  ['2', 'Container: the visible square, with the background, border and corner radius of the Button.'],
  [
    '3',
    'Icon: one Icon component, centered by its box at the icon size of the size. While loading, the loading indicator takes its place at the same size.'
  ],
  [
    '4',
    'Focus ring: drawn just outside the container when the icon button is focused with the keyboard, with corners that stay concentric.'
  ],
  ['A', 'Size: the side of the square, the Button height of the same size and density.'],
  ['B', 'Icon size: 16, 20 or 24 px for sm, md and lg, in every density.'],
  [
    '—',
    'Label: not drawn. It is required: it names the action for screen readers and is the text of the tooltip. In Figma, write it in the Label property.'
  ]
]) {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  if (n === '—') {
    const d = text('Aa', 'label/sm', 'color/content/secondary');
    d.textAutoResize = 'NONE';
    d.resize(22, d.height);
    r.appendChild(d);
  } else callout(n, r);
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
real.appendChild(caption(ib({ g: 'pencil-simple', label: 'Edit' }), 'default: neutral ghost'));
real.appendChild(caption(ib({ g: 'plus', i: 'accent', a: 'solid' }), 'accent solid'));
real.appendChild(caption(ib({ g: 'gear', a: 'outline', focus: true, label: 'Settings' }), 'focused'));
real.appendChild(caption(ib({ i: 'accent', a: 'solid', t: 'loading', label: 'Saving' }), 'loading'));
real.appendChild(
  caption(
    row('Beside a button', 8, [
      btn({ label: 'Share', lead: true, g: 'share-network' }),
      ib({ g: 'dots-three-vertical', a: 'outline', label: 'More actions' })
    ]),
    'beside a Button of the same size: same height'
  )
);
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, Intent, Appearance, Size and State are variants, and Focus is a separate switch. Choose the glyph in the nested Icon (Glyph property, any glyph of the page assets/phosphor); its size and color follow the icon button. Write the accessible name in the Label property: it is not drawn, but developers read it in Dev Mode.',
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
const I = ['accent', 'neutral', 'danger'],
  A = ['solid', 'outline', 'ghost'];

const va = section(
  'Variants',
  'Intent says what the action means: neutral for most icon buttons (the default), accent for the main action of an area, danger for actions that delete or cannot be undone. Appearance sets the visual weight: ghost (the default) for toolbars and repeated actions, outline and solid when the icon button must stand out. Size matches the Button of the same size. The brand and the light or dark appearance come from the modes of the frame.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const matrix = card('Intent × appearance', 'VERTICAL', 12);
const mh = stack('Header', 'HORIZONTAL', 16);
mh.appendChild(label('', 80));
for (const a of A) mh.appendChild(label(a, 64, 'color/content/tertiary'));
matrix.appendChild(mh);
for (const i of I) {
  const r = stack(i, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(i, 80));
  for (const a of A) {
    const cell = stack(a, 'HORIZONTAL', 0);
    cell.resize(64, 40);
    cell.primaryAxisSizingMode = 'FIXED';
    cell.appendChild(ib({ i, a, g: i === 'danger' ? 'trash' : 'plus', label: i === 'danger' ? 'Delete' : 'Add' }));
    r.appendChild(cell);
  }
  matrix.appendChild(r);
}
vrow.appendChild(matrix);
const sizes = card('Sizes', 'HORIZONTAL', 24);
sizes.counterAxisAlignItems = 'MAX';
for (const [s, px] of [
  ['sm', '32 px, 16 px icon'],
  ['md', '40 px, 20 px icon'],
  ['lg', '48 px, 24 px icon']
])
  sizes.appendChild(caption(ib({ s, a: 'outline', g: 'pencil-simple', label: 'Edit' }), `${s} · ${px}`));
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
  f.appendChild(
    row('Icon buttons', 8, [
      ib({ i: 'accent', a: 'solid', g: 'plus' }),
      ib({ a: 'outline', g: 'pencil-simple', label: 'Edit' }),
      ib({ g: 'dots-three-vertical', label: 'More actions' })
    ])
  );
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}

const st = section(
  'States',
  'An icon button has five states: default, hover, pressed, loading and disabled. Focus is a separate switch that can be combined with any state. While loading, the loading indicator replaces the icon and the icon button can still receive focus. When disabled, it cannot be focused or activated. If an icon button is both loading and disabled, it looks disabled and keeps its loading indicator.'
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
  for (const t of states) h.appendChild(label(t, 100, 'color/content/tertiary'));
  block.appendChild(h);
  for (const i of I)
    for (const a of A) {
      const r = stack(`${i} ${a}`, 'HORIZONTAL', 16);
      r.counterAxisAlignItems = 'CENTER';
      r.appendChild(label(`${i} ${a}`, 120));
      for (const t of states) {
        const cell = stack(t, 'HORIZONTAL', 0);
        cell.resize(100, 44);
        cell.primaryAxisSizingMode = 'FIXED';
        cell.counterAxisAlignItems = 'CENTER';
        cell.appendChild(
          ib({
            i,
            a,
            t: t === 'focus' ? 'default' : t,
            focus: t === 'focus',
            g: i === 'danger' ? 'trash' : 'pencil-simple',
            label: i === 'danger' ? 'Delete' : 'Edit'
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
combo.appendChild(caption(ib({ t: 'hover', focus: true, g: 'gear', label: 'Settings' }), 'hover with focus'));
combo.appendChild(
  caption(ib({ t: 'loading', i: 'accent', a: 'solid', focus: true, label: 'Saving' }), 'loading with focus')
);
const dl = ib({ t: 'disabled', a: 'outline', label: 'Saving' });
dl.findOne((x) => x.name === 'Icon').visible = false;
dl.findOne((x) => x.name === 'Loading indicator').visible = true;
combo.appendChild(caption(dl, 'loading and disabled (Icon hidden, Loading indicator shown on this instance)'));
st.appendChild(combo);
combo.layoutSizingHorizontal = 'FILL';

const bs = section(
  'Behavior & sizing',
  'An icon button is always a square: it does not grow with the available space or shrink in a narrow row. Its side is the Button height of the same size, so it follows the density of the frame: compact, standard or comfortable. The icon keeps its size in every density. However small the square, the area that reacts to clicks and taps is at least 44 × 44 px, and it takes no room in the layout: space neighbors with space.control.gap of their size (6, 8 or 10 px in standard density), as for buttons. In compact density, sm icon buttons (28 px) sit 4 px apart and their targets reach 4 px into the square of a neighbor: an accepted exception, since the squares stay above the 24 px minimum of WCAG.'
);
const dens = card('Density × size', 'HORIZONTAL', 12);
bs.appendChild(dens);
dens.layoutSizingHorizontal = 'FILL';
for (const [d, px] of [
  ['compact', '28, 32, 40 px'],
  ['standard', '32, 40, 48 px'],
  ['comfortable', '36, 44, 56 px']
]) {
  const f = panel(d, 'VERTICAL', 12, 24);
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
  f.appendChild(
    row(
      'Sizes',
      12,
      ['sm', 'md', 'lg'].map((s) => ib({ s, a: 'outline', g: 'pencil-simple', label: 'Edit' }))
    )
  );
  f.appendChild(text(`sm, md, lg: ${px}; icons 16, 20, 24 px`, 'caption/md', 'color/content/tertiary'));
  dens.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
  f.layoutSizingVertical = 'FILL';
}
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
bs.appendChild(brow);
brow.layoutSizingHorizontal = 'FILL';
const tcard = card('Target', 'VERTICAL', 16);
const compact = stack('Compact toolbar', 'HORIZONTAL', 8, 16);
compact.counterAxisAlignItems = 'CENTER';
compact.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), 'compact'));
for (const g of ['text-b', 'text-italic', 'text-underline']) {
  const inst = ib({ s: 'sm', g, label: g.replace('text-', '') });
  const t = inst.findOne((n) => n.name === 'Target');
  stroke(t, 'color/focus/ring', 1, [3, 2]);
  compact.appendChild(inst);
}
tcard.appendChild(caption(compact, 'compact sm: 28 px squares, space.control.gap 4 px; 44 px targets (dashed)'));
brow.appendChild(tcard);
tcard.layoutSizingHorizontal = 'FILL';
const pair = card('Beside a button', 'VERTICAL', 16);
for (const s of ['sm', 'md', 'lg'])
  pair.appendChild(
    row(`Pair ${s}`, 8, [
      btn({ s, a: 'outline', i: 'neutral', label: 'Download', lead: true, g: 'download-simple' }),
      ib({ s, a: 'outline', g: 'dots-three-vertical', label: 'More actions' })
    ])
  );
pair.appendChild(chip('same size, same height: sm 32, md 40, lg 48 px; gap space.control.gap'));
brow.appendChild(pair);
pair.layoutSizingHorizontal = 'FILL';
pair.layoutSizingVertical = 'FILL';

const ue = section(
  'Usage examples',
  'Use an icon button for frequent, familiar actions where the icon is understood without its label: toolbars, table rows, card headers, closing a panel. Use a Button with a text label when the action is new, rare or ambiguous. Every icon button needs a label, written as a short verb phrase (“Delete invoice”), shown by a tooltip on hover and focus. Keep one appearance per group. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
ex.counterAxisAlignItems = 'MIN';
const colA = stack('Column A', 'VERTICAL', 24);
const toolbar = stack('Editor toolbar', 'HORIZONTAL', 8, 6);
fill(toolbar, 'color/surface/raised');
stroke(toolbar, 'color/border/subtle');
toolbar.cornerRadius = 10;
toolbar.counterAxisAlignItems = 'CENTER';
for (const [g, l] of [
  ['text-b', 'Bold'],
  ['text-italic', 'Italic'],
  ['text-underline', 'Underline'],
  ['link', 'Insert link'],
  ['list-bullets', 'Bulleted list']
])
  toolbar.appendChild(ib({ s: 'sm', g, label: l }));
colA.appendChild(caption(toolbar, 'editor toolbar: neutral ghost, sm, space.control.gap'));
const header2 = stack('Card header', 'HORIZONTAL', 8, [12, 12, 12, 20]);
fill(header2, 'color/surface/raised');
stroke(header2, 'color/border/subtle');
header2.cornerRadius = 12;
header2.counterAxisAlignItems = 'CENTER';
const ht = text('Quarterly report', 'heading/sm');
header2.appendChild(ht);
ht.layoutGrow = 1;
header2.appendChild(ib({ g: 'dots-three-vertical', label: 'More actions' }));
header2.appendChild(ib({ g: 'x', label: 'Close' }));
header2.resize(340, header2.height);
colA.appendChild(caption(header2, 'a card header: more actions and close'));
ex.appendChild(colA);
const colB = stack('Column B', 'VERTICAL', 24);
const table = stack('Table', 'VERTICAL', 0);
fill(table, 'color/surface/raised');
stroke(table, 'color/border/subtle');
table.cornerRadius = 12;
table.clipsContent = true;
for (const [k, name] of ['Invoice 2041', 'Invoice 2042'].entries()) {
  const r = stack('Row', 'HORIZONTAL', 8, [6, 8, 6, 16]);
  r.counterAxisAlignItems = 'CENTER';
  if (k) stroke(r, 'color/border/subtle');
  r.strokeTopWeight = k ? 1 : 0;
  r.strokeBottomWeight = r.strokeLeftWeight = r.strokeRightWeight = 0;
  const n = text(name, 'body/sm', 'color/content/primary');
  n.textAutoResize = 'NONE';
  n.resize(150, n.height);
  r.appendChild(n);
  r.appendChild(ib({ s: 'sm', g: 'pencil-simple', label: 'Edit ' + name }));
  r.appendChild(ib({ s: 'sm', g: 'copy', label: 'Duplicate ' + name }));
  r.appendChild(ib({ s: 'sm', g: 'trash', i: 'danger', label: 'Delete ' + name }));
  table.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
}
colB.appendChild(caption(table, 'row actions: the label names the row (“Delete Invoice 2041”)'));
const player = stack('Player', 'HORIZONTAL', 12, 12);
fill(player, 'color/surface/subtle');
player.cornerRadius = 12;
player.counterAxisAlignItems = 'CENTER';
player.appendChild(ib({ g: 'caret-left', label: 'Previous' }));
player.appendChild(ib({ s: 'lg', i: 'accent', a: 'solid', g: 'play', label: 'Play' }));
player.appendChild(ib({ g: 'caret-right', label: 'Next' }));
colB.appendChild(caption(player, 'one accent solid for the main action, ghost around it'));
ex.appendChild(colB);
const dark = stack('Dark toolbar', 'HORIZONTAL', 8, 16);
dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(dark, 'color/surface/canvas');
dark.cornerRadius = 12;
dark.counterAxisAlignItems = 'CENTER';
const dt = text('Projects', 'heading/sm');
dark.appendChild(dt);
dt.layoutGrow = 1;
dark.appendChild(ib({ g: 'magnifying-glass', label: 'Search' }));
dark.appendChild(ib({ g: 'bell', label: 'Notifications' }));
dark.appendChild(ib({ i: 'accent', a: 'solid', g: 'plus', label: 'New project' }));
dark.resize(280, dark.height);
ex.appendChild(caption(dark, 'an app header, orchid brand, dark'));
ue.appendChild(ex);
ex.layoutSizingHorizontal = 'FILL';

// Center each blueprint board's drawing vertically; the legend elements keep their position relative to it.
// Gaps between neighbors use space.control.gap of their size (user decision, 2026-10-20).
const bindGap = (name, size) => {
  for (const n of root.findAll((x) => x.type === 'FRAME' && x.name === name))
    n.setBoundVariable('itemSpacing', V(`space/control/gap/${size}`));
};
bindGap('Compact toolbar', 'sm');
bindGap('Editor toolbar', 'sm');
for (const n of table.children) n.setBoundVariable('itemSpacing', V('space/control/gap/sm'));
for (const name of ['Card header', 'Dark toolbar', 'Player']) bindGap(name, 'md');
for (const sz of ['sm', 'md', 'lg']) bindGap(`Pair ${sz}`, sz);
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
return { root: root.id, h: Math.round(root.height), w: Math.round(root.width), set: [set.x, set.y] };
