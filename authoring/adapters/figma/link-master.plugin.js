// Link master builder (use_figma body), 2026-10-20 (replaces the version of 2026-10-19 whose modes were chosen by
// the designer). Rebuilds, on the page actions/link, the internal part “_Link/Destination” and the component set
// “Link” (Color × Size × State, 54 variants) with the properties Label and Focus and the exposed part Destination
// (variant Destination, text Meta, instance swap File icon), so that a designer configures a link from its
// properties only (user decision, 2026-10-20). The glyphs sit directly in the part, sized by the link's font size:
// each destination imposes its glyph, and only the file destination offers the File icon property for the format
// (2026-10-26: a nested Icon would expose its Size). The code's link takes the font and, with tone inherit, the color of
// its context; in Figma each Link variant sets the modes of two hidden adapter collections on itself, which the
// label and the nested part resolve, as the Button variants set their style and state modes:
//   Components · link size   modes md (default), sm, lg: link/font-family, link/font-weight, link/font-size,
//                            link/line-height, link/letter-spacing, aliases of typography/body/{size}/*;
//   Components · link color  modes accent (default), on-info, on-success, on-warning, on-danger, on-inverse:
//                            link/content (label), link/quiet (meta and glyph), link/indicator-opacity.
// Color accent is tone accent; “on …” is tone inherit inside that context. Rerunning removes the previous set,
// part, specification frame and adapter collections (including those of the 2026-10-19 version) first.
figma.skipInvisibleInstanceChildren = false;
const page = figma.root.children.find((p) => p.name === 'actions/link');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) =>
  ['Link', '_Link/Destination', '_Backdrop on inverse', 'Link — Specification'].includes(n.name)
))
  n.remove();
let cols = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of cols.filter((c) => c.name.startsWith('Components · link '))) c.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const collection = (name, modes) => {
  const c = figma.variables.createVariableCollection(name);
  c.renameMode(c.modes[0].modeId, modes[0]);
  for (const m of modes.slice(1)) c.addMode(m);
  c.hiddenFromPublishing = true;
  return c;
};
const variable = (c, name, type, scopes, valueOf) => {
  const v = figma.variables.createVariable(name, c, type);
  v.scopes = scopes;
  v.hiddenFromPublishing = true;
  for (const m of c.modes) {
    const val = valueOf(m.name);
    v.setValueForMode(m.modeId, typeof val === 'number' ? val : figma.variables.createVariableAlias(V(val)));
  }
  return v;
};
const SIZES = ['md', 'sm', 'lg'];
const sizeC = collection('Components · link size', SIZES);
const T = {};
for (const [k, scopes] of [
  ['fontFamily', ['FONT_FAMILY']],
  ['fontWeight', ['FONT_WEIGHT']],
  ['fontSize', ['FONT_SIZE', 'WIDTH_HEIGHT']],
  ['lineHeight', ['LINE_HEIGHT', 'WIDTH_HEIGHT']],
  ['letterSpacing', ['LETTER_SPACING']]
])
  T[k] = variable(
    sizeC,
    'link/' + k.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase()),
    k === 'fontFamily' ? 'STRING' : 'FLOAT',
    scopes,
    (m) => `typography/body/${m}/${k}`
  );
const COLORS = ['accent', 'on-info', 'on-success', 'on-warning', 'on-danger', 'on-inverse'];
const colorC = collection('Components · link color', COLORS);
const context = (m) => (m === 'on-inverse' ? 'color/content/inverse' : `color/status/${m.replace('on-', '')}/content`);
const content = variable(colorC, 'link/content', 'COLOR', ['TEXT_FILL'], (m) =>
  m === 'accent' ? 'color/content/link' : context(m)
);
const quiet = variable(colorC, 'link/quiet', 'COLOR', ['TEXT_FILL', 'SHAPE_FILL'], (m) =>
  m === 'accent' ? 'color/content/tertiary' : context(m)
);
// Figma reads an opacity binding as a percentage: 100 for the accent tone, opacity/muted (70) for tone inherit.
const opacity = variable(colorC, 'link/indicator-opacity', 'FLOAT', ['OPACITY'], (m) =>
  m === 'accent' ? 100 : 'opacity/muted'
);

