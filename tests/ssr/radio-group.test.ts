import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/Group.svelte', props)).body;
after(async () => {
  writeSsrReport('radio-group', checks);
  writeSsrReport('radio', radioChecks);
  await closeServer();
});
const radioChecks: string[] = [];

test('a named radiogroup of radios; the value selects one radio, which is the only tab stop', async () => {
  const html = await render({ value: 'express' });
  assert.match(
    html,
    /<div class="ggb-radio-group" data-size="md" aria-label="Delivery"[^>]*role="radiogroup"[^>]*data-orientation="vertical"/
  );
  assert.equal(html.match(/role="radio"/g)?.length, 3);
  assert.match(
    html,
    /id="r-express" data-value="express"[^>]*aria-checked="true"[^>]*tabindex="0">(<!--[^>]*-->)*<svg class="ggb-radio__circle" aria-hidden="true" focusable="false"><circle class="ggb-radio__ring"><\/circle>(<!--[^>]*-->)*<circle class="ggb-radio__mark">/
  );
  assert.match(
    html,
    /id="r-standard"[^>]*aria-checked="false"[^>]*tabindex="-1">(<!--[^>]*-->)*<svg class="ggb-radio__circle"[^>]*><circle class="ggb-radio__ring"><\/circle>(<!--[^>]*-->)*<\/svg>/
  );
  checks.push('radiogroup role and name, three radios, selected radio checked with the dot and the only tab stop');
  radioChecks.push('radio role, aria-labelledby to its label, dot only when selected');
});

test('group options reach every radio: size, readonly, invalid, disabled; orientation; required', async () => {
  for (const size of ['sm', 'md', 'lg']) {
    const html = await render({ size });
    assert.equal(html.match(new RegExp(`class="ggb-radio" data-size="${size}"`, 'g'))?.length, 3);
  }
  const html = await render({ readonly: true, invalid: true, required: true, orientation: 'horizontal' });
  assert.match(
    html,
    /aria-invalid="true"[^>]*aria-required="true"[^>]*aria-readonly="true"[^>]*data-orientation="horizontal"/
  );
  assert.equal(html.match(/class="ggb-radio" data-size="md" data-readonly="" data-invalid=""/g)?.length, 3);
  const disabled = await render({ disabled: true, readonly: true });
  assert.equal(disabled.match(/class="ggb-radio" data-size="md" data-disabled=""/g)?.length, 3);
  assert.doesNotMatch(disabled, /class="ggb-radio"[^>]*data-readonly/);
  checks.push('size, readonly, invalid, disabled and orientation applied; disabled wins over readonly');
  radioChecks.push('size, readonly and invalid inherited from the group');
});

test('one radio disabled on its own; descriptions describe the radio', async () => {
  const html = await render({ radios: { express: { disabled: true, description: 'Next day' } } });
  assert.match(html, /<label class="ggb-radio" data-size="md" data-disabled="">[\s\S]*?id="r-express"/);
  assert.match(html, /aria-describedby="r-express-description"/);
  assert.match(html, /<span class="ggb-radio__description" id="r-express-description">Next day<\/span>/);
  radioChecks.push('own disabled, description');
});

test('rejects a group without a name, a radio without a label, and a radio outside a group', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  await assert.rejects(() => render({ radios: { express: { label: ' ' } } }), /Radio requires a non-empty label/);
  await assert.rejects(
    () => renderComponent('../../../tests/ssr/fixtures/LoneRadio.svelte', {}),
    /Radio must be placed inside a RadioGroup/
  );
  checks.push('group label required outside a Field');
  radioChecks.push('label required; a radio outside a group is rejected');
});
