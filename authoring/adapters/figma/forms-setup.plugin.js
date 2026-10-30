// Wave 2 form components, setup (use_figma body), 2026-10-27.
// Creates (or reuses) a divider and the pages forms/checkbox, forms/field, forms/input-text, forms/radio,
// forms/radio-group, forms/switch, forms/textarea after content/shortcut, and the adapter variables of the hidden
// Components collection (modes sm, md, lg) that Figma cannot compute from the tokens (a fraction or a sum of a
// variable). Each adapter value is derived from the contract rules; none is a source token. Idempotent.
const ORDER = ['checkbox', 'field', 'input-text', 'radio', 'radio-group', 'switch', 'textarea'];
const pages = figma.root.children;
let at = pages.findIndex((p) => p.name === 'content/shortcut') + 1;
const created = [];
const ids = {};
if (!pages.some((p) => p.name === 'forms/checkbox')) {
  const divider = figma.createPage();
  divider.name = '---';
  figma.root.insertChild(at, divider);
  created.push(divider.id);
}
at = figma.root.children.findIndex((p) => p.name === 'content/shortcut') + 2;
for (const id of ORDER) {
  let page = figma.root.children.find((p) => p.name === `forms/${id}`);
  if (!page) {
    page = figma.createPage();
    page.name = `forms/${id}`;
    figma.root.insertChild(at, page);
    created.push(page.id);
  }
  at = figma.root.children.indexOf(page) + 1;
  ids[id] = page.id;
}
// Adapter variables: { name: { sm, md, lg } }.
const ADAPTERS = {
  // Drawing box of an icon placed by its drawing: iconSize − iconSize/4 (size/icon/{sm,md,lg} = 16, 20, 24).
  'input-text/icon-box': { sm: 12, md: 15, lg: 18 },
  // Field message icon: size/icon/sm (16) − 4, whatever the control size.
  'field/icon-box': { sm: 12, md: 12, lg: 12 },
  // Radio dot: 3/8 of size/choice/{sm,md,lg} (14, 16, 20).
  'radio/dot': { sm: 5.25, md: 6, lg: 7.5 },
  // Switch: track inline size 2 × trackSize − 4 × borderWidth, thumb trackSize − 4 × borderWidth, inset 2 × borderWidth
  // (size/switch = 16, 20, 24; border/width/default = 1 in every brand).
  'switch/track-width': { sm: 28, md: 36, lg: 44 },
  'switch/thumb': { sm: 12, md: 16, lg: 20 },
  'switch/inset': { sm: 2, md: 2, lg: 2 },
  // Textarea: the rows after the first, (rows − 1) × line height of typography/body/{size} at the default 3 rows
  // (21, 24, 28.8 px lines): the first row is a frame of size/control, so the block padding stays exact per density.
  'textarea/more-rows': { sm: 42, md: 48, lg: 57.6 }
};
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const ac = cols.find((c) => c.name === 'Components');
const vars = await figma.variables.getLocalVariablesAsync();
const adapterIds = {};
for (const [name, values] of Object.entries(ADAPTERS)) {
  let v = vars.find((x) => x.name === name && x.variableCollectionId === ac.id);
  if (!v) v = figma.variables.createVariable(name, ac, 'FLOAT');
  v.scopes = ['WIDTH_HEIGHT', 'GAP'];
  v.hiddenFromPublishing = true;
  for (const m of ac.modes) v.setValueForMode(m.modeId, values[m.name]);
  adapterIds[name] = v.id;
}
return { created, pages: ids, adapters: adapterIds };
