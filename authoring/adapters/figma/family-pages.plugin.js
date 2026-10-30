// Family pages layout (use_figma body), 2026-10-30.
// User request: the library pages (Actions, Content, Forms) open with an overview frame (family description, an
// isometric cover of live instances, one card per component linking to its section and its specification) and each
// component section starts with a header (name, short description, links). Set FAMILY and run once per family; a
// rerun replaces the overview and the headers, never duplicates them. Masters keep their IDs: only their position
// inside their section changes. Text comes from the first sentence of each specification's introduction; each
// component lists [name, specification page, summary, internal parts, preview properties].
const FAMILY = 'Actions';
const FAMILIES = {
  Actions: {
    page: '343:2',
    description:
      'Components people press or click to do something or to go somewhere: a Button or an IconButton starts an action, a Link leads to another page or resource.',
    components: [
      [
        'Button',
        '144:2',
        'Starts an action or moves the user to the next step of a task.',
        ['_Button/Trailing', '_Button/Loading indicator'],
        {}
      ],
      [
        'IconButton',
        '211:2',
        'Starts an action with a single familiar icon where space is short; its label is never shown.',
        [],
        { Appearance: 'outline' }
      ],
      [
        'Link',
        '225:2',
        'Takes the reader to another page, a file, an email address, a phone number or a printable version.',
        ['_Link/Destination'],
        {}
      ]
    ]
  }
};
const fam = FAMILIES[FAMILY];
const W = 1232;
const PAD = 72;
const SECTION_PAD = 80;
const GAP = 160;

