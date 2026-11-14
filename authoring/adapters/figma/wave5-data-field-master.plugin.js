// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// DataField section of the Data page: the DataField component set (Orientation × Size × Empty, 8 variants). Label text
// property; Value slot (free content, a body text by default); Empty shows the em dash in color/content/tertiary.
const page = await figma.getNodeByIdAsync('540:63');
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
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const n of ['label/sm', 'label/md', 'body/sm', 'body/md']) await figma.loadFontAsync(style(n).fontName);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'DataField');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'DataField';
  page.appendChild(section);
  section.x = 0;
  section.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const text = (parent, name, st, chars, color) => {
  const t = figma.createText();
  t.textStyleId = style(st).id;
  t.characters = chars;
  t.autoRename = false;
  t.name = name;
  parent.appendChild(t);
  t.fills = [paint(color, t)];
  return t;
};
const variants = [];
for (const o of ['vertical', 'horizontal'])
  for (const s of ['md', 'sm'])
    for (const empty of ['false', 'true']) {
      const c = figma.createComponent();
      c.name = `Orientation=${o}, Size=${s}, Empty=${empty}`;
      section.appendChild(c);
      c.layoutMode = o === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
      c.primaryAxisSizingMode = o === 'vertical' ? 'AUTO' : 'FIXED';
      c.counterAxisSizingMode = o === 'vertical' ? 'FIXED' : 'AUTO';
      c.resize(o === 'vertical' ? 320 : 480, 40);
      if (o === 'vertical') {
        c.primaryAxisSizingMode = 'AUTO';
        c.setBoundVariable('itemSpacing', V('space/content/xs'));
      } else {
        c.counterAxisSizingMode = 'AUTO';
        c.counterAxisAlignItems = 'BASELINE';
        c.setBoundVariable('itemSpacing', V('space/content/md'));
      }
      c.fills = [];
      c.clipsContent = false;
      const l = text(c, 'Label', 'label/' + s, 'Email', 'color/content/tertiary');
      if (o === 'vertical') {
        l.layoutSizingHorizontal = 'FILL';
        l.textAutoResize = 'HEIGHT';
      } else {
        l.setBoundVariable('width', V('component/data-field/label-inline-size'));
        l.textAutoResize = 'HEIGHT';
      }
      if (empty === 'true') {
        text(c, 'Empty', 'body/' + s, '—', 'color/content/tertiary');
      } else {
        const sl = c.createSlot();
        sl.name = 'Value';
        sl.fills = [];
        sl.clipsContent = false;
        sl.layoutMode = 'VERTICAL';
        sl.primaryAxisSizingMode = 'AUTO';
        sl.counterAxisSizingMode = 'AUTO';
        c.appendChild(sl);
        sl.layoutSizingHorizontal = 'FILL';
        const v = text(sl, 'Value text', 'body/' + s, 'olivia@example.com', 'color/content/primary');
        v.layoutSizingHorizontal = 'FILL';
        v.textAutoResize = 'HEIGHT';
      }
      variants.push(c);
    }
const set = figma.combineAsVariants(variants, section);
set.name = 'DataField';
for (const v of set.children) {
  v.primaryAxisSizingMode = v.layoutMode === 'VERTICAL' ? 'AUTO' : 'FIXED';
  v.counterAxisSizingMode = v.layoutMode === 'VERTICAL' ? 'FIXED' : 'AUTO';
}
const slots = Object.entries(set.componentPropertyDefinitions)
  .filter(([, d]) => d.type === 'SLOT')
  .map(([k]) => k);
for (const v of set.children) {
  const sl = v.findOne((n) => n.type === 'SLOT');
  if (sl) sl.componentPropertyReferences = { slotContentId: slots[0] };
}
for (const k of slots.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
set.editComponentProperty(slots[0], {
  name: 'Value',
  description:
    'The value: plain text in body/{size} and color/content/primary by default, or free content (Badge, Link, Avatar with a name, several lines).',
  slotSettings: { minChildren: 0 }
});
const pLabel = set.addComponentProperty('Label', 'TEXT', 'Email');
for (const v of set.children)
  v.findChild((n) => n.name === 'Label').componentPropertyReferences = { characters: pLabel };
set.children.forEach((v) => {
  const [o, s, e] = v.name.split(', ').map((p) => p.split('=')[1]);
  v.x = 24 + (e === 'true' ? 560 : 0);
  v.y = 24 + (o === 'horizontal' ? 2 : 0) * 88 + (s === 'sm' ? 88 : 0);
});
set.resizeWithoutConstraints(24 + 560 + 480 + 24, 24 + 4 * 88);
set.fills = [];
set.x = 80;
set.y = 80;
set.description =
  'DataField (data/data-field): one piece of information as a label and its value, for reading (never a disabled input). Label in label/{size} and color/content/tertiary, value in body/{size} and color/content/primary; both wrap. Vertical: label above value, space/content/xs apart (320 px wide by default, resize the instance). Horizontal: label in a column of component/data-field/label-inline-size (160 px), value beside it after space/content/md, aligned on their first baselines; the code stacks it below 320 px. Empty: an em dash in color/content/tertiary (the code announces emptyLabel). Sizes sm and md; typographies do not follow density.';
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return { section: section.id, set: set.id, key: set.key, n: set.children.length, first: set.children[0].name };
