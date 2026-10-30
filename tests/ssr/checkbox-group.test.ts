import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/CheckGroup.svelte', props)).body;
after(async () => {
  writeSsrReport('checkbox-group', checks);
  await closeServer();
});

test('a named group of checkboxes; the value checks its checkboxes, each one a tab stop', async () => {
  const html = await render({ value: ['sms', 'unknown'] });
  assert.match(
    html,
    /<div class="ggb-checkbox-group" data-orientation="vertical" data-size="md" aria-label="Channels"[^>]*role="group"/
  );
  assert.equal(html.match(/role="checkbox"/g)?.length, 3);
  assert.doesNotMatch(html, /tabindex="-1"/);
  assert.match(
    html,
    /<label class="ggb-checkbox" data-size="md" data-selection="on">(<!--[^>]*-->)*<button data-checkbox-value="sms"[^>]*aria-checked="true"[^>]*>(<!--[^>]*-->)*<svg class="ggb-checkbox__mark"/
  );
  assert.equal(html.match(/data-selection="off"/g)?.length, 2);
  assert.equal(html.match(/aria-checked="false"/g)?.length, 2);
  checks.push('group role and name, three checkboxes, checked from the value on the server, unknown values ignored');
});

test('group options reach every checkbox: size, readonly, invalid, disabled; required stays off the checkboxes', async () => {
  for (const size of ['sm', 'md', 'lg']) {
    const html = await render({ size, boxes: { sms: { size: 'lg' } } });
    assert.equal(html.match(new RegExp(`class="ggb-checkbox" data-size="${size}"`, 'g'))?.length, 3);
  }
  const html = await render({ readonly: true, invalid: true, required: true, orientation: 'horizontal' });
  assert.match(html, /class="ggb-checkbox-group" data-orientation="horizontal"[^>]*data-invalid="" data-required=""/);
  assert.equal(
    html.match(/class="ggb-checkbox" data-size="md" data-selection="off" data-readonly="" data-invalid=""/g)?.length,
    3
  );
  assert.equal(html.match(/aria-invalid="true"/g)?.length, 3);
  assert.equal(html.match(/aria-readonly="true"/g)?.length, 3);
  assert.doesNotMatch(html, /aria-required="true"/);
  const disabled = await render({ disabled: true, readonly: true });
  assert.equal(disabled.match(/class="ggb-checkbox" data-size="md" data-selection="off" data-disabled=""/g)?.length, 3);
  assert.doesNotMatch(disabled, /class="ggb-checkbox"[^>]*data-readonly/);
  checks.push(
    'size, readonly, invalid, disabled and orientation applied to every checkbox; disabled wins over readonly'
  );
  checks.push('required marks the group (data-required) and never sets aria-required on a checkbox');
});

test('one checkbox disabled on its own; descriptions describe the checkbox; never indeterminate', async () => {
  const html = await render({
    value: ['email'],
    boxes: { sms: { disabled: true, description: 'Urgent only' }, email: { indeterminate: true } }
  });
  assert.match(html, /data-selection="off" data-disabled="">[\s\S]*?data-checkbox-value="sms"/);
  assert.match(html, /aria-describedby="c-sms-description"/);
  assert.doesNotMatch(html, /aria-checked="mixed"/);
  checks.push('own disabled, description, indeterminate ignored inside a group');
});

test('named by the enclosing Field label and described by its description and message', async () => {
  const html = (
    await renderComponent('../../../tests/ssr/fixtures/FieldWith.svelte', {
      id: 'f',
      control: 'checkbox-group',
      required: true,
      invalid: true,
      description: 'Select at least one',
      message: 'Pick one'
    })
  ).body;
  assert.match(
    html,
    /class="ggb-checkbox-group"[^>]*data-invalid="" data-required="" aria-labelledby="f-label" aria-describedby="f-description f-message"[^>]*role="group"/
  );
  assert.match(html, /<span class="ggb-field__requiredIndicator" aria-hidden="true">/);
  assert.doesNotMatch(html, /ggb-checkbox__group/);
  assert.doesNotMatch(html, /aria-required="true"/);
  assert.equal(html.match(/aria-invalid="true"/g)?.length, 2);
  checks.push('Field label names the group, description and message describe it; checkboxes are not wrapped again');
});

test('rejects a group without a name and a checkbox without a value', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  await assert.rejects(() => render({ boxes: { sms: { value: '' } } }), /requires a value/);
  checks.push('group label required outside a Field; a checkbox of a group requires a value');
});
