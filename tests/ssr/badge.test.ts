import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, loadModule, closeServer, writeSsrReport } from './helpers.ts';

type RawSnippet = (fn: () => { render: () => string }) => unknown;
let icon: unknown;
before(async () => {
  const { createRawSnippet } = await loadModule<{ createRawSnippet: RawSnippet }>('svelte');
  icon = createRawSnippet(() => ({ render: () => '<svg viewBox="0 0 256 256"><path d="M0 0h1v1H0z"></path></svg>' }));
});
const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/badge/Badge.svelte', props)).body;
after(async () => {
  writeSsrReport('badge', checks);
  await closeServer();
});

test('renders static text with the default neutral subtle md treatment and no role', async () => {
  const html = await render({ label: 'Draft' });
  assert.match(html, /^(<!--[^>]*-->)*<span\b/);
  assert.match(html, /class="ggb-badge"/);
  assert.match(html, /data-intent="neutral"/);
  assert.match(html, /data-appearance="subtle"/);
  assert.match(html, /data-size="md"/);
  assert.match(html, /<span class="ggb-badge__label">(<!--[^>]*-->)*Draft(<!--[^>]*-->)*<\/span>/);
  assert.doesNotMatch(html, /role=|tabindex=|aria-label=|ggb-badge__leading/);
  checks.push('default badge: span, class, defaults neutral subtle md, label as text, no role or focus');
});

test('reflects every enum option as a data attribute', async () => {
  for (const intent of ['neutral', 'accent', 'info', 'success', 'warning', 'danger'])
    for (const appearance of ['subtle', 'strong'])
      for (const size of ['sm', 'md', 'lg']) {
        const html = await render({ label: 'A', intent, appearance, size });
        assert.match(
          html,
          new RegExp(`data-intent="${intent}"[^>]*data-appearance="${appearance}"[^>]*data-size="${size}"`)
        );
      }
  checks.push('36 intent x appearance x size combinations');
});

test('renders the leading icon first, hidden from assistive technology', async () => {
  const html = await render({ label: 'Paid', intent: 'success', leading: icon });
  assert.match(
    html,
    /<span class="ggb-badge__leading" aria-hidden="true"><svg viewBox="0 0 256 256">.*<\/svg>(<!--[^>]*-->)*<\/span>(<!--[^>]*-->)*<span class="ggb-badge__label">/
  );
  checks.push('leading icon before the label, aria-hidden');
});

test('passes extra classes and native attributes through', async () => {
  const html = await render({ label: 'New', class: 'x', id: 'b', 'data-testid': 't', title: 'Added today' });
  assert.match(html, /class="ggb-badge x"/);
  assert.match(html, /id="b"/);
  assert.match(html, /data-testid="t"/);
  assert.match(html, /title="Added today"/);
  checks.push('class merge and native attributes');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
