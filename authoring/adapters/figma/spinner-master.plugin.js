// Spinner master builder (use_figma body), 2026-11-03.
// On the Feedback library page (407:112), section Spinner: the component set “Spinner” (Size md, sm, lg, xl; md first so
// that it is the default). Each variant is a square bound to size/icon/{size} holding the drawing of Spinner.svelte
// scaled to the size: Track, a full ring of radius 9/24 at component/spinner/track-opacity (layer opacity, emitted
// ×100), and Indicator, the quarter arc from the top to the right with round caps, both stroked 2.5/24 of the size in
// color/content/primary (a host overrides the two strokes with its content color). A hidden text layer carries the
// Label property (the accessible name). Rerunning replaces the set inside the section.
const page = await figma.getNodeByIdAsync('407:112');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Spinner');
if (!section) {
  section = figma.createSection();
  section.name = 'Spinner';
  page.appendChild(section);
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Spinner')) n.remove();
const SIZES = { md: 20, sm: 16, lg: 24, xl: 32 };
const f = (x) => +x.toFixed(4);
const comps = [];
for (const [s, px] of Object.entries(SIZES)) {
  const k = px / 24,
    sw = f(2.5 * k),
    r = 9 * k,
    c = 0.5522847498 * r,
    d = 2 * r;
  const c0 = figma.createComponent();
  c0.name = `Size=${s}`;
  c0.resize(px, px);
  c0.fills = [];
  c0.clipsContent = false;
  c0.setBoundVariable('width', V(`size/icon/${s}`));
  c0.setBoundVariable('height', V(`size/icon/${s}`));
  const track = figma.createVector();
  track.name = 'Track';
  track.vectorPaths = [
    {
      windingRule: 'NONE',
      data: `M ${f(d)} ${f(r)} C ${f(d)} ${f(r + c)} ${f(r + c)} ${f(d)} ${f(r)} ${f(d)} C ${f(r - c)} ${f(d)} 0 ${f(r + c)} 0 ${f(r)} C 0 ${f(r - c)} ${f(r - c)} 0 ${f(r)} 0 C ${f(r + c)} 0 ${f(d)} ${f(r - c)} ${f(d)} ${f(r)}`
    }
  ];
  c0.appendChild(track);
  track.x = 3 * k;
  track.y = 3 * k;
  track.fills = [];
  track.strokes = [paint('color/content/primary')];
  track.strokeWeight = sw;
  track.strokeAlign = 'CENTER';
  track.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  track.setBoundVariable('opacity', V('component/spinner/track-opacity'));
  const arc = figma.createVector();
  arc.name = 'Indicator';
  arc.vectorPaths = [{ windingRule: 'NONE', data: `M ${f(r)} ${f(r)} C ${f(r)} ${f(r - c)} ${f(c)} 0 0 0` }];
  c0.appendChild(arc);
  arc.x = 12 * k;
  arc.y = 3 * k;
  arc.fills = [];
  arc.strokes = [paint('color/content/primary')];
  arc.strokeWeight = sw;
  arc.strokeAlign = 'CENTER';
  arc.strokeCap = 'ROUND';
  arc.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  comps.push(c0);
}
const set = figma.combineAsVariants(comps, section);
set.name = 'Spinner';
set.description =
  'Spinner (feedback/spinner): a ring that turns while something loads and its duration is unknown. Track: full ring at component/spinner/track-opacity; Indicator: quarter arc; stroke 2.5/24 of the size, as in the code. Both are drawn in the content color around the spinner: color/content/primary by default, override the two strokes with the content color of the host (Button and IconButton do). The turn (component/spinner/duration, 700 ms, linear) is a code-only animation. Name: an empty label keeps it decorative; a label makes it a polite status.';
set.layoutMode = 'HORIZONTAL';
set.itemSpacing = 32;
set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 32;
set.counterAxisAlignItems = 'CENTER';
set.x = 80;
set.y = 80;
// Label: a hidden text layer behind a TEXT property (the accessible name, read in Dev Mode).
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const st = (await figma.getLocalTextStylesAsync()).find((s) => s.name === 'typography/label/md');
const key = set.addComponentProperty('Label', 'TEXT', ' ');
for (const v of set.children) {
  const t = figma.createText();
  v.appendChild(t);
  t.name = 'Label (accessible name, not shown)';
  t.textStyleId = st.id;
  t.characters = ' ';
  t.visible = false;
  t.componentPropertyReferences = { characters: key };
}
section.resizeWithoutConstraints(set.width + 160, set.height + 160);
return { section: section.id, set: set.id, variants: set.children.map((c) => `${c.name} ${c.id}`) };
