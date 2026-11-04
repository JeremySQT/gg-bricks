// Tooltip and Popover master builder (use_figma body), 2026-11-03.
// 2026-11-04 (user review of the Figma parity): the boolean Show trigger, off by default, shows the Trigger slot of both sets.
// On the Overlays library page (407:119), sections Tooltip and Popover: two sets of six placements (Side × Align). Each
// variant is a vertical auto layout with the gap space/content/xs (the offset), its children aligned at the start, the
// center or the end (Align), holding the slot Trigger and the overlay above it (Side=top) or under it (Side=bottom).
// Tooltip: the bubble “Tooltip” (color/surface/inverse, padding space/content/sm × xs, radius/control, max width
// component/tooltip/max-inline-size) with the Label text (caption/md, color/content/inverse) filling it and wrapping;
// Trigger accepts Button, IconButton or Link (default: an outline IconButton with the dots-three glyph).
// Popover: the Panel (color/surface/overlay, inside edge color/elevation/border, shadow/overlay, radius/overlay, padding
// space/content/md, max width size/overlay/panel) holding the slot Content (a heading and a text by default, filling and
// wrapping); Trigger accepts Button or IconButton (default: an outline Button “Filters”); a hidden text behind the Label
// property names the panel. Default variants: Tooltip top · center, Popover bottom · start (top left of each set).
// Rerunning replaces both sets.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:119');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing ' + name);
  return v;
};
const paint = (name, node) => {
  const v = V(name);
  const c = v.resolveForConsumer(node).value;
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
};
const bind = (n, fields, name) => {
  for (const f of fields) n.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const PADS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['caption/md', 'body/sm', 'label/md']) await figma.loadFontAsync(style(s).fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/overlay');
const BTN = await figma.getNodeByIdAsync('48:1586');
const IB = await figma.getNodeByIdAsync('211:1167');
const LINK = await figma.getNodeByIdAsync('232:659');
const DOTS = await figma.getNodeByIdAsync('200:4868');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
const ibOutline = IB.children.find(
  (c) =>
    /Intent=neutral/.test(c.name) &&
    /Appearance=outline/.test(c.name) &&
    /Size=md/.test(c.name) &&
    /State=default/.test(c.name)
);
const btnOutline = BTN.children.find((c) => c.name === 'Intent=neutral, Appearance=outline, Size=md, State=default');
const sectionFor = (name) => {
  let s = page.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!s) {
    const above = page.children.filter((n) => n.type === 'SECTION');
    s = figma.createSection();
    s.name = name;
    page.appendChild(s);
    s.y = above.length ? Math.max(...above.map((n) => n.y + n.height)) + 160 : 0;
    s.fills = [
      figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
    ];
  }
  for (const n of s.children.filter((n) => n.name === name)) n.remove();
  return s;
};
const textNode = (name, st, chars, color, parent, fillWidth) => {
  const t = figma.createText();
  t.textStyleId = style(st).id;
  t.characters = chars;
  t.name = name; // after the characters, which rename an auto-named layer
  parent.appendChild(t);
  t.fills = [paint(color, t)];
  if (fillWidth) {
    t.layoutSizingHorizontal = 'FILL';
    t.textAutoResize = 'HEIGHT';
  }
  return t;
};
const placementSet = (name, sides, aligns, makeOverlay, makeTrigger, triggers, describe, slotDesc) => {
  const section = sectionFor(name);
  const comps = [];
  for (const side of sides)
    for (const al of aligns) {
      const c = figma.createComponent();
      c.name = `Side=${side}, Align=${al}`;
      c.layoutMode = 'VERTICAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
      c.fills = [];
      c.clipsContent = false;
      c.counterAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX' }[al];
      bind(c, ['itemSpacing'], 'space/content/xs');
      const slot = c.createSlot();
      slot.name = 'Trigger';
      slot.fills = [];
      slot.clipsContent = false;
      slot.layoutMode = 'HORIZONTAL';
      slot.primaryAxisSizingMode = 'AUTO';
      slot.counterAxisSizingMode = 'AUTO';
      slot.appendChild(makeTrigger());
      const ov = makeOverlay(c);
      if (side === 'top') c.insertChild(0, ov);
      comps.push(c);
    }
  const set = figma.combineAsVariants(comps, section);
  set.name = name;
  let slotDefs = Object.keys(set.componentPropertyDefinitions).filter(
    (k) => set.componentPropertyDefinitions[k].type === 'SLOT'
  );
  if (slotDefs.length > 1) {
    for (const v of set.children)
      v.findChild((n) => n.type === 'SLOT').componentPropertyReferences = { slotContentId: slotDefs[0] };
    for (const k of slotDefs.slice(1)) if (set.componentPropertyDefinitions[k]) set.deleteComponentProperty(k);
    slotDefs = [slotDefs[0]];
  }
  set.editComponentProperty(slotDefs[0], {
    name: 'Trigger',
    description: slotDesc,
    preferredValues: triggers.map((t) => ({ type: 'COMPONENT_SET', key: t.key })),
    slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
  });
  // Show trigger, off by default (user review of the Figma parity, 2026-11-04): a designer places the overlay over a
  // control already in the design; switched on, the slot shows the placement against one trigger.
  const pTrig = set.addComponentProperty('Show trigger', 'BOOLEAN', false);
  for (const v of set.children) {
    const sl = v.findChild((n) => n.type === 'SLOT');
    sl.componentPropertyReferences = { ...sl.componentPropertyReferences, visible: pTrig };
  }
  set.description = describe;
  const maxW = Math.max(...set.children.map((c) => c.width));
  const maxH = Math.max(...set.children.map((c) => c.height));
  set.children.forEach((v, j) => {
    v.x = 32 + (j % 3) * (maxW + 48);
    v.y = 32 + Math.floor(j / 3) * (maxH + 48);
  });
  set.resizeWithoutConstraints(64 + 3 * maxW + 96, 64 + 2 * maxH + 48);
  set.x = 80;
  set.y = 80;
  section.resizeWithoutConstraints(set.width + 160, set.height + 160);
  return { section, set };
};
// Tooltip.
const tip = placementSet(
  'Tooltip',
  ['top', 'bottom'],
  ['center', 'start', 'end'],
  (c) => {
    const b = figma.createAutoLayout('HORIZONTAL', { name: 'Tooltip' });
    c.appendChild(b);
    b.clipsContent = false;
    bind(b, ['paddingLeft', 'paddingRight'], 'space/content/sm');
    bind(b, ['paddingTop', 'paddingBottom'], 'space/content/xs');
    bind(b, RADII, 'radius/control');
    b.fills = [paint('color/surface/inverse', b)];
    b.setBoundVariable('maxWidth', V('component/tooltip/max-inline-size'));
    // A filling text in a hugging frame with a max width wraps at the max width and hugs short labels.
    textNode('Label', 'caption/md', 'More actions', 'color/content/inverse', b, true);
    return b;
  },
  () => {
    const i = ibOutline.createInstance();
    setP(i, 'Icon', DOTS.id);
    setP(i, 'Label', 'More actions');
    return i;
  },
  [BTN, IB, LINK],
  'Tooltip (overlays/tooltip): a short plain text about a control, shown on pointer hover (after component/tooltip/delay) and on keyboard focus. Side (top, bottom) and Align (start, center, end) place it at space/content/xs from the trigger; the code flips and shifts it when the viewport lacks room, and it has no arrow. Bubble: color/surface/inverse, caption/md in color/content/inverse, padding space/content/sm × xs, radius/control, at most component/tooltip/max-inline-size wide. Trigger slot: one Button, IconButton or Link. Opening, delay, motion and the top layer are behaviors of the code.',
  'Exactly one focusable Button, IconButton or Link: the control the tooltip describes.'
);
const tLabel = tip.set.addComponentProperty('Label', 'TEXT', 'More actions');
for (const v of tip.set.children)
  v.findChild((n) => n.name === 'Tooltip').findChild((n) => n.type === 'TEXT').componentPropertyReferences = {
    characters: tLabel
  };
