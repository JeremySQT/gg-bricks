import fs from 'node:fs';
// Usage: node authoring/adapters/figma/spinner-parity-report.mjs <measurement.json>
// The measurement is the result of spinner-parity.plugin.js (use_figma): { out: { <context>: "size,w,h,track,
// indicator,trackOpacityVariable,trackOpacity,trackStroke,indicatorStroke,cap;…" } }. Writes
// reports/components/spinner/figma/parity.json, one record per record of reports/components/spinner/svelte/computed.json.
const [file] = process.argv.slice(2);
const { out } = JSON.parse(fs.readFileSync(file, 'utf8'));
const { records } = JSON.parse(fs.readFileSync('reports/components/spinner/svelte/computed.json', 'utf8'));
const hex = (v) => {
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
const figma = {};
for (const [context, line] of Object.entries(out))
  for (const row of line.split(';')) {
    const [size, w, h, track, indicator, , opacity, trackStroke, indicatorStroke, cap] = row.split(',');
    figma[`${context}|${size}`] = {
      w: +w,
      h: +h,
      track,
      indicator,
      opacity: +opacity,
      trackStroke,
      indicatorStroke,
      cap
    };
  }
const result = records.map((r) => {
  const m = figma[`${r.context}|${r.props.size}`];
  const rec = {
    context: r.context,
    props: r.props,
    state: r.state,
    part: 'container',
    property: r.property,
    expected: r.value
  };
  const pass = (observed, passed, note) => ({ ...rec, observed, passed, ...(note ? { note } : {}) });
  if (!m) return pass(null, false, 'not measured');
  switch (r.property) {
    case 'width':
      return pass(m.w, m.w === r.value);
    case 'height':
      return pass(m.h, m.h === r.value);
    case 'color':
    case 'parentColor':
      // The code inherits the color of its parent; the master draws color/content/primary (the content color of the
      // review page), and a host overrides both strokes with its own content color.
      return pass(
        m.indicator,
        m.indicator === hex(r.value),
        'Figma has no inherited color: both strokes bind color/content/primary, the host overrides them.'
      );
    case 'trackStroke':
      return { ...pass(m.track, m.track === hex(r.value)), part: 'track' };
    case 'indicatorStroke':
      return { ...pass(m.indicator, m.indicator === hex(r.value)), part: 'indicator' };
    case 'trackOpacity':
      return { ...pass(m.opacity, Math.abs(m.opacity - Number(r.value)) < 0.001), part: 'track' };
    case 'duration':
    case 'timing':
      return {
        ...pass(
          'code-only',
          true,
          'Justified: the turn is an animation of the code (component.spinner.duration, linear); Figma masters are static, the master description names the duration.'
        ),
        part: 'indicator'
      };
    default:
      return pass(null, false, 'unknown property');
  }
});
// Stroke geometry from the contract drawing (2.5 units of a 24-unit box), not recorded by the browser spec.
const extra = [];
for (const [k, m] of Object.entries(figma)) {
  const [context, size] = k.split('|');
  const want = Math.round(((2.5 * m.w) / 24) * 1000) / 1000;
  for (const [part, value] of [
    ['track', m.trackStroke],
    ['indicator', m.indicatorStroke]
  ])
    extra.push({
      context,
      props: { size },
      state: 'default',
      part,
      property: 'strokeWidth',
      expected: want,
      observed: +value,
      passed: Math.abs(+value - want) < 0.002,
      note: 'Drawing of Spinner.svelte: stroke-width 2.5 in a 24-unit viewBox scaled to the size.'
    });
  extra.push({
    context,
    props: { size },
    state: 'default',
    part: 'indicator',
    property: 'strokeCap',
    expected: 'round',
    observed: m.cap.toLowerCase(),
    passed: m.cap === 'ROUND'
  });
}
const all = [...result, ...extra];
fs.mkdirSync('reports/components/spinner/figma', { recursive: true });
fs.writeFileSync('reports/components/spinner/figma/parity.json', JSON.stringify({ records: all }, null, 2) + '\n');
const failed = all.filter((r) => !r.passed);
console.log(
  JSON.stringify({
    records: all.length,
    failures: failed.length,
    justified: all.filter((r) => r.note && r.note.startsWith('Justified')).length,
    sample: failed.slice(0, 5)
  })
);
