// InputText master builder (use_figma body), 2026-10-27.
// On the page forms/input-text (288:5): the component set “InputText” (Size × Action × Content × State, 60
// variants; Action icon-button exists at md and lg only, as in the code). The root is the visible field: height
// size/control/{size}, fill color/field/{state}/surface, inner border color/field/{state}/border of
// border/width/default (outside the layout, as the code's inset shadow), corners radius/control, inline padding
// space/control/edge-inline/{size} (0 at the end with the action, as the code). Slots follow Button: a Leading or
// Trailing frame with space/control/slot-inline/{size} on both sides holds a drawing box of input-text/icon-box
// (iconSize − iconSize/4, Components adapter) with the Phosphor glyph at size/icon/{size} centered in it, in
// color/field/{state}/placeholder. The Input frame has space/control/label-inline/{size} on both sides and holds
// the value (color/field/{state}/content) or the placeholder (color/field/{state}/placeholder) in
// typography/body/{size}, one line, truncated. The action is a square of size/control/{size} holding an IconButton
// (211:1167) one size smaller, neutral ghost, with the x glyph; disabled with the field. The focus ring (focus/width,
// color/focus/ring, radius/focus, outside) always shows on State=focus and follows the Focus property otherwise (an
// invalid or readonly field keeps its colors while focused). Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:5');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'InputText' || n.name.startsWith('Size='))) n.remove();
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
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style: st });
const SEARCH = await figma.getNodeByIdAsync('200:5872'); // phosphor/magnifying-glass
const GLOBE = await figma.getNodeByIdAsync('200:5046'); // phosphor/globe
const X = '200:4368'; // phosphor/x
const ib = await figma.getNodeByIdAsync('211:1167');
const IB_ICON = Object.keys(ib.componentPropertyDefinitions).find((k) => k.startsWith('Icon'));
const IB_LABEL = Object.keys(ib.componentPropertyDefinitions).find((k) => k.startsWith('Label'));
const S = ['md', 'sm', 'lg'];
const C = ['placeholder', 'value'];
const ST = ['default', 'hover', 'focus', 'readonly', 'disabled', 'invalid'];
const comps = [];
const glyphs = [];
const slot = (name, glyph, s, st) => {
  const f = figma.createAutoLayout('HORIZONTAL', { name });
  f.fills = [];
  f.clipsContent = false;
  f.counterAxisAlignItems = 'CENTER';
  bind(f, ['paddingLeft', 'paddingRight'], `space/control/slot-inline/${s}`);
  const draw = figma.createAutoLayout('HORIZONTAL', { name: 'Drawing box' });
  draw.fills = [];
  draw.clipsContent = false;
  draw.primaryAxisAlignItems = 'CENTER';
  draw.counterAxisAlignItems = 'CENTER';
  f.appendChild(draw);
  draw.primaryAxisSizingMode = 'FIXED';
  draw.counterAxisSizingMode = 'FIXED';
  bind(draw, ['width'], 'input-text/icon-box');
  bind(draw, ['height'], `size/icon/${s}`);
  const icon = glyph.createInstance();
  icon.name = name + ' icon';
  draw.appendChild(icon);
  bind(icon, ['width', 'height'], `size/icon/${s}`);
  glyphs.push([icon, `color/field/${st}/placeholder`]);
  return f;
};
for (const s of S)
  for (const a of s === 'sm' ? ['none'] : ['none', 'icon-button'])
    for (const content of C)
      for (const st of ST) {
        const c = figma.createComponent();
        c.name = `Size=${s}, Action=${a}, Content=${content}, State=${st}`;
        c.layoutMode = 'HORIZONTAL';
        c.primaryAxisSizingMode = 'FIXED';
        c.counterAxisSizingMode = 'FIXED';
        c.counterAxisAlignItems = 'CENTER';
        c.itemSpacing = 0;
        c.clipsContent = false;
        c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
        c.resize(240, 40);
        bind(c, ['height'], `size/control/${s}`);
        bind(c, ['paddingLeft'], `space/control/edge-inline/${s}`);
        if (a === 'none') bind(c, ['paddingRight'], `space/control/edge-inline/${s}`);
        else c.paddingRight = 0;
        c.fills = [paint(`color/field/${st}/surface`)];
        c.strokes = [paint(`color/field/${st}/border`)];
        c.strokeAlign = 'INSIDE';
        c.strokesIncludedInLayout = false;
        bind(c, STROKES, 'border/width/default');
        bind(c, RADII, 'radius/control');

        const lead = slot('Leading', SEARCH, s, st);
        c.appendChild(lead);
        lead.visible = false;
        const input = figma.createAutoLayout('HORIZONTAL', { name: 'Input' });
        input.fills = [];
        input.counterAxisAlignItems = 'CENTER';
        c.appendChild(input);
        input.layoutSizingHorizontal = 'FILL';
        bind(input, ['paddingLeft', 'paddingRight'], `space/control/label-inline/${s}`);
        const t = figma.createText();
        t.name = content === 'value' ? 'Value' : 'Placeholder';
        await t.setTextStyleIdAsync(style(`body/${s}`).id);
        t.characters = content === 'value' ? 'Ada Lovelace' : 'Placeholder';
        t.fills = [paint(`color/field/${st}/${content === 'value' ? 'content' : 'placeholder'}`)];
        input.appendChild(t);
        t.layoutSizingHorizontal = 'FILL';
        t.textAutoResize = 'HEIGHT';
        t.textTruncation = 'ENDING';
        t.maxLines = 1;
        if (a === 'none') {
          const trail = slot('Trailing', GLOBE, s, st);
          c.appendChild(trail);
          trail.visible = false;
        } else {
          const act = figma.createAutoLayout('HORIZONTAL', { name: 'Action' });
          act.fills = [];
          act.clipsContent = false;
          act.primaryAxisAlignItems = 'CENTER';
          act.counterAxisAlignItems = 'CENTER';
          c.appendChild(act);
          act.primaryAxisSizingMode = 'FIXED';
          act.counterAxisSizingMode = 'FIXED';
          bind(act, ['width', 'height'], `size/control/${s}`);
          const inner = s === 'lg' ? 'md' : 'sm';
          const btn = ib.children
            .find(
              (v) =>
                v.name ===
                `Intent=neutral, Appearance=ghost, Size=${inner}, State=${st === 'disabled' ? 'disabled' : 'default'}`
            )
            .createInstance();
          btn.name = 'IconButton';
          act.appendChild(btn);
          btn.setProperties({ [IB_ICON]: X, [IB_LABEL]: 'Clear' });
        }
        const ring = figma.createFrame();
        ring.name = 'Focus ring';
        ring.fills = [];
        c.appendChild(ring);
        ring.layoutPositioning = 'ABSOLUTE';
        ring.x = -2;
        ring.y = -2;
        ring.resize(c.width + 4, c.height + 4);
        ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
        ring.strokes = [paint('color/focus/ring')];
        ring.strokeAlign = 'OUTSIDE';
        bind(ring, STROKES, 'focus/width');
        bind(ring, RADII, 'radius/focus');
        ring.visible = st === 'focus';
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
        const name = figma.createText();
        name.name = 'Label (accessible name, not shown)';
        await name.setTextStyleIdAsync(style('label/md').id);
        name.characters = 'Full name';
        c.appendChild(name);
        name.layoutPositioning = 'ABSOLUTE';
        name.visible = false;
        comps.push(c);
      }
