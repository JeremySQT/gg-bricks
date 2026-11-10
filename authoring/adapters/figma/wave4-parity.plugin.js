// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Parity measurement bodies (read-only apart from temporary frames). Each returns PARITY:<name> or PARITY2:<name>
// followed by JSON (PARITY2 groups the rows by context and abbreviates props, "@<id>:" naming the component when a body
// measures several); keep the result under the 48 KB return limit. A bound paint mirrors the variable alpha in its
// opacity: read the resolved alpha alone (the first body multiplied them; its colors were opaque or transparent, so its
// results stand). Save the results as JSON and run wave4-parity-report.mjs <id> <file>.
// ---- Part 1: Parity measurement (read-only apart from temp frames): Select and Combobox in 4 contexts ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:1640');
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  let c = p.color,
    a = p.opacity ?? 1;
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    c = r;
    a *= r.a ?? 1;
  }
  return rgb(c, a);
};
const glyphColor = async (inst) => paintOf(inst.findOne((n) => n.type === 'VECTOR'));
const edge = async (n) =>
  (n.strokes || []).length && n.strokeTopWeight > 0
    ? `${await paintOf(n, 'strokes')} 0px 0px 0px ${n.strokeTopWeight}px inset`
    : 'none';
const out = [];
const add = (ctx, props, state, prop, val) => out.push([ctx, JSON.stringify(props), state, prop, String(val)]);
const P = (i, o) => {
  const props = {};
  for (const [k, v] of Object.entries(o)) {
    const key = Object.keys(i.componentProperties).find((x) => x.split('#')[0] === k);
    props[key] = v;
  }
  if (Object.keys(props).length) i.setProperties(props);
  return i;
};
const SEL = await figma.getNodeByIdAsync('497:2541');
const CB = await figma.getNodeByIdAsync('499:2549');
const OPT = await figma.getNodeByIdAsync('496:1323');
const EMP = await figma.getNodeByIdAsync('496:1338');
const variant = (set, name) => set.children.find((v) => v.name === name);
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = (set, name, o = {}) => {
    const i = variant(set, name).createInstance();
    f.appendChild(i);
    return P(i, o);
  };
  // Select field per size.
  for (const s of ['sm', 'md', 'lg']) {
    for (const [set, id, valName] of [
      [SEL, 'select', 'Value text'],
      [CB, 'combobox', 'Text']
    ]) {
      const i = mk(set, `Size=${s}, Content=${id === 'select' ? 'value' : 'text'}, State=default`);
      const t = i.children[0];
      const tx = t.findOne((n) => n.type === 'TEXT' && n.name === valName);
      const props = { size: s };
      add(ctx + '|' + id, props, 'default', 'surface', await paintOf(t));
      add(ctx + '|' + id, props, 'default', 'content', await paintOf(tx));
      add(ctx + '|' + id, props, 'default', 'border', await edge(t));
      add(ctx + '|' + id, props, 'default', 'height', t.height);
      add(ctx + '|' + id, props, 'default', 'paddingInline', t.paddingLeft + 'px');
      add(ctx + '|' + id, props, 'default', 'fontSize', tx.fontSize + 'px');
      add(ctx + '|' + id, props, 'default', 'radius', t.topLeftRadius + 'px');
      if (id === 'select')
        add(
          ctx + '|' + id,
          props,
          'default',
          'indicator',
          t.findChild((n) => n.name === 'Indicator').findOne((n) => n.type === 'INSTANCE').width + 'px'
        );
    }
  }
  for (const st of ['disabled', 'readonly']) {
    const i = mk(SEL, `Size=md, Content=value, State=${st}`);
    const t = i.children[0];
    add(ctx + '|select', {}, st, 'surface', await paintOf(t));
    add(ctx + '|select', {}, st, 'content', await paintOf(t.findOne((n) => n.name === 'Value text')));
  }
  const op = mk(SEL, 'Size=md, Content=value, State=default', { Open: true });
  const pn = op.findChild((n) => n.name === 'Panel');
  add(ctx + '|select', {}, 'panel', 'surface', await paintOf(pn));
  add(ctx + '|select', {}, 'panel', 'radius', pn.topLeftRadius + 'px');
  add(ctx + '|select', {}, 'panel', 'padding', pn.paddingTop + 'px');
  for (const [key, st] of [
    ['fr', 'selected-hover'],
    ['fr', 'selected'],
    ['de', 'hover'],
    ['en', 'default'],
    ['it', 'disabled']
  ]) {
    const o = mk(OPT, `Size=md, State=${st}`);
    add(ctx + '|select', { option: key }, st, 'surface', await paintOf(o));
    add(ctx + '|select', { option: key }, st, 'content', await paintOf(o.findChild((n) => n.name === 'Label')));
    add(ctx + '|select', { option: key }, st, 'height', o.height);
    add(ctx + '|select', { option: key }, st, 'check', await glyphColor(o.findOne((n) => n.name === 'Check glyph')));
  }
  const fc = mk(CB, 'Size=md, Content=text, State=default', { Focus: true });
  const ft = fc.children[0];
  add(ctx + '|combobox', {}, 'focus', 'border', await edge(ft.findChild((n) => n.name === 'Focus border')));
  add(
    ctx + '|combobox',
    {},
    'focus',
    'outline',
    await paintOf(
      ft.findChild((n) => n.name === 'Focus ring'),
      'strokes'
    )
  );
  const so = mk(OPT, 'Size=md, State=selected-hover');
  add(ctx + '|combobox', { option: 'france' }, 'selected-hover', 'surface', await paintOf(so));
  add(
    ctx + '|combobox',
    { option: 'france' },
    'selected-hover',
    'check',
    await glyphColor(so.findOne((n) => n.name === 'Check glyph'))
  );
  const e = EMP.createInstance();
  f.appendChild(e);
  add(ctx + '|combobox', {}, 'empty', 'color', await paintOf(e.findChild((n) => n.type === 'TEXT')));
  add(ctx + '|combobox', {}, 'empty', 'paddingInline', e.paddingLeft + 'px');
  f.remove();
}
return 'PARITY:select-combobox ' + JSON.stringify(out);

