import fs from 'node:fs';
// Usage: node authoring/adapters/figma/forms-parity-report.mjs <id> --expected
//        node authoring/adapters/figma/forms-parity-report.mjs <id> <measurement result json>
// <id>: checkbox, radio, radio-group, switch, input-text, textarea or field. The measurement body is
// forms-parity.plugin.js (use_figma) with the same ID. Exact fields are compared per context through the FNV-1a
// hash of the sorted "key=fields" lines, which this script builds from reports/components/<id>/svelte/computed.json
// (equal hashes prove every field equal; a differing context needs its lines, DETAIL in the measurement). Numeric
// fields (geometry) are compared one by one with a tolerance. A key is the sorted props and the state, with the
// occurrence number of that key in the context (the review page measures some props and state twice: with and
// without a leading icon, at 2 rows and at 1 row).
// Writes reports/components/<id>/figma/parity.json, one record per computed record.
const id = process.argv[2];
const { records } = JSON.parse(fs.readFileSync(`reports/components/${id}/svelte/computed.json`, 'utf8'));
const hex = (v) => {
  if (v === '' || v === null) return '';
  const p = String(v)
    .match(/rgba?\(([^)]+)\)/)[1]
    .split(',')
    .map((s) => parseFloat(s));
  if (p.length === 3) p.push(1);
  return p
    .map((x, i) =>
      Math.round(i === 3 ? x * 255 : x)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
};
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};
const px = (v) => String(v).replace(/px/g, '');
// "rgb(…) 0px 0px 0px 1px inset" (inset border) or "rgb(…) 1px" (SVG stroke) → "hex/width".
const border = (v) => `${hex(v)}/${parseFloat(String(v).match(/([\d.]+)px(?: inset)?$/)[1])}`;
// "solid 2px rgb(…) 2px" → "hex/2/2"; a hidden outline (none, or transparent for forced colors) → "".
const outline = (v) => {
  const [, style, width, color, offset] = String(v).match(/^(\w+) ([\d.]+)px (rgba?\([^)]+\)) (-?[\d.]+)px$/);
  if (style === 'none' || hex(color).endsWith('00')) return '';
  return `${hex(color)}/${parseFloat(width)}/${parseFloat(offset)}`;
};
const choiceExact = (checkbox) => ({
  surface: [0, hex],
  boxShadow: [1, border],
  border: [1, border],
  mark: [2, hex],
  dot: [2, hex],
  labelColor: [3, hex],
  radius: [4, px],
  ...(checkbox ? { fontSize: [5, px] } : {}),
  outline: [6, outline]
});
const fieldExact = {
  surface: [0, hex],
  content: [1, hex],
  boxShadow: [2, border],
  placeholder: [3, hex],
  outline: [4, outline],
  radius: [5, px],
  fontSize: [6, px]
};
const T = 0.02;
// Figma sets the label “Setting” in whole pixels and shapes Inter slightly wider than the browser (up to 1.8 px).
const TEXT = 2;
// Figma rounds the text box of a fractional line (lg: 28.8 px) to whole pixels: the first line center moves 0.1 px.
const LINE = 0.11;
const CONFIG = {
  checkbox: {
    fields: 7,
    exact: choiceExact(true),
    num: { markSize: [0, T], size: [1, T], height: [2, T], gap: [3, T], firstLineOffset: [4, LINE] }
  },
  radio: {
    fields: 7,
    exact: choiceExact(false),
    num: { dotSize: [0, T], size: [1, T], gap: [3, T], firstLineOffset: [4, LINE] }
  },
  switch: {
    fields: 4,
    exact: { surface: [0, hex], boxShadow: [1, border], thumb: [2, hex], outline: [3, outline] },
    num: {
      width: [0, T],
      height: [1, T],
      thumbSize: [2, T],
      thumbStart: [3, T],
      thumbEnd: [4, T],
      thumbTop: [5, T],
      firstLineOffset: [6, LINE],
      rootWidth: [7, TEXT],
      trackEndGap: [8, TEXT]
    }
  },
  'radio-group': { fields: 1, exact: { gap: [0, px] }, num: {} },
  'input-text': {
    fields: 8,
    exact: { ...fieldExact, lineHeight: [7, px] },
    num: { height: [0, T], textStart: [1, T], iconSize: [2, T], iconStart: [3, T] }
  },
  textarea: {
    fields: 8,
    exact: fieldExact,
    num: { height: [0, T], paddingTop: [1, T], paddingLeft: [2, T], lineHeight: [3, T] }
  },
  field: {
    fields: 8,
    exact: {
      labelColor: [0, hex],
      labelFont: [1, px],
      requiredColor: [2, hex],
      descriptionColor: [3, hex],
      descriptionFont: [4, px],
      messageColor: [5, hex],
      messageFont: [6, px],
      iconColor: [7, hex]
    },
    num: {
      iconSize: [0, T],
      descriptionGap: [1, T],
      controlGap: [2, T],
      messageGap: [3, T],
      iconToText: [4, T],
      iconLineOffset: [5, T]
    }
  }
}[id];
const NOTES = {
  checkbox: {
    surface: 'Control fill bound to color/choice/{off|on}/{state}/surface',
    boxShadow: 'Control inside stroke bound to color/choice/{off|on}/{state}/border and border/width/default',
    mark: 'Mark (_Checkbox/Check or _Checkbox/Minus, Phosphor bold) glyph fill bound to color/choice/on/{state}/content',
    labelColor: 'Label fill bound to color/content/primary (disabled: color/content/disabled)',
    radius: 'Control corners bound to radius/indicator',
    fontSize: 'Label in typography/body/{size}',
    outline:
      'Focus ring frame 2 px outside the Control, outside stroke bound to color/focus/ring and focus/width, shown by Focus; the hidden ring is the code’s transparent forced-colors outline',
    markSize: 'Mark stretched over the Control (size/choice/{size}); 0 when off',
    size: 'Control width bound to size/choice/{size}',
    height: 'Control height bound to size/choice/{size}',
    gap: 'row gap bound to space/control/gap/{size}',
    firstLineOffset: 'Control centered in the First line frame (typography/body/{size}/lineHeight)'
  },
  radio: {
    surface: 'Control fill bound to color/choice/{off|on}/{state}/surface',
    border: 'Control inside stroke bound to color/choice/{off|on}/{state}/border and border/width/default',
    dot: 'Mark ellipse of radio/dot (Components adapter) bound to color/choice/on/{state}/content; none when off',
    labelColor: 'Label fill bound to color/content/primary (disabled: color/content/disabled)',
    radius: 'Control corners bound to radius/full',
    outline:
      'Focus ring frame 2 px outside the Control, outside stroke bound to color/focus/ring and focus/width, shown by Focus',
    dotSize: 'Mark ellipse bound to radio/dot (3/8 of size/choice/{size}); 0 when off',
    size: 'Control bound to size/choice/{size}',
    gap: 'row gap bound to space/control/gap/{size}',
    firstLineOffset: 'Control centered in the First line frame (typography/body/{size}/lineHeight)'
  },
  switch: {
    surface: 'Track fill bound to color/choice/{off|on}/{state}/surface',
    boxShadow: 'Track inside stroke bound to color/choice/{off|on}/{state}/border and border/width/default',
    thumb: 'Thumb ellipse fill bound to color/choice/{off|on}/{state}/content',
    outline:
      'Focus ring frame 2 px outside the Track, outside stroke bound to color/focus/ring and focus/width, shown by Focus; the hidden ring is the code’s transparent forced-colors outline',
    width: 'Track width bound to switch/track-width (Components adapter)',
    height: 'Track height bound to size/switch/{size}',
    thumbSize: 'Thumb bound to switch/thumb (Components adapter)',
    thumbStart: 'Track padding switch/inset; the thumb at the start when off, at the end when on',
    thumbEnd: 'Track padding switch/inset; the thumb at the start when off, at the end when on',
    thumbTop: 'Track padding switch/inset, thumb centered',
    firstLineOffset: 'Track centered in the First line frame (typography/body/{size}/lineHeight)',
    rootWidth: `track, gap space/control/gap/{size} and the label “Setting” hugged; text layout tolerance ±${TEXT} px`,
    trackEndGap: `from the track end to the row end (gap and label); text layout tolerance ±${TEXT} px`
  },
  'radio-group': {
    gap: 'vertical: itemSpacing space/content/sm; horizontal: wrap with itemSpacing space/content/lg and counterAxisSpacing space/content/sm'
  },
  'input-text': {
    surface: 'root fill bound to color/field/{state}/surface',
    content: 'Value fill bound to color/field/{state}/content (Content=value)',
    boxShadow: 'root inside stroke bound to color/field/{state}/border and border/width/default',
    placeholder: 'Placeholder fill bound to color/field/{state}/placeholder',
    outline:
      'Focus ring frame 2 px outside the root, outside stroke bound to color/focus/ring and focus/width; shown on State=focus and by Focus (invalid+focus: State=invalid with Focus)',
    radius: 'root corners bound to radius/control',
    fontSize: 'text in typography/body/{size}',
    lineHeight: 'text in typography/body/{size}',
    height: 'root height bound to size/control/{size}',
    textStart:
      'edge-inline padding, then the Leading slot when shown (slot-inline, icon box, slot-inline), then the Input frame label-inline padding',
    iconSize: 'Leading icon bound to size/icon/{size}; 0 without the leading icon',
    iconStart:
      'edge-inline padding and slot-inline padding, then the icon centered in its drawing box of input-text/icon-box (iconSize − iconSize/4): it starts iconSize/8 before the box'
  },
  textarea: {
    surface: 'root fill bound to color/field/{state}/surface',
    content: 'Value fill bound to color/field/{state}/content (Content=value)',
    boxShadow: 'root inside stroke bound to color/field/{state}/border and border/width/default',
    placeholder: 'Placeholder fill bound to color/field/{state}/placeholder',
    outline:
      'Focus ring frame 2 px outside the root, outside stroke bound to color/focus/ring and focus/width; shown on State=focus and by Focus (invalid+focus: State=invalid with Focus)',
    radius: 'root corners bound to radius/control',
    fontSize: 'text in typography/body/{size}',
    height:
      'Area: First row (size/control/{size}) and More rows (textarea/more-rows, 2 lines) at the default 3 rows; observed for the case’s rows: the master height minus (3 − rows) lines (designers set the instance height for other row counts)',
    paddingTop:
      'Text box (textarea/text-rows, 3 lines) centered on the Area: its top sits at (size/control − one line) / 2, the code’s block padding',
    paddingLeft: 'root padding bound to space/control/padding-inline/{size}',
    lineHeight: 'text in typography/body/{size}'
  },
  field: {
    labelColor: 'Label fill bound to color/content/primary (disabled: color/content/disabled)',
    labelFont: 'Label in typography/label/md',
    requiredColor: 'Required indicator fill bound to color/content/secondary (disabled: color/content/disabled)',
    descriptionColor: 'Description fill bound to color/content/secondary (disabled: color/content/disabled)',
    descriptionFont: 'Description in typography/body/sm',
    messageColor: 'Message text fill bound to color/status/danger/content; no message unless invalid',
    messageFont: 'Message text in typography/body/sm',
    iconColor: 'Message icon (phosphor/warning-circle) glyph fill bound to color/status/danger/icon',
    iconSize: 'Message icon bound to size/icon/sm; 0 without message',
    descriptionGap: 'Header itemSpacing bound to space/content/xs',
    controlGap: 'Field itemSpacing bound to space/content/sm',
    messageGap: 'Body itemSpacing bound to space/content/xs',
    iconToText:
      'Message itemSpacing space/content/xs after the drawing box field/icon-box (iconSize − iconSize/4): from the drawn glyph to the text',
    iconLineOffset: 'icon centered in the First line frame (typography/body/sm/lineHeight)'
  }
}[id];
const JUSTIFIED = {
  resize:
    'justified: resizing (vertical, auto, none) is a behavior of the code; the master shows the default size, designers set the instance height',
  noPlaceholder:
    'justified: this textarea of the review page has a value and no placeholder; the browser reports the text color for ::placeholder. The Placeholder role is checked on the condition cases',
  checkboxOffMark:
    'justified: an off box draws no mark, so the master has no Mark layer; the code keeps the color for the transition only'
};
const keyOf = (props, state) =>
  Object.keys(props)
    .sort()
    .map((k) => `${k}=${props[k]}`)
    .join(',') + `|${state}`;
