// Shortcut specification page builder (use_figma body), 2026-10-14. One part; safe to re-run (the frame of the same
// name on the page is replaced). Follows the layout of the Button specification (white header on a gray page, hero
// card, blueprint boards as cards, white cards with a light border in the body): header (breadcrumb, title, summary,
// hero, reference note, divider, Anatomy with its two blueprint boards, legends and real parts), then the body
// (Variants with the keys table, States, Behavior & sizing, Usage examples). The grid tile is the 16 px PNG of the
// Button boards (hash GRID); the node ids and property keys are listed in reports/components/shortcut/figma/ledger.json.
// Run as a build plus one fix on 2026-10-14 (keys table column widths, keycap zoom at ×8); both are folded in here.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:1569');
await figma.setCurrentPageAsync(page);
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
const NAME = 'Shortcut — Specification';
for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
const set = await figma.getNodeByIdAsync('151:110');
const defs = set.componentPropertyDefinitions;
const propKey = (name) => Object.keys(defs).find((k) => k.split('#')[0] === name);
const SHOW2 = propKey('Show key 2'),
  SHOW3 = propKey('Show key 3');
const keySet = await figma.getNodeByIdAsync('149:1581');
const KEY = Object.keys(keySet.componentPropertyDefinitions).find((k) => k.split('#')[0] === 'Key');
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
// Neutral notation → key texts per platform (the rules of the contract, as keys.ts implements them).
const MAC = {
  Ctrl: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Meta: '⌘',
  Enter: '↩',
  Escape: '⎋',
  Tab: '⇥',
  Backspace: '⌫',
  Delete: '⌦',
  Home: '↖',
  End: '↘',
  PageUp: '⇞',
  PageDown: '⇟'
};
const OTHER = { Meta: 'Win', Escape: 'Esc', Delete: 'Del', PageUp: 'PgUp', PageDown: 'PgDn' };
const EVERY = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Plus: '+' };
const ORDER = { Mac: ['Ctrl', 'Alt', 'Shift', 'Meta'], Other: ['Meta', 'Ctrl', 'Alt', 'Shift'] };
const keysFor = (keys, p) => {
  const toks = keys
    .split('+')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t === 'Mod' ? (p === 'Mac' ? 'Meta' : 'Ctrl') : t));
  const mods = ORDER[p].filter((m) => toks.includes(m));
  const rest = toks.filter((t) => !ORDER[p].includes(t));
  return [...mods, ...rest].map(
    (id) => EVERY[id] || (p === 'Mac' ? MAC[id] : OTHER[id]) || (id.length === 1 ? id.toUpperCase() : id)
  );
};
const sc = (keys, o = {}) => {
  const p = o.p || 'Mac',
    a = o.a || 'Plain',
    s = o.s || 'md';
  const v = set.children.find((c) => c.name === `Appearance=${a}, Size=${s}, Platform=${p}`);
  const inst = v.createInstance();
  const texts = keysFor(keys, p);
  if (texts.length > 3) throw new Error('too many keys ' + keys);
  inst.setProperties({ [SHOW2]: texts.length >= 2, [SHOW3]: texts.length === 3 });
  texts.forEach((t, i) =>
    inst.findOne((n) => n.type === 'INSTANCE' && n.name === `Key ${i + 1}`).setProperties({ [KEY]: t })
  );
  return inst;
};
const item = (lbl, keys, o = {}, w) => {
  const r = stack('Item', 'HORIZONTAL', 24);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(text(lbl, 'label/md'));
  if (w) {
    r.resize(w, r.height);
    r.primaryAxisSizingMode = 'FIXED';
    r.primaryAxisAlignItems = 'SPACE_BETWEEN';
  }
  r.appendChild(sc(keys, o));
  return r;
};

