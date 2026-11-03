// Button and IconButton loading indicator → Spinner (use_figma body), run once on 2026-11-03.
// The Button contract now says the loading indicator is a Spinner of the button size in the resolved content color.
// Every direct instance of the former part _Button/Loading indicator (42:28) in the Button (48:1586) and IconButton
// (211:1167) masters is swapped for the Spinner variant of its width (16 sm, 20 md, 24 lg, 32 xl), keeping its width and
// height bindings, its visibility, its name and the stroke color of each variant (re-applied on Track and Indicator
// after the swap). The part is removed once it has no instance left.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:2');
await figma.setCurrentPageAsync(page);
const BY_W = { 16: '408:6', 20: '408:3', 24: '408:9', 32: '408:12' };
const spin = {};
for (const [w, id] of Object.entries(BY_W)) spin[w] = await figma.getNodeByIdAsync(id);
const part = await figma.getNodeByIdAsync('42:28');
const inst = (await part.getInstancesAsync()).filter((i) => !i.id.startsWith('I'));
const strokeVar = (n) =>
  n && n.strokes[0] && n.strokes[0].boundVariables && n.strokes[0].boundVariables.color
    ? n.strokes[0].boundVariables.color.id
    : null;
const bound = async (id) => (id ? await figma.variables.getVariableByIdAsync(id) : null);
const p = (v) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
let swapped = 0;
for (const i of inst) {
  const target = spin[Math.round(i.width)];
  if (!target) throw new Error('no spinner for width ' + i.width);
  const bw = i.boundVariables.width && i.boundVariables.width.id;
  const bh = i.boundVariables.height && i.boundVariables.height.id;
  const { visible, name } = i;
  const tr = strokeVar(i.findOne((n) => n.name === 'Track'));
  const ar = strokeVar(i.findOne((n) => n.name === 'Arc')) || tr;
  i.swapComponent(target);
  if (bw) i.setBoundVariable('width', await bound(bw));
  if (bh) i.setBoundVariable('height', await bound(bh));
  i.visible = visible;
  i.name = name;
  if (tr) i.findOne((n) => n.name === 'Track').strokes = [p(await bound(tr))];
  if (ar) i.findOne((n) => n.name === 'Indicator').strokes = [p(await bound(ar))];
  swapped++;
}
if ((await part.getInstancesAsync()).length === 0) part.remove();
return { swapped };
