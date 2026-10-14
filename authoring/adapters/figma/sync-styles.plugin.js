// ggbrick style sync, Plugin API body run through the Figma MCP server (use_figma).
// Prepend `const defs = { typography: manifest.typography, effects: manifest.effects };`.
// Text styles: one per typography role (family, weight, size and letter spacing bound to the role's variables,
// line height as a percentage, OpenType features in the description). Effect styles: one per shadow role. Matched by name, IDs preserved.
const fonts = new Set(defs.typography.map((t) => JSON.stringify({ family: t.family, style: t.style })));
await Promise.all([...fonts].map((f) => figma.loadFontAsync(JSON.parse(f))));
// Text styles bind their family, weight, size and letter spacing to the role's variables (Brand collection,
// synced before the styles); the line height is typed as a percentage, which Figma cannot bind.
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name);
const textStyles = await figma.getLocalTextStylesAsync();
const effectStyles = await figma.getLocalEffectStylesAsync();
const result = { text: { created: [], updated: [] }, effects: { created: [], updated: [] }, errors: [] };
for (const t of defs.typography) {
  try {
    let s = textStyles.find((x) => x.name === t.name);
    if (!s) {
      s = figma.createTextStyle();
      s.name = t.name;
      result.text.created.push(s.id);
    } else result.text.updated.push(s.id);
    s.fontName = { family: t.family, style: t.style };
    s.fontSize = t.size;
    s.lineHeight = { unit: 'PERCENT', value: t.lineHeightPercent };
    s.letterSpacing = { unit: 'PIXELS', value: t.letterSpacing };
    for (const [field, name] of Object.entries(t.variables || {})) {
      const v = V(name);
      if (!v) throw new Error(`variable ${name} missing for ${field}`);
      s.setBoundVariable(field, v);
    }
    // The Plugin API exposes no OpenType feature setting on text styles: features (tabular figures for
    // numeral roles) are recorded in the description and reported as a limitation.
    const features =
      t.features && t.features.length ? ` · OpenType ${t.features.join(', ')} (set on the text layer)` : '';
    if (features) result.featuresNotApplied = [...(result.featuresNotApplied || []), t.name];
    s.description = `ggbrick ${t.name.replaceAll('/', '.')} — CSS var(--ggb-${t.name.replaceAll('/', '-')})${features}`;
  } catch (e) {
    result.errors.push(`${t.name}: ${e.message}`);
  }
}
for (const e of defs.effects) {
  try {
    let s = effectStyles.find((x) => x.name === e.name);
    if (!s) {
      s = figma.createEffectStyle();
      s.name = e.name;
      result.effects.created.push(s.id);
    } else result.effects.updated.push(s.id);
    s.effects = e.layers.map((l) => ({
      type: l.type,
      color: l.color,
      offset: l.offset,
      radius: l.radius,
      spread: l.spread,
      visible: true,
      blendMode: 'NORMAL'
    }));
    s.description = `ggbrick ${e.name.replaceAll('/', '.')} — CSS var(--ggb-${e.name.replaceAll('/', '-')})`;
  } catch (err) {
    result.errors.push(`${e.name}: ${err.message}`);
  }
}
return result;
