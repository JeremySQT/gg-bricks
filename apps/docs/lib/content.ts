// Generates the component pages of the site from the maintained sources. For every entry of
// documentation/index.json it writes src/content/docs/components/<id>.mdx: the Markdown page without
// its title, opened by the site's playground of the component (src/playgrounds/<id>.svelte), each
// ```svelte live``` block compiled into a Svelte island rendered above its code, and the Figma blueprint boards
// under Anatomy. For every
// foundations entry it writes src/content/docs/foundations/<id>.mdx, replacing each `<!-- site:… -->` marker
// with a block of token tables or previews (see generateFoundationPages).
// Everything written here is ignored by git and rebuilt on every dev start and build.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import type { Code, Heading, List, PhrasingContent, Root, RootContent, Table, TableCell } from 'mdast';

interface IndexEntry {
  id: string;
  import: string;
  from: string;
  purpose: string;
  documentation: string;
  contract: string;
}
interface Status {
  family: string;
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
    if (node.type === 'list') markDoAndDont(node);
    if (node.type === 'table' && isGuidanceTable(node)) {
      children.push(guidanceTable(node));
      continue;
    }
    children.push(node);
    if (node.type === 'heading' && node.depth === 2 && headingText(node) === 'Anatomy') {
      children.push(...blueprints(entry.id, page.title));
    }
  }
  // The playground opens the page when the site has one for this component.
  const playground = join(docsRoot, 'src/playgrounds', `${entry.id}.svelte`);
  if (existsSync(playground)) {
    imports.push(`import Playground from '${posix(relative(pageDir, playground))}';`);
    children.unshift(jsx('Playground', [{ name: 'client:load' }], []));
  }

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

/** Bullets opening with a bold **Do** or **Don't** get a badge on the site (ggb-docs-do, ggb-docs-dont). */
function markDoAndDont(list: List): void {
  for (const item of list.children) {
    const first = item.children[0];
    if (first?.type !== 'paragraph') continue;
    const lead = first.children[0];
    if (lead?.type !== 'strong' || lead.children.length !== 1 || lead.children[0].type !== 'text') continue;
    const word = lead.children[0].value;
    const kind = word === 'Do' ? 'do' : word === 'Don’t' || word === "Don't" ? 'dont' : null;
    if (!kind) continue;
    first.children[0] = {
      type: 'mdxJsxTextElement',
      name: 'span',
      attributes: [{ type: 'mdxJsxAttribute', name: 'class', value: `ggb-docs-${kind}` }],
      children: [{ type: 'text', value: word }]
    } as unknown as PhrasingContent;
  }
}

const cellText = (cell: TableCell) => cell.children.map((c) => ('value' in c ? c.value : '')).join('');
const guidanceKinds: Record<string, 'positive' | 'negative'> = {
  Use: 'positive',
  Do: 'positive',
  "Don't use": 'negative',
  'Don’t use': 'negative',
  "Don't": 'negative',
  'Don’t': 'negative'
};
const isGuidanceTable = (table: Table) => table.children[0].children.some((c) => cellText(c) === 'Guidance');

/**
 * A table with a Guidance column (Use / Don't use, Do / Don't) rendered as a card: badges for the guidance and,
 * when a Topic column precedes it, the topic written once for its consecutive rows.
 */
function guidanceTable(table: Table): RootContent {
  const [head, ...body] = table.children;
  const headers = head.children.map(cellText);
  const topicIndex = headers.indexOf('Topic');
  const guidanceIndex = headers.indexOf('Guidance');
  const el = (name: string, attributes: Attribute[], children: RootContent[]) => jsx(name, attributes, children);
  const cell = (name: 'td' | 'th', content: PhrasingContent[], attributes: Attribute[] = []) =>
    el(name, attributes, [{ type: 'paragraph', children: content } as RootContent]);
  const rows = body.map((row, r) => {
    const cells: RootContent[] = [];
    row.children.forEach((c, i) => {
      if (i === topicIndex) {
        const topic = cellText(c);
        if (r > 0 && cellText(body[r - 1].children[i]) === topic) return;
        let span = 1;
        while (r + span < body.length && cellText(body[r + span].children[i]) === topic) span++;
        cells.push(
          cell('th', c.children, [
            { name: 'scope', value: 'rowgroup' },
            { name: 'rowspan', value: String(span) }
          ])
        );
      } else if (i === guidanceIndex) {
        const word = cellText(c);
        const kind = guidanceKinds[word] ?? 'positive';
        cells.push(
          el(
            'td',
            [{ name: 'class', value: 'guidance' }],
            [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'mdxJsxTextElement',
                    name: 'span',
                    attributes: [
                      { type: 'mdxJsxAttribute', name: 'class', value: `ggb-docs-badge ggb-docs-badge--${kind}` }
                    ],
                    children: [{ type: 'text', value: word }]
                  } as unknown as PhrasingContent
                ]
              } as RootContent
            ]
          )
        );
      } else cells.push(cell('td', c.children));
    });
    const topic = topicIndex >= 0 ? cellText(row.children[topicIndex]) : '';
    const groupStart = topicIndex >= 0 && (r === 0 || cellText(body[r - 1].children[topicIndex]) !== topic);
    return el('tr', groupStart && r > 0 ? [{ name: 'class', value: 'group-start' }] : [], cells);
  });
  return el(
    'div',
    [{ name: 'class', value: 'ggb-docs-guidance not-content' }],
    [
      el(
        'table',
        [],
        [
          el(
            'thead',
            [],
            [
              el(
                'tr',
                [],
                headers.map((h) =>
                  el(
                    'th',
                    [{ name: 'scope', value: 'col' }],
                    [{ type: 'paragraph', children: [{ type: 'text', value: h }] } as RootContent]
                  )
                )
              )
            ]
          ),
          el('tbody', [], rows)
        ]
      )
    ]
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
const paragraph = (...children: PhrasingContent[]): RootContent => ({ type: 'paragraph', children });
const heading = (depth: 2 | 3, value: string): RootContent => ({ type: 'heading', depth, children: [text(value)] });
/** The blueprint boards of the Figma specification (Anatomy diagrams), exported at the parity phase. */
function blueprints(id: string, title: string): RootContent[] {
  const dir = join(repoRoot, 'reports/components', id, 'figma');
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => /^blueprint-[a-z-]+\.png$/.test(f))
    .sort(
      (a, b) => Number(b === 'blueprint-anatomy.png') - Number(a === 'blueprint-anatomy.png') || a.localeCompare(b)
    );
  return files.map((file) => {
    copyFileSync(join(dir, file), join(figmaDir, `${id}-${file}`));
    const kind = file.replace(/^blueprint-|\.png$/g, '');
    return jsx(
      'img',
      [
        { name: 'class', value: 'ggb-docs-blueprint' },
        { name: 'src', value: `/generated/figma/${id}-${file}` },
        {
          name: 'alt',
          value: `${title} ${kind} blueprint from the Figma specification: numbered parts and lettered dimensions, described below.`
        },
        { name: 'loading', value: 'lazy' }
      ],
      []
    );
  });
}

function renderOverview(pages: ComponentPage[]): string {
  const families = [...new Set(pages.map((p) => p.family))];
  const tree: Root = {
    type: 'root',
    children: [
      paragraph(text('Every component is usable in Figma and in Svelte, and documented for people and agents.')),
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
