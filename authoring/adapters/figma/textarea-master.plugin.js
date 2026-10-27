// Textarea master builder (use_figma body), 2026-10-27.
// On the page forms/textarea (288:9): the component set “Textarea” (Size × Content × State, 36 variants) at the
// default 3 rows. Same field treatment as InputText (color/field/{state}/…, border/width/default inside,
// radius/control, inline padding space/control/padding-inline/{size}). The code's block padding is
// (size/control − one line) / 2, which Figma cannot compute: the Area stacks a first row of size/control/{size} and
// the other rows (textarea/more-rows: 2 lines, Components adapter), and the text box (3 lines tall,
// textarea/text-rows) is centered on that stack, so its top sits at exactly the code's padding in every density.
// The text is top aligned in its box. The focus ring follows InputText. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:9');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'Textarea' || n.name.startsWith('Size='))) n.remove();
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const AC = cols.find((c) => c.name === 'Components');
// Adapter: three lines of typography/body/{size} (21, 24, 28.8 px lines).
let rows = vars.find((v) => v.name === 'textarea/text-rows' && v.variableCollectionId === AC.id);
if (!rows) rows = figma.variables.createVariable('textarea/text-rows', AC, 'FLOAT');
rows.scopes = ['WIDTH_HEIGHT'];
rows.hiddenFromPublishing = true;
for (const m of AC.modes) rows.setValueForMode(m.modeId, { sm: 63, md: 72, lg: 86.4 }[m.name]);
vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const bind = (node, fields, name) => {
  for (const f of fields) node.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style: st });
const S = ['md', 'sm', 'lg'];
const C = ['placeholder', 'value'];
const ST = ['default', 'hover', 'focus', 'readonly', 'disabled', 'invalid'];
const VALUE = 'The parcel arrived on time but the box was damaged on one corner. The contents were intact.';
const comps = [];
for (const s of S)
  for (const content of C)
    for (const st of ST) {
      const c = figma.createComponent();
      c.name = `Size=${s}, Content=${content}, State=${st}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'FIXED';
      c.counterAxisSizingMode = 'AUTO';
      c.itemSpacing = 0;
      c.clipsContent = false;
      c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
      c.resize(280, 100);
      bind(c, ['paddingLeft', 'paddingRight'], `space/control/padding-inline/${s}`);
      c.fills = [paint(`color/field/${st}/surface`)];
      c.strokes = [paint(`color/field/${st}/border`)];
      c.strokeAlign = 'INSIDE';
      c.strokesIncludedInLayout = false;
      bind(c, STROKES, 'border/width/default');
      bind(c, RADII, 'radius/control');
      const area = figma.createAutoLayout('VERTICAL', { name: 'Area', itemSpacing: 0 });
      area.fills = [];
      area.clipsContent = false;
      c.appendChild(area);
      area.layoutSizingHorizontal = 'FILL';
      const first = figma.createFrame();
      first.name = 'First row';
      first.fills = [];
      area.appendChild(first);
      first.layoutSizingHorizontal = 'FILL';
      bind(first, ['height'], `size/control/${s}`);
      const more = figma.createFrame();
      more.name = 'More rows';
      more.fills = [];
      area.appendChild(more);
      more.layoutSizingHorizontal = 'FILL';
      bind(more, ['height'], 'textarea/more-rows');
      const box = figma.createAutoLayout('VERTICAL', { name: 'Text box' });
      box.fills = [];
      box.clipsContent = true;
      area.appendChild(box);
      box.layoutPositioning = 'ABSOLUTE';
      box.primaryAxisSizingMode = 'FIXED';
      box.counterAxisSizingMode = 'FIXED';
      box.resize(area.width, 72);
      bind(box, ['height'], 'textarea/text-rows');
      box.x = 0;
      box.y = (area.height - box.height) / 2;
      box.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      const t = figma.createText();
      t.name = content === 'value' ? 'Value' : 'Placeholder';
      await t.setTextStyleIdAsync(style(`body/${s}`).id);
      t.characters = content === 'value' ? VALUE : 'What went well, what could be better…';
      t.fills = [paint(`color/field/${st}/${content === 'value' ? 'content' : 'placeholder'}`)];
      box.appendChild(t);
      t.layoutSizingHorizontal = 'FILL';
      t.textAutoResize = 'HEIGHT';
      const ring = figma.createFrame();
      ring.name = 'Focus ring';
      ring.fills = [];
      c.appendChild(ring);
      ring.layoutPositioning = 'ABSOLUTE';
      ring.x = -2;
      ring.y = -2;
      ring.resize(c.width + 4, c.height + 4);
      ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      ring.strokes = [paint('color/focus/ring')];
      ring.strokeAlign = 'OUTSIDE';
      bind(ring, STROKES, 'focus/width');
      bind(ring, RADII, 'radius/focus');
      ring.visible = st === 'focus';
      const name = figma.createText();
      name.name = 'Label (accessible name, not shown)';
      await name.setTextStyleIdAsync(style('label/md').id);
      name.characters = 'Feedback';
      c.appendChild(name);
      name.layoutPositioning = 'ABSOLUTE';
      name.visible = false;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, page);
set.name = 'Textarea';
set.description =
  'Multi-line free text, shown at its default 3 rows. Source of truth: foundations/components/forms/textarea/contract.json; implementation: packages/svelte/src/components/textarea. Same colors, border, padding, text and focus ring as the InputText of the same size; one row is as tall as an InputText. Size and State mirror the code (State focus shows the focus ring; Focus adds it to another state). Content shows the Value or the Placeholder. Resize (vertical, auto, none) and the row count are behaviors of the code: in Figma, set the instance height for more rows. Inside a Field the field label names it; alone, Label is its accessible name (not shown).';
const VAL = set.addComponentProperty('Value', 'TEXT', VALUE);
const PH = set.addComponentProperty('Placeholder', 'TEXT', 'What went well, what could be better…');
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Feedback');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  const val = v.findOne((n) => n.type === 'TEXT' && n.name === 'Value');
  if (val) val.componentPropertyReferences = { characters: VAL };
  const ph = v.findOne((n) => n.type === 'TEXT' && n.name === 'Placeholder');
  if (ph) ph.componentPropertyReferences = { characters: PH };
  v.children.find((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
  if (!v.name.includes('State=focus'))
    v.children.find((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
}
const GAP = 32,
  COL = 312;
let y = GAP;
for (let r = 0; r < 6; r++) {
  const row = set.children.slice(r * 6, r * 6 + 6);
  row.forEach((v, k) => {
    v.x = GAP + k * COL;
    v.y = y;
  });
  y += Math.max(...row.map((v) => v.height)) + 24;
}
set.resizeWithoutConstraints(GAP * 2 + 6 * COL - 32, y + GAP - 24);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  textRows: rows.id,
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions)
};
