import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/number-input/NumberInput.svelte', props)).body;
after(async () => {
  writeSsrReport('number-input', checks);
  await closeServer();
});

test('renders a spin button between two steppers, formatted for the locale, with md defaults', async () => {
  const html = await render({ label: 'Quantity', value: 1234.5, min: 0, max: 5000, step: 0.01, locale: 'fr' });
  assert.match(html, /<div class="ggb-number-input" data-size="md" data-steppers="">/);
  assert.match(
    html,
    /<button type="button" class="ggb-number-input__stepper ggb-number-input__decrease" tabindex="-1" aria-label="Decrease">/
  );
  assert.match(
    html,
    /<button type="button" class="ggb-number-input__stepper ggb-number-input__increase" tabindex="-1" aria-label="Increase">/
  );
  const input = html.match(/<input [^>]*class="ggb-number-input__input"[^>]*>/)![0];
  assert.match(input, /type="text"/);
  assert.match(input, /role="spinbutton"/);
  assert.match(input, /inputmode="decimal"/);
  assert.match(input, /value="1 234,50"/);
  assert.match(input, /aria-valuenow="1234.5"/);
  assert.match(input, /aria-valuemin="0"/);
  assert.match(input, /aria-valuemax="5000"/);
  assert.match(input, /aria-valuetext="1 234,50"/);
  assert.match(input, /aria-label="Quantity"/);
  assert.doesNotMatch(html, /type="hidden"|aria-invalid|disabled|readonly/);
  checks.push(
    'spin button with value, min, max and formatted text in fr; steppers out of the tab order; no hidden input without name'
  );
});

test('an empty field has no value attributes; the input mode follows min and step', async () => {
  const empty = await render({ label: 'A', placeholder: '0' });
  assert.match(empty, /value=""/);
  assert.match(empty, /placeholder="0"/);
  assert.doesNotMatch(empty, /aria-valuenow|aria-valuetext|aria-valuemin|aria-valuemax/);
  assert.match(empty, /inputmode="text"/, 'a minus sign may be typed');
  assert.match(await render({ label: 'A', min: 0 }), /inputmode="numeric"/);
  assert.match(await render({ label: 'A', min: 0, step: 0.5 }), /inputmode="decimal"/);
  checks.push('empty field without aria-value*; inputmode text, numeric or decimal');
});

test('steppers are disabled at the bounds, when disabled or readonly, and absent with hideSteppers', async () => {
  const atMin = await render({ label: 'A', value: 0, min: 0, max: 10 });
  assert.match(atMin, /ggb-number-input__decrease" tabindex="-1" aria-label="Decrease" disabled=""/);
  assert.doesNotMatch(atMin, /ggb-number-input__increase" tabindex="-1" aria-label="Increase" disabled=""/);
  const atMax = await render({ label: 'A', value: 10, min: 0, max: 10, decreaseLabel: 'Moins', increaseLabel: 'Plus' });
  assert.match(atMax, /aria-label="Plus" disabled=""/);
  assert.match(atMax, /aria-label="Moins">/);
  const readonly = await render({ label: 'A', value: 3, readonly: true, invalid: true, required: true });
  assert.equal(readonly.match(/\sdisabled=""/g)?.length, 2);
  assert.match(readonly, /data-readonly=""[^>]*data-invalid=""/);
  assert.match(readonly, /readonly=""[^>]*required=""/);
  assert.match(readonly, /aria-invalid="true"/);
  const disabled = await render({ label: 'A', value: 3, disabled: true, readonly: true });
  assert.match(disabled, /data-disabled=""/);
  assert.doesNotMatch(disabled, /data-readonly/);
  assert.equal(disabled.match(/\sdisabled=""/g)?.length, 3);
  const plain = await render({ label: 'A', hideSteppers: true });
  assert.doesNotMatch(plain, /ggb-number-input__stepper|data-steppers/);
  checks.push(
    'steppers disabled at min and max, readonly and disabled; custom labels; hideSteppers; disabled wins over readonly'
  );
});

test('sizes, the hidden form input and native attributes', async () => {
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ label: 'A', size }), new RegExp(`data-size="${size}"`));
  const named = await render({
    label: 'A',
    name: 'qty',
    value: 1234.5,
    locale: 'de',
    id: 'x',
    class: 'c',
    autocomplete: 'on'
  });
  assert.match(named, /<input type="hidden" name="qty" value="1234.5"/);
  assert.match(named, /<div class="ggb-number-input c"/);
  assert.match(named, /class="ggb-number-input__input"[^>]*/);
  assert.match(named, /\bid="x"/);
  assert.match(named, /autocomplete="on"/);
  assert.match(await render({ label: 'A', name: 'q' }), /<input type="hidden" name="q" value=""/);
  assert.match(
    await render({ label: 'A', name: 'q', value: 2, disabled: true }),
    /<input type="hidden" name="q" value="2" disabled=""/
  );
  checks.push('three sizes; hidden input with a plain decimal, empty, disabled; id, class and autocomplete placed');
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
