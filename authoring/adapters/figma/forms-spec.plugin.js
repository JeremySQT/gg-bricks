// Wave 2 specification page builder (use_figma body), 2026-10-27.
// One body for the seven form pages: list in IDS the pages to build (checkbox, radio,
// radio-group, switch, input-text, textarea, field) and keep their blocks between the spec markers when running (the
// shared part stays; a call holds about three). Builds the frame
// “<Set> — Specification” on the component's page in the layout of the wave 1 pages (white header on a gray page,
// hero card, blueprint anatomy board, white cards in the body) and places the component set to its right. The
// anatomy board shows a real instance enlarged with rescale (a drawing, not a master), numbered parts and lettered
// dimensions. Explanatory instances come from the wave 2 sets, found by name on their pages; the callout and marker
// components (115:6, 115:8) and the grid image are the wave 1 utilities. Rerunning replaces the frame.
const IDS = ['checkbox'];
const ANATOMY_ONLY = false;
figma.skipInvisibleInstanceChildren = false;
// Component page (the specification and its instances), name, and component set (on the Forms library page,
// in the section of the component, since 2026-10-29).
const PAGES = {
  checkbox: ['288:3', 'Checkbox', '289:428'],
  field: ['288:4', 'Field', '295:77'],
  'input-text': ['288:5', 'InputText', '293:1046'],
  radio: ['288:6', 'Radio', '290:257'],
  'radio-group': ['288:7', 'RadioGroup', '292:327'],
  'checkbox-group': ['347:243', 'CheckboxGroup', '347:303'],
  switch: ['288:8', 'Switch', '291:434'],
  textarea: ['288:9', 'Textarea', '294:291']
};
const SETS = {};
for (const [id, [, , setId]] of Object.entries(PAGES)) SETS[id] = await figma.getNodeByIdAsync(setId);
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
  if (Array.isArray(pad)) [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = pad;
  else if (pad) f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
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
const chip = (chars, bordered = true) => {
  const c = stack('Caption', 'HORIZONTAL', 0, [3, 8, 3, 8]);
  c.cornerRadius = 6;
  fill(c, bordered ? 'wireframe/canvas' : 'wireframe/panel');
  if (bordered) stroke(c, 'wireframe/divider', 1);
  c.appendChild(text(chars, 'caption/md', 'color/content/secondary'));
  return c;
};
const caption = (node, cap, bordered) => {
  const f = stack('Example', 'VERTICAL', 10);
  f.counterAxisAlignItems = 'MIN';
  f.appendChild(node);
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
};
const line = (parent, x1, y1, x2, y2, dash, w = 1, opacity = 1) => {
  const l = figma.createLine();
  l.resize(Math.max(Math.hypot(x2 - x1, y2 - y1), 0.01), 0);
  l.rotation = (-Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  l.x = x1;
  l.y = y1;
  stroke(l, 'wireframe/ink', w, dash, 'CENTER');
  l.opacity = opacity;
  parent.appendChild(l);
  return l;
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
const row = (name, gap = 8, items = [], align = 'CENTER') => {
  const r = stack(name, 'HORIZONTAL', gap);
  r.counterAxisAlignItems = align;
  for (const it of items) r.appendChild(it);
  return r;
};
const col_ = (name, gap = 8, items = []) => {
  const c = stack(name, 'VERTICAL', gap);
  for (const it of items) c.appendChild(it);
  return c;
};
const parse = (name) => Object.fromEntries(name.split(', ').map((p) => p.split('=')));
// Instance of a wave 2 set: variant properties (others from the default variant) and component properties by name.
const mk = (id, v = {}, p = {}) => {
  const set = SETS[id];
  const want = { ...parse(set.defaultVariant.name), ...v };
  const c = set.children.find((ch) => {
    const q = parse(ch.name);
    return Object.keys(want).every((k) => q[k] === want[k]);
  });
  if (!c) throw new Error(`no variant ${id} ${JSON.stringify(want)}`);
  const inst = c.createInstance();
  setProps(inst, p);
  return inst;
};
const setProps = (inst, p) => {
  const keys = Object.keys(inst.componentProperties);
  const props = {};
  for (const [k, x] of Object.entries(p)) {
    const key = keys.find((q) => q.split('#')[0] === k);
    if (!key) throw new Error('no property ' + k);
    props[key] = x;
  }
  if (Object.keys(props).length) inst.setProperties(props);
  return inst;
};
// Give a choice control a fixed width: its text wraps.
const wrap = (inst, w) => {
  inst.resize(w, inst.height);
  const t = inst.findOne((n) => n.name === 'Text');
  if (t) t.layoutSizingHorizontal = 'FILL';
  for (const n of inst.findAll((n) => n.type === 'TEXT' && (n.name === 'Label' || n.name === 'Description'))) {
    n.layoutSizingHorizontal = 'FILL';
    n.textAutoResize = 'HEIGHT';
  }
  return inst;
};
const contexts = (parent, build) => {
  const ctx = stack('Contexts', 'HORIZONTAL', 24);
  parent.appendChild(ctx);
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
    for (const n of build(b, a)) f.appendChild(n);
    ctx.appendChild(f);
    f.layoutSizingHorizontal = 'FILL';
  }
  return ctx;
};
const densities = (parent, build, notes) => {
  const dens = card('Density', 'HORIZONTAL', 12);
  parent.appendChild(dens);
  dens.layoutSizingHorizontal = 'FILL';
  for (const d of ['compact', 'standard', 'comfortable']) {
    const f = panel(d, 'VERTICAL', 12, 24);
    f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
    f.appendChild(text(d + ' density', 'label/sm', 'color/content/secondary'));
    for (const n of build(d)) f.appendChild(n);
    f.appendChild(text(notes[d], 'caption/md', 'color/content/tertiary', 300));
    dens.appendChild(f);
    f.layoutSizingHorizontal = 'FILL';
    f.layoutSizingVertical = 'FILL';
  }
  return dens;
};
// Grid card: a header row of column names, then one row per entry with a cell per column.
const matrix = (name, rows, columns, cell, w = 150, lw = 110) => {
  const m = card(name, 'VERTICAL', 14);
  const mh = stack('Header', 'HORIZONTAL', 16);
  mh.appendChild(label('', lw));
  for (const c of columns) mh.appendChild(label(c, w, 'color/content/tertiary'));
  m.appendChild(mh);
  for (const r of rows) {
    const rr = stack(r, 'HORIZONTAL', 16);
    rr.counterAxisAlignItems = 'CENTER';
    rr.appendChild(label(r, lw));
    for (const c of columns) {
      const box = stack(c, 'HORIZONTAL', 0);
      box.resize(w, 24);
      box.primaryAxisSizingMode = 'FIXED';
      box.counterAxisSizingMode = 'AUTO';
      box.counterAxisAlignItems = 'CENTER';
      box.appendChild(cell(r, c));
      rr.appendChild(box);
    }
    m.appendChild(rr);
  }
  return m;
};
// Swap the Control of a Field instance for another wave 2 component.
const swapControl = (field, id, v = {}, p = {}) => {
  const ctl = field.findOne((n) => n.name === 'Control');
  const set = SETS[id];
  const want = { ...parse(set.defaultVariant.name), ...v };
  ctl.swapComponent(
    set.children.find((ch) => {
      const q = parse(ch.name);
      return Object.keys(want).every((k) => q[k] === want[k]);
    })
  );
  return setProps(ctl, p);
};
// Set properties on every option of a RadioGroup or CheckboxGroup instance (the instances in its Options slot).
const options = (group, p) => {
  for (const r of group.findAllWithCriteria({ types: ['SLOT'] })[0].children) setProps(r, p);
  return group;
};
const surface = (name, dir = 'VERTICAL', gap = 12, pad = 20) => {
  const f = stack(name, dir, gap, pad);
  fill(f, 'color/surface/raised');
  stroke(f, 'color/border/subtle');
  f.cornerRadius = 12;
  return f;
};

// ---- Anatomy board: the real instance enlarged, redrawn in the blueprint ink ----
// The drawing keeps the geometry of the instance and replaces its colors: surfaces in a light tint with a tint
// border, text, glyphs, thumbs and dots in ink (secondary texts at 60 %), the layers listed in `dashed` outlined
// with a dashed tint (layout boxes). Hidden layers, the focus ring and the target stay hidden.
const resolveAlpha = async (node, p) => {
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  if (!id) return (p.opacity ?? 1) * (p.color && p.color.a !== undefined ? p.color.a : 1);
  const v = (await figma.variables.getVariableByIdAsync(id)).resolveForConsumer(node).value;
  return (p.opacity ?? 1) * (v.a ?? 1);
};
const weight = (n, w) => {
  for (const f of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'])
    if (n.boundVariables && n.boundVariables[f]) n.setBoundVariable(f, null);
  n.strokeWeight = w;
};
const SHAPES = ['VECTOR', 'ELLIPSE', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'RECTANGLE', 'LINE'];
const inkDrawing = async (root, dashed = [], muted = ['Description', 'Placeholder']) => {
  const walk = async (n) => {
    if (n.visible === false || n.name === 'Focus ring' || n.name === 'Target') return;
    if (n.type === 'TEXT') {
      n.fills = [paint('wireframe/ink')];
      n.opacity = muted.includes(n.name) ? 0.6 : 1;
      return;
    }
    if (SHAPES.includes(n.type)) {
      if (n.fills.length) n.fills = [paint('wireframe/ink')];
      if (n.strokes.length) n.strokes = [paint('wireframe/ink')];
      return;
    }
    const visibleFill = [];
    for (const f of n.fills || []) if (f.visible !== false && (await resolveAlpha(n, f)) > 0) visibleFill.push(f);
    const visibleStroke = [];
    for (const f of n.strokes || []) if (f.visible !== false && (await resolveAlpha(n, f)) > 0) visibleStroke.push(f);
    n.fills = visibleFill.length ? [paint('wireframe/tint/16')] : [];
    if (visibleStroke.length) {
      n.strokes = [paint('wireframe/tint/48')];
      weight(n, 1.5);
    } else if (n.strokes && n.strokes.length) n.strokes = [];
    if (dashed.includes(n.name)) {
      n.strokes = [paint('wireframe/tint/48')];
      weight(n, 1);
      n.dashPattern = [4, 3];
      n.strokeAlign = 'INSIDE';
      if (n.layoutMode && n.layoutMode !== 'NONE') n.strokesIncludedInLayout = false;
    }
    if ('children' in n) for (const c of n.children) await walk(c);
  };
  await walk(root);
};
const drawBoard = async (A) => {
  const inst = A.instance();
  // The board never grows past the 1088 px column.
  inst.rescale(Math.min(A.zoom, (1088 - 240) / inst.width));
  inst.name = 'Drawing (enlarged instance)';
  await inkDrawing(inst, A.dashed, A.muted);
  // Text layers listed in `hug` shrink to their words, so that a side pin lands at the end of the text.
  for (const n of inst.findAll((n) => n.type === 'TEXT' && (A.hug || []).includes(n.name)))
    n.layoutSizingHorizontal = 'HUG';
  const W = Math.max(640, inst.width + 240),
    H = inst.height + 200 + 28 * (A.dims || []).filter((d) => d.k === 'x').length;
  const dg = board('Anatomy diagram', W, H);
  dg.appendChild(inst);
  inst.x = Math.round((W - inst.width) / 2 - (A.shift || 0));
  inst.y = 96;
  // A layer by name, or a path “Radio 2/Control”; '' is the instance.
  const node = (name) =>
    name
      .split('/')
      .filter(Boolean)
      .reduce((p, part) => p && p.findOne((n) => n.name === part && n.visible !== false), inst);
  const box = (name) => {
    const n = node(name);
    if (!n) throw new Error('anatomy layer ' + name);
    const x = n.absoluteTransform[0][2] - dg.absoluteTransform[0][2];
    const y = n.absoluteTransform[1][2] - dg.absoluteTransform[1][2];
    return { l: x, t: y, r: x + n.width, b: y + n.height, cx: x + n.width / 2, cy: y + n.height / 2 };
  };
  const ib = box('');
  // Pins: a numbered callout straight above, below or beside its target, a straight dashed leader and a marker
  // on the layer edge. The fourth value moves the target along that edge (from its center).
  for (const [n, layer, side, d = 0] of A.pins) {
    const b = box(layer);
    if (side === 'top' || side === 'bottom') {
      const tx = b.cx + d;
      const top = side === 'top';
      const cy = top ? 44 : H - 44;
      const ty = top ? b.t : b.b;
      line(dg, tx, cy + (top ? 11 : -11), tx, ty, [3, 3], 1, 0.7);
      marker(dg, tx, ty);
      callout(n, dg, tx, cy);
    } else {
      const right = side === 'right';
      const tx = right ? b.r : b.l;
      const ty = b.cy + d;
      const cx = right ? ib.r + 64 : ib.l - 64;
      line(dg, cx + (right ? -11 : 11), ty, tx, ty, [3, 3], 1, 0.7);
      marker(dg, tx, ty);
      callout(n, dg, cx, ty);
    }
  }
  let xi = 0,
    yi = 0;
  for (const d of A.dims || []) {
    const a = box(d.a[0]),
      b = box(d.b[0]);
    if (d.k === 'x') {
      const x1 = a[d.a[1]],
        x2 = b[d.b[1]];
      const y = ib.b + 30 + 28 * xi++;
      // Extension lines from the measured edges down to the dimension line.
      line(dg, x1, a.b, x1, y, [2, 2], 1, 0.5);
      line(dg, x2, b.b, x2, y, [2, 2], 1, 0.5);
      line(dg, x1, y, x2, y, null, 1.5);
      for (const xx of [x1, x2]) line(dg, xx, y - 4, xx, y + 4, null, 1.5);
      callout(d.c, dg, Math.max(x1, x2) + 18, y);
    } else {
      const y1 = a[d.a[1]],
        y2 = b[d.b[1]];
      const left = d.side === 'left';
      const x = left ? ib.l - 30 - 28 * yi++ : ib.r + 30 + 28 * yi++;
      line(dg, left ? a.l : a.r, y1, x, y1, [2, 2], 1, 0.5);
      line(dg, left ? b.l : b.r, y2, x, y2, [2, 2], 1, 0.5);
      line(dg, x, y1, x, y2, null, 1.5);
      for (const yy of [y1, y2]) line(dg, x - 4, yy, x + 4, yy, null, 1.5);
      callout(d.c, dg, x + (left ? -18 : 18), (y1 + y2) / 2);
    }
  }
  return dg;
};
// Redraw only the board of an existing specification frame (ANATOMY_ONLY), keeping the frame and its other nodes.
const redrawBoard = async (ID) => {
  const page = await figma.getNodeByIdAsync(PAGES[ID][0]);
  await figma.setCurrentPageAsync(page);
  // Leftovers of an interrupted run sit at the top of the page.
  for (const n of page.children.filter((n) => ['Drawing (enlarged instance)', 'Anatomy diagram'].includes(n.name)))
    n.remove();
  const root = page.children.find((n) => n.name === `${PAGES[ID][1]} — Specification`);
  const old = root.findOne((n) => n.name === 'Anatomy diagram');
  const row = old.parent;
  const dg = await drawBoard(ANATOMY[ID]());
  row.insertChild(row.children.indexOf(old), dg);
  old.remove();
  return { root: root.id, board: dg.id };
};

// ---- Page skeleton ----
const build = async (ID, spec) => {
  const page = await figma.getNodeByIdAsync(PAGES[ID][0]);
  await figma.setCurrentPageAsync(page);
  const NAME = `${PAGES[ID][1]} — Specification`;
  for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
  const root = stack(NAME, 'VERTICAL', 0, 0);
  page.appendChild(root);
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
  title.appendChild(text(spec.path, 'label/sm', 'color/content/tertiary'));
  title.appendChild(text(PAGES[ID][1], 'display/md'));
  header.appendChild(title);
  const intro = stack('Intro', 'VERTICAL', 28);
  header.appendChild(intro);
  intro.layoutSizingHorizontal = 'FILL';
  intro.appendChild(text(spec.intro, 'body/lg', 'color/content/secondary', 900));
  const hero = stack('Hero', 'HORIZONTAL', 32, [40, 32, 40, 32]);
  fill(hero, 'wireframe/hero');
  stroke(hero, 'wireframe/card', 8);
  hero.cornerRadius = 16;
  shadow(hero);
  hero.primaryAxisAlignItems = 'CENTER';
  hero.counterAxisAlignItems = 'CENTER';
  for (const n of spec.hero()) hero.appendChild(n);
  intro.appendChild(hero);
  hero.layoutSizingHorizontal = 'FILL';
  intro.appendChild(
    text(
      `The contract and the code in the ggbrick repository (foundations/components/forms/${ID}) are the reference. This page documents the Figma component set “${PAGES[ID][1]}”; every component shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.`,
      'body/sm',
      'color/content/tertiary',
      900
    )
  );
  divider(header);

  // ---- Anatomy: the real instance enlarged on a blueprint board ----
  const A = spec.anatomy;
  const an = stack('Anatomy', 'VERTICAL', 32);
  header.appendChild(an);
  an.layoutSizingHorizontal = 'FILL';
  heading(an, 'Anatomy', A.intro);
  const anRow = stack('Anatomy row', 'HORIZONTAL', 44);
  anRow.counterAxisAlignItems = 'MIN';
  const dg = await drawBoard(A);
  const W = dg.width;
  // A wide drawing puts the legend under the board.
  if (W > 760) anRow.layoutMode = 'VERTICAL';
  anRow.appendChild(dg);
  const legend = stack('Legend', 'VERTICAL', 12);
  fill(legend, 'wireframe/canvas');
  legend.cornerRadius = 12;
  for (const [n, s] of A.legend) {
    const r = stack('Legend item', 'HORIZONTAL', 10);
    r.counterAxisAlignItems = 'MIN';
    callout(n, r);
    r.appendChild(text(s, 'body/sm', 'color/content/secondary', W > 760 ? 1000 : Math.max(280, 1088 - W - 76)));
    legend.appendChild(r);
  }
  anRow.appendChild(legend);
  legend.layoutSizingHorizontal = 'FILL';
  an.appendChild(anRow);
  anRow.layoutSizingHorizontal = 'FILL';
  const real = stack('Real parts', 'HORIZONTAL', 32, 28);
  fill(real, 'wireframe/panel');
  stroke(real, 'wireframe/card-border-accent', 1);
  real.cornerRadius = 12;
  real.counterAxisAlignItems = 'MAX';
  for (const [n, cap] of A.real()) real.appendChild(caption(n, cap));
  an.appendChild(real);
  real.layoutSizingHorizontal = 'FILL';
  an.appendChild(text(A.figma, 'body/md', 'color/content/secondary', 1000));
  divider(root);

  // ---- Body ----
  const body = stack('Body', 'VERTICAL', 64, [64, 72, 96, 72]);
  root.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';
  for (const [t, introText, fn] of spec.sections) {
    const s = stack(t, 'VERTICAL', 32);
    heading(s, t, introText, 20);
    const c = stack('Content', 'VERTICAL', 20);
    s.appendChild(c);
    body.appendChild(s);
    s.layoutSizingHorizontal = 'FILL';
    c.layoutSizingHorizontal = 'FILL';
    fn(c);
  }
  // The master stays in its section of the Forms library page; spec-header-links.plugin.js adds the link to it in the title row.
  return { root: root.id, h: Math.round(root.height), board: dg.id, set: SETS[ID].id };
};
// Anatomy boards: one block per component (also run alone with ANATOMY_ONLY to redraw the boards in place).
const ANATOMY = {};
// <anatomy:checkbox>
ANATOMY['checkbox'] = () => {
  const cb = (v, p = {}) => mk('checkbox', v, p);
  const SEL = ['off', 'on', 'indeterminate'];
  return {
    intro: 'How a checkbox is built. The instance is enlarged four times; the real checkboxes are shown underneath.',
    dashed: ['First line'],
    zoom: 4,
    instance: () =>
      cb(
        { Selection: 'on' },
        { Label: 'Email me a receipt', 'Show description': true, Description: 'Sent to the billing address.' }
      ),
    pins: [
      [1, 'Control', 'top', 0],
      [2, 'Mark', 'bottom', 0],
      [3, 'Label', 'top', 0],
      [4, 'Description', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['Control', 't'], b: ['Control', 'b'], c: 'A', side: 'left' },
      { k: 'x', a: ['First line', 'r'], b: ['Text', 'l'], c: 'B' },
      { k: 'y', a: ['First line', 't'], b: ['First line', 'b'], c: 'C', side: 'left' }
    ],
    legend: [
      [
        '1',
        'Control: a square box with a small radius (radius/indicator) and a thin border inside its edge. Off, it is light with a border; on or indeterminate, it is filled in the accent color.'
      ],
      [
        '2',
        'Mark: the check (on) or the bar (indeterminate), Phosphor bold, drawn at the size of the box in the content color of the state. Off has no mark.'
      ],
      ['3', 'Label: the body text of the size. It wraps and is the accessible name; pressing it toggles the box.'],
      ['4', 'Description (optional): body/sm in the secondary color, under the label.'],
      ['A', 'Box size: size/choice/{size}, 14, 16 or 20 px. It does not change with the density.'],
      ['B', 'Gap: space/control/gap/{size}; at md 6, 8 or 10 px in compact, standard and comfortable density.'],
      [
        'C',
        'First line: the box is centered on the first line of the label (the line height of typography/body/{size}), not on the whole text.'
      ]
    ],
    real: () => [
      [cb({}), 'off'],
      [cb({ Selection: 'on' }), 'on'],
      [cb({ Selection: 'indeterminate' }), 'indeterminate'],
      [cb({ Selection: 'on' }, { 'Show description': true }), 'with a description'],
      [cb({ Selection: 'on' }, { 'Show label': false }), 'Show label off: a row selector']
    ],
    figma:
      'In Figma, Size, Selection and State are variants. Label and Description are text properties; Show description adds the help text and Show label off keeps the box alone (the label stays the accessible name in code). Focus shows the keyboard focus ring on any state. The 44 px interaction target is the empty Target layer around the row.'
  };
};
// </anatomy:checkbox>

// <anatomy:radio>
ANATOMY['radio'] = () => {
  const rd = (v, p = {}) => mk('radio', v, p);
  return {
    intro:
      'How a radio is built. The instance is enlarged three and a half times; the real radios are shown underneath.',
    dashed: ['First line'],
    zoom: 3.5,
    instance: () =>
      rd(
        { Selection: 'on' },
        { Label: 'Express', 'Show description': true, Description: 'Delivered tomorrow before noon.' }
      ),
    pins: [
      [1, 'Control', 'top', 0],
      [2, 'Mark', 'bottom', 0],
      [3, 'Label', 'top', 0],
      [4, 'Description', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['Control', 't'], b: ['Control', 'b'], c: 'A', side: 'left' },
      { k: 'x', a: ['First line', 'r'], b: ['Text', 'l'], c: 'B' },
      { k: 'y', a: ['First line', 't'], b: ['First line', 'b'], c: 'C', side: 'left' }
    ],
    legend: [
      [
        '1',
        'Control: a circle with a thin border inside its edge (radius/full). Light when off, filled in the accent color when on.'
      ],
      ['2', 'Mark: a dot of 3/8 of the circle (radio/dot) in the content color of the state. Off has no dot.'],
      ['3', 'Label: the body text of the size. It wraps, is the accessible name, and pressing it selects the radio.'],
      ['4', 'Description (optional): body/sm in the secondary color, under the label.'],
      ['A', 'Circle size: size/choice/{size}, 14, 16 or 20 px, the size of a Checkbox box.'],
      ['B', 'Gap: space/control/gap/{size}; at md 6, 8 or 10 px in compact, standard and comfortable density.'],
      ['C', 'First line: the circle is centered on the first line of the label, not on the whole text.']
    ],
    real: () => [
      [rd({}, { Label: 'Standard' }), 'off'],
      [rd({ Selection: 'on' }, { Label: 'Express' }), 'on'],
      [rd({ Selection: 'on' }, { Label: 'Express', 'Show description': true }), 'with a description'],
      [rd({ Selection: 'on', State: 'disabled' }, { Label: 'Express' }), 'disabled']
    ],
    figma:
      'In Figma, Size, Selection and State are variants. In code the size, readonly and invalid state come from the group: set the same Size and State on every radio of a group, and select one radio only. Label and Description are text properties; Show description adds the help text. Focus shows the keyboard focus ring.'
  };
};
// </anatomy:radio>

// <anatomy:radio-group>
ANATOMY['radio-group'] = () => {
  const rg = (v = {}, p = {}) => mk('radio-group', v, p);
  return {
    intro: 'How a radio group is built. The instance is enlarged three times; the real groups are shown underneath.',
    zoom: 3,
    instance: () => rg(),
    pins: [
      [1, 'Radio 1', 'right', 0],
      [2, 'Radio 2/Control', 'left', 0],
      [3, 'Radio 3', 'right', 0]
    ],
    dims: [{ k: 'y', a: ['Radio 1', 'b'], b: ['Radio 2', 't'], c: 'A', side: 'left' }],
    legend: [
      ['1', 'Radio: one option, a Radio instance in the Options slot. Its parts are on the Radio page.'],
      ['2', 'Selected radio: exactly one radio is on; selecting another turns it off.'],
      [
        '3',
        'Radios follow the order of the source; the keyboard moves through them in that order and wraps at the ends.'
      ],
      [
        'A',
        'Gap: vertical, space/content/sm (4, 8 or 12 px in compact, standard and comfortable density). Horizontal: space/content/lg between radios (12, 16 or 24 px) and space/content/sm between lines.'
      ]
    ],
    real: () => [
      [rg(), 'vertical (default)'],
      [rg({ Orientation: 'horizontal' }), 'horizontal'],
      [options(rg(), { Size: 'sm' }), 'sm']
    ],
    figma:
      'In Figma, Orientation is a variant and Options is a slot: add, remove or reorder Radio instances in it (two at least) and give them all the same Size (the code sets it once on the group). Select one radio (Selection on) and keep the others off; for a readonly, invalid or disabled group, set that State on every radio. Label is the group’s accessible name when it is used without a Field; it is not shown.'
  };
};
// </anatomy:radio-group>

// <anatomy:checkbox-group>
ANATOMY['checkbox-group'] = () => {
  const cg = (v = {}, p = {}) => mk('checkbox-group', v, p);
  return {
    intro: 'How a checkbox group is built. The instance is enlarged three times; the real groups are shown underneath.',
    zoom: 3,
    instance: () => cg(),
    pins: [
      [1, 'Checkbox 1', 'right', 0],
      [2, 'Checkbox 2/Control', 'left', 0],
      [3, 'Checkbox 3', 'right', 0]
    ],
    dims: [{ k: 'y', a: ['Checkbox 1', 'b'], b: ['Checkbox 2', 't'], c: 'A', side: 'left' }],
    legend: [
      ['1', 'Checkbox: one option, a Checkbox instance in the Options slot. Its parts are on the Checkbox page.'],
      [
        '2',
        'Any number of checkboxes can be checked, none included; the value lists the checked ones in the order of the page.'
      ],
      [
        '3',
        'Order: the checkboxes follow the order of the source; each one is a stop for the Tab key, Space toggles it.'
      ],
      [
        'A',
        'Gap: vertical, space/content/sm (4, 8 or 12 px in compact, standard and comfortable density). Horizontal: space/content/lg between checkboxes (12, 16 or 24 px) and space/content/sm between lines.'
      ]
    ],
    real: () => [
      [cg(), 'vertical (default)'],
      [cg({ Orientation: 'horizontal' }), 'horizontal'],
      [options(cg(), { Size: 'sm' }), 'sm']
    ],
    figma:
      'In Figma, Orientation is a variant and Options is a slot: add, remove or reorder Checkbox instances in it (two at least) and give them all the same Size (the code sets it once on the group). Check any number of them; for a readonly, invalid or disabled group, set that State on every checkbox. Checkboxes of a group are never indeterminate: a select-all checkbox stays outside the group. Label is the group’s accessible name when it is used without a Field; it is not shown.'
  };
};
// </anatomy:checkbox-group>

// <anatomy:switch>
ANATOMY['switch'] = () => {
  const sw = (v, p = {}) => mk('switch', v, p);
  const start = (v, p, w = 320) => {
    const i = sw({ 'Label position': 'start', ...v }, p);
    i.resize(w, i.height);
    return i;
  };
  return {
    intro: 'How a switch is built. The instance is enlarged three times; the real switches are shown underneath.',
    dashed: ['First line'],
    zoom: 3,
    instance: () =>
      sw(
        { Selection: 'on' },
        { Label: 'Notifications', 'Show description': true, Description: 'Push notifications on this device.' }
      ),
    pins: [
      [1, 'Track', 'top', 0],
      [2, 'Thumb', 'bottom', 0],
      [3, 'Label', 'top', 0],
      [4, 'Description', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['Track', 't'], b: ['Track', 'b'], c: 'A', side: 'left' },
      { k: 'x', a: ['Track', 'l'], b: ['Track', 'r'], c: 'B' },
      { k: 'x', a: ['First line', 'r'], b: ['Text', 'l'], c: 'C' }
    ],
    legend: [
      [
        '1',
        'Track: fully rounded, with a thin border inside its edge. Light with a border when off, filled in the accent color when on.'
      ],
      [
        '2',
        'Thumb: a circle two borders smaller on each side than the track, inset by two borders: at the start when off, at the end when on (mirrored right to left).'
      ],
      ['3', 'Label: names the setting (Notifications, not “On”). It wraps and is the accessible name.'],
      ['4', 'Description (optional): body/sm in the secondary color, under the label.'],
      ['A', 'Track height: size/switch/{size}, 16, 20 or 24 px. It does not change with the density.'],
      ['B', 'Track width: twice the height minus four borders (switch/track-width): 28, 36 or 44 px.'],
      ['C', 'Gap: space/control/gap/{size}; at md 6, 8 or 10 px. The track is centered on the first line of the label.']
    ],
    real: () => [
      [sw({}), 'off'],
      [sw({ Selection: 'on' }), 'on'],
      [start({ Selection: 'on' }, {}, 220), 'Label position start, 220 px'],
      [sw({ Selection: 'on' }, { 'Show label': false }), 'Show label off'],
      [sw({ Selection: 'on', State: 'disabled' }), 'disabled']
    ],
    figma:
      'In Figma, Label position, Size, Selection and State are variants. Label position start puts the label first and spreads the row: resize the instance to the width of the list. Label and Description are text properties; Show description adds the help text and Show label off keeps the track alone (the label stays the accessible name in code). Focus shows the keyboard focus ring around the track.'
  };
};
// </anatomy:switch>

// <anatomy:input-text>
ANATOMY['input-text'] = () => {
  const it = (v, p = {}, w = 280) => {
    const i = mk('input-text', v, p);
    i.resize(w, i.height);
    return i;
  };
  return {
    intro: 'How an input text is built. The instance is enlarged three times; the real inputs are shown underneath.',
    dashed: ['Drawing box'],
    zoom: 3,
    instance: () =>
      it({ Action: 'icon-button', Content: 'value' }, { Value: 'Ada Lovelace', 'Show leading': true }, 300),
    pins: [
      [1, '', 'top', 250],
      [2, 'Leading icon', 'bottom', 0],
      [3, 'Value', 'top', -150],
      [4, 'IconButton', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['', 't'], b: ['', 'b'], c: 'A', side: 'right' },
      { k: 'x', a: ['', 'l'], b: ['Leading icon', 'l'], c: 'B' },
      { k: 'x', a: ['', 'l'], b: ['Value', 'l'], c: 'C' }
    ],
    legend: [
      [
        '1',
        'Container: the field surface with a thin border inside its edge (color/field/{state}/…, border/width/default) and the control radius (radius/control).'
      ],
      [
        '2',
        'Leading icon (optional): one decorative icon at size/icon/{size} in the placeholder color, placed by its drawing like the icons of a Button. A Trailing icon works the same at the end.'
      ],
      [
        '3',
        'Value: typography/body/{size} on one line; it scrolls in code and truncates in Figma. While it is empty, the Placeholder shows an example in the placeholder color.'
      ],
      [
        '4',
        'Action (md and lg only): an IconButton one size smaller, neutral ghost, in a square as tall as the input; the container has no end padding then.'
      ],
      [
        'A',
        'Height: size/control/{size}, the height of a Button: at md 32, 40 or 44 px in compact, standard and comfortable.'
      ],
      ['B', 'Icon start: the edge padding and the slot padding, minus 1/8 of the icon for its drawing (as a Button).'],
      [
        'C',
        'Text start: without icon, edge padding plus label padding, the padding of a text-only Button; with an icon, after the icon slot.'
      ]
    ],
    real: () => [
      [it({}, { Placeholder: 'Placeholder' }, 180), 'placeholder'],
      [it({ Content: 'value' }, {}, 180), 'value'],
      [it({}, { Placeholder: 'Search', 'Show leading': true }, 180), 'leading icon'],
      [it({}, { Placeholder: 'Website', 'Show trailing': true }, 180), 'trailing icon'],
      [it({ Action: 'icon-button', Content: 'value' }, { Value: 'Draft' }, 180), 'action']
    ],
    figma:
      'In Figma, Size, Action, Content and State are variants (Action icon-button exists at md and lg only, as in the code). Value, Placeholder and Label are text properties; Label is the accessible name when the input is used without a Field and is not shown. Show leading and Show trailing add the decorative icons; choose them with Leading icon and Trailing icon. Focus shows the keyboard focus: the ring, and the focus border on a default or hovered input (an invalid or readonly input keeps its border). The type (email, password, search…) is a behavior of the code.'
  };
};
// </anatomy:input-text>

// <anatomy:textarea>
ANATOMY['textarea'] = () => {
  // A two-line value: the master shows 3 rows and clips longer text.
  const SHORT = 'The parcel arrived on time but the box was damaged on one corner.';
  const ta = (v, p = {}, w = 300) => {
    const i = mk('textarea', v, p.Value || v.Content !== 'value' ? p : { ...p, Value: SHORT });
    i.resize(w, i.height);
    return i;
  };
  return {
    intro: 'How a textarea is built. The instance is enlarged three times; the real textareas are shown underneath.',
    dashed: ['Text box', 'First row'],
    zoom: 3,
    instance: () => ta({ Content: 'value' }, {}, 280),
    pins: [
      [1, '', 'top', 300],
      [2, 'Value', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['', 't'], b: ['Text box', 't'], c: 'A', side: 'right' },
      { k: 'y', a: ['First row', 't'], b: ['First row', 'b'], c: 'C', side: 'left' },
      { k: 'x', a: ['', 'l'], b: ['Text box', 'l'], c: 'B' }
    ],
    legend: [
      ['1', 'Container: the field surface with a thin border inside its edge and the control radius, as an InputText.'],
      [
        '2',
        'Value: typography/body/{size}; it wraps and keeps line breaks. While it is empty, the Placeholder shows an example.'
      ],
      [
        'A',
        'Block padding: half of the InputText height minus one line, so that one row has the height of an InputText (md: 4, 8 or 10 px in compact, standard and comfortable).'
      ],
      ['B', 'Inline padding: space/control/padding-inline/{size}, the padding of an InputText without icon.'],
      ['C', 'First row: one line and its padding, as tall as an InputText of the same size (size/control/{size}).']
    ],
    real: () => [
      [ta({}, {}, 220), 'placeholder'],
      [ta({ Content: 'value' }, {}, 220), 'value'],
      [ta({ Content: 'value', State: 'invalid' }, {}, 220), 'invalid']
    ],
    figma:
      'In Figma, Size, Content and State are variants. Value, Placeholder and Label are text properties; Label is the accessible name when the textarea is used without a Field and is not shown. Focus shows the keyboard focus, as on an InputText. Rows, maximum rows and resizing are behaviors of the code: the master shows 3 rows; a taller instance gives more room, and the text shows up to 3 lines.'
  };
};
// </anatomy:textarea>

// <anatomy:field>
ANATOMY['field'] = () => {
  const fd = (v, p = {}, w) => {
    const i = mk('field', v, p);
    if (w) i.resize(w, i.height);
    return i;
  };
  return {
    intro: 'How a field is built. The instance is enlarged twice; the real fields are shown underneath.',
    hug: ['Description'],
    dashed: ['Drawing box'],
    zoom: 2,
    instance: () => fd({ State: 'invalid' }, { Required: true }),
    pins: [
      [1, 'Label', 'top', 0],
      [2, 'Required indicator', 'top', 0],
      [3, 'Description', 'right', 0],
      [4, 'Control', 'right', 0],
      [5, 'Message icon', 'bottom', 0],
      [6, 'Message text', 'bottom', -170]
    ],
    dims: [
      { k: 'y', a: ['Label row', 'b'], b: ['Description', 't'], c: 'A', side: 'left' },
      { k: 'y', a: ['Description', 'b'], b: ['Control', 't'], c: 'B', side: 'left' },
      { k: 'y', a: ['Control', 'b'], b: ['Message', 't'], c: 'C', side: 'left' }
    ],
    legend: [
      [
        '1',
        'Label: typography/label/md in the primary color. It names the control (the group for a RadioGroup) and wraps.'
      ],
      ['2', 'Required indicator: an asterisk after a space, in the secondary color; hidden from assistive technology.'],
      ['3', 'Description (optional): body/sm in the secondary color; the accessible description of the control.'],
      [
        '4',
        'Control: an InputText, a Textarea, a RadioGroup, a CheckboxGroup or a Checkbox, in the state of the field.'
      ],
      [
        '5',
        'Message icon: warning-circle at size/icon/sm in the danger icon color, centered on the first line of the message and placed by its drawing.'
      ],
      ['6', 'Message: body/sm in the danger content color, shown only when the field is invalid. It wraps.'],
      ['A', 'Label to description: space/content/xs (2, 4 or 6 px in compact, standard and comfortable).'],
      ['B', 'To the control: space/content/sm (4, 8 or 12 px).'],
      ['C', 'Control to message: space/content/xs.']
    ],
    real: () => [
      [fd({}, {}, 240), 'default'],
      [fd({}, { Required: true, 'Show description': false }, 240), 'required, no description'],
      [fd({ State: 'invalid' }, { Required: true }, 240), 'invalid'],
      [fd({ State: 'disabled' }, {}, 240), 'disabled']
    ],
    figma:
      'In Figma, State is a variant (default, invalid, disabled). Label, Description and Message are text properties; Required shows the asterisk and Show description the help text. The Control is an exposed InputText: set its options from the Field instance, or swap it for a Textarea, a Checkbox, a RadioGroup or a CheckboxGroup in the layers panel, and set the control’s State to match the field (the code does it for you). The field text keeps its size whatever the control size.'
  };
};
// </anatomy:field>

const SPECS = {};

// <spec:checkbox>
SPECS.checkbox = () => {
  const cb = (v, p = {}) => mk('checkbox', v, p);
  const SEL = ['off', 'on', 'indeterminate'];
  return {
    path: 'FORMS / CHECKBOX',
    intro:
      'A checkbox turns one option on or off for a choice that is confirmed later, when the form is submitted. Its label says what the option is and the box sits on the first line of the label. A third, indeterminate state shows a parent option whose children are partly selected. For a setting that takes effect at once, use a Switch.',
    hero: () => [
      cb({ Size: 'lg', Selection: 'on' }, { Label: 'Email me a receipt' }),
      cb({ Size: 'lg', Selection: 'indeterminate' }, { Label: 'Select all invoices' }),
      cb({ Size: 'lg' }, { Label: 'Save this card' })
    ],
    anatomy: ANATOMY['checkbox'](),
    sections: [
      [
        'Variants',
        'Selection is off, on or indeterminate (on with a bar instead of a check). Size follows the text around it: sm with 14 px text, md with 16 px (the default), lg with 18 px. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const m = matrix('Size × selection', ['sm', 'md', 'lg'], SEL, (s, sel) =>
            cb({ Size: s, Selection: sel }, { Label: 'Option' })
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
          contexts(c, () => SEL.map((sel) => cb({ Selection: sel }, { Label: 'Option' })));
        }
      ],
      [
        'States',
        'Conditions resolve in this order: disabled, readonly, invalid, hover, default. Focus is independent: the ring shows on any state when the keyboard reaches the box (Focus property). Readonly keeps the value on a quiet surface: it can be read and focused, not changed. Invalid paints the box in the danger color; the message comes from the Field. Disabled dims the box and the text.',
        (c) => {
          const m = matrix(
            'State × selection',
            ['default', 'hover', 'focus', 'readonly', 'disabled', 'invalid'],
            SEL,
            (st, sel) =>
              st === 'focus'
                ? cb({ Selection: sel }, { Label: 'Option', Focus: true })
                : cb({ Selection: sel, State: st }, { Label: 'Option' })
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'The checkbox is as wide as its label, which wraps on as many lines as needed while the box stays on the first line. The whole row is the target, at least 44 px tall. The density changes only the gap between the box and the label; the box and the text keep their size. In Figma, give the instance a fixed width to wrap a long label.',
        (c) => {
          densities(
            c,
            () => ['sm', 'md', 'lg'].map((s) => cb({ Size: s, Selection: 'on' }, { Label: `Option ${s}` })),
            {
              compact: 'gap 4, 6 and 8 px (sm, md, lg)',
              standard: 'gap 6, 8 and 10 px',
              comfortable: 'gap 8, 10 and 12 px'
            }
          );
          const r = stack('Behavior row', 'HORIZONTAL', 24);
          r.counterAxisAlignItems = 'MIN';
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
          const w = card('Wrapping', 'VERTICAL', 16);
          w.appendChild(
            caption(
              wrap(
                cb(
                  { Selection: 'on' },
                  {
                    Label: 'Send me a copy of every invoice and of the payment confirmation by email',
                    'Show description': true,
                    Description: 'You can change this later in the account settings.'
                  }
                ),
                300
              ),
              'fixed width 300 px: the label wraps, the box stays on the first line'
            )
          );
          r.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
          const lines = card('Sizes on a line', 'VERTICAL', 16);
          for (const s of ['sm', 'md', 'lg'])
            lines.appendChild(cb({ Size: s, Selection: 'on' }, { Label: `${s}: centered on the first line` }));
          r.appendChild(lines);
          lines.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Use checkboxes for independent options, a consent, or to select rows in a table. Group related checkboxes under a heading or a Field label that asks the question, and keep the labels short and parallel. A choice that applies at once is a Switch; one choice among several is a RadioGroup. The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const g = surface('Group');
          g.appendChild(text('Notifications', 'label/md'));
          g.appendChild(cb({ Selection: 'on' }, { Label: 'Invoices' }));
          g.appendChild(cb({ Selection: 'on' }, { Label: 'Payment reminders' }));
          g.appendChild(cb({}, { Label: 'Product news' }));
          ex.appendChild(caption(g, 'a group under a label that asks the question'));
          const t = surface('Table', 'VERTICAL', 0, 0);
          t.clipsContent = true;
          for (const [k, [name, sel]] of [
            ['Invoice', 'indeterminate'],
            ['Invoice 2041', 'on'],
            ['Invoice 2042', 'off'],
            ['Invoice 2043', 'on']
          ].entries()) {
            const r = row('Row', 12);
            [r.paddingTop, r.paddingRight, r.paddingBottom, r.paddingLeft] = [8, 16, 8, 12];
            r.appendChild(cb({ Size: 'sm', Selection: sel }, { Label: `Select ${name}`, 'Show label': false }));
            r.appendChild(
              text(name, k ? 'body/sm' : 'label/sm', k ? 'color/content/primary' : 'color/content/secondary')
            );
            t.appendChild(r);
            r.layoutSizingHorizontal = 'FILL';
          }
          t.resize(220, t.height);
          ex.appendChild(caption(t, 'row selection: labels hidden, the header is indeterminate'));
          const consent = surface('Consent');
          consent.appendChild(
            wrap(
              cb(
                { State: 'invalid' },
                {
                  Label: 'I accept the terms of service',
                  'Show description': true,
                  Description: 'Required to create the account.'
                }
              ),
              260
            )
          );
          ex.appendChild(caption(consent, 'a required consent, invalid after submit'));
        }
      ]
    ]
  };
};
// </spec:checkbox>

// <spec:radio>
SPECS.radio = () => {
  const rd = (v, p = {}) => mk('radio', v, p);
  return {
    path: 'FORMS / RADIO',
    intro:
      'A radio is one option of a RadioGroup: a circle the user selects to choose that option over the others. It never exists alone and pressing it again does not clear it. Its size, readonly and invalid state come from the group. This page documents the option; the RadioGroup page documents the arrangement and the keyboard.',
    hero: () => [
      rd({ Size: 'lg' }, { Label: 'Standard' }),
      rd({ Size: 'lg', Selection: 'on' }, { Label: 'Express' }),
      rd({ Size: 'lg' }, { Label: 'Pick up in store' })
    ],
    anatomy: ANATOMY['radio'](),
    sections: [
      [
        'Variants',
        'Selection is off or on. Size follows the group: sm with 14 px text, md with 16 px (the default), lg with 18 px. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const m = matrix('Size × selection', ['sm', 'md', 'lg'], ['off', 'on'], (s, sel) =>
            rd({ Size: s, Selection: sel }, { Label: 'Option' })
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [rd({}, { Label: 'Standard' }), rd({ Selection: 'on' }, { Label: 'Express' })]);
        }
      ],
      [
        'States',
        'Conditions resolve in this order: disabled, readonly, invalid, hover, default; focus is independent (Focus property). Readonly shows the choice on a quiet surface and keeps it; invalid paints the circle in the danger color; disabled dims the circle and the text.',
        (c) => {
          const m = matrix(
            'State × selection',
            ['default', 'hover', 'focus', 'readonly', 'disabled', 'invalid'],
            ['off', 'on'],
            (st, sel) =>
              st === 'focus'
                ? rd({ Selection: sel }, { Label: 'Option', Focus: true })
                : rd({ Selection: sel, State: st }, { Label: 'Option' })
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'A radio is as wide as its label, which wraps while the circle stays on the first line. The whole row is the target, at least 44 px tall. The density changes only the gap between the circle and the label.',
        (c) => {
          densities(
            c,
            () => ['sm', 'md', 'lg'].map((s) => rd({ Size: s, Selection: 'on' }, { Label: `Option ${s}` })),
            {
              compact: 'gap 4, 6 and 8 px (sm, md, lg)',
              standard: 'gap 6, 8 and 10 px',
              comfortable: 'gap 8, 10 and 12 px'
            }
          );
          const w = card('Wrapping', 'VERTICAL', 16);
          w.appendChild(
            caption(
              wrap(
                rd(
                  { Selection: 'on' },
                  {
                    Label: 'Pick up in store, at the counter of the shop you choose at checkout',
                    'Show description': true,
                    Description: 'Free, ready in two hours.'
                  }
                ),
                300
              ),
              'fixed width 300 px: the label wraps, the circle stays on the first line'
            )
          );
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Use radios only inside a RadioGroup, for two to about six options that are all worth reading. Keep the labels parallel and add a description when the options differ by more than their name. The RadioGroup page shows complete groups.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const g = surface('Plans');
          g.appendChild(text('Plan', 'label/md'));
          for (const [l, d, sel] of [
            ['Starter', 'Up to 3 people.', 'off'],
            ['Team', 'Up to 20 people, shared billing.', 'on'],
            ['Enterprise', 'Unlimited, single sign-on.', 'off']
          ])
            g.appendChild(rd({ Selection: sel }, { Label: l, 'Show description': true, Description: d }));
          ex.appendChild(caption(g, 'options with a description'));
        }
      ]
    ]
  };
};
// </spec:radio>

// <spec:radio-group>
SPECS['radio-group'] = () => {
  const rg = (v = {}, p = {}) => mk('radio-group', v, p);
  return {
    path: 'FORMS / RADIO GROUP',
    intro:
      'A radio group asks for exactly one choice among a few options that are all visible: a delivery speed, a plan, a payment method. It holds Radio options, stacks them or places them on a wrapping row, and is a single stop for the keyboard: the arrow keys move the selection. Once a radio is selected, the user cannot return to no selection. One on/off option is a Checkbox.',
    hero: () => [options(rg(), { Size: 'lg' }), options(rg({ Orientation: 'horizontal' }), { Size: 'lg' })],
    anatomy: ANATOMY['radio-group'](),
    sections: [
      [
        'Variants',
        'Orientation vertical (the default) stacks the radios; horizontal places them on one line and wraps when the width runs out. Size (sm, md, lg) applies to every radio (in Figma, set it on each radio of the slot). The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const r = card('Orientation and size', 'HORIZONTAL', 40);
          r.counterAxisAlignItems = 'MIN';
          for (const s of ['sm', 'md', 'lg']) r.appendChild(caption(options(rg(), { Size: s }), `vertical · ${s}`));
          r.appendChild(caption(rg({ Orientation: 'horizontal' }), 'horizontal · md'));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [rg()]);
        }
      ],
      [
        'States',
        'The group passes its state to every radio: readonly keeps the choice and lets the keyboard move without changing it, invalid paints every circle in the danger color (the message comes from the Field), disabled dims the group and removes it from the keyboard order. Hover and focus apply to one radio at a time.',
        (c) => {
          const r = card('Group states', 'HORIZONTAL', 40);
          r.counterAxisAlignItems = 'MIN';
          r.appendChild(caption(rg(), 'default'));
          const f = rg();
          setProps(
            f.findOne((n) => n.name === 'Radio 2'),
            { Focus: true }
          );
          r.appendChild(caption(f, 'focus on the selected radio'));
          for (const st of ['readonly', 'invalid', 'disabled'])
            r.appendChild(caption(options(rg(), { State: st }), st));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'A vertical group is as wide as its longest radio. A horizontal group wraps its radios on further lines, still in source order, when its width runs out: in Figma, give the instance a fixed width. The density changes the gaps; the radios keep their size.',
        (c) => {
          densities(c, () => [rg()], {
            compact: 'gap 4 px',
            standard: 'gap 8 px',
            comfortable: 'gap 12 px'
          });
          const w = card('Wrapping', 'VERTICAL', 16);
          const h = rg({ Orientation: 'horizontal' });
          h.resize(220, h.height);
          w.appendChild(caption(h, 'horizontal, fixed width 220 px: the third radio wraps'));
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Put the group in a Field: the field label asks the question and names the group, the description helps, the message explains an invalid choice. Use horizontal only for two or three short options. For more than about six options, or long ones, use a select (to come). The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const f1 = mk('field', {}, { Label: 'Delivery speed', Description: 'Express ships tomorrow.' });
          swapControl(f1, 'radio-group');
          ex.appendChild(caption(f1, 'in a Field'));
          const f2 = mk('field', {}, { Label: 'Billing', 'Show description': false });
          const g2 = swapControl(f2, 'radio-group', { Orientation: 'horizontal' });
          setProps(
            g2.findOne((n) => n.name === 'Radio 1'),
            { Label: 'Monthly' }
          );
          setProps(
            g2.findOne((n) => n.name === 'Radio 2'),
            { Label: 'Yearly' }
          );
          g2.findOne((n) => n.name === 'Radio 3').remove();
          ex.appendChild(caption(f2, 'two short options, horizontal'));
          const f3 = mk(
            'field',
            { State: 'invalid' },
            { Label: 'Delivery speed', Required: true, Message: 'Choose a delivery speed.', 'Show description': false }
          );
          const g3 = swapControl(f3, 'radio-group');
          options(g3, { State: 'invalid', Selection: 'off' });
          ex.appendChild(caption(f3, 'required, nothing selected after submit'));
        }
      ]
    ]
  };
};
// </spec:radio-group>

// <spec:checkbox-group>
SPECS['checkbox-group'] = () => {
  const cg = (v = {}, p = {}) => mk('checkbox-group', v, p);
  // A checkbox of the default size appended to the Options slot of a group instance.
  const addBox = (group, label, sel = 'off') => {
    const box = mk('checkbox', { Selection: sel }, { Label: label });
    group.findAllWithCriteria({ types: ['SLOT'] })[0].appendChild(box);
    return box;
  };
  const label = (group, n, l, p = {}) =>
    setProps(
      group.findOne((x) => x.name === `Checkbox ${n}`),
      { Label: l, ...p }
    );
  return {
    path: 'FORMS / CHECKBOX GROUP',
    intro:
      'A checkbox group gathers several related checkboxes that answer one question, any number of which can be checked: notification channels, filters, delivery days. It stacks them or places them on a wrapping row; every checkbox stays its own stop for the keyboard and Space toggles it. A required group asks for at least one, and the Field says so in words. One independent option is a Checkbox; exactly one choice is a RadioGroup.',
    hero: () => [options(cg(), { Size: 'lg' }), options(cg({ Orientation: 'horizontal' }), { Size: 'lg' })],
    anatomy: ANATOMY['checkbox-group'](),
    sections: [
      [
        'Variants',
        'Orientation vertical (the default) stacks the checkboxes; horizontal places them on one line and wraps when the width runs out. Size (sm, md, lg) applies to every checkbox (in Figma, set it on each checkbox of the slot). The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const r = card('Orientation and size', 'HORIZONTAL', 40);
          r.counterAxisAlignItems = 'MIN';
          for (const s of ['sm', 'md', 'lg']) r.appendChild(caption(options(cg(), { Size: s }), `vertical · ${s}`));
          r.appendChild(caption(cg({ Orientation: 'horizontal' }), 'horizontal · md'));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
          // Narrow context columns: a short third label.
          contexts(c, () => {
            const g = cg();
            label(g, 3, 'Push');
            return [g];
          });
        }
      ],
      [
        'States',
        'The group passes its state to every checkbox: readonly keeps the checked boxes and lets the keyboard reach them without changing them, invalid paints every box in the danger color (the message comes from the Field), disabled dims the group and removes it from the keyboard order. Hover and focus apply to one checkbox at a time.',
        (c) => {
          const r = card('Group states', 'HORIZONTAL', 40);
          r.counterAxisAlignItems = 'MIN';
          r.appendChild(caption(cg(), 'default'));
          const f = cg();
          label(f, 2, 'Text message', { Focus: true });
          r.appendChild(caption(f, 'focus on one checkbox'));
          for (const st of ['readonly', 'invalid', 'disabled'])
            r.appendChild(caption(options(cg(), { State: st }), st));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'A vertical group is as wide as its longest checkbox. A horizontal group wraps its checkboxes on further lines, still in source order, when its width runs out: in Figma, give the instance a fixed width. The density changes the gaps; the checkboxes keep their size.',
        (c) => {
          densities(c, () => [cg()], {
            compact: 'gap 4 px',
            standard: 'gap 8 px',
            comfortable: 'gap 12 px'
          });
          const w = card('Wrapping', 'VERTICAL', 16);
          const h = cg({ Orientation: 'horizontal' });
          h.resize(220, h.height);
          w.appendChild(caption(h, 'horizontal, fixed width 220 px: the third checkbox wraps'));
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Put the group in a Field: the field label asks the question and names the group, the description says how many answers are expected (Select at least one channel), the message explains what is missing. The group never validates: the application decides when a required group is invalid. A select-all checkbox stays outside the group, above it; its state follows the group. The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          ex.layoutWrap = 'WRAP';
          ex.counterAxisSpacing = 24;
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const f1 = mk(
            'field',
            {},
            { Label: 'How can we reach you?', Description: 'Select at least one channel.', Required: true }
          );
          const g1 = swapControl(f1, 'checkbox-group');
          label(g1, 1, 'Email');
          label(g1, 2, 'Phone call');
          label(g1, 3, 'Post');
          ex.appendChild(caption(f1, 'required: at least one, said in words'));
          const f2 = mk(
            'field',
            { State: 'invalid' },
            {
              Label: 'How can we reach you?',
              Description: 'Select at least one channel.',
              Required: true,
              Message: 'Select at least one channel.'
            }
          );
          const g2 = swapControl(f2, 'checkbox-group');
          label(g2, 1, 'Email');
          label(g2, 2, 'Phone call');
          label(g2, 3, 'Post');
          options(g2, { State: 'invalid', Selection: 'off' });
          ex.appendChild(caption(f2, 'nothing checked after submit'));
          const f3 = mk('field', {}, { Label: 'Delivery days', 'Show description': false });
          const g3 = swapControl(f3, 'checkbox-group', { Orientation: 'horizontal' });
          label(g3, 1, 'Monday');
          label(g3, 2, 'Tuesday', { Selection: 'on' });
          label(g3, 3, 'Wednesday');
          addBox(g3, 'Thursday', 'on');
          addBox(g3, 'Friday');
          g3.resize(240, g3.height);
          ex.appendChild(caption(f3, 'horizontal, wrapping'));
          const all = stack('Select all', 'VERTICAL', 8);
          all.appendChild(mk('checkbox', { Selection: 'indeterminate' }, { Label: 'All toppings' }));
          const g4 = cg();
          label(g4, 1, 'Cheese', { Selection: 'off' });
          label(g4, 2, 'Ham', { Selection: 'on' });
          label(g4, 3, 'Mushrooms');
          const indent = stack('Indent', 'VERTICAL', 0, [0, 0, 0, 24]);
          indent.appendChild(g4);
          all.appendChild(indent);
          ex.appendChild(caption(all, 'select all outside the group'));
        }
      ]
    ]
  };
};
// </spec:checkbox-group>

// <spec:switch>
SPECS.switch = () => {
  const sw = (v, p = {}) => mk('switch', v, p);
  const start = (v, p, w = 320) => {
    const i = sw({ 'Label position': 'start', ...v }, p);
    i.resize(w, i.height);
    return i;
  };
  return {
    path: 'FORMS / SWITCH',
    intro:
      'A switch turns a setting on or off, and the change takes effect at once: notifications, dark mode, automatic renewal. Its label names the setting, never its state. It has no invalid or required state: a choice that is confirmed later or validated is a Checkbox.',
    hero: () => {
      const list = stack('Settings', 'VERTICAL', 16);
      list.appendChild(
        start(
          { Size: 'lg', Selection: 'on' },
          { Label: 'Notifications', 'Show description': true, Description: 'Push notifications on this device.' },
          380
        )
      );
      list.appendChild(start({ Size: 'lg' }, { Label: 'Sounds' }, 380));
      list.appendChild(start({ Size: 'lg', Selection: 'on' }, { Label: 'Automatic renewal' }, 380));
      return [list];
    },
    anatomy: ANATOMY['switch'](),
    sections: [
      [
        'Variants',
        'Selection is off or on. Label position end (the default) puts the track first; start puts the label first and the track at the end of the row, so that stacked switches align in a settings list. Size follows the text around it. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const m = matrix('Size × selection', ['sm', 'md', 'lg'], ['off', 'on'], (s, sel) =>
            sw({ Size: s, Selection: sel })
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
          const p = card('Label position', 'HORIZONTAL', 40);
          p.counterAxisAlignItems = 'MIN';
          p.appendChild(caption(sw({ Selection: 'on' }, { Label: 'Notifications' }), 'end: track first'));
          p.appendChild(
            caption(start({ Selection: 'on' }, { Label: 'Notifications' }, 300), 'start: label first, track at the end')
          );
          c.appendChild(p);
          p.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [sw({}), sw({ Selection: 'on' })]);
        }
      ],
      [
        'States',
        'Conditions resolve in this order: disabled, readonly, hover, default; focus is independent (Focus property). Readonly shows the value on a quiet track and keeps it; disabled dims the track and the text.',
        (c) => {
          const m = matrix(
            'State × selection',
            ['default', 'hover', 'focus', 'readonly', 'disabled'],
            ['off', 'on'],
            (st, sel) => (st === 'focus' ? sw({ Selection: sel }, { Focus: true }) : sw({ Selection: sel, State: st }))
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'With the label at the end, the switch is as wide as its label. With the label at the start, it fills the width it is given and the track sits at the end. Long labels wrap; the track stays on the first line. The whole row is the target, at least 44 px tall. The density changes only the gap.',
        (c) => {
          densities(
            c,
            () => ['sm', 'md', 'lg'].map((s) => sw({ Size: s, Selection: 'on' }, { Label: `Setting ${s}` })),
            {
              compact: 'gap 4, 6 and 8 px (sm, md, lg)',
              standard: 'gap 6, 8 and 10 px',
              comfortable: 'gap 8, 10 and 12 px'
            }
          );
          const w = card('Wrapping', 'VERTICAL', 16);
          const long = start(
            { Selection: 'on' },
            {
              Label: 'Send a weekly summary of the invoices that are due',
              'Show description': true,
              Description: 'Every Monday at 9:00.'
            },
            300
          );
          long.findOne((n) => n.name === 'Text').layoutSizingHorizontal = 'FILL';
          for (const t of long.findAll((n) => n.type === 'TEXT')) {
            t.layoutSizingHorizontal = 'FILL';
            t.textAutoResize = 'HEIGHT';
          }
          w.appendChild(caption(long, 'start, 300 px: the label wraps, the track stays on the first line'));
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Use a switch for a setting that applies as soon as it changes, in a settings list or next to the content it controls. Name the setting, not the action. Do not use it in a form that is submitted later (a Checkbox) or for a choice between two named options (a RadioGroup). The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const list = surface('Settings', 'VERTICAL', 16);
          list.appendChild(text('Notifications', 'heading/sm'));
          for (const [l, d, sel] of [
            ['Invoices', 'When an invoice is paid or overdue.', 'on'],
            ['Mentions', 'When someone mentions you.', 'on'],
            ['Product news', 'At most once a month.', 'off']
          ])
            list.appendChild(start({ Selection: sel }, { Label: l, 'Show description': true, Description: d }, 320));
          ex.appendChild(caption(list, 'a settings list, label at the start'));
          const bar = surface('Toolbar', 'HORIZONTAL', 16, 12);
          bar.counterAxisAlignItems = 'CENTER';
          bar.appendChild(text('Invoices', 'heading/sm'));
          bar.appendChild(sw({ Size: 'sm' }, { Label: 'Show archived' }));
          ex.appendChild(caption(bar, 'next to the content it filters'));
          const dark = surface('Dark', 'VERTICAL', 12);
          dark.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), 'orchid'));
          dark.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), 'dark'));
          fill(dark, 'color/surface/canvas');
          dark.appendChild(sw({ Selection: 'on' }, { Label: 'Dark mode' }));
          dark.appendChild(sw({}, { Label: 'Reduce motion' }));
          ex.appendChild(caption(dark, 'orchid brand, dark'));
        }
      ]
    ]
  };
};
// </spec:switch>

