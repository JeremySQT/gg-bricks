// Library pages by family (use_figma body), 2026-10-29.
// User decision: one library page per family holds the masters, one section per component (the Assets panel
// groups components by page, then by section); the component pages keep the specification and its instances.
// Set FAMILY below (Actions, Content, Forms) and run once per family. The script creates the family page if needed
// (after the Foundations separator, in the order Actions, Content, Forms), creates a section per component named
// after it, and moves into it the component set and its internal parts (IDs are kept: a node moved inside the
// file keeps its ID, and instances stay linked), keeping their relative positions. Sections stack vertically.
// Rerunning moves nothing already in place. Masters added later go to their family page, in a section of their own.
const FAMILY = 'Actions';
const LIBRARY = {
  Actions: [
    ['Button', ['48:1586', '75:14', '42:28']],
    ['IconButton', ['211:1167']],
    // The locked backdrop behind the “on inverse” rows of Link travels with the set.
    ['Link', ['232:659', '232:442', '237:400']]
  ],
  Content: [
    ['Badge', ['220:293']],
    ['Counter', ['149:1568', '278:261']],
    ['Icon', ['149:20']],
    ['Shortcut', ['151:110', '149:1581', '149:1582', '278:1153']]
  ],
  Forms: [
    ['Checkbox', ['289:428', '289:4', '289:7']],
    ['Field', ['295:77']],
    ['InputText', ['293:1046']],
    ['Radio', ['290:257']],
    ['RadioGroup', ['292:327']],
    ['Switch', ['291:434']],
    ['Textarea', ['294:291']]
  ]
};
const ORDER = ['Actions', 'Content', 'Forms'];
// Sections take the light canvas of the Wireframe collection (the default section fill is dark).
const wf = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Wireframe');
const canvas = (await figma.variables.getLocalVariablesAsync()).find(
  (v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id
);
const PAD = 80;
const GAP = 160;
// The family page: after the separator that follows Foundations, in ORDER.
let page = figma.root.children.find((p) => p.name === FAMILY);
if (!page) {
  page = figma.createPage();
  page.name = FAMILY;
  const after = figma.root.children.findIndex((p) => p.name === 'Foundations') + 2;
  const before = ORDER.slice(0, ORDER.indexOf(FAMILY)).filter((f) => figma.root.children.some((p) => p.name === f));
  figma.root.insertChild(after + before.length, page);
}
await page.loadAsync();
const out = { page: page.id, sections: {}, moved: [], kept: [] };
let y = 0;
for (const s of page.children) y = Math.max(y, s.y + s.height + GAP);
for (const [name, ids] of LIBRARY[FAMILY]) {
  const nodes = [];
  for (const id of ids) {
    const n = await figma.getNodeByIdAsync(id);
    if (!n) throw new Error('missing ' + id);
    nodes.push(n);
  }
  let section = page.children.find((n) => n.type === 'SECTION' && n.name === name);
  const todo = nodes.filter((n) => n.parent !== section);
  if (!section) {
    section = figma.createSection();
    section.name = name;
    page.appendChild(section);
    section.fills = [
      figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
    ];
    section.x = 0;
    section.y = y;
  }
  if (todo.length) {
    const minX = Math.min(...todo.map((n) => n.x));
    const minY = Math.min(...todo.map((n) => n.y));
    // Keep the drawing order of the source page (the backdrop stays behind the Link set).
    todo.sort((a, b) => a.parent.children.indexOf(a) - b.parent.children.indexOf(b));
    const x0 = section.children.length ? Math.max(...section.children.map((c) => c.x + c.width)) + GAP : PAD;
    for (const n of todo) {
      const [dx, dy] = [n.x - minX, n.y - minY];
      const locked = n.locked;
      n.locked = false;
      section.appendChild(n);
      n.x = x0 + dx;
      n.y = PAD + dy;
      n.locked = locked;
      out.moved.push(`${n.id} ${n.name}`);
    }
  }
  for (const n of nodes) if (!todo.includes(n)) out.kept.push(n.id);
  section.resizeWithoutConstraints(
    Math.max(...section.children.map((c) => c.x + c.width)) + PAD,
    Math.max(...section.children.map((c) => c.y + c.height)) + PAD
  );
  out.sections[name] = section.id;
  y = Math.max(y, section.y + section.height + GAP);
}
// Every listed ID still resolves, now inside its section.
out.lost = [];
for (const [name, ids] of LIBRARY[FAMILY])
  for (const id of ids) {
    const n = await figma.getNodeByIdAsync(id);
    if (!n || n.parent.id !== out.sections[name]) out.lost.push(id);
  }
out.order = figma.root.children.map((p) => p.name);
return out;
