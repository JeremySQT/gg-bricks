import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The review/demo app lives in examples/: one page per component (examples/<id>/index.html)
// plus the landing page. `npm run dev` serves it; `npm run build` writes dist/examples.
const examples = resolve(import.meta.dirname, 'examples');
const pages = Object.fromEntries(
  readdirSync(examples, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(examples, d.name, 'index.html')))
    .map((d) => [d.name, resolve(examples, d.name, 'index.html')])
);

export default defineConfig({
  root: examples,
  plugins: [svelte()],
  server: { fs: { allow: [resolve(import.meta.dirname)] } },
  build: {
    outDir: resolve(import.meta.dirname, 'dist/examples'),
    emptyOutDir: true,
    rollupOptions: { input: { index: resolve(examples, 'index.html'), ...pages } }
  }
});
