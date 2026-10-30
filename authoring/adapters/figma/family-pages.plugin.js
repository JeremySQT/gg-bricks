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
  },
  Content: {
    page: '343:1635',
    description:
      'Components that show information inside other components or in running text: an icon, a count, a status or a keyboard shortcut. None of them is interactive on its own.',
    components: [
      [
        'Badge',
        '220:2',
        'Labels an item with a short status or category: Paid, Draft, New.',
        [],
        { Label: 'Paid', Intent: 'success' }
      ],
      [
        'Counter',
        '149:1547',
        'Shows a quantity, such as unread messages, next to the thing it counts.',
        ['_Counter/Nested'],
        {}
      ],
      [
        'Icon',
        '149:4',
        'Shows a small drawing from the icon set, in the color of the text around it.',
        [],
        { Size: 'xl', Glyph: 'star' }
      ],
      [
        'Shortcut',
        '149:1569',
        'Shows the keys of a keyboard command next to the action it triggers.',
        ['_Shortcut/Key', '_Shortcut/Separator', '_Shortcut/Nested'],
        { Appearance: 'Keycap' }
      ]
    ]
  },
  Forms: {
    page: '343:1640',
    description:
      'Components that collect what people type or choose: text entries, choices and settings. A Field gives each control its label, its help text and its error message.',
    components: [
      [
        'Checkbox',
        '288:3',
        'Turns one option on or off, for a choice confirmed when the form is submitted.',
        ['_Checkbox/Check', '_Checkbox/Minus'],
        { Selection: 'on' }
      ],
      [
        'CheckboxGroup',
        '347:243',
        'Gathers related checkboxes that answer one question; any number of them can be checked.',
        [],
        {}
      ],
      ['Field', '288:4', 'Gives one form control its label, description, required asterisk and error message.', [], {}],
      ['InputText', '288:5', 'Takes one line of free text: a name, an email address, a search.', [], {}],
      ['Radio', '288:6', 'One option of a RadioGroup, never used on its own.', [], { Selection: 'on' }],
      ['RadioGroup', '288:7', 'Asks for exactly one choice among a few options that all stay visible.', [], {}],
      ['Switch', '288:8', 'Turns a setting on or off, with immediate effect.', [], { Selection: 'on' }],
      ['Textarea', '288:9', 'Takes free text on several lines: a comment, a description, an address.', [], {}]
    ]
  }
};
const fam = FAMILIES[FAMILY];
const W = 1232;
const PAD = 72;
const SECTION_PAD = 80;
const GAP = 160;
// Largest enlargement of the cover content and of the card previews: Content's components are small boxes.
const ZOOM = { Actions: [1.5, 1.25], Content: [2.6, 2], Forms: [1.5, 1.25] }[FAMILY];

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
// SETS maps a component name of the family to its component set (filled from the sections below).
function inst(name, props = {}) {
  const set = SETS[name];
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

// Scales an instance (or a row of them) up to `max`, never beyond the box it must fit in.
function fit(node, max, w, h) {
  node.rescale(Math.min(max, w / node.width, h / node.height));
}

// Packs the variants of an internal set into a tight grid: columns and rows keep their order (the top-left variant
// stays the default), the space between them becomes `gap`.
function packVariants(set, gap) {
  const kids = set.children;
  const [padX, padY] = [Math.min(...kids.map((k) => k.x)), Math.min(...kids.map((k) => k.y))];
  const axis = (pos, size) => {
    const keys = [...new Set(kids.map((k) => Math.round(k[pos])))].sort((a, b) => a - b);
    const at = {};
    let cursor = pos === 'x' ? padX : padY;
    for (const key of keys) {
      at[key] = cursor;
      cursor += Math.max(...kids.filter((k) => Math.round(k[pos]) === key).map((k) => k[size])) + gap;
    }
    return at;
  };
  const [xs, ys] = [axis('x', 'width'), axis('y', 'height')];
  for (const k of kids) {
    const [x, y] = [xs[Math.round(k.x)], ys[Math.round(k.y)]];
    k.x = x;
    k.y = y;
  }
  set.resizeWithoutConstraints(
    Math.max(...kids.map((k) => k.x + k.width)) + padX,
    Math.max(...kids.map((k) => k.y + k.height)) + padY
  );
}

// Cover cards: live instances on cards, some in another brand or appearance.
const [B, IB, L] = ['Button', 'IconButton', 'Link'];
const SETS = {};
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
  ],
  Content: [
    [
      {},
      () =>
        row(
          [
            inst('Badge', { Label: 'Paid', Intent: 'success' }),
            inst('Badge', { Label: 'Draft' }),
            inst('Badge', { Label: 'Overdue', Intent: 'danger', Appearance: 'strong' })
          ],
          8
        )
    ],
    [{ appearance: 'dark' }, () => inst('Shortcut', { Appearance: 'Keycap', Size: 'lg' })],
    [
      { brand: 'brick' },
      () =>
        row([
          inst('Counter', { Size: 'sm' }),
          inst('Counter', { Value: '24' }),
          inst('Counter', { Value: '128', Size: 'lg' })
        ])
    ],
    [
      {},
      () =>
        row(
          ['heart', 'bell', 'star', 'user', 'calendar-blank'].map((g) => inst('Icon', { Glyph: g, Size: 'lg' })),
          16
        )
    ],
    [
      { brand: 'orchid' },
      () =>
        inst('Badge', {
          Label: 'New',
          Intent: 'accent',
          Appearance: 'strong',
          'Show leading': true,
          'Leading icon': 'star',
          Size: 'lg'
        })
    ],
    [
      { appearance: 'dark', brand: 'orchid' },
      () =>
        column(
          [
            inst('Badge', { Label: 'Info', Intent: 'info' }),
            inst('Badge', { Label: 'Success', Intent: 'success' }),
            inst('Badge', { Label: 'Warning', Intent: 'warning' })
          ],
          10
        )
    ],
    [{}, () => inst('Shortcut', { Platform: 'Other', 'Show key 3': true, Size: 'lg' })],
    [{ brand: 'brick' }, () => inst('Counter', { Overflow: 'true', Size: 'lg' })],
    [{ appearance: 'dark', brand: 'brick' }, () => inst('Icon', { Glyph: 'bell', Size: 'xl' })],
    [
      {},
      () =>
        column(
          [
            inst('Badge', { Label: 'Beta', Intent: 'accent', Size: 'sm' }),
            inst('Badge', { Label: 'Beta', Intent: 'accent' }),
            inst('Badge', { Label: 'Beta', Intent: 'accent', Size: 'lg' })
          ],
          10
        )
    ],
    [{ brand: 'orchid' }, () => inst('Shortcut', { Appearance: 'Keycap', Platform: 'Other' })],
    [
      { appearance: 'dark' },
      () => row([inst('Icon', { Glyph: 'envelope-simple', Size: 'lg' }), inst('Counter', { Value: '3' })], 10)
    ]
  ],
  Forms: [
    [{}, () => inst('Field')],
    [{ appearance: 'dark' }, () => inst('Switch', { Label: 'Notifications', Selection: 'on' })],
    [{ brand: 'brick' }, () => inst('Checkbox', { Label: 'Remember me', Selection: 'on' })],
    [
      {},
      () =>
        inst('InputText', {
          'Show leading': true,
          'Leading icon': 'magnifying-glass',
          Content: 'value',
          Value: 'Lisbon'
        })
    ],
    [{ brand: 'orchid' }, () => inst('RadioGroup')],
    [{}, () => inst('Checkbox', { Label: 'Select all', Selection: 'indeterminate' })],
    [{ appearance: 'dark', brand: 'orchid' }, () => inst('InputText', { Content: 'value' })],
    [
      {},
      () =>
        column([inst('Switch', { Label: 'Dark mode' }), inst('Switch', { Label: 'Auto-renew', Selection: 'on' })], 12)
    ],
    [{ brand: 'brick' }, () => inst('Field', { State: 'invalid' })],
    [{ appearance: 'dark', brand: 'brick' }, () => inst('CheckboxGroup')],
    [{}, () => inst('Textarea', { Content: 'value' })],
    [
      { appearance: 'dark' },
      () => column([inst('Radio', { Label: 'Standard', Selection: 'on' }), inst('Radio', { Label: 'Express' })], 12)
    ]
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
    fit(content, ZOOM[0], CW - 56, CH - 56);
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
  SETS[name] = sections[name].children.find((n) => n.type === 'COMPONENT_SET' && n.name === name);
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
  const sample = inst(name, sampleProps);
  preview.appendChild(sample);
  fit(sample, ZOOM[1], preview.width - 32, 96);
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
  left.appendChild(row([await chip('Specification', specRoot[name])], 8));
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
            : def.type === 'SLOT'
              ? 'slot'
              : 'swap';
    const line = await text(`${label}   ${value}`, 'typography/body/sm', 'color/content/secondary', 400);
    line.setRangeFills(0, label.length, [paint('color/content/primary')]);
    props.appendChild(line);
  }
  h.x = SECTION_PAD;
  h.y = SECTION_PAD;
  // Compact layout under the header: the master on the left with what is drawn over it (the Link's backdrop), the
  // internal parts stacked on its right, each internal set packed as a tight grid.
  const top = SECTION_PAD + h.height + 72;
  const others = s.children.filter((n) => n !== h && n !== set);
  const over = (n) =>
    n.x < set.x + set.width && n.x + n.width > set.x && n.y < set.y + set.height && n.y + n.height > set.y;
  const attached = others.filter(over);
  const internals = others.filter((n) => !attached.includes(n)).sort((p, q) => p.y - q.y || p.x - q.x);
  const move = (n, x, y) => {
    const locked = n.locked;
    n.locked = false;
    n.x = x;
    n.y = y;
    n.locked = locked;
    out.moved++;
  };
  const [dx, dy] = [SECTION_PAD - set.x, top - set.y];
  for (const n of attached) move(n, n.x + dx, n.y + dy);
  move(set, SECTION_PAD, top);
  let py = top;
  for (const p of internals) {
    if (p.type === 'COMPONENT_SET') packVariants(p, 32);
    move(p, set.x + set.width + 120, py);
    py += p.height + 64;
  }
  s.resizeWithoutConstraints(
    Math.max(...s.children.map((c) => c.x + c.width)) + SECTION_PAD,
    Math.max(...s.children.map((c) => c.y + c.height)) + SECTION_PAD
  );
  out.headers[name] = h.id;
}

// 3. Sections stack below the overview, in the order of the list.
let y = ov.height + GAP;
for (const s of fam.components.map(([name]) => sections[name])) {
  s.x = 0;
  s.y = y;
  y += s.height + GAP;
}
return out;
