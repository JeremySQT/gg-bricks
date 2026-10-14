// Shortcut Figma parity measurement (use_figma body), 2026-10-14. One run per brand (set BRAND).
// Instantiates the 12 Shortcut variants (Appearance × Size × Platform) in a temporary frame per appearance ×
// density context with explicit Brand/Appearance/Density modes, in the three-key form the browser measured
// (Mod+Shift+K: ⇧ ⌘ K on Mac, Ctrl + Shift + K on Other), resolves the bound variables with resolveForConsumer,
// reads the laid-out geometry of the first key and the first separator, removes the frame and returns
// { "<context>|<appearance>|<size>|<platform>": "<fields>" }.
// Fields: opacity (effective/resolved)|gap|fontSize|fontStyle|lineHeight|letterSpacing|textColor|keyFill|keyStroke|
// strokeWidth|radius|paddingLeft|paddingTop|minWidth|keyWidth|keyHeight|separatorColor|separatorText|rootWidth|rootHeight.
// IDs (page 149:1569, set 151:110, property key Key#149:20) come from reports/components/shortcut/figma/ledger.json.
// Save each returned object as <brand>.json in one folder, then run shortcut-parity-report.mjs <folder>.
figma.skipInvisibleInstanceChildren = false;
const BRAND = 'base';
const page = await figma.getNodeByIdAsync('149:1569');
await figma.setCurrentPageAsync(page);
for (const n of page.children.filter((n) => n.type === 'FRAME' && n.name.startsWith('_parity ' + BRAND))) n.remove();
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
const set = await figma.getNodeByIdAsync('151:110');
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = (n) => cols.find((c) => c.name === n);
const mode = (c, n) => c.modes.find((m) => m.name === n).modeId;
const defs = set.componentPropertyDefinitions;
const propKey = (name) => Object.keys(defs).find((k) => k.split('#')[0] === name);
const SHOW3 = propKey('Show key 3');
const KEY = 'Key#149:20';
const cache = {};
const varOf = async (id) => cache[id] || (cache[id] = await figma.variables.getVariableByIdAsync(id));
const res = async (node, field) => {
  const b = node.boundVariables && node.boundVariables[field];
  const ref = Array.isArray(b) ? b[0] : b;
  if (!ref) return '';
  return (await varOf(ref.id)).resolveForConsumer(node).value;
};
const hex = (c) =>
  [c.r, c.g, c.b, c.a === undefined ? 1 : c.a]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
const paint = async (node, kind) => {
  const p = node[kind] && node[kind][0];
  if (!p) return '';
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  if (!id) return 'literal';
  return hex((await varOf(id)).resolveForConsumer(node).value);
};
const r2 = (x) => Math.round(x * 1000) / 1000;
const out = {};
const A = ['Plain', 'Keycap'],
  S = ['sm', 'md', 'lg'],
  P = ['Mac', 'Other'];
const TEXTS = { Mac: ['⇧', '⌘', 'K'], Other: ['Ctrl', 'Shift', 'K'] };
for (const ap of ['light', 'dark'])
  for (const d of ['compact', 'standard', 'comfortable']) {
    const ctx = `${BRAND}-${ap}-${d}`;
    const frame = figma.createAutoLayout('VERTICAL', { name: '_parity ' + ctx, itemSpacing: 8 });
    frame.x = -4000;
    frame.y = 0;
    page.appendChild(frame);
    frame.setExplicitVariableModeForCollection(col('Brand'), mode(col('Brand'), BRAND));
    frame.setExplicitVariableModeForCollection(col('Appearance'), mode(col('Appearance'), ap));
    frame.setExplicitVariableModeForCollection(col('Density'), mode(col('Density'), d));
    try {
      for (const a of A)
        for (const s of S)
          for (const p of P) {
            const v = set.children.find((c) => c.name === `Appearance=${a}, Size=${s}, Platform=${p}`);
            const inst = v.createInstance();
            frame.appendChild(inst);
            inst.setProperties({ [SHOW3]: true });
            TEXTS[p].forEach((t, i) =>
              inst.findOne((n) => n.type === 'INSTANCE' && n.name === `Key ${i + 1}`).setProperties({ [KEY]: t })
            );
            const key = inst.findOne((n) => n.type === 'INSTANCE' && n.name === 'Key 1');
            const text = key.findOne((n) => n.type === 'TEXT');
            const sep = inst.findOne((n) => n.type === 'INSTANCE' && n.name === 'Separator 1');
            const sepText = sep && sep.findOne((n) => n.type === 'TEXT');
            const op = await res(inst, 'opacity');
            const gap = await res(inst, 'itemSpacing');
            out[`${ctx}|${a.toLowerCase()}|${s}|${p.toLowerCase()}`] = [
              // Effective opacity / resolved value of the bound variable (Figma reads it as a percentage).
              `${r2(inst.opacity)}/${op === '' ? '' : op}`,
              gap === '' ? inst.itemSpacing : gap,
              await res(text, 'fontSize'),
              text.fontName.style,
              r2(await res(text, 'lineHeight')),
              await res(text, 'letterSpacing'),
              await paint(text, 'fills'),
              await paint(key, 'fills'),
              key.strokes.length ? await paint(key, 'strokes') : '',
              key.strokes.length ? await res(key, 'strokeTopWeight') : 0,
              (await res(key, 'topLeftRadius')) || key.topLeftRadius,
              (await res(key, 'paddingLeft')) || key.paddingLeft,
              key.paddingTop,
              key.minWidth === null ? 'none' : await res(key, 'minWidth'),
              r2(key.width),
              r2(key.height),
              sepText ? await paint(sepText, 'fills') : '',
              sepText ? sepText.characters : '',
              r2(inst.width),
              r2(inst.height)
            ].join('|');
          }
    } finally {
      frame.remove();
    }
  }
return out;
