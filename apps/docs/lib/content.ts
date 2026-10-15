// Generates the component pages of the site from the maintained sources. For every entry of
// documentation/index.json it writes src/content/docs/components/<id>.mdx: the Markdown page without
// its title, each ```svelte live``` block compiled into a Svelte island rendered above its code, and a
// "Contract and evidence" section built from the contract, the status file and the reports. For every
// foundations entry it writes src/content/docs/foundations/<id>.mdx, replacing each `<!-- site:… -->` marker
// with a block of token tables or previews (see generateFoundationPages).
// Everything written here is ignored by git and rebuilt on every dev start and build.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import type { Code, Heading, PhrasingContent, Root, RootContent, Table, TableCell } from 'mdast';

interface IndexEntry {
  id: string;
  import: string;
  from: string;
  purpose: string;
  documentation: string;
  contract: string;
}
interface ContractProp {
  type?: string;
  values?: string[];
  default?: unknown;
  required?: boolean;
  bindable?: boolean;
  min?: number;
  max?: number;
}
interface Contract {
  id: string;
  props?: Record<string, ContractProp>;
  parts?: Record<string, { accepts?: string[]; max?: number }>;
  states?: Record<string, ContractProp>;
  events?: Record<string, { when: string }>;
  tokens?: Record<string, string>;
  rules?: string[];
}
interface Approval {
  provenance?: string;
}
interface Status {
  family: string;
  wave: number;
  phase: string;
  approvals?: Record<string, Approval | null>;
  checks?: { kind: string; result: string; date?: string; command?: string }[];
}
interface ContrastRecord {
  context: string;
  role: string;
  ratio: number;
  minimum: number | null;
  passed: boolean;
}

export interface ComponentPage {
  id: string;
  title: string;
  family: string;
  purpose: string;
  slug: string;
}

const LIVE_EXPORTS_MODULE = '@ggbrick/svelte';

/**
 * "Edit page" links open the source on GitHub. On main, GitHub's editor proposes a branch and a pull request,
 * so a typo fix follows the usual review path. Generated pages link to their Markdown source, not to the MDX.
 */
export const EDIT_BASE = 'https://github.com/JeremySQT/design-system/edit/main/';

const docsRoot = resolve(import.meta.dirname, '..');
const repoRoot = resolve(docsRoot, '../..');
const pagesDir = join(docsRoot, 'src/content/docs/components');
const foundationsDir = join(docsRoot, 'src/content/docs/foundations');
const foundationBlocksDir = join(docsRoot, 'src/generated/foundations');
const liveDir = join(docsRoot, 'src/generated/live');
const figmaDir = join(docsRoot, 'public/generated/figma');

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const posix = (path: string) => path.split('\\').join('/');

/** The documentation index, the source of the component list and sidebar. */
export function readComponents(): ComponentPage[] {
  const index = readJson<{ components: IndexEntry[] }>(join(repoRoot, 'documentation/index.json'));
  return index.components.map((entry) => {
    const status = readJson<Status>(join(repoRoot, dirname(entry.contract), 'status.json'));
    const markdown = readFileSync(join(repoRoot, 'documentation/components', entry.documentation), 'utf8');
    const title = /^# (.+)$/m.exec(markdown)?.[1] ?? entry.import;
    return { id: entry.id, title, family: status.family, purpose: entry.purpose, slug: `components/${entry.id}` };
  });
}

/** Files and folders the generator reads: the dev server regenerates when one of them changes. */
export const watchedSources = [
  'documentation',
  'foundations/components',
  'reports/components',
  'examples/icon/glyphs.ts'
].map((p) => join(repoRoot, p));

