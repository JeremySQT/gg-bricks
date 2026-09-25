const collections = await figma.variables.getLocalVariableCollectionsAsync();
const cm = Object.fromEntries(collections.map((c) => [c.name, c]));
const existing = await figma.variables.getLocalVariablesAsync();
const vm = Object.fromEntries(
  existing.map((v) => [collections.find((c) => c.id === v.variableCollectionId).name + ':' + v.name, v])
);
const changes = [];
for (const def of defs) {
  const key = def.collection + ':' + def.name;
  let v = vm[key];
  if (!v) {
    v = figma.variables.createVariable(def.name, cm[def.collection], def.type);
    vm[key] = v;
  }
  v.scopes = def.scopes;
  v.setVariableCodeSyntax('WEB', 'var(--' + def.path.replaceAll('.', '-') + ')');
  for (const [mode, val] of Object.entries(def.values)) {
    const mid = cm[def.collection].modes.find((m) => m.name === mode).modeId;
    let value = val;
    if (val && val.alias) {
      if (!vm[val.alias]) throw Error('Missing alias ' + val.alias);
      value = { type: 'VARIABLE_ALIAS', id: vm[val.alias].id };
    } else if (!def.name.startsWith('primitive/')) {
      const prim = Object.values(vm).find(
        (x) =>
          x.name.startsWith('primitive/') &&
          x.resolvedType === def.type &&
          JSON.stringify(x.valuesByMode[mid]) === JSON.stringify(val)
      );
      if (prim) value = { type: 'VARIABLE_ALIAS', id: prim.id };
    }
    v.setValueForMode(mid, value);
  }
  changes.push({ key, id: v.id });
}
return { variables: changes, count: changes.length };
