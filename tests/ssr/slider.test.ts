import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/slider/Slider.svelte', props)).body;
const thumb = (html: string) => html.match(/<span[^>]*class="ggb-slider__thumb"[^>]*>/)![0];
after(async () => {
  writeSsrReport('slider', checks);
  await closeServer();
});

test('the thumb is a named slider placed from the value before any script runs', async () => {
  const html = await render({ label: 'Volume', value: 40 });
  assert.match(html, /<div class="ggb-slider" style="--_fraction: 0.4;">/);
  const t = thumb(html);
  assert.match(t, /role="slider"/);
  assert.match(t, /aria-valuemin="0"/);
  assert.match(t, /aria-valuemax="100"/);
  assert.match(t, /aria-valuenow="40"/);
  assert.match(t, /aria-valuetext="40"/);
  assert.match(t, /aria-label="Volume"/);
  assert.match(t, /tabindex="0"/);
  assert.doesNotMatch(t, /style=/, 'no measured inline position');
  assert.doesNotMatch(html, /ggb-slider__value|type="hidden"/);
  checks.push(
    'role slider, value, bounds, value text and name; fraction written as a custom property; no inline thumb position'
  );
});

test('the shown value is within the bounds and at the nearest step, max always reachable', async () => {
  assert.match(await render({ label: 'A', value: 150 }), /--_fraction: 1;/);
  assert.match(await render({ label: 'A', value: -5 }), /--_fraction: 0;/);
  assert.match(thumb(await render({ label: 'A', value: 10, min: 0, max: 10, step: 3 })), /aria-valuenow="10"/);
  assert.match(thumb(await render({ label: 'A', value: 8.6, min: 0, max: 10, step: 3 })), /aria-valuenow="9"/);
  assert.match(thumb(await render({ label: 'A', value: 0.36, min: 0, max: 1, step: 0.1 })), /aria-valuenow="0.4"/);
  checks.push('clamped, snapped to the step counted from min, max reachable with step 3, decimal steps');
});

test('showValue reserves the widest bound; locale formatting; hidden input; disabled', async () => {
  const fr = await render({ label: 'A', value: 0.5, min: 0, max: 1, step: 0.05, showValue: true, locale: 'fr' });
  assert.match(fr, /data-show-value=""/);
  assert.match(
    fr,
    /<span class="ggb-slider__value" aria-hidden="true"><span class="ggb-slider__value-text">0,5<\/span> <span class="ggb-slider__value-sizer">0<\/span> <span class="ggb-slider__value-sizer">1<\/span><\/span>/
  );
  assert.match(thumb(fr), /aria-valuetext="0,5"/);
  assert.match(await render({ label: 'A', value: 30, name: 'v' }), /<input type="hidden" name="v" value="30"\/>/);
  const dis = await render({ label: 'A', value: 30, name: 'v', disabled: true });
  assert.match(dis, /data-disabled=""/);
  assert.match(dis, /value="30" disabled=""/);
  assert.doesNotMatch(thumb(dis), /tabindex="0"/);
  checks.push('value text and sizers in fr, hidden input, disabled out of the tab order and not submitted');
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