// <spec:input-text>
SPECS['input-text'] = () => {
  const it = (v, p = {}, w = 280) => {
    const i = mk('input-text', v, p);
    i.resize(w, i.height);
    return i;
  };
  return {
    path: 'FORMS / INPUT TEXT',
    intro:
      'An input text takes one line of free text: a name, an email address, a search. It has the height and the inline padding of a Button of the same size, so the two line up. Its label comes from the Field around it; the placeholder only shows an example of the expected value. It can show a decorative icon at each end and, at md and lg, one action at the end: clear a search, show a password.',
    hero: () => [
      mk('field', {}, { Label: 'Email', Description: 'We send invoices to this address.' }),
      it(
        { Size: 'lg', Action: 'icon-button', Content: 'value' },
        { Value: 'Quarterly report', 'Show leading': true },
        340
      )
    ],
    anatomy: ANATOMY['input-text'](),
    sections: [
      [
        'Variants',
        'Size sets the height, the text and the icon size, as for a Button: sm, md (the default) and lg. Content shows the value or the placeholder. The slots add a decorative icon at the start or at the end, or an action at the end. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const sz = card('Sizes', 'HORIZONTAL', 32);
          sz.counterAxisAlignItems = 'MAX';
          for (const s of ['sm', 'md', 'lg'])
            sz.appendChild(caption(it({ Size: s }, { Placeholder: 'Search invoices', 'Show leading': true }, 300), s));
          c.appendChild(sz);
          sz.layoutSizingHorizontal = 'FILL';
          const sl = card('Slots', 'HORIZONTAL', 24);
          sl.counterAxisAlignItems = 'MAX';
          sl.appendChild(caption(it({ Content: 'value' }, {}, 190), 'none'));
          sl.appendChild(caption(it({ Content: 'value' }, { 'Show leading': true }, 190), 'leading icon'));
          sl.appendChild(caption(it({ Content: 'value' }, { 'Show trailing': true }, 190), 'trailing icon'));
          sl.appendChild(
            caption(it({ Content: 'value', Action: 'icon-button' }, { 'Show leading': true }, 190), 'icon and action')
          );
          c.appendChild(sl);
          sl.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [it({ Content: 'value' }, { Value: 'Ada' }, 140), it({}, { Placeholder: 'Name' }, 140)]);
        }
      ],
      [
        'States',
        'Conditions resolve in this order: disabled, readonly, invalid, focus, hover, default. Focus shows the ring; an invalid input keeps its danger border while focused (State invalid with Focus on). Readonly keeps the value selectable on a quiet surface; disabled dims everything and disables the action.',
        (c) => {
          const m = matrix(
            'State × content',
            ['default', 'hover', 'focus', 'invalid + focus', 'readonly', 'disabled', 'invalid'],
            ['placeholder', 'value'],
            (st, content) =>
              st === 'invalid + focus'
                ? it({ State: 'invalid', Content: content }, { Focus: true }, 260)
                : st === 'focus'
                  ? it({ Content: content }, { Focus: true }, 260)
                  : it({ State: st, Content: content }, {}, 260),
            300
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'The input fills the width it is given (in Figma, resize the instance) and keeps its height. The value stays on one line: it scrolls in code and ends with an ellipsis in Figma. The density changes the height and the inline padding, as for a Button; the text keeps its size.',
        (c) => {
          densities(
            c,
            () =>
              ['sm', 'md', 'lg'].map((s) =>
                it({ Size: s }, { Placeholder: `Search (${s})`, 'Show leading': true }, 280)
              ),
            {
              compact: 'heights 28, 32 and 40 px (sm, md, lg)',
              standard: 'heights 32, 40 and 48 px',
              comfortable: 'heights 36, 44 and 56 px'
            }
          );
          const w = card('Long value', 'VERTICAL', 16);
          w.appendChild(
            caption(
              it({ Content: 'value' }, { Value: 'Invoices and payment confirmations for the third quarter' }, 260),
              '260 px: the value ends with an ellipsis in Figma'
            )
          );
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Put the input in a Field: its label names the input, its description helps, its message explains an error. Use the placeholder for an example, never as the label. Add a leading icon only when it helps to recognize the field (search), and an action only for the value itself (clear, show the password). The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const form = surface('Sign in', 'VERTICAL', 16);
          const a = mk('field', {}, { Label: 'Email', 'Show description': false });
          setProps(
            a.findOne((n) => n.name === 'Control'),
            { Placeholder: 'name@example.com' }
          );
          form.appendChild(a);
          const b = mk('field', {}, { Label: 'Password', Description: 'At least 12 characters.' });
          setProps(
            b.findOne((n) => n.name === 'Control'),
            { Placeholder: '' }
          );
          form.appendChild(b);
          ex.appendChild(caption(form, 'a form: each input in a Field'));
          ex.appendChild(
            caption(
              it({ Action: 'icon-button', Content: 'value' }, { Value: 'overdue', 'Show leading': true }, 260),
              'search with a clear action'
            )
          );
          ex.appendChild(
            caption(
              mk('field', { State: 'invalid' }, { Label: 'Email', Required: true, 'Show description': false }),
              'required and invalid after submit'
            )
          );
        }
      ]
    ]
  };
};
// </spec:input-text>

