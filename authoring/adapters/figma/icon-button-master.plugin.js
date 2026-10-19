// IconButton master builder (use_figma body), 2026-10-19.
// Creates (or reuses) the page actions/icon-button after actions/button and builds the component set
// “IconButton” (Intent × Appearance × Size × State, 135 variants) reproducing the approved Svelte
// implementation. Every visual property is bound to a variable; the treatments are the Button's
// (color/action/{intent}/{appearance}/{state}/…, radius/control, the focus ring on radius/focus) and the
// icon color goes through the Button adapter variable button/foreground (Components · button style and
// Components · button state modes set on each variant), so a swapped glyph keeps the right color.
// The root is the visible square (size/control/{size}); the 44 px target is an absolute, empty layer
// centered on it (the code's ::before takes no layout space). Re-running removes the previous set.
figma.skipInvisibleInstanceChildren = false;
const pages = figma.root.children;
let page = pages.find((p) => p.name === 'actions/icon-button');
if (!page) {
  page = figma.createPage();
  page.name = 'actions/icon-button';
  const after = pages.findIndex((p) => p.name === 'actions/button');
  figma.root.insertChild(after + 1, page);
}
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name === 'IconButton')) n.remove();

const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const V = (name) => {
  const v = vars.find((x) => x.name === name);
  if (!v) throw new Error('Missing variable ' + name);
  return v;
};
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const bind = (node, fields, name) => {
  for (const f of fields) node.setBoundVariable(f, V(name));
};
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const STROKES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];
const modeOf = (c, n) => c.modes.find((m) => m.name === n).modeId;
const SIZE_C = col('Components');
const STYLE_C = col('Components · button style');
const STATE_C = col('Components · button state');

const iconVariant = {
  sm: await figma.getNodeByIdAsync('149:8'),
  md: await figma.getNodeByIdAsync('149:11'),
  lg: await figma.getNodeByIdAsync('149:14')
};
const spinner = await figma.getNodeByIdAsync('42:28'); // _Button/Loading indicator
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const labelStyle = (await figma.getLocalTextStylesAsync()).find((s) => s.name === 'typography/label/md');

const I = ['neutral', 'accent', 'danger'];
const A = ['ghost', 'outline', 'solid'];
const S = ['md', 'sm', 'lg'];
const T = ['default', 'hover', 'pressed', 'loading', 'disabled'];
const comps = [];
for (const i of I)
  for (const a of A)
    for (const s of S)
      for (const t of T) {
        const role = (r) => `color/action/${i}/${a}/${t}/${r}`;
        const root = figma.createComponent();
        root.name = `Intent=${i}, Appearance=${a}, Size=${s}, State=${t}`;
        root.layoutMode = 'HORIZONTAL';
        root.primaryAxisAlignItems = 'CENTER';
        root.counterAxisAlignItems = 'CENTER';
        root.primaryAxisSizingMode = 'FIXED';
        root.counterAxisSizingMode = 'FIXED';
        root.fills = [];
        root.clipsContent = false;
        root.resize(40, 40);
        bind(root, ['width', 'height'], `size/control/${s}`);
        root.setExplicitVariableModeForCollection(SIZE_C, modeOf(SIZE_C, s));
        root.setExplicitVariableModeForCollection(STYLE_C, modeOf(STYLE_C, `${i}-${a}`));
        root.setExplicitVariableModeForCollection(STATE_C, modeOf(STATE_C, t));

        // Interaction target: centered, empty, outside the layout.
        const target = figma.createFrame();
        target.name = 'Target';
        target.fills = [];
        root.appendChild(target);
        target.layoutPositioning = 'ABSOLUTE';
        target.resize(44, 44);
        bind(target, ['width', 'height'], 'size/target/min');
        target.constraints = { horizontal: 'CENTER', vertical: 'CENTER' };

        const box = figma.createAutoLayout('HORIZONTAL', { name: 'Container' });
        box.primaryAxisAlignItems = 'CENTER';
        box.counterAxisAlignItems = 'CENTER';
        box.clipsContent = false;
        root.appendChild(box);
        box.layoutSizingHorizontal = 'FILL';
        box.layoutSizingVertical = 'FILL';
        box.fills = [paint(role('surface'))];
        bind(box, RADII, 'radius/control');
        if (a === 'outline') {
          box.strokes = [paint(`color/action/${i}/outline/${t}/border`)];
          box.strokeAlign = 'INSIDE';
          bind(box, STROKES, 'border/width/default');
        }

        const icon = iconVariant[s].createInstance();
        icon.name = 'Icon';
        box.appendChild(icon);
        for (const v of icon.findAll((n) => n.type === 'VECTOR')) v.fills = [paint('button/foreground')];
        // Every variant holds the indicator (hidden except in loading), so that an instance can show the
        // loading + disabled combination, which resolves to disabled with the indicator visible.
        const sp = spinner.createInstance();
        sp.name = 'Loading indicator';
        box.appendChild(sp);
        bind(sp, ['width', 'height'], `size/icon/${s}`);
        for (const v of sp.findAll((n) => n.type === 'VECTOR')) v.strokes = [paint(role('content'))];
        icon.visible = t !== 'loading';
        sp.visible = t === 'loading';

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
        bind(ring, RADII, 'radius/focus');
        ring.visible = false;

        // The accessible name: a hidden text layer behind the Label property (never shown, read in Dev Mode).
        const label = figma.createText();
        label.name = 'Label (accessible name, not shown)';
        label.textStyleId = labelStyle.id;
        label.characters = 'Add';
        root.appendChild(label);
        label.visible = false;

        comps.push(root);
      }
const set = figma.combineAsVariants(comps, page);
set.name = 'IconButton';
set.description =
  'A square button that shows only an icon; its label is the accessible name and is never shown (the integration adds a tooltip). Source of truth: foundations/components/actions/icon-button/contract.json; implementation: packages/svelte/src/components/icon-button. Intent, Appearance and Size mirror the code props (default neutral · ghost · md); State shows interaction states (loading and disabled are props in code); Focus is a separate switch. Treatments are the Button’s, so an icon button sits beside a Button of the same size at the same height. The icon is centered by its box at the size’s icon size; choose the glyph in Icon › Glyph. The visible square sits in a 44 × 44 target that takes no layout space.';
const LABEL = set.addComponentProperty('Label', 'TEXT', 'Add');
const FOCUS = set.addComponentProperty('Focus', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: LABEL };
  v.findOne((n) => n.name === 'Focus ring').componentPropertyReferences = { visible: FOCUS };
  const icon = v.findOne((n) => n.type === 'INSTANCE' && n.name === 'Icon');
  icon.isExposedInstance = true;
}
// Grid: rows Intent × Appearance, columns Size × State (md first, so the top-left default is neutral · ghost · md).
const GAP = 24,
  CELL = 72;
set.children.forEach((v, k) => {
  const row = Math.floor(k / (S.length * T.length));
  const colIx = k % (S.length * T.length);
  v.x = GAP + colIx * CELL + Math.floor(colIx / T.length) * GAP;
  v.y = GAP + row * CELL;
});
set.resizeWithoutConstraints(
  GAP * 2 + S.length * T.length * CELL + (S.length - 1) * GAP,
  GAP * 2 + I.length * A.length * CELL - GAP
);
set.fills = [];
set.x = 0;
set.y = 0;
return {
  page: page.id,
  set: set.id,
  variants: set.children.length,
  props: Object.keys(set.componentPropertyDefinitions),
  first: set.children[0].name,
  sample: Object.fromEntries(set.children.slice(0, 6).map((c) => [c.name, c.id]))
};
