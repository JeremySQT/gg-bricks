// Focus as a property only (use_figma body), 2026-10-28.
// User review of the Figma parity gate: InputText and Textarea showed focus twice (State=focus and the Focus
// boolean) while the other controls use the boolean alone. This migration keeps the boolean:
// - every instance of a State=focus variant on the forms pages is swapped to State=default with Focus on;
// - the State=focus variants are removed (InputText 10, Textarea 6);
// - default and hover variants get a “Focus border” layer (inside stroke color/field/focus/border at
//   border/width/default, radius/control, visible = Focus): the code paints the focus border by precedence
//   disabled, readonly, invalid, focus, hover, so readonly and invalid keep their own border under the ring;
// - disabled variants are never focused: their ring no longer follows Focus;
// - the Field's Header and Body stop clipping, so the control's ring outside its edge shows (the Focus
//   boolean of a control inside a Field looked broken);
// then lays the two sets out again. The builders input-text-master and textarea-master build the same result.
figma.skipInvisibleInstanceChildren = false;
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((x) => x.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const PAGES = ['288:3', '288:4', '288:5', '288:6', '288:7', '288:8', '288:9'];
const out = {};
for (const [setId, name] of [
  ['293:1046', 'InputText'],
  ['294:291', 'Textarea']
]) {
  const set = await figma.getNodeByIdAsync(setId);
  const FOCUS = Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith('Focus'));
  const focusVariants = set.children.filter((v) => v.name.includes('State=focus'));
  // 1. Swap the instances of the focus variants.
  let swapped = 0;
  for (const pid of PAGES) {
    const page = await figma.getNodeByIdAsync(pid);
    await page.loadAsync();
    for (const inst of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
      if (!inst.mainComponent || !focusVariants.includes(inst.mainComponent)) continue;
      const target = set.children.find(
        (v) => v.name === inst.mainComponent.name.replace('State=focus', 'State=default')
      );
      inst.swapComponent(target);
      inst.setProperties({ [FOCUS]: true });
      swapped++;
    }
  }
  // 2. Remove the focus variants.
  for (const v of focusVariants) v.remove();
  // 3. Focus border on default and hover; 4. no focus on disabled.
  for (const v of set.children) {
    const ring = v.children.find((n) => n.name === 'Focus ring');
    for (const n of v.children.filter((n) => n.name === 'Focus border')) n.remove();
    if (v.name.includes('State=disabled')) {
      ring.componentPropertyReferences = {};
      ring.visible = false;
      continue;
    }
    ring.componentPropertyReferences = { visible: FOCUS };
    if (!/State=(default|hover)/.test(v.name)) continue;
    const fb = figma.createFrame();
    fb.name = 'Focus border';
    fb.fills = [];
    v.insertChild(v.children.indexOf(ring), fb);
    fb.layoutPositioning = 'ABSOLUTE';
    fb.x = 0;
    fb.y = 0;
    fb.resize(v.width, v.height);
    fb.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    fb.strokes = [paint('color/field/focus/border')];
    fb.strokeAlign = 'INSIDE';
    for (const f of STROKES) fb.setBoundVariable(f, V('border/width/default'));
    for (const f of RADII) fb.setBoundVariable(f, V('radius/control'));
    fb.componentPropertyReferences = { visible: FOCUS };
  }
  // 5. Layout: InputText columns State, rows Size × Action × Content; Textarea rows Size × Content.
  const ST = ['default', 'hover', 'readonly', 'disabled', 'invalid'];
  const GAP = 32;
  const COL = name === 'InputText' ? 272 : 312;
  const rows = [];
  for (const v of set.children) {
    const key = v.name.replace(/, State=\w+/, '');
    let r = rows.find((x) => x.key === key);
    if (!r) rows.push((r = { key, items: [] }));
    r.items.push(v);
  }
  let y = GAP;
  for (const r of rows) {
    for (const v of r.items) {
      v.x = GAP + ST.indexOf(v.name.match(/State=(\w+)/)[1]) * COL;
      v.y = y;
    }
    y += Math.max(...r.items.map((v) => v.height)) + (name === 'InputText' ? 32 : 24);
  }
  set.resizeWithoutConstraints(GAP * 2 + ST.length * COL - 32, y + GAP - (name === 'InputText' ? 32 : 24));
  const FOCUS_TEXT =
    'Size and State mirror the code; Focus shows the keyboard focus (the ring, and the focus border on a default or hovered field; an invalid or readonly field keeps its border)';
  set.description = set.description
    .replace(
      'Size and State mirror the code (State focus shows the focus ring; for an invalid or readonly field that has focus, turn Focus on)',
      FOCUS_TEXT
    )
    .replace(
      'Size and State mirror the code (State focus shows the focus ring; Focus adds it to another state)',
      FOCUS_TEXT
    );
  out[name] = { swapped, removed: focusVariants.length, variants: set.children.length };
}
const fieldPage = await figma.getNodeByIdAsync('288:4');
const field = fieldPage.children.find((n) => n.type === 'COMPONENT_SET' && n.name === 'Field');
for (const v of field.children)
  for (const n of v.findAll((n) => ['Header', 'Body', 'Label row'].includes(n.name))) n.clipsContent = false;
out.field = 'Header, Body and Label row no longer clip';
return out;
