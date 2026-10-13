import fs from 'node:fs';
import path from 'node:path';

/** Repository root (the design-system root). All tooling resolves paths from here. */
export const root = path.resolve(import.meta.dirname, '..', '..');

export const paths = {
  config: 'foundations/tokens/config.json',
  tokens: 'foundations/tokens',
  components: 'foundations/components',
  documentation: 'documentation',
  schemas: 'authoring/schemas',
  templates: 'authoring/templates',
  tokensPackage: 'packages/tokens',
  sveltePackage: 'packages/svelte',
  reports: 'reports',
  examples: 'examples',
  dist: 'dist'
} as const;

export const abs = (...segments: string[]): string => path.join(root, ...segments);
export const rel = (p: string): string => path.relative(root, p).split(path.sep).join('/');

export function readJson<T = unknown>(p: string): T {
  return JSON.parse(fs.readFileSync(abs(p), 'utf8')) as T;
}

export function readText(p: string): string {
  return fs.readFileSync(abs(p), 'utf8');
}

export function write(p: string, content: unknown): void {
  const target = abs(p);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
}

export function exists(p: string): boolean {
  return fs.existsSync(abs(p));
}
