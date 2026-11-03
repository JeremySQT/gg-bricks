import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/ButtonGroupWith.svelte', props)).body;
after(async () => {
  writeSsrReport('button-group', checks);
  await closeServer();
});

test('defaults: horizontal, start, md; no group semantics without a label', async () => {
  const html = await render({});
  assert.match(html, /<div class="ggb-button-group" data-size="md" data-orientation="horizontal" data-align="start">/);
  assert.doesNotMatch(html, /role="group"/);
  assert.doesNotMatch(html, /data-stacked/);
  checks.push('default options as data attributes; no role or name without a label; not stacked on the server');
});

test('the group size applies to every Button and IconButton, whatever their own size', async () => {
  for (const size of ['sm', 'md', 'lg']) {
    const html = await render({ size });
    assert.match(html, new RegExp(`class="ggb-button-group" data-size="${size}"`));
    assert.equal(html.match(new RegExp(`class="ggb-button" [^>]*data-size="${size}"`, 'g'))?.length, 2, size);
    assert.match(html, new RegExp(`class="ggb-icon-button" [^>]*data-size="${size}"`), size);
  }
  checks.push('group size sm, md, lg reaches the two Buttons (one asking for lg) and the IconButton');
});

test('a label makes it a named group; orientation and align are exposed for the layout', async () => {
  const html = await render({ label: 'Document actions', orientation: 'vertical', align: 'stretch' });
  assert.match(html, /data-orientation="vertical" data-align="stretch" role="group" aria-label="Document actions"/);
  const blank = await render({ label: '   ' });
  assert.doesNotMatch(blank, /role="group"/);
  checks.push('label: role group with that name; a blank label adds no semantics; options rendered');
});

test('items keep their source order and each stays a button', async () => {
  const html = await render({ align: 'end' });
  const order = [...html.matchAll(/id="(cancel|save|more)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ['cancel', 'save', 'more']);
  checks.push('source order kept whatever the alignment');
});