// ---- Part 2: Parity re-measurement of Tabs with corrected alpha handling (temp frames only) ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
// A bound paint mirrors the variable alpha in its opacity: the resolved alpha alone is the color's alpha.
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    return rgb(r, r.a ?? 1);
  }
  return rgb(p.color, p.opacity ?? 1);
};
const edge = async (n) =>
  (n.strokes || []).length && n.strokeTopWeight > 0
    ? `${await paintOf(n, 'strokes')} 0px 0px 0px ${n.strokeTopWeight}px inset`
    : 'none';
const W = { Regular: '400', Medium: '500', 'Semi Bold': '600', Bold: '700' };
const out = {};
let cur;
const add = (props, state, prop, val) => cur.push([props, state, prop, String(val)]);
const TR = await figma.getNodeByIdAsync('501:249');
const TABS = await figma.getNodeByIdAsync('502:530');
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  cur = out[ctx] = [];
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = (set, name) => {
    const i = set.children.find((v) => v.name === name).createInstance();
    f.appendChild(i);
    return i;
  };
  for (const s of ['sm', 'md', 'lg'])
    for (const st of ['selected', 'default', 'hover']) {
      const i = mk(TR, `Appearance=line, Size=${s}, State=${st}`);
      const t = i.findChild((n) => n.name === 'Label');
      const ind = i.findChild((n) => n.name === 'Indicator');
      const P = 'size=' + s;
      add(P, st, 'surface', await paintOf(i));
      add(P, st, 'content', await paintOf(t));
      add(P, st, 'height', i.height);
      add(P, st, 'paddingInline', i.paddingLeft + 'px');
      add(P, st, 'fontSize', t.fontSize + 'px');
      add(P, st, 'fontWeight', W[t.fontName.style]);
      add(P, st, 'radius', i.topLeftRadius + 'px');
      add(P, st, 'indicator', await paintOf(ind));
      add(P, st, 'indicatorThickness', ind.height + 'px');
      add(P, st, 'indicatorOpacity', ind.visible ? '1' : '0');
      const c = mk(TR, `Appearance=contained, Size=${s}, State=${st}`);
      const Q = 'appearance=contained,size=' + s;
      add(Q, st, 'surface', await paintOf(c));
      add(Q, st, 'content', await paintOf(c.findChild((n) => n.name === 'Label')));
      add(Q, st, 'height', c.height);
      add(Q, st, 'paddingInline', c.paddingLeft + 'px');
      add(Q, st, 'radius', c.topLeftRadius + 'px');
      add(Q, st, 'edge', await edge(c));
    }
  const dis = mk(TR, 'Appearance=line, Size=md, State=disabled');
  add('size=md', 'disabled', 'content', await paintOf(dis.findChild((n) => n.name === 'Label')));
  add('size=md', 'disabled', 'surface', await paintOf(dis));
  const ln = mk(TABS, 'Appearance=line, Orientation=horizontal, Size=md');
  const bar = ln.findChild((n) => n.name === 'Bar');
  const line = bar.findChild((n) => n.name === 'Line');
  const sl = bar.findChild((n) => n.type === 'SLOT');
  add('size=md', 'list', 'line', `${await paintOf(line)} 0px -${line.height}px 0px 0px inset`);
  add('size=md', 'list', 'gap', sl.itemSpacing + 'px');
  add('size=md', 'list', 'panelGap', ln.itemSpacing + 'px');
  const cn = mk(TABS, 'Appearance=contained, Orientation=horizontal, Size=md');
  const cb = cn.findChild((n) => n.name === 'Bar');
  const cs = cb.findChild((n) => n.type === 'SLOT');
  const Q = 'appearance=contained,size=md';
  add(Q, 'list', 'surface', await paintOf(cb));
  add(Q, 'list', 'radius', cb.topLeftRadius + 'px');
  add(Q, 'list', 'padding', cb.paddingTop + 'px');
  add(Q, 'list', 'gap', cs.itemSpacing + 'px');
  f.remove();
}
return 'PARITY2:tabs ' + JSON.stringify(out);

