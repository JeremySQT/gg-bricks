// Wave 5 (use_figma body), 2026-11-14, rebuilt on 2026-11-17 (user review: content variants), session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// DataField section of the Data page: the DataField component set (Orientation × Size × Content, 20 variants). Label text
// property; Value slot (free content, a body text by default); Content: text, empty (the em dash in
// color/content/tertiary), badge (Badge md), link (Link) or avatar (Avatar xs and a name), as a design aid.
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
const BADGE = await figma.getNodeByIdAsync('220:293');
const LINK = await figma.getNodeByIdAsync('232:659');
const AV = await figma.getNodeByIdAsync('543:605');
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const pick = (set, want) =>
  set.children.find((v) => Object.entries(want).every(([k, x]) => v.name.includes(`${k}=${x}`)));
const setP = (i, name, val) => {
  const k = Object.keys(i.componentProperties).find(
    (x) => x.split('#')[0] === name && i.componentProperties[x].type !== 'SLOT'
  );
  i.setProperties({ [k]: val });
};
const KINDS = ['text', 'empty', 'badge', 'link', 'avatar'];
const variants = [];
for (const o of ['vertical', 'horizontal'])
  for (const s of ['md', 'sm'])
    for (const kind of KINDS) {
      const c = figma.createComponent();
      c.name = `Orientation=${o}, Size=${s}, Content=${kind}`;
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
      if (kind === 'empty') {
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
        if (kind === 'text') {
          const v = text(sl, 'Value text', 'body/' + s, 'olivia@example.com', 'color/content/primary');
          v.layoutSizingHorizontal = 'FILL';
          v.textAutoResize = 'HEIGHT';
        } else if (kind === 'badge') {
          const b = pick(BADGE, { Intent: 'success', Appearance: 'subtle', Size: 'md' }).createInstance();
          sl.appendChild(b);
          setP(b, 'Label', 'Active');
        } else if (kind === 'link') {
          const ln = pick(LINK, { Color: 'accent', Size: s, State: 'default' }).createInstance();
          sl.appendChild(ln);
          setP(ln, 'Label', 'acme.example.com');
        } else {
          sl.layoutMode = 'HORIZONTAL';
          sl.counterAxisSizingMode = 'AUTO';
          sl.counterAxisAlignItems = 'CENTER';
          sl.itemSpacing = 8;
          const av = pick(AV, { Size: 'xs', Shape: 'circle', Content: 'picture' }).createInstance();
          av.name = 'Avatar';
          sl.appendChild(av);
          text(sl, 'Name', 'body/' + s, 'Olivia Rhye', 'color/content/primary');
        }
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
  const [o, s, k] = v.name.split(', ').map((p) => p.split('=')[1]);
  v.x = 24 + KINDS.indexOf(k) * 520;
  v.y = 24 + (o === 'horizontal' ? 2 : 0) * 88 + (s === 'sm' ? 88 : 0);
});
// Horizontal avatar variants center the label on the avatar row (a baseline would sit it at the avatar bottom).
for (const v of set.children.filter((v) => v.name.includes('horizontal') && v.name.includes('Content=avatar')))
  v.counterAxisAlignItems = 'CENTER';
set.resizeWithoutConstraints(24 + 4 * 520 + 480 + 24, 24 + 4 * 88);
set.fills = [];
set.x = 80;
set.y = 80;
set.description =
  'DataField (data/data-field): one piece of information as a label and its value, for reading (never a disabled input). Label in label/{size} and color/content/tertiary, value in body/{size} and color/content/primary; both wrap. Vertical: label above value, space/content/xs apart (320 px wide by default, resize the instance). Horizontal: label in a column of component/data-field/label-inline-size (160 px), value beside it after space/content/md, aligned on their first baselines; the code stacks it below 320 px. Content: text, empty (an em dash in color/content/tertiary; the code announces emptyLabel), badge, link or avatar with a name, as starting points; the Value slot takes any content. Sizes sm and md; typographies do not follow density.';
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 0.6 });
return { section: section.id, set: set.id, key: set.key, n: set.children.length, first: set.children[0].name };
