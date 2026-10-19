// Phosphor library notes (use_figma body), 2026-10-19. Builds the frame “Phosphor — Library notes” at the top of
// the page assets/phosphor (199:2), in the layout of the component specifications (white header on a gray page,
// white cards): what the page holds, where it comes from, how designers use it (through the Icon component only)
// and how to update it. The hero shows the real Icon component with glyphs from this page.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('199:2');
await figma.setCurrentPageAsync(page);
const NAME = 'Phosphor — Library notes';
for (const n of page.children.filter((n) => n.name === NAME)) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const wf = col('Wireframe');
const V = (name) =>
  vars.find((v) => v.name === name && v.variableCollectionId === wf.id) || vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const fill = (node, name) => {
  node.fills = [paint(name)];
};
const styles = await figma.getLocalTextStylesAsync();
const S = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of styles) await figma.loadFontAsync(s.fontName);
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
const card = (name, gap = 16, pad = 28) => {
  const f = stack(name, 'VERTICAL', gap, pad);
  fill(f, 'wireframe/card');
  f.strokes = [paint('wireframe/card-border')];
  f.strokeWeight = 1;
  f.strokeAlign = 'INSIDE';
  f.cornerRadius = 12;
  return f;
};
const glyph = (name) => page.children.find((n) => n.type === 'COMPONENT' && n.name === 'phosphor/' + name);
const iconSet = await figma.getNodeByIdAsync('149:20');
const GLYPH = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const icon = (size, name) => {
  const inst = iconSet.children.find((c) => c.name === 'Size=' + size).createInstance();
  inst.setProperties({ [GLYPH]: glyph(name).id });
  return inst;
};
const count = page.children.filter((n) => n.type === 'COMPONENT' && n.name.startsWith('phosphor/')).length;

// ---- Root and header ----
const root = stack(NAME, 'VERTICAL', 0, 0);
root.x = 0;
root.y = 0;
fill(root, 'wireframe/panel');
root.resize(1912, 100);
root.layoutSizingHorizontal = 'FIXED';
for (const [c, m] of [
  ['Brand', 'base'],
  ['Appearance', 'light'],
  ['Density', 'standard']
])
  root.setExplicitVariableModeForCollection(col(c), mode(col(c), m));
root.setExplicitVariableModeForCollection(wf, mode(wf, 'light'));
const header = stack('Header', 'HORIZONTAL', 64, [56, 72, 56, 72]);
fill(header, 'wireframe/canvas');
root.appendChild(header);
header.layoutSizingHorizontal = 'FILL';
const intro = stack('Intro', 'VERTICAL', 20);
intro.appendChild(text('ASSETS / PHOSPHOR', 'label/sm', 'color/content/tertiary'));
intro.appendChild(text('Phosphor Icons', 'display/md'));
intro.appendChild(
  text(
    'The glyphs behind the Icon component. Designers pick an icon through the Glyph property of Icon, or through the icon slot of a component (Button, IconButton, Badge); these glyphs are never placed on their own in a design. They are the same drawings as in code, so a design and its implementation show identical icons.',
    'body/lg',
    'color/content/secondary',
    880
  )
);
header.appendChild(intro);
const hero = stack('Hero: the Icon component with Phosphor glyphs', 'HORIZONTAL', 32, [36, 40, 36, 40]);
fill(hero, 'wireframe/hero');
hero.cornerRadius = 16;
hero.counterAxisAlignItems = 'CENTER';
for (const g of ['magnifying-glass', 'pencil-simple', 'trash', 'bell', 'gear', 'arrow-up-right'])
  hero.appendChild(icon('xl', g));
header.appendChild(hero);

// ---- Body ----
const body = stack('Body', 'HORIZONTAL', 24, [40, 72, 56, 72]);
root.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
const facts = card('Import record');
facts.appendChild(text('Import record', 'heading/sm'));
for (const [k, v] of [
  ['Set', `Phosphor Icons 2.1.1, regular weight, ${String(count).replace(/\B(?=(\d{3})+$)/g, ',')} glyphs`],
  ['Imported', '2026-10-19, by the ggbrick team (wave 1 Figma phase)'],
  ['Source', 'npm @phosphor-icons/core 2.1.1, assets/regular/*.svg (the same package version as the code examples)'],
  ['License', 'MIT, Copyright (c) 2023 Phosphor Icons, phosphoricons.com'],
  ['Names', 'phosphor/<name>, the names of the package and of phosphoricons.com (phosphor/magnifying-glass)'],
  [
    'Construction',
    '24 × 24 component, one vector “Glyph” drawn on the 256 grid with its 1/8 inset, Scale constraints, fill bound to color/content/primary'
  ],
  ['Script', 'authoring/adapters/figma/phosphor-components.plugin.js (repository)']
]) {
  const row = stack(k, 'HORIZONTAL', 16);
  const key = text(k, 'label/md', 'color/content/secondary');
  key.textAutoResize = 'NONE';
  key.resize(110, key.height);
  row.appendChild(key);
  row.appendChild(text(v, 'body/sm', 'color/content/primary', 420));
  facts.appendChild(row);
}
body.appendChild(facts);
const use = card('How to use');
use.appendChild(text('How to use', 'heading/sm'));
for (const line of [
  'Do: insert the Icon component (or a component with an icon slot) and choose the glyph in its Glyph property; search by name, as on phosphoricons.com.',
  'Do: let the host decide size and color: Icon sizes xs to xl, the color of the surrounding text or of the host component.',
  'Don’t: drag a phosphor/… glyph onto a design. It has no size option, no accessible name and no link to the design system’s rules.',
  'Don’t: detach, recolor by hand, resize the glyph components or edit their vectors: they mirror the code package exactly.',
  'Don’t: add glyphs from another set to this page. A missing icon is requested from the design system team.'
])
  use.appendChild(text(line, 'body/sm', 'color/content/primary', 520));
body.appendChild(use);
const update = card('Updating');
update.appendChild(text('Updating', 'heading/sm'));
for (const line of [
  'A new Phosphor version replaces the vectors of the existing components in place, keeping each component and its name, so every Icon instance in every file stays linked. New glyphs are added as new components; removed glyphs are kept and marked deprecated until no design uses them.',
  'Other weights (thin, light, bold, fill, duotone) are not imported. They would live on their own pages (assets/phosphor-bold…) only if a brand adopts them.',
  'Record the new version and date in this frame and in the repository ledger reports/assets/phosphor/ledger.json.'
])
  update.appendChild(text(line, 'body/sm', 'color/content/primary', 460));
body.appendChild(update);
for (const c of [facts, use, update]) c.layoutSizingVertical = 'FILL';

const all = page.children.filter((n) => n.type === 'COMPONENT' && n.name.startsWith('phosphor/'));
const top = Math.min(...all.map((n) => n.y));
return { rootId: root.id, height: root.height, glyphsTop: top, overlap: root.y + root.height > top - 40, count };
