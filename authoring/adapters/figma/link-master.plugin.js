// Link master builder (use_figma body), 2026-10-19.
// Creates (or reuses) the page actions/link after actions/icon-button, two hidden adapter collections and the
// component set “Link” (Tone × Destination × State, 36 variants) with the properties Label, Meta and Focus.
// The code's link is inline text that takes the font and, with tone inherit, the color of its context; Figma has
// no inheritance, so the context is a variable mode chosen on the instance:
//   Components · link text     modes body-md (default), body-sm, body-lg, label-sm, label-md, label-lg, caption-md:
//                              link/font-family, link/font-weight, link/font-size, link/line-height,
//                              link/letter-spacing, aliases of typography/{role}/*;
//   Components · link context  modes primary (default), secondary, tertiary, info, success, warning, danger,
//                              inverse: link/context, alias of the matching content color.
// Every visual property is bound to a variable, except the underline thickness when Figma refuses the binding
// (the script reports it). Rerunning replaces the set; the collections are reused.
figma.skipInvisibleInstanceChildren = false;
let page = figma.root.children.find((p) => p.name === 'actions/link');
if (!page) {
  page = figma.createPage();
  page.name = 'actions/link';
  const after = figma.root.children.findIndex((p) => p.name === 'actions/icon-button');
  figma.root.insertChild(after + 1, page);
}
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'COMPONENT_SET' && n.name === 'Link')) n.remove();

let cols = await figma.variables.getLocalVariableCollectionsAsync();
let vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const collection = (name, modes) => {
  let c = cols.find((x) => x.name === name);
  if (!c) {
    c = figma.variables.createVariableCollection(name);
    c.renameMode(c.modes[0].modeId, modes[0]);
  }
  for (const m of modes) if (!c.modes.some((x) => x.name === m)) c.addMode(m);
  c.hiddenFromPublishing = true;
  c.setDefaultMode(c.modes.find((x) => x.name === modes[0]).modeId);
  return c;
};
const variable = (c, name, type, scopes, valueOf) => {
  let v = vars.find((x) => x.name === name && x.variableCollectionId === c.id);
  if (!v) v = figma.variables.createVariable(name, c, type);
  v.scopes = scopes;
  v.hiddenFromPublishing = true;
  for (const m of c.modes) v.setValueForMode(m.modeId, figma.variables.createVariableAlias(V(valueOf(m.name))));
  return v;
};
const ROLES = ['body-md', 'body-sm', 'body-lg', 'label-sm', 'label-md', 'label-lg', 'caption-md'];
const textC = collection('Components · link text', ROLES);
const role = (m) => m.replace('-', '/');
const T = {
  fontFamily: variable(textC, 'link/font-family', 'STRING', ['FONT_FAMILY'], (m) => `typography/${role(m)}/fontFamily`),
  fontWeight: variable(textC, 'link/font-weight', 'FLOAT', ['FONT_WEIGHT'], (m) => `typography/${role(m)}/fontWeight`),
  fontSize: variable(
    textC,
    'link/font-size',
    'FLOAT',
    ['FONT_SIZE', 'WIDTH_HEIGHT'],
    (m) => `typography/${role(m)}/fontSize`
  ),
  lineHeight: variable(
    textC,
    'link/line-height',
    'FLOAT',
    ['LINE_HEIGHT', 'WIDTH_HEIGHT'],
    (m) => `typography/${role(m)}/lineHeight`
  ),
  letterSpacing: variable(
    textC,
    'link/letter-spacing',
    'FLOAT',
    ['LETTER_SPACING'],
    (m) => `typography/${role(m)}/letterSpacing`
  )
};
const CONTEXTS = {
  primary: 'color/content/primary',
  secondary: 'color/content/secondary',
  tertiary: 'color/content/tertiary',
  info: 'color/status/info/content',
  success: 'color/status/success/content',
  warning: 'color/status/warning/content',
  danger: 'color/status/danger/content',
  inverse: 'color/content/inverse'
};
const ctxC = collection('Components · link context', Object.keys(CONTEXTS));
const context = variable(ctxC, 'link/context', 'COLOR', ['TEXT_FILL', 'SHAPE_FILL'], (m) => CONTEXTS[m]);
vars = await figma.variables.getLocalVariablesAsync();

