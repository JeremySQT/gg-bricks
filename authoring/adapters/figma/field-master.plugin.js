// Field master builder (use_figma body), 2026-10-27.
// On the page forms/field (288:4): the component set “Field” (State default, invalid, disabled; 3 variants).
// Header (gap space/content/xs): the label (typography/label/md, color/content/primary) with the required
// asterisk (color/content/secondary, Required property) and the description (typography/body/sm,
// color/content/secondary). space/content/sm separates the header from the Body (gap space/content/xs): the
// Control, an exposed InputText instance (293:1046) in the state of the field (designers set its options from the
// Field instance or swap it for a Textarea, Checkbox or RadioGroup from the layers panel; an instance-swap property
// is not used because its single default would reset every variant's control to one state), and, when invalid,
// the message: the Phosphor
// warning-circle at size/icon/sm in color/status/danger/icon, placed by its drawing (field/icon-box), then the text
// in typography/body/sm and color/status/danger/content. Disabled paints label, asterisk and description in
// color/content/disabled. Field passes required, invalid and disabled to its control in code: in Figma set the
// control's State too. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:4');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'Field' || n.name.startsWith('State='))) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const bind = (node, fields, name) => {
  for (const f of fields) node.setBoundVariable(f, V(name));
};
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style: st });
const WARN = await figma.getNodeByIdAsync('200:5831'); // phosphor/warning-circle
const input = await figma.getNodeByIdAsync('293:1046');
const ST = ['default', 'invalid', 'disabled'];
const comps = [];
const icons = [];
const txt = async (name, chars, st, color) => {
  const t = figma.createText();
  t.name = name;
  await t.setTextStyleIdAsync(style(st).id);
  t.characters = chars;
  t.fills = [paint(color)];
  return t;
};
for (const st of ST) {
  const dim = (c) => (st === 'disabled' ? 'color/content/disabled' : c);
  const c = figma.createComponent();
  c.name = `State=${st}`;
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.counterAxisAlignItems = 'MIN';
  c.fills = [];
  c.clipsContent = false;
  c.resize(320, 100);
  bind(c, ['itemSpacing'], 'space/content/sm');
  const header = figma.createAutoLayout('VERTICAL', { name: 'Header' });
  header.fills = [];
  c.appendChild(header);
  header.layoutSizingHorizontal = 'FILL';
  bind(header, ['itemSpacing'], 'space/content/xs');
  const row = figma.createAutoLayout('HORIZONTAL', { name: 'Label row', itemSpacing: 0 });
  row.fills = [];
  header.appendChild(row);
  row.appendChild(await txt('Label', 'Email', 'label/md', dim('color/content/primary')));
  row.appendChild(await txt('Required indicator', ' *', 'label/md', dim('color/content/secondary')));
  const desc = await txt('Description', 'We send invoices to this address.', 'body/sm', dim('color/content/secondary'));
  header.appendChild(desc);
  desc.layoutSizingHorizontal = 'FILL';
  desc.textAutoResize = 'HEIGHT';
  const body = figma.createAutoLayout('VERTICAL', { name: 'Body' });
  body.fills = [];
  c.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';
  bind(body, ['itemSpacing'], 'space/content/xs');
  const control = input.children
    .find((v) => v.name === `Size=md, Action=none, Content=placeholder, State=${st}`)
    .createInstance();
  control.name = 'Control';
  body.appendChild(control);
  control.layoutSizingHorizontal = 'FILL';
  if (st === 'invalid') {
    const msg = figma.createAutoLayout('HORIZONTAL', { name: 'Message' });
    msg.fills = [];
    msg.clipsContent = false;
    msg.counterAxisAlignItems = 'MIN';
    body.appendChild(msg);
    msg.layoutSizingHorizontal = 'FILL';
    bind(msg, ['itemSpacing'], 'space/content/xs');
    const line = figma.createAutoLayout('HORIZONTAL', { name: 'First line' });
    line.fills = [];
    line.clipsContent = false;
    line.counterAxisAlignItems = 'CENTER';
    msg.appendChild(line);
    line.counterAxisSizingMode = 'FIXED';
    bind(line, ['height'], 'typography/body/sm/lineHeight');
    const draw = figma.createAutoLayout('HORIZONTAL', { name: 'Drawing box' });
    draw.fills = [];
    draw.clipsContent = false;
    draw.primaryAxisAlignItems = 'CENTER';
    draw.counterAxisAlignItems = 'CENTER';
    line.appendChild(draw);
    draw.primaryAxisSizingMode = 'FIXED';
    draw.counterAxisSizingMode = 'FIXED';
    bind(draw, ['width'], 'field/icon-box');
    bind(draw, ['height'], 'size/icon/sm');
    const icon = WARN.createInstance();
    icon.name = 'Message icon';
    draw.appendChild(icon);
    bind(icon, ['width', 'height'], 'size/icon/sm');
    icons.push(icon);
    const m = await txt(
      'Message text',
      'Enter an email address like name@example.com.',
      'body/sm',
      'color/status/danger/content'
    );
    msg.appendChild(m);
    m.layoutSizingHorizontal = 'FILL';
    m.textAutoResize = 'HEIGHT';
  }
  comps.push(c);
}
const set = figma.combineAsVariants(comps, page);
set.name = 'Field';
set.description =
  'Gives one control its visible label, an optional description, the required asterisk and the error message. Source of truth: foundations/components/forms/field/contract.json; implementation: packages/svelte/src/components/field. State invalid shows the message, disabled dims the texts. The Control is an InputText; swap it for a Textarea, a Checkbox or a RadioGroup from the layers panel and set the control’s State to match the field (the code passes required, invalid and disabled to it). The field text does not change with the control size. Field never validates: the application decides when it is invalid.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Email');
const DESC = set.addComponentProperty('Description', 'TEXT', 'We send invoices to this address.');
const MSG = set.addComponentProperty('Message', 'TEXT', 'Enter an email address like name@example.com.');
const REQ = set.addComponentProperty('Required', 'BOOLEAN', false);
const SHOW_DESC = set.addComponentProperty('Show description', 'BOOLEAN', true);
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Required indicator').componentPropertyReferences = { visible: REQ };
  v.findOne((n) => n.name === 'Description').componentPropertyReferences = { characters: DESC, visible: SHOW_DESC };
  const mt = v.findOne((n) => n.name === 'Message text');
  if (mt) mt.componentPropertyReferences = { characters: MSG };
  v.findOne((n) => n.name === 'Control').isExposedInstance = true;
}
for (const icon of icons)
  for (const g of icon.findAll((n) => n.type === 'VECTOR')) g.fills = [paint('color/status/danger/icon')];
const GAP = 32;
set.children.forEach((v, k) => {
  v.x = GAP + k * 360;
  v.y = GAP;
});
set.resizeWithoutConstraints(GAP * 2 + 3 * 360 - 40, GAP * 2 + Math.max(...set.children.map((v) => v.height)));
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
