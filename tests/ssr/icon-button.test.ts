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
  (await renderComponent('components/icon-button/IconButton.svelte', { icon, ...props })).body;
after(async () => {
  writeSsrReport('icon-button', checks);
  await closeServer();
});

test('renders a native button with the default neutral ghost md treatment and the label as its only name', async () => {
  const html = await render({ label: 'Edit' });
  assert.match(html, /^(<!--[^>]*-->)*<button\b/);
  assert.match(html, /type="button"/);
  assert.match(html, /class="ggb-icon-button"/);
  assert.match(html, /aria-label="Edit"/);
  assert.match(html, /data-intent="neutral"/);
  assert.match(html, /data-appearance="ghost"/);
  assert.match(html, /data-size="md"/);
  assert.match(
    html,
    /<span class="ggb-icon-button__container">(<!--[^>]*-->)*<span class="ggb-icon-button__icon" aria-hidden="true">/
  );
  assert.match(html, /<svg viewBox="0 0 256 256">/);
  // No visible text: the name is never rendered as content.
  assert.doesNotMatch(html.replace(/<[^>]*>/g, ''), /Edit/);
  assert.doesNotMatch(html, /data-disabled|data-loading|aria-busy|aria-disabled|loadingIndicator|title=/);
  checks.push('default icon button: element, type, class, defaults neutral ghost md, aria-label, hidden icon, no text');
});

test('reflects every enum option as a data attribute', async () => {
  for (const intent of ['accent', 'neutral', 'danger'])
    for (const appearance of ['solid', 'outline', 'ghost'])
      for (const size of ['sm', 'md', 'lg']) {
        const html = await render({ label: 'A', intent, appearance, size });
        assert.match(
          html,
          new RegExp(`data-intent="${intent}"[^>]*data-appearance="${appearance}"[^>]*data-size="${size}"`)
        );
      }
  checks.push('27 intent x appearance x size combinations');
});

test('disabled is native, loading replaces the icon and stays focusable and busy, disabled wins over loading', async () => {
  const disabled = await render({ label: 'Delete', disabled: true });
  assert.match(disabled, /\sdisabled(=""|\s|>)/);
  assert.match(disabled, /data-disabled=""/);
  assert.match(disabled, /aria-disabled="true"/);

  const loading = await render({ label: 'Save', loading: true });
  assert.doesNotMatch(loading, /\sdisabled(=""|\s|>)/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /aria-disabled="true"/);
  assert.match(loading, /aria-label="Save"/);
  assert.match(loading, /ggb-icon-button__loadingIndicator/);
  assert.doesNotMatch(loading, /ggb-icon-button__icon/);

  const both = await render({ label: 'Save', loading: true, disabled: true });
  assert.match(both, /data-disabled=""/);
  assert.match(both, /data-loading=""/);
  assert.doesNotMatch(both, /aria-busy/);
  assert.match(both, /ggb-icon-button__loadingIndicator/);
  checks.push('disabled, loading (indicator in place of the icon) and their combination');
});

test('href renders a link; disabled removes the destination; loading keeps it', async () => {
  const link = await render({ label: 'Search', href: '/search' });
  assert.match(link, /<a\b[^>]*href="\/search"/);
  assert.match(link, /aria-label="Search"/);
  assert.doesNotMatch(link, /type=/);
  const disabled = await render({ label: 'Search', href: '/search', disabled: true });
  assert.match(disabled, /<a\b/);
  assert.doesNotMatch(disabled, /href=/);
  assert.match(disabled, /tabindex="-1"/);
  const loading = await render({ label: 'Search', href: '/search', loading: true });
  assert.match(loading, /href="\/search"/);
  assert.match(loading, /aria-busy="true"/);
  checks.push('link role, disabled link without href, loading link kept focusable');
});

test('passes submit type, extra classes and native attributes through; aria-label cannot be overridden', async () => {
  const html = await render({
    label: 'Send',
    type: 'submit',
    class: 'x',
    id: 'send',
    'data-testid': 't',
    'aria-label': 'Other'
  });
  assert.match(html, /type="submit"/);
  assert.match(html, /class="ggb-icon-button x"/);
  assert.match(html, /id="send"/);
  assert.match(html, /data-testid="t"/);
  assert.match(html, /aria-label="Send"/);
  assert.doesNotMatch(html, /aria-label="Other"/);
  checks.push('type submit, class merge, native attributes, owned aria-label');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
