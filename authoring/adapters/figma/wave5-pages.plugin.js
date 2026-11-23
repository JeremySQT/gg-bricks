// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Creates the Data family page and the wave 5 component pages (idempotent). Variables: the 52 component variables of
// wave 5 were synced with a sync-variables body restricted to component/avatar*, component/data-field and
// component/divider, and the five component/avatar/typography/* text styles with the sync-styles mechanics.
const root = figma.root;
const byName = (n) => root.children.find((p) => p.name === n);
const idx = (p) => root.children.indexOf(p);
const bg = JSON.parse(JSON.stringify((await figma.getNodeByIdAsync('495:16')).backgrounds));
const specBg = JSON.parse(JSON.stringify((await figma.getNodeByIdAsync('495:18')).backgrounds));
const created = [];
const make = (name, at, background) => {
  let p = byName(name);
  if (!p) {
    p = figma.createPage();
    p.name = name;
    created.push(name);
  }
  root.insertChild(at, p);
  p.backgrounds = background;
  return p;
};
// Content: avatar and avatar-group before badge, divider after counter (alphabetical).
const avatar = make('content/avatar', idx(await figma.getNodeByIdAsync('220:2')), specBg);
const avatarGroup = make('content/avatar-group', idx(avatar) + 1, specBg);
const divider = make('content/divider', idx(await figma.getNodeByIdAsync('149:1547')) + 1, specBg);
// Data group after the Navigation group: separator, family page, component pages.
let at = idx(await figma.getNodeByIdAsync('495:20')) + 1;
let sep = root.children[at];
if (!(sep && sep.name === '---' && root.children[at + 1] && root.children[at + 1].name === 'Data')) {
  sep = figma.createPage();
  sep.name = '---';
  root.insertChild(at, sep);
  created.push('--- (data)');
}
const data = make('Data', at + 1, bg);
const dataPages = ['data/data-field', 'data/table'].map((n, i) => make(n, idx(data) + 1 + i, specBg));
return {
  created,
  ids: Object.fromEntries(
    [avatar, avatarGroup, divider, sep, data, ...dataPages].map((p) => [p.name + (p === sep ? ' (data)' : ''), p.id])
  ),
  order: root.children.map((p) => p.name).join(' | ')
};
