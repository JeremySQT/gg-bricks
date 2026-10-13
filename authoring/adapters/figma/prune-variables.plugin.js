// ggbrick variable prune, Plugin API body run through the Figma MCP server (use_figma). An explicit
// migration step: prepend `const defs = { keep: ['Collection:name', …], apply: false };`. Lists every local
// variable whose collection:name is not in `keep` (a renamed, moved or removed token) and, when `apply` is
// true, removes them. Run only after the sync batches have re-pointed every alias, and record the result in
// reports/tokens/figma/ledger.json.
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const colName = Object.fromEntries(collections.map((c) => [c.id, c.name]));
const keep = new Set(defs.keep);
const stale = (await figma.variables.getLocalVariablesAsync()).filter(
  (v) => !keep.has(`${colName[v.variableCollectionId]}:${v.name}`)
);
const listed = stale.map((v) => ({ id: v.id, key: `${colName[v.variableCollectionId]}:${v.name}` }));
if (defs.apply) for (const v of stale) v.remove();
const emptyCollections = collections.filter((c) => c.variableIds.length === 0).map((c) => c.name);
return {
  stale: listed.length,
  removed: defs.apply ? listed.length : 0,
  variables: listed.slice(0, 20),
  emptyCollections
};
