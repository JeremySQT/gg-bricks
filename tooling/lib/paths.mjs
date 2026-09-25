import fs from 'node:fs';
import path from 'node:path';

/** Repository root (the design-system root). All tooling resolves paths from here. */
export const root = path.resolve(import.meta.dirname, '..', '..');

export const paths = {
  config: 'foundations/config.json',
  tokens: 'foundations/tokens',
  components: 'components',
  documentation: 'documentation',
  schemas: 'authoring/schemas',
  templates: 'authoring/templates',
  tokensPackage: 'packages/tokens',
  sveltePackage: 'packages/svelte',
  reports: 'reports',
  examples: 'examples',
  dist: 'dist'
};

export const abs = (...segments) => path.join(root, ...segments);
export const rel = (p) => path.relative(root, p).split(path.sep).join('/');

export function readJson(p) {
  return JSON.parse(fs.readFileSync(abs(p), 'utf8'));
}

export function readText(p) {
  return fs.readFileSync(abs(p), 'utf8');
}

export function write(p, content) {
  const target = abs(p);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
}

export function exists(p) {
  return fs.existsSync(abs(p));
}
