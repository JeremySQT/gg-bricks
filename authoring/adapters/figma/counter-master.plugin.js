// Counter master builder (use_figma body), 2026-10-14. Creates the page content/counter after actions/button
// (144:2), the hidden Components collection with counter/foreground (alias of
// color/content/primary) and the component set Counter: variants Size (sm, md, lg) × Overflow (false, true), text
// properties Value (default 8) and Overflow text (default 99+). Every visual property is bound to a variable looked
// up by collection and name; no ID is guessed. Rerunning the script replaces the set (the page and the adapter
// collection are reused). The IDs it returns are recorded in reports/components/counter/figma/ledger.json.
figma.skipInvisibleInstanceChildren = false;
let page = figma.root.children.find((p) => p.name === 'content/counter');
if (!page) {
  page = figma.createPage();
  page.name = 'content/counter';
}
const btnPage = figma.root.children.find((p) => p.id === '144:2');
figma.root.insertChild(figma.root.children.indexOf(btnPage) + 1, page);
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'COMPONENT_SET' && n.name === 'Counter')) n.remove();
for (const n of page.children.filter((n) => n.type === 'COMPONENT' && n.name.startsWith('Size='))) n.remove();

const cols = await figma.variables.getLocalVariableCollectionsAsync();
let vars = await figma.variables.getLocalVariablesAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const V = (name, colName) => {
  const v = vars.find((x) => x.name === name && (!colName || x.variableCollectionId === col(colName).id));
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
// Hidden adapter collection: the Button later overrides the binding with button/foreground on its instance.
// Since 2026-10-14 every component adapter variable lives in the single hidden collection “Components”
// (modes sm, md, lg): counter/foreground carries the same alias in the three modes.
let ac = col('Components');
if (!ac) {
  ac = figma.variables.createVariableCollection('Components');
  ac.hiddenFromPublishing = true;
  ac.renameMode(ac.modes[0].modeId, 'sm');
  ac.addMode('md');
  ac.addMode('lg');
  ac.setDefaultMode(ac.modes[1].modeId);
}
let fg = vars.find((v) => v.name === 'counter/foreground' && v.variableCollectionId === ac.id);
if (!fg) fg = figma.variables.createVariable('counter/foreground', ac, 'COLOR');
fg.scopes = ['TEXT_FILL', 'SHAPE_FILL'];
fg.hiddenFromPublishing = true;
for (const m of ac.modes)
  fg.setValueForMode(m.modeId, figma.variables.createVariableAlias(V('color/content/primary', 'Appearance')));
// Tint opacity: Figma reads an opacity binding as a percentage; the token sync emits opacity variables ×100
// (opacity/tint = 12 since 2026-10-14), so the Tint layer binds opacity/tint directly.
const bo = V('opacity/tint', 'Brand');

await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === n);
const paint = (v) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
const SIZES = ['sm', 'md', 'lg'];
const make = async (size, overflow) => {
  const c = figma.createComponent();
  c.name = `Size=${size}, Overflow=${overflow}`;
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  // Height bound to the line box: Figma rounds a text layer's auto height to whole pixels (16 for 15.4), so the
  // container cannot hug the text and keep the browser's 15.4 / 16.8 / 19.6 px.
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.paddingTop = 0;
  c.paddingBottom = 0;
  c.itemSpacing = 0;
  c.fills = [];
  c.clipsContent = false;
  c.setBoundVariable('paddingLeft', V('space/content/xs', 'Density'));
  c.setBoundVariable('paddingRight', V('space/content/xs', 'Density'));
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    c.setBoundVariable(k, V('radius/indicator', 'Brand'));
  const lh = V(`typography/indicator/${size}/lineHeight`, 'Brand');
  // Value: the text style typography/indicator/{size} is applied, then the typography variables are bound on the
  // node, and the digits are trimmed to their cap height (the code's text-box: trim-both cap alphabetic) so that
  // they sit centered in the line box. Leading trim is a text-style property: setting it on the node detaches the
  // style (observed 2026-10-14), so the node keeps the six bindings (family, weight, size, line height, letter
  // spacing, fill) and the style is a convenience that does not survive; the bindings are what the parity checks.
  const t = figma.createText();
  t.name = 'Value';
  t.fontName = { family: 'Inter', style: 'Medium' };
  await t.setTextStyleIdAsync(S(`typography/indicator/${size}`).id);
  t.characters = overflow ? '99+' : '8';
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.textAlignHorizontal = 'CENTER';
  t.textAlignVertical = 'CENTER';
  t.fills = [paint(fg)];
  t.setBoundVariable('fontFamily', V(`typography/indicator/${size}/fontFamily`, 'Brand'));
  t.setBoundVariable('fontWeight', V(`typography/indicator/${size}/fontWeight`, 'Brand'));
  t.setBoundVariable('fontSize', V(`typography/indicator/${size}/fontSize`, 'Brand'));
  t.setBoundVariable('lineHeight', lh);
  t.setBoundVariable('letterSpacing', V(`typography/indicator/${size}/letterSpacing`, 'Brand'));
  t.leadingTrim = 'CAP_HEIGHT';
  c.appendChild(t);
  // Minimum width equal to the height: both bound to the lineHeight variable (Figma cannot derive one from the other).
  c.setBoundVariable('minWidth', lh);
  c.setBoundVariable('height', lh);
  // Tint: a rectangle filling the container (absolute, scaled) in the content color, layer opacity bound to
  // opacity/tint so that the digits keep their full opacity (a paint opacity cannot bind a variable). Since
  // 2026-10-14 (user decision at the implementation review page) it replaces the former stroke-only Border.
  const b = figma.createRectangle();
  b.name = 'Tint';
  b.fills = [paint(fg)];
  b.strokes = [];
  c.insertChild(0, b);
  b.layoutPositioning = 'ABSOLUTE';
  // SCALE, not STRETCH: Figma rounds the master's fractional width (15.4) when it applies STRETCH offsets to an
  // instance, which left the layer 0.4 px wider than a 19 px instance; SCALE keeps the tint equal to the box.
  b.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  b.x = 0;
  b.y = 0;
  b.resize(c.width, c.height);
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    b.setBoundVariable(k, V('radius/indicator', 'Brand'));
  b.setBoundVariable('opacity', bo);
  return { c, t, b };
};
// Rows md, sm, lg and columns Overflow false, true: Figma takes the top-left variant as the default (neither the
// first nor the last child decides it), so the md row comes first.
const ROW = { md: 0, sm: 1, lg: 2 };
const made = [];
for (const [j, overflow] of [false, true].entries())
  for (const size of SIZES) {
    const m = await make(size, overflow);
    m.c.x = 40 + j * 120;
    m.c.y = 40 + ROW[size] * 56;
    page.appendChild(m.c);
    made.push({ ...m, size, overflow });
  }
