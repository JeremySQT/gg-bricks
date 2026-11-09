// Toast master builder (use_figma body), 2026-11-03. 2026-11-04 (user request): a single toast keeps one height, its Body
// being at least size/control/sm high (done in place on the ten single variants).
// On the Feedback library page (407:112), section Toast: the item set “Toast” (Layout single, multi × Appearance
// neutral, intense × Intent, 20 variants) and the region component “ToastRegion”.
// Toast: a horizontal auto layout bound to size/overlay/panel, padding space/content/md, gap space/content/sm,
// radius/overlay, effect style shadow/overlay, inside edge border/width/default; neutral: color/surface/overlay, edge
// color/elevation/border, title color/content/primary, description color/content/secondary; intense: color/status/
// {intent}/surface, border, content. Children: Icon box (the intrinsic Phosphor glyph, size/icon/md,
// color/status/{intent}/icon), Body (Text: Title label/md, Description body/sm in multi; in multi the Action under the
// text), the Action (an exposed Button sm neutral outline, minimum height cleared) on the row in single, and the
// Dismiss box (IconButton sm neutral ghost, close glyph). Single centers the row; multi aligns at the top with the icon
// and dismiss boxes as tall as the title line. Intense variants set the mode of Components · action family to their
// intent (action-family.plugin.js). Properties Title, Description, Show action, Closable.
// ToastRegion: a single component, a vertical auto layout holding the slot Toasts (gap space/content/sm, Toast
// preferred and only) and a hidden text behind the Label property. It was a set of six Placement variants until the
// user review of the Figma parity (2026-11-04): a slot cannot reverse its order, so the variant changed nothing; the
// placement is where the designer puts the region, and the designer orders the toasts (newest nearest that edge). The
// component was rebuilt in place by the same code (455:1602). Rerunning replaces the set and the region.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('407:112');
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
const fam = cols.find((c) => c.name === 'Components · action family');
const wf = cols.find((c) => c.name === 'Wireframe');
const canvas = vars.find((v) => v.name === 'wireframe/canvas' && v.variableCollectionId === wf.id);
const styles = await figma.getLocalTextStylesAsync();
const style = (n) => styles.find((s) => s.name === 'typography/' + n);
for (const s of ['label/md', 'body/sm']) await figma.loadFontAsync(style(s).fontName);
const shadow = (await figma.getLocalEffectStylesAsync()).find((s) => s.name === 'shadow/overlay');
const GLYPH = { neutral: '200:5169', info: '200:5169', success: '200:4685', warning: '200:5834', danger: '200:5831' };
const glyphs = {};
for (const [k, id] of Object.entries(GLYPH)) glyphs[k] = await figma.getNodeByIdAsync(id);
const X = await figma.getNodeByIdAsync('200:4368');
const IB = await figma.getNodeByIdAsync('211:1167');
const BTN = await figma.getNodeByIdAsync('48:1586');
const ibSm = IB.children.find(
  (c) =>
    /Intent=neutral/.test(c.name) &&
    /Appearance=ghost/.test(c.name) &&
    /Size=sm/.test(c.name) &&
    /State=default/.test(c.name)
);
const btnSm = BTN.children.find((c) => c.name === 'Intent=neutral, Appearance=outline, Size=sm, State=default');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
let section = page.children.find((n) => n.type === 'SECTION' && n.name === 'Toast');
if (!section) {
  const above = page.children.filter((n) => n.type === 'SECTION');
  section = figma.createSection();
  section.name = 'Toast';
  page.appendChild(section);
  section.y = Math.max(0, ...above.map((n) => n.y + n.height)) + 160;
  section.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', canvas)
  ];
}
for (const n of section.children.filter((n) => n.name === 'Toast' || n.name === 'ToastRegion')) n.remove();
const INT = ['neutral', 'info', 'success', 'warning', 'danger'];
const comps = [];
for (const ly of ['single', 'multi'])
  for (const ap of ['neutral', 'intense'])
    for (const i of INT) {
      const st = (x) => `color/status/${i}/${x}`;
      const intense = ap === 'intense';
      const c = figma.createComponent();
      c.name = `Layout=${ly}, Appearance=${ap}, Intent=${i}`;
      c.layoutMode = 'HORIZONTAL';
      c.resize(360, 60);
      c.primaryAxisSizingMode = 'FIXED';
      c.counterAxisSizingMode = 'AUTO';
      c.counterAxisAlignItems = ly === 'single' ? 'CENTER' : 'MIN';
      c.clipsContent = false;
      bind(c, ['width'], 'size/overlay/panel');
      bind(c, PADS, 'space/content/md');
      bind(c, ['itemSpacing'], 'space/content/sm');
      bind(c, RADII, 'radius/overlay');
      c.fills = [paint(intense ? st('surface') : 'color/surface/overlay', c)];
      c.strokes = [paint(intense ? st('border') : 'color/elevation/border', c)];
      c.strokeAlign = 'INSIDE';
      bind(c, STROKES, 'border/width/default');
      c.strokesIncludedInLayout = false;
      await c.setEffectStyleIdAsync(shadow.id);
      c.setExplicitVariableModeForCollection(fam, fam.modes.find((m) => m.name === (intense ? i : 'default')).modeId);
      const box = (name) => {
        const b = figma.createAutoLayout('HORIZONTAL', { name });
        b.fills = [];
        b.clipsContent = false;
        b.counterAxisAlignItems = 'CENTER';
        c.appendChild(b);
        if (ly === 'multi') {
          b.counterAxisSizingMode = 'FIXED';
          bind(b, ['height'], 'typography/label/md/lineHeight');
        }
        return b;
      };
      const ib = box('Icon box');
      const g = glyphs[i].createInstance();
      g.name = 'Icon';
      ib.appendChild(g);
      bind(g, ['width', 'height'], 'size/icon/md');
      for (const v of g.findAll((n) => n.type === 'VECTOR')) v.fills = [paint(st('icon'), v)];
      const col = figma.createAutoLayout('VERTICAL', { name: 'Body' });
      col.fills = [];
      col.clipsContent = false;
      c.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      bind(col, ['itemSpacing'], 'space/content/sm');
      if (ly === 'single') {
        // One height whatever the row holds: Body at least size/control/sm, the text centered (rowHeight, 2026-11-04).
        bind(col, ['minHeight'], 'size/control/sm');
        col.primaryAxisAlignItems = 'CENTER';
      }
      const txt = figma.createAutoLayout('VERTICAL', { name: 'Text' });
      txt.fills = [];
      txt.clipsContent = false;
      col.appendChild(txt);
      txt.layoutSizingHorizontal = 'FILL';
      bind(txt, ['itemSpacing'], 'space/content/xs');
      const addText = (name, s, chars, color) => {
        const t = figma.createText();
        t.name = name;
        t.textStyleId = style(s).id;
        t.characters = chars;
        txt.appendChild(t);
        t.fills = [paint(color, t)];
        t.layoutSizingHorizontal = 'FILL';
        t.textAutoResize = 'HEIGHT';
      };
      addText(
        'Title',
        'label/md',
        ly === 'single' ? 'Report deleted' : 'Upload failed',
        intense ? st('content') : 'color/content/primary'
      );
      if (ly === 'multi')
        addText(
          'Description',
          'body/sm',
          'quarterly-report.pdf is larger than 50 MB.',
          intense ? st('content') : 'color/content/secondary'
        );
      const act = btnSm.createInstance();
      act.name = 'Action';
      if (ly === 'single') c.insertChild(c.children.indexOf(col) + 1, act);
      else col.appendChild(act);
      setP(act, 'Label', ly === 'single' ? 'Undo' : 'Retry');
      act.setBoundVariable('minHeight', null);
      act.minHeight = null;
      const db = box('Dismiss box');
      const d = ibSm.createInstance();
      d.name = 'Dismiss';
      db.appendChild(d);
      setP(d, 'Icon', X.id);
      setP(d, 'Label', 'Dismiss');
      comps.push(c);
    }
