// Nested Counter and Shortcut parts and the Button trailing item (use_figma bodies), 2026-10-26. Run the parts
// in order, one per call (each switches to its own page).
// User decision at the wave 1 Figma parity review: a component imposes the size of what it holds. Inside the
// Button's trailing item, the Counter and the Shortcut showed their own Size property (and the item a Size of its
// own). Counter and Shortcut keep their Size variants for use on their own; inside a host they are replaced by
// internal copies that take the host's size from the mode of the hidden Components collection (sm, md, lg) that
// the host variant sets:
//   Part 1  _Counter/Nested (page content/counter): the md Counter variants (Overflow false, true) with the
//           size-dependent bindings moved to counter/font-family, font-weight, font-size, line-height and
//           letter-spacing (Components, aliases of typography/indicator/{mode}/*); Value and Overflow text.
//   Part 2  _Shortcut/Nested (page content/shortcut): the md Shortcut variants (Appearance × Platform) without
//           their explicit Components mode; Show key 2 (Key 2, Separator 1) and Show key 3 (Key 3, Separator 2).
//   Part 3  _Button/Trailing (page actions/button): its Counter and Shortcut become the nested parts (content
//           fills on button/foreground, instances exposed), every instance on an sm or lg variant moves to the
//           md variant of its type, the sm and lg variants are removed and Size disappears (Type only); the
//           content each instance showed (type, glyph, counter value and overflow, shortcut keys, appearance,
//           platform, shown keys) is read first and re-applied.
// Checked on 2026-10-26: the nested parts equal Counter and Shortcut in 18 contexts × 3 sizes (324 cases; the lg
// counter digits differ by 1 px because the Counter lg master lacks tabular figures, which the nested part and
// the code have); Button slot geometry, content size and color with icon, counter and shortcut: 1 080 checks.
// The node IDs are recorded in the ledgers of counter, shortcut and button.

// ---- Part 1 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:1547'); // content/counter
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === '_Counter/Nested')) n.remove();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const comp = cols.find((c) => c.name === 'Components');
const vars = await figma.variables.getLocalVariablesAsync();
const byName = (n) => vars.find((v) => v.name === n);
const KEYS = {
  fontFamily: ['font-family', 'STRING', ['FONT_FAMILY']],
  fontWeight: ['font-weight', 'FLOAT', ['FONT_WEIGHT']],
  fontSize: ['font-size', 'FLOAT', ['FONT_SIZE']],
  lineHeight: ['line-height', 'FLOAT', ['LINE_HEIGHT', 'WIDTH_HEIGHT']],
  letterSpacing: ['letter-spacing', 'FLOAT', ['LETTER_SPACING']]
};
const A = {};
for (const [k, [suffix, type, scopes]] of Object.entries(KEYS)) {
  const name = 'counter/' + suffix;
  let v = vars.find((x) => x.name === name && x.variableCollectionId === comp.id);
  if (!v) v = figma.variables.createVariable(name, comp, type);
  v.scopes = scopes;
  v.hiddenFromPublishing = true;
  for (const m of comp.modes)
    v.setValueForMode(m.modeId, figma.variables.createVariableAlias(byName(`typography/indicator/${m.name}/${k}`)));
  A[k] = v;
}
const set = await figma.getNodeByIdAsync('149:1568'); // Counter
const PROPS = set.componentPropertyDefinitions;
const clones = [];
for (const ov of ['false', 'true']) {
  const c = set.children.find((v) => v.name === `Size=md, Overflow=${ov}`).clone();
  c.name = `Overflow=${ov}`;
  page.appendChild(c);
  for (const n of [c, ...c.findAll(() => true)])
    for (const [field, b] of Object.entries(n.boundVariables || {})) {
      const ref = [].concat(b)[0];
      if (!ref || !ref.id) continue;
      const m = (await figma.variables.getVariableByIdAsync(ref.id)).name.match(/^typography\/indicator\/md\/(\w+)$/);
      if (m) n.setBoundVariable(field, A[m[1]]);
    }
  clones.push(c);
}
const part = figma.combineAsVariants(clones, page);
part.name = '_Counter/Nested';
part.description =
  'Internal part: a Counter placed inside another component (the trailing item of a Button). Same drawing and bindings as Counter, but its size follows the host: typography, height and minimum width are bound to counter/* in the hidden Components collection, whose mode (sm, md, lg) the host variant sets. It has no Size property, so a designer cannot change it inside the host. Use Counter on its own.';