const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 480;
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
title.appendChild(text('CONTENT / SHORTCUT', 'label/sm', 'color/content/tertiary'));
title.appendChild(text('Shortcut', 'display/md'));
header.appendChild(title);
const intro = stack('Intro', 'VERTICAL', 28);
header.appendChild(intro);
intro.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'A shortcut shows the keys of a keyboard command next to the action it triggers: after a menu item, in a tooltip, after a button label or in a help page. It is written once in a neutral notation (Mod+Shift+P) and shown in the conventions of the user’s platform: Apple glyphs on Mac, short names joined by + elsewhere. Screen readers hear the words, never the glyphs.',
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
hero.appendChild(item('Search', 'Mod+K'));
hero.appendChild(item('Search', 'Mod+K', { p: 'Other' }));
hero.appendChild(sc('Mod+Shift+P', { a: 'Keycap' }));
hero.appendChild(sc('Mod+Shift+P', { a: 'Keycap', p: 'Other' }));
intro.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
intro.appendChild(
  text(
    'The contract and the code in the ggbrick repository (foundations/components/content/shortcut) are the reference. This page documents the Figma component set “Shortcut”; every shortcut shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.',
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
  'How a shortcut is built. The drawing is simplified and not to scale; real shortcuts are shown underneath.'
);
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
const inkText = (parent, chars, size, w, h) => {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: 'Medium' };
  t.fontSize = size;
  t.characters = chars;
  fill(t, 'wireframe/ink');
  parent.appendChild(t);
  t.x = (w - t.width) / 2;
  t.y = (h - t.height) / 2;
  return t;
};
const OX = 270,
  OY = 128,
  CH = 45;
