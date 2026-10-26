// Badge master builder (use_figma body), 2026-10-19; the glyph placed directly behind the Leading icon property on
// 2026-10-26.
// Creates (or reuses) the page content/badge before content/counter, the adapter variable badge/icon-box in the
// hidden Components collection, and the component set “Badge” (Intent × Appearance × Size, 36 variants) with
// the boolean Show leading, the text property Label and the instance-swap property Leading icon: the glyph sits
// directly in the variant at size/icon/xs, so a designer chooses the glyph, never its size (user decision,
// 2026-10-26: a nested Icon would expose its Size). An instance-swap property has one default for the set, so the
// per-intent glyphs of the code's review page are not defaults (pencil-simple for all). Every visual
// property is bound to a variable looked up by collection and name; no ID is guessed. Rerunning replaces the set.
// Construction follows the Counter (the badge shares its box family): the height and the minimum width are bound
// to typography/indicator/{size}/lineHeight, the label is trimmed to its cap height (text-box: trim-both cap
// alphabetic in the code). The leading icon is placed by its drawing: a “Drawing box” of badge/icon-box
// (iconSize − iconSize/4, 9) holds the 12 px icon centered, so the icon box overlaps the padding and the leading
// gap by iconSize/8 on each side as the code's negative margins do (amended on 2026-10-20, as in Button), and
// the Leading frame adds leadingGap after the drawing.
figma.skipInvisibleInstanceChildren = false;
let page = figma.root.children.find((p) => p.name === 'content/badge');
if (!page) {
  page = figma.createPage();
  page.name = 'content/badge';
  const before = figma.root.children.findIndex((p) => p.name === 'content/counter');
  figma.root.insertChild(before, page);
}
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'COMPONENT_SET' && n.name === 'Badge')) n.remove();

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
// Adapter: the icon box minus its two insets (Figma cannot compute a fraction of a variable).
const ac = col('Components');
let box = vars.find((v) => v.name === 'badge/icon-box' && v.variableCollectionId === ac.id);
if (!box) box = figma.variables.createVariable('badge/icon-box', ac, 'FLOAT');
box.scopes = ['WIDTH_HEIGHT'];
box.hiddenFromPublishing = true;
for (const m of ac.modes) box.setValueForMode(m.modeId, 9);

