import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/checkbox/Checkbox.svelte', props)).body;
after(async () => {
  writeSsrReport('checkbox', checks);
  await closeServer();
});

test('a label container with a checkbox control named by the label and described by the description', async () => {
  const html = await render({ id: 'c', label: 'Updates', description: 'Weekly' });
  assert.match(html, /<label class="ggb-checkbox" data-size="md" data-selection="off">/);
  assert.match(
    html,
    /<button class="ggb-checkbox__control" aria-labelledby="c-label" aria-describedby="c-description" id="c" role="checkbox" type="button" aria-checked="false"/
  );
  assert.match(html, /<span class="ggb-checkbox__label" id="c-label">Updates<\/span>/);
  assert.match(html, /<span class="ggb-checkbox__description" id="c-description">Weekly<\/span>/);
  assert.doesNotMatch(html, /ggb-checkbox__mark|role="group"/);
  checks.push('label container, control role and name/description references, no mark when off');
});

test('checked shows the check mark, indeterminate the bar and wins for display', async () => {
  const checked = await render({ label: 'A', checked: true });
  assert.match(checked, /data-selection="on"/);
  assert.match(checked, /aria-checked="true"/);
  assert.match(checked, /<svg class="ggb-checkbox__mark"[^>]*aria-hidden="true"[^>]*>(<!--[^>]*-->)*<path d="M232\.49/);
  const mixed = await render({ label: 'A', checked: true, indeterminate: true });
  assert.match(mixed, /aria-checked="mixed"/);
  assert.match(mixed, /<svg class="ggb-checkbox__mark"[^>]*>(<!--[^>]*-->)*<path d="M228,128/);
  checks.push('check glyph, bar glyph, aria-checked true and mixed');
});

test('states: disabled, readonly, invalid, required, hidden label, size; form value', async () => {
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ label: 'A', size }), new RegExp(`data-size="${size}"`));
  const html = await render({ label: 'A', readonly: true, invalid: true, required: true, hideLabel: true, name: 'n' });
  assert.match(html, /data-hide-label=""[^>]*data-readonly=""[^>]*data-invalid=""/);
  assert.match(html, /aria-invalid="true"[^>]*aria-required="true" aria-readonly="true"/);
  assert.match(html, /<input[^>]*name="n"/);
  const disabled = await render({ label: 'A', disabled: true, readonly: true });
  assert.match(disabled, /data-disabled=""/);
  assert.doesNotMatch(disabled, /data-readonly/);
  assert.match(disabled, /\sdisabled=""/);
  checks.push('sizes; readonly, invalid, required, hidden label, hidden form input; disabled wins over readonly');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
