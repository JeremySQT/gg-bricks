// Link specification page builder (use_figma body), 2026-10-20 (Color × Size × State set). One part.
// Builds the frame “Link — Specification” on the page actions/link (225:2) in the layout of the other component
// pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body) and places the
// component set and its part _Link/Destination to its right. Explanatory instances come from the Link set
// (232:659); every option is a property of the instance. The node ids and
// property keys the script relies on are listed in reports/components/link/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('225:2');
await figma.setCurrentPageAsync(page);
const NAME = 'Link — Specification';
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
const set = await figma.getNodeByIdAsync('232:659');
const part = await figma.getNodeByIdAsync('232:442');
const PROPS = Object.keys(set.componentPropertyDefinitions);
const LABEL = PROPS.find((k) => k.startsWith('Label'));
const META = Object.keys(part.componentPropertyDefinitions).find((k) => k.startsWith('Meta'));
const FOCUS = PROPS.find((k) => k.startsWith('Focus'));
const iconSet = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const G = { 'file-pdf': '200:4959', 'file-xls': '200:4975', 'file-zip': '200:4981', 'file-doc': '200:4957' };
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
for (const st of ['Regular', 'Medium', 'Semi Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
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
// Link instance: Color (accent, or “on …” for tone inherit in that context: o.ctx), Size (o.size, md by default),
// State, label, focus, and the nested Destination part (destination, meta, glyph of the format).
const lk = (o = {}) => {
  const color = o.ctx ? `on ${o.ctx}` : 'accent';
  const inst = set.children
    .find((c) => c.name === `Color=${color}, Size=${o.size || 'md'}, State=${o.t || 'default'}`)
    .createInstance();
  inst.setProperties({ [LABEL]: o.label || 'Read the guide', [FOCUS]: !!o.focus });
  const dest = inst.exposedInstances.find((e) => e.name === 'Destination');
  if (o.d && o.d !== 'page') {
    dest.setProperties(
      o.d === 'file' ? { Destination: 'file', [META]: o.meta || ' (PDF, 2.4 MB)' } : { Destination: o.d }
    );
    if (o.g) dest.findOne((n) => n.name === 'Indicator icon').setProperties({ [GLYPH]: G[o.g] });
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
const row = (name, gap = 8, items = []) => {
  const r = stack(name, 'HORIZONTAL', gap);
  r.counterAxisAlignItems = 'CENTER';
  for (const it of items) r.appendChild(it);
  return r;
};
// A surface standing for a colored context of tone inherit: a status message or an inverse surface.
const message = (kind, items) => {
  const m = stack(`Message ${kind}`, 'HORIZONTAL', 6, [10, 14, 10, 14]);
  m.counterAxisAlignItems = 'CENTER';
  m.cornerRadius = 8;
  if (kind === 'inverse') fill(m, 'color/surface/inverse');
  else {
    fill(m, `color/status/${kind}/surface`);
    stroke(m, `color/status/${kind}/border`);
  }
  const color = kind === 'inverse' ? 'color/content/inverse' : `color/status/${kind}/content`;
  for (const it of items) m.appendChild(typeof it === 'string' ? text(it, 'body/md', color) : it);
  return m;
};
const D = ['page', 'external', 'email', 'phone', 'file', 'print'];
const DLABEL = {
  page: 'Pricing',
  external: 'Status page',
  email: 'support@ggbrick.io',
  phone: '+33 1 23 45 67 89',
  file: 'Annual report',
  print: 'Printable version'
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
title.appendChild(text('ACTIONS / LINK', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Link', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'A link takes the reader to another page, a file, an email address, a phone number or a printable version. It is underlined text in the font of the sentence around it, so it is never recognized by its color alone. What follows the words tells the reader where it leads before they follow it: an arrow for another site, an envelope, a handset, a printer, or a file glyph with the format and the size.',
    'body/lg',
    'color/content/secondary',
    900
  )
);
const hero = stack('Hero', 'VERTICAL', 14, [40, 16, 40, 16]);
fill(hero, 'wireframe/hero');
stroke(hero, 'wireframe/card', 8);
hero.cornerRadius = 16;
shadow(hero);
hero.counterAxisAlignItems = 'CENTER';
const h1 = row('Hero row 1', 32, [
  lk({ label: 'Pricing', size: 'lg' }),
  lk({ d: 'external', label: 'Status page', size: 'lg' }),
  lk({ d: 'email', label: 'support@ggbrick.io', size: 'lg' })
]);
const h2 = row('Hero row 2', 32, [
  lk({ d: 'file', label: 'Annual report', size: 'lg' }),
  lk({ d: 'print', label: 'Printable version', size: 'lg' })
]);
hero.appendChild(h1);
hero.appendChild(h2);
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/actions/link) are the reference. This page documents the Figma component set “Link”; every link shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance, the standard density and body md text.',
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
  'How a link is built. The drawing is enlarged three times; the real links are shown underneath.'
);
const anRow = stack('Anatomy row', 'HORIZONTAL', 44);
anRow.counterAxisAlignItems = 'MIN';
const dg = board('Anatomy diagram', 700, 300);
const Z = 3,
  FS = 16 * Z,
  LX = 70,
  LY = 120;
const big = (chars, underline) => {
  const t = text(chars, 'body/md', 'wireframe/ink');
  t.fontSize = FS;
  t.lineHeight = { unit: 'PIXELS', value: 24 * Z };
  t.leadingTrim = 'CAP_HEIGHT';
  if (underline) {
    t.textDecoration = 'UNDERLINE';
    t.textDecorationThickness = { unit: 'PIXELS', value: Z };
  }
  dg.appendChild(t);
  return t;
};
const lab = big('Report', true);
lab.name = '1 Label';
lab.x = LX;
lab.y = LY;
const meta = big(' (PDF, 2 MB)', false);
meta.name = '2 Meta';
meta.opacity = 0.75;
meta.x = lab.x + lab.width;
meta.y = LY;
const glyphX = meta.x + meta.width + 4 * Z;
const gl = iconSet.children.find((c) => c.name === 'Size=xl').createInstance();
gl.setProperties({ [GLYPH]: G['file-pdf'] });
for (const v of gl.findAll((n) => n.type === 'VECTOR')) fill(v, 'wireframe/ink');
dg.appendChild(gl);
gl.resize(FS, FS);
gl.x = glyphX;
gl.y = LY + lab.height / 2 - FS / 2;
gl.opacity = 0.75;
gl.name = '3 Indicator (zoomed)';
const ring = figma.createFrame();
ring.name = '4 Focus ring';
ring.fills = [];
ring.x = LX - 2 * Z;
ring.y = LY - (24 * Z - lab.height) / 2 - 2 * Z;
ring.resize(gl.x + FS - LX + 4 * Z, 24 * Z + 4 * Z);
ring.cornerRadius = 6 * Z;
stroke(ring, 'wireframe/ink', 2, null, 'OUTSIDE');
dg.appendChild(ring);
const dimH = (x1, x2, y, ch) => {
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
  callout(ch, dg, (x1 + x2) / 2, y + 22);
};
const ringBottom = ring.y + ring.height;
dimH(meta.x + meta.width, glyphX, ringBottom + 24, 'A');
dimH(glyphX, glyphX + FS, ringBottom + 24, 'B');
pin(dg, 1, LX + lab.width / 2, 40, LX + lab.width / 2, ring.y);
pin(dg, 2, meta.x + meta.width / 2, 40, meta.x + meta.width / 2, LY);
pin(dg, 3, glyphX + FS / 2, 40, glyphX + FS / 2, gl.y);
pin(dg, 4, LX + 20, ringBottom + 50, LX + 20, ringBottom);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
for (const [n, s] of [
  [
    '1',
    'Label: the words of the link, underlined in every state, in the link color (or, with Color “on …”, the color of the text around it).'
  ],
  ['2', 'Meta (files only): the format and the size in parentheses, not underlined, in a quieter color.'],
  [
    '3',
    'Indicator: one glyph, one em square, after the words, not underlined, in a quieter color. It says where the link goes; a page link has none.'
  ],
  ['4', 'Focus ring: around the link when it is focused with the keyboard.'],
  ['A', 'Gap before the indicator: 2, 4 or 6 px with the density.'],
  ['B', 'Indicator size: the font size of the text (16 px in body md).']
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
real.appendChild(caption(lk({ label: 'Pricing' }), 'page'));
real.appendChild(caption(lk({ d: 'external', label: 'Status page' }), 'external'));
real.appendChild(caption(lk({ d: 'file', label: 'Annual report' }), 'file'));
real.appendChild(caption(lk({ label: 'Pricing', focus: true }), 'focused'));
real.appendChild(caption(message('inverse', ['Saved.', lk({ label: 'Undo', ctx: 'inverse' })]), 'on inverse'));
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, everything is set in the properties of the instance. Color, Size and State are variants, Focus is a switch and Label a text. The nested Destination part sets the destination, the Meta of a file and, in Indicator icon › Glyph, the glyph of its format (file-pdf, file-xls, file-zip…). Size is the size of the body text around the link; Color “on …” is the color of the text of a status message or an inverse surface.',
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
  'Destination says where the link goes: page (the default, another page of the product), external (another site, opened in a new tab), email, phone, file (with its format and size) and print (a printable version). Color accent (the default) draws the words in the link color. On info, on success, on warning, on danger and on inverse use the color of the text of that context, for status messages and inverse surfaces where the link color would not be readable (tone inherit in code). Size follows the body text around the link: sm, md (the default) or lg. The brand and the light or dark appearance come from the modes of the frame.'
);
const matrix = card('Destinations', 'VERTICAL', 14);
const mh = stack('Header', 'HORIZONTAL', 16);
mh.appendChild(label('', 90));
mh.appendChild(label('accent', 330, 'color/content/tertiary'));
mh.appendChild(label('on info, in an info message', 400, 'color/content/tertiary'));
matrix.appendChild(mh);
for (const d of D) {
  const r = stack(d, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(d, 90));
  const a = stack('accent', 'HORIZONTAL', 0);
  a.resize(330, 24);
  a.primaryAxisSizingMode = 'FIXED';
  a.counterAxisAlignItems = 'CENTER';
  a.appendChild(lk({ d, label: DLABEL[d] }));
  r.appendChild(a);
  r.appendChild(message('info', ['Note:', lk({ d, label: DLABEL[d], ctx: 'info' })]));
  matrix.appendChild(r);
}
va.appendChild(matrix);
matrix.layoutSizingHorizontal = 'FILL';
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const fonts = card('Sizes', 'VERTICAL', 14);
for (const [sz, style] of [
  ['sm', 'body/sm'],
  ['md', 'body/md'],
  ['lg', 'body/lg']
])
  fonts.appendChild(
    row(sz, 6, [
      text('Read the', style),
      lk({ d: 'external', label: 'release notes', size: sz }),
      chip(`Size ${sz}, in body ${sz} text`, false)
    ])
  );
vrow.appendChild(fonts);
fonts.layoutSizingHorizontal = 'FILL';
const ctx = stack('Contexts', 'VERTICAL', 12);
for (const [b, a] of [
  ['base', 'light'],
  ['base', 'dark'],
  ['brick', 'light'],
  ['brick', 'dark'],
  ['orchid', 'light'],
  ['orchid', 'dark']
]) {
  const f = stack(`${b} ${a}`, 'HORIZONTAL', 12, [10, 16, 10, 16]);
  f.cornerRadius = 10;
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
  const t = text(`${b} · ${a}`, 'label/sm', 'color/content/secondary');
  t.textAutoResize = 'NONE';
  t.resize(90, t.height);
  f.appendChild(t);
  f.appendChild(lk({ label: 'Pricing' }));
  f.appendChild(lk({ d: 'file', label: 'Report', meta: ' (PDF, 1 MB)' }));
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}
vrow.appendChild(ctx);
ctx.layoutSizingHorizontal = 'FILL';

const st = section(
  'States',
  'A link is underlined in every state, so it is never recognized by its color alone. Hovering or pressing it makes the underline thicker (1 px to 2 px); the color does not change, and visited links look the same as the others. Focus is a separate switch: a ring around the link when it is reached with the keyboard. A link has no disabled state: a destination that cannot be followed is plain text.'
);
const sc = card('States', 'VERTICAL', 16);
const sh = stack('Header', 'HORIZONTAL', 16);
sh.appendChild(label('', 120));
for (const t of ['default', 'hover', 'pressed', 'focus']) sh.appendChild(label(t, 200, 'color/content/tertiary'));
sc.appendChild(sh);
for (const [name, d, ctxName] of [
  ['accent, page', 'page', null],
  ['accent, file', 'file', null],
  ['on inverse', 'external', 'inverse']
]) {
  const r = stack(name, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(name, 120));
  for (const t of ['default', 'hover', 'pressed', 'focus']) {
    const cell = stack(t, 'HORIZONTAL', 0, ctxName ? [6, 8, 6, 8] : 0);
    cell.counterAxisAlignItems = 'CENTER';
    if (ctxName) {
      fill(cell, 'color/surface/inverse');
      cell.cornerRadius = 6;
    }
    cell.appendChild(
      lk({
        d,
        t: t === 'focus' ? 'default' : t,
        focus: t === 'focus',
        label: d === 'file' ? 'Report' : d === 'page' ? 'Pricing' : 'Status page',
        meta: ' (PDF, 1 MB)',
        ctx: ctxName
      })
    );
    const w = stack('Cell', 'HORIZONTAL', 0);
    w.resize(200, 36);
    w.primaryAxisSizingMode = 'FIXED';
    w.counterAxisAlignItems = 'CENTER';
    w.appendChild(cell);
    r.appendChild(w);
  }
  sc.appendChild(r);
}
st.appendChild(sc);
sc.layoutSizingHorizontal = 'FILL';

const bs = section(
  'Behavior & sizing',
  'A link is inline text: in a sentence it takes the font of the text and wraps with it, and the meta and the indicator stay with the last word. Figma cannot flow a component inside a paragraph: compose a short sentence as a wrapping row of text and link instances, or, inside a long paragraph, style the words of the link directly (color/content/link and an underline) and annotate them. The link does not change with the density, except the gap before the indicator.'
);
const brow = stack('Behavior row', 'HORIZONTAL', 24);
brow.counterAxisAlignItems = 'MIN';
bs.appendChild(brow);
brow.layoutSizingHorizontal = 'FILL';
const comp = card('In a sentence', 'VERTICAL', 16);
const sentence = stack('Sentence', 'HORIZONTAL', 4);
sentence.layoutWrap = 'WRAP';
sentence.counterAxisSpacing = 4;
sentence.counterAxisAlignItems = 'CENTER';
for (const part of [
  text('Before you start, read the', 'body/md'),
  lk({ label: 'setup guide' }),
  text('and download the', 'body/md'),
  lk({ d: 'file', label: 'checklist', meta: ' (XLS, 40 KB)', g: 'file-xls' }),
  text('to track your progress.', 'body/md')
])
  sentence.appendChild(part);
comp.appendChild(sentence);
sentence.resize(420, sentence.height);
comp.appendChild(chip('a wrapping row of text and Link instances (auto layout, wrap, 4 px)'));
brow.appendChild(comp);
comp.layoutSizingHorizontal = 'FILL';
const styled = card('Styled words', 'VERTICAL', 16);
const para = text(
  'Your trial ends on 30 November. To keep your projects, choose a plan on the billing page before that date; you can also export everything first.',
  'body/md',
  'color/content/primary',
  420
);
const start = para.characters.indexOf('billing page');
para.setRangeFills(start, start + 'billing page'.length, [paint('color/content/link')]);
para.setRangeTextDecoration(start, start + 'billing page'.length, 'UNDERLINE');
styled.appendChild(para);
styled.appendChild(chip('inside a paragraph: the words styled as a link (link color, underline)'));
brow.appendChild(styled);
styled.layoutSizingHorizontal = 'FILL';

const ue = section(
  'Usage examples',
  'Write the label as the destination, not as an instruction: “Annual report”, not “Click here”. Give files their format and size. Use a link to go somewhere and a Button to do something. Keep links in running text short; put lists of links in their own block. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 24);
ex.counterAxisAlignItems = 'MIN';
const downloads = stack('Downloads', 'VERTICAL', 10, 16);
fill(downloads, 'color/surface/raised');
stroke(downloads, 'color/border/subtle');
downloads.cornerRadius = 12;
downloads.appendChild(text('Downloads', 'heading/sm'));
downloads.appendChild(lk({ d: 'file', label: 'Annual report', meta: ' (PDF, 2.4 MB)' }));
downloads.appendChild(lk({ d: 'file', label: 'Budget 2026', meta: ' (XLSX, 180 KB)', g: 'file-xls' }));
downloads.appendChild(lk({ d: 'file', label: 'Brand assets', meta: ' (ZIP, 48 MB)', g: 'file-zip' }));
ex.appendChild(caption(downloads, 'a list of files: format and size'));
const colB = stack('Column B', 'VERTICAL', 24);
const contact = stack('Contact', 'VERTICAL', 8, 16);
fill(contact, 'color/surface/raised');
stroke(contact, 'color/border/subtle');
contact.cornerRadius = 12;
contact.appendChild(text('Contact support', 'heading/sm'));
contact.appendChild(lk({ d: 'email', label: 'support@ggbrick.io' }));
contact.appendChild(lk({ d: 'phone', label: '+33 1 23 45 67 89' }));
contact.appendChild(lk({ d: 'external', label: 'Community forum' }));
colB.appendChild(caption(contact, 'contact details: the label is the address or the number'));
colB.appendChild(
  caption(
    message('warning', ['Your card expires soon.', lk({ label: 'Update it', ctx: 'warning' })]),
    'Color on warning, in a status message'
  )
);
ex.appendChild(colB);
const footer = stack('Footer', 'VERTICAL', 10, 16);
footer.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
footer.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
fill(footer, 'color/surface/canvas');
footer.cornerRadius = 12;
footer.appendChild(text('Resources', 'label/md', 'color/content/secondary'));
for (const o of [
  { label: 'Documentation' },
  { label: 'Changelog' },
  { d: 'external', label: 'GitHub' },
  { d: 'print', label: 'Printable version' }
])
  footer.appendChild(lk({ ...o, size: 'sm' }));
ex.appendChild(caption(footer, 'a footer, orchid brand, dark, body sm'));
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
part.x = set.x + set.width + 80;
part.y = 0;
return { root: root.id, h: Math.round(root.height), board: dg.id };