// Resources: variables, text styles, effect styles, collections, Phosphor glyphs.
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('no variable ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const textStyles = await figma.getLocalTextStylesAsync();
const TS = {};
for (const s of textStyles) TS[s.name] = s;
for (const s of textStyles) await figma.loadFontAsync(s.fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/raised');
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const COL = (name) => collections.find((c) => c.name === name);
const mode = (col, name) => COL(col).modes.find((m) => m.name === name).modeId;
const ph = await figma.getNodeByIdAsync('199:2');
await ph.loadAsync();
const glyphs = {};
for (const c of ph.findAllWithCriteria({ types: ['COMPONENT'] })) glyphs[c.name.replace('phosphor/', '')] = c;

async function text(chars, style, color, width) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = chars;
  t.fills = [paint(color)];
  if (width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(width, t.height);
  }
  return t;
}
function glyph(name, size, color) {
  const g = glyphs[name].createInstance();
  g.rescale(size / g.width);
  for (const n of g.findAll((n) => 'fills' in n && Array.isArray(n.fills) && n.fills.length)) n.fills = [paint(color)];
  return g;
}
// A link chip: label and arrow, the label is a hyperlink to a node of the file (or a URL).
async function chip(label, target) {
  const c = figma.createAutoLayout('HORIZONTAL', {
    name: `Link · ${label}`,
    itemSpacing: 6,
    counterAxisAlignItems: 'CENTER'
  });
  c.paddingLeft = c.paddingRight = 12;
  c.paddingTop = c.paddingBottom = 6;
  c.fills = [paint('color/surface/default')];
  c.strokes = [paint('color/border/default')];
  c.setBoundVariable('topLeftRadius', V('radius/full'));
  c.setBoundVariable('topRightRadius', V('radius/full'));
  c.setBoundVariable('bottomLeftRadius', V('radius/full'));
  c.setBoundVariable('bottomRightRadius', V('radius/full'));
  const t = await text(label, 'typography/label/sm', 'color/content/link');
  t.setRangeHyperlink(
    0,
    label.length,
    target.startsWith('http') ? { type: 'URL', value: target } : { type: 'NODE', value: target }
  );
  c.appendChild(t);
  c.appendChild(glyph('arrow-up-right', 14, 'color/content/link'));
  return c;
}
// Instances with properties set by name (component property keys carry a #suffix).
function inst(setId, props = {}) {
  const set = SETS[setId];
  const i = set.defaultVariant.createInstance();
  const keys = Object.keys(i.componentProperties);
  const p = {};
  for (const [name, value] of Object.entries(props)) {
    const k = keys.find((k) => k === name || k.startsWith(name + '#'));
    if (!k) throw new Error(`no property ${name} on ${set.name}`);
    const swap = i.componentProperties[k].type === 'INSTANCE_SWAP';
    if (swap && !glyphs[value]) throw new Error('no glyph ' + value);
    p[k] = swap ? glyphs[value].id : value;
  }
  i.setProperties(p);
  return i;
}
function row(nodes, gap = 12) {
  const r = figma.createAutoLayout('HORIZONTAL', { itemSpacing: gap, counterAxisAlignItems: 'CENTER' });
  r.fills = [];
  for (const n of nodes) r.appendChild(n);
  return r;
}
function column(nodes, gap = 12) {
  const r = figma.createAutoLayout('VERTICAL', { itemSpacing: gap, counterAxisAlignItems: 'CENTER' });
  r.fills = [];
  for (const n of nodes) r.appendChild(n);
  return r;
}

// Cover cards: live instances on cards, some in another brand or appearance.
const B = '48:1586';
const IB = '211:1167';
const L = '232:659';
const SETS = {};
for (const id of [B, IB, L]) SETS[id] = await figma.getNodeByIdAsync(id);
const COVERS = {
  Actions: [
    [{}, () => inst(B, { Label: 'Create project', 'Show leading': true })],
    [
      { appearance: 'dark' },
      () =>
        row([
          inst(IB, { Icon: 'pencil-simple', Appearance: 'outline' }),
          inst(IB, { Icon: 'trash', Intent: 'danger', Appearance: 'outline' }),
          inst(IB, { Icon: 'heart', Intent: 'accent', Appearance: 'solid' })
        ])
    ],
    [
      { brand: 'brick' },
      () => row([inst(B, { Label: 'Cancel', Intent: 'neutral', Appearance: 'outline' }), inst(B, { Label: 'Save' })])
    ],
    [{}, () => inst(L, { Label: 'Read the guide' })],
    [
      { brand: 'orchid' },
      () =>
        column(
          [
            inst(B, { Label: 'Small', Size: 'sm' }),
            inst(B, { Label: 'Medium' }),
            inst(B, { Label: 'Large', Size: 'lg' })
          ],
          10
        )
    ],
    [{}, () => inst(B, { Label: 'Delete', Intent: 'danger', 'Show leading': true, 'Leading icon': 'trash' })],
    [
      { appearance: 'dark', brand: 'brick' },
      () => inst(B, { Label: 'Continue', Appearance: 'solid', State: 'loading' })
    ],
    [
      {},
      () =>
        row([
          inst(IB, { Icon: 'download-simple', Appearance: 'outline' }),
          inst(IB, { Icon: 'share-network', Appearance: 'outline' }),
          inst(IB, { Icon: 'gear-six', Appearance: 'outline' })
        ])
    ],
    [{ appearance: 'dark' }, () => inst(B, { Label: 'Learn more', Appearance: 'ghost', 'Show leading': true })],
    [{ brand: 'orchid' }, () => inst(IB, { Icon: 'heart', Intent: 'accent', Appearance: 'solid', Size: 'lg' })],
    [{}, () => inst(B, { Label: 'Focused', Appearance: 'outline', Focus: true })],
    [{ brand: 'brick' }, () => inst(L, { Label: 'Terms of service', Size: 'lg' })]
  ]
};
async function cover() {
  const box = figma.createFrame();
  box.name = 'Cover';
  box.resize(W - 2 * PAD, 520);
  box.clipsContent = true;
  box.fills = [paint('color/surface/muted')];
  box.cornerRadius = 24;
  const plane = figma.createFrame();
  plane.name = 'Isometric plane';
  plane.fills = [];
  plane.clipsContent = false;
  // Cards smaller than the box, enough of them to overflow it on every side once projected.
  const [CW, CH, G, COLS, ROWS, SCALE] = [380, 250, 44, 7, 6, 0.6];
  const items = COVERS[FAMILY];
  plane.resize(COLS * CW + (COLS - 1) * G, ROWS * CH + (ROWS - 1) * G);
  for (let i = 0; i < COLS * ROWS; i++) {
    const [ctx, make] = items[(i * 5 + Math.floor(i / COLS) * 3) % items.length];
    const card = figma.createAutoLayout('VERTICAL', {
      name: 'Card',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER'
    });
    card.primaryAxisSizingMode = card.counterAxisSizingMode = 'FIXED';
    card.resize(CW, CH);
    card.cornerRadius = 32;
    card.fills = [paint('color/surface/default')];
    await card.setEffectStyleIdAsync(shadow.id);
    if (ctx.brand)
      card.setExplicitVariableModeForCollection(COL('Foundations · Brand'), mode('Foundations · Brand', ctx.brand));
    if (ctx.appearance)
      card.setExplicitVariableModeForCollection(
        COL('Foundations · Appearance'),
        mode('Foundations · Appearance', ctx.appearance)
      );
    const content = make();
    card.appendChild(content);
    content.rescale(1.5);
    plane.appendChild(card);
    card.x = (i % COLS) * (CW + G);
    card.y = Math.floor(i / COLS) * (CH + G);
  }
  box.appendChild(plane);
  // Figma normalizes the scale out of relativeTransform: scale the plane and its content first, then project.
  plane.rescale(SCALE);
  // Isometric projection: the x axis runs up to the right, the y axis down to the right (30°).
  const [a, b, c, d] = [0.866, -0.5, 0.866, 0.5];
  const [cx, cy] = [plane.width / 2, plane.height / 2];
  const tx = box.width / 2 - (a * cx + c * cy);
  const ty = box.height / 2 - (b * cx + d * cy);
  plane.relativeTransform = [
    [a, c, tx],
    [b, d, ty]
  ];
  return box;
}

const page = await figma.getNodeByIdAsync(fam.page);
await figma.setCurrentPageAsync(page);
const out = { overview: null, cards: {}, headers: {}, moved: 0 };
const sections = {};
for (const [name] of fam.components) {
  sections[name] = page.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!sections[name]) throw new Error('no section ' + name);
}
const specRoot = {};
for (const [name, pid] of fam.components) {
  const p = await figma.getNodeByIdAsync(pid);
  await p.loadAsync();
  specRoot[name] = p.children.find((n) => n.name === `${name} — Specification`).id;
}

