// Build one example page as a single self-contained HTML file (scripts, styles, fonts inlined)
// for interactive review outside the repository: dist/previews/<id>.html.
//   npm run build && node tooling/build-preview.ts button
// The page is rebuilt on its own with every import inlined: the multi-page build of
// `npm run build` shares chunks between pages, which an inlined page could not load.
// The result is then opened from file:// in Chromium and must mount without errors.
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from '@playwright/test';
import { abs, paths, write } from './lib/paths.ts';

const id = process.argv[2];
if (!id) throw Error('Usage: node tooling/build-preview.ts <example-id>');
const entry = abs('examples', id, 'index.html');
if (!fs.existsSync(entry)) throw Error(`Missing ${entry}`);
const dir = abs(paths.dist, 'preview-build', id);

// Own configuration rather than vite.config.ts: its multi-page input would be merged into this one.
await build({
  configFile: false,
  root: abs('examples'),
  plugins: [svelte()],
  logLevel: 'warn',
  build: {
    outDir: dir,
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 4096,
    rollupOptions: { input: { [id]: entry }, output: { inlineDynamicImports: true } }
  }
});

const page = path.join(dir, id, 'index.html');
const asset = (url: string) => path.join(dir, url.replace(/^\//, ''));
let html = fs.readFileSync(page, 'utf8');
html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = fs.readFileSync(asset(src), 'utf8');
  if (/\bimport\s*\(|from\s*["']\/|import\s*["']\//.test(js)) throw Error(`${src} still imports other files`);
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
const leftover = html.match(/<(?:script|link)\b[^>]*(?:src|href)="[^"]+"[^>]*>/);
if (leftover) throw Error(`Preview still references an external file: ${leftover[0]}`);
const out = `${paths.dist}/previews/${id}.html`;
write(out, html);

// Smoke check: the self-contained file must mount from file:// without script errors.
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ['--no-sandbox']
});
try {
  const tab = await browser.newPage();
  const errors: string[] = [];
  tab.on('pageerror', (e) => errors.push(e.message));
  tab.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await tab.goto('file://' + abs(out));
  await tab.waitForFunction(() => (document.getElementById('app')?.childElementCount ?? 0) > 0, null, {
    timeout: 10_000
  });
  if (errors.length) throw Error(`Preview errors:\n${errors.join('\n')}`);
} finally {
  await browser.close();
}
console.log(`Wrote ${out} (${Math.round(html.length / 1024)} kB); it mounts from file:// without errors.`);
