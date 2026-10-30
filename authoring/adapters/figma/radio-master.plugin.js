// Radio master builder (use_figma body), 2026-10-27.
// On the page forms/radio (288:6): the component set “Radio” (Size × Selection × State, 30 variants), the option of
// a RadioGroup. Same construction as Checkbox: a first-line frame (typography/body/{size}/lineHeight) holds the
// circle (size/choice/{size}, radius/full, border/width/default, color/choice/{off|on}/{state}/…); the dot is an
// ellipse of radio/dot (3/8 of the box, Components adapter, the variant sets its Components mode) in
// color/choice/on/{state}/content. Size comes from the group in code; here it is a variant so that the group can
// hold radios of its size. Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:6');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'Radio')) n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const AC = cols.find((c) => c.name === 'Components');
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('missing variable ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const bind = (node, fields, name) => {
  for (const f of fields) node.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const S = ['md', 'sm', 'lg'];
const SEL = ['off', 'on'];
const ST = ['default', 'hover', 'readonly', 'disabled', 'invalid'];
const comps = [];
for (const sel of SEL)
  for (const st of ST)
    for (const s of S) {
      const role = (r) => `color/choice/${sel}/${st}/${r}`;
      const c = figma.createComponent();
      c.name = `Size=${s}, Selection=${sel}, State=${st}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
      c.counterAxisAlignItems = 'MIN';
      c.fills = [];
      c.clipsContent = false;
      c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
      bind(c, ['itemSpacing'], `space/control/gap/${s}`);
      const line = figma.createAutoLayout('HORIZONTAL', { name: 'First line' });
      line.fills = [];
      line.clipsContent = false;
      line.counterAxisAlignItems = 'CENTER';
      c.appendChild(line);
      line.counterAxisSizingMode = 'FIXED';
      bind(line, ['height'], `typography/body/${s}/lineHeight`);
      const box = figma.createAutoLayout('HORIZONTAL', { name: 'Control' });
      box.primaryAxisAlignItems = 'CENTER';
      box.counterAxisAlignItems = 'CENTER';
      box.clipsContent = false;
      line.appendChild(box);
      box.primaryAxisSizingMode = 'FIXED';
      box.counterAxisSizingMode = 'FIXED';
      bind(box, ['width', 'height'], `size/choice/${s}`);
      bind(box, RADII, 'radius/full');
      box.fills = [paint(role('surface'))];
      box.strokes = [paint(role('border'))];
      box.strokeAlign = 'INSIDE';
      box.strokesIncludedInLayout = false;
      bind(box, STROKES, 'border/width/default');
      if (sel === 'on') {
        const dot = figma.createEllipse();
        dot.name = 'Mark';
        box.appendChild(dot);
        bind(dot, ['width', 'height'], 'radio/dot');
        dot.fills = [paint(role('content'))];
      }
      const ring = figma.createFrame();
      ring.name = 'Focus ring';
      ring.fills = [];
      box.appendChild(ring);
      ring.layoutPositioning = 'ABSOLUTE';
      ring.x = -2;
      ring.y = -2;
      ring.resize(box.width + 4, box.height + 4);
      ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      ring.strokes = [paint('color/focus/ring')];
      ring.strokeAlign = 'OUTSIDE';
      bind(ring, STROKES, 'focus/width');
      bind(ring, RADII, 'radius/full');
      ring.visible = false;
      const text = figma.createAutoLayout('VERTICAL', { name: 'Text', itemSpacing: 0 });
      text.fills = [];
      c.appendChild(text);
      const label = figma.createText();
      label.name = 'Label';
      await label.setTextStyleIdAsync(style(`body/${s}`).id);
      label.characters = 'Option';
      label.fills = [paint(st === 'disabled' ? 'color/content/disabled' : 'color/content/primary')];
      text.appendChild(label);
      const desc = figma.createText();
      desc.name = 'Description';
      await desc.setTextStyleIdAsync(style('body/sm').id);
      desc.characters = 'Description';
      desc.fills = [paint(st === 'disabled' ? 'color/content/disabled' : 'color/content/secondary')];
      text.appendChild(desc);
      desc.visible = false;
      const target = figma.createFrame();
      target.name = 'Target';
      target.fills = [];
      c.appendChild(target);
      target.layoutPositioning = 'ABSOLUTE';
      bind(target, ['height'], 'size/target/min');
      target.resize(c.width, target.height);
      target.x = 0;
      target.y = (c.height - target.height) / 2;
      target.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, page);
set.name = 'Radio';
set.description =
  'One option of a RadioGroup; use it inside a RadioGroup only. Source of truth: foundations/components/forms/radio/contract.json; implementation: packages/svelte/src/components/radio. Size follows the group (set the same size on every radio of a group), Selection is on for the selected value, State mirrors the group’s condition (readonly and invalid come from the group; disabled from the radio or the group). Focus shows the keyboard focus ring. Label is the accessible name; Show description adds the help text.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Option');
const DESC = set.addComponentProperty('Description', 'TEXT', 'Description');
const SHOW_DESC = set.addComponentProperty('Show description', 'BOOLEAN', false);
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Description').componentPropertyReferences = { characters: DESC, visible: SHOW_DESC };
  v.findOne((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
}
const GAP = 32,
  COL = 140,
  ROW = 44;
set.children.forEach((v, k) => {
  const row = Math.floor(k / 3);
  v.x = GAP + (k % 3) * COL;
  v.y = GAP + row * ROW + Math.floor(row / ST.length) * 16;
});
set.resizeWithoutConstraints(GAP * 2 + 3 * COL, GAP * 2 + 10 * ROW + 16);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions)
};