// ---- Part 3: Parity measurement (temp frames only): Breadcrumb, Pagination, Accordion in 4 contexts ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    return rgb(r, r.a ?? 1);
  }
  return rgb(p.color, p.opacity ?? 1);
};
const edge = async (n) =>
  (n.strokes || []).length && n.strokeTopWeight > 0
    ? `${await paintOf(n, 'strokes')} 0px 0px 0px ${n.strokeTopWeight}px inset`
    : 'none';
const vec = (n) => n.findOne((x) => x.type === 'VECTOR');
const out = {};
let cur;
const add = (id, props, state, prop, val) => cur.push(['@' + id + ':' + props, state, prop, String(val)]);
const BI = await figma.getNodeByIdAsync('503:247');
const PI = await figma.getNodeByIdAsync('504:307');
const PE = await figma.getNodeByIdAsync('504:314');
const AI = await figma.getNodeByIdAsync('505:428');
const AC = await figma.getNodeByIdAsync('505:429');
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  cur = out[ctx] = [];
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = (set, name) => {
    const i = (name ? set.children.find((v) => v.name === name) : set).createInstance();
    f.appendChild(i);
    return i;
  };
  for (const s of ['sm', 'md']) {
    const P = 'size=' + s;
    const l = mk(BI, `Size=${s}, State=link`);
    const lt = l.findOne((n) => n.name === 'Label');
    const sp = l.findChild((n) => n.name === 'Separator');
    add('breadcrumb', P, 'default', 'color', await paintOf(lt));
    add('breadcrumb', P, 'default', 'fontSize', lt.fontSize + 'px');
    add('breadcrumb', P, 'default', 'separator', await paintOf(vec(sp)));
    add('breadcrumb', P, 'default', 'separatorSize', sp.width + 'px');
    const h = mk(BI, `Size=${s}, State=hover`);
    const ht = h.findOne((n) => n.name === 'Label');
    add('breadcrumb', P, 'hover', 'color', await paintOf(ht));
    add('breadcrumb', P, 'hover', 'underline', ht.textDecoration === 'UNDERLINE' ? 'underline' : 'none');
    const c = mk(BI, `Size=${s}, State=current`);
    const ct = c.findOne((n) => n.name === 'Label');
    add('breadcrumb', P, 'current', 'color', await paintOf(ct));
    add('breadcrumb', P, 'current', 'fontSize', ct.fontSize + 'px');
  }
  for (const s of ['sm', 'md', 'lg']) {
    const P = 'size=' + s;
    for (const st of ['default', 'selected', 'hover', 'selected-hover']) {
      const i = mk(PI, `Size=${s}, State=${st}`);
      const t = i.findChild((n) => n.name === 'Number');
      add('pagination', P, st, 'surface', await paintOf(i));
      add('pagination', P, st, 'content', await paintOf(t));
      add('pagination', P, st, 'edge', await edge(i));
      add('pagination', P, st, 'fontSize', t.fontSize + 'px');
      add('pagination', P, st, 'height', i.height);
      add('pagination', P, st, 'radius', i.topLeftRadius + 'px');
      add('pagination', P, st, 'width', i.width);
    }
    const e = mk(PE, `Size=${s}`);
    add('pagination', P, 'ellipsis', 'content', await paintOf(e.findChild((n) => n.type === 'TEXT')));
    add('pagination', P, 'ellipsis', 'width', e.width);
  }
  for (const st of ['default', 'hover', 'disabled']) {
    const i = mk(AI, `State=${st}, Expanded=false`);
    const t = i.findChild((n) => n.name === 'Trigger');
    const lb = t.findChild((n) => n.name === 'Label');
    const ind = t.findChild((n) => n.name === 'Indicator');
    add('accordion', '', st, 'surface', await paintOf(t));
    add('accordion', '', st, 'content', await paintOf(lb));
    add('accordion', '', st, 'height', t.height);
    add('accordion', '', st, 'paddingInline', t.paddingLeft + 'px');
    add('accordion', '', st, 'fontSize', lb.fontSize + 'px');
    add('accordion', '', st, 'radius', t.topLeftRadius + 'px');
    add('accordion', '', st, 'indicator', await paintOf(vec(ind)));
    add('accordion', '', st, 'indicatorSize', ind.width + 'px');
  }
  const ex = mk(AI, 'State=default, Expanded=true');
  const body = ex.findOne((n) => n.name === 'Body');
  const bt = ex.findOne((n) => n.name === 'Body text');
  add('accordion', '', 'content', 'color', await paintOf(bt));
  add('accordion', '', 'content', 'fontSize', bt.fontSize + 'px');
  add('accordion', '', 'content', 'paddingBottom', body.paddingBottom + 'px');
  const acc = mk(AC);
  add('accordion', '', 'line', 'color', await paintOf(acc, 'strokes'));
  add('accordion', '', 'line', 'width', acc.strokeTopWeight + 'px');
  f.remove();
}
return 'PARITY2:nav ' + JSON.stringify(out);

