// Wave 2 Figma parity measurement (use_figma body), 2026-10-27.
// One body for the seven form masters: set ID below to checkbox, radio, radio-group, switch, input-text, textarea
// or field before running. In each of the 18 brand × appearance × density contexts, instantiates the cases of
// reports/components/<ID>/svelte/computed.json (same props, state, label text and slots as the code's review page;
// hover and focus cases only in the four representative contexts, as the browser spec) in a temporary frame with
// explicit Brand/Appearance/Density modes, and reads:
//   exact fields   colors (hex of the resolved bound variable), stroke "hex/width", radius, font size and weight,
//                  line height, gaps of radio-group, focus outline "hex/width/offset" ('' when the ring is hidden)
//   numeric fields geometry (sizes, offsets, gaps), compared with a tolerance by the report.
// Returns CASES (the case keys, once) and per context { n, hash } (FNV-1a of the sorted "key=exact fields" lines),
// num (index in NUMS of its numeric fields per case, in CASES order, null when the case is not measured in that
// context), plus the exact
// lines of the contexts listed in DETAIL. forms-parity-report.mjs builds the same strings from computed.json.
const ID = 'checkbox';
const DETAIL = [];
const DETAIL_KEYS = /./; // lines of the DETAIL contexts whose key matches
figma.skipInvisibleInstanceChildren = false;
const PAGE = {
  checkbox: '288:3',
  field: '288:4',
  'input-text': '288:5',
  radio: '288:6',
  'radio-group': '288:7',
  switch: '288:8',
  textarea: '288:9'
}[ID];
const SET = {
  checkbox: 'Checkbox',
  field: 'Field',
  'input-text': 'InputText',
  radio: 'Radio',
  'radio-group': 'RadioGroup',
  switch: 'Switch',
  textarea: 'Textarea'
}[ID];
const REP = ['base-light-standard', 'base-dark-standard', 'brick-light-compact', 'orchid-dark-comfortable'];
const page = await figma.getNodeByIdAsync(PAGE);
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name.startsWith('_parity '))) n.remove();
const set = page.children.find((n) => n.type === 'COMPONENT_SET' && n.name === SET);
const PROPS = Object.keys(set.componentPropertyDefinitions);
const P = (name) => PROPS.find((k) => k.split('#')[0] === name);
const variant = (name) => {
  const v = set.children.find((c) => c.name === name);
  if (!v) throw new Error('missing variant ' + name);
  return v;
};
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const res = async (node, field) => {
  const b = node.boundVariables && node.boundVariables[field];
  const ref = Array.isArray(b) ? b[0] : b;
  return ref ? (await varOf(ref.id)).resolveForConsumer(node).value : '';
};
const hex = (c) =>
  [c.r, c.g, c.b, c.a === undefined ? 1 : c.a]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
const paint = async (node, kind = 'fills') => {
  if (!node) return '';
  const p = node[kind] && node[kind][0];
  if (!p) return '';
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  return id ? hex((await varOf(id)).resolveForConsumer(node).value) : 'literal';
};
const stroke = async (node) => `${await paint(node, 'strokes')}/${await res(node, 'strokeTopWeight')}`;
const glyph = async (inst) => (inst ? paint(inst.findOne((n) => n.type === 'VECTOR')) : '');
// The ring frame sits outside its parent by the offset, and its outside stroke is the outline.
const outline = async (ring) => (ring && ring.visible ? `${await stroke(ring)}/${r3(-ring.x)}` : '');
// Text styles set the line height as a percentage of the bound font size (the variable binds the frames only).
const lineH = async (t) => {
  const f = await res(t, 'fontSize');
  return t.lineHeight.unit === 'PERCENT' ? r3((f * t.lineHeight.value) / 100) : t.lineHeight.value;
};
const font = async (t) => `${await res(t, 'fontWeight')} ${await res(t, 'fontSize')}`;
const r3 = (x) => Math.round(x * 1000) / 1000;
const ax = (n) => n.absoluteTransform[0][2];
const ay = (n) => n.absoluteTransform[1][2];
const shown = (n) => {
  for (let p = n; p && p.type !== 'PAGE'; p = p.parent) if (p.visible === false) return false;
  return true;
};
const named = (inst, name) => inst.findOne((n) => n.name === name);
const text = (inst, name) => inst.findOne((n) => n.type === 'TEXT' && n.name === name);
// Center of the box minus center of the first line of the text.
const lineOffset = (box, t, lh = t.height) => r3(ay(box) + box.height / 2 - (ay(t) + lh / 2));
const keyOf = (props, state) =>
  Object.keys(props)
    .sort()
    .map((k) => `${k}=${props[k]}`)
    .join(',') + `|${state}`;

