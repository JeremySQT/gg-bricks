// Skeleton master builder (use_figma body), 2026-11-03.
// On the Feedback library page (407:112), section Skeleton: the set “Skeleton” (11 variants). Shape=text × Size (md, sm,
// lg) × Lines (1, 2, 3): a vertical auto layout 320 wide that hugs its Lines, each Line a frame of
// typography/body/{size}/lineHeight holding a Bar of typography/body/{size}/fontSize, centered (center constraint),
// corners radius/indicator, color/surface/muted; full bars stretch, the last bar of several covers 60 % (scale
// constraint). Shape=block: 320 × 160, radius/container. Shape=circle: 48 × 48, radius/full. Paints bound with their
// resolved fallback. Rerunning replaces the set.
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
for (const n of section.children.filter((n) => n.name === 'Skeleton')) n.remove();
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
const comps = [];
for (const s of ['md', 'sm', 'lg'])
  for (const n of [1, 2, 3]) {
    const c = figma.createComponent();
    c.name = `Shape=text, Size=${s}, Lines=${n}`;
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
    comps.push(c);
  }
const block = figma.createComponent();
block.name = 'Shape=block, Size=md, Lines=1';
block.resize(320, 160);
block.clipsContent = true;
bind(block, RADII, 'radius/container');
block.fills = [paint('color/surface/muted', block)];
comps.push(block);
const circle = figma.createComponent();
circle.name = 'Shape=circle, Size=md, Lines=1';
circle.resize(48, 48);
bind(circle, RADII, 'radius/full');
circle.fills = [paint('color/surface/muted', circle)];
comps.push(circle);
const set = figma.combineAsVariants(comps, section);
set.name = 'Skeleton';
set.description =
  'Skeleton (feedback/skeleton): a placeholder with the shape and size of content that is loading, so that the layout does not move when it arrives. Shape text: Lines bars of the body/{size} font size, centered in its line box, corners radius/indicator; with more than one line the last covers 60 %. Shape block fills the size the layout gives it (radius/container); circle is a disc of the given width (radius/full); Size and Lines do not apply to them. Painted in color/surface/muted. The pulse (opacity 1 → opacity/muted, motion/duration/loop) is a code-only animation; the skeleton is hidden from assistive technology.';
const q = (v) => Object.fromEntries(v.name.split(', ').map((p) => p.split('=')));
let y = 32;
for (const s of ['md', 'sm', 'lg']) {
  const rowV = set.children.filter((v) => q(v).Shape === 'text' && q(v).Size === s);
  for (const v of rowV) {
    v.x = 32 + (Number(q(v).Lines) - 1) * 368;
    v.y = y;
  }
  y += Math.max(...rowV.map((v) => v.height)) + 40;
}
block.x = 32;
block.y = y;
circle.x = 400;
circle.y = y;
set.resizeWithoutConstraints(32 * 2 + 3 * 368 - 48, y + block.height + 32);
set.x = 80;
set.y = 80;
section.resizeWithoutConstraints(set.width + 160, set.height + 160);
return { section: section.id, set: set.id };