export function generateComponentPages(): ComponentPage[] {
  const index = readJson<{ components: IndexEntry[] }>(join(repoRoot, 'documentation/index.json'));
  const exportsList = index.components.map((c) => c.import).sort();
  for (const dir of [pagesDir, liveDir, figmaDir]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  const pages = readComponents();
  for (const entry of index.components) {
    const page = pages.find((p) => p.id === entry.id)!;
    writeFileSync(join(pagesDir, `${entry.id}.mdx`), renderPage(entry, page, exportsList));
  }
  writeFileSync(join(pagesDir, 'index.mdx'), renderOverview(pages));
  return pages;
}

const parse = (markdown: string) => unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
const stringify = (tree: Root) =>
  unified()
    .use(remarkStringify, { bullet: '-', emphasis: '_', fences: true, rule: '-' })
    .use(remarkGfm)
    .use(remarkMdx)
    .stringify(tree);

function frontmatter(fields: Record<string, string>, extra = ''): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n${extra}---\n\n`;
}

function renderPage(entry: IndexEntry, page: ComponentPage, exportsList: string[]): string {
  const source = readFileSync(join(repoRoot, 'documentation/components', entry.documentation), 'utf8');
  const tree = parse(source);
  const contractDir = dirname(entry.contract);
  const contract = readJson<Contract>(join(repoRoot, entry.contract));
  const status = readJson<Status>(join(repoRoot, contractDir, 'status.json'));

  // The page title comes from the frontmatter.
  const titleIndex = tree.children.findIndex((n) => n.type === 'heading' && (n as Heading).depth === 1);
  if (titleIndex >= 0) tree.children.splice(titleIndex, 1);

  const pageDir = join(pagesDir);
  const exampleDir = join(liveDir, entry.id);
  mkdirSync(exampleDir, { recursive: true });
  writeFileSync(
    join(exampleDir, 'glyphs.ts'),
    `// Example glyphs of the live blocks: the Phosphor paths of the Icon review page.\nexport * from '${posix(relative(exampleDir, join(repoRoot, 'examples/icon/glyphs.ts')))}';\n`
  );

  const imports = [
    `import LiveExample from '${posix(relative(pageDir, join(docsRoot, 'src/components/LiveExample.astro')))}';`
  ];
  const children: RootContent[] = [];
  let count = 0;
  for (const node of tree.children) {
    if (node.type === 'code' && node.lang === 'svelte' && /(^|\s)live(\s|$)/.test(node.meta ?? '')) {
      count++;
      const name = `Example${count}`;
      const file = join(exampleDir, `example-${count}.svelte`);
      writeFileSync(file, liveComponent(node, exportsList));
      imports.push(`import ${name} from '${posix(relative(pageDir, file))}';`);
      children.push(jsx('LiveExample', [], [jsx(name, [{ name: 'client:visible' }], [])]));
      const meta = (node.meta ?? '').replace(/(^|\s)live(?=\s|$)/, ' ').trim();
      children.push({ ...node, meta: meta || null } as Code);
      continue;
    }
    children.push(node);
    if (node.type === 'heading' && node.depth === 2 && headingText(node) === 'Anatomy') {
      children.push(...figmaSpecification(entry.id, page.title));
    }
  }
  children.push(...contractSection(entry, contract, status));

  const body: Root = {
    type: 'root',
    children: [{ type: 'mdxjsEsm', value: imports.join('\n') } as unknown as RootContent, ...children]
  };
  return (
    frontmatter({
      title: page.title,
      description: firstSentence(entry.purpose),
      editUrl: `${EDIT_BASE}documentation/components/${entry.documentation}`
    }) +
    `{/* Generated from documentation/components/${entry.documentation} by apps/docs/lib/content.ts. Do not edit. */}\n\n` +
    stringify(body)
  );
}

/** A live block is a complete Svelte component; a block without a script gets the ggbrick imports. */
function liveComponent(node: Code, exportsList: string[]): string {
  const code = node.value.trimEnd() + '\n';
  if (/<script[\s>]/.test(code)) return code;
  return `<script lang="ts">\n  import { ${exportsList.join(', ')} } from '${LIVE_EXPORTS_MODULE}';\n</script>\n\n${code}`;
}

type Attribute = { name: string; value?: string };
function jsx(name: string, attributes: Attribute[], children: RootContent[]): RootContent {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: attributes.map((a) => ({ type: 'mdxJsxAttribute', name: a.name, value: a.value ?? null })),
    children
  } as unknown as RootContent;
}

function headingText(node: Heading): string {
  return node.children.map((c) => ('value' in c ? c.value : '')).join('');
}

function firstSentence(text: string): string {
  const end = text.indexOf('; ');
  return end > 0 ? text.slice(0, end) + '.' : text;
}

const text = (value: string): PhrasingContent => ({ type: 'text', value });
const code = (value: string): PhrasingContent => ({ type: 'inlineCode', value });
const paragraph = (...children: PhrasingContent[]): RootContent => ({ type: 'paragraph', children });
const heading = (depth: 2 | 3, value: string): RootContent => ({ type: 'heading', depth, children: [text(value)] });
function table(headers: string[], rows: PhrasingContent[][][]): Table {
  const cell = (children: PhrasingContent[]): TableCell => ({ type: 'tableCell', children });
  return {
    type: 'table',
    align: headers.map(() => null),
    children: [
      { type: 'tableRow', children: headers.map((h) => cell([text(h)])) },
      ...rows.map((r) => ({ type: 'tableRow' as const, children: r.map(cell) }))
    ]
  };
}