// Cases: { key, variant, props (instance properties), rep (representative contexts only), measure data }.
const CASES = [];
const add = (props, state, name, set = {}, extra = {}) => {
  const key = keyOf(props, state);
  const n = CASES.filter((c) => c.key.split('#')[0] === key).length;
  CASES.push({ key: `${key}#${n}`, variant: name, set, ...extra });
};
const S = ['sm', 'md', 'lg'];
if (ID === 'checkbox' || ID === 'radio' || ID === 'switch') {
  const SEL = { checkbox: ['off', 'on', 'indeterminate'], radio: ['off', 'on'], switch: ['off', 'on'] }[ID];
  const ST = ID === 'switch' ? ['default', 'readonly', 'disabled'] : ['default', 'readonly', 'disabled', 'invalid'];
  const name = (s, sel, st) =>
    `${ID === 'switch' ? 'Label position=end, ' : ''}Size=${s}, Selection=${sel}, State=${st}`;
  const label = { checkbox: 'Option', switch: 'Setting' }[ID];
  for (const s of S)
    for (const st of ST)
      for (const sel of SEL) {
        const l = ID === 'radio' ? (sel === 'on' ? 'Team' : 'Solo') : label;
        add({ size: s, selection: sel }, st, name(s, sel, st), { Label: l });
      }
  for (const sel of SEL)
    add(
      { size: 'md', selection: sel },
      'hover',
      name('md', sel, 'hover'),
      { Label: ID === 'radio' ? (sel === 'on' ? 'Team' : 'Solo') : label },
      { rep: true }
    );
  const fsel = ID === 'radio' ? 'on' : 'off';
  add(
    { size: 'md', selection: fsel },
    'focus',
    name('md', fsel, 'default'),
    { Label: ID === 'radio' ? 'Team' : label, Focus: true },
    { rep: true }
  );
} else if (ID === 'radio-group') {
  for (const o of ['horizontal', 'vertical']) add({ orientation: o }, 'default', `Orientation=${o}`);
} else if (ID === 'input-text') {
  const v = (s, content, st) => `Size=${s}, Action=none, Content=${content}, State=${st}`;
  // Sizes beside Buttons: leading magnifying glass, placeholder; then the empty inputs of the conditions.
  for (const s of S)
    add(
      { size: s },
      'default',
      v(s, 'placeholder', 'default'),
      { Placeholder: 'Search invoices', 'Show leading': true },
      { value: v(s, 'value', 'default') }
    );
  for (const st of ['default', 'readonly', 'disabled', 'invalid'])
    add(
      { size: 'md' },
      st,
      v('md', 'placeholder', st),
      { Placeholder: 'name@example.com' },
      { value: v('md', 'value', st) }
    );
  add({ size: 'md' }, 'hover', v('md', 'placeholder', 'hover'), {}, { value: v('md', 'value', 'hover'), rep: true });
  // Focus is a property (2026-10-28): State default with Focus on.
  add(
    { size: 'md' },
    'focus',
    v('md', 'placeholder', 'default'),
    { Focus: true },
    { value: v('md', 'value', 'default'), rep: true }
  );
  add(
    { size: 'md' },
    'invalid+focus',
    v('md', 'placeholder', 'invalid'),
    { Focus: true },
    { value: v('md', 'value', 'invalid'), rep: true }
  );
} else if (ID === 'textarea') {
  const v = (s, content, st) => `Size=${s}, Content=${content}, State=${st}`;
  // Conditions: 2 rows; pairs beside InputText: 1 row, a value and no placeholder.
  for (const st of ['default', 'readonly', 'disabled', 'invalid'])
    add({ size: 'md' }, st, v('md', 'placeholder', st), {}, { value: v('md', 'value', st), rows: 2 });
  for (const s of S)
    add(
      { size: s },
      'default',
      v(s, 'placeholder', 'default'),
      {},
      { value: v(s, 'value', 'default'), rows: 1, noPlaceholder: true }
    );
  add(
    { size: 'md' },
    'hover',
    v('md', 'placeholder', 'hover'),
    {},
    { value: v('md', 'value', 'hover'), rows: 2, rep: true }
  );
  add(
    { size: 'md' },
    'focus',
    v('md', 'placeholder', 'default'),
    { Focus: true },
    { value: v('md', 'value', 'default'), rows: 2, rep: true }
  );
  add(
    { size: 'md' },
    'invalid+focus',
    v('md', 'placeholder', 'invalid'),
    { Focus: true },
    { value: v('md', 'value', 'invalid'), rows: 2, rep: true }
  );
} else if (ID === 'field') {
  add({ required: true, invalid: true }, 'default', 'State=invalid', {
    Label: 'Company',
    Description: 'As registered.',
    Message: 'Enter the company name.',
    Required: true
  });
  add({ required: true, disabled: true }, 'disabled', 'State=disabled', {
    Label: 'Company',
    Description: 'Managed by your organization.',
    Required: true
  });
}

