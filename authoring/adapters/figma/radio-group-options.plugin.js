// SUPERSEDED on 2026-10-28 by radio-group-slot.plugin.js (the user did not approve hidden options): do not run.
// RadioGroup options as properties (use_figma body), 2026-10-28.
// User review of the Figma parity gate: designers should add options to a RadioGroup without detaching it
// (an instance cannot receive new layers). Every variant of the set (292:327) now holds eight Radio instances,
// Option 1 to Option 8, of the group's size: options 1 and 2 always show (a group has at least two), the
// booleans Show option 3 … Show option 8 show the others (3 by default). Each option is an exposed instance, so
// its Label, Description, Selection and State are set from the group's panel. The three existing radios are
// renamed (their IDs and the overrides of existing instances stay); options 4 to 8 are copies of option 3.
// Instances that hid their third radio get Show option 3 off. Rerunning keeps the result (idempotent).
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync('292:327');
const radio = await figma.getNodeByIdAsync('290:257');
const RLABEL = Object.keys(radio.componentPropertyDefinitions).find((k) => k.startsWith('Label'));
const MAX = 8;
// Boolean properties, created once.
const defs = set.componentPropertyDefinitions;
const SHOW = {};
for (let i = 3; i <= MAX; i++) {
  const name = `Show option ${i}`;
  SHOW[i] =
    Object.keys(defs).find((k) => k.split('#')[0] === name) || set.addComponentProperty(name, 'BOOLEAN', i === 3);
}
for (const v of set.children) {
  const options = v.children.filter((n) => n.type === 'INSTANCE');
  options.forEach((o, k) => {
    if (/^Radio \d$/.test(o.name)) o.name = `Option ${k + 1}`;
  });
  const hidden = v.children.find((n) => n.name === 'Label (accessible name, not shown)');
  for (let i = options.length + 1; i <= MAX; i++) {
    const copy = options[2].clone();
    copy.name = `Option ${i}`;
    v.insertChild(v.children.indexOf(hidden), copy);
    copy.setProperties({ [RLABEL]: `Option ${i}` });
  }
  for (let i = 1; i <= MAX; i++) {
    const o = v.children.find((n) => n.name === `Option ${i}`);
    o.isExposedInstance = true;
    if (i >= 3) {
      o.visible = i === 3;
      o.componentPropertyReferences = { visible: SHOW[i] };
    }
  }
}
// Existing instances that hid their third radio.
let fixed = 0;
for (const pid of ['288:3', '288:4', '288:5', '288:6', '288:7', '288:8', '288:9']) {
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
    const third = inst.children.find((n) => n.name === 'Option 3');
    if (third && third.visible === false && inst.componentProperties[SHOW[3]].value === true) {
      inst.setProperties({ [SHOW[3]]: false });
      fixed++;
    }
  }
}
set.description = set.description.replace(
  'Add or remove radios by duplicating one.',
  'Options 1 and 2 always show; Show option 3 … Show option 8 add options. Each option is exposed: set its Label, Description, Selection and State from the group’s panel.'
);
// Layout: the variants grew; lay them out again in two rows (vertical, horizontal).
const GAP = 32;
let x = GAP;
set.children.forEach((v, k) => {
  if (k === 3) x = GAP;
  v.x = x;
  v.y = k < 3 ? GAP : GAP + Math.max(...set.children.slice(0, 3).map((c) => c.height)) + 48;
  x += v.width + 48;
});
set.resizeWithoutConstraints(
  Math.max(...set.children.map((v) => v.x + v.width)) + GAP,
  Math.max(...set.children.map((v) => v.y + v.height)) + GAP
);
return {
  props: Object.keys(set.componentPropertyDefinitions),
  options: set.children.map((v) => v.children.filter((n) => n.type === 'INSTANCE').length),
  fixed
};
