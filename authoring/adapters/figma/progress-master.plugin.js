// Progress master builder (use_figma body), 2026-11-03.
// On the Feedback library page (407:112), section Progress: the internal part _Progress/Track (Value 60, 0…100 by 10,
// indeterminate: a 320 × 6 frame in color/surface/muted with corners component/progress/radius, clipping an Indicator
// rectangle from the start over the fraction, scale/stretch constraints) and the set “Progress” (Type × Intent × Size,
// 24 variants): a vertical auto layout 320 wide, gap space/content/xs, holding a First line (Label label/md
// color/content/primary truncated, Value numeral/sm color/content/secondary) and an exposed Track instance (FILL,
// height component/progress/thickness/{size}, indicator fill color/status/{intent}/icon bound with its resolved
// fallback). Properties Show label, Show value, Label, Value text. As run on 2026-11-03 (the set was built first with a
// Track frame, then the frame was replaced by the part: an instance sublayer cannot be resized). Rerunning replaces both.
figma.skipInvisibleInstanceChildren = false;
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
  const c = node ? v.resolveForConsumer(node).value : { r: 0, g: 0, b: 0 };
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, fields, name) => {
  for (const f of fields) n.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['label/md', 'numeral/sm']) await figma.loadFontAsync(style(s).fontName);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Progress');
if (!section) {
  section = figma.createSection();
  section.name = 'Progress';
  page.appendChild(section);
  const above = page.children.filter((n) => n.type === 'SECTION' && n !== section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Progress' || n.name === '_Progress/Track')) n.remove();
// Internal part.
const VALUES = ['60', '0', '10', '20', '30', '40', '50', '70', '80', '90', '100', 'indeterminate'];
const parts = [];
for (const val of VALUES) {
  const c = figma.createComponent();
  c.name = `Value=${val}`;
  c.resize(320, 6);
  c.clipsContent = true;
  c.fills = [paint('color/surface/muted')];
  bind(c, RADII, 'component/progress/radius');
  const ind = figma.createRectangle();
  ind.name = 'Indicator';
  c.appendChild(ind);
  ind.fills = [paint('color/status/accent/icon', ind)];
  bind(ind, RADII, 'component/progress/radius');
  if (val === 'indeterminate') {
    ind.x = 320 / 3;
    ind.resize(320 / 3, 6);
  } else {
    const f = Number(val) / 100;
    ind.x = 0;
    ind.resize(Math.max(320 * f, 0.01), 6);
    ind.visible = f > 0;
  }
  ind.y = 0;
  ind.constraints = { horizontal: 'SCALE', vertical: 'STRETCH' };
  parts.push(c);
}
const part = figma.combineAsVariants(parts, section);
part.name = '_Progress/Track';
part.description =
  'Internal part of Progress (track and indicator). Value is the fraction of the indicator in steps of 10 %, or the still of the indeterminate sweep. Its color and thickness are set by the Progress variant; choose Value on the Progress instance (the nested instance is exposed).';
part.children.forEach((v, k) => {
  v.x = 24 + (k % 4) * 352;
  v.y = 24 + Math.floor(k / 4) * 40;
});
part.resizeWithoutConstraints(24 * 2 + 4 * 352 - 32, 24 * 2 + 3 * 40 - 34);
const byVal = (v) => part.children.find((c) => c.name === 'Value=' + v);
// The set.
const I = ['accent', 'success', 'warning', 'danger'],
  S = ['md', 'sm', 'lg'],
  T = ['determinate', 'indeterminate'];
const comps = [];
for (const t of T)
  for (const i of I)
    for (const s of S) {
      const c = figma.createComponent();
      c.name = `Type=${t}, Intent=${i}, Size=${s}`;
      c.layoutMode = 'VERTICAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'FIXED';
      c.resize(320, c.height);
      c.fills = [];
      c.clipsContent = false;
      bind(c, ['itemSpacing'], 'space/content/xs');
      const first = figma.createAutoLayout('HORIZONTAL', { name: 'First line', itemSpacing: 8 });
      first.fills = [];
      first.counterAxisAlignItems = 'CENTER';
      c.appendChild(first);
      first.layoutSizingHorizontal = 'FILL';
      const label = figma.createText();
      label.name = 'Label';
      label.textStyleId = style('label/md').id;
      label.characters = 'Uploading report.pdf';
      label.fills = [paint('color/content/primary')];
      first.appendChild(label);
      label.layoutSizingHorizontal = 'FILL';
      label.textTruncation = 'ENDING';
      label.maxLines = 1;
      const value = figma.createText();
      value.name = 'Value';
      value.textStyleId = style('numeral/sm').id;
      value.characters = '60%';
      value.fills = [paint('color/content/secondary')];
      first.appendChild(value);
      value.visible = false;
      const track = byVal(t === 'indeterminate' ? 'indeterminate' : '60').createInstance();
      track.name = 'Track';
      c.appendChild(track);
      track.layoutSizingHorizontal = 'FILL';
      bind(track, ['height'], `component/progress/thickness/${s}`);
      const ind = track.findOne((n) => n.name === 'Indicator');
      ind.fills = [paint(`color/status/${i}/icon`, ind)];
      track.isExposedInstance = true;
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, section);
set.name = 'Progress';
set.description =
  'Progress (feedback/progress): how far a task of known size has gone, or (Type=indeterminate) that a longer task is under way. Label: the accessible name, required even when hidden (Show label off). Value: the whole percentage in numeral/sm (tabular figures, set by hand in Figma). The fraction is the Value of the exposed Track (0 to 100 by 10). The indeterminate sweep (motion/duration/loop) and the value transition are code-only animations. Size changes only the track thickness (component/progress/thickness/{size}); corners: component/progress/radius.';
const showLabel = set.addComponentProperty('Show label', 'BOOLEAN', true);
const showValue = set.addComponentProperty('Show value', 'BOOLEAN', false);
const labelText = set.addComponentProperty('Label', 'TEXT', 'Uploading report.pdf');
const valueText = set.addComponentProperty('Value text', 'TEXT', '60%');
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: labelText, visible: showLabel };
  v.findOne((n) => n.name === 'Value').componentPropertyReferences = v.name.startsWith('Type=determinate')
    ? { characters: valueText, visible: showValue }
    : { characters: valueText };
}
const cw = 320,
  gx = 48,
  gy = 40;
let maxH = 0;
for (const v of set.children) maxH = Math.max(maxH, v.height);
set.children.forEach((v) => {
  const q = Object.fromEntries(v.name.split(', ').map((p) => p.split('=')));
  v.x = 32 + S.indexOf(q.Size) * (cw + gx);
  v.y = 32 + (T.indexOf(q.Type) * I.length + I.indexOf(q.Intent)) * (maxH + gy);
});
set.resizeWithoutConstraints(64 + 3 * cw + 2 * gx, 64 + 8 * maxH + 7 * gy);
set.x = 80;
set.y = 80;
part.x = set.x + set.width + 80;
part.y = set.y;
section.resizeWithoutConstraints(part.x + part.width + 80, set.y + set.height + 80);
return { section: section.id, set: set.id, part: part.id };