const measure = async (inst, c, valueInst) => {
  if (ID === 'checkbox' || ID === 'radio') {
    const box = named(inst, 'Control');
    const mark = named(inst, 'Mark');
    const label = text(inst, 'Label');
    return {
      exact: [
        await paint(box),
        await stroke(box),
        ID === 'checkbox' ? await glyph(mark) : await paint(mark),
        await paint(label),
        await res(box, 'topLeftRadius'),
        ID === 'checkbox' ? await res(label, 'fontSize') : '',
        await outline(named(inst, 'Focus ring'))
      ],
      num: [
        mark ? r3(mark.width) : 0,
        r3(box.width),
        r3(box.height),
        r3(ax(label) - ax(box) - box.width),
        lineOffset(box, label)
      ]
    };
  }
  if (ID === 'switch') {
    const track = named(inst, 'Track');
    const thumb = named(inst, 'Thumb');
    const label = text(inst, 'Label');
    return {
      exact: [await paint(track), await stroke(track), await paint(thumb), await outline(named(inst, 'Focus ring'))],
      num: [
        r3(track.width),
        r3(track.height),
        r3(thumb.width),
        r3(ax(thumb) - ax(track)),
        r3(ax(track) + track.width - ax(thumb) - thumb.width),
        r3(ay(thumb) - ay(track)),
        lineOffset(track, label),
        r3(inst.width),
        r3(ax(inst) + inst.width - ax(track) - track.width)
      ]
    };
  }
  if (ID === 'radio-group') {
    // The gaps belong to the Options slot (2026-10-28).
    const box = inst.findAllWithCriteria({ types: ['SLOT'] })[0];
    const gap =
      box.layoutMode === 'HORIZONTAL'
        ? `${await res(box, 'counterAxisSpacing')} ${await res(box, 'itemSpacing')}`
        : `${await res(box, 'itemSpacing')}`;
    return { exact: [gap], num: [] };
  }
  if (ID === 'input-text' || ID === 'textarea') {
    const ph = text(inst, 'Placeholder');
    const val = text(valueInst, 'Value');
    const fb = named(inst, 'Focus border');
    const exact = [
      await paint(inst),
      await paint(val),
      // The focus border of a focused default or hovered field is its own layer.
      fb && shown(fb) ? await stroke(fb) : await stroke(inst),
      // The paired textareas of the review page have no placeholder.
      c.noPlaceholder ? '' : await paint(ph),
      await outline(named(inst, 'Focus ring')),
      await res(inst, 'topLeftRadius'),
      await res(ph, 'fontSize'),
      // Textarea: the line height is a numeric field.
      ID === 'input-text' ? await lineH(ph) : ''
    ];
    if (ID === 'input-text') {
      const icon = named(inst, 'Leading icon');
      const on = shown(icon);
      return {
        exact,
        num: [r3(inst.height), r3(ax(ph) - ax(inst)), on ? r3(icon.width) : 0, on ? r3(ax(icon) - ax(inst)) : 0]
      };
    }
    // The master shows 3 rows; the code case has `rows`: remove the missing lines.
    const box = named(inst, 'Text box');
    const lh = await lineH(ph);
    return {
      exact,
      num: [r3(inst.height - (3 - c.rows) * lh), r3(ay(box) - ay(inst)), await res(inst, 'paddingLeft'), lh]
    };
  }
  if (ID === 'field') {
    const label = text(inst, 'Label');
    const row = named(inst, 'Label row');
    const desc = text(inst, 'Description');
    const control = named(inst, 'Control');
    const msg = named(inst, 'Message');
    const mt = msg && text(msg, 'Message text');
    const icon = msg && named(msg, 'Message icon');
    const bottom = (n) => ay(n) + n.height;
    return {
      exact: [
        await paint(label),
        await font(label),
        await paint(text(inst, 'Required indicator')),
        await paint(desc),
        await font(desc),
        mt ? await paint(mt) : '',
        mt ? await font(mt) : '',
        icon ? await glyph(icon) : ''
      ],
      num: [
        icon ? r3(icon.width) : 0,
        r3(ay(desc) - bottom(row)),
        r3(ay(control) - bottom(desc)),
        msg ? r3(ay(msg) - bottom(control)) : null,
        icon ? r3(ax(mt) - (ax(icon) + icon.width - icon.width / 8)) : null,
        icon ? lineOffset(icon, mt, await lineH(mt)) : null
      ]
    };
  }
};

