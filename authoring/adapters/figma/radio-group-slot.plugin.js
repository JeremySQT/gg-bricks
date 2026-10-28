// RadioGroup options in a Figma slot (use_figma body), 2026-10-28.
// User review: the eight hidden options of radio-group-options.plugin.js were not approved ("trop saturé
// d'options"); the options go in a Figma slot so designers add, remove and reorder Radio instances freely.
// - Every instance of the set (292:327) on the forms pages is recorded first: its shown options (main component
//   and property values, layers named Option N or Radio N).
// - A slot cannot pass the group's size to the radios dropped into it, so Size leaves the group: instances of the
//   sm and lg variants are swapped to md (their recorded radios keep their size), then sm and lg are removed and
//   the two remaining variants are named by Orientation only.
// - Each variant holds a slot "Options" (one SLOT property shared by both variants): vertical stacks with
//   space/content/sm, horizontal wraps with space/content/lg and space/content/sm (the variant's fixed width sets
//   where it wraps; resize an instance to change it). Default content: three Radio md. Settings: at least two
//   children, Radio preferred and the only allowed content. The Show option booleans are deleted.
// - Every recorded instance gets its options back in its slot.
// Runs once on the eight-option structure; rerunning on the slot structure only refreshes settings and layout.
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync('292:327');
const radio = await figma.getNodeByIdAsync('290:257');
const PAGES = ['288:3', '288:4', '288:5', '288:6', '288:7', '288:8', '288:9'];
const vars = await figma.variables.getLocalVariablesAsync();
const V = (id) => vars.find((x) => x.id === id);
const out = { recorded: 0, swapped: 0, filled: 0, failed: [] };

// 1. Record the instances and their shown options.
const recs = [];
for (const pid of PAGES) {
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  for (const inst of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
    let main = null;
    try {
      main = await inst.getMainComponentAsync();
    } catch (e) {
      continue;
    }
    if (!main || main.parent !== set) continue;
    const options = [];
    for (const o of inst.children.filter(
      (n) => n.type === 'INSTANCE' && n.visible && /^(Option|Radio) \d$/.test(n.name)
    )) {
      const m = await o.getMainComponentAsync();
      const props = {};
      for (const [k, p] of Object.entries(o.componentProperties)) if (p.type !== 'VARIANT') props[k] = p.value;
      options.push([m.id, props]);
    }
    recs.push({ id: inst.id, main, options, sizing: inst.layoutSizingHorizontal, width: inst.width });
  }
}
out.recorded = recs.length;
const already = set.children.length === 2;