const set = figma.combineAsVariants(comps, section);
set.name = 'Toast';
for (const v of set.children) v.findOne((n) => n.name === 'Action' && n.type === 'INSTANCE').isExposedInstance = true;
const pTitle = set.addComponentProperty('Title', 'TEXT', 'Report deleted');
const pDesc = set.addComponentProperty('Description', 'TEXT', 'quarterly-report.pdf is larger than 50 MB.');
const pAct = set.addComponentProperty('Show action', 'BOOLEAN', false);
const pClose = set.addComponentProperty('Closable', 'BOOLEAN', true);
for (const v of set.children) {
  v.findOne((n) => n.type === 'TEXT' && n.name === 'Title' && !n.id.startsWith('I')).componentPropertyReferences = {
    characters: pTitle
  };
  const de = v.findOne((n) => n.type === 'TEXT' && n.name === 'Description' && !n.id.startsWith('I'));
  if (de) de.componentPropertyReferences = { characters: pDesc };
  v.findOne((n) => n.name === 'Action' && n.type === 'INSTANCE').componentPropertyReferences = { visible: pAct };
  v.findChild((n) => n.name === 'Dismiss box').componentPropertyReferences = { visible: pClose };
}
set.description =
  'Toast (feedback/toast, item): a brief notification above the page. Layout single (no description: icon, title, action and dismiss on one row, centered) or multi (description under the title, the action under the description, icon and dismiss on the title line). Appearance neutral (color/surface/overlay, edge color/elevation/border) or intense (tinted like an Alert of the intent; its accent and neutral buttons take the action family of the intent). Show action: one sm Button for a secondary follow-up (ghost or outline, neutral, or danger), never a call to action; change it on the exposed Action instance. Closable shows the dismiss IconButton; a toast that never leaves by itself keeps it. Width size/overlay/panel, shadow/overlay. Countdown, pause, enter and leave motion are behaviors of the code.';