// Occurrence numbers: the nth record of the same key and property in a context is case #n.
const seen = {};
const keyed = records.map((r) => {
  const base = keyOf(r.props, r.state);
  const s = `${r.context}|${base}|${r.property}`;
  const n = (seen[s] = (seen[s] ?? -1) + 1);
  return { r, key: `${base}#${n}` };
});
// Checkbox off: no mark. Textarea pairs (1 row, key #1 at md, #0 at sm and lg): no placeholder attribute.
const pair = (r, key) => id === 'textarea' && r.state === 'default' && (r.props.size !== 'md' || key.endsWith('#1'));
const skip = (r, key) =>
  (id === 'checkbox' && r.property === 'mark' && r.props.selection === 'off') ||
  (r.property === 'placeholder' && pair(r, key));
const expected = {};
for (const { r, key } of keyed) {
  const k = `${r.context}|${key}`;
  expected[k] = expected[k] || Array(CONFIG.fields).fill('');
  if (skip(r, key) || !CONFIG.exact[r.property]) continue;
  const [i, f] = CONFIG.exact[r.property];
  expected[k][i] = f(r.value);
}
const byContext = {};
for (const k of Object.keys(expected).sort()) {
  const c = k.split('|')[0];
  (byContext[c] = byContext[c] || []).push(k);
}
const strip = (k) => k.slice(k.indexOf('|') + 1);
const expectedHash = Object.fromEntries(
  Object.entries(byContext).map(([c, ks]) => [
    c,
    { n: ks.length, hash: fnv(ks.map((k) => `${strip(k)}=${expected[k].join('|')}`).join('\n')) }
  ])
);
if (process.argv[3] === '--expected') {
  console.log(JSON.stringify(expectedHash));
  process.exit(0);
}
if (process.argv[3] === '--lines') {
  const c = process.argv[4];
  console.log(byContext[c].map((k) => `${strip(k)}=${expected[k].join('|')}`).join('\n'));
  process.exit(0);
}
const m = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const out = [];
const round = (x) => (x === null ? null : Math.round(x * 1000) / 1000);
for (const { r, key } of keyed) {
  const ctx = m.result[r.context];
  const rec = { context: r.context, props: r.props, state: r.state, property: r.property, expected: r.value };
  if (r.property === 'resize') {
    out.push({ ...rec, part: 'textarea', observed: null, passed: true, note: JUSTIFIED.resize });
  } else if (skip(r, key)) {
    const mark = r.property === 'mark';
    out.push({
      ...rec,
      part: r.property,
      observed: '',
      passed: true,
      note: mark ? JUSTIFIED.checkboxOffMark : JUSTIFIED.noPlaceholder
    });
  } else if (CONFIG.exact[r.property]) {
    const [i, f] = CONFIG.exact[r.property];
    const exp = f(r.value);
    let observed = null;
    if (ctx && ctx.hash === expectedHash[r.context].hash && ctx.n === expectedHash[r.context].n) observed = exp;
    else if (ctx && ctx.lines && ctx.lines[key] !== undefined) observed = ctx.lines[key].split('|')[i];
    out.push({ ...rec, part: r.property, observed, passed: observed === exp, note: NOTES[r.property] });
  } else if (CONFIG.num[r.property]) {
    const [i, tol] = CONFIG.num[r.property];
    const pos = m.CASES.indexOf(key);
    const ref = ctx && pos >= 0 ? m.NUMS[ctx.num][pos] : -1;
    const row = ref >= 0 ? m.TUPLES[ref] : null;
    const observed = row ? round(row[i]) : null;
    const exp = r.value === null ? null : parseFloat(r.value);
    const passed = exp === null ? observed === null : observed !== null && Math.abs(observed - exp) <= tol;
    out.push({
      ...rec,
      part: r.property,
      observed,
      passed,
      note:
        tol === T
          ? `${NOTES[r.property]}; tolerance ±${T} px (layout rounding)`
          : tol === LINE
            ? `${NOTES[r.property]}; tolerance ±${LINE} px: Figma rounds the text box of a 28.8 px line (lg) to 29 px, the browser to 1/64 px`
            : NOTES[r.property]
    });
  } else out.push({ ...rec, observed: null, passed: false, note: 'property not measured' });
}
const failures = out.filter((r) => !r.passed);
const textDiffs = out
  .filter((r) => CONFIG.num[r.property] && CONFIG.num[r.property][1] === TEXT)
  .map((r) => Math.round(Math.abs(r.observed - r.expected) * 1000) / 1000);
