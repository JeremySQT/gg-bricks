// Checkbox master builder (use_figma body), 2026-10-27.
// On the page forms/checkbox (288:3): the internal parts _Checkbox/Check and _Checkbox/Minus (Phosphor 2.1.1 bold
// check and minus, as in the code, scaled with the box) and the component set “Checkbox” (Size × Selection ×
// State, 45 variants). Every visual property is bound to a variable: the box to size/choice/{size},
// radius/indicator, border/width/default and color/choice/{off|on}/{state}/{surface|border|content}; the label to
// typography/body/{size} and color/content/primary (disabled: color/content/disabled); the description to
// typography/body/sm and color/content/secondary. The box sits in a frame as tall as the first line
// (typography/body/{size}/lineHeight) so that it is centered on the first line in every density. The 44 px
// target is an absolute empty layer. The focus ring corners use the Brand adapter variable checkbox/focus-radius
// (run checkbox-focus-radius.plugin.js first). Rerunning replaces the set and the parts.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:3');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => ['Checkbox', '_Checkbox/Check', '_Checkbox/Minus'].includes(n.name)))
  n.remove();
const vars = await figma.variables.getLocalVariablesAsync();
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
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style: st });

// Marks: Phosphor 2.1.1 bold, 256-unit grid, scaled with the box.
const mark = (name, d, x) => {
  const svg = figma.createNodeFromSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path d="${d}" fill="#000"/></svg>`
  );
  const c = figma.createComponent();
  c.name = name;
  c.resize(256, 256);
  c.fills = [];
  for (const ch of [...svg.children]) {
    c.appendChild(ch);
    ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    ch.fills = [paint('color/choice/on/default/content')];
  }
  svg.remove();
  c.description = 'Internal part of Checkbox (Phosphor Icons 2.1.1, bold, MIT). Not for direct use.';
  c.x = x;
  c.y = -360;
  return c;
};
const CHECK = mark(
  '_Checkbox/Check',
  'M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z',
  0
);
const MINUS = mark('_Checkbox/Minus', 'M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z', 300);

const S = ['md', 'sm', 'lg'];
const SEL = ['off', 'on', 'indeterminate'];
const ST = ['default', 'hover', 'readonly', 'disabled', 'invalid'];
const comps = [];
const marks = [];
for (const sel of SEL)
  for (const st of ST)
    for (const s of S) {
      const key = sel === 'off' ? 'off' : 'on';
      const role = (r) => `color/choice/${key}/${st}/${r}`;
      const c = figma.createComponent();
      c.name = `Size=${s}, Selection=${sel}, State=${st}`;
      c.layoutMode = 'HORIZONTAL';
      c.primaryAxisSizingMode = 'AUTO';
      c.counterAxisSizingMode = 'AUTO';
      c.counterAxisAlignItems = 'MIN';
      c.fills = [];
      c.clipsContent = false;
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
      bind(box, RADII, 'radius/indicator');
      box.fills = [paint(role('surface'))];
      box.strokes = [paint(role('border'))];
      box.strokeAlign = 'INSIDE';
      box.strokesIncludedInLayout = false;
      bind(box, STROKES, 'border/width/default');
      if (sel !== 'off') {
        const m = (sel === 'on' ? CHECK : MINUS).createInstance();
        m.name = 'Mark';
        box.appendChild(m);
        m.layoutPositioning = 'ABSOLUTE';
        m.x = 0;
        m.y = 0;
        m.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
        bind(m, ['width', 'height'], `size/choice/${s}`);
        marks.push([m, role('content')]);
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
      // Concentric with the box: radius/indicator + focus/offset (checkbox-focus-radius.plugin.js creates it).
      bind(ring, RADII, 'checkbox/focus-radius');
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

      // Interaction target: at least 44 px tall around the row, outside the layout.
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
set.name = 'Checkbox';
set.description =
  'Turns one option on or off for a choice confirmed later. Source of truth: foundations/components/forms/checkbox/contract.json; implementation: packages/svelte/src/components/checkbox. Size, Selection (off, on, indeterminate) and State (default, hover, readonly, disabled, invalid) mirror the code; Focus shows the keyboard focus ring. Label is the accessible name; Show description adds the help text; turn Show label off for a row selector (the label stays the name in code). The box sits on the first line of the label. Readonly and disabled boxes are not filled; the mark alone shows the choice.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Option');
const DESC = set.addComponentProperty('Description', 'TEXT', 'Description');
const SHOW_DESC = set.addComponentProperty('Show description', 'BOOLEAN', false);
const SHOW_LABEL = set.addComponentProperty('Show label', 'BOOLEAN', true);
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne((n) => n.name === 'Label').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Description').componentPropertyReferences = { characters: DESC, visible: SHOW_DESC };
  v.findOne((n) => n.name === 'Text').componentPropertyReferences = { visible: SHOW_LABEL };
  v.findOne((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
}
for (const [m, color] of marks) for (const g of m.findAll((n) => n.type === 'VECTOR')) g.fills = [paint(color)];
// Grid: rows Selection × State, columns Size (md first: the top-left default is md · off · default).
const GAP = 32,
  COL = 140,
  ROW = 44;
set.children.forEach((v, k) => {
  const row = Math.floor(k / 3);
  const col = k % 3;
  v.x = GAP + col * COL;
  v.y = GAP + row * ROW + Math.floor(row / ST.length) * 16;
});
set.resizeWithoutConstraints(GAP * 2 + 3 * COL, GAP * 2 + 15 * ROW + 32);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  parts: { check: CHECK.id, minus: MINUS.id },
  variants: set.children.length,
  defaultVariant: set.defaultVariant.name,
  props: Object.keys(set.componentPropertyDefinitions)
};
