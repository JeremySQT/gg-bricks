import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { select: [], combobox: [] };
const select = async (props: Record<string, unknown>) =>
  (await renderComponent('components/select/Select.svelte', props)).body;
const combobox = async (props: Record<string, unknown>) =>
  (await renderComponent('components/combobox/Combobox.svelte', props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français', group: 'Europe' },
  { value: 'de', label: 'Deutsch', group: 'Europe', disabled: true }
];

test('Select: a combobox button controlling a list box in an auto popover; the value shows its label', async () => {
  const html = await select({ id: 's', label: 'Language', options, value: 'fr', name: 'lang' });
  assert.match(html, /<div class="ggb-select" data-size="md">/);
  assert.match(
    html,
    /<button type="button" id="s" class="ggb-select__trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="[^"]+" aria-label="Language"/
  );
  assert.match(html, /popovertarget="[^"]+-panel"/);
  assert.match(html, /<span class="ggb-select__value">Français<\/span>/);
  assert.match(html, /class="ggb-select__panel ggb-overlay" popover="auto"/);
  assert.match(html, /role="listbox" id="[^"]+" aria-label="Language"/);
  assert.match(html, /role="option" id="[^"]+-option-1" aria-selected="true"/);
  assert.match(html, /role="option" id="[^"]+-option-2" aria-selected="false" aria-disabled="true"/);
  assert.match(html, /class="ggb-select__group" role="group" aria-labelledby="[^"]+-group-1"/);
  assert.match(html, /class="ggb-select__group-heading" id="[^"]+-group-1" role="presentation">Europe</);
  assert.match(html, /<input type="hidden" name="lang" value="fr"/);
  checks.select.push('trigger: role combobox, list box popup, collapsed, named by label, toggles an auto popover');
  checks.select.push('value shows the selected label; options with aria-selected and aria-disabled; groups by heading');
  checks.select.push('name submits the value through a hidden input');
});

test('Select: placeholder without a value; states; readonly never opens; a name and options are required', async () => {
  const html = await select({
    label: 'Language',
    options,
    placeholder: 'Choose',
    size: 'lg',
    invalid: true,
    required: true
  });
  assert.match(html, /<span class="ggb-select__value" data-placeholder="">Choose<\/span>/);
  assert.match(html, /data-size="lg" data-invalid=""/);
  assert.match(html, /aria-invalid="true" aria-required="true"/);
  const ro = await select({ label: 'Language', options, readonly: true });
  assert.match(ro, /data-readonly=""/);
  assert.match(ro, /aria-readonly="true"/);
  assert.doesNotMatch(ro, /popovertarget=/);
  const off = await select({ label: 'Language', options, disabled: true });
  assert.match(off, /aria-label="Language"[^>]* disabled/);
  await assert.rejects(select({ options }), /non-empty label/);
  await assert.rejects(select({ label: 'L', options: [{ value: 'x', label: ' ' }] }), /non-empty label/);
  checks.select.push('placeholder while no option matches; size, invalid and required exposed');
  checks.select.push('readonly: aria-readonly and no popup target; disabled: disabled button');
  checks.select.push('missing accessible name and blank option labels are rejected');
});

test('Combobox: a text input with the combobox role controlling a list box in a manual popover', async () => {
  const html = await combobox({ id: 'c', label: 'Country', options, value: 'fr', name: 'country' });
  assert.match(
    html,
    /<input id="c" class="ggb-combobox__input" type="text" role="combobox" autocomplete="off" aria-autocomplete="list" aria-expanded="false" aria-controls="[^"]+" aria-label="Country"/
  );
  assert.match(html, /value="Français"/);
  assert.match(html, /class="ggb-combobox__panel ggb-overlay" popover="manual"/);
  assert.match(html, /role="option" id="[^"]+-option-1" aria-selected="true"/);
  assert.match(html, /<input type="hidden" name="country" value="fr"/);
  assert.match(html, /class="ggb-combobox__empty" role="status"><\/div>/);
  assert.match(html, /class="ggb-combobox__indicator" aria-hidden="true"/);
  checks.combobox.push('input: role combobox, list autocomplete, collapsed, named by label; manual popover panel');
  checks.combobox.push('the text shows the selected label; the hidden input submits the value; an empty polite status');
});

test('Combobox: states; readonly input; a name and options are required', async () => {
  const html = await combobox({ label: 'Country', options, placeholder: 'Search', readonly: true, invalid: true });
  assert.match(html, /placeholder="Search" readonly/);
  assert.match(html, /data-readonly="" data-invalid=""/);
  const off = await combobox({ label: 'Country', options, disabled: true, size: 'sm' });
  assert.match(off, /data-size="sm" data-disabled=""/);
  assert.match(off, / disabled/);
  await assert.rejects(combobox({ options }), /non-empty label/);
  await assert.rejects(combobox({ label: 'C', options: [{ value: 'x' }] }), /non-empty label/);
  checks.combobox.push('readonly, invalid, disabled and size rendered; missing name and blank option labels rejected');
});