fs.mkdirSync(`reports/components/${id}/figma`, { recursive: true });
fs.writeFileSync(
  `reports/components/${id}/figma/parity.json`,
  JSON.stringify(
    {
      recordedOn: '2026-10-27',
      file: 'TDPqojP4KvbWJlKSYc4zKC',
      componentSet: m.set,
      method:
        'Exact fields: per context, the measured field strings of every case are hashed in Figma (FNV-1a of the sorted key=fields lines) and compared with the same strings built from computed.json; an equal hash proves each field equal, so observed repeats expected in its Figma form. Geometry: compared one by one with a tolerance. Body: authoring/adapters/figma/forms-parity.plugin.js; report: forms-parity-report.mjs.',
      contexts: Object.fromEntries(
        Object.keys(expectedHash).map((c) => [
          c,
          { expected: expectedHash[c], observed: m.result[c] ? { n: m.result[c].n, hash: m.result[c].hash } : null }
        ])
      ),
      summary: {
        records: out.length,
        failures: failures.length,
        justified: out.filter((r) => r.note && r.note.startsWith('justified')).length,
        ...(textDiffs.length ? { maxTextLayoutDifference: Math.max(...textDiffs) } : {})
      },
      records: out
    },
    null,
    2
  ) + '\n'
);
console.log({
  records: out.length,
  failures: failures.length,
  sample: failures.slice(0, 8).map((f) => [f.context, keyOf(f.props, f.state), f.property, f.expected, f.observed]),
  hashMismatch: Object.keys(expectedHash).filter((c) => !m.result[c] || m.result[c].hash !== expectedHash[c].hash)
});