const paint = (v) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
for (const style of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style });
const iconMd = await figma.getNodeByIdAsync('149:11');
const iconSet = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const GLYPHS = {
  external: '200:4471', // arrow-up-right
  email: '200:4873', // envelope
  phone: '200:5423', // phone
  file: '200:4959', // file-pdf (the default meta is a PDF)
  print: '200:5463' // printer
};
const unbound = new Set();
const typeset = (t, chars) => {
  t.fontName = { family: 'Inter', style: 'Regular' };
  t.characters = chars;
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  for (const [f, v] of Object.entries(T)) t.setBoundVariable(f, v);
  t.leadingTrim = 'CAP_HEIGHT';
};
const D = ['page', 'external', 'email', 'phone', 'file', 'print'];
const comps = [];
for (const tone of ['accent', 'inherit'])
  for (const st of ['default', 'hover', 'pressed'])
    for (const d of D) {
      const c = figma.createComponent();
      c.name = `Tone=${tone}, Destination=${d}, State=${st}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
      c.counterAxisAlignItems = 'CENTER';
      c.itemSpacing = 0;
      c.fills = [];
      c.clipsContent = false;
      c.setBoundVariable('minHeight', T.lineHeight);
      for (const k of RADII) c.setBoundVariable(k, V('radius/indicator'));
      const main = tone === 'accent' ? V('color/content/link') : context;
      const quiet = tone === 'accent' ? V('color/content/tertiary') : context;

      const label = figma.createText();
      label.name = 'Label';
      typeset(label, 'Read the guide');
      label.fills = [paint(main)];
      label.textDecoration = 'UNDERLINE';
      label.textDecorationSkipInk = true;
      label.textDecorationOffset = { unit: 'AUTO' };
      label.textDecorationColor = { value: 'AUTO' };
      const width = st === 'default' ? 'border/width/default' : 'border/width/strong';
      label.textDecorationThickness = { unit: 'PIXELS', value: st === 'default' ? 1 : 2 };
      try {
        label.setBoundVariable('textDecorationThickness', V(width));
      } catch (e) {
        unbound.add('textDecorationThickness: ' + e.message.slice(0, 80));
      }
      c.appendChild(label);

      if (d === 'file') {
        const meta = figma.createText();
        meta.name = 'Meta';
        typeset(meta, ' (PDF, 2.4 MB)');
        meta.fills = [paint(quiet)];
        meta.textDecoration = 'NONE';
        c.appendChild(meta);
      }
      if (d !== 'page') {
        const ind = figma.createAutoLayout('HORIZONTAL', { name: 'Indicator', itemSpacing: 0 });
        ind.fills = [];
        ind.clipsContent = false;
        ind.counterAxisAlignItems = 'CENTER';
        ind.setBoundVariable('paddingLeft', V('space/content/xs'));
        c.appendChild(ind);
        const icon = iconMd.createInstance();
        icon.name = 'Indicator icon';
        ind.appendChild(icon);
        icon.setProperties({ [GLYPH]: GLYPHS[d] });
        icon.setBoundVariable('width', T.fontSize);
        icon.setBoundVariable('height', T.fontSize);
        for (const v of icon.findAll((n) => n.type === 'VECTOR')) v.fills = [paint(quiet)];
        if (tone === 'inherit') icon.setBoundVariable('opacity', V('opacity/muted'));
      }
      const ring = figma.createFrame();
      ring.name = 'Focus ring';
      ring.fills = [];
      c.appendChild(ring);
      ring.layoutPositioning = 'ABSOLUTE';
      ring.x = -2;
      ring.y = -2;
      ring.resize(c.width + 4, c.height + 4);
      ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      ring.strokes = [paint(V('color/focus/ring'))];
      ring.strokeAlign = 'OUTSIDE';
      for (const k of STROKES) ring.setBoundVariable(k, V('focus/width'));
      for (const k of RADII) ring.setBoundVariable(k, V('radius/indicator'));
      ring.visible = false;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, page);
set.name = 'Link';
set.description =
  'A link to another page, a file, an email address, a phone number or a printable version, shown as underlined text. Source of truth: foundations/components/actions/link/contract.json; implementation: packages/svelte/src/components/link. Tone accent (default) draws the label in the link color; tone inherit takes the color of the surrounding text, for status messages and inverse surfaces. Destination adds what the reader needs to know before following it: an arrow for external pages, an envelope, a handset, a printer, a file glyph with its format and size (Meta). The link takes the font of its text: choose the mode of “Components · link text” on the instance (body md by default) and, with tone inherit, the mode of “Components · link context” (primary by default). State shows the underline: 1 px, 2 px when hovered or pressed; Focus shows the keyboard focus ring.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Read the guide');
const META = set.addComponentProperty('Meta', 'TEXT', ' (PDF, 2.4 MB)');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  const meta = v.findOne((n) => n.name === 'Meta');
  if (meta) meta.componentPropertyReferences = { characters: META };
  v.findOne((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
  const icon = v.findOne((n) => n.name === 'Indicator icon');
  if (icon) icon.isExposedInstance = true;
}
// Rows Tone × State, columns Destination (the top-left default is accent · page · default); the file column is
// wider for its meta.
const GAP = 40,
  ROW = 56,
  X = [0, 240, 480, 720, 960, 1260];
set.children.forEach((v, k) => {
  v.x = GAP + X[k % 6];
  v.y = GAP + Math.floor(k / 6) * ROW + (k >= 18 ? GAP : 0);
});
set.resizeWithoutConstraints(Math.max(...set.children.map((v) => v.x + v.width)) + GAP, GAP * 3 + 6 * ROW - 24);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  collections: { text: textC.id, context: ctxC.id },
  variables: Object.fromEntries([...Object.entries(T).map(([k, v]) => [k, v.id]), ['context', context.id]]),
  props: Object.keys(set.componentPropertyDefinitions),
  defaultVariant: set.defaultVariant.name,
  unbound: [...unbound],
  variants: Object.fromEntries(set.children.map((c) => [c.name.replace(/\w+=/g, ''), c.id]))
};
