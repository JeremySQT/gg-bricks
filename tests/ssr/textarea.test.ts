import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/textarea/Textarea.svelte', props)).body;
after(async () => {
  writeSsrReport('textarea', checks);
  await closeServer();
});

test('renders a textarea in its container with defaults md, vertical, 3 rows and the label as name', async () => {
  const html = await render({ label: 'Notes' });
  assert.match(
    html,
    /<div class="ggb-textarea" data-size="md" data-resize="vertical" style="--_rows: 3; --_max-rows: 8;">/
  );
  assert.match(html, /<textarea class="ggb-textarea__input" rows="3" aria-label="Notes"><\/textarea>/);
  checks.push('defaults, rows custom properties, aria-label');
});

test('options and states', async () => {
  for (const resize of ['vertical', 'auto', 'none'])
    for (const size of ['sm', 'md', 'lg'])
      assert.match(
        await render({ label: 'A', resize, size }),
        new RegExp(`data-size="${size}" data-resize="${resize}"`)
      );
  const html = await render({
    label: 'A',
    rows: 1,
    maxRows: 0,
    value: 'v',
    readonly: true,
    invalid: true,
    required: true
  });
  assert.match(html, /--_rows: 1; --_max-rows: 1;/);
  assert.match(html, /data-readonly=""[^>]*data-invalid=""/);
  assert.match(html, /rows="1"[^>]*readonly=""[^>]*required=""[^>]*aria-invalid="true"/);
  assert.match(html, />v<\/textarea>/);
  const odd = await render({ label: 'A', rows: Number.NaN });
  assert.match(odd, /rows="3"/);
  checks.push(
    '9 resize x size combinations; rows clamped to 1, maxRows at least rows, NaN rows fall back to 3; states'
  );
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
