// Shortcut masters builder (use_figma bodies), 2026-10-14. Run the parts in order; each one is safe to re-run
// (existing nodes of the same name on the page are replaced, variables are matched by collection and name).
// Part 1 creates the page content/shortcut (after actions/button and the content/* pages), the hidden adapter
// collections _ggbrick shortcut size (modes sm, md, lg) and _ggbrick shortcut (mode default), the internal part
// _Shortcut/Key (Appearance=Plain | Keycap, text property Key) and the part _Shortcut/Separator.
// Part 2 builds the component set Shortcut (Appearance × Size × Platform, 12 variants) from instances of the parts,
// with the switches Show key 2 and Show key 3 and the nested key texts exposed (Key 1, Key 2, Key 3).
// The node ids and property keys that resulted are listed in reports/components/shortcut/figma/ledger.json.

// ---- Part 1 ----
figma.skipInvisibleInstanceChildren = false;
let page = figma.root.children.find((p) => p.name === 'content/shortcut');
if (!page) {
  page = figma.createPage();
  page.name = 'content/shortcut';
}
let idx = -1;
figma.root.children.forEach((p, i) => {
  if (p !== page && /^(actions|content)\//.test(p.name)) idx = i;
});
figma.root.insertChild(idx + 1, page);
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
let vars = await figma.variables.getLocalVariablesAsync();
const colName = (v) => (cols.find((c) => c.id === v.variableCollectionId) || {}).name;
const V = (name, cn) => {
  const v = vars.find((x) => x.name === name && colName(x) === cn);
  if (!v) throw new Error('missing variable ' + cn + ':' + name);
  return v;
};
const modeOf = (c, n) => c.modes.find((m) => m.name === n).modeId;
const alias = (v) => figma.variables.createVariableAlias(v);
let sizeCol = cols.find((c) => c.name === '_ggbrick shortcut size');
if (!sizeCol) {
  sizeCol = figma.variables.createVariableCollection('_ggbrick shortcut size');
  sizeCol.renameMode(sizeCol.modes[0].modeId, 'sm');
  sizeCol.addMode('md');
  sizeCol.addMode('lg');
}
sizeCol.hiddenFromPublishing = true;
let fgCol = cols.find((c) => c.name === '_ggbrick shortcut');
if (!fgCol) {
  fgCol = figma.variables.createVariableCollection('_ggbrick shortcut');
  fgCol.renameMode(fgCol.modes[0].modeId, 'default');
}
fgCol.hiddenFromPublishing = true;
const mk = (col, name, type, scopes) => {
  let v = vars.find((x) => x.name === name && x.variableCollectionId === col.id);
  if (!v) v = figma.variables.createVariable(name, col, type);
  v.scopes = scopes;
  v.hiddenFromPublishing = true;
  return v;
};
const fsV = mk(sizeCol, 'shortcut/font-size', 'FLOAT', ['FONT_SIZE']);
const lhV = mk(sizeCol, 'shortcut/line-height', 'FLOAT', ['LINE_HEIGHT']);
const lsV = mk(sizeCol, 'shortcut/letter-spacing', 'FLOAT', ['LETTER_SPACING']);
const mwV = mk(sizeCol, 'shortcut/cap-min-width', 'FLOAT', ['WIDTH_HEIGHT']);
// Figma rounds an auto-sized text layer to whole pixels (line boxes 16, 17, 20): the square minimum of a cap is that
// rounded line box plus two border widths (border/width/default is 1 in every brand).
const MIN = { sm: 18, md: 19, lg: 22 };
for (const s of ['sm', 'md', 'lg']) {
  const m = modeOf(sizeCol, s);
  fsV.setValueForMode(m, alias(V(`typography/indicator/${s}/fontSize`, 'Brand')));
  lhV.setValueForMode(m, alias(V(`typography/indicator/${s}/lineHeight`, 'Brand')));
  lsV.setValueForMode(m, alias(V(`typography/indicator/${s}/letterSpacing`, 'Brand')));
  mwV.setValueForMode(m, MIN[s]);
}
fsV.description =
  'Adapter: aliases typography/indicator/{size}/fontSize per mode so that _Shortcut/Key binds once and each Shortcut variant sets its Size mode.';
lhV.description = 'Adapter: aliases typography/indicator/{size}/lineHeight per mode.';
lsV.description = 'Adapter: aliases typography/indicator/{size}/letterSpacing per mode.';
mwV.description =
  'Adapter: the square minimum of a keycap. Figma rounds an auto-sized text layer to whole pixels (line boxes 16, 17, 20), so the minimum is that rounded line box plus two border widths (18, 19, 22; border/width/default is 1 in every brand). The browser computes 17.4, 18.8, 21.6; difference recorded in parity.json.';
const fgV = mk(fgCol, 'shortcut/foreground', 'COLOR', ['TEXT_FILL', 'STROKE_COLOR']);
fgV.setValueForMode(modeOf(fgCol, 'default'), alias(V('color/content/primary', 'Appearance')));
fgV.description =
  'Adapter: the inherited content color of the shortcut (currentColor in the code); aliases color/content/primary. A host (Button) rebinds the key texts and separators to its own foreground.';
// Plain attenuation: opacity/muted, synced in percent (70) because Figma reads an opacity binding as a percentage.
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const paint = (v) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
const keyText = (chars) => {
  const t = figma.createText();
  t.name = 'Text';
  t.fontName = { family: 'Inter', style: 'Medium' };
  t.characters = chars;
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.textAlignHorizontal = 'CENTER';
  t.setBoundVariable('fontSize', fsV);
  t.setBoundVariable('lineHeight', lhV);
  t.setBoundVariable('letterSpacing', lsV);
  t.fills = [paint(fgV)];
  return t;
};
for (const n of page.children.filter((n) => n.name === '_Shortcut/Key' || n.name === '_Shortcut/Separator')) n.remove();
const keyVariant = (appearance) => {
  const c = figma.createComponent();
  c.name = `Appearance=${appearance}`;
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 0;
  c.clipsContent = false;
  c.fills = [];
  c.strokes = [];
  c.appendChild(keyText('K'));
  if (appearance === 'Keycap') {
    c.fills = [paint(V('color/surface/subtle', 'Appearance'))];
    c.strokes = [paint(V('color/border/default', 'Appearance'))];
    c.strokeAlign = 'INSIDE';
    c.strokesIncludedInLayout = true; // the border-box border of the code
    c.setBoundVariable('strokeWeight', V('border/width/default', 'Brand'));
    for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
      c.setBoundVariable(k, V('radius/control', 'Brand'));
    for (const k of ['paddingLeft', 'paddingRight']) c.setBoundVariable(k, V('space/content/xs', 'Density'));
    c.paddingTop = 0;
    c.paddingBottom = 0;
    c.minWidth = MIN.sm;
    c.setBoundVariable('minWidth', mwV);
  }
  return c;
};
const keySet = figma.combineAsVariants([keyVariant('Plain'), keyVariant('Keycap')], page);
keySet.name = '_Shortcut/Key';
keySet.layoutMode = 'HORIZONTAL';
keySet.itemSpacing = 24;
keySet.paddingTop = keySet.paddingBottom = keySet.paddingLeft = keySet.paddingRight = 24;
keySet.primaryAxisSizingMode = 'AUTO';
keySet.counterAxisSizingMode = 'AUTO';
keySet.counterAxisAlignItems = 'CENTER';
keySet.x = 0;
keySet.y = 0;
const keyProp = keySet.addComponentProperty('Key', 'TEXT', 'K');
for (const v of keySet.children)
  v.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: keyProp };