const set = figma.combineAsVariants(comps, page);
set.name = 'InputText';
set.description =
  'A single line of text to enter or edit. Source of truth: foundations/components/forms/input-text/contract.json; implementation: packages/svelte/src/components/input-text. Size and State mirror the code (State focus shows the focus ring; for an invalid or readonly field that has focus, turn Focus on). Content shows the Value or the Placeholder (an example, never a label). Show leading and Show trailing add a decorative icon (choose it with Leading icon and Trailing icon; its size follows Size). Action icon-button (md and lg) holds an IconButton one size smaller, neutral ghost, for clear or show password (select it to change its icon and label). Same height and spacing as the Button of the same size. Inside a Field the field label names it; alone, Label is its accessible name (not shown). Set the width on the instance; the field fills it.';
const VALUE = set.addComponentProperty('Value', 'TEXT', 'Ada Lovelace');
const PH = set.addComponentProperty('Placeholder', 'TEXT', 'Placeholder');
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Full name');
const LEAD = set.addComponentProperty('Show leading', 'BOOLEAN', false);
const TRAIL = set.addComponentProperty('Show trailing', 'BOOLEAN', false);
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
const LICON = set.addComponentProperty('Leading icon', 'INSTANCE_SWAP', SEARCH.id);
const TICON = set.addComponentProperty('Trailing icon', 'INSTANCE_SWAP', GLOBE.id);
for (const v of set.children) {
  const val = v.findOne((n) => n.type === 'TEXT' && n.name === 'Value');
  if (val) val.componentPropertyReferences = { characters: VALUE };
  const ph = v.findOne((n) => n.type === 'TEXT' && n.name === 'Placeholder');
  if (ph) ph.componentPropertyReferences = { characters: PH };
  v.children.find((n) => n.name === 'Label (accessible name, not shown)').componentPropertyReferences = {
    characters: LABEL
  };
  v.children.find((n) => n.name === 'Leading').componentPropertyReferences = { visible: LEAD };
  v.children.find((n) => n.name === 'Leading').findOne((n) => n.name === 'Leading icon').componentPropertyReferences = {
    mainComponent: LICON
  };
  const tr = v.children.find((n) => n.name === 'Trailing');
  if (tr) {
    tr.componentPropertyReferences = { visible: TRAIL };
    tr.findOne((n) => n.name === 'Trailing icon').componentPropertyReferences = { mainComponent: TICON };
  }
  if (!v.name.includes('State=focus'))
    v.children.find((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
}
for (const [icon, color] of glyphs) for (const g of icon.findAll((n) => n.type === 'VECTOR')) g.fills = [paint(color)];
// Grid: columns State, rows Size × Action × Content (md · none · placeholder · default top-left).
const GAP = 32,
  COL = 272,
  ROW = 72;
set.children.forEach((v, k) => {
  const row = Math.floor(k / ST.length);
  v.x = GAP + (k % ST.length) * COL;
  v.y = GAP + row * ROW;
});
set.resizeWithoutConstraints(GAP * 2 + ST.length * COL - 32, GAP * 2 + 10 * ROW - 24);
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