function figmaSpecification(id: string, title: string): RootContent[] {
  const source = join(repoRoot, 'reports/components', id, 'figma/specification.png');
  if (!existsSync(source)) return [];
  copyFileSync(source, join(figmaDir, `${id}-specification.png`));
  return [
    jsx(
      'details',
      [{ name: 'class', value: 'ggb-docs-figma' }],
      [
        jsx('summary', [], [text(`${title} specification in Figma`) as unknown as RootContent]),
        jsx(
          'img',
          [
            { name: 'src', value: `/generated/figma/${id}-specification.png` },
            { name: 'alt', value: `Figma specification board of the ${title}: anatomy, variants, states and sizing.` },
            { name: 'loading', value: 'lazy' }
          ],
          []
        )
      ]
    )
  ];
}

const describeProp = (p: ContractProp): PhrasingContent[] => {
  if (p.values) return p.values.flatMap((v, i) => (i ? [text(', '), code(v)] : [code(v)]));
  const bounds = [p.min !== undefined ? `≥ ${p.min}` : '', p.max !== undefined ? `≤ ${p.max}` : '']
    .filter(Boolean)
    .join(', ');
  return [code(p.type ?? 'unknown'), ...(bounds ? [text(` (${bounds})`)] : [])];
};
const describeDefault = (p: ContractProp): PhrasingContent[] =>
  p.default === undefined ? [text('—')] : [code(JSON.stringify(p.default))];

const gateNames: Record<string, string> = {
  contract: 'Contract',
  implementation: 'Implementation (design review)',
  figmaParity: 'Figma parity',
  documentation: 'Documentation',
  delivery: 'Delivery'
};

