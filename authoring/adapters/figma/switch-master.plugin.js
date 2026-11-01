// Switch master builder (use_figma body), 2026-10-27.
// On the page forms/switch (288:8): the component set “Switch” (Label position × Size × Selection × State,
// 48 variants). The track is component/switch/track-size/{size} tall and switch/track-width wide (2 × trackSize − 4 × borderWidth,
// Components adapter), fully rounded (radius/full), filled and outlined with color/choice/{off|on}/{state}/…; the
// thumb is an ellipse of switch/thumb inset by switch/inset (padding) in color/choice/{off|on}/{state}/content, at the
// start when off and the end when on. The track sits in a first-line frame (typography/body/{size}/lineHeight).
// Label position start puts the text first and spreads the row (space between), as the code fills the row.
// Rerunning replaces the set.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('288:8');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'Switch')) n.remove();
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
const PADS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const P = ['end', 'start'];
const S = ['md', 'sm', 'lg'];
const SEL = ['off', 'on'];
const ST = ['default', 'hover', 'readonly', 'disabled'];
const comps = [];
for (const p of P)
  for (const sel of SEL)
    for (const st of ST)
      for (const s of S) {
        const role = (r) => `color/choice/${sel}/${st}/${r}`;
        const c = figma.createComponent();
        c.name = `Label position=${p}, Size=${s}, Selection=${sel}, State=${st}`;
        c.layoutMode = 'HORIZONTAL';
        c.primaryAxisSizingMode = p === 'start' ? 'FIXED' : 'AUTO';
        c.counterAxisSizingMode = 'AUTO';
        c.counterAxisAlignItems = 'MIN';
        if (p === 'start') c.primaryAxisAlignItems = 'SPACE_BETWEEN';
        c.fills = [];
        c.clipsContent = false;
        c.setExplicitVariableModeForCollection(AC, AC.modes.find((m) => m.name === s).modeId);
        bind(c, ['itemSpacing'], `space/control/gap/${s}`);
        const line = figma.createAutoLayout('HORIZONTAL', { name: 'First line' });
        line.fills = [];
        line.clipsContent = false;
        line.counterAxisAlignItems = 'CENTER';
        const track = figma.createAutoLayout('HORIZONTAL', { name: 'Track' });
        track.counterAxisAlignItems = 'CENTER';
        track.primaryAxisAlignItems = sel === 'on' ? 'MAX' : 'MIN';
        track.clipsContent = false;
        line.appendChild(track);
        track.primaryAxisSizingMode = 'FIXED';
        track.counterAxisSizingMode = 'FIXED';
        bind(track, ['width'], 'switch/track-width');
        bind(track, ['height'], `component/switch/track-size/${s}`);
        bind(track, PADS, 'switch/inset');
        bind(track, RADII, 'radius/full');
        track.fills = [paint(role('surface'))];
        track.strokes = [paint(role('border'))];
        track.strokeAlign = 'INSIDE';
        track.strokesIncludedInLayout = false;
        bind(track, STROKES, 'border/width/default');
        const thumb = figma.createEllipse();
        thumb.name = 'Thumb';
        track.appendChild(thumb);
        bind(thumb, ['width', 'height'], 'switch/thumb');
        thumb.fills = [paint(role('content'))];
        const ring = figma.createFrame();
        ring.name = 'Focus ring';
        ring.fills = [];
        track.appendChild(ring);
        ring.layoutPositioning = 'ABSOLUTE';
        ring.x = -2;
        ring.y = -2;
        ring.resize(track.width + 4, track.height + 4);
        ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
        ring.strokes = [paint('color/focus/ring')];
        ring.strokeAlign = 'OUTSIDE';
        bind(ring, STROKES, 'focus/width');
        bind(ring, RADII, 'radius/full');
        ring.visible = false;
        const text = figma.createAutoLayout('VERTICAL', { name: 'Text', itemSpacing: 0 });
        text.fills = [];
        const label = figma.createText();
        label.name = 'Label';
        await label.setTextStyleIdAsync(style(`body/${s}`).id);
        label.characters = 'Setting';
        label.fills = [paint(st === 'disabled' ? 'color/content/disabled' : 'color/content/primary')];
        text.appendChild(label);
        const desc = figma.createText();
        desc.name = 'Description';
        await desc.setTextStyleIdAsync(style('body/sm').id);
        desc.characters = 'Description';
        desc.fills = [paint(st === 'disabled' ? 'color/content/disabled' : 'color/content/secondary')];
        text.appendChild(desc);
        desc.visible = false;
        if (p === 'start') {
          c.appendChild(text);
          c.appendChild(line);
        } else {
          c.appendChild(line);
          c.appendChild(text);
        }
        line.counterAxisSizingMode = 'FIXED';
        bind(line, ['height'], `typography/body/${s}/lineHeight`);
        if (p === 'start') c.resize(240, c.height);
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
set.name = 'Switch';
set.description =
  'Turns a setting on or off with immediate effect; no invalid or required state (that is a Checkbox). Source of truth: foundations/components/forms/switch/contract.json; implementation: packages/svelte/src/components/switch. Label position end puts the track first; start puts the label first and spreads the row to its width (settings lists: resize the instance to the row). Size, Selection and State mirror the code; Focus shows the keyboard focus ring. Label names the setting, never its state; Show description adds the help text; Show label off hides the text (it stays the name in code).';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Setting');
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
// Grid: two blocks (end, start), rows Selection × State, columns Size.
const GAP = 32,
  ROW = 44;
set.children.forEach((v, k) => {
  const block = Math.floor(k / 24);
  const r = Math.floor((k % 24) / 3);
  const col = k % 3;
  v.x = block ? GAP + 3 * 140 + GAP + col * 280 : GAP + col * 140;
  v.y = GAP + r * ROW + Math.floor(r / ST.length) * 16;
});
const right = Math.max(...set.children.map((v) => v.x + v.width));
set.resizeWithoutConstraints(right + GAP, GAP * 2 + 8 * ROW + 16);
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