const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const styles = await figma.getLocalTextStylesAsync();
const PENCIL = await figma.getNodeByIdAsync('200:5392'); // phosphor/pencil-simple, the default glyph
const I = ['neutral', 'accent', 'info', 'success', 'warning', 'danger'];
const A = ['subtle', 'strong'];
const S = ['md', 'sm', 'lg'];
const comps = [];
const texts = [];
const leads = [];
const icons = [];
for (const i of I)
  for (const a of A)
    for (const s of S) {
      const role = (r) => `color/status/${i}/${r}`;
      const c = figma.createComponent();
      c.name = `Intent=${i}, Appearance=${a}, Size=${s}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'FIXED';
      c.primaryAxisAlignItems = 'CENTER';
      c.counterAxisAlignItems = 'CENTER';
      c.itemSpacing = 0;
      c.paddingTop = c.paddingBottom = 0;
      c.clipsContent = false;
      // The code draws the edge as an inset shadow that takes no room: the stroke stays out of the layout.
      c.strokesIncludedInLayout = false;
      c.setBoundVariable('paddingLeft', V('space/content/xs'));
      c.setBoundVariable('paddingRight', V('space/content/xs'));
      for (const k of RADII) c.setBoundVariable(k, V('radius/indicator'));
      const lh = V(`typography/indicator/${s}/lineHeight`);
      c.fills = [paint(a === 'subtle' ? role('surface') : role('surfaceStrong'))];
      if (a === 'subtle') {
        c.strokes = [paint(role('border'))];
        c.strokeAlign = 'INSIDE';
        for (const k of STROKES) c.setBoundVariable(k, V('border/width/default'));
      } else c.strokes = [];

      const lead = figma.createAutoLayout('HORIZONTAL', { name: 'Leading', itemSpacing: 0 });
      lead.fills = [];
      lead.clipsContent = false;
      lead.counterAxisAlignItems = 'CENTER';
      lead.setBoundVariable('paddingRight', V('space/content/xs'));
      c.appendChild(lead);
      const draw = figma.createAutoLayout('HORIZONTAL', { name: 'Drawing box' });
      draw.fills = [];
      draw.clipsContent = false;
      draw.primaryAxisAlignItems = 'CENTER';
      draw.counterAxisAlignItems = 'CENTER';
      draw.primaryAxisSizingMode = 'FIXED';
      draw.counterAxisSizingMode = 'FIXED';
      lead.appendChild(draw);
      draw.resize(9, 12);
      draw.setBoundVariable('width', box);
      draw.setBoundVariable('height', V('size/icon/xs'));
      const icon = PENCIL.createInstance();
      icon.name = 'Leading icon';
      draw.appendChild(icon);
      icon.setBoundVariable('width', V('size/icon/xs'));
      icon.setBoundVariable('height', V('size/icon/xs'));
      icons.push([icon, a === 'subtle' ? role('icon') : role('contentStrong')]);

      const t = figma.createText();
      t.name = 'Label';
      t.fontName = { family: 'Inter', style: 'Medium' };
      await t.setTextStyleIdAsync(styles.find((x) => x.name === `typography/indicator/${s}`).id);
      t.characters = 'Badge';
      t.textAutoResize = 'WIDTH_AND_HEIGHT';
      t.textTruncation = 'ENDING';
      t.maxLines = 1;
      t.fills = [paint(a === 'subtle' ? role('content') : role('contentStrong'))];
      for (const f of ['fontFamily', 'fontWeight', 'fontSize', 'letterSpacing'])
        t.setBoundVariable(f, V(`typography/indicator/${s}/${f}`));
      t.setBoundVariable('lineHeight', lh);
      t.leadingTrim = 'CAP_HEIGHT';
      c.appendChild(t);
      c.resize(c.width, 16);
      c.setBoundVariable('height', lh);
      c.setBoundVariable('minWidth', lh);
      comps.push(c);
      texts.push(t);
      leads.push(lead);
    }
const set = figma.combineAsVariants(comps, page);
set.name = 'Badge';
set.description =
  'A short, non-interactive label for a status or a category (Paid, Draft, New), in the box family of Counter. Source of truth: foundations/components/content/badge/contract.json; implementation: packages/svelte/src/components/badge. Intent picks the color family (neutral and accent for categories; info, success, warning, danger for statuses), Appearance its weight (subtle with an edge, strong filled), Size the typography (one step below a Button label of the same size; height and icon fixed across densities, padding follows). Label is the text, on one line (set a fixed width to truncate with an ellipsis). Show leading adds one decorative icon, placed by its drawing; choose it with Leading icon (its size is fixed). A removable or selectable value is a Tag; a quantity is a Counter.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Badge');
const LEAD = set.addComponentProperty('Show leading', 'BOOLEAN', false);
const ICON = set.addComponentProperty('Leading icon', 'INSTANCE_SWAP', PENCIL.id);
for (const v of set.children) {
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Leading').componentPropertyReferences = { visible: LEAD };
  v.findOne((n) => n.name === 'Leading icon').componentPropertyReferences = { mainComponent: ICON };
}
// Binding the swap property may drop the glyph color overrides: set them after it.
for (const [icon, color] of icons) for (const v of icon.findAll((n) => n.type === 'VECTOR')) v.fills = [paint(color)];
// Rows by intent, columns Appearance × Size (md first, so the top-left default is neutral · subtle · md).
const GAP = 32,
  COL = 96,
  ROW = 48;
set.children.forEach((v, k) => {
  const row = Math.floor(k / 6);
  const c = k % 6;
  v.x = GAP + c * COL + Math.floor(c / 3) * GAP;
  v.y = GAP + row * ROW;
});
set.resizeWithoutConstraints(GAP * 2 + 6 * COL + GAP, GAP * 2 + 6 * ROW - (ROW - 20));
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  iconBox: box.id,
  props: Object.keys(set.componentPropertyDefinitions),
  defaultVariant: set.defaultVariant.name,
  variants: Object.fromEntries(set.children.map((c) => [c.name.replace(/\w+=/g, ''), c.id]))
};
