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
import { existsSync } from 'node:fs';
import { abs, paths, readJson } from './paths.ts';
import { flatten, cssVariable, isAlias, tokenFiles } from './tokens.ts';
import type { Color, Config, Dimension, Shadow, SourceToken, TokenGroup, Typography } from './types.ts';

const ref = (v: string): string => `var(${cssVariable(v.slice(1, -1))})`;
const num = (v: unknown): string => (isAlias(v) ? ref(v) : String(v));
const dim = (v: unknown): string => (isAlias(v) ? ref(v) : `${(v as Dimension).value}${(v as Dimension).unit}`);
const color = (v: unknown): string =>
  isAlias(v)
    ? ref(v)
    : `rgb(${(v as Color).components.map((c) => Math.round(c * 255)).join(' ')} / ${(v as Color).alpha ?? 1})`;
const family = (v: unknown): string => (isAlias(v) ? ref(v) : (v as string[]).map((x) => JSON.stringify(x)).join(', '));

/** Render a source token (possibly holding aliases) as a CSS value. */
export function cssSourceValue(t: SourceToken): string {
  const v = t.$value;
  if (isAlias(v)) return ref(v);
  switch (t.$type) {
    case 'color':
      return color(v);
    case 'dimension':
    case 'duration':
      return dim(v);
    case 'fontFamily':
      return family(v);
    case 'fontWeight':
    case 'number':
      return num(v);
    case 'cubicBezier':
      return `cubic-bezier(${(v as unknown[]).map(num).join(', ')})`;
    case 'typography': {
      const ty = v as Typography;
      return `${num(ty.fontWeight)} ${dim(ty.fontSize)}/${num(ty.lineHeight)} ${family(ty.fontFamily)}`;
    }
    case 'shadow': {
      const list = (Array.isArray(v) ? v : [v]) as Shadow[];
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
function declarations(file: string): string[] {
  const lines: string[] = [];
  for (const [p, t] of Object.entries(flatten(readJson<TokenGroup>(file)))) {
    lines.push(`  ${cssVariable(p)}: ${cssSourceValue(t)};`);
    if (t.$type === 'typography' && !isAlias(t.$value)) {
      const ty = t.$value as Typography;
      lines.push(`  ${cssVariable(p + '.fontSize')}: ${dim(ty.fontSize)};`);
      lines.push(`  ${cssVariable(p + '.lineHeight')}: calc(${num(ty.lineHeight)} * ${dim(ty.fontSize)});`);
    }
  }
  return lines;
}

const block = (selector: string, lines: string[]): string =>
  lines.length ? `${selector} {\n${lines.join('\n')}\n}\n` : '';

export function buildLayeredCss(cfg: Config): string {
  const t = paths.tokens;
  let css = '/* Generated from foundations/tokens by tooling/build-tokens.ts. Do not edit. */\n';
  css +=
    '/* Set data-ggb-brand, data-ggb-appearance and data-ggb-density on one ancestor; any of them can be overridden alone in a subtree. */\n';
  const base = (name: string) => `${t}/base/semantic/${name}.tokens.json`;
  css += block('[data-ggb-brand]', [
    ...tokenFiles(`${t}/base/primitives`).flatMap(declarations),
    ...(existsSync(abs(base('common'))) ? declarations(base('common')) : []),
    ...tokenFiles(`${t}/base/components`).flatMap(declarations)
  ]);
  for (const a of cfg.appearances) css += block(`[data-ggb-appearance="${a}"]`, declarations(base(`appearance.${a}`)));
  for (const d of cfg.densities) css += block(`[data-ggb-density="${d}"]`, declarations(base(`density.${d}`)));
  for (const b of cfg.brands) {
    if (b === 'base') continue;
    const brand = (name: string) => `${t}/${b}/semantic/${name}.tokens.json`;
    css += block(`[data-ggb-brand="${b}"]`, [
      ...tokenFiles(`${t}/${b}/primitives`).flatMap(declarations),
      ...(existsSync(abs(brand('common'))) ? declarations(brand('common')) : []),
      ...tokenFiles(`${t}/${b}/components`).flatMap(declarations)
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
