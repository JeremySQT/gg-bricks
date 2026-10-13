// Layered CSS emission. The stylesheet mirrors the source structure instead of
// resolving every brand × appearance × density combination:
//
//   :root, [data-ggb-brand]              base primitives, common and component tokens, then the default
//                                        appearance and density roles (foundations/tokens/config.json defaults)
//   [data-ggb-appearance="<a>"]          base appearance roles (values reference primitives with var())
//   [data-ggb-density="<d>"]             base density roles
//   [data-ggb-brand="<b>"]               brand primitive/common/component overrides (sparse)
//   [data-ggb-brand="<b>"][data-ggb-appearance="<a>"]  brand appearance overrides (sparse); for the default
//                                        appearance also [data-ggb-brand="<b>"]:not([data-ggb-appearance])
//   [data-ggb-brand="<b>"][data-ggb-density="<d>"]     brand density overrides (sparse), same for the default
//
// Cascade order reproduces the source precedence (base layers, then brand layers); the default appearance
// and density blocks come first on their axis so that an explicit attribute on the same element wins.
// Without any attribute the document gets base, the default appearance and the default density.
//
// Aliases become var() references, and a custom property substitutes its var() references on the element
// that declares it, then its computed value is inherited. So an attribute can be overridden alone in a
// subtree when its layer only reads layers that are constant below: appearance and density (they read the
// palette and the primitives). A brand switch in a subtree changes the palette, which the appearance
// roles computed on an ancestor do not re-read; the brand element re-declares the default appearance and
// density instead, so a subtree that switches brand must restate data-ggb-appearance and
// data-ggb-density on the same element to keep them. tests/tokens.test.ts models this.
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
      if (ty.letterSpacing) lines.push(`  ${cssVariable(p + '.letterSpacing')}: ${dim(ty.letterSpacing)};`);
      if (ty.fontFeatures?.length)
        lines.push(
          `  ${cssVariable(p + '.fontFeatureSettings')}: ${ty.fontFeatures.map((f) => JSON.stringify(f)).join(', ')};`
        );
    }
  }
  return lines;
}

const block = (selector: string, lines: string[]): string =>
  lines.length ? `${selector} {\n${lines.join('\n')}\n}\n` : '';

/** Selector list applying a base axis block: the default value also applies where no attribute selects one. */
const axisSelector = (attribute: string, value: string, isDefault: boolean): string =>
  isDefault ? `:root, [data-ggb-brand], [${attribute}="${value}"]` : `[${attribute}="${value}"]`;

/** Selector list applying a brand's sparse override of one axis value. */
const brandAxisSelector = (brand: string, attribute: string, value: string, isDefault: boolean): string =>
  isDefault
    ? `[data-ggb-brand="${brand}"]:not([${attribute}]), [data-ggb-brand="${brand}"][${attribute}="${value}"]`
    : `[data-ggb-brand="${brand}"][${attribute}="${value}"]`;

/** Values of an axis with the default first, so that explicit attributes on the same element win by order. */
const defaultFirst = (values: string[], fallback: string): string[] => [
  fallback,
  ...values.filter((v) => v !== fallback)
];

export function buildLayeredCss(cfg: Config): string {
  const t = paths.tokens;
  const appearances = defaultFirst(cfg.appearances, cfg.defaults.appearance);
  const densities = defaultFirst(cfg.densities, cfg.defaults.density);
  let css = '/* Generated from foundations/tokens by tooling/build-tokens.ts. Do not edit. */\n';
  css +=
    `/* Set data-ggb-brand, data-ggb-appearance and data-ggb-density on one ancestor; without them the document is base, ${cfg.defaults.appearance} and ${cfg.defaults.density}. */\n` +
    '/* A subtree may override data-ggb-appearance or data-ggb-density alone; a subtree that switches data-ggb-brand gets the defaults unless it restates the other two on the same element. */\n';
  const base = (name: string) => `${t}/base/semantic/${name}.tokens.json`;
  css += block(':root, [data-ggb-brand]', [
    ...tokenFiles(`${t}/base/primitives`).flatMap(declarations),
    ...(existsSync(abs(base('common'))) ? declarations(base('common')) : []),
    ...tokenFiles(`${t}/base/components`).flatMap(declarations)
  ]);
  for (const a of appearances)
    css += block(
      axisSelector('data-ggb-appearance', a, a === cfg.defaults.appearance),
      declarations(base(`appearance.${a}`))
    );
  for (const d of densities)
    css += block(axisSelector('data-ggb-density', d, d === cfg.defaults.density), declarations(base(`density.${d}`)));
  for (const b of cfg.brands) {
    if (b === 'base') continue;
    const brand = (name: string) => `${t}/${b}/semantic/${name}.tokens.json`;
    css += block(`[data-ggb-brand="${b}"]`, [
      ...tokenFiles(`${t}/${b}/primitives`).flatMap(declarations),
      ...(existsSync(abs(brand('common'))) ? declarations(brand('common')) : []),
      ...tokenFiles(`${t}/${b}/components`).flatMap(declarations)
    ]);
    for (const a of appearances)
      if (existsSync(abs(brand(`appearance.${a}`))))
        css += block(
          brandAxisSelector(b, 'data-ggb-appearance', a, a === cfg.defaults.appearance),
          declarations(brand(`appearance.${a}`))
        );
    for (const d of densities)
      if (existsSync(abs(brand(`density.${d}`))))
        css += block(
          brandAxisSelector(b, 'data-ggb-density', d, d === cfg.defaults.density),
          declarations(brand(`density.${d}`))
        );
  }
  return css;
}