const result = {};
const NUMS = [];
for (const brand of ['base', 'brick', 'orchid'])
  for (const ap of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${brand}-${ap}-${d}`;
      const frame = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx, itemSpacing: 8 });
      frame.x = -4000;
      frame.clipsContent = false;
      frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), brand));
      frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
      frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      const exact = {},
        num = [];
      try {
        for (const c of CASES) {
          if (c.rep && !REP.includes(ctx)) {
            num.push(null);
            continue;
          }
          const inst = variant(c.variant).createInstance();
          frame.appendChild(inst);
          const props = {};
          for (const [k, v] of Object.entries(c.set)) props[P(k)] = v;
          if (Object.keys(props).length) inst.setProperties(props);
          let valueInst = null;
          if (c.value) {
            valueInst = variant(c.value).createInstance();
            frame.appendChild(valueInst);
          }
          const m = await measure(inst, c, valueInst);
          exact[c.key] = m.exact.join('|');
          num.push(m.num);
        }
      } finally {
        frame.remove();
      }
      const keys = Object.keys(exact).sort();
      // Geometry depends on density mostly: identical rows are returned once (NUMS) and referenced by index.
      const row = JSON.stringify(num);
      if (!NUMS.includes(row)) NUMS.push(row);
      result[ctx] = {
        n: keys.length,
        hash: fnv(keys.map((k) => `${k}=${exact[k]}`).join('\n')),
        num: NUMS.indexOf(row)
      };
      if (DETAIL.includes(ctx))
        result[ctx].lines = Object.fromEntries(Object.entries(exact).filter(([k]) => DETAIL_KEYS.test(k)));
    }
function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
}
// Numeric tuples are returned once (TUPLES); a NUMS row lists tuple indexes (-1: case not measured).
const TUPLES = [];
const rows = NUMS.map((r) =>
  JSON.parse(r).map((t) => {
    if (t === null) return -1;
    const k = JSON.stringify(t);
    if (!TUPLES.includes(k)) TUPLES.push(k);
    return TUPLES.indexOf(k);
  })
);
return JSON.stringify({
  ID,
  set: set.id,
  CASES: CASES.map((c) => c.key),
  TUPLES: TUPLES.map((t) => JSON.parse(t)),
  NUMS: rows,
  result
});