const def = (p) => PROPS[Object.keys(PROPS).find((k) => k.startsWith(p))].defaultValue;
const VAL = part.addComponentProperty('Value', 'TEXT', def('Value'));
const OVT = part.addComponentProperty('Overflow text', 'TEXT', def('Overflow text'));
for (const v of part.children)
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Value').componentPropertyReferences = {
    characters: v.name === 'Overflow=true' ? OVT : VAL
  };
part.children.forEach((v, k) => {
  v.x = 40 + k * 80;
  v.y = 40;
});
part.resizeWithoutConstraints(200, 100);
part.x = set.x;
part.y = set.y + set.height + 80;
return { part: part.id, vars: Object.fromEntries(Object.values(A).map((v) => [v.name, v.id])) };

// ---- Part 2 ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('149:1569'); // content/shortcut
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === '_Shortcut/Nested')) n.remove();
const comp = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Components');
const set = await figma.getNodeByIdAsync('151:110'); // Shortcut
const clones = [];
for (const a of ['Plain', 'Keycap'])
  for (const p of ['Mac', 'Other']) {
    const c = set.children.find((v) => v.name === `Appearance=${a}, Size=md, Platform=${p}`).clone();
    page.appendChild(c);
    c.name = `Appearance=${a}, Platform=${p}`;
    c.clearExplicitVariableModeForCollection(comp); // the host's mode applies
    clones.push(c);
  }
const part = figma.combineAsVariants(clones, page);
part.name = '_Shortcut/Nested';
part.description =
  'Internal part: a Shortcut placed inside another component (the trailing item of a Button). Same keys, separators and bindings as Shortcut, but it sets no mode of the hidden Components collection: its size follows the mode the host variant sets (sm, md, lg). It has no Size property, so a designer cannot change it inside the host. Use Shortcut on its own.';
// A clone outside its set loses its property references: bind them again.
const K2 = part.addComponentProperty('Show key 2', 'BOOLEAN', true);
const K3 = part.addComponentProperty('Show key 3', 'BOOLEAN', false);
for (const v of part.children)
  for (const c of v.children) {
    if (c.name === 'Key 2' || c.name === 'Separator 1') c.componentPropertyReferences = { visible: K2 };
    if (c.name === 'Key 3' || c.name === 'Separator 2') c.componentPropertyReferences = { visible: K3 };
  }
part.children.forEach((v, k) => {
  v.x = 40 + (k % 2) * 160;
  v.y = 40 + Math.floor(k / 2) * 60;
});
part.resizeWithoutConstraints(360, 180);
part.x = set.x;
part.y = set.y + set.height + 80;
return { part: part.id };

