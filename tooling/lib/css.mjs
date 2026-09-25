// Layered CSS emission. The stylesheet mirrors the source structure instead of
// resolving every brand × appearance × density combination:
//
//   [data-ggb-brand]                     base primitives, common and component tokens
//   [data-ggb-appearance="<a>"]          base appearance roles (values reference primitives with var())
//   [data-ggb-density="<d>"]             base density roles
//   [data-ggb-brand="<b>"]               brand primitive/common/component overrides (sparse)
//   [data-ggb-brand="<b>"][data-ggb-appearance="<a>"]  brand appearance overrides (sparse)
//   [data-ggb-brand="<b>"][data-ggb-density="<d>"]     brand density overrides (sparse)
//
// Cascade order reproduces the source precedence (base layers, then brand layers).
// Aliases become var() references, so each attribute can be overridden alone in a subtree.
import { existsSync, readdirSync } from 'node:fs';
import { abs, paths, readJson } from './paths.mjs';
import { flatten, cssVariable } from './tokens.mjs';

const isAlias = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
const ref = (v) => `var(${cssVariable(v.slice(1, -1))})`;
const num = (v) => (isAlias(v) ? ref(v) : String(v));
const dim = (v) => (isAlias(v) ? ref(v) : `${v.value}${v.unit}`);
const color = (v) =>
  isAlias(v) ? ref(v) : `rgb(${v.components.map((c) => Math.round(c * 255)).join(' ')} / ${v.alpha ?? 1})`;
const family = (v) => (isAlias(v) ? ref(v) : v.map((x) => JSON.stringify(x)).join(', '));

/** Render a source token (possibly holding aliases) as a CSS value. */
export function cssSourceValue(t) {
  const v = t.$value;
  if (isAlias(v)) return ref(v);
  switch (t.$type) {
    case 'color':
      return color(v);
    case 'dimension':
      return dim(v);
    case 'duration':
      return dim(v);
    case 'fontFamily':
      return family(v);
    case 'fontWeight':
    case 'number':
      return num(v);
    case 'cubicBezier':
      return `cubic-bezier(${v.map(num).join(', ')})`;
    case 'typography':
      return `${num(v.fontWeight)} ${dim(v.fontSize)}/${num(v.lineHeight)} ${family(v.fontFamily)}`;
    case 'shadow': {
      const list = Array.isArray(v) ? v : [v];
      return list
        .map(
          (s) =>
            `${s.inset ? 'inset ' : ''}${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${color(s.color)}`
        )
        .join(', ');
    }
    default:
      throw Error('Unsupported CSS type: ' + t.$type);
  }
}

/** Declarations for one source file: every token plus typography helpers. */
function declarations(file) {
  const lines = [];
  for (const [p, t] of Object.entries(flatten(readJson(file)))) {
    lines.push(`  ${cssVariable(p)}: ${cssSourceValue(t)};`);
    if (t.$type === 'typography' && !isAlias(t.$value)) {
      lines.push(`  ${cssVariable(p + '.fontSize')}: ${dim(t.$value.fontSize)};`);
      lines.push(`  ${cssVariable(p + '.lineHeight')}: calc(${num(t.$value.lineHeight)} * ${dim(t.$value.fontSize)});`);
    }
  }
  return lines;
}

const files = (dir) =>
  existsSync(abs(dir))
    ? readdirSync(abs(dir))
        .filter((f) => f.endsWith('.tokens.json'))
        .sort()
        .map((f) => dir + '/' + f)
    : [];
const block = (selector, lines) => (lines.length ? `${selector} {\n${lines.join('\n')}\n}\n` : '');

export function buildLayeredCss(cfg) {
  const t = paths.tokens;
  let css = '/* Generated from foundations/tokens by tooling/build-tokens.mjs. Do not edit. */\n';
  css +=
    '/* Set data-ggb-brand, data-ggb-appearance and data-ggb-density on one ancestor; any of them can be overridden alone in a subtree. */\n';
  const base = (name) => `${t}/base/semantic/${name}.tokens.json`;
  css += block('[data-ggb-brand]', [
    ...files(`${t}/base/primitives`).flatMap(declarations),
    ...(existsSync(abs(base('common'))) ? declarations(base('common')) : []),
    ...files(`${t}/base/components`).flatMap(declarations)
  ]);
  for (const a of cfg.appearances) css += block(`[data-ggb-appearance="${a}"]`, declarations(base(`appearance.${a}`)));
  for (const d of cfg.densities) css += block(`[data-ggb-density="${d}"]`, declarations(base(`density.${d}`)));
  for (const b of cfg.brands) {
    if (b === 'base') continue;
    const brand = (name) => `${t}/${b}/semantic/${name}.tokens.json`;
    css += block(`[data-ggb-brand="${b}"]`, [
      ...files(`${t}/${b}/primitives`).flatMap(declarations),
      ...(existsSync(abs(brand('common'))) ? declarations(brand('common')) : []),
      ...files(`${t}/${b}/components`).flatMap(declarations)
    ]);
    for (const a of cfg.appearances)
      if (existsSync(abs(brand(`appearance.${a}`))))
        css += block(`[data-ggb-brand="${b}"][data-ggb-appearance="${a}"]`, declarations(brand(`appearance.${a}`)));
    for (const d of cfg.densities)
      if (existsSync(abs(brand(`density.${d}`))))
        css += block(`[data-ggb-brand="${b}"][data-ggb-density="${d}"]`, declarations(brand(`density.${d}`)));
  }
  return css;
}