// ---- Part 4: Rebuild Breadcrumb set slot items from the repaired Item set; re-measure Breadcrumb parity ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('495:16');
await figma.setCurrentPageAsync(page);
const itemSet = await figma.getNodeByIdAsync('503:247');
const crumb = await figma.getNodeByIdAsync('503:405');
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
for (const v of crumb.children) {
  const q = Object.fromEntries(v.name.split(', ').map((x) => x.split('=')));
  const sl = v.findOne((n) => n.type === 'SLOT');
  for (const c of [...sl.children]) c.remove();
  for (const [lab, st, home] of [
    ['Home', 'link', true],
    ['Projects', 'link', false],
    ['ggbrick', 'current', false]
  ]) {
    const i = itemSet.children.find((x) => x.name === `Size=${q.Size}, State=${st}`).createInstance();
    sl.appendChild(i);
    setP(i, 'Label', lab);
    if (home) setP(i, 'Show leading', true);
    const sp = i.findOne((n) => n.type === 'INSTANCE' && n.name === 'Separator');
    if (sp && q.Separator === 'slash') sp.setProperties({ Shape: 'slash' });
  }
}
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    return rgb(r, r.a ?? 1);
  }
  return rgb(p.color, p.opacity ?? 1);
};
const vec = (n) => n.findOne((x) => x.type === 'VECTOR');
const out = {};
let cur;
const add = (props, state, prop, val) => cur.push([props, state, prop, String(val)]);
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  cur = out[ctx] = [];
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = (name) => {
    const i = itemSet.children.find((v) => v.name === name).createInstance();
    f.appendChild(i);
    return i;
  };
  for (const s of ['sm', 'md']) {
    const P = 'size=' + s;
    const l = mk(`Size=${s}, State=link`);
    const lt = l.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    const sp = l.findChild((n) => n.name === 'Separator');
    add(P, 'default', 'color', await paintOf(lt));
    add(P, 'default', 'fontSize', lt.fontSize + 'px');
    add(P, 'default', 'separator', await paintOf(vec(sp)));
    add(P, 'default', 'separatorSize', sp.width + 'px');
    const h = mk(`Size=${s}, State=hover`);
    const ht = h.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    const u = h.findOne((n) => n.name === 'Underline');
    add(P, 'hover', 'color', await paintOf(ht));
    add(P, 'hover', 'underline', (u && u.visible) || ht.textDecoration === 'UNDERLINE' ? 'underline' : 'none');
    const c = mk(`Size=${s}, State=current`);
    const ct = c.findOne((n) => n.type === 'TEXT' && n.name === 'Label');
    add(P, 'current', 'color', await paintOf(ct));
    add(P, 'current', 'fontSize', ct.fontSize + 'px');
  }
  f.remove();
}
return 'PARITY2:breadcrumb ' + JSON.stringify(out);

