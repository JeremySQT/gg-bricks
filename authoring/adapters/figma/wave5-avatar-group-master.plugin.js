// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// AvatarGroup section of the Content page. Figma-only Brand variables avatar-group/spacing/{size} hold the negative
// item spacing (−component/avatar-group/overlap/{size}: Figma cannot negate an alias; hidden from publishing, kept by
// the prune script like checkbox/focus-radius). The set (Size × Shape, 10 variants) holds five Avatar instances with a
// ring (outside stroke of border/width/strong in color/surface/default) and the +N box (an Avatar, Initials "+3"); each
// avatar is drawn above the previous one (auto layout order).
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1635');
await figma.setCurrentPageAsync(page);
let vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const brand = cols.find((c) => c.name === 'Foundations · Brand');
const S = ['md', 'xs', 'sm', 'lg', 'xl'];
const OV = { xs: 6, sm: 8, md: 10, lg: 12, xl: 16 };
for (const s of S) {
  const name = 'avatar-group/spacing/' + s;
  let v = vars.find((x) => x.name === name);
  if (!v) v = figma.variables.createVariable(name, brand, 'FLOAT');
  v.scopes = ['GAP'];
  v.hiddenFromPublishing = true;
  v.description = 'Figma only: −component/avatar-group/overlap/' + s + ' (auto layout spacing of the AvatarGroup).';
  for (const m of brand.modes) v.setValueForMode(m.modeId, -OV[s]);
}
vars = await figma.variables.getLocalVariablesAsync();
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
const AV = await figma.getNodeByIdAsync('543:605');
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const variant = (s, sh, ct) => AV.children.find((v) => v.name === `Size=${s}, Shape=${sh}, Content=${ct}`);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'AvatarGroup');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'AvatarGroup';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const CONTENT = ['picture', 'initials', 'picture', 'initials', 'initials'];
const INI = ['', 'LS', '', 'DW', 'NC'];
const variants = [];
for (const sh of ['circle', 'square'])
  for (const s of S) {
    const c = figma.createComponent();
    c.name = `Size=${s}, Shape=${sh}`;
    section.appendChild(c);
    c.layoutMode = 'HORIZONTAL';
    c.counterAxisAlignItems = 'CENTER';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.setBoundVariable('itemSpacing', V('avatar-group/spacing/' + s));
    c.fills = [];
    c.clipsContent = false;
    const items = CONTENT.map((ct, i) => [variant(s, sh, ct), ct === 'initials' ? INI[i] : null, 'Avatar ' + (i + 1)]);
    items.push([variant(s, sh, 'initials'), '+3', 'Overflow']);
    for (const [comp, ini, name] of items) {
      const i = comp.createInstance();
      i.name = name;
      c.appendChild(i);
      if (ini) {
        const t = i.findOne((n) => n.name === 'Initials');
        if (s === 'xs') t.characters = ini.slice(0, ini.startsWith('+') ? 2 : 1);
        else i.setProperties({ [Object.keys(i.componentProperties).find((k) => k.startsWith('Initials'))]: ini });
      }
      i.strokes = [paint('color/surface/default', i)];
      i.strokeAlign = 'OUTSIDE';
      for (const f of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'])
        i.setBoundVariable(f, V('border/width/strong'));
    }
    variants.push(c);
  }
const set = figma.combineAsVariants(variants, section);
set.name = 'AvatarGroup';
const props = {};
for (const n of ['Avatar 3', 'Avatar 4', 'Avatar 5', 'Show overflow'])
  props[n] = set.addComponentProperty(n, 'BOOLEAN', true);
for (const v of set.children)
  for (const n of ['Avatar 3', 'Avatar 4', 'Avatar 5'])
    v.findChild((x) => x.name === n).componentPropertyReferences = { visible: props[n] };
for (const v of set.children)
  v.findChild((x) => x.name === 'Overflow').componentPropertyReferences = { visible: props['Show overflow'] };
set.children.forEach((v, j) => {
  v.x = 24;
  v.y = 24 + j * 96;
});
set.children.forEach((v) => {
  const [s, sh] = v.name.split(', ').map((p) => p.split('=')[1]);
  v.x = 24 + (sh === 'square' ? 360 : 0);
  v.y = 24 + S.indexOf(s) * 96;
});
set.resizeWithoutConstraints(24 + 360 + Math.max(...set.children.map((v) => v.width)) + 24, 24 + 5 * 96);
set.fills = [];
set.x = 80;
set.y = 80;
set.description =
  'AvatarGroup (content/avatar-group): the people (or teams) involved in an object as a row of overlapping Avatar instances of the group size and shape, each overlapping the previous one by component/avatar-group/overlap/{size} (a quarter of the size) and drawn above it, with a ring of border/width/strong in color/surface/default (on another surface, set the ring to that surface). Overflow is an Avatar whose Initials hold +N (the number of the others, +99 at most; select the layer to edit it). Avatars 3 to 5 and the overflow can be hidden; the code shows at most max boxes, the +N box included, and counts total. Each avatar picture or initials is set on its layer.';
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return { section: section.id, set: set.id, key: set.key, n: set.children.length, first: set.children[0].name };
