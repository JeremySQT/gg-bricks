// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Avatar section of the Content page: the Avatar component set (Size × Shape × Content, 30 variants). Pictures are
// the SVG portraits of examples/avatar/portraits (olivia, acme); designers replace the Picture layer with an image fill.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1635');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const paint = (name, node) => {
  const v = V(name);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, fields, name) => {
  for (const f of fields) n.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const S = ['md', 'xs', 'sm', 'lg', 'xl'];
for (const s of S)
  await figma.loadFontAsync(styles.find((x) => x.name === 'component/avatar/typography/' + s).fontName);
const USER = await figma.getNodeByIdAsync('200:5808');
const SVG = {
  circle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#c9d7f2"/><path d="M28 200c4-38 34-58 72-58s68 20 72 58z" fill="#5b6fb5"/><rect x="88" y="112" width="24" height="34" rx="10" fill="#e9b99a"/><ellipse cx="100" cy="86" rx="34" ry="40" fill="#e9b99a"/><path d="M58 70c0-30 18-46 42-46s42 16 42 46v54h-18V78H76v46H58z" fill="#3b2a20"/></svg>',
  square:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1f3a5f"/><path d="M100 46l50 108H50z" fill="#f2a541"/><path d="M100 92l22 48H78z" fill="#1f3a5f"/></svg>'
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Avatar');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Avatar';
  page.appendChild(section);
  section.x = 0;
  section.y = Math.max(...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of [...section.children]) n.remove();
const variants = [];
const texts = [];
for (const shape of ['circle', 'square'])
  for (const content of ['initials', 'picture', 'glyph'])
    for (const s of S) {
      const c = figma.createComponent();
      c.name = `Size=${s}, Shape=${shape}, Content=${content}`;
      section.appendChild(c);
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisAlignItems = 'CENTER';
      c.counterAxisAlignItems = 'CENTER';
      c.primaryAxisSizingMode = 'FIXED';
      c.counterAxisSizingMode = 'FIXED';
      bind(c, ['width', 'height'], 'component/avatar/size/' + s);
      bind(c, RADII, shape === 'circle' ? 'radius/full' : 'component/avatar/radius/' + s);
      c.fills = [paint('color/surface/muted', c)];
      c.clipsContent = true;
      if (content === 'initials') {
        const t = figma.createText();
        t.textStyleId = styles.find((x) => x.name === 'component/avatar/typography/' + s).id;
        t.characters = s === 'xs' ? 'O' : 'OR';
        t.autoRename = false;
        t.name = 'Initials';
        t.leadingTrim = 'CAP_HEIGHT';
        t.textAutoResize = 'WIDTH_AND_HEIGHT';
        c.appendChild(t);
        t.fills = [paint('color/content/secondary', t)];
        texts.push(t);
      } else if (content === 'glyph') {
        const g = USER.createInstance();
        g.name = 'Glyph';
        c.appendChild(g);
        bind(g, ['width', 'height'], 'component/avatar/icon-size/' + s);
        for (const v of g.findAll((n) => n.type === 'VECTOR')) v.fills = [paint('color/content/secondary', v)];
      } else {
        const r = figma.createNodeFromSvg(SVG[shape]);
        r.name = 'Picture';
        c.appendChild(r);
        r.layoutPositioning = 'ABSOLUTE';
        r.x = 0;
        r.y = 0;
        r.resize(c.width, c.height);
        r.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
      }
      variants.push(c);
    }
const set = figma.combineAsVariants(variants, section);
set.name = 'Avatar';
const pIni = set.addComponentProperty('Initials', 'TEXT', 'OR');
for (const v of set.children) {
  const t = v.findChild((n) => n.name === 'Initials');
  if (t && !v.name.startsWith('Size=xs')) t.componentPropertyReferences = { characters: pIni };
}
// Columns: sizes (md first, the default, then xs to xl); rows: shape × content.
const colX = {};
let x = 24;
for (const s of S) {
  colX[s] = x;
  x += 64 + 32;
}
set.children.forEach((v) => {
  const [s, sh, ct] = v.name.split(', ').map((p) => p.split('=')[1]);
  const row = (sh === 'circle' ? 0 : 3) + ['initials', 'picture', 'glyph'].indexOf(ct);
  v.x = colX[s] + (64 - v.width) / 2;
  v.y = 24 + row * 96 + (64 - v.height) / 2;
});
set.resizeWithoutConstraints(24 + 5 * 96 - 32 + 24, 24 + 6 * 96 - 32 + 24);
set.fills = [];
set.x = 80;
set.y = 80;
set.description =
  'Avatar (content/avatar): a person (circle) or an organization, a team or a project (square), shown by a picture, initials or a generic glyph in a box of component/avatar/size/{size} (24, 32, 40, 48, 64 px) that clips its content to its shape (radius/full, or component/avatar/radius/{size} for square). Picture: replace the image fill (cropped to fill, centered). Initials: the first letter of the first and last words, uppercased (one letter at xs; Initials property, at most three characters), in component/avatar/typography/{size} and color/content/secondary on color/surface/muted, centered on the cap height. Glyph (no name): Phosphor user at component/avatar/icon-size/{size}. Loading (the fallback stays until the picture has loaded), the accessible name and decorative are behaviors of the code.';
section.resizeWithoutConstraints(set.x + set.width + 80, set.y + set.height + 80);
await set.screenshot({ scale: 2 });
return {
  section: section.id,
  set: set.id,
  key: set.key,
  variants: set.children.length,
  default: set.defaultVariant ? set.defaultVariant.name : set.children[0].name
};
