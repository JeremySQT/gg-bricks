// Button slot geometry check (use_figma body), 2026-10-12: leading and trailing icon or counter position against
// the contract spacing rule (edge + slot, slot + label, label + slot, slot + edge; icons vertically centered at the
// icon size), in every brand × appearance × density and size. Save the returned `all` object for the parity report.
figma.skipInvisibleInstanceChildren = false;
const page = await figma.getNodeByIdAsync('144:2');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.name.startsWith('_parity'))) n.remove();
const set = await figma.getNodeByIdAsync('48:1586');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n || c.name === 'Foundations · ' + n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const vars = await figma.variables.getLocalVariablesAsync();
const V = (n) => vars.find((v) => v.name === n);
const r2 = (x) => Math.round(x * 100) / 100;
const out = {};
let fails = 0,
  checks = 0;
for (const b of ['base', 'brick', 'orchid'])
  for (const a of ['light', 'dark'])
    for (const d of ['compact', 'standard', 'comfortable']) {
      const ctx = `${b}-${a}-${d}`;
      const f = figma.createAutoLayout('VERTICAL', { name: '_parity slots ' + ctx, itemSpacing: 8 });
      f.x = -4000;
      f.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), b));
      f.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), a));
      f.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
      try {
        for (const s of ['sm', 'md', 'lg'])
          for (const trail of ['icon', 'counter']) {
            const i = set.children
              .find((c) => c.name === `Intent=accent, Appearance=solid, Size=${s}, State=default`)
              .createInstance();
            f.appendChild(i);
            i.setProperties({ 'Label#48:360': 'Download', 'Show leading#48:361': true, 'Show trailing#76:0': true });
            const t = i.exposedInstances.find((e) => e.name === 'Trailing item');
            if (trail === 'counter') t.setProperties({ Type: 'Counter' });
            const edge = V(`space/control/edge-inline/${s}`).resolveForConsumer(i).value,
              lab = V(`space/control/label-inline/${s}`).resolveForConsumer(i).value,
              slot = V(`space/control/slot-inline/${s}`).resolveForConsumer(i).value,
              icon = V(`size/icon/${s}`).resolveForConsumer(i).value;
            const bb = (n) => n.absoluteBoundingBox;
            const c = bb(i.findOne((n) => n.name === 'Container'));
            const lead = bb(i.findOne((n) => n.name === 'Leading').findOne((n) => n.name === 'Drawing box'));
            const text = bb(i.findOne((n) => n.name === 'Label'));
            const tr =
              trail === 'icon'
                ? bb(t.findOne((n) => n.name === 'Drawing box'))
                : bb(t.findOne((n) => n.name === 'Counter'));
            const leadIcon = bb(i.findOne((n) => n.name === 'Leading icon'));
            const trIcon = trail === 'icon' ? bb(t.findOne((n) => n.name === 'Icon')) : null;
            // Label layer includes its own margin (labelInline) on both sides, so the text box starts labelInline inside it.
            const got = [
              r2(lead.x - c.x),
              r2(text.x + lab - (lead.x + lead.width)),
              r2(tr.x - (text.x + text.width - lab)),
              r2(c.x + c.width - (tr.x + tr.width))
            ];
            const exp = [edge + slot, slot + lab, lab + slot, slot + edge];
            const vert = [
              r2(leadIcon.y - c.y),
              r2(c.y + c.height - leadIcon.y - leadIcon.height),
              r2(leadIcon.height),
              ...(trIcon
                ? [r2(trIcon.y - c.y), r2(c.y + c.height - trIcon.y - trIcon.height), r2(trIcon.height)]
                : [r2(tr.y - c.y), r2(c.y + c.height - tr.y - tr.height)])
            ];
            const vexp = [
              (c.height - icon) / 2,
              (c.height - icon) / 2,
              icon,
              ...(trIcon
                ? [(c.height - icon) / 2, (c.height - icon) / 2, icon]
                : [(c.height - tr.height) / 2, (c.height - tr.height) / 2])
            ];
            const ok =
              got.every((g, k) => Math.abs(g - exp[k]) < 0.01) && vert.every((g, k) => Math.abs(g - vexp[k]) < 0.01);
            checks += got.length + vert.length;
            if (!ok) fails++;
            out[`${ctx}|${s}|${trail}`] =
              `${got.join(',')}|${exp.join(',')}|${vert.join(',')}|${vexp.map(r2).join(',')}|${ok ? 'ok' : 'FAIL'}`;
          }
      } finally {
        f.remove();
      }
    }
return {
  checks,
  fails,
  sample: Object.fromEntries(
    Object.entries(out).filter(([k]) => k.startsWith('base-light-standard') || k.includes('FAIL'))
  ),
  all: out
};
