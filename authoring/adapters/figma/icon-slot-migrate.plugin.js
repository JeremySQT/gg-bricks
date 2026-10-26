// Icon slot migration (use_figma body), 2026-10-26.
// User decision at the wave 1 Figma parity review: a component that shows an icon imposes its size, so the
// designer chooses the glyph only. A nested Icon instance, once exposed, shows its Size property; this script
// replaces it, in every variant of one component set, by a Phosphor glyph instance placed directly in the variant
// (width and height bound to the variable the Icon used; glyph color, opacity and visibility kept). In the variants
// selected by CFG.bind the glyph is bound to a new INSTANCE_SWAP property of the set; elsewhere it stays fixed
// (a glyph imposed by a variant, such as the Link destinations). An INSTANCE_SWAP property has one default for the
// whole set: binding a layer swaps it to that default, and swapping one variant's layer changes the default of all,
// so per-variant default glyphs are not possible (learned on the Badge, whose per-intent defaults were dropped).
// The glyph of every existing instance (specification pages, user frames) is read first and re-applied through the
// new property where it differs from the default, and so is its visibility: an instance may hide the icon through
// an override (an IconButton shown loading), which is lost with the old layer, and swapping a hidden glyph shows it
// again (learned on the IconButton). One set per run; IDs come from the component's ledger.
const CFG = {
  set: '211:1167',
  layer: 'Icon',
  prop: 'Icon',
  bind: () => true
};
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(CFG.set);
const glyphOf = (icon) => {
  const g = icon && icon.type === 'INSTANCE' && icon.findOne((n) => n.type === 'INSTANCE' && n.name === 'Glyph');
  return g ? g.mainComponent : null;
};
const isIcon = (n) =>
  n.type === 'INSTANCE' &&
  n.name === CFG.layer &&
  n.mainComponent &&
  n.mainComponent.parent &&
  n.mainComponent.parent.name === 'Icon';
// 1. The glyph shown by every instance of the set, wherever it is.
const shown = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const inst of p.findAll((n) => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent === set)) {
    if (!CFG.bind(inst.mainComponent.name)) continue;
    const own = inst.findAll(isIcon);
    const g = own.length && glyphOf(own[0]);
    if (g) shown.push([inst.id, g.id, own[0].visible]);
  }
}
// 2. Replace the nested Icon by the glyph itself in every variant.
const vars = {};
const varOf = async (id) => vars[id] || (vars[id] = await figma.variables.getVariableByIdAsync(id));
const slots = [];
for (const v of set.children) {
  for (const old of v.findAll(isIcon)) {
    const g = glyphOf(old);
    const bw = (old.boundVariables.width || old.mainComponent.boundVariables.width).id;
    const bh = (old.boundVariables.height || old.mainComponent.boundVariables.height).id;
    const fills = JSON.parse(JSON.stringify(old.findOne((n) => n.type === 'VECTOR').fills));
    const n = g.createInstance();
    n.name = CFG.layer;
    old.parent.insertChild(old.parent.children.indexOf(old), n);
    if (old.layoutPositioning === 'ABSOLUTE') n.layoutPositioning = 'ABSOLUTE';
    n.constraints = old.constraints;
    n.setBoundVariable('width', await varOf(bw));
    n.setBoundVariable('height', await varOf(bh));
    n.opacity = old.opacity;
    if (old.boundVariables.opacity) n.setBoundVariable('opacity', await varOf(old.boundVariables.opacity.id));
    n.visible = old.visible;
    const refs = old.componentPropertyReferences || {};
    if (refs.visible) n.componentPropertyReferences = { visible: refs.visible };
    old.remove();
    for (const vec of n.findAll((x) => x.type === 'VECTOR')) vec.fills = fills;
    slots.push({ n, g, fills, bound: CFG.bind(v.name) });
  }
}
// 3. One INSTANCE_SWAP property whose default is the glyph of the default variant (or of the first bound slot).
const bound = slots.filter((s) => s.bound);
let KEY = null;
if (bound.length) {
  const def = bound.find((s) => set.defaultVariant.findOne((x) => x === s.n)) || bound[0];
  KEY = set.addComponentProperty(CFG.prop, 'INSTANCE_SWAP', def.g.id);
  for (const s of bound) {
    s.n.componentPropertyReferences = Object.assign({}, s.n.componentPropertyReferences || {}, {
      mainComponent: KEY
    });
  }
  // Binding swaps the layers to the default and may drop the color overrides: restore them.
  for (const s of slots) for (const vec of s.n.findAll((x) => x.type === 'VECTOR')) vec.fills = s.fills;
}
// 4. Re-apply the glyph and the visibility each instance showed.
let reapplied = 0;
const failed = [];
const defId = KEY && set.componentPropertyDefinitions[KEY].defaultValue;
for (const [id, g, visible] of shown) {
  const inst = await figma.getNodeByIdAsync(id);
  try {
    if (KEY && g !== defId) {
      inst.setProperties({ [KEY]: g });
      reapplied++;
    }
    const slot = inst.findOne((n) => n.name === CFG.layer && n.type === 'INSTANCE');
    if (slot && slot.visible !== visible) slot.visible = visible;
  } catch (e) {
    failed.push([id, String(e)]);
  }
}
return {
  key: KEY,
  replaced: slots.length,
  bound: bound.length,
  instances: shown.length,
  reapplied,
  failed,
  props: Object.keys(set.componentPropertyDefinitions)
};