const cont = rect('1 Container', OX - 10, OY - 10, 180, CH + 20, 'wireframe/tint/4', 8);
stroke(cont, 'wireframe/ink', 1.5, [6, 4]);
cont.opacity = 0.9;
const cap = (name, x, w, chars) => {
  const c = rect(name, x, OY, w, CH, 'wireframe/tint/8', 15);
  stroke(c, 'wireframe/tint/48', 1.5);
  inkText(c, chars, 28, w, CH);
  return c;
};
cap('2 Key', OX, 75, 'Ctrl');
const sp = rect('3 Separator', OX + 85, OY, 20, CH, null, 0);
inkText(sp, '+', 28, 20, CH);
cap('2 Key', OX + 115, 45, 'K');
pin(dg, 2, OX + 37, 35, OX + 37, OY);
pin(dg, 3, OX + 95, 35, OX + 95, OY + 8);
pin(dg, 1, OX + 80, 223, OX + 80, OY + CH + 10);
anRow.appendChild(dg);
const legend = stack('Legend', 'VERTICAL', 12);
fill(legend, 'wireframe/canvas');
legend.cornerRadius = 12;
[
  'Container: the row of keys. It is as wide as its keys, stays on one line and sits in the text around it, aligned on its baseline.',
  'Key: one per key of the combination, modifiers first. Plain, it is only the text; keycap, it is drawn as a cap with a surface, a border and rounded corners.',
  'Separator: the + between keys on other platforms, in the same color as the text and outside any cap. On Mac the keys are juxtaposed, without separator.'
].forEach((s, i) => {
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
// Keycap zoom (×8)
const spRow = stack('Spacing row', 'HORIZONTAL', 44);
spRow.counterAxisAlignItems = 'MIN';
const sd = board('Keycap diagram', 700, 300);
sd.clipsContent = true;
const SX = 70,
  SY = 40,
  Z = 8;
const zcap = (x, chars) => {
  const c = rect('Cap (zoom)', x, SY, 18 * Z, 18 * Z, 'wireframe/tint/8', 6 * Z, sd);
  stroke(c, 'wireframe/tint/48', 1 * Z);
  const lb = rect('Line box', 5 * Z, 1 * Z, 8 * Z, 16 * Z, 'wireframe/tint/16', 4, c);
  lb.opacity = 0.9;
  inkText(c, chars, 11 * Z, 18 * Z, 18 * Z);
  return c;
};
zcap(SX, 'K');
zcap(SX + 22 * Z, 'L');
const line = (x, y, len, rot) => {
  const l = figma.createLine();
  l.resize(len, 0);
  l.rotation = rot;
  l.x = x;
  l.y = y;
  stroke(l, 'wireframe/ink', 1.5, null, 'CENTER');
  sd.appendChild(l);
  return l;
};
// Dimension row: the callout sits 21 px below the line (or above it, side -1) so that the rows stay inside the board.
const dim = (ch, x, w, y, side = 1) => {
  line(SX + x, y, w, 0);
  for (const tx of [x, x + w]) line(SX + tx, y + 4, 8, 90);
  callout(ch, sd, SX + x + w / 2, y + side * 21);
};
const Y1 = SY + 18 * Z + 10;
dim('A', 1 * Z, 4 * Z, Y1);
dim('C', 18 * Z, 4 * Z, Y1);
dim('B', 0, 1 * Z, SY - 12, -1);
const vx = SX + 40 * Z + 28;
line(vx, SY + 18 * Z, 18 * Z, 90);
for (const ty of [SY, SY + 18 * Z]) line(vx - 4, ty, 8, 0);
callout('D', sd, vx + 26, SY + 9 * Z);
spRow.appendChild(sd);
const spCard = stack('Spacing legend', 'VERTICAL', 12);
fill(spCard, 'wireframe/canvas');
spCard.cornerRadius = 12;
for (const [ch, s] of [
  ['A', 'Side padding of a cap, the same on both sides; it follows the density.'],
  ['B', 'Border of the cap, drawn inside the cap.'],
  ['C', 'Gap between two caps; on other platforms the + sits in it.'],
  [
    'D',
    'Height of a cap: the text line plus its two borders. A cap is at least as wide as it is tall, so a single character makes a square cap.'
  ]
]) {
  const r = stack('Legend item', 'HORIZONTAL', 10);
  r.counterAxisAlignItems = 'MIN';
  callout(ch, r);
  r.appendChild(text(s, 'body/sm', 'color/content/secondary', 316));
  spCard.appendChild(r);
}
spCard.appendChild(
  text(
    'The lighter box inside each cap is the text line. Zoomed in eight times.',
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
sd.layoutSizingVertical = 'FILL';
const real = stack('Real parts', 'HORIZONTAL', 32, 28);
fill(real, 'wireframe/panel');
stroke(real, 'wireframe/card-border-accent', 1);
real.cornerRadius = 12;
real.counterAxisAlignItems = 'MAX';
real.appendChild(caption(sc('Mod+Shift+P'), 'plain, Mac'));
real.appendChild(caption(sc('Mod+Shift+P', { p: 'Other' }), 'plain, other platforms'));
real.appendChild(caption(sc('Mod+Shift+P', { a: 'Keycap' }), 'keycap, Mac'));
real.appendChild(caption(sc('Mod+Shift+P', { a: 'Keycap', p: 'Other' }), 'keycap, other platforms'));
real.appendChild(caption(sc('Enter', { a: 'Keycap' }), 'one key'));
an.appendChild(real);
real.layoutSizingHorizontal = 'FILL';
an.appendChild(
  text(
    'In Figma, Appearance, Size and Platform are variants. Type each key in the nested parts Key 1, Key 2 and Key 3 (their “Key” text); the switches “Show key 2” and “Show key 3” set how many keys are shown. On other platforms the + separators follow the keys by themselves. The code resolves the platform and the glyphs from the neutral notation; in Figma, type the glyph or the short name as the tables below show.',
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

// ---- Body ----
const body = stack('Body', 'VERTICAL', 64, [64, 72, 96, 72]);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const section = (ttl, intr) => {
  const s = stack(ttl, 'VERTICAL', 32);
  const t = stack('Title', 'VERTICAL', 20);
  const hd = stack('Heading', 'HORIZONTAL', 12);
  hd.counterAxisAlignItems = 'CENTER';
  const dot = figma.createFrame();
  dot.name = 'Bullet';
  dot.resize(8, 8);
  dot.cornerRadius = 4;
  fill(dot, 'wireframe/ink');
  hd.appendChild(dot);
  hd.appendChild(text(ttl, 'heading/lg'));
  t.appendChild(hd);
  if (intr) t.appendChild(text(intr, 'body/md', 'color/content/secondary', 1000));
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
  'Appearance says how the keys are drawn: plain, text in the color of the surrounding content, attenuated so that it is not read as part of the label; keycap, one cap per key, for help pages and documentation on a neutral surface. Platform says which conventions are used: Mac shows the Apple glyphs and juxtaposes the keys; Other shows short names joined by +. The code picks the platform of the user; in Figma, choose the one of the mockup. Size follows the text the shortcut sits next to. The brand, the light or dark appearance and the density come from the modes of the frame, not from the component.'
);
const vrow = stack('Variants row', 'HORIZONTAL', 24);
vrow.counterAxisAlignItems = 'MIN';
va.appendChild(vrow);
vrow.layoutSizingHorizontal = 'FILL';
const grid = card('Appearance × platform', 'VERTICAL', 12);
const head = stack('Header', 'HORIZONTAL', 16);
head.appendChild(label('', 80));
for (const p of ['Mac', 'Other platforms']) head.appendChild(label(p, 150, 'color/content/tertiary'));
grid.appendChild(head);
for (const a of ['Plain', 'Keycap']) {
  const r = stack(a, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(label(a.toLowerCase(), 80));
  for (const p of ['Mac', 'Other']) {
    const cell = stack(p, 'HORIZONTAL', 0);
    cell.resize(150, 32);
    cell.primaryAxisSizingMode = 'FIXED';
    cell.counterAxisAlignItems = 'CENTER';
    cell.appendChild(sc('Mod+Shift+P', { a, p }));
    r.appendChild(cell);
  }
  grid.appendChild(r);
}
grid.appendChild(text('Written Mod+Shift+P in both cases.', 'caption/md', 'color/content/tertiary'));
vrow.appendChild(grid);
grid.layoutSizingHorizontal = 'FILL';
const sizes = card('Sizes', 'HORIZONTAL', 24);
sizes.counterAxisAlignItems = 'MIN';
for (const [s, px] of [
  ['sm', '11 px'],
  ['md', '12 px'],
  ['lg', '14 px']
]) {
  const r = stack(s, 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(sc('Mod+K', { s }));
  r.appendChild(sc('Mod+K', { s, a: 'Keycap', p: 'Other' }));
  sizes.appendChild(caption(r, `size ${s} · ${px}`));
}
vrow.appendChild(sizes);
sizes.layoutSizingHorizontal = 'FILL';
sizes.layoutSizingVertical = 'FILL';
const keysCard = card('Keys', 'VERTICAL', 8);
keysCard.appendChild(text('What you write, what is shown, what is heard', 'heading/sm'));
const krow = (cells, headerRow) => {
  const r = stack('Row', 'HORIZONTAL', 16);
  r.counterAxisAlignItems = 'CENTER';
  const W = [250, 110, 130, 320];
  cells.forEach((c, i) => {
    if (typeof c === 'string') {
      const t = label(
        c,
        W[i],
        headerRow ? 'color/content/tertiary' : i === 0 ? 'color/content/primary' : 'color/content/secondary'
      );
      if (i === 3) {
        t.textStyleId = S('body/sm').id;
        fill(t, headerRow ? 'color/content/tertiary' : 'color/content/secondary');
        t.textAutoResize = 'NONE';
        t.resize(W[i], t.height);
      }
      r.appendChild(t);
    } else {
      const cell = stack('Cell', 'HORIZONTAL', 0);
      cell.resize(W[i], 24);
      cell.primaryAxisSizingMode = 'FIXED';
      cell.counterAxisAlignItems = 'CENTER';
      cell.appendChild(c);
      r.appendChild(cell);
    }
  });
  keysCard.appendChild(r);
  return r;
};
krow(['You write', 'Mac shows', 'Others show', 'Screen readers say'], true);
const kdiv = figma.createFrame();
kdiv.name = 'Divider';
kdiv.resize(100, 1);
fill(kdiv, 'wireframe/divider');
keysCard.appendChild(kdiv);
kdiv.layoutSizingHorizontal = 'FILL';
const ROWS = [
  ['Mod', 'Command on Mac, Control elsewhere'],
  ['Ctrl (or Control)', 'Control'],
  ['Alt (or Option)', 'Option on Mac, Alt elsewhere'],
  ['Shift', 'Shift'],
  ['Meta (or Cmd, Command, Super, Win)', 'Command on Mac, Windows elsewhere'],
  ['Enter (or Return)', 'Enter'],
  ['Escape (or Esc)', 'Escape'],
  ['Tab', 'Tab'],
  ['Space', 'Space'],
  ['Backspace', 'Backspace'],
  ['Delete (or Del)', 'Delete'],
  ['ArrowUp (or Up)', 'Up arrow'],
  ['ArrowDown (or Down)', 'Down arrow'],
  ['ArrowLeft (or Left)', 'Left arrow'],
  ['ArrowRight (or Right)', 'Right arrow'],
  ['Home', 'Home'],
  ['End', 'End'],
  ['PageUp (or PgUp)', 'Page up'],
  ['PageDown (or PgDn)', 'Page down'],
  ['F1 to F12', 'The name of the key'],
  ['Plus', 'plus'],
  ['Any other key, e.g. k', 'As written; a single letter is shown in uppercase']
];
for (const [w, spoken] of ROWS) {
  const id = w.split(' ')[0] === 'F1' ? 'F5' : w.startsWith('Any') ? 'k' : w.split(' ')[0];
  krow([w, sc(id, { a: 'Keycap' }), sc(id, { a: 'Keycap', p: 'Other' }), spoken]);
}
keysCard.appendChild(
  text(
    'Names are matched ignoring case. Keys pressed together are joined by + (Mod+Shift+P). Whatever the order you write, modifiers come first in the usual order of the platform, then the other keys as written: on Mac Control, Option, Shift, Command (⌃ ⌥ ⇧ ⌘); elsewhere Windows, Control, Alt, Shift.',
    'body/sm',
    'color/content/secondary',
    900
  )
);
const orow = stack('Order examples', 'HORIZONTAL', 32);
orow.counterAxisAlignItems = 'MIN';
for (const k of ['Shift+Mod+K', 'Alt+Mod+Enter']) {
  const r = stack(k, 'HORIZONTAL', 24);
  r.counterAxisAlignItems = 'CENTER';
  r.appendChild(sc(k, { a: 'Keycap' }));
  r.appendChild(sc(k, { a: 'Keycap', p: 'Other' }));
  orow.appendChild(caption(r, `written ${k}`));
}
keysCard.appendChild(orow);
va.appendChild(keysCard);
keysCard.layoutSizingHorizontal = 'FILL';
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
  f.appendChild(item('Search', 'Mod+K'));
  f.appendChild(sc('Mod+Shift+P', { a: 'Keycap' }));
  f.appendChild(sc('Mod+Shift+P', { a: 'Keycap', p: 'Other' }));
  ctx.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}

const st = section(
  'States',
  'A shortcut has no states of its own: it cannot be clicked and does not react to the pointer. Its color follows the content around it, so in the code it dims with a disabled parent and changes with a hovered button. A plain shortcut is attenuated to 70 % so that a hint beside a label reads lighter than the label; a keycap is drawn at full opacity. In Figma the text color is the primary content color; a host component (the Button) binds it to its own content color.'
);
const srow = stack('States row', 'HORIZONTAL', 24);
srow.counterAxisAlignItems = 'MIN';
st.appendChild(srow);
srow.layoutSizingHorizontal = 'FILL';
for (const ap of ['light', 'dark']) {
  const block =
    ap === 'light' ? card(`Attenuation ${ap}`, 'VERTICAL', 20, 32) : stack(`Attenuation ${ap}`, 'VERTICAL', 20, 32);
  if (ap === 'dark') {
    fill(block, 'color/surface/canvas');
    block.cornerRadius = 12;
    block.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
  }
  block.appendChild(text(`base brand, ${ap} appearance`, 'label/sm', 'color/content/secondary'));
  block.appendChild(caption(item('Rename file', 'F2', {}, 260), 'plain: attenuated beside its label', ap === 'light'));
  block.appendChild(caption(item('Rename file', 'F2', { a: 'Keycap' }, 260), 'keycap: full opacity', ap === 'light'));
  block.appendChild(caption(item('Rename file', 'F2', { p: 'Other' }, 260), 'plain, other platforms', ap === 'light'));
  srow.appendChild(block);
  block.layoutSizingHorizontal = 'FILL';
}

const bs = section(
  'Behavior & sizing',
  'A shortcut is inline content: it sits in the flow of the text it belongs to, on one line, and is never wrapped or shortened. It is as wide as its keys and as tall as its text line (a keycap adds its two borders). Size follows the text next to it: a shortcut inside a control takes the size of the control. Density changes the padding of the caps and the gap between them; the brand changes the corners of the caps.'
);
const dens = card('Density × size', 'HORIZONTAL', 12);
bs.appendChild(dens);
dens.layoutSizingHorizontal = 'FILL';
for (const d of ['compact', 'standard', 'comfortable']) {
  const f = panel(d, 'VERTICAL', 12, 24);
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
  for (const s of ['sm', 'md', 'lg']) {
    const r = stack(s, 'HORIZONTAL', 16);
    r.counterAxisAlignItems = 'CENTER';
    r.appendChild(label(s, 24));
    r.appendChild(sc('Mod+K', { s }));
    r.appendChild(sc('Mod+Shift+K', { s, a: 'Keycap', p: 'Other' }));
    r.appendChild(sc('K', { s, a: 'Keycap' }));
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
for (const b of ['base', 'brick', 'orchid']) {
  const f = panel(b, 'VERTICAL', 12, 20);
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.appendChild(text(b, 'label/sm', 'color/content/secondary'));
  f.appendChild(sc('Mod+Shift+K', { a: 'Keycap', p: 'Other' }));
  f.appendChild(sc('Mod+K', { a: 'Keycap' }));
  brands.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
}
brow.appendChild(brands);
brands.layoutSizingHorizontal = 'FILL';
const one = card('One line', 'HORIZONTAL', 24);
one.counterAxisAlignItems = 'CENTER';
const narrow = stack('Narrow box', 'HORIZONTAL', 0);
narrow.resize(72, 32);
narrow.primaryAxisSizingMode = 'FIXED';
narrow.counterAxisSizingMode = 'FIXED';
narrow.counterAxisAlignItems = 'CENTER';
stroke(narrow, 'wireframe/ink', 1, [4, 4], 'INSIDE');
narrow.cornerRadius = 4;
narrow.appendChild(sc('Mod+Shift+K', { a: 'Keycap', p: 'Other' }));
one.appendChild(caption(narrow, 'in a box too narrow (dashed), the keys overflow rather than wrap or shrink'));
brow.appendChild(one);
one.layoutSizingHorizontal = 'FILL';
one.layoutSizingVertical = 'FILL';

const ue = section(
  'Usage examples',
  'Put a shortcut after the label of a menu item or a list action, in a tooltip, or after a button label, always plain and in the size of that text. Use keycaps only in help pages and documentation, on a neutral surface. Write the keys once in the neutral notation; the platform is resolved for the user. The full guidance will be in the documentation page of the component.'
);
const ex = card('Examples', 'HORIZONTAL', 32);
ex.counterAxisAlignItems = 'MIN';
const menu = stack('Menu', 'VERTICAL', 4, 8);
fill(menu, 'color/surface/raised');
stroke(menu, 'color/border/subtle');
menu.cornerRadius = 12;
shadow(menu);
for (const [lbl, k] of [
  ['New file', 'Mod+N'],
  ['Open…', 'Mod+O'],
  ['Save', 'Mod+S'],
  ['Find and replace', 'Alt+Mod+F']
]) {
  const r = item(lbl, k, {}, 232);
  r.paddingLeft = r.paddingRight = 12;
  r.paddingTop = r.paddingBottom = 6;
  r.cornerRadius = 6;
  r.resize(256, r.height);
  menu.appendChild(r);
}
ex.appendChild(caption(menu, 'a menu: each item ends with its shortcut, plain, in the size of the item'));
const right = stack('Right column', 'VERTICAL', 24);
const tip = stack('Tooltip', 'HORIZONTAL', 12, [6, 10, 6, 10]);
tip.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
fill(tip, 'color/surface/raised');
tip.cornerRadius = 6;
tip.counterAxisAlignItems = 'CENTER';
tip.appendChild(text('Save changes', 'body/sm'));
tip.appendChild(sc('Mod+S', { p: 'Other', s: 'md' }));
right.appendChild(caption(tip, 'a tooltip: the shortcut after the description, in the tooltip’s colors'));
const help = stack('Help line', 'HORIZONTAL', 6, 16);
fill(help, 'color/surface/subtle');
help.cornerRadius = 8;
help.counterAxisAlignItems = 'CENTER';
help.appendChild(text('Press', 'body/sm'));
help.appendChild(sc('Mod+K', { a: 'Keycap', p: 'Other', s: 'lg' }));
help.appendChild(text('to open the command palette, then', 'body/sm'));
help.appendChild(sc('ArrowDown', { a: 'Keycap', p: 'Other', s: 'lg' }));
help.appendChild(text('and', 'body/sm'));
help.appendChild(sc('Enter', { a: 'Keycap', p: 'Other', s: 'lg' }));
help.appendChild(text('to run a command.', 'body/sm'));
right.appendChild(caption(help, 'a help page: keycaps in the running text, on a neutral surface'));
right.appendChild(
  text(
    'Inside a button, the shortcut is the trailing item: plain, in the size and the content color of the button (Button md with Shortcut md). The Button component set will take this master as its Shortcut trailing type once it is integrated; until then its trailing shortcut is a fixture.',
    'body/sm',
    'color/content/secondary',
    520
  )
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
  h: Math.round(root.height),
  sections: Object.fromEntries([header, an, body, ...body.children].map((n) => [n.name, n.id]))
};
