// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Divider section of the Content page: the Divider component set (Orientation, 2 variants) with the Show label boolean
// and the Label text (horizontal only). Lines are rectangles of component/divider/thickness in color/border/subtle.
const page = await figma.getNodeByIdAsync('343:1635');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (n) => {
  const v = vars.find((x) => x.name === n);
  if (!v) throw new Error('missing ' + n);
  return v;
};
const paint = (n, node) => {
  const v = V(n);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const cap = styles.find((s) => s.name === 'typography/caption/md');
await figma.loadFontAsync(cap.fontName);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Divider');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Divider';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const line = (parent, name, axis) => {
  const r = figma.createRectangle();
  r.name = name;
  parent.appendChild(r);
  r.fills = [paint('color/border/subtle', r)];
  if (axis === 'h') {
    r.layoutSizingHorizontal = 'FILL';
    r.setBoundVariable('height', V('component/divider/thickness'));
  } else {
    r.layoutSizingVertical = 'FILL';
    r.setBoundVariable('width', V('component/divider/thickness'));
  }
  return r;
};
const h = figma.createComponent();
h.name = 'Orientation=horizontal';
section.appendChild(h);
h.layoutMode = 'HORIZONTAL';
h.counterAxisAlignItems = 'CENTER';
h.primaryAxisSizingMode = 'FIXED';
h.counterAxisSizingMode = 'AUTO';
h.resize(320, 1);
h.counterAxisSizingMode = 'AUTO';
h.setBoundVariable('itemSpacing', V('space/content/sm'));
h.fills = [];
line(h, 'Line', 'h');
const t = figma.createText();
t.textStyleId = cap.id;
t.characters = 'Or';
t.autoRename = false;
t.name = 'Label';
h.appendChild(t);
t.fills = [paint('color/content/secondary', t)];
const end = line(h, 'Line end', 'h');
const v = figma.createComponent();
v.name = 'Orientation=vertical';
section.appendChild(v);
v.layoutMode = 'VERTICAL';
v.primaryAxisSizingMode = 'FIXED';
v.counterAxisSizingMode = 'AUTO';
v.resize(1, 24);
v.counterAxisSizingMode = 'AUTO';
v.fills = [];
line(v, 'Line', 'v');
const set = figma.combineAsVariants([h, v], section);
set.name = 'Divider';
const pShow = set.addComponentProperty('Show label', 'BOOLEAN', false);
const pLabel = set.addComponentProperty('Label', 'TEXT', 'Or');
const hv = set.children.find((c) => c.name === 'Orientation=horizontal');
hv.findChild((n) => n.name === 'Label').componentPropertyReferences = { visible: pShow, characters: pLabel };
hv.findChild((n) => n.name === 'Line end').componentPropertyReferences = { visible: pShow };
hv.x = 24;
hv.y = 24;
const vv = set.children.find((c) => c.name === 'Orientation=vertical');
vv.x = 24 + 320 + 48;
vv.y = 24;
set.resizeWithoutConstraints(24 + 320 + 48 + 1 + 24, 24 + 24 + 24);
set.fills = [];
set.x = 80;
set.y = 80;
set.description =
  'Divider (content/divider): a line of component/divider/thickness (1 px) in color/border/subtle between two groups of content, with no margin of its own (spacing comes from the layout). Horizontal spans the width it is given (resize the instance); Show label centers a short label (Or, Today) in caption/md and color/content/secondary, space/content/sm from the line on both sides. Vertical separates items in a row: give it the height of the row. The separator semantics and decorative are behaviors of the code.';
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return { section: section.id, set: set.id, key: set.key, h: hv.height, vw: vv.width };
// Built on 2026-11-14: section 545:645, set 545:652.
