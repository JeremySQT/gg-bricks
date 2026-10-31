// Generate the Svelte adapter's mechanical artifacts from every component contract:
// enum types + defaults, CSS custom-property bindings, and the consumer copies
// (tokens.css, contracts/, docs/) shipped inside packages/svelte. Implementations live in packages/svelte/src/components/<id>/.
import fs from 'node:fs';
import { abs, paths, write, readJson, readText, exists } from './lib/paths.ts';
import { cssVariable } from './lib/tokens.ts';
import { expandCombinations, expectedRoleType, templateParameters } from './lib/contract.ts';
import { listComponents, pascal } from './lib/catalog.ts';
import { isEnum, type Contract } from './lib/types.ts';

interface DocIndex {
  package: string;
  version: string;
  components: { id: string; documentation: string; [key: string]: unknown }[];
  foundations?: { id: string; documentation: string; [key: string]: unknown }[];
}

const pkg = paths.sveltePackage;
const generated: string[] = [];

/** Enum types and defaults for one contract. */
export function generateTypes(contract: Contract, family = '<family>'): string {
  const name = pascal(contract.id);
  const enums = Object.entries(contract.props).filter(([, p]) => isEnum(p));
  const defaults = Object.fromEntries(
    Object.entries(contract.props)
      .filter(([, p]) => 'default' in p)
      .map(([k, p]) => [k, (p as { default: unknown }).default])
  );
  return (
    `// Generated from foundations/components/${family}/${contract.id}/contract.json. Do not edit.\n` +
    enums
      .map(
        ([key, p]) =>
          `export type ${name}${pascal(key)} = ${(p as { values: string[] }).values.map((v) => JSON.stringify(v)).join(' | ')};`
      )
      .join('\n') +
    `\nexport const defaults = ${JSON.stringify(defaults, null, 2)} as const;\n`
  );
}

/**
 * CSS bindings for one contract. Enum *props* become data-attribute selectors;
 * enum *states* become suffixes of the custom property, so handwritten CSS
 * selects the state (hover, pressed, loading…) and reads `--ggb-<id>-<role>-<state>`.
 * Typography roles also bind the letter-spacing and font-feature helpers that the
 * font shorthand cannot carry (`--ggb-<id>-<role>-letterSpacing`…); they are unset
 * when the token defines none, so handwritten CSS reads them with a fallback.
 */
export function generateCss(contract: Contract): string {
  const id = contract.id;
  const props = Object.keys(contract.props);
  const blocks = new Map<string, string[]>();
  for (const [role, list] of Object.entries(expandCombinations(contract))) {
    const params = templateParameters(contract.tokens[role]);
    const propParams = params.filter((p) => props.includes(p));
    const stateParams = params.filter((p) => !props.includes(p));
    for (const { params: values, path } of list) {
      const selector = `.ggb-${id}` + propParams.map((p) => `[data-${p}="${values[p]}"]`).join('');
      const variable = [`--ggb-${id}-${role}`, ...stateParams.map((p) => values[p])].join('-');
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

const components = listComponents();
fs.rmSync(abs(pkg, 'contracts'), { recursive: true, force: true }); // stale consumer copies never survive a rebuild
for (const c of components) {
  const dir = `${pkg}/src/components/${c.id}`;
  if (!exists(dir)) continue; // Contract without an implementation yet: nothing to generate.
  write(`${dir}/contract.generated.ts`, generateTypes(c.contract, c.family));
  write(`${dir}/tokens.generated.css`, generateCss(c.contract));
  write(`${pkg}/contracts/${c.id}.json`, c.contract);
  generated.push(c.id);
}

// Consumer copies. The maintained sources stay in documentation/ and packages/tokens.
fs.copyFileSync(abs(paths.tokensPackage, 'tokens.css'), abs(pkg, 'tokens.css'));
fs.rmSync(abs(pkg, 'docs'), { recursive: true, force: true });
fs.mkdirSync(abs(pkg, 'docs'), { recursive: true });
const index = readJson<DocIndex>(`${paths.documentation}/index.json`);
const packageJson = readJson<{ name: string; version: string }>(`${pkg}/package.json`);
if (index.package !== packageJson.name || index.version !== packageJson.version)
  throw Error(`documentation/index.json must name ${packageJson.name}@${packageJson.version}`);
for (const entry of index.components) {
  if (!components.some((c) => c.id === entry.id))
    throw Error(`documentation/index.json lists unknown component ${entry.id}`);
  if (!generated.includes(entry.id))
    throw Error(
      `documentation/index.json lists ${entry.id} but packages/svelte/src/components/${entry.id} does not exist`
    );
  const doc = `${paths.documentation}/components/${entry.documentation}`;
  if (!exists(doc)) throw Error(`Missing documentation page ${doc}`);
  const text = readText(doc);
  // The page's level-2 headings are exactly the sections the index announces, in order.
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const sections = (entry.sections as string[] | undefined) ?? [];
  if (headings.join('|') !== sections.join('|'))
    throw Error(`${doc} has sections ${headings.join(', ')}; documentation/index.json lists ${sections.join(', ')}`);
  write(`${pkg}/docs/${entry.documentation}`, text);
}
// Foundations guides: copied under docs/foundations/; every token path they name in inline code must exist
// (a path may be a group prefix such as `color.status`), so a renamed role cannot leave a stale guide.
const tokenPaths = Object.keys(
  readJson<Record<string, unknown>>(`${paths.tokensPackage}/resolved/base-light-standard.json`)
);
const rolePath =
  /`((?:color|space|size|radius|border|focus|shadow|layer|opacity|motion|typography|primitive)\.[A-Za-z0-9.-]*[A-Za-z0-9])`/g;
for (const entry of index.foundations ?? []) {
  const doc = `${paths.documentation}/${entry.documentation}`;
  if (!exists(doc)) throw Error(`Missing foundations page ${doc}`);
  const text = readText(doc);
  for (const [, path] of text.matchAll(rolePath)) {
    if (!tokenPaths.some((t) => t === path || t.startsWith(path + '.')))
      throw Error(`${doc} names the token ${path}, which does not exist`);
  }
  write(`${pkg}/docs/${entry.documentation}`, text);
}
// The installed copy points at the contracts shipped in the package, not at the repository sources.
write(`${pkg}/docs/index.json`, {
  ...index,
  components: index.components.map((entry) => ({ ...entry, contract: `contracts/${entry.id}.json` }))
});
write(`${pkg}/docs/AGENTS.md`, readText(`${paths.documentation}/AGENTS.md`));
const documented = new Set(index.components.map((e) => e.id));
const undocumented = generated.filter((id) => !documented.has(id));
console.log(JSON.stringify({ generated, undocumentedImplementations: undocumented }));