keySet.description =
  'Internal part of Shortcut: one key. Plain draws nothing; Keycap draws the cap (subtle surface, default border inside, control radius, xs inline padding, no block padding, at least as wide as tall). Typography follows the _ggbrick shortcut size mode set by the Shortcut variant; the text color is shortcut/foreground. Not for direct use: place a Shortcut. Source of truth foundations/components/content/shortcut/contract.json; implementation packages/svelte/src/components/shortcut.';
const sep = figma.createComponent();
sep.name = '_Shortcut/Separator';
sep.layoutMode = 'HORIZONTAL';
sep.primaryAxisSizingMode = 'AUTO';
sep.counterAxisSizingMode = 'AUTO';
sep.counterAxisAlignItems = 'CENTER';
sep.fills = [];
sep.clipsContent = false;
sep.appendChild(keyText('+'));
sep.x = keySet.width + 48;
sep.y = 0;
sep.description =
  'Internal part of Shortcut: the + between consecutive keys on other platforms, in the inherited color (shortcut/foreground), outside any cap. Not for direct use. Source of truth foundations/components/content/shortcut/contract.json.';
page.appendChild(sep);
return { page: page.id, sizeCol: sizeCol.id, fgCol: fgCol.id, keySet: keySet.id, keyProp, separator: sep.id };