// 1. Overview frame at the top of the page.
for (const n of page.children.filter((n) => n.name === `${FAMILY} — Overview`)) n.remove();
const ov = figma.createAutoLayout('VERTICAL', { name: `${FAMILY} — Overview`, itemSpacing: 48 });
ov.paddingLeft = ov.paddingRight = PAD;
ov.paddingTop = ov.paddingBottom = 64;
ov.counterAxisSizingMode = 'FIXED';
ov.resize(W, ov.height);
ov.fills = [paint('wireframe/canvas')];
page.appendChild(ov);
const head = column([], 16);
head.counterAxisAlignItems = 'MIN';
head.appendChild(
  await text(`LIBRARY · ${fam.components.length} COMPONENTS`, 'typography/overline/md', 'color/content/tertiary')
);
head.appendChild(await text(FAMILY, 'typography/display/lg', 'color/content/primary'));
head.appendChild(await text(fam.description, 'typography/body/lg', 'color/content/secondary', 760));
ov.appendChild(head);
ov.appendChild(await cover());
const listHead = await text('Components', 'typography/heading/md', 'color/content/primary');
ov.appendChild(listHead);
const grid = figma.createAutoLayout('HORIZONTAL', { name: 'Components', itemSpacing: 24, counterAxisSpacing: 24 });
grid.layoutWrap = 'WRAP';
grid.fills = [];
ov.appendChild(grid);
grid.layoutSizingHorizontal = 'FILL';
const cardW = Math.floor((W - 2 * PAD - 2 * 24) / 3);
for (const [name, , summary, , sampleProps] of fam.components) {
  const card = figma.createAutoLayout('VERTICAL', { name, itemSpacing: 12 });
  card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 24;
  card.counterAxisSizingMode = 'FIXED';
  card.resize(cardW, card.height);
  card.cornerRadius = 20;
  card.fills = [paint('color/surface/default')];
  card.strokes = [paint('color/border/subtle')];
  grid.appendChild(card);
  const preview = figma.createAutoLayout('HORIZONTAL', {
    name: 'Preview',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER'
  });
  preview.fills = [paint('wireframe/hero')];
  preview.cornerRadius = 12;
  card.appendChild(preview);
  preview.layoutSizingHorizontal = 'FILL';
  preview.primaryAxisSizingMode = 'FIXED';
  preview.counterAxisSizingMode = 'FIXED';
  preview.resize(preview.width, 120);
  const set = sections[name].children.find((n) => n.type === 'COMPONENT_SET' && n.name === name);
  SETS[set.id] = set;
  const sample = inst(set.id, sampleProps);
  preview.appendChild(sample);
  sample.rescale(1.25);
  const title = await text(name, 'typography/heading/sm', 'color/content/primary');
  title.setRangeHyperlink(0, name.length, { type: 'NODE', value: sections[name].id });
  card.appendChild(title);
  const desc = await text(summary, 'typography/body/sm', 'color/content/secondary', cardW - 48);
  card.appendChild(desc);
  desc.layoutGrow = 1;
  card.appendChild(row([await chip('Master', sections[name].id), await chip('Specification', specRoot[name])], 8));
  out.cards[name] = card.id;
}
// Cards of one row share the tallest height; the links sit at the bottom.
const tallest = Math.max(...grid.children.map((c) => c.height));
for (const c of grid.children) {
  c.primaryAxisSizingMode = 'FIXED';
  c.resize(c.width, tallest);
}
ov.x = 0;
ov.y = 0;
out.overview = ov.id;

