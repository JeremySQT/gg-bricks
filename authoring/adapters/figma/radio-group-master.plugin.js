// RadioGroup master builder (use_figma body), 2026-10-27.
// On the page forms/radio-group (288:7): the component set “RadioGroup” (Orientation × Size, 6 variants) holding
// eight Radio instances (290:257) of the group's size, Option 1 to Option 8, the second one selected. Options 1 and 2
// always show; the booleans Show option 3 … Show option 8 show the others (3 by default, 2026-10-28), and every
// option is an exposed instance, so designers set its label, selection, state and description from the group's
// panel without detaching. Vertical stacks them with space/content/sm; horizontal places them on a wrapping row with
// space/content/lg between radios and space/content/sm between lines. A hidden text layer holds the group's
// accessible name (Label) when the group is used without a Field. Rerunning replaces the set
// (radio-group-options.plugin.js migrated the set built on 2026-10-27 in place).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:7');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'RadioGroup' || n.name.startsWith('Orientation='))) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const bind = (node, fields, name) => {
  for (const f of fields) node.setBoundVariable(f, V(name));
};
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const styles = await figma.getLocalTextStylesAsync();
const radio = await figma.getNodeByIdAsync('290:257');
const RP = radio.componentPropertyDefinitions;
const RLABEL = Object.keys(RP).find((k) => k.startsWith('Label'));
const variant = (s, sel) => radio.children.find((c) => c.name === `Size=${s}, Selection=${sel}, State=default`);
const O = ['vertical', 'horizontal'];
const S = ['md', 'sm', 'lg'];
const LABELS = ['Standard', 'Express', 'Pick up in store', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Option 8'];
const comps = [];
for (const o of O)
  for (const s of S) {
    const c = figma.createComponent();
    c.name = `Orientation=${o}, Size=${s}`;
    c.layoutMode = o === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.counterAxisAlignItems = 'MIN';
    c.fills = [];
    c.clipsContent = false;
    if (o === 'vertical') bind(c, ['itemSpacing'], 'space/content/sm');
    else {
      c.layoutWrap = 'WRAP';
      bind(c, ['itemSpacing'], 'space/content/lg');
      bind(c, ['counterAxisSpacing'], 'space/content/sm');
    }
    LABELS.forEach((label, i) => {
      const inst = variant(s, i === 1 ? 'on' : 'off').createInstance();
      inst.name = `Option ${i + 1}`;
      inst.setProperties({ [RLABEL]: label });
      c.appendChild(inst);
      // Each option is exposed: its Label, Description, Selection and State are set from the group's panel.
      inst.isExposedInstance = true;
      inst.visible = i < 3;
    });
    const name = figma.createText();
    name.name = 'Label (accessible name, not shown)';
    await name.setTextStyleIdAsync(styles.find((x) => x.name === 'typography/label/md').id);
    name.characters = 'Delivery speed';
    c.appendChild(name);
    name.layoutPositioning = 'ABSOLUTE';
    name.visible = false;
    comps.push(c);
  }
const set = figma.combineAsVariants(comps, page);
set.name = 'RadioGroup';
set.description =
  'Exactly one choice among a few options, all visible. Source of truth: foundations/components/forms/radio-group/contract.json; implementation: packages/svelte/src/components/radio-group. Orientation and Size mirror the code (default vertical · md); the radios inside take the group’s size. Select one radio (Selection on) and keep the others off; for a readonly, invalid or disabled group set that State on every radio. Inside a Field the field label names the group; alone, Label is its accessible name (not shown). Options 1 and 2 always show; Show option 3 … Show option 8 add options. Each option is exposed: set its Label, Description, Selection and State from the group’s panel.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Delivery speed');
// Options 1 and 2 always show (a group has at least two); Show option 3 … 8 add the others (2026-10-28).
const SHOW = {};
for (let i = 3; i <= LABELS.length; i++) SHOW[i] = set.addComponentProperty(`Show option ${i}`, 'BOOLEAN', i === 3);
for (const v of set.children) {
  v.children.find((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
  for (let i = 3; i <= LABELS.length; i++)
    v.children.find((n) => n.name === `Option ${i}`).componentPropertyReferences = { visible: SHOW[i] };
}
const GAP = 32;
let x = GAP;
set.children.forEach((v, k) => {
  if (k === 3) x = GAP;
  v.x = x;
  v.y = k < 3 ? GAP : GAP + Math.max(...set.children.slice(0, 3).map((c) => c.height)) + 48;
  x += v.width + 48;
});
const right = Math.max(...set.children.map((v) => v.x + v.width));
const bottom = Math.max(...set.children.map((v) => v.y + v.height));
set.resizeWithoutConstraints(right + GAP, bottom + GAP);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions)
};
