// Checkbox focus ring corners (use_figma body), 2026-10-28.
// The code draws the ring with corners of radius.indicator + focus.offset, concentric with the box (outline
// corners follow the box). Figma cannot add two variables, and radius.indicator changes with the brand, so the
// adapter variable `checkbox/focus-radius` lives in the Brand collection (hidden from publishing; a Figma
// mechanic, not a source token): its value in each brand mode is computed here from radius/indicator and
// focus/offset. Binds the corners of the Focus ring of every Checkbox variant to it. Rerun after a change of
// either token (the prune script must keep `Foundations · Brand:checkbox/focus-radius`).
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const brand = cols.find((c) => c.name === 'Foundations · Brand');
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name && v.variableCollectionId === brand.id);
// The value of a variable in a mode of its collection, following aliases (an alias target in another
// collection resolves in that collection's default mode).
const value = async (v, modeId) => {
  let x = v.valuesByMode[modeId];
  while (x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS') {
    const t = await figma.variables.getVariableByIdAsync(x.id);
    const c = cols.find((k) => k.id === t.variableCollectionId);
    x = t.valuesByMode[c.id === brand.id ? modeId : c.defaultModeId];
  }
  return x;
};
let fr = V('checkbox/focus-radius');
if (!fr) fr = figma.variables.createVariable('checkbox/focus-radius', brand, 'FLOAT');
fr.scopes = ['CORNER_RADIUS'];
fr.hiddenFromPublishing = true;
fr.description = 'Figma adapter: radius/indicator + focus/offset (Checkbox focus ring, concentric with the box).';
const values = {};
for (const m of brand.modes) {
  values[m.name] = (await value(V('radius/indicator'), m.modeId)) + (await value(V('focus/offset'), m.modeId));
  fr.setValueForMode(m.modeId, values[m.name]);
}
const set = await figma.getNodeByIdAsync('289:428'); // Checkbox, Forms library page
let rings = 0;
for (const v of set.children) {
  const ring = v.findOne((n) => n.name === 'Focus ring');
  for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    ring.setBoundVariable(f, fr);
  rings++;
}
return { variable: fr.id, values, rings };
