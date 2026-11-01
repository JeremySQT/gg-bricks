// ggbrick native resolution check, Plugin API body run through the Figma MCP server (use_figma).
// Prepend `const defs = { brands: [...], appearances: [...], densities: [...], names?: { collection: [...] } };`.
// For every brand × appearance × density it creates a temporary frame with explicit modes for the three
// collections, resolves every semantic variable natively (resolveForConsumer) in a deterministic order (collections
// Brand, Appearance, Density; names in code-unit order; primitive/* excluded), and returns per context the
// count and the FNV-1a hash of the canonical values (colors as 8-digit hex from float32 channels, numbers rounded to 4 decimals, strings as they are),
// plus the first values of each context as a sample. tooling/check-figma.ts compares the hashes with the
// ones computed from packages/tokens/figma-expectations.json. Since 2026-11-01 `names` lists the manifest's
// variables per collection: only those are hashed (a missing one fails), and every other variable of the three
// collections is returned under `unexpected` (adapter variables such as checkbox/focus-radius, which live in Brand
// because their value changes with the brand). Read-only apart from the temporary frames.
const canonical = (value) =>
  value && typeof value === 'object' && 'r' in value
    ? [value.r, value.g, value.b, value.a === undefined ? 1 : value.a]
        .map((x) =>
          Math.round(Math.fround(x) * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    : typeof value === 'string'
      ? value
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
const order = ['Foundations · Brand', 'Foundations · Appearance', 'Foundations · Density'].map(col);
const all = await figma.variables.getLocalVariablesAsync();
const semanticOf = (c) =>
  all.filter(
    (v) => v.variableCollectionId === c.id && !v.name.startsWith('primitive/') && !v.name.startsWith('_resolved/')
  );
const missing = [];
const unexpected = [];
const ordered = order.flatMap((c) => {
  const present = semanticOf(c);
  if (!defs.names) return present.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const wanted = defs.names[c.name] || [];
  const byName = new Map(present.map((v) => [v.name, v]));
  for (const v of present) if (!wanted.includes(v.name)) unexpected.push(`${c.name}:${v.name}`);
  return wanted.flatMap((name) => {
    const v = byName.get(name);
    if (!v) missing.push(`${c.name}:${name}`);
    return v ? [v] : [];
  });
});
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
  missing,
  unexpected,
  results
};
