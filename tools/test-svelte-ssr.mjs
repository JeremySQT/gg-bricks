import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: Button } = await server.ssrLoadModule('/packages/svelte/src/button/Button.svelte');
  const { render } = await server.ssrLoadModule('svelte/server');
  const normal = await render(Button, { props: { label: 'Save' } });
  const loading = await render(Button, { props: { label: 'Save', loading: true } });
  const link = await render(Button, { props: { label: 'Create', href: '/create', disabled: true } });
  assert.match(normal.body, /type="button"/);
  assert.match(loading.body, /aria-busy="true"/);
  assert.match(link.body, /role="link"/);
  assert.doesNotMatch(link.body, /href="\/create"/);
  await assert.rejects(async () => { const output = await render(Button, { props: { label: '' } }); return output.body; }, /non-empty label/);
  const result = { result: 'passed', checks: ['default button SSR', 'loading SSR', 'disabled link SSR', 'empty label rejected'] };
  fs.mkdirSync('reports/svelte', { recursive: true });
  fs.writeFileSync('reports/svelte/ssr.json', JSON.stringify(result, null, 2) + '\n');
  console.log(result);
} finally { await server.close(); }
