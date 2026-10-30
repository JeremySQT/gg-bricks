import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, loadModule, closeServer, writeSsrReport } from './helpers.ts';

type RawSnippet = (fn: (args?: () => Record<string, unknown>) => { render: () => string }) => unknown;
let icon: unknown;
let action: unknown;
before(async () => {
  const { createRawSnippet } = await loadModule<{ createRawSnippet: RawSnippet }>('svelte');
  icon = createRawSnippet(() => ({ render: () => '<svg viewBox="0 0 256 256"><path d="M0 0h1v1H0z"></path></svg>' }));
  action = createRawSnippet((args) => ({ render: () => `<b data-props='${JSON.stringify(args?.())}'>x</b>` }));
});
const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/input-text/InputText.svelte', props)).body;
after(async () => {
  writeSsrReport('input-text', checks);
  await closeServer();
});

test('renders a text input in its container with the label as accessible name and md defaults', async () => {
  const html = await render({ label: 'Search', placeholder: 'Find' });
  assert.match(html, /<div class="ggb-input-text" data-size="md">/);
  assert.match(
    html,
    /<input class="ggb-input-text__input" type="text" value="" placeholder="Find" aria-label="Search"\/>/
  );
  assert.doesNotMatch(html, /aria-invalid|required|disabled|readonly|data-readonly|data-action/);
  checks.push('default input, container data-size md, aria-label, placeholder, no state attributes');
});

test('reflects type and size; states map to native attributes and data attributes', async () => {
  for (const type of ['text', 'email', 'password', 'search', 'tel', 'url'])
    for (const size of ['sm', 'md', 'lg']) {
      const html = await render({ label: 'A', type, size });
      assert.match(html, new RegExp(`data-size="${size}"`));
      assert.match(html, new RegExp(`type="${type}"`));
    }
  const states = await render({ label: 'A', readonly: true, invalid: true, required: true, value: 'v' });
  assert.match(states, /data-readonly=""[^>]*data-invalid=""/);
  assert.match(states, /value="v"[^>]*readonly=""[^>]*required=""[^>]*aria-invalid="true"/);
  const disabled = await render({ label: 'A', disabled: true, readonly: true });
  assert.match(disabled, /data-disabled=""/);
  assert.doesNotMatch(disabled, /data-readonly/);
  assert.match(disabled, /\sdisabled=""/);
  checks.push('18 type x size combinations; readonly, invalid, required, disabled (disabled wins over readonly)');
});

test('slots: decorative icons are hidden; the action receives the next smaller IconButton options', async () => {
  const icons = await render({ label: 'A', leading: icon, trailing: icon });
  assert.match(icons, /<span class="ggb-input-text__leading" aria-hidden="true"><svg/);
  assert.match(icons, /<span class="ggb-input-text__trailing" aria-hidden="true"><svg/);
  const md = await render({ label: 'A', action, trailing: icon });
  assert.match(md, /data-action=""/);
  assert.match(
    md,
    /<span class="ggb-input-text__action"><b data-props='\{"size":"sm","intent":"neutral","appearance":"ghost","disabled":false\}'>/
  );
  assert.doesNotMatch(md, /ggb-input-text__trailing/);
  const lg = await render({ label: 'A', action, size: 'lg', disabled: true });
  assert.match(lg, /"size":"md","intent":"neutral","appearance":"ghost","disabled":true/);
  const sm = await render({ label: 'A', action, size: 'sm' });
  assert.doesNotMatch(sm, /ggb-input-text__action|data-action/);
  checks.push('leading/trailing hidden; action sm at md, md at lg, disabled passed, not rendered at sm');
});

test('native attributes go to the input, the class to the container', async () => {
  const html = await render({
    label: 'A',
    id: 'x',
    name: 'q',
    autocomplete: 'email',
    class: 'c',
    'aria-describedby': 'h'
  });
  assert.match(html, /<div class="ggb-input-text c"/);
  assert.match(html, /<input [^>]*\bid="x"/);
  assert.match(html, /<input [^>]*\bname="q"[^>]*\bautocomplete="email"/);
  assert.match(html, /aria-describedby="h"/);
  checks.push('id, name, autocomplete and aria-describedby on the input; class on the container');
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
