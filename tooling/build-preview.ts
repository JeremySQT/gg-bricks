// Inline a built example page (scripts, styles, fonts) into one self-contained HTML file
// for interactive review outside the repository: dist/previews/<id>.html.
//   npm run build && node tooling/build-preview.ts button
import fs from 'node:fs';
import path from 'node:path';
import { abs, paths, write } from './lib/paths.ts';

const id = process.argv[2];
if (!id) throw Error('Usage: node tooling/build-preview.ts <example-id>');
const dir = abs(paths.dist, 'examples');
const page = path.join(dir, id, 'index.html');
if (!fs.existsSync(page)) throw Error(`Missing ${page}; run npm run build first.`);
const asset = (url: string) => path.join(dir, url.replace(/^\//, ''));
let html = fs.readFileSync(page, 'utf8');
html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = fs.readFileSync(asset(src), 'utf8');
  return `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`;
});
html = html.replace(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g, (_, href) => {
  let css = fs.readFileSync(asset(href), 'utf8');
  css = css.replace(/url\(([^)]+)\)/g, (whole, url) => {
    const cleaned = url.replaceAll(/["']/g, '');
    if (cleaned.startsWith('data:')) return whole;
    const file = asset(cleaned);
    const mime = file.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
    return `url(data:${mime};base64,${fs.readFileSync(file).toString('base64')})`;
  });
  return `<style>${css}</style>`;
});
write(`${paths.dist}/previews/${id}.html`, html);
console.log(`Wrote dist/previews/${id}.html`);