// 2. A header at the top of every section; the masters move down below it.
for (const [name, , summary, parts] of fam.components) {
  const s = sections[name];
  for (const n of s.children.filter((n) => n.name === 'Section header')) n.remove();
  const h = figma.createAutoLayout('HORIZONTAL', { name: 'Section header', itemSpacing: 64 });
  h.fills = [];
  s.appendChild(h);
  const left = figma.createAutoLayout('VERTICAL', { name: 'About', itemSpacing: 16 });
  left.fills = [];
  h.appendChild(left);
  left.appendChild(
    await text(`${FAMILY.toUpperCase()} · COMPONENT`, 'typography/overline/md', 'color/content/tertiary')
  );
  left.appendChild(await text(name, 'typography/display/sm', 'color/content/primary'));
  left.appendChild(await text(summary, 'typography/body/lg', 'color/content/secondary', 600));
  left.appendChild(row([await chip('Specification', specRoot[name]), await chip(`${FAMILY} overview`, ov.id)], 8));
  if (parts.length)
    left.appendChild(
      await text(
        `Internal parts in this section: ${parts.join(', ')}. They build the ${name} master; designers use the ${name} itself.`,
        'typography/caption/md',
        'color/content/tertiary',
        600
      )
    );
  // The properties a designer sets on an instance, read from the component set.
  const set = s.children.find((n) => n.type === 'COMPONENT_SET' && n.name === name);
  const props = figma.createAutoLayout('VERTICAL', { name: 'Properties', itemSpacing: 10 });
  props.paddingLeft = props.paddingRight = props.paddingTop = props.paddingBottom = 24;
  props.cornerRadius = 16;
  props.fills = [paint('wireframe/hero')];
  h.appendChild(props);
  props.appendChild(await text('Properties', 'typography/label/md', 'color/content/primary'));
  for (const [key, def] of Object.entries(set.componentPropertyDefinitions)) {
    const label = key.split('#')[0];
    const value =
      def.type === 'VARIANT'
        ? def.variantOptions.join(' · ')
        : def.type === 'BOOLEAN'
          ? 'on / off'
          : def.type === 'TEXT'
            ? 'text'
            : 'swap';
    const line = await text(`${label}   ${value}`, 'typography/body/sm', 'color/content/secondary', 400);
    line.setRangeFills(0, label.length, [paint('color/content/primary')]);
    props.appendChild(line);
  }
  h.x = SECTION_PAD;
  h.y = SECTION_PAD;
  const others = s.children.filter((n) => n !== h);
  const top = Math.min(...others.map((n) => n.y));
  const dy = SECTION_PAD + h.height + 72 - top;
  for (const n of others) {
    const locked = n.locked;
    n.locked = false;
    n.y += dy;
    n.locked = locked;
    out.moved++;
  }
  s.resizeWithoutConstraints(
    Math.max(...s.children.map((c) => c.x + c.width)) + SECTION_PAD,
    Math.max(...s.children.map((c) => c.y + c.height)) + SECTION_PAD
  );
  out.headers[name] = h.id;
}

// 3. Sections stack below the overview, in their current order.
let y = ov.height + GAP;
for (const s of page.children.filter((n) => n.type === 'SECTION').sort((p, q) => p.y - q.y)) {
  s.x = 0;
  s.y = y;
  y += s.height + GAP;
}
return out;
