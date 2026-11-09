// Action family adapter (use_figma body), run once on 2026-11-03.
// The code points the accent and neutral action tokens at the action family of the host intent inside an Alert and
// an intense Toast (alert.css, toast.css). Figma has no subtree remap of variables, but it has modes: this body
// creates the hidden collection “Components · action family” (modes default, neutral, info, success, warning,
// danger; hidden from publishing) with 90 variables action-family/{accent,neutral}/{appearance}/{state}/{part}
// (no scopes), aliasing color/action/{from}/… in default and color/action/{intent}/… in the intent modes (neutral
// keeps neutral; accent becomes neutral in the neutral mode). It then rebinds every paint of the Button (48:1586) and
// IconButton (211:1167) masters bound to color/action/accent/… or color/action/neutral/… (own layers and instance
// sublayers, 690 paints, with resolved fallback colors) and the aliases of the hidden Components · button state
// collection (30) to these variables. In default mode every value is unchanged; a host sets the mode of its intent.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:2');
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const app = cols.find((c) => c.name === 'Foundations · Appearance');
let all = await figma.variables.getLocalVariablesAsync();
const roleByName = Object.fromEntries(all.filter((v) => v.variableCollectionId === app.id).map((v) => [v.name, v]));
let col = cols.find((c) => c.name === 'Components · action family');
if (!col) col = figma.variables.createVariableCollection('Components · action family');
const MODES = ['default', 'neutral', 'info', 'success', 'warning', 'danger'];
if (col.modes[0].name !== 'default') col.renameMode(col.modes[0].modeId, 'default');
for (const m of MODES.slice(1)) if (!col.modes.some((x) => x.name === m)) col.addMode(m);
col.hiddenFromPublishing = true;
const mid = (m) => col.modes.find((x) => x.name === m).modeId;
const famVar = Object.fromEntries(all.filter((v) => v.variableCollectionId === col.id).map((v) => [v.name, v]));
for (const from of ['accent', 'neutral'])
  for (const a of ['solid', 'outline', 'ghost'])
    for (const s of ['default', 'hover', 'pressed', 'loading', 'disabled'])
      for (const p of ['surface', 'content', 'border']) {
        const suffix = `${a}/${s}/${p}`;
        const name = `action-family/${from}/${suffix}`;
        const v = famVar[name] || (famVar[name] = figma.variables.createVariable(name, col, 'COLOR'));
        v.scopes = [];
        v.hiddenFromPublishing = true;
        v.description = `Figma adapter (not a token): color/action/${from}/${suffix}, re-pointed to the action family of the host intent in the modes neutral to danger (an Alert, an intense Toast), as the code points the accent and neutral action tokens in their subtree.`;
        for (const m of MODES) {
          const target = m === 'default' ? from : m;
          v.setValueForMode(mid(m), { type: 'VARIABLE_ALIAS', id: roleByName[`color/action/${target}/${suffix}`].id });
        }
      }
all = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(all.map((v) => [v.id, v]));
const map = (v) => {
  const m = v && /^color\/action\/(accent|neutral)\/(.+)$/.exec(v.name);
  return m ? famVar[`action-family/${m[1]}/${m[2]}`] : null;
};
let paints = 0;
for (const sid of ['48:1586', '211:1167']) {
  const set = await figma.getNodeByIdAsync(sid);
  for (const n of set.findAll(() => true))
    for (const kind of ['fills', 'strokes']) {
      if (!(kind in n) || !Array.isArray(n[kind]) || !n[kind].length) continue;
      let changed = false;
      const next = n[kind].map((p) => {
        const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
        const t = id && map(byId[id]);
        if (!t) return p;
        changed = true;
        paints++;
        const c = byId[id].resolveForConsumer(n).value;
        return figma.variables.setBoundVariableForPaint({ ...p, color: { r: c.r, g: c.g, b: c.b } }, 'color', t);
      });
      if (changed) n[kind] = next;
    }
}
const state = cols.find((c) => c.name === 'Components · button state');
let aliases = 0;
for (const id of state.variableIds) {
  const v = byId[id];
  for (const m of state.modes) {
    const val = v.valuesByMode[m.modeId];
    const t = val && val.type === 'VARIABLE_ALIAS' && map(byId[val.id]);
    if (t) {
      v.setValueForMode(m.modeId, { type: 'VARIABLE_ALIAS', id: t.id });
      aliases++;
    }
  }
}
return { collection: col.id, variables: col.variableIds.length, paints, aliases };
