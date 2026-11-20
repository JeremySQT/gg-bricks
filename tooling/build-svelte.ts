// Generate the Svelte adapter's mechanical artifacts from every component contract:
// enum types + defaults and CSS custom-property bindings (tooling/lib/bindings.ts), and the consumer copies
// (tokens.css, contracts/, docs/, LICENSE, THIRD-PARTY-NOTICES.md) shipped inside packages/svelte. Implementations live in packages/svelte/src/components/<id>/.
import fs from 'node:fs';
import { abs, copyNotices, paths, write, readJson, readText, exists } from './lib/paths.ts';
import { listComponents } from './lib/catalog.ts';
import { generateCss, generateTypes } from './lib/bindings.ts';

interface DocIndex {
  package: string;
  version: string;
  components: { id: string; documentation: string; [key: string]: unknown }[];
  foundations?: { id: string; documentation: string; [key: string]: unknown }[];
}

const pkg = paths.sveltePackage;
const generated: string[] = [];

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

// Copy rule (decisions.md, shared code): a component folder imports only its own files, the folders of the
// components its status declares under `dependencies` and the `src/lib/<module>` modules declared as `lib/<module>`.
const importPattern = /(?:import|from)\s+['"](\.\.\/[^'"]+)['"]/g;
for (const c of components) {
  const dir = `${pkg}/src/components/${c.id}`;
  if (!exists(dir)) continue;
  const declared = new Set(c.status?.dependencies ?? []);
  for (const file of fs.readdirSync(abs(dir))) {
    if (!/\.(svelte|ts|css)$/.test(file) || file.endsWith('.generated.ts')) continue;
    for (const [, target] of readText(`${dir}/${file}`).matchAll(importPattern)) {
      const lib = /^\.\.\/\.\.\/lib\/([^/]+)/.exec(target);
      const component = /^\.\.\/([^./][^/]*)\//.exec(target);
      const needed = lib ? `lib/${lib[1]}` : component ? component[1] : null;
      if (!needed) throw Error(`${dir}/${file} imports ${target}, outside its folder and src/lib`);
      if (!declared.has(needed))
        throw Error(`${dir}/${file} imports ${target}: declare ${needed} under dependencies in the ${c.id} status`);
    }
  }
}

// Consumer copies. The maintained sources stay in documentation/ and packages/tokens.
fs.copyFileSync(abs(paths.tokensPackage, 'tokens.css'), abs(pkg, 'tokens.css'));
copyNotices(pkg); // components carry Phosphor paths: the package ships the license and the third-party notices
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
