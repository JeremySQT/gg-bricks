import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.mjs';

after(async () => {
  writeSsrReport('button', ['default button SSR', 'loading SSR', 'disabled link SSR', 'empty label rejected']);
  await closeServer();
});

test('default button renders a native button', async () => {
  const { body } = await renderComponent('button/Button.svelte', { label: 'Save' });
  assert.match(body, /type="button"/);
});

test('loading exposes busy state', async () => {
  const { body } = await renderComponent('button/Button.svelte', { label: 'Save', loading: true });
  assert.match(body, /aria-busy="true"/);
});

test('disabled link has no destination', async () => {
  const { body } = await renderComponent('button/Button.svelte', { label: 'Create', href: '/create', disabled: true });
  assert.match(body, /role="link"/);
  assert.doesNotMatch(body, /href="\/create"/);
});

test('empty label is rejected on the server too', async () => {
  await assert.rejects(() => renderComponent('button/Button.svelte', { label: '' }), /non-empty label/);
});