const set = figma.combineAsVariants(
  made.map((m) => m.c),
  page
);
set.name = 'Counter';
set.x = 0;
set.y = 0;
// combineAsVariants hugs the variants: restore the 40 px margin.
let maxR = 0,
  maxB = 0;
for (const m of made) {
  m.c.x += 40;
  m.c.y += 40;
  maxR = Math.max(maxR, m.c.x + m.c.width);
  maxB = Math.max(maxB, m.c.y + m.c.height);
}
set.resizeWithoutConstraints(maxR + 40, maxB + 40);
const valueKey = set.addComponentProperty('Value', 'TEXT', '8');
const overflowKey = set.addComponentProperty('Overflow text', 'TEXT', '99+');
for (const m of made) m.t.componentPropertyReferences = { characters: m.overflow ? overflowKey : valueKey };
set.description =
  'Shows a quantity (unread messages, items, selected rows) as a compact rectangle next to the thing it counts, drawn in the inherited content color on a faint tint of that color (12 %). Source of truth: foundations/components/content/counter/contract.json; implementation: packages/svelte/src/components/counter. Size mirrors the code prop (named like Button sizes); Overflow is the derived state value > max, shown as max followed by a plus sign (99+ by default; edit Overflow text for another maximum). Value is the digits. Not interactive.';
return {
  page: page.id,
  collection: ac.id,
  foreground: fg.id,
  tintOpacity: bo.id,
  set: set.id,
  props: Object.keys(set.componentPropertyDefinitions),
  variants: Object.fromEntries(set.children.map((c) => [c.name, c.id])),
  layers: made.map((m) => ({ v: m.c.name, text: m.t.id, tint: m.b.id }))
};