// <spec:textarea>
SPECS.textarea = () => {
  // A two-line value: the master shows 3 rows and clips longer text.
  const SHORT = 'The parcel arrived on time but the box was damaged on one corner.';
  const ta = (v, p = {}, w = 300) => {
    const i = mk('textarea', v, p.Value || v.Content !== 'value' ? p : { ...p, Value: SHORT });
    i.resize(w, i.height);
    return i;
  };
  return {
    path: 'FORMS / TEXTAREA',
    intro:
      'A textarea takes free text on several lines: a comment, a description, an address. It shares its colors, border, padding and text with the InputText of the same size, and one row is as tall as an InputText. In code it can grow with the content or let the user resize it; in Figma it shows its default of 3 rows.',
    hero: () => {
      const f = mk('field', {}, { Label: 'Feedback', Description: 'What went well, what could be better.' });
      swapControl(f, 'textarea', { Content: 'value' });
      return [f, ta({ Size: 'lg', Content: 'value' }, {}, 360)];
    },
    anatomy: ANATOMY['textarea'](),
    sections: [
      [
        'Variants',
        'Size sets the text and the padding, as for an InputText: sm, md (the default) and lg. Content shows the value or the placeholder. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const sz = card('Sizes', 'HORIZONTAL', 24);
          sz.counterAxisAlignItems = 'MAX';
          for (const s of ['sm', 'md', 'lg']) sz.appendChild(caption(ta({ Size: s, Content: 'value' }, {}, 320), s));
          c.appendChild(sz);
          sz.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [ta({ Content: 'value' }, { Value: 'Arrived on time.' }, 140)]);
        }
      ],
      [
        'States',
        'The states of an InputText: disabled, readonly, invalid, focus, hover, default. An invalid textarea keeps its danger border while focused (State invalid with Focus on).',
        (c) => {
          const m = matrix(
            'State × content',
            ['default', 'hover', 'focus', 'invalid + focus', 'readonly', 'disabled', 'invalid'],
            ['placeholder', 'value'],
            (st, content) =>
              st === 'invalid + focus'
                ? ta({ State: 'invalid', Content: content }, { Focus: true }, 300)
                : st === 'focus'
                  ? ta({ Content: content }, { Focus: true }, 300)
                  : ta({ State: st, Content: content }, {}, 300),
            340
          );
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'The textarea fills the width it is given. In code, rows sets its initial height; resize vertical (the default) lets the user make it taller, auto grows with the content up to maxRows, none keeps it fixed and scrolls. One row has the height of an InputText of the same size: they line up in a form.',
        (c) => {
          densities(c, () => [ta({ Content: 'value' }, {}, 280)], {
            compact: 'block padding 4 px at md',
            standard: 'block padding 8 px at md',
            comfortable: 'block padding 10 px at md'
          });
          const r = card('Height', 'HORIZONTAL', 32);
          r.counterAxisAlignItems = 'MIN';
          r.appendChild(caption(ta({ Content: 'value' }, {}, 260), '3 rows (the default)'));
          const tall = ta({}, {}, 260);
          tall.resize(260, tall.height + 48);
          r.appendChild(caption(tall, 'a taller instance: 5 rows of room'));
          r.appendChild(
            caption(
              ta(
                { Content: 'value' },
                {
                  Value: 'The parcel arrived on time but the box was damaged on one corner. The contents were intact.'
                },
                260
              ),
              'a longer value: Figma shows the first 3 lines'
            )
          );
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Use a textarea when the answer can take more than one line; for a short answer, use an InputText. Put it in a Field and say in the description what to write or how long it can be. The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const f1 = mk(
            'field',
            {},
            { Label: 'Delivery instructions', Description: 'Door code, floor, opening hours.' }
          );
          swapControl(f1, 'textarea');
          ex.appendChild(caption(f1, 'in a Field, with a hint'));
          const f2 = mk(
            'field',
            { State: 'invalid' },
            {
              Label: 'Reason for the refund',
              Required: true,
              'Show description': false,
              Message: 'Tell us at least one sentence.'
            }
          );
          swapControl(f2, 'textarea', { State: 'invalid' });
          ex.appendChild(caption(f2, 'required and invalid after submit'));
        }
      ]
    ]
  };
};
// </spec:textarea>

