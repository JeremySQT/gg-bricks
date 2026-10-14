import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport, loadModule } from './helpers.ts';

const checks: string[] = [];
type RawSnippet = (fn: () => { render: () => string }) => unknown;
let glyph: unknown;
before(async () => {
  const { createRawSnippet } = await loadModule<{ createRawSnippet: RawSnippet }>('svelte');
  glyph = createRawSnippet(() => ({ render: () => '<path d="M3 3h18v18H3z"></path>' }));
});
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/icon/Icon.svelte', { children: glyph, ...props })).body;
after(async () => {
  writeSsrReport('icon', checks);
  await closeServer();
});

test('renders a decorative svg root with the default size and the reference grid', async () => {
  const html = await render({});
  assert.match(html, /^(<!--[^>]*-->)*<svg\b/);
  assert.match(html, /class="ggb-icon"/);
  assert.match(html, /data-size="md"/);
  assert.match(html, /viewBox="0 0 256 256"/);
  assert.match(html, /fill="currentColor"/);
  assert.match(html, /focusable="false"/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /role=|aria-label=/);
  assert.match(html, /<path d="M3 3h18v18H3z"><\/path>/);
  checks.push('default icon: svg root, class, size md, reference grid, currentColor, decorative, glyph rendered');
});

test('a label turns the icon into a named image', async () => {
  const html = await render({ label: 'Paid' });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Paid"/);
  assert.doesNotMatch(html, /aria-hidden/);
  const blank = await render({ label: '   ' });
  assert.match(blank, /aria-hidden="true"/);
  assert.doesNotMatch(blank, /role="img"/);
  checks.push('label: role img and aria-label; blank label stays decorative');
});

test('reflects every size and an alternative grid', async () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'])
    assert.match(await render({ size }), new RegExp(`data-size="${size}"`));
  assert.match(await render({ viewBox: '0 0 24 24' }), /viewBox="0 0 24 24"/);
  checks.push('5 sizes; viewBox option');
});

test('passes classes and native attributes through, never the owned ones', async () => {
  const html = await render({ class: 'spin', id: 'i1', 'data-testid': 'x' });
  assert.match(html, /class="ggb-icon spin"/);
  assert.match(html, /id="i1"/);
  assert.match(html, /data-testid="x"/);
  checks.push('class merge, native attributes');
});
