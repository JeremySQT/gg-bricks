// Wave 5 (use_figma body), 2026-11-14, session https://claude.ai/code/session_0156c544Edt5ENkFjvmrgUAT.
// Parity measurement (read-only apart from temporary frames): set IDS to the components to measure. Instances of the
// masters are placed in a frame with explicit Brand, Appearance and Density modes per context of computed.json and
// their resolved values are returned as [context|id, props JSON, state, property, value] rows; save the result ({ keys, rows }) as
// JSON and run wave5-parity-report.mjs <id> <file>.
const IDS = ['avatar', 'avatar-group', 'data-field', 'divider', 'table'];
figma.skipInvisibleInstanceChildren = false;
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('540:63'));
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
const W = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700 };
const font = (t) => `${t.fontSize}px ${W[t.fontName.style]}`;
const variant = async (id, name) => (await figma.getNodeByIdAsync(id)).children.find((v) => v.name === name);
const out = [];
const add = (ctx, id, props, prop, val) =>
  out.push([`${ctx}|${id}`, JSON.stringify(props), 'default', prop, String(val)]);
for (const [b, a, d] of CTX) {
  const ctx = `${b}-${a}-${d}`;
  const f = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx });
  f.x = 9000;
  f.y = 0;
  f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
  f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
  f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
  const mk = async (id, name) => {
    const i = (await variant(id, name)).createInstance();
    f.appendChild(i);
    return i;
  };
  if (IDS.includes('avatar'))
    for (const sh of ['circle', 'square'])
      for (const s of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const i = await mk('543:605', `Size=${s}, Shape=${sh}, Content=initials`);
        const t = i.findOne((n) => n.name === 'Initials');
        const P = { size: s, shape: sh, content: 'initials' };
        add(ctx, 'avatar', P, 'width', i.width);
        add(ctx, 'avatar', P, 'height', i.height);
        add(ctx, 'avatar', P, 'radius', i.topLeftRadius + 'px');
        add(ctx, 'avatar', P, 'background-color', await paintOf(i));
        add(ctx, 'avatar', P, 'color', await paintOf(t));
        add(ctx, 'avatar', P, 'font-size', t.fontSize + 'px');
        add(ctx, 'avatar', P, 'font-weight', W[t.fontName.style]);
        const g = (await mk('543:605', `Size=${s}, Shape=${sh}, Content=glyph`)).findOne((n) => n.name === 'Glyph');
        add(ctx, 'avatar', { size: s, shape: sh, content: 'glyph' }, 'icon-width', g.width);
        add(ctx, 'avatar', { size: s, shape: sh, content: 'glyph' }, 'icon-height', g.height);
      }
  if (IDS.includes('avatar-group'))
    for (const sh of ['circle', 'square'])
      for (const s of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const i = await mk('544:721', `Size=${s}, Shape=${sh}`);
        const av = i.children[1];
        const P = { size: s, shape: sh };
        add(ctx, 'avatar-group', P, 'avatar-size', i.children[0].width);
        add(ctx, 'avatar-group', P, 'overlap', -i.itemSpacing);
        add(
          ctx,
          'avatar-group',
          P,
          'box-shadow',
          `${await paintOf(av, 'strokes')} 0px 0px 0px ${av.strokeTopWeight}px`
        );
      }
  if (IDS.includes('data-field'))
    for (const o of ['vertical', 'horizontal'])
      for (const s of ['sm', 'md']) {
        const i = await mk('546:31', `Orientation=${o}, Size=${s}, Empty=false`);
        const l = i.findOne((n) => n.name === 'Label'),
          v = i.findOne((n) => n.name === 'Value text');
        const P = { orientation: o, size: s };
        add(ctx, 'data-field', P, 'label-font', font(l));
        add(ctx, 'data-field', P, 'value-font', font(v));
        add(ctx, 'data-field', P, 'label-color', await paintOf(l));
        add(ctx, 'data-field', P, 'value-color', await paintOf(v));
        if (o === 'vertical') add(ctx, 'data-field', P, 'gap', i.itemSpacing);
        else add(ctx, 'data-field', P, 'label-width', l.width);
      }
  if (IDS.includes('divider')) {
    const h = await mk('545:652', 'Orientation=horizontal');
    const ln = h.findOne((n) => n.name === 'Line');
    add(ctx, 'divider', { orientation: 'horizontal' }, 'border-width', ln.height + 'px');
    add(ctx, 'divider', { orientation: 'horizontal' }, 'border-color', await paintOf(ln));
    const lb = h.findOne((n) => n.name === 'Label');
    const P = { orientation: 'horizontal', label: 'Or' };
    add(ctx, 'divider', P, 'gap', h.itemSpacing + 'px');
    add(ctx, 'divider', P, 'color', await paintOf(lb));
    add(ctx, 'divider', P, 'font', font(lb));
  }
  if (IDS.includes('table'))
    for (const s of ['sm', 'md', 'lg']) {
      const i = await mk('548:414', `Size=${s}`);
      const fr = i.findOne((n) => n.name === 'Frame');
      const col0 = i.findOne((n) => n.type === 'SLOT' && n.name === 'Columns').children[0];
      const h = col0.findOne((n) => n.name === 'Heading');
      const ht = h.findOne((n) => n.type === 'TEXT');
      const cells = col0.findOne((n) => n.type === 'SLOT').children;
      const c0 = cells[0];
      const ct = c0.findOne((n) => n.type === 'TEXT');
      const P = { size: s };
      add(ctx, 'table', P, 'frame-width', fr.strokeTopWeight + 'px');
      add(ctx, 'table', P, 'frame-color', await paintOf(fr, 'strokes'));
      add(ctx, 'table', P, 'radius', fr.topLeftRadius + 'px');
      add(ctx, 'table', P, 'header-background', await paintOf(h));
      add(
        ctx,
        'table',
        P,
        'header-line',
        `${await paintOf(h, 'strokes')} 0px -${h.strokeBottomWeight}px 0px 0px inset`
      );
      add(ctx, 'table', P, 'heading-font', font(ht));
      add(ctx, 'table', P, 'heading-color', await paintOf(ht));
      add(ctx, 'table', P, 'padding-inline', h.paddingLeft + 'px');
      add(ctx, 'table', P, 'row-height', c0.height);
      add(ctx, 'table', P, 'cell-font', font(ct));
      add(ctx, 'table', P, 'cell-color', await paintOf(ct));
      add(ctx, 'table', P, 'row-line', `${await paintOf(c0, 'strokes')} 0px -${c0.strokeBottomWeight}px 0px 0px inset`);
    }
  f.remove();
}
// Hash return (parity by hash, as in waves 1 and 2): per context and component, the FNV-1a hash of the sorted lines
// `<props JSON>|<property>=<value>`; wave5-parity-report.mjs builds the same lines from computed.json.
const fnv = (str) => {
  let h = 0x811c9dc5;
  for (let k = 0; k < str.length; k++) {
    h ^= str.charCodeAt(k);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
};
const groups = {};
for (const [cid, props, , prop, val] of out) (groups[cid] ||= []).push(`${props}|${prop}=${val}`);
return Object.fromEntries(
  Object.entries(groups).map(([k, lines]) => [k, [lines.length, fnv(lines.sort().join('\n'))]])
);