// <spec:field>
SPECS.field = () => {
  const fd = (v, p = {}, w) => {
    const i = mk('field', v, p);
    if (w) i.resize(w, i.height);
    return i;
  };
  return {
    path: 'FORMS / FIELD',
    intro:
      'A field gives one form control its visible label, an optional description, the required asterisk and the error message. It wraps an InputText, a Textarea, a RadioGroup, a CheckboxGroup or a Checkbox and passes its required, invalid and disabled state to it. It never validates: the application decides when it is invalid and what the message says.',
    hero: () => [
      fd({}, { Label: 'Email', Required: true }),
      fd({ State: 'invalid' }, { Label: 'Email', Required: true })
    ],
    anatomy: ANATOMY['field'](),
    sections: [
      [
        'Variants',
        'The Field has no size or appearance of its own: its text is always label/md and body/sm. What changes is the control inside it. The brand, the light or dark appearance and the density come from the modes of the frame.',
        (c) => {
          const r = card('Controls', 'HORIZONTAL', 24);
          r.counterAxisAlignItems = 'MIN';
          r.appendChild(caption(fd({}, { Label: 'Full name', 'Show description': false }, 240), 'InputText'));
          const t = fd({}, { Label: 'Comment', 'Show description': false }, 240);
          swapControl(t, 'textarea');
          r.appendChild(caption(t, 'Textarea'));
          const g = fd({}, { Label: 'Delivery speed', 'Show description': false }, 240);
          swapControl(g, 'radio-group');
          r.appendChild(caption(g, 'RadioGroup'));
          const k = fd({}, { Label: 'Receipts', 'Show description': false }, 240);
          swapControl(k, 'checkbox', { Selection: 'on' }, { Label: 'Email me a receipt' });
          r.appendChild(caption(k, 'Checkbox: the field label asks the question'));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
          contexts(c, () => [
            fd({ State: 'invalid' }, { Required: true, 'Show description': false, Message: 'Enter your email.' }, 140)
          ]);
        }
      ],
      [
        'States',
        'Invalid shows the message under the control and puts the control in its invalid state; the label keeps its color. Disabled dims the label, the asterisk and the description and disables the control. Required only adds the asterisk; the control receives the required state.',
        (c) => {
          const r = card('Field states', 'HORIZONTAL', 24);
          r.counterAxisAlignItems = 'MIN';
          r.appendChild(caption(fd({}, {}, 240), 'default'));
          r.appendChild(caption(fd({}, { Required: true }, 240), 'required'));
          r.appendChild(caption(fd({ State: 'invalid' }, { Required: true }, 240), 'invalid'));
          r.appendChild(caption(fd({ State: 'disabled' }, { Required: true }, 240), 'disabled'));
          c.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Behavior & sizing',
        'The field fills the width it is given and its control fills the field (a Checkbox, a RadioGroup or a CheckboxGroup keeps its own width). The description and the message wrap and the message icon stays on their first line. In code the label wraps too; in Figma it stays on one line, so keep it short. The density changes the gaps.',
        (c) => {
          densities(c, () => [fd({ State: 'invalid' }, { Required: true }, 280)], {
            compact: 'gaps 2 and 4 px',
            standard: 'gaps 4 and 8 px',
            comfortable: 'gaps 6 and 12 px'
          });
          const w = card('Long texts', 'VERTICAL', 16);
          w.appendChild(
            caption(
              fd(
                { State: 'invalid' },
                {
                  Label: 'Email for invoices and receipts',
                  Required: true,
                  Description: 'We never share it. You can add a second address later in the account settings.',
                  Message: 'Enter an email address like name@example.com, without spaces.'
                },
                300
              ),
              '300 px: the description and the message wrap, the icon stays on the first line'
            )
          );
          c.appendChild(w);
          w.layoutSizingHorizontal = 'FILL';
        }
      ],
      [
        'Usage examples',
        'Give every control a Field, with a short label that names what to enter. Mark required fields, or the optional ones when most are required, consistently in a form. Write the message as the way to fix the error. The full guidance will be in the documentation page of the component.',
        (c) => {
          const ex = card('Examples', 'HORIZONTAL', 24);
          ex.counterAxisAlignItems = 'MIN';
          c.appendChild(ex);
          ex.layoutSizingHorizontal = 'FILL';
          const form = surface('Sign up', 'VERTICAL', 16);
          form.appendChild(text('Create your account', 'heading/sm'));
          form.appendChild(fd({}, { Label: 'Full name', Required: true, 'Show description': false }, 300));
          form.appendChild(fd({ State: 'invalid' }, { Label: 'Email', Required: true }, 300));
          form.appendChild(fd({}, { Label: 'Company', Description: 'Optional. Shown on your invoices.' }, 300));
          const k = fd({}, { Label: 'Terms', 'Show description': false, Required: true }, 300);
          swapControl(k, 'checkbox', {}, { Label: 'I accept the terms of service' });
          form.appendChild(k);
          ex.appendChild(caption(form, 'a sign-up form'));
          const g = fd({}, { Label: 'Delivery speed', Description: 'Express ships tomorrow.' }, 300);
          swapControl(g, 'radio-group');
          ex.appendChild(caption(g, 'a question with a RadioGroup'));
        }
      ]
    ]
  };
};
// </spec:field>

const out = {};
for (const id of IDS) out[id] = ANATOMY_ONLY ? await redrawBoard(id) : await build(id, SPECS[id]());
return out;
