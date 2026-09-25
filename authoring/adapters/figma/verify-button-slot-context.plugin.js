await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:7'));
figma.skipInvisibleInstanceChildren = false;
await Promise.all(['Regular', 'Medium', 'Semi Bold'].map((style) => figma.loadFontAsync({ family: 'Inter', style })));
const i = await figma.getNodeByIdAsync('27:1985'),
  rows = [];
const vars = await figma.variables.getLocalVariablesAsync(),
  vm = Object.fromEntries(vars.map((v) => [v.id, v]));
const cols = await figma.variables.getLocalVariableCollectionsAsync(),
  app = cols.find((c) => c.name === 'Appearance'),
  brand = cols.find((c) => c.name === 'Brand');
function value(n) {
  const p = (n.type === 'TEXT' ? n.fills : n.strokes)[0];
  return vm[p.boundVariables.color.id].resolveForConsumer(n).value;
}
function equal(a, b) {
  return ['r', 'g', 'b', 'a'].every((k) => Math.abs((a[k] ?? 1) - (b[k] ?? 1)) < 0.000002);
}
for (const b of brand.modes)
  for (const mode of app.modes) {
    i.setExplicitVariableModeForCollection(brand, b.modeId);
    i.setExplicitVariableModeForCollection(app, mode.modeId);
    for (const intent of ['accent', 'neutral', 'danger'])
      for (const appearance of ['solid', 'outline', 'ghost']) {
        i.setProperties({ intent, appearance });
        for (const st of ['default', 'hover', 'pressed', 'loading', 'disabled', 'disabled-loading']) {
          let s = i.children[0];
          s.setProperties({ state: st });
          s = i.children[0];
          s.setProperties({ [Object.keys(s.componentProperties).find((k) => k.startsWith('Show trailing#'))]: true });
          for (const id of ['7:9', '7:11', '20:2', '7:11']) {
            s = i.children[0];
            s.setProperties({ [Object.keys(s.componentProperties).find((k) => k.startsWith('Trailing#'))]: id });
            s = i.children[0];
            const slot = s.findOne((n) => n.type === 'INSTANCE' && n.name === 'trailing');
            const expected = value(s.findOne((n) => n.type === 'TEXT' && n.name === 'label'));
            const checks = slot.children
              .filter((n) => n.visible && (n.type === 'TEXT' || n.type === 'VECTOR'))
              .map((n) => equal(value(n), expected));
            rows.push({
              brand: b.name,
              theme: mode.name,
              intent,
              appearance,
              state: st,
              id,
              pass: checks.length > 0 && checks.every(Boolean)
            });
          }
        }
      }
  }
i.setProperties({ intent: 'accent', appearance: 'solid' });
let s = i.children[0];
s.setProperties({ state: 'default' });
s = i.children[0];
s.setProperties({ [Object.keys(s.componentProperties).find((k) => k.startsWith('Trailing#'))]: '7:11' });
i.setExplicitVariableModeForCollection(brand, brand.modes.find((m) => m.name === 'base').modeId);
i.setExplicitVariableModeForCollection(app, app.modes.find((m) => m.name === 'light').modeId);
return {
  mutatedNodeIds: [i.id, ...i.findAll().map((n) => n.id)],
  checks: rows.length,
  failures: rows.filter((r) => !r.pass)
};
