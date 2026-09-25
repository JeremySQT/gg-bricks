figma.skipInvisibleInstanceChildren = false;
const ids = [];
await Promise.all(
  ['Regular', 'Medium', 'Semi Bold', 'Bold'].map((style) => figma.loadFontAsync({ family: 'Inter', style }))
);
const vars = await figma.variables.getLocalVariablesAsync();
const vm = Object.fromEntries(vars.filter((v) => !v.name.startsWith('_resolved/')).map((v) => [v.name, v]));
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const cv = Object.fromEntries(collections.map((c) => [c.name, c]));
function paint(p) {
  if (!vm[p]) throw Error('Unknown token ' + p);
  let v = vm[p],
    value;
  for (let i = 0; i < 8; i++) {
    const co = collections.find((c) => c.id === v.variableCollectionId);
    value = v.valuesByMode[co.defaultModeId];
    if (value?.type !== 'VARIABLE_ALIAS') break;
    v = vars.find((x) => x.id === value.id);
  }
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: value.r, g: value.g, b: value.b }, opacity: value.a ?? 1 },
    'color',
    vm[p]
  );
}
function track(n) {
  ids.push(n.id);
  return n;
}
function frame(name, parent, dir = 'VERTICAL') {
  const f = track(figma.createAutoLayout(dir));
  f.name = name;
  f.fills = [];
  f.clipsContent = false;
  f.itemSpacing = 16;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  if (parent) parent.appendChild(f);
  return f;
}
function txt(parent, s, size = 14, bold = false) {
  const t = track(figma.createText());
  t.name = s.slice(0, 55);
  t.fontName = { family: 'Inter', style: bold ? 'Semi Bold' : 'Regular' };
  t.fontSize = size;
  t.lineHeight = { unit: 'PIXELS', value: Math.round(size * 1.5) };
  t.characters = s;
  t.fills = [paint('color/content/primary')];
  parent.appendChild(t);
  t.textAutoResize = 'HEIGHT';
  if (parent.type !== 'PAGE') {
    t.layoutSizingHorizontal = 'FILL';
  }
  return t;
}
function board(name, parent) {
  const f = frame(name, parent);
  f.resize(1440, 100);
  f.layoutSizingHorizontal = 'FIXED';
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = 64;
  f.itemSpacing = 32;
  f.fills = [paint('color/surface/canvas')];
  f.x = 80;
  f.y = 80;
  return f;
}
function mode(n, name, value) {
  const c = cv[name];
  n.setExplicitVariableModeForCollection(c, c.modes.find((m) => m.name === value).modeId);
}
function allIds(n) {
  return [n.id, ...('findAll' in n ? n.findAll().map((x) => x.id) : [])];
}
