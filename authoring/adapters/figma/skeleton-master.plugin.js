// Skeleton master builder (use_figma body), 2026-11-03, restructured 2026-11-04.
// On the Feedback library page (407:112), section Skeleton: the internal part “_Skeleton/Text” (Size md, sm, lg ×
// Lines 1, 2, 3, 9 variants): a vertical auto layout 320 wide that hugs its Lines, each Line a frame of
// typography/body/{size}/lineHeight holding a Bar of typography/body/{size}/fontSize, centered (center constraint),
// corners radius/indicator, color/surface/muted; full bars stretch, the last bar of several covers 60 % (scale
// constraint). The set “Skeleton” (Shape, 3 variants): text holds the exposed Text instance (FILL), so that Size and
// Lines show only for that shape (user review of the Figma parity, 2026-11-04; done in place on the set 417:74, whose
// former Shape × Size × Lines variants became the part); block: 320 × 160, radius/container; circle: 48 × 48,
// radius/full. Paints bound with their resolved fallback. Rerunning replaces the set and the part.
const page = await figma.getNodeByIdAsync('407:112');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const paint = (name, node) => {
  const v = V(name);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, fields, name) => {
  for (const f of fields) n.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Skeleton');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Skeleton';
  page.appendChild(section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Skeleton' || n.name === '_Skeleton/Text')) n.remove();
const FS = { sm: 14, md: 16, lg: 18 },
  LH = { sm: 21, md: 24, lg: 28.8 };
const line = (s, last) => {
  const l = figma.createFrame();
  l.name = 'Line';
  l.fills = [];
  l.clipsContent = false;
  l.resize(320, LH[s]);
  bind(l, ['height'], `typography/body/${s}/lineHeight`);
  const bar = figma.createFrame();
  bar.name = 'Bar';
  l.appendChild(bar);
  bar.resize(last ? 320 * 0.6 : 320, FS[s]);
  bar.x = 0;
  bar.y = (LH[s] - FS[s]) / 2;
  bind(bar, ['height'], `typography/body/${s}/fontSize`);
  bind(bar, RADII, 'radius/indicator');
  bar.fills = [paint('color/surface/muted', bar)];
  bar.constraints = { horizontal: last ? 'SCALE' : 'STRETCH', vertical: 'CENTER' };
  return l;
};
const q = (v) => Object.fromEntries(v.name.split(', ').map((p) => p.split('=')));
const texts = [];
for (const s of ['md', 'sm', 'lg'])
  for (const n of [1, 2, 3]) {
    const c = figma.createComponent();
    c.name = `Size=${s}, Lines=${n}`;
    c.layoutMode = 'VERTICAL';
    c.counterAxisSizingMode = 'FIXED';
    c.resize(320, 10);
    c.primaryAxisSizingMode = 'AUTO'; // after resize, which resets it to FIXED
    c.itemSpacing = 0;
    c.fills = [];
    c.clipsContent = false;
    for (let k = 0; k < n; k++) {
      const l = line(s, n > 1 && k === n - 1);
      c.appendChild(l);
      l.layoutSizingHorizontal = 'FILL';
    }
    texts.push(c);
  }
const part = figma.combineAsVariants(texts, section);
part.name = '_Skeleton/Text';
part.description =
  'Internal part of Skeleton (Shape=text): Lines bars of the body/{size} font size, each centered in a line box of the body/{size} line height, corners radius/indicator, color/surface/muted; with more than one line the last covers 60 %. Choose Size and Lines on the Skeleton instance (the nested instance is exposed).';
let py = 24;
for (const s of ['md', 'sm', 'lg']) {
  const row = part.children.filter((v) => q(v).Size === s);
  for (const v of row) {
    v.x = 24 + (Number(q(v).Lines) - 1) * 368;
    v.y = py;
  }
  py += Math.max(...row.map((v) => v.height)) + 32;
}
part.resizeWithoutConstraints(24 * 2 + 3 * 368 - 48, py - 8);
const comps = [];
const text = figma.createComponent();
text.name = 'Shape=text';
text.layoutMode = 'VERTICAL';
text.counterAxisSizingMode = 'FIXED';
text.resize(320, 10);
text.primaryAxisSizingMode = 'AUTO';
text.fills = [];
text.clipsContent = false;
const inst = part.children.find((v) => v.name === 'Size=md, Lines=1').createInstance();
inst.name = 'Text';
text.appendChild(inst);
inst.layoutSizingHorizontal = 'FILL';
comps.push(text);
const block = figma.createComponent();
block.name = 'Shape=block';
block.resize(320, 160);
block.clipsContent = true;
bind(block, RADII, 'radius/container');
block.fills = [paint('color/surface/muted', block)];
comps.push(block);
const circle = figma.createComponent();
circle.name = 'Shape=circle';
circle.resize(48, 48);
bind(circle, RADII, 'radius/full');
circle.fills = [paint('color/surface/muted', circle)];
comps.push(circle);
const set = figma.combineAsVariants(comps, section);
set.name = 'Skeleton';
set.description =
  'Skeleton (feedback/skeleton): a placeholder with the shape and size of content that is loading, so that the layout does not move when it arrives. Shape text: choose Size and Lines on the exposed Text (bars of the body/{size} font size, centered in their line box, corners radius/indicator; with more than one line the last covers 60 %); they appear only for this shape. Shape block fills the size the layout gives it (radius/container); circle is a disc of the given width (radius/full). Painted in color/surface/muted. The pulse (opacity 1 → opacity/muted, motion/duration/loop) is a code-only animation; the skeleton is hidden from assistive technology.';
set.children.find((v) => v.name === 'Shape=text').findOne((n) => n.name === 'Text').isExposedInstance = true;
text.x = 32;
text.y = 32;
block.x = 32;
block.y = 32 + text.height + 40;
circle.x = 400;
circle.y = block.y;
set.resizeWithoutConstraints(32 * 2 + 320 + 48 + 48 + 32, block.y + block.height + 32);
set.x = 80;
set.y = 80;
part.x = set.x + set.width + 80;
part.y = set.y;
section.resizeWithoutConstraints(part.x + part.width + 80, Math.max(set.y + set.height, part.y + part.height) + 80);
return { section: section.id, set: set.id, part: part.id };