const paint = (v) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const GLYPHS = {
  external: '200:4471', // arrow-up-right
  email: '200:4873', // envelope
  phone: '200:5423', // phone
  file: '200:4959', // file-pdf (the default meta is a PDF)
  print: '200:5463' // printer
};
const typeset = (t, chars) => {
  t.fontName = { family: 'Inter', style: 'Regular' };
  t.characters = chars;
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  for (const [f, v] of Object.entries(T)) t.setBoundVariable(f, v);
  t.leadingTrim = 'CAP_HEIGHT';
};

// ---- Part: what follows the label, per destination ----
const parts = [];
for (const d of ['page', 'external', 'email', 'phone', 'file', 'print']) {
  const p = figma.createComponent();
  p.name = `Destination=${d}`;
  p.layoutMode = 'HORIZONTAL';
  p.primaryAxisSizingMode = 'AUTO';
  p.counterAxisSizingMode = 'AUTO';
  p.counterAxisAlignItems = 'CENTER';
  p.itemSpacing = 0;
  p.fills = [];
  p.clipsContent = false;
  // An empty auto-layout frame keeps a 100 px width: the page part is fixed at 0.01 px wide instead.
  if (d === 'page') {
    p.primaryAxisSizingMode = 'FIXED';
    p.counterAxisSizingMode = 'FIXED';
    p.resize(0.01, 16);
  }
  if (d === 'file') {
    const meta = figma.createText();
    meta.name = 'Meta';
    typeset(meta, ' (PDF, 2.4 MB)');
    meta.fills = [paint(quiet)];
    p.appendChild(meta);
  }
  if (d !== 'page') {
    const ind = figma.createAutoLayout('HORIZONTAL', { name: 'Indicator', itemSpacing: 0 });
    ind.fills = [];
    ind.clipsContent = false;
    ind.counterAxisAlignItems = 'CENTER';
    ind.setBoundVariable('paddingLeft', V('space/content/xs'));
    p.appendChild(ind);
    const icon = (await figma.getNodeByIdAsync(GLYPHS[d])).createInstance();
    icon.name = 'Indicator icon';
    ind.appendChild(icon);
    icon.setBoundVariable('width', T.fontSize);
    icon.setBoundVariable('height', T.fontSize);
    icon.setBoundVariable('opacity', opacity);
    for (const v of icon.findAll((n) => n.type === 'VECTOR')) v.fills = [paint(quiet)];
  }
  parts.push(p);
}
const part = figma.combineAsVariants(parts, page);
part.name = '_Link/Destination';
part.description =
  'Internal part of Link: what follows the label for each destination (page: nothing; external, email, phone, print: the glyph; file: the format and size, then the glyph of the format, chosen with File icon). Its colors and sizes come from the Link variant that holds it. Do not use on its own.';
const META = part.addComponentProperty('Meta', 'TEXT', ' (PDF, 2.4 MB)');
const FILE_ICON = part.addComponentProperty('File icon', 'INSTANCE_SWAP', GLYPHS.file);
for (const v of part.children) {
  const meta = v.findOne((n) => n.name === 'Meta');
  if (meta) meta.componentPropertyReferences = { characters: META };
  const icon = v.name === 'Destination=file' && v.findOne((n) => n.name === 'Indicator icon');
  if (icon) {
    icon.componentPropertyReferences = { mainComponent: FILE_ICON };
    // Binding the swap property may drop the glyph color override: set it again.
    for (const g of icon.findAll((n) => n.type === 'VECTOR')) g.fills = [paint(quiet)];
  }
}
part.children.forEach((v, k) => {
  v.x = 40 + k * 240;
  v.y = 40;
});
part.resizeWithoutConstraints(40 + 6 * 240, 100);
part.fills = [];
const pagePart = part.children.find((v) => v.name === 'Destination=page');