// ---- Part 3 ----
figma.skipInvisibleInstanceChildren = false;
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('144:2')); // actions/button
const tr = await figma.getNodeByIdAsync('75:14'); // _Button/Trailing
const CN = await figma.getNodeByIdAsync('278:261'); // _Counter/Nested
const SN = await figma.getNodeByIdAsync('278:1153'); // _Shortcut/Nested
const FG = (await figma.variables.getLocalVariablesAsync()).find((v) => v.name === 'button/foreground');
const paint = () =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', FG);
const pv = (inst, name) => {
  const k = Object.keys(inst.componentProperties).find((k) => k.split('#')[0] === name);
  return k ? inst.componentProperties[k].value : undefined;
};
const setp = (inst, obj) => {
  const o = {};
  for (const [name, val] of Object.entries(obj)) {
    const k = Object.keys(inst.componentProperties).find((k) => k.split('#')[0] === name);
    if (val !== undefined && k && inst.componentProperties[k].value !== val) o[k] = val;
  }
  if (Object.keys(o).length) inst.setProperties(o);
};
// 1. What every trailing instance shows.
const shots = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const t of p.findAll((n) => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent === tr)) {
    const s = { id: t.id, type: t.mainComponent.name.match(/Type=(\w+)/)[1], icon: pv(t, 'Icon') };
    const c = t.findOne((n) => n.name === 'Counter' && n.type === 'INSTANCE');
    if (c) s.counter = { Value: pv(c, 'Value'), 'Overflow text': pv(c, 'Overflow text'), Overflow: pv(c, 'Overflow') };
    const sc = t.findOne((n) => n.name === 'Shortcut' && n.type === 'INSTANCE');
    if (sc)
      s.shortcut = {
        props: {
          'Show key 2': pv(sc, 'Show key 2'),
          'Show key 3': pv(sc, 'Show key 3'),
          Appearance: pv(sc, 'Appearance'),
          Platform: pv(sc, 'Platform')
        },
        keys: ['Key 1', 'Key 2', 'Key 3'].map((k) => {
          const ki = sc.findOne((n) => n.name === k && n.type === 'INSTANCE');
          return ki ? { Key: pv(ki, 'Key'), Appearance: pv(ki, 'Appearance') } : null;
        })
      };
    shots.push(s);
  }
}
// 2. The md variants hold the nested parts.
const md = (t) => tr.children.find((v) => v.name === `Type=${t}, Size=md`);
for (const [type, src, variant] of [
  ['Counter', CN, 'Overflow=false'],
  ['Shortcut', SN, 'Appearance=Plain, Platform=Mac']
]) {
  const v = md(type);
  const old = v.findOne((n) => n.name === type);
  const n = src.children.find((x) => x.name === variant).createInstance();
  n.name = type;
  v.insertChild(v.children.indexOf(old), n);
  old.remove();
  for (const x of n.findAll((x) => x.type === 'TEXT' || x.name === 'Tint')) x.fills = [paint()];
  n.isExposedInstance = true;
}
// 3. Instances on sm/lg variants move to md; the sm/lg variants go, and Size with them.
for (const s of shots) {
  const t = await figma.getNodeByIdAsync(s.id);
  if (!t.mainComponent.name.endsWith('Size=md')) t.swapComponent(md(s.type));
}
for (const v of [...tr.children]) if (!v.name.endsWith('Size=md')) v.remove();
for (const v of tr.children) v.name = v.name.replace(', Size=md', '');
// 4. Re-apply the content.
const iconKey = Object.keys(tr.componentPropertyDefinitions).find((k) => k.startsWith('Icon'));
for (const s of shots) {
  const t = await figma.getNodeByIdAsync(s.id);
  setp(t, { Type: s.type });
  if (s.icon && s.icon !== tr.componentPropertyDefinitions[iconKey].defaultValue) setp(t, { Icon: s.icon });
  if (s.counter)
    setp(
      t.findOne((n) => n.name === 'Counter' && n.type === 'INSTANCE'),
      s.counter
    );
  if (s.shortcut) {
    const sc = t.findOne((n) => n.name === 'Shortcut' && n.type === 'INSTANCE');
    setp(sc, s.shortcut.props);
    ['Key 1', 'Key 2', 'Key 3'].forEach((k, i) => {
      const ki = sc.findOne((n) => n.name === k && n.type === 'INSTANCE');
      if (ki && s.shortcut.keys[i]) setp(ki, s.shortcut.keys[i]);
    });
  }
}
return { instances: shots.length, variants: tr.children.map((v) => [v.name, v.id]) };