// Popover.
const pop = placementSet(
  'Popover',
  ['bottom', 'top'],
  ['start', 'center', 'end'],
  (c) => {
    const p = figma.createAutoLayout('VERTICAL', { name: 'Panel' });
    c.appendChild(p);
    p.clipsContent = false;
    bind(p, PADS, 'space/content/md');
    bind(p, RADII, 'radius/overlay');
    bind(p, ['itemSpacing'], 'space/content/sm');
    p.fills = [paint('color/surface/overlay', p)];
    p.strokes = [paint('color/elevation/border', p)];
    p.strokeAlign = 'INSIDE';
    bind(p, STROKES, 'border/width/default');
    p.strokesIncludedInLayout = false;
    p.setBoundVariable('maxWidth', V('size/overlay/panel'));
    return p;
  },
  () => {
    const i = btnOutline.createInstance();
    setP(i, 'Label', 'Filters');
    return i;
  },
  [BTN, IB],
  'Popover (overlays/popover): a non-modal panel anchored to its trigger, holding free content the user may interact with (a short form, filters, details). Side (bottom, top) and Align (start, center, end) place it at space/content/xs from the trigger; the code flips and shifts it. Panel: color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/md, content in body/sm, at most size/overlay/panel wide. Trigger slot: one Button or IconButton. Focus moves into the panel on opening; Escape, a press outside and focus leaving close it (code behaviors).',
  'Exactly one Button or IconButton: activating it toggles the popover.'
);
for (const v of pop.set.children) {
  const p = v.findChild((n) => n.name === 'Panel');
  await p.setEffectStyleIdAsync(shadow.id);
  const slot = v.createSlot();
  slot.name = 'Content';
  slot.fills = [];
  slot.clipsContent = false;
  slot.layoutMode = 'VERTICAL';
  slot.primaryAxisSizingMode = 'AUTO';
  slot.counterAxisSizingMode = 'AUTO';
  bind(slot, ['itemSpacing'], 'space/content/sm');
  p.appendChild(slot);
  slot.layoutSizingHorizontal = 'FILL';
  textNode('Heading', 'label/md', 'Filters', 'color/content/primary', slot, true);
  textNode('Text', 'body/sm', 'Show only the invoices that are due this month.', 'color/content/primary', slot, true);
}
let cDefs = Object.keys(pop.set.componentPropertyDefinitions).filter(
  (k) => pop.set.componentPropertyDefinitions[k].type === 'SLOT' && k.startsWith('Content')
);
if (cDefs.length > 1) {
  for (const v of pop.set.children)
    v.findOne((n) => n.type === 'SLOT' && n.name === 'Content').componentPropertyReferences = {
      slotContentId: cDefs[0]
    };
  for (const k of cDefs.slice(1)) if (pop.set.componentPropertyDefinitions[k]) pop.set.deleteComponentProperty(k);
  cDefs = [cDefs[0]];
}
pop.set.editComponentProperty(cDefs[0], {
  name: 'Content',
  description:
    'The content of the panel: text, a short form, filters. Focus moves to its first focusable element on opening.'
});
const pLabel = pop.set.addComponentProperty('Label', 'TEXT', 'Filters');
for (const v of pop.set.children) {
  const t = figma.createText();
  v.appendChild(t);
  t.textStyleId = style('label/md').id;
  t.characters = 'Filters';
  t.name = 'Panel name (not shown)';
  t.visible = false;
  t.componentPropertyReferences = { characters: pLabel };
}
pop.section.y = tip.section.y + tip.section.height + 160;
return { tooltip: tip.set.id, popover: pop.set.id };