let k = 0;
for (const ly of ['single', 'multi'])
  for (const ap of ['neutral', 'intense']) {
    INT.forEach((i, j) => {
      const v = set.children.find((x) => x.name === `Layout=${ly}, Appearance=${ap}, Intent=${i}`);
      v.x = 32 + j * 400;
      v.y = 32 + k * 160;
    });
    k++;
  }
set.resizeWithoutConstraints(32 + 5 * 400, 32 + 4 * 160);
set.x = 80;
set.y = 80;
// Region.
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const lst = style('label/md');
const T = (name) => set.children.find((c) => c.name === name);
const region = figma.createComponent();
section.appendChild(region);
region.name = 'ToastRegion';
region.layoutMode = 'VERTICAL';
region.primaryAxisSizingMode = 'AUTO';
region.counterAxisSizingMode = 'AUTO';
region.itemSpacing = 0;
region.fills = [];
region.clipsContent = false;
const slot = region.createSlot();
slot.name = 'Toasts';
slot.fills = [];
slot.clipsContent = false;
slot.layoutMode = 'VERTICAL';
slot.primaryAxisSizingMode = 'AUTO';
slot.counterAxisSizingMode = 'AUTO';
slot.setBoundVariable('itemSpacing', V('space/content/sm'));
slot.counterAxisAlignItems = 'MIN';
const older = T('Layout=single, Appearance=neutral, Intent=success').createInstance();
setP(older, 'Title', 'Changes saved');
const newer = T('Layout=single, Appearance=neutral, Intent=neutral').createInstance();
setP(newer, 'Title', 'Report deleted');
setP(newer, 'Show action', true);
slot.appendChild(older);
slot.appendChild(newer);
const t = figma.createText();
region.appendChild(t);
t.name = 'Region name (not shown)';
t.textStyleId = lst.id;
t.characters = 'Notifications';
t.visible = false;
const sk = Object.keys(region.componentPropertyDefinitions).find(
  (q) => region.componentPropertyDefinitions[q].type === 'SLOT'
);
region.editComponentProperty(sk, {
  name: 'Toasts',
  description:
    'The toasts shown, separated by space/content/sm, in the order you give them: put the newest nearest the edge where the region is placed (last for a region at the bottom of the screen, first for one at the top). At most max (3 by default) are shown; others wait.',
  preferredValues: [{ type: 'COMPONENT_SET', key: set.key }],
  slotSettings: { minChildren: 1, allowPreferredValuesOnly: true }
});
const lk = region.addComponentProperty('Label', 'TEXT', 'Notifications');
t.componentPropertyReferences = { characters: lk };
region.description =
  'ToastRegion (feedback/toast, region): the single landmark that holds the toasts, named by Label, above the page and above open dialogs, outside the flow. Placement is where you put it: at space/layout/sm from the viewport edges you choose (bottom-end by default in the code). Figma cannot reverse the order of a slot, so order the toasts yourself, the newest nearest that edge. In the code it sits in the top layer (layer/toast); its position, the order of arrival, the queue (max) and the pause on hover and focus are behaviors of the code.';
region.x = set.x;
region.y = set.y + set.height + 80;
section.resizeWithoutConstraints(Math.max(set.width, region.width) + 160, region.y + region.height + 80);
return { section: section.id, set: set.id, region: region.id };
