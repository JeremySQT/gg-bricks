// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// The patch applied to the stored _Script/family-pages (440:2) for wave 4; family-pages.plugin.js holds the same changes.
// Then the stored function is run with Navigation, Forms and Actions.
const node = await figma.getNodeByIdAsync('440:2');
await figma.loadFontAsync(node.fontName);
let s = node.characters;
const rep = (a, b, all = false) => {
  if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80));
  s = all ? s.split(a).join(b) : s.replace(a, b);
};
// Families: Toolbar in Actions, Combobox and Select in Forms, the Navigation family.
rep(
  "['Link', '225:2', 'Takes the reader to another page, a file, an email address, a phone number or a printable version.', ['_Link/Destination'], {}]] },",
  "['Link', '225:2', 'Takes the reader to another page, a file, an email address, a phone number or a printable version.', ['_Link/Destination'], {}], ['Toolbar', '495:23', 'Groups controls that act on the same context, as one stop in sequential focus with the arrow keys inside.', [], {}]] },"
);
rep(
  "['Field', '288:4',",
  "['Combobox', '495:21', 'Chooses one value from a long list of options by typing to narrow it.', [], { Content: 'text' }], ['Field', '288:4',"
);
rep(
  "['Switch', '288:8',",
  "['Select', '495:22', 'Chooses one value from a list of options, shown collapsed in a field.', [], { Content: 'value' }], ['Switch', '288:8',"
);
rep(
  "Overlays: { page: '407:119',",
  "Navigation: { page: '495:16', description: 'Components that help people find their way and move through content: where they are in the site (Breadcrumb), which page of a long list (Pagination), which panel of related content (Tabs), which sections are open (Accordion).',\ncomponents: [['Accordion', '495:17', 'Shows or hides sections of content under headings, so that a long page can be scanned.', [], {}], ['Breadcrumb', '495:18', 'Shows where the current page sits in the site hierarchy, with a link to each ancestor.', ['_Breadcrumb/Slash', '_Breadcrumb/Separator'], { Size: 'md' }], ['Pagination', '495:19', 'Moves through a long list or table split into numbered pages.', [], {}], ['Tabs', '495:20', 'Shows one of several panels of related content, with a list of tabs to switch between them.', [], {}]] },\nOverlays: { page: '407:119',"
);
rep('Overlays: [1.2, 0.8] }[FAMILY];', 'Overlays: [1.2, 0.8], Navigation: [1.2, 0.9] }[FAMILY];');
// A single component (Accordion) as well as a component set.
rep(
  "(n) => n.type === 'COMPONENT_SET' && n.name === name)",
  "(n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name)",
  true
);
rep(
  'const i = set.defaultVariant.createInstance();',
  "const i = (set.type === 'COMPONENT_SET' ? set.defaultVariant : set).createInstance();"
);
// Covers.
rep(
  'const COVERS = {\n',
  "const COVERS = {\nNavigation: [\n[{}, () => inst('Tabs')],\n[{ appearance: 'dark' }, () => inst('Breadcrumb', { Size: 'md' })],\n[{ brand: 'brick' }, () => inst('Pagination')],\n[{}, () => inst('Accordion')],\n[{ brand: 'orchid' }, () => inst('Tabs', { Appearance: 'line' })],\n[{ appearance: 'dark', brand: 'orchid' }, () => inst('Pagination', { Size: 'sm' })],\n[{ brand: 'brick' }, () => inst('Breadcrumb', { Separator: 'slash' })],\n[{ appearance: 'dark' }, () => inst('Tabs')],\n[{ brand: 'orchid' }, () => inst('Accordion')]\n],\n"
);
const fi = s.indexOf('Forms: [\n', s.indexOf('const COVERS'));
if (fi < 0) throw new Error('no Forms covers');
s =
  s.slice(0, fi) +
  "Forms: [\n[{ appearance: 'dark' }, () => inst('Select', { Content: 'value' })],\n[{ brand: 'orchid' }, () => inst('Combobox', { Content: 'text' })],\n" +
  s.slice(fi + 'Forms: [\n'.length);
const ai = s.indexOf('Actions: [\n', s.indexOf('const COVERS'));
if (ai < 0) throw new Error('no Actions covers');
s =
  s.slice(0, ai) + "Actions: [\n[{ brand: 'orchid' }, () => inst('Toolbar')],\n" + s.slice(ai + 'Actions: [\n'.length);
node.characters = s;
return {
  len: s.length,
  checks: ['Navigation: {', "inst('Toolbar')", "'COMPONENT') && n.name === name", 'Navigation: [1.2'].map((k) => [
    k,
    s.split(k).length - 1
  ])
};

// ---- The spec-lib patch of the same day (one-sided strokes in the anatomy drawing) (2026-11-12, user review of the Figma parity) ----
const node = await figma.getNodeByIdAsync('411:2');
await figma.loadFontAsync(node.fontName);
let s = node.characters;
const a =
  "const weight = (n, w) => { for (const f of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) if (n.boundVariables && n.boundVariables[f]) n.setBoundVariable(f, null); n.strokeWeight = w; };";
const b =
  "const weight = (n, w, all = false) => { const F = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']; const sides = F.map((f) => ('strokeTopWeight' in n ? n[f] : 1)); for (const f of F) if (n.boundVariables && n.boundVariables[f]) n.setBoundVariable(f, null); if (all || sides.every((x) => x === sides[0])) { n.strokeWeight = w; return; } F.forEach((f, i) => { n[f] = sides[i] > 0 ? w : 0; }); };";
if (!s.includes(a)) throw new Error('weight helper not found');
s = s.replace(a, b);
// Dashed layout boxes keep a full outline.
const c = 'weight(n, 1);';
const cnt = s.split(c).length - 1;
s = s.split(c).join('weight(n, 1, true);');
node.characters = s;
return { replacedDashed: cnt, len: s.length };
