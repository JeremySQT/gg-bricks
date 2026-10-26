import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/switch/Switch.svelte', props)).body;
after(async () => {
  writeSsrReport('switch', checks);
  await closeServer();
});

test('a label container with a switch control, its thumb, then the label', async () => {
  const html = await render({ id: 's', label: 'Dark mode', description: 'Everywhere' });
  assert.match(html, /<label class="ggb-switch" data-size="md" data-label-position="end" data-selection="off">/);
  assert.match(
    html,
    /<button class="ggb-switch__track" aria-labelledby="s-label" aria-describedby="s-description"[^>]*role="switch" aria-checked="false"/
  );
  assert.match(html, /<span class="ggb-switch__thumb"/);
  assert.ok(html.indexOf('ggb-switch__track') < html.indexOf('ggb-switch__text'));
  checks.push('container, switch role, name and description references, thumb, track before text');
});

test('labelPosition start puts the text first; checked, readonly, disabled, hidden label, sizes', async () => {
  const start = await render({ label: 'A', labelPosition: 'start' });
  assert.ok(start.indexOf('ggb-switch__text') < start.indexOf('ggb-switch__track'));
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ label: 'A', size }), new RegExp(`data-size="${size}"`));
  const on = await render({ label: 'A', checked: true, readonly: true, hideLabel: true });
  assert.match(on, /data-selection="on"[^>]*data-hide-label=""[^>]*data-readonly=""/);
  assert.match(on, /aria-readonly="true"[^>]*aria-checked="true"/);
  const disabled = await render({ label: 'A', disabled: true, readonly: true });
  assert.match(disabled, /data-disabled=""/);
  assert.doesNotMatch(disabled, /data-readonly|aria-readonly/);
  checks.push('start order; sizes; on, readonly, hidden label; disabled wins over readonly');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