// ---- Part 5: Parity measurement (temp frames only): Toolbar in 4 contexts ----
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('343:2');
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const CTX = [
  ['base', 'light', 'standard'],
  ['base', 'dark', 'standard'],
  ['brick', 'light', 'compact'],
  ['orchid', 'dark', 'comfortable']
];
const rgb = (c, a) =>
  a === 0
    ? 'rgba(0, 0, 0, 0)'
    : a < 1
      ? `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(a * 100) / 100})`
      : `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const paintOf = async (node, key = 'fills') => {
  const p = (node[key] || []).find((x) => x.visible !== false);
  if (!p) return 'rgba(0, 0, 0, 0)';
  if (p.boundVariables && p.boundVariables.color) {
    const v = await figma.variables.getVariableByIdAsync(p.boundVariables.color.id);
    const r = v.resolveForConsumer(node).value;
    return rgb(r, r.a ?? 1);
  }
  return rgb(p.color, p.opacity ?? 1);
};
const TB = await figma.getNodeByIdAsync('506:1873');
const out = {};
let cur;
const add = (props, state, prop, val) => cur.push([props, state, prop, String(val)]);
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  cur = out[ctx] = [];
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 6000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  for (const s of ['sm', 'md', 'lg']) {
    const i = TB.children.find((v) => v.name === `Orientation=horizontal, Size=${s}`).createInstance();
    f.appendChild(i);
    const sl = i.findChild((n) => n.type === 'SLOT');
    const btn = sl.children.find((n) => n.type === 'INSTANCE' && !n.name.startsWith('Toolbar'));
    const sep = sl.children.find((n) => n.name.startsWith('Toolbar'));
    const line = sep.findChild((n) => n.name === 'Line');
    const P = 'size=' + s;
    add(P, 'default', 'gap', sl.itemSpacing + 'px');
    add(P, 'default', 'separatorColor', await paintOf(line));
    add(P, 'default', 'separatorWidth', line.width + 'px');
    add(P, 'default', 'separatorMargin', sep.paddingLeft + 'px');
    add(P, 'default', 'itemHeight', btn.height);
  }
  f.remove();
}
return 'PARITY2:toolbar ' + JSON.stringify(out);