// ---- Part 2 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('<page id returned by part 1>');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const colName = (v) => (cols.find((c) => c.id === v.variableCollectionId) || {}).name;
const V = (name, cn) => {
  const v = vars.find((x) => x.name === name && colName(x) === cn);
  if (!v) throw new Error('missing variable ' + cn + ':' + name);
  return v;
};
const sizeCol = cols.find((c) => c.name === '_ggbrick shortcut size');
const modeOf = (c, n) => c.modes.find((m) => m.name === n).modeId;
const keySet = await figma.getNodeByIdAsync('<key set id returned by part 1>');
const keyV = (a) => keySet.children.find((c) => c.name === `Appearance=${a}`);
const sepC = await figma.getNodeByIdAsync('<separator id returned by part 1>');
const KEY = Object.keys(keySet.componentPropertyDefinitions).find((k) => k.split('#')[0] === 'Key');
for (const n of page.children.filter((n) => n.name === 'Shortcut' && n.type === 'COMPONENT_SET')) n.remove();
const A = ['Plain', 'Keycap'],
  S = ['sm', 'md', 'lg'],
  P = ['Mac', 'Other'];
const variants = [];
const made = {};
for (const a of A)
  for (const p of P)
    for (const s of S) {
      const c = figma.createComponent();
      c.name = `Appearance=${a}, Size=${s}, Platform=${p}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
      c.counterAxisAlignItems = 'CENTER';
      c.clipsContent = false;
      c.fills = [];
      c.setExplicitVariableModeForCollection(sizeCol, modeOf(sizeCol, s));
      if (a === 'Keycap') c.setBoundVariable('itemSpacing', V('space/content/xs', 'Density'));
      else c.itemSpacing = 0;
      if (a === 'Plain') c.setBoundVariable('opacity', V('opacity/muted', 'Brand'));
      const texts = p === 'Mac' ? ['⌘', 'K', 'K'] : ['Ctrl', 'K', 'K'];
      const parts = {};
      for (let i = 0; i < 3; i++) {
        if (i > 0 && p === 'Other') {
          const sp = sepC.createInstance();
          sp.name = `Separator ${i}`;
          c.appendChild(sp);
          parts[`sep${i}`] = sp;
        }
        const k = keyV(a).createInstance();
        k.name = `Key ${i + 1}`;
        c.appendChild(k);
        k.setProperties({ [KEY]: texts[i] });
        k.isExposedInstance = true; // the Plugin API refuses property references on instance sublayers
        parts[`key${i + 1}`] = k;
      }
      page.appendChild(c);
      made[c.name] = parts;
      variants.push(c);
    }
const set = figma.combineAsVariants(variants, page);
set.name = 'Shortcut';
const show2 = set.addComponentProperty('Show key 2', 'BOOLEAN', true);
const show3 = set.addComponentProperty('Show key 3', 'BOOLEAN', false);
for (const v of set.children) {
  const parts = made[v.name];
  for (const n of [parts.key2, parts.sep1]) if (n) n.componentPropertyReferences = { visible: show2 };
  for (const n of [parts.key3, parts.sep2])
    if (n) {
      n.componentPropertyReferences = { visible: show3 };
      n.visible = false;
    }
}
// Grid: rows appearance × platform, columns md, sm, lg. Figma takes the top-left variant as the default, so the
// contract default (plain, md, Mac) sits in the first column.
const COL = { md: 0, sm: 150, lg: 300 },
  ROW = [0, 56, 112, 168],
  PAD = 32;
for (const v of set.children) {
  const [a, s, p] = v.name.match(/Appearance=(\w+), Size=(\w+), Platform=(\w+)/).slice(1);
  v.x = PAD + COL[s];
  v.y = PAD + ROW[A.indexOf(a) * 2 + P.indexOf(p)];
}
set.resizeWithoutConstraints(PAD * 2 + 420, PAD * 2 + ROW[3] + 24);
set.x = 0;
set.y = 160;
set.description =
  'Keyboard shortcut hint (⌘K, Ctrl+Shift+P): a sequence of keys rendered in the conventions of a platform, with a spoken equivalent in the code. Appearance: Plain (text in the inherited color, attenuated to 70 %) or Keycap (one cap per key, full opacity). Size sm, md, lg = indicator typography 11, 12, 14 px; a shortcut inside a control takes the control’s size. Platform: Mac (Apple glyphs ⌃ ⌥ ⇧ ⌘, keys juxtaposed) or Other (short names Ctrl, Alt, Shift, Win joined by +). Type the keys in Key 1, Key 2 and Key 3 (Show key 3); the specification lists the glyphs and the modifier order. The code resolves the platform automatically; Figma has no auto. Source of truth: foundations/components/content/shortcut/contract.json. Implementation: packages/svelte/src/components/shortcut.';
return {
  set: set.id,
  defaultVariant: set.defaultVariant.name,
  variants: set.children.map((c) => `${c.name}: ${c.id}`)
};
