// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Creates the Navigation family page and the wave 4 component pages (idempotent). Variables: the delta was synced with
// the sync-variables.plugin.js body restricted to the three manifest entries of wave 4.
const root = figma.root;
const byName = (n) => root.children.find((p) => p.name === n);
const idx = (p) => root.children.indexOf(p);
const ref = await figma.getNodeByIdAsync('407:119'); // Overlays page, background reference
const bg = JSON.parse(JSON.stringify(ref.backgrounds));
const specRef = await figma.getNodeByIdAsync('407:121');
const specBg = JSON.parse(JSON.stringify(specRef.backgrounds));
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
// Navigation group after the Overlays group: separator, family page, component pages.
const tooltip = await figma.getNodeByIdAsync('407:123');
let at = idx(tooltip) + 1;
let sep = root.children[at];
if (!(sep && sep.name === '---' && root.children[at + 1] && root.children[at + 1].name === 'Navigation')) {
  sep = figma.createPage();
  sep.name = '---';
  root.insertChild(at, sep);
  created.push('--- (navigation)');
}
const nav = make('Navigation', at + 1, bg);
const navPages = ['navigation/accordion', 'navigation/breadcrumb', 'navigation/pagination', 'navigation/tabs'].map(
  (n, i) => make(n, idx(nav) + 1 + i, specBg)
);
// Forms: combobox after checkbox-group; select after radio-group.
const combobox = make('forms/combobox', idx(await figma.getNodeByIdAsync('347:243')) + 1, specBg);
const select = make('forms/select', idx(await figma.getNodeByIdAsync('288:7')) + 1, specBg);
// Actions: toolbar after link.
const toolbar = make('actions/toolbar', idx(await figma.getNodeByIdAsync('225:2')) + 1, specBg);
return {
  created,
  ids: Object.fromEntries(
    [sep, nav, ...navPages, combobox, select, toolbar].map((p) => [p.name + (p === sep ? ' (navigation)' : ''), p.id])
  ),
  order: root.children.map((p) => p.name)
};
