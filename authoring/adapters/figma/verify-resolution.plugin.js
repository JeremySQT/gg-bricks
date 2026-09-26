// ggbrick native resolution check, Plugin API body run through the Figma MCP server (use_figma).
// Prepend `const defs = { brands: [...], appearances: [...], densities: [...] };`. For every brand ×
// appearance × density it creates a temporary frame with explicit modes for the three collections,
// resolves every semantic variable natively (resolveForConsumer) in a deterministic order (collections
// Brand, Appearance, Density; names in code-unit order; primitive/* excluded), and returns per context the
// count and the FNV-1a hash of the canonical values (colors as 8-digit hex from float32 channels, numbers rounded to 4 decimals),
// plus the first values of each context as a sample. tooling/check-figma.ts compares the hashes with the
// ones computed from packages/tokens/figma-expectations.json. Read-only apart from the temporary frames.
const canonical = (value) =>
  value && typeof value === 'object' && 'r' in value
    ? [value.r, value.g, value.b, value.a === undefined ? 1 : value.a]
        .map((x) =>
          Math.round(Math.fround(x) * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    : String(Math.round(Number(value) * 10000) / 10000);
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const col = (name) => {
  const c = collections.find((x) => x.name === name);
  if (!c) throw new Error(`Collection ${name} missing`);
  return c;
};
const mode = (c, name) => {
  const m = c.modes.find((x) => x.name === name);
  if (!m) throw new Error(`Mode ${c.name}/${name} missing`);
  return m.modeId;
};
const order = ['Brand', 'Appearance', 'Density'].map(col);
const all = await figma.variables.getLocalVariablesAsync();
const ordered = order.flatMap((c) =>
  all
    .filter(
      (v) => v.variableCollectionId === c.id && !v.name.startsWith('primitive/') && !v.name.startsWith('_resolved/')
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
);
const results = {};
const frames = [];
for (const b of defs.brands)
  for (const a of defs.appearances)
    for (const d of defs.densities) {
      const f = figma.createFrame();
      f.name = `_verify ${b} ${a} ${d}`;
      frames.push(f);
      f.setExplicitVariableModeForCollection(order[0], mode(order[0], b));
      f.setExplicitVariableModeForCollection(order[1], mode(order[1], a));
      f.setExplicitVariableModeForCollection(order[2], mode(order[2], d));
      const values = ordered.map((v) => canonical(v.resolveForConsumer(f).value));
      results[`${b}-${a}-${d}`] = { count: values.length, hash: fnv(values.join('|')), sample: values.slice(0, 3) };
    }
for (const f of frames) f.remove();
return {
  variables: ordered.length,
  first: ordered[0] && ordered[0].name,
  last: ordered.at(-1) && ordered.at(-1).name,
  results
};
