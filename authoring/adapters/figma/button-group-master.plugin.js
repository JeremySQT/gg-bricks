// ButtonGroup master builder (use_figma body), 2026-11-03.
// 2026-11-04 (user review of the Figma parity): the items of horizontal groups are centered on the cross axis.
// On the Actions library page (343:2), section ButtonGroup: the set “ButtonGroup” (15 variants: horizontal × Align
// start, center, end, stretch × Size md, sm, lg, and vertical × Size). Each variant is a vertical auto layout (400 wide
// horizontal, 240 vertical) holding one Figma slot “Items” (one SLOT property shared by the variants, Button and
// IconButton preferred and the only allowed content, at least one item) laid out in the orientation with the gap
// space/control/gap/{size}; horizontal alignment start/center/end, stretch shares the width (layoutGrow), vertical Buttons
// fill the width, an IconButton keeps its square at the start. Default items: Save (accent solid) and Cancel (neutral
// outline), plus a neutral ghost IconButton in vertical. Button items clear their minimum height (the 44 px target)
// so that the gap separates the surfaces as in the code; filling Buttons also fill their Container (the master hugs).
// A hidden text behind the Label property is the group name. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:2');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const BTN = await figma.getNodeByIdAsync('48:1586');
const IB = await figma.getNodeByIdAsync('211:1167');
const parse = (n) => Object.fromEntries(n.split(', ').map((p) => p.split('=')));
const variant = (set, want) =>
  set.children.find((c) => {
    const q = parse(c.name);
    return Object.entries(want).every(([k, v]) => q[k] === v);
  });
const bprop = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'ButtonGroup');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'ButtonGroup';
  page.appendChild(section);
  section.y = Math.max(...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'ButtonGroup')) n.remove();
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const lst = (await figma.getLocalTextStylesAsync()).find((s) => s.name === 'typography/label/md');
const cases = [];
for (const s of ['md', 'sm', 'lg'])
  for (const al of ['start', 'center', 'end', 'stretch']) cases.push(['horizontal', al, s]);
for (const s of ['md', 'sm', 'lg']) cases.push(['vertical', 'start', s]);
const comps = [];
for (const [o, al, s] of cases) {
  const c = figma.createComponent();
  c.name = `Orientation=${o}, Align=${al}, Size=${s}`;
  c.layoutMode = 'VERTICAL';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(o === 'horizontal' ? 400 : 240, 40);
  c.primaryAxisSizingMode = 'AUTO';
  c.itemSpacing = 0;
  c.fills = [];
  c.clipsContent = false;
  const slot = c.createSlot();
  slot.name = 'Items';
  slot.fills = [];
  slot.clipsContent = false;
  slot.layoutMode = o === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
  slot.primaryAxisSizingMode = 'AUTO';
  slot.counterAxisSizingMode = 'AUTO';
  slot.setBoundVariable('itemSpacing', V(`space/control/gap/${s}`));
  slot.layoutSizingHorizontal = 'FILL';
  if (o === 'horizontal') {
    slot.primaryAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX', stretch: 'MIN' }[al];
    // Centered on the cross axis, so that an IconButton lines up with the buttons (user review, 2026-11-04).
    slot.counterAxisAlignItems = 'CENTER';
  }
  for (const [want, label] of [
    [{ Intent: 'accent', Appearance: 'solid', Size: s, State: 'default' }, 'Save'],
    [{ Intent: 'neutral', Appearance: 'outline', Size: s, State: 'default' }, 'Cancel']
  ]) {
    const i = variant(BTN, want).createInstance();
    slot.appendChild(i);
    bprop(i, 'Label', label);
    i.setBoundVariable('minHeight', null);
    i.minHeight = null;
    if (o === 'vertical' || al === 'stretch') {
      if (o === 'horizontal') i.layoutGrow = 1;
      i.layoutSizingHorizontal = 'FILL';
      i.findChild((n) => n.name === 'Container').layoutSizingHorizontal = 'FILL';
    }
  }
  if (o === 'vertical')
    slot.appendChild(
      variant(IB, { Intent: 'neutral', Appearance: 'ghost', Size: s, State: 'default' }).createInstance()
    );
  const t = figma.createText();
  c.appendChild(t);
  t.name = 'Group name (not shown)';
  t.textStyleId = lst.id;
  t.characters = ' ';
  t.visible = false;
  comps.push(c);
}
const set = figma.combineAsVariants(comps, section);
set.name = 'ButtonGroup';
// Slots of the same name already share one SLOT property after combineAsVariants; merge them if not.
let slotDefs = Object.keys(set.componentPropertyDefinitions).filter(
  (k) => set.componentPropertyDefinitions[k].type === 'SLOT'
);
if (slotDefs.length > 1) {
  for (const v of set.children)
    v.findChild((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slotDefs[0] };
  for (const k of slotDefs.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
  slotDefs = [slotDefs[0]];
}
set.editComponentProperty(slotDefs[0], {
  name: 'Items',
  description:
    'The Buttons and IconButtons of the group, in source order (the order is the priority). Give every item the Size of the group: the code sets it once on the group; Figma slots cannot pass it.',
  preferredValues: [
    { type: 'COMPONENT_SET', key: BTN.key },
    { type: 'COMPONENT_SET', key: IB.key }
  ],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const labelKey = set.addComponentProperty('Label', 'TEXT', ' ');
for (const v of set.children)
  v.findChild((n) => n.type === 'TEXT').componentPropertyReferences = { characters: labelKey };
set.description =
  'ButtonGroup (actions/button-group): related actions placed together (dialog footer, form actions, alert or toast actions) with the gap space/control/gap/{size}; no surface, border or padding of its own. Items slot: Buttons and IconButtons in source order; set every item to the Size of the group. Horizontal: Align start, center, end, or stretch (items share the width). Vertical: Buttons take the full width, an IconButton keeps its square at the start. A horizontal group that does not fit stacks vertically in the code (never wraps): use the vertical variant for that case. Label (hidden): the group name, exposed when not empty.';
let y = 32;
for (const s of ['md', 'sm', 'lg']) {
  const rowV = set.children.filter((v) => parse(v.name).Size === s && parse(v.name).Orientation === 'horizontal');
  rowV.forEach((v) => {
    v.x = 32 + ['start', 'center', 'end', 'stretch'].indexOf(parse(v.name).Align) * 440;
    v.y = y;
  });
  y += Math.max(...rowV.map((v) => v.height)) + 40;
}
let x = 32;
for (const s of ['md', 'sm', 'lg']) {
  const v = set.children.find((v) => parse(v.name).Size === s && parse(v.name).Orientation === 'vertical');
  v.x = x;
  v.y = y;
  x += 280;
}
const vh = Math.max(...set.children.filter((v) => parse(v.name).Orientation === 'vertical').map((v) => v.height));
set.resizeWithoutConstraints(32 + 4 * 440, y + vh + 32);
set.x = 80;
set.y = 80;
section.resizeWithoutConstraints(set.width + 160, set.height + 160);
return { section: section.id, set: set.id };