function contractSection(entry: IndexEntry, contract: Contract, status: Status): RootContent[] {
  const out: RootContent[] = [
    heading(2, 'Contract and evidence'),
    paragraph(
      text('Generated from the platform-independent contract '),
      code(entry.contract),
      text(', the status file next to it and the reports in '),
      code(`reports/components/${entry.id}/`),
      text('. The contract names options and token roles; the API section above documents the Svelte names.')
    )
  ];

  out.push(heading(3, 'Status'));
  const approvals = Object.entries(gateNames).map(([key, name]) => {
    const approval = status.approvals?.[key];
    const date = approval?.provenance && /\b(\d{4}-\d{2}-\d{2})\b/.exec(approval.provenance)?.[1];
    return [[text(name)], [text(approval ? `Approved${date ? ` on ${date}` : ''}` : 'Not recorded')]];
  });
  out.push(
    paragraph(text(`Phase: ${status.phase}. Wave ${status.wave}, family ${status.family}.`)),
    table(['Gate', 'Approval'], approvals)
  );

  const props = Object.entries(contract.props ?? {});
  if (props.length) {
    out.push(heading(3, 'Options'));
    out.push(
      table(
        ['Option', 'Values', 'Default', 'Notes'],
        props.map(([name, p]) => [
          [code(name)],
          describeProp(p),
          describeDefault(p),
          [text([p.required ? 'required' : '', p.bindable ? 'bindable' : ''].filter(Boolean).join(', ') || '—')]
        ])
      )
    );
  }
  const parts = Object.entries(contract.parts ?? {});
  if (parts.length) {
    out.push(heading(3, 'Parts'));
    out.push(
      table(
        ['Part', 'Accepts', 'At most'],
        parts.map(([name, p]) => [
          [code(name)],
          p.accepts ? p.accepts.flatMap((v, i) => (i ? [text(', '), text(v)] : [text(v)])) : [text('—')],
          [text(p.max === undefined ? '—' : String(p.max))]
        ])
      )
    );
  }
  const states = Object.entries(contract.states ?? {});
  if (states.length) {
    out.push(heading(3, 'States'));
    out.push(
      table(
        ['State', 'Values', 'Default'],
        states.map(([name, s]) => [[code(name)], describeProp(s), describeDefault(s)])
      )
    );
  }
  const events = Object.entries(contract.events ?? {});
  if (events.length) {
    out.push(heading(3, 'Events'));
    out.push(
      table(
        ['Event', 'When'],
        events.map(([name, e]) => [[code(name)], [text(e.when)]])
      )
    );
  }
  const tokens = Object.entries(contract.tokens ?? {});
  if (tokens.length) {
    out.push(heading(3, 'Token roles'));
    out.push(
      paragraph(
        text(
          'Braces stand for an option or state value; every path resolves in the 18 brand × appearance × density contexts.'
        )
      ),
      table(
        ['Role', 'Token'],
        tokens.map(([role, path]) => [[code(role)], [code(path)]])
      )
    );
  }
  if (contract.rules?.length) {
    out.push(
      jsx(
        'details',
        [],
        [
          jsx('summary', [], [text(`Intrinsic rules (${contract.rules.length})`) as unknown as RootContent]),
          {
            type: 'list',
            ordered: true,
            spread: false,
            children: contract.rules.map((rule) => ({
              type: 'listItem',
              spread: false,
              children: [paragraph(text(rule))]
            }))
          } as RootContent
        ]
      )
    );
  }

  out.push(heading(3, 'Contrast'));
  const contrastPath = join(repoRoot, 'reports/components', entry.id, 'contrast.json');
  if (existsSync(contrastPath)) {
    const report = readJson<{ checks: number; failures: unknown[]; results: ContrastRecord[] }>(contrastPath);
    const groups = new Map<string, ContrastRecord[]>();
    for (const r of report.results) {
      const key = `${r.role}\u0000${r.minimum ?? 'informational'}`;
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
    const contexts = new Set(report.results.map((r) => r.context)).size;
    out.push(
      paragraph(
        text(
          `${report.checks} measured pairs in ${contexts} contexts, ${report.failures.length} below their minimum (WCAG relative luminance, translucent colors composited on each surface).`
        )
      ),
      table(
        ['Role', 'Minimum', 'Lowest measured', 'Pairs'],
        [...groups.values()].map((records) => {
          const lowest = Math.min(...records.map((r) => r.ratio));
          const minimum = records[0].minimum;
          return [
            [code(records[0].role)],
            [text(minimum === null ? 'informational' : `${minimum}:1`)],
            [text(`${lowest.toFixed(2)}:1`)],
            [text(String(records.length))]
          ];
        })
      )
    );
  } else {
    out.push(
      paragraph(
        text(
          'No contrast records: the component binds no color pair of its own and draws in the inherited text color, so contrast is the context’s.'
        )
      )
    );
  }

  const checks = status.checks ?? [];
  if (checks.length) {
    out.push(heading(3, 'Checks'));
    out.push(
      table(
        ['Check', 'Result', 'Date'],
        checks.map((c) => [[text(c.kind)], [text(c.result)], [text(c.date ?? '—')]])
      )
    );
  }
  return out;
}

function renderOverview(pages: ComponentPage[]): string {
  const families = [...new Set(pages.map((p) => p.family))];
  const tree: Root = {
    type: 'root',
    children: [
      paragraph(
        text(
          'Every component is usable in Figma and in Svelte, documented for people and agents, and backed by recorded evidence. The list below is generated from '
        ),
        code('documentation/index.json'),
        text('.')
      ),
      ...families.flatMap((family) => [
        heading(2, family.charAt(0).toUpperCase() + family.slice(1)),
        {
          type: 'list',
          ordered: false,
          spread: false,
          children: pages
            .filter((p) => p.family === family)
            .map((p) => ({
              type: 'listItem',
              spread: false,
              children: [
                paragraph(
                  { type: 'link', url: `/${p.slug}/`, children: [{ type: 'strong', children: [text(p.title)] }] },
                  text(` — ${p.purpose}`)
                )
              ]
            }))
        } as RootContent
      ])
    ]
  };
  return (
    frontmatter({
      title: 'Components',
      description: 'The ggbrick components, grouped by family.',
      editUrl: `${EDIT_BASE}documentation/index.json`
    }) +
    `{/* Generated from documentation/index.json by apps/docs/lib/content.ts. Do not edit. */}\n\n` +
    stringify(tree)
  );
}

interface FoundationEntry {
  id: string;
  title: string;
  /** Sidebar label when the title would repeat the section name (the overview). */
  navLabel?: string;
  documentation: string;
  purpose: string;
}

/** A block the site renders in place of a `<!-- site:kind options -->` marker (FoundationBlock.astro). */
export interface FoundationBlock {
  kind: string;
  options: Record<string, string>;
  /** For a tokens marker that follows a role table: the table's headers after the role column, and its rows. */
  headers?: string[];
  rows?: { path: string; cells: string[] }[];
}

const marker = /^<!--\s*site:([a-z-]+)(.*?)-->$/s;
const parseOptions = (text: string): Record<string, string> => {
  const options: Record<string, string> = {};
  const positional: string[] = [];
  for (const m of text.matchAll(/([a-z]+)=("([^"]*)"|\S+)|(\S+)/g)) {
    if (m[1]) options[m[1]] = m[3] ?? m[2];
    else positional.push(m[4]);
  }
  if (positional.length) options.prefixes = positional.join(' ');
  return options;
};
/** The Markdown source of a table cell, without the pipes that delimit it. */
const cellSource = (markdown: string, cell: TableCell) =>
  markdown
    .slice(cell.position!.start.offset!, cell.position!.end.offset!)
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .trim();

/**
 * Foundations pages from documentation/foundations/*.md. Each marker becomes a FoundationBlock; a tokens marker
 * right after a table whose first column holds role paths replaces that table, and the block keeps its other
 * columns next to the values. Relative links to other foundations pages become site links.
 */
export function generateFoundationPages(): FoundationEntry[] {
  const index = readJson<{ foundations?: FoundationEntry[] }>(join(repoRoot, 'documentation/index.json'));
  const entries = index.foundations ?? [];
  for (const dir of [foundationsDir, foundationBlocksDir]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  const slugOf = (file: string) => file.replace(/^.*\//, '').replace(/\.md$/, '');
  entries.forEach((entry, order) => {
    const markdown = readFileSync(join(repoRoot, 'documentation', entry.documentation), 'utf8');
    const tree = parse(markdown);
    const titleIndex = tree.children.findIndex((n) => n.type === 'heading' && (n as Heading).depth === 1);
    if (titleIndex >= 0) tree.children.splice(titleIndex, 1);
    const blocks: FoundationBlock[] = [];
    const children: RootContent[] = [];
    for (const node of tree.children) {
      const m = node.type === 'html' ? marker.exec(node.value.trim()) : null;
      if (!m) {
        children.push(node);
        continue;
      }
      const block: FoundationBlock = { kind: m[1], options: parseOptions(m[2].trim()) };
      const previous = children[children.length - 1];
      if (block.kind === 'tokens' && !block.options.prefix && !block.options.paths && previous?.type === 'table') {
        const [head, ...body] = previous.children;
        block.headers = head.children.slice(1).map((c) => cellSource(markdown, c));
        block.rows = body.map((row) => ({
          path: cellSource(markdown, row.children[0]).replaceAll('`', ''),
          cells: row.children.slice(1).map((c) => cellSource(markdown, c))
        }));
        children.pop();
      }
      children.push(
        jsx(
          'FoundationBlock',
          [
            { name: 'page', value: entry.id },
            { name: 'block', value: String(blocks.length) }
          ],
          []
        )
      );
      blocks.push(block);
    }
    const linkRewrite = (nodes: RootContent[]) => {
      for (const node of nodes) {
        if (node.type === 'link' && /^[a-z-]+\.md(#.*)?$/.test(node.url)) {
          const [file, hash] = node.url.split('#');
          node.url = `/foundations/${slugOf(file)}/${hash ? '#' + hash : ''}`;
        }
        if ('children' in node) linkRewrite(node.children as RootContent[]);
      }
    };
    linkRewrite(children);
    writeFileSync(join(foundationBlocksDir, `${entry.id}.json`), JSON.stringify(blocks, null, 2));
    const component = posix(
      relative(foundationsDir, join(docsRoot, 'src/components/foundations/FoundationBlock.astro'))
    );
    const body: Root = {
      type: 'root',
      children: [
        { type: 'mdxjsEsm', value: `import FoundationBlock from '${component}';` } as unknown as RootContent,
        ...children
      ]
    };
    writeFileSync(
      join(foundationsDir, `${slugOf(entry.documentation)}.mdx`),
      frontmatter(
        { title: entry.title, description: entry.purpose, editUrl: `${EDIT_BASE}documentation/${entry.documentation}` },
        `sidebar:\n  order: ${order + 1}\n${entry.navLabel ? `  label: ${JSON.stringify(entry.navLabel)}\n` : ''}`
      ) +
        `{/* Generated from documentation/${entry.documentation} by apps/docs/lib/content.ts. Do not edit. */}\n\n` +
        stringify(body)
    );
  });
  return entries;
}