if (!already) {
  const md = (o) => set.children.find((v) => v.name === `Orientation=${o}, Size=md`);
  // 2. Swap sm and lg instances to md, then remove sm and lg.
  for (const r of recs) {
    if (r.main.name.includes('Size=md')) continue;
    const inst = await figma.getNodeByIdAsync(r.id);
    inst.swapComponent(md(r.main.name.match(/Orientation=(\w+)/)[1]));
    out.swapped++;
  }
  for (const v of [...set.children]) if (!v.name.includes('Size=md')) v.remove();
  // 3. Slot in each variant; options 1–3 move into it, 4–8 go.
  const slotKeys = [];
  for (const v of [...set.children]) {
    const opts = v.children.filter((n) => n.type === 'INSTANCE');
    const slot = v.createSlot();
    slot.name = 'Options';
    slot.fills = [];
    slot.clipsContent = false;
    slot.layoutMode = v.layoutMode;
    slot.layoutWrap = v.layoutWrap;
    slot.primaryAxisSizingMode = 'AUTO';
    slot.counterAxisSizingMode = 'AUTO';
    slot.itemSpacing = v.itemSpacing;
    slot.setBoundVariable('itemSpacing', V(v.boundVariables.itemSpacing.id));
    if (v.boundVariables.counterAxisSpacing) {
      slot.counterAxisSpacing = v.counterAxisSpacing;
      slot.setBoundVariable('counterAxisSpacing', V(v.boundVariables.counterAxisSpacing.id));
    }
    opts.forEach((o, k) => {
      o.componentPropertyReferences = {};
      if (k < 3) {
        o.visible = true;
        o.isExposedInstance = false;
        o.name = `Radio ${k + 1}`;
        slot.appendChild(o);
      } else o.remove();
    });
    const horizontal = v.layoutMode === 'HORIZONTAL';
    const width = v.width;
    v.setBoundVariable('itemSpacing', null);
    if (v.boundVariables.counterAxisSpacing) v.setBoundVariable('counterAxisSpacing', null);
    v.layoutWrap = 'NO_WRAP';
    v.layoutMode = 'VERTICAL';
    v.itemSpacing = 0;
    v.insertChild(0, slot);
    if (horizontal) {
      v.counterAxisSizingMode = 'FIXED';
      v.resize(width, v.height);
      v.primaryAxisSizingMode = 'AUTO';
      slot.layoutSizingHorizontal = 'FILL';
    }
    slotKeys.push(slot.componentPropertyReferences.slotContentId);
    v.name = `Orientation=${horizontal ? 'horizontal' : 'vertical'}`;
  }
  // One SLOT property for both variants.
  const [key, other] = slotKeys;
  if (other && other !== key) {
    const s = set.children[1].findChild((n) => n.type === 'SLOT');
    s.componentPropertyReferences = { slotContentId: key };
    if (set.componentPropertyDefinitions[other]) set.deleteComponentProperty(other);
  }
  for (const k of Object.keys(set.componentPropertyDefinitions))
    if (k.startsWith('Show option')) set.deleteComponentProperty(k);
}
const slotKey = Object.keys(set.componentPropertyDefinitions).find(
  (k) => set.componentPropertyDefinitions[k].type === 'SLOT'
);
set.editComponentProperty(slotKey, {
  name: 'Options',
  description:
    'The radios of the group, in order. Add, remove or reorder Radio instances (two at least) and give them all the same Size: the code sets the size once on the group.',
  preferredValues: [{ type: 'COMPONENT_SET', key: radio.key }],
  slotSettings: { minChildren: 2, allowPreferredValuesOnly: true }
});

// 4. Give every recorded instance its options back.
if (!already)
  for (const r of recs) {
    try {
      const inst = await figma.getNodeByIdAsync(r.id);
      const slot = inst.findAllWithCriteria({ types: ['SLOT'] })[0];
      for (const c of [...slot.children]) c.remove();
      for (const [mid, props] of r.options) {
        const m = await figma.getNodeByIdAsync(mid);
        const ri = m.createInstance();
        ri.setProperties(props);
        slot.appendChild(ri);
      }
      if (r.sizing === 'FIXED') inst.resize(r.width, inst.height);
      out.filled++;
    } catch (e) {
      out.failed.push(`${r.id}: ${e}`);
    }
  }

set.description = set.description
  .replace(
    /Orientation and Size mirror the code \(default vertical · md\); the radios inside take the group’s size\./,
    'Orientation mirrors the code (default vertical). Size is set on every Radio (the code sets it once on the group).'
  )
  .replace(
    /Options 1 and 2 always show;.*$/,
    'Options is a slot: add, remove or reorder Radio instances (two at least) and set their Label, Description, Selection and State on each one.'
  );
// Layout: the two variants side by side.
let x = 32;
for (const v of set.children) {
  v.x = x;
  v.y = 32;
  x += v.width + 48;
}
set.resizeWithoutConstraints(x - 48 + 32, Math.max(...set.children.map((v) => v.height)) + 64);
out.variants = set.children.map((v) => [v.id, v.name, Math.round(v.width), Math.round(v.height)]);
out.props = Object.entries(set.componentPropertyDefinitions).map(([k, d]) => [k, d.type]);
out.slots = set.children.map((v) => v.findChild((n) => n.type === 'SLOT').id);
out.violations = [];
for (const r of recs) {
  const inst = await figma.getNodeByIdAsync(r.id);
  const s = inst && inst.findAllWithCriteria({ types: ['SLOT'] })[0];
  if (!s || s.limitViolations.length || s.children.length !== r.options.length)
    out.violations.push([r.id, s ? s.children.length : null, s ? s.limitViolations : 'no slot']);
}
return out;
