import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/FieldWith.svelte', props)).body;
after(async () => {
  writeSsrReport('field', checks);
  await closeServer();
});

test('stacks label, description, control and message, and links them to a text entry', async () => {
  const html = await render({ id: 'f', description: 'Help', invalid: true, message: 'Wrong' });
  assert.match(html, /<div id="f" class="ggb-field"[^>]*data-invalid=""/);
  assert.match(html, /<label class="ggb-field__label" id="f-label" for="f-control">Email/);
  assert.match(
    html,
    /<input id="f-control"[^>]*aria-invalid="true"[^>]*aria-labelledby="f-label" aria-describedby="f-description f-message"/
  );
  const order = ['ggb-field__label', 'ggb-field__description', 'ggb-field__control', 'ggb-field__message'].map((c) =>
    html.indexOf(c)
  );
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order
  );
  assert.match(
    html,
    /class="ggb-field__message" id="f-message"><svg class="ggb-field__messageIcon"[^>]*aria-hidden="true"/
  );
  assert.match(html, /<span class="ggb-field__messageText">Wrong<\/span>/);
  checks.push('order label, description, control, message; for/id; aria-describedby description then message');
});

test('the message shows only while invalid and non-empty; the description alone describes the control', async () => {
  for (const props of [{ message: 'Wrong' }, { invalid: true }, { invalid: true, message: '  ' }]) {
    const html = await render({ id: 'f', ...props });
    assert.doesNotMatch(html, /ggb-field__message/);
    assert.doesNotMatch(html, /aria-describedby/);
  }
  const html = await render({ id: 'f', description: 'Help' });
  assert.match(html, /aria-describedby="f-description"/);
  checks.push('message absent unless invalid with text; description alone');
});

test('required shows a hidden asterisk and makes the control required; disabled disables it', async () => {
  const required = await render({ id: 'f', required: true });
  assert.match(required, /<span class="ggb-field__requiredIndicator" aria-hidden="true">\u00a0\*<\/span>/);
  assert.match(required, /<input[^>]*\srequired=""/);
  const disabled = await render({ id: 'f', disabled: true });
  assert.match(disabled, /class="ggb-field"[^>]*data-disabled=""/);
  assert.match(disabled, /<input[^>]*\sdisabled=""/);
  const own = await render({ id: 'f', controlProps: { invalid: true } });
  assert.match(own, /aria-invalid="true"/);
  checks.push('required asterisk hidden, required/disabled/invalid passed to the control, control props kept');
});

test('a radio group is named by the field label; a checkbox sits in a group named by it', async () => {
  const group = await render({ id: 'f', control: 'radio-group', description: 'Help', invalid: true, message: 'Pick' });
  assert.match(group, /role="radiogroup"/);
  assert.match(
    group,
    /aria-labelledby="f-label"[^>]*aria-describedby="f-description f-message"[^>]*aria-invalid="true"/
  );
  const checkbox = await render({ id: 'f', control: 'checkbox', required: true });
  assert.match(checkbox, /<div class="ggb-checkbox__group" role="group" aria-labelledby="f-label">/);
  assert.match(checkbox, /role="checkbox"[^>]*aria-required="true"/);
  checks.push('radiogroup aria-labelledby and describedby; checkbox wrapped in a named group');
});

test('a control with an id of its own: the label targets it and also names it through aria-labelledby', async () => {
  const html = await render({ id: 'f', controlProps: { id: 'mine' } });
  assert.match(html, /<input id="mine"[^>]*aria-labelledby="f-label"/);
  checks.push('custom control id named through aria-labelledby (the label for follows after registration)');
});

test('textarea in a field', async () => {
  const html = await render({ id: 'f', control: 'textarea', required: true });
  assert.match(html, /<textarea id="f-control"[^>]*\srequired=""/);
  checks.push('textarea id from the field');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
