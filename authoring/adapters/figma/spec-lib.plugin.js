const lib = async function (figma, CFG) {
  // ggbrick specification library (wave 3, 2026-11-03): the shared helpers of forms-spec.plugin.js (wave 2) as one
  // function, stored as the characters of the hidden, locked text layer _Script/spec-lib (411:2) on the Utilities page;
  // each specification body runs it: const H = await eval('(' + node.characters + ')')(figma, CFG). Sections may be
  // async. To update the stored copy, run a body that sets node.characters = lib.toString() with this function. CFG.PAGES maps an id to [page id, set name,
  // component set id]; spec.repo names the contract folder. Returns the helpers and build(ID, spec).
  figma.skipInvisibleInstanceChildren = false;
  const PAGES = CFG.PAGES;
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
  // A stroke drawn on some sides only (the Accordion lines) keeps those sides; dashed layout boxes (all) are outlined.
  const weight = (n, w, all = false) => {
    const F = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
    const sides = F.map((f) => ('strokeTopWeight' in n ? n[f] : 1));
    for (const f of F) if (n.boundVariables && n.boundVariables[f]) n.setBoundVariable(f, null);
    if (all || sides.every((x) => x === sides[0])) {
      n.strokeWeight = w;
      return;
    }
    F.forEach((f, i) => {
      n[f] = sides[i] > 0 ? w : 0;
    });
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
        weight(n, 1, true);
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
        `The contract and the code in the ggbrick repository (${spec.repo}) are the reference. This page documents the Figma component set “${PAGES[ID][1]}”; every component shown here is an instance, not a master. Unless a frame says otherwise, the examples use the base brand, the light appearance and the standard density.`,
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
      await fn(c);
    }
    return { root: root.id, h: Math.round(root.height), board: dg.id, set: SETS[ID].id };
  };
  // Anatomy boards: one block per component (also run alone with ANATOMY_ONLY to redraw the boards in place).
  return {
    V,
    paint,
    fill,
    stroke,
    shadow,
    text,
    stack,
    card,
    panel,
    board,
    chip,
    caption,
    label,
    callout,
    marker,
    line,
    heading,
    divider,
    row,
    col_,
    parse,
    mk,
    setProps,
    wrap,
    contexts,
    densities,
    matrix,
    surface,
    inkDrawing,
    drawBoard,
    build,
    col,
    mode,
    wf,
    S,
    SETS,
    PAGES
  };
};
