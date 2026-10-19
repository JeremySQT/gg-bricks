// Converts the Phosphor SVG imports on the assets/phosphor page into components, in retry-safe batches.
// Run through use_figma after uploading assets/regular/*.svg of @phosphor-icons/core (24 x 24 frames named after
// the icon, one vector each, viewBox 256). Each frame becomes the component `phosphor/<name>`: transparent
// background, its vector named Glyph with Scale constraints and its fill bound to color/content/primary, like
// the former _Fixture/Icon glyphs. Components are laid out alphabetically, 40 per row, 48 px apart, below the
// specification frame. Frames already converted are skipped, so the script can be run again until done.
const PAGE_ID = '199:2';
const COLOR_VARIABLE_ID = 'VariableID:7:10'; // color/content/primary (Foundations · Appearance)
const LIMIT = 400;
const COLUMNS = 40;
const CELL = 48;
const TOP = 960; // below the frame “Phosphor — Library notes” (phosphor-spec.plugin.js)
const DESCRIPTION =
  'Phosphor Icons 2.1.1, regular weight (MIT, phosphoricons.com). A glyph for the Icon component: choose it ' +
  'through Icon’s Glyph property (or a component’s icon slot); do not insert it on its own in a design.';

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const color = await figma.variables.getVariableByIdAsync(COLOR_VARIABLE_ID);
const isGlyphFrame = (n) => n.type === 'FRAME' && n.children.length === 1 && n.children[0].type === 'VECTOR';
const base = (n) => n.name.replace(/^phosphor\//, '');
const glyphs = page.children.filter(
  (n) => isGlyphFrame(n) || (n.type === 'COMPONENT' && n.name.startsWith('phosphor/'))
);
const index = new Map(
  glyphs
    .map(base)
    .sort()
    .map((name, i) => [name, i])
);
const todo = page.children.filter(isGlyphFrame).slice(0, LIMIT);
const created = [];
for (const frame of todo) {
  const name = frame.name;
  const component = figma.createComponentFromNode(frame);
  component.name = `phosphor/${name}`;
  component.fills = [];
  component.clipsContent = false;
  component.description = DESCRIPTION;
  const glyph = component.children[0];
  glyph.name = 'Glyph';
  glyph.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  glyph.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', color)
  ];
  const i = index.get(name);
  component.x = (i % COLUMNS) * CELL;
  component.y = TOP + Math.floor(i / COLUMNS) * CELL;
  created.push(component.id);
}
const remaining = page.children.filter(isGlyphFrame).length;
const components = page.children.filter((n) => n.type === 'COMPONENT' && n.name.startsWith('phosphor/')).length;
return { converted: created.length, firstIds: created.slice(0, 3), components, remaining };