// ---- Link ----
const comps = [];
const COLOR_NAME = (m) => m.replace('-', ' ');
for (const c of COLORS)
  for (const st of ['default', 'hover', 'pressed'])
    for (const s of SIZES) {
      const root = figma.createComponent();
      root.name = `Color=${COLOR_NAME(c)}, Size=${s}, State=${st}`;
      root.layoutMode = 'HORIZONTAL';
      root.primaryAxisSizingMode = 'AUTO';
      root.counterAxisSizingMode = 'AUTO';
      root.counterAxisAlignItems = 'CENTER';
      root.itemSpacing = 0;
      root.fills = [];
      root.clipsContent = false;
      root.setExplicitVariableModeForCollection(sizeC, sizeC.modes.find((m) => m.name === s).modeId);
      root.setExplicitVariableModeForCollection(colorC, colorC.modes.find((m) => m.name === c).modeId);
      root.setBoundVariable('minHeight', T.lineHeight);
      for (const k of RADII) root.setBoundVariable(k, V('radius/indicator'));
      const label = figma.createText();
      label.name = 'Label';
      typeset(label, 'Read the guide');
      label.fills = [paint(content)];
      label.textDecoration = 'UNDERLINE';
      label.textDecorationSkipInk = true;
      label.textDecorationOffset = { unit: 'AUTO' };
      label.textDecorationColor = { value: 'AUTO' };
      // Figma refuses a variable on the underline thickness: the values of border/width/default and /strong.
      label.textDecorationThickness = { unit: 'PIXELS', value: st === 'default' ? 1 : 2 };
      root.appendChild(label);
      const dest = pagePart.createInstance();
      dest.name = 'Destination';
      root.appendChild(dest);
      const ring = figma.createFrame();
      ring.name = 'Focus ring';
      ring.fills = [];
      root.appendChild(ring);
      ring.layoutPositioning = 'ABSOLUTE';
      ring.x = -2;
      ring.y = -2;
      ring.resize(root.width + 4, root.height + 4);
      ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      ring.strokes = [paint(V('color/focus/ring'))];
      ring.strokeAlign = 'OUTSIDE';
      for (const k of STROKES) ring.setBoundVariable(k, V('focus/width'));
      for (const k of RADII) ring.setBoundVariable(k, V('radius/indicator'));
      ring.visible = false;
      comps.push(root);
    }
const set = figma.combineAsVariants(comps, page);
set.name = 'Link';
set.description =
  'A link to another page, a file, an email address, a phone number or a printable version, shown as underlined text. Source of truth: foundations/components/actions/link/contract.json; implementation: packages/svelte/src/components/link. Color accent (default) is the link color; “on info”, “on success”, “on warning”, “on danger” and “on inverse” take the color of the text of that context (tone inherit in code), for status messages and inverse surfaces. Size is the size of the body text around the link. State shows the underline: 1 px, 2 px when hovered or pressed; Focus shows the keyboard focus ring. Destination (in the nested Destination part) adds what the reader needs to know before following it: an arrow for external pages, an envelope, a handset, a printer, a file glyph with its format and size (Meta).';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Read the guide');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
  v.findOne((n) => n.name === 'Destination').isExposedInstance = true;
}
// Rows Color × State, columns Size (md first: the top-left default is accent · md · default).
const GAP = 40,
  COL = 200,
  ROW = 48;
set.children.forEach((v, k) => {
  const row = Math.floor(k / 3);
  v.x = GAP + (k % 3) * COL;
  v.y = GAP + row * ROW + Math.floor(row / 3) * 24;
});
set.resizeWithoutConstraints(GAP * 2 + 3 * COL, GAP * 2 + 18 * ROW + 5 * 24);
set.fills = [];
set.x = 0;
set.y = 0;
part.x = set.width + 80;
part.y = 0;
// A locked page backdrop in color/surface/inverse behind the “on inverse” rows, so that they read on the canvas.
const inverseRows = set.children.filter((c) => c.name.startsWith('Color=on inverse'));
const top = Math.min(...inverseRows.map((r) => r.y)) - 16;
const backdrop = figma.createRectangle();
backdrop.name = '_Backdrop on inverse';
backdrop.resize(set.width - 32, Math.max(...inverseRows.map((r) => r.y + r.height)) + 16 - top);
backdrop.x = set.x + 16;
backdrop.y = set.y + top;
backdrop.cornerRadius = 8;
backdrop.fills = [paint(V('color/surface/inverse'))];
backdrop.locked = true;
page.insertChild(page.children.indexOf(set), backdrop);
return {
  set: set.id,
  part: part.id,
  collections: { size: sizeC.id, color: colorC.id },
  variables: Object.fromEntries(
    [...Object.entries(T), ['content', content], ['quiet', quiet], ['opacity', opacity]].map(([k, v]) => [k, v.id])
  ),
  props: Object.keys(set.componentPropertyDefinitions),
  partProps: Object.keys(part.componentPropertyDefinitions),
  defaultVariant: set.defaultVariant.name,
  pageWidth: pagePart.width,
  parts: Object.fromEntries(part.children.map((c) => [c.name, c.id])),
  variants: Object.fromEntries(set.children.map((c) => [c.name.replace(/\w+=/g, ''), c.id]))
};
