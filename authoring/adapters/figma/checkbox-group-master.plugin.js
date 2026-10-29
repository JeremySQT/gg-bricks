// CheckboxGroup master builder (use_figma body), 2026-10-29.
// The RadioGroup model approved by the user on 2026-10-29: the component set "CheckboxGroup" (Orientation, 2
// variants) in the section CheckboxGroup of the Forms library page (343:1640), each variant holding the slot
// Options (one SLOT property shared by both variants: Checkbox instances, two at least, Checkbox the preferred and
// only allowed content; default three Checkbox md, the first one checked). The slot carries the layout: vertical,
// gap space/content/sm; horizontal, wrapping, space/content/lg between checkboxes and space/content/sm between
// lines (the variant has a fixed width, the slot fills it). Size is set on each Checkbox (a slot cannot pass the
// group's size to its content). A hidden text layer holds the group's accessible name (Label) when the group is
// used without a Field. Also creates the component page forms/checkbox-group (after forms/checkbox) for the
// specification, and stacks the sections of the Forms page in alphabetical order. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const forms = await figma.getNodeByIdAsync('343:1640');
// combineAsVariants needs the components on the page of the section.
await figma.setCurrentPageAsync(forms);
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const wf = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const styles = await figma.getLocalTextStylesAsync();
const checkbox = await figma.getNodeByIdAsync('289:428');
const CLABEL = Object.keys(checkbox.componentPropertyDefinitions).find((k) => k.startsWith('Label'));
const variant = (sel) => checkbox.children.find((c) => c.name === `Size=md, Selection=${sel}, State=default`);

// Component page for the specification, after forms/checkbox.
let page = figma.root.children.find((p) => p.name === 'forms/checkbox-group');
if (!page) {
  page = figma.createPage();
  page.name = 'forms/checkbox-group';
  figma.root.insertChild(figma.root.children.findIndex((p) => p.name === 'forms/checkbox') + 1, page);
}

// Section on the Forms library page.
let section = forms.children.find((n) => n.type === 'SECTION' && n.name === 'CheckboxGroup');
if (!section) {
  section = figma.createSection();
  section.name = 'CheckboxGroup';
  forms.appendChild(section);
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) if (n.name === 'CheckboxGroup') n.remove();

const LABELS = ['Email', 'Text message', 'Push notification'];
const comps = [];
for (const o of ['vertical', 'horizontal']) {
  const c = figma.createComponent();
  c.name = `Orientation=${o}`;
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.fills = [];
  c.clipsContent = false;
  const slot = c.createSlot();
  slot.name = 'Options';
  slot.fills = [];
  slot.clipsContent = false;
  slot.layoutMode = o === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
  slot.primaryAxisSizingMode = 'AUTO';
  slot.counterAxisSizingMode = 'AUTO';
  slot.counterAxisAlignItems = 'MIN';
  if (o === 'vertical') slot.setBoundVariable('itemSpacing', V('space/content/sm'));
  else {
    slot.layoutWrap = 'WRAP';
    slot.setBoundVariable('itemSpacing', V('space/content/lg'));
    slot.setBoundVariable('counterAxisSpacing', V('space/content/sm'));
  }
  LABELS.forEach((label, i) => {
    const inst = variant(i === 0 ? 'on' : 'off').createInstance();
    inst.name = `Checkbox ${i + 1}`;
    inst.setProperties({ [CLABEL]: label });
    slot.appendChild(inst);
  });
  const name = figma.createText();
  name.name = 'Label (accessible name, not shown)';
  await name.setTextStyleIdAsync(styles.find((x) => x.name === 'typography/label/md').id);
  name.characters = 'Notification channels';
  c.appendChild(name);
  name.layoutPositioning = 'ABSOLUTE';
  name.visible = false;
  if (o === 'horizontal') {
    const w = c.width;
    c.counterAxisSizingMode = 'FIXED';
    c.resize(w, c.height);
    c.primaryAxisSizingMode = 'AUTO';
    slot.layoutSizingHorizontal = 'FILL';
  }
  comps.push(c);
}
const set = figma.combineAsVariants(comps, section);
set.name = 'CheckboxGroup';
set.fills = [];
set.description =
  'Several related checkboxes that answer one question; any number can be checked. Source of truth: foundations/components/forms/checkbox-group/contract.json; implementation: packages/svelte/src/components/checkbox-group. Orientation mirrors the code (default vertical). Options is a slot: add, remove or reorder Checkbox instances (two at least), check any of them, and give them all the same Size (the code sets it once on the group); for a readonly, invalid or disabled group set that State on every checkbox. Inside a Field the field label names the group and states the requirement (Select at least one…); alone, Label is its accessible name (not shown).';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Notification channels');
for (const v of set.children)
  v.children.find((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
// One SLOT property for both variants (combineAsVariants merges the slots of the same name).
let slotKeys = Object.keys(set.componentPropertyDefinitions).filter(
  (k) => set.componentPropertyDefinitions[k].type === 'SLOT'
);
if (slotKeys.length > 1) {
  for (const v of set.children)
    v.findChild((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slotKeys[0] };
  for (const k of slotKeys.slice(1)) set.deleteComponentProperty(k);
  slotKeys = slotKeys.slice(0, 1);
}
set.editComponentProperty(slotKeys[0], {
  name: 'Options',
  description:
    'The checkboxes of the group, in order. Add, remove or reorder Checkbox instances (two at least) and give them all the same Size: the code sets the size once on the group.',
  preferredValues: [{ type: 'COMPONENT_SET', key: checkbox.key }],
  slotSettings: { minChildren: 2, allowPreferredValuesOnly: true }
});
let x = 32;
for (const v of set.children) {
  v.x = x;
  v.y = 32;
  x += v.width + 48;
}
set.resizeWithoutConstraints(x - 48 + 32, Math.max(...set.children.map((v) => v.height)) + 64);
set.x = 80;
set.y = 80;
section.resizeWithoutConstraints(set.width + 160, set.height + 160);
// Sections of the Forms page in alphabetical order, stacked.
let y = 0;
for (const s of forms.children.filter((n) => n.type === 'SECTION').sort((a, b) => a.name.localeCompare(b.name))) {
  s.x = 0;
  s.y = y;
  y += s.height + 160;
}
return {
  page: page.id,
  section: section.id,
  set: set.id,
  variants: set.children.map((v) => [v.id, v.name, Math.round(v.width), Math.round(v.height)]),
  slots: set.children.map((v) => v.findChild((n) => n.type === 'SLOT').id),
  props: Object.entries(set.componentPropertyDefinitions).map(([k, d]) => [k, d.type]),
  order: figma.root.children.map((p) => p.name)
};
