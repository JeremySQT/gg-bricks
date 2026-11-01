// Mechanical Svelte bindings generated from a contract: enum types and defaults (contract.generated.ts) and the
// CSS custom-property bindings of every token role (tokens.generated.css). Children of a compound component
// (contract `children`) get their own types, defaults, selectors (`.ggb-<id>__<child>`) and variables
// (`--ggb-<id>-<child>-<role>`); a parameter that belongs to the parent selects on the root element.
import { cssVariable } from './tokens.ts';
import {
  expandCombinations,
  expectedRoleType,
  roleChild,
  roleName,
  templateOf,
  templateParameters
} from './contract.ts';
import { pascal } from './catalog.ts';
import { isEnum, type ChildContract, type Contract, type PropDecl, type RecordsDecl } from './types.ts';

const enumTypes = (prefix: string, props: Record<string, PropDecl>): string =>
  Object.entries(props)
    .filter(([, p]) => isEnum(p))
    .map(
      ([key, p]) =>
        `export type ${prefix}${pascal(key)} = ${(p as { values: string[] }).values.map((v) => JSON.stringify(v)).join(' | ')};`
    )
    .join('\n');

const recordTypes = (prefix: string, props: Record<string, PropDecl>): string =>
  Object.entries(props)
    .filter(([, p]) => 'type' in p && p.type === 'records')
    .map(([key, p]) => {
      const r = p as RecordsDecl;
      const fields = Object.entries(r.fields)
        .map(([f, t]) => `  ${f}${(r.required ?? []).includes(f) ? '' : '?'}: ${t};`)
        .join('\n');
      return `export interface ${prefix}${pascal(key)}Record {\n${fields}\n}`;
    })
    .join('\n');

const defaultsOf = (props: Record<string, PropDecl>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(props)
      .filter(([, p]) => 'default' in p)
      .map(([k, p]) => [k, (p as { default: unknown }).default])
  );

/** Enum types, record types and defaults for one contract (parent, then each child). */
export function generateTypes(contract: Contract, family = '<family>'): string {
  const name = pascal(contract.id);
  const records = recordTypes(name, contract.props);
  // Layout kept byte for byte from v1 for contracts without records or children (approved generated files).
  let out =
    `// Generated from foundations/components/${family}/${contract.id}/contract.json. Do not edit.\n` +
    enumTypes(name, contract.props) +
    (records ? `\n${records}` : '') +
    `\nexport const defaults = ${JSON.stringify(defaultsOf(contract.props), null, 2)} as const;\n`;
  const children = Object.entries(contract.children ?? {});
  for (const [child, decl] of children) {
    const prefix = name + pascal(child);
    for (const block of [enumTypes(prefix, decl.props), recordTypes(prefix, decl.props)])
      if (block) out += block + '\n';
  }
  if (children.length)
    out += `export const childDefaults = ${JSON.stringify(
      Object.fromEntries(children.map(([child, decl]) => [child, defaultsOf(decl.props)])),
      null,
      2
    )} as const;\n`;
  return out;
}

/**
 * CSS bindings for one contract. Enum *props* become data-attribute selectors (on the root for the parent's props,
 * on the child part for a child's); enum *states* become suffixes of the custom property, so handwritten CSS selects
 * the state (hover, pressed, loading…) and reads `--ggb-<id>[-<child>]-<role>[-<state>]`. Typography roles also bind
 * the letter-spacing and font-feature helpers that the font shorthand cannot carry; they are unset when the token
 * defines none, so handwritten CSS reads them with a fallback. Everything lives in the cascade layer `ggb`.
 */
export function generateCss(contract: Contract): string {
  const id = contract.id;
  const parentProps = Object.keys(contract.props);
  const blocks = new Map<string, string[]>();
  for (const [role, list] of Object.entries(expandCombinations(contract))) {
    const childName = roleChild(role);
    const child: ChildContract | undefined = childName ? contract.children?.[childName] : undefined;
    const childProps = child ? Object.keys(child.props) : [];
    const childStates = child ? Object.keys(child.states) : [];
    const params = templateParameters(templateOf(contract, role) ?? '');
    const onChild = params.filter((p) => childProps.includes(p));
    const onRoot = params.filter((p) => !childProps.includes(p) && !childStates.includes(p) && parentProps.includes(p));
    const stateParams = params.filter((p) => !onChild.includes(p) && !onRoot.includes(p));
    for (const { params: values, path } of list) {
      let selector = `.ggb-${id}` + onRoot.map((p) => `[data-${p}="${values[p]}"]`).join('');
      if (childName)
        selector += ` .ggb-${id}__${childName}` + onChild.map((p) => `[data-${p}="${values[p]}"]`).join('');
      const variable = [
        `--ggb-${id}`,
        ...(childName ? [childName] : []),
        roleName(role),
        ...stateParams.map((p) => values[p])
      ].join('-');
      if (!blocks.has(selector)) blocks.set(selector, []);
      blocks.get(selector)?.push(`  ${variable}: var(${cssVariable(path)});`);
      if (expectedRoleType(role) === 'typography')
        for (const helper of ['letterSpacing', 'fontFeatureSettings'])
          blocks.get(selector)?.push(`  ${variable}-${helper}: var(${cssVariable(`${path}.${helper}`)});`);
    }
  }
  // Every component stylesheet lives in the cascade layer `ggb`, so that any unlayered application rule wins over the
  // component's own declarations whatever its specificity (decision of 2026-10-31, audit).
  let css = `/* Generated token bindings from the ${id} contract. Do not edit. */\n@layer ggb {\n`;
  for (const [selector, lines] of blocks) css += `${selector} {\n${lines.join('\n')}\n}\n`;
  return css + '}\n';
}
