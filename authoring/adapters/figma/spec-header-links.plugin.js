// Links in the header of every specification (use_figma body), 2026-10-30. Replaces spec-master-links.plugin.js.
// User request: the link to the master sits at the top right of the specification, beside the title, with the links
// to the documentation and the contract once they are published. Builds in the Header of each specification a
// "Title row" (the Title on the left, a "Links" group on the right) and removes the former "Master link" line under
// the title. LINKS holds the URL templates of the published documentation and contract ({id} is the component id):
// null hides the link (nothing is published yet, and the repository is private). Rerun after rebuilding a
// specification page, adding a component or publishing (the row is rebuilt, never duplicated).
const ONLY = null; // e.g. ['Button'] to rebuild some specifications only
const LINKS = {
  Documentation: null, // at the first Deliver, e.g. 'https://docs.ggbrick.design/components/{id}/'
  Contract: null // at the first Deliver, the published contract of the package version
};
const SPECS = [
  ['144:2', 'Actions', 'Button', 'button'],
  ['211:2', 'Actions', 'IconButton', 'icon-button'],
  ['225:2', 'Actions', 'Link', 'link'],
  ['540:59', 'Content', 'Avatar', 'avatar'],
  ['540:60', 'Content', 'AvatarGroup', 'avatar-group'],
  ['220:2', 'Content', 'Badge', 'badge'],
  ['149:1547', 'Content', 'Counter', 'counter'],
  ['540:61', 'Content', 'Divider', 'divider'],
  ['149:4', 'Content', 'Icon', 'icon'],
  ['149:1569', 'Content', 'Shortcut', 'shortcut'],
  ['288:3', 'Forms', 'Checkbox', 'checkbox'],
  ['347:243', 'Forms', 'CheckboxGroup', 'checkbox-group'],
  ['288:4', 'Forms', 'Field', 'field'],
  ['288:5', 'Forms', 'InputText', 'input-text'],
  ['288:6', 'Forms', 'Radio', 'radio'],
  ['288:7', 'Forms', 'RadioGroup', 'radio-group'],
  ['288:8', 'Forms', 'Switch', 'switch'],
  ['288:9', 'Forms', 'Textarea', 'textarea'],
  ['407:110', 'Actions', 'ButtonGroup', 'button-group'],
  ['407:113', 'Feedback', 'Alert', 'alert'],
  ['407:114', 'Feedback', 'Progress', 'progress'],
  ['407:115', 'Feedback', 'Skeleton', 'skeleton'],
  ['407:116', 'Feedback', 'Spinner', 'spinner'],
  ['407:117', 'Feedback', 'Toast', 'toast'],
  ['407:120', 'Overlays', 'Dialog', 'dialog'],
  ['407:121', 'Overlays', 'Menu', 'menu'],
  ['407:122', 'Overlays', 'Popover', 'popover'],
  ['407:123', 'Overlays', 'Tooltip', 'tooltip'],
  ['495:23', 'Actions', 'Toolbar', 'toolbar'],
  ['495:21', 'Forms', 'Combobox', 'combobox'],
  ['495:22', 'Forms', 'Select', 'select'],
  ['495:17', 'Navigation', 'Accordion', 'accordion'],
  ['495:18', 'Navigation', 'Breadcrumb', 'breadcrumb'],
  ['495:19', 'Navigation', 'Pagination', 'pagination'],
  ['495:20', 'Navigation', 'Tabs', 'tabs'],
  ['540:64', 'Data', 'DataField', 'data-field'],
  ['540:65', 'Data', 'Table', 'table']
];
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const style = (await figma.getLocalTextStylesAsync()).find((s) => s.name === 'typography/label/sm');
await figma.loadFontAsync(style.fontName);
const ph = await figma.getNodeByIdAsync('199:2');
await ph.loadAsync();
const arrow = ph.findOne((n) => n.type === 'COMPONENT' && n.name === 'phosphor/arrow-up-right');
// The link chip of the library pages (family-pages.plugin.js): label and arrow, the label is the hyperlink.
async function chip(label, target) {
  const c = figma.createAutoLayout('HORIZONTAL', {
    name: `Link · ${label}`,
    itemSpacing: 6,
    counterAxisAlignItems: 'CENTER'
  });
  c.paddingLeft = c.paddingRight = 12;
  c.paddingTop = c.paddingBottom = 6;
  c.fills = [paint('color/surface/default')];
  c.strokes = [paint('color/border/default')];
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    c.setBoundVariable(k, V('radius/full'));
  const t = figma.createText();
  await t.setTextStyleIdAsync(style.id);
  t.characters = label;
  t.fills = [paint('color/content/link')];
  t.setRangeHyperlink(
    0,
    label.length,
    target.startsWith('http') ? { type: 'URL', value: target } : { type: 'NODE', value: target }
  );
  c.appendChild(t);
  const g = arrow.createInstance();
  g.rescale(14 / g.width);
  for (const n of g.findAll((n) => 'fills' in n && Array.isArray(n.fills) && n.fills.length))
    n.fills = [paint('color/content/link')];
  c.appendChild(g);
  return c;
}
const families = {};
for (const p of figma.root.children)
  if (['Actions', 'Content', 'Forms', 'Feedback', 'Overlays', 'Navigation', 'Data'].includes(p.name))
    families[p.name] = p;
const out = {};
for (const [pid, family, name, id] of SPECS) {
  if (ONLY && !ONLY.includes(name)) continue;
  const fam = families[family];
  await fam.loadAsync();
  const section = fam.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!section) throw new Error(`no section ${family} › ${name}`);
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const root = page.children.find((n) => n.name === `${name} — Specification`);
  if (!root) throw new Error('no specification ' + name);
  const header = root.children[0];
  const title = header.findOne((n) => n.name === 'Title');
  for (const n of title.children.filter((n) => n.name === 'Master link')) n.remove();
  let rowNode = header.children.find((n) => n.name === 'Title row');
  if (!rowNode) {
    rowNode = figma.createAutoLayout('HORIZONTAL', {
      name: 'Title row',
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'MIN'
    });
    rowNode.fills = [];
    header.insertChild(header.children.indexOf(title), rowNode);
    rowNode.appendChild(title);
    rowNode.layoutSizingHorizontal = 'FILL';
  }
  for (const n of rowNode.children.filter((n) => n.name === 'Links')) n.remove();
  const links = figma.createAutoLayout('HORIZONTAL', {
    name: 'Links',
    itemSpacing: 8,
    counterAxisAlignItems: 'CENTER'
  });
  links.fills = [];
  links.appendChild(await chip('Master', section.id));
  for (const [label, template] of Object.entries(LINKS))
    if (template) links.appendChild(await chip(label, template.replace('{id}', id)));
  rowNode.appendChild(links);
  out[name] = { spec: root.id, row: rowNode.id, links: links.children.length };
}
return out;
