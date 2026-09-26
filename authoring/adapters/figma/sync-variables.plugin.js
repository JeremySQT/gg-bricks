// ggbrick variable sync, Plugin API body run through the Figma MCP server (use_figma).
// Prepend `const defs = <batch>;` where batch is
//   { collections: { Brand: [...modes], Appearance: [...], Density: [...] },
//     variables: [[collection, name, type, scopes, values], …] }
// with values either one value for every mode or { mode: value } (a value is a literal or { alias: 'Collection:name' }).
// Code syntax is derived from the name: var(--ggb-<name with dashes>). tooling/figma-batches.ts writes the batches. Idempotent: collections and modes are
// created or reused by name, variables are matched by collection and name (IDs preserved), values and
// aliases are set per mode, scopes and code syntax updated. Alias targets must already exist (run
// primitive batches before semantic ones). Returns counts and the IDs of every created or updated variable.
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const byName = Object.fromEntries(collections.map((c) => [c.name, c]));
const created = { collections: [], modes: [], variables: [] };
for (const [name, modes] of Object.entries(defs.collections)) {
  let c = byName[name];
  if (!c) {
    c = figma.variables.createVariableCollection(name);
    byName[name] = c;
    created.collections.push(name);
  }
  const existing = c.modes.map((m) => m.name);
  modes.forEach((mode, i) => {
    if (existing.includes(mode)) return;
    if (i === 0 && c.modes.length === 1 && !modes.includes(c.modes[0].name)) {
      c.renameMode(c.modes[0].modeId, mode);
    } else c.addMode(mode);
    created.modes.push(`${name}/${mode}`);
  });
}
const modeId = (collection, mode) => {
  const m = byName[collection].modes.find((x) => x.name === mode);
  if (!m) throw new Error(`Mode ${collection}/${mode} missing`);
  return m.modeId;
};
const all = await figma.variables.getLocalVariablesAsync();
const varByKey = {};
for (const v of all) {
  const c = collections.find((x) => x.id === v.variableCollectionId);
  if (c) varByKey[`${c.name}:${v.name}`] = v;
}
const updated = [];
const errors = [];
const isAlias = (x) => x && typeof x === 'object' && 'alias' in x;
const expand = (collection, values) =>
  values && typeof values === 'object' && !('alias' in values) && !('r' in values)
    ? values
    : Object.fromEntries(defs.collections[collection].map((m) => [m, values]));
// Pass 1: create every variable of the batch so that aliases inside the batch can resolve in pass 2.
for (const [collection, name, type, scopes] of defs.variables) {
  const key = `${collection}:${name}`;
  if (!varByKey[key]) {
    const v = figma.variables.createVariable(name, byName[collection], type);
    varByKey[key] = v;
    created.variables.push(v.id);
  } else updated.push(varByKey[key].id);
  varByKey[key].scopes = scopes;
  varByKey[key].setVariableCodeSyntax('WEB', `var(--ggb-${name.replaceAll('/', '-')})`);
}
// Pass 2: values and aliases per mode.
for (const [collection, name, , , values] of defs.variables) {
  const key = `${collection}:${name}`;
  const v = varByKey[key];
  try {
    for (const [mode, value] of Object.entries(expand(collection, values))) {
      const id = modeId(collection, mode);
      if (isAlias(value)) {
        const target = varByKey[value.alias];
        if (!target) throw new Error(`alias target ${value.alias} missing`);
        v.setValueForMode(id, { type: 'VARIABLE_ALIAS', id: target.id });
      } else v.setValueForMode(id, value);
    }
  } catch (e) {
    errors.push(`${key}: ${e.message}`);
  }
}
return {
  created,
  updated: updated.length,
  errors,
  totalVariables: (await figma.variables.getLocalVariablesAsync()).length
};
