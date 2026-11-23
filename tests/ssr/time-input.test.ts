import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/time-input/TimeInput.svelte', props)).body;
const parts = (html: string) =>
  [...html.matchAll(/data-part="(\w+)"[^>]*>([^<]*)</g)].map(([, part, text]) => `${part}=${text}`).join(' ');
after(async () => {
  writeSsrReport('time-input', checks);
  await closeServer();
});

test('renders the parts of the value in the order of the locale, before hydration', async () => {
  assert.equal(parts(await render({ label: 'Start', value: '14:05' })), 'hour=02 minute=05 dayPeriod=PM');
  assert.equal(parts(await render({ label: 'Start', value: '14:05', locale: 'fr' })), 'hour=14 minute=05');
  assert.equal(
    parts(await render({ label: 'Start', value: '14:05', locale: 'fr', hourCycle: 'h12' })),
    'hour=02 minute=05 dayPeriod=PM'
  );
  assert.equal(
    parts(await render({ label: 'Start', value: '14:05', locale: 'ko' })),
    'dayPeriod=오후 hour=02 minute=05'
  );
  assert.equal(
    parts(await render({ label: 'Start', value: '09:05:07', hourCycle: 'h23', seconds: true })),
    'hour=09 minute=05 second=07'
  );
  assert.equal(
    parts(await render({ label: 'Start', value: '09:05', locale: 'ar-EG', hourCycle: 'h23' })),
    'hour=٠٩ minute=٠٥'
  );
  checks.push('en, fr, fr h12, ko (오후), seconds, Arabic-Indic digits rendered on the server');
});

test('each part is a named spin button; the container is the group; empty parts show dashes', async () => {
  const html = await render({ label: 'Start', value: '14:05', id: 'g' });
  assert.match(
    html,
    /<div id="g" class="ggb-time-input" role="group" data-size="md" data-complete="" aria-labelledby="ggb-time-input-[^"]+-name"/
  );
  const hour = html.match(/<span class="ggb-time-input__segment" data-part="hour"[^>]*>/)![0];
  assert.match(hour, /role="spinbutton"/);
  assert.match(hour, /tabindex="0"/);
  assert.match(hour, /contenteditable="true"/);
  assert.match(hour, /inputmode="numeric"/);
  assert.match(hour, /aria-labelledby="ggb-time-input-\S+-name ggb-time-input-\S+-hour"/);
  assert.match(hour, /aria-valuemin="1" aria-valuemax="12" aria-valuenow="2" aria-valuetext="02"/);
  assert.match(html, /<span id="ggb-time-input-[^"]+-name" hidden="">Start<\/span>/);
  assert.match(html, /-hour" hidden="">hour<\/span>/);
  assert.match(html, /-dayPeriod" hidden="">AM\/PM<\/span>/);
  assert.match(html, /<span class="ggb-time-input__literal" aria-hidden="true">:<\/span>/);
  const fr = await render({ label: 'Début', locale: 'fr' });
  assert.match(fr, /-hour" hidden="">heure<\/span>/);
  assert.match(fr, /-minute" hidden="">minute<\/span>/);
  const empty = await render({ label: 'Start' });
  assert.doesNotMatch(empty, /data-complete|aria-valuenow|aria-valuetext/);
  assert.match(empty, /data-part="hour" data-empty=""[^>]*>––</);
  checks.push(
    'group named by the label, spin buttons named by label and part (in the locale), empty parts without value'
  );
});

test('states: readonly keeps focus but not editing; disabled leaves the tab order; invalid and required', async () => {
  const ro = await render({ label: 'A', value: '10:00', readonly: true, invalid: true, required: true });
  assert.match(ro, /data-readonly=""[^>]*data-invalid=""/);
  assert.doesNotMatch(ro, /contenteditable/);
  assert.match(ro, /tabindex="0"[^>]*aria-invalid="true" aria-required="true" aria-readonly="true"/);
  const dis = await render({ label: 'A', value: '10:00', disabled: true, readonly: true });
  assert.match(dis, /data-disabled=""/);
  assert.doesNotMatch(dis, /data-readonly|tabindex|contenteditable/);
  assert.match(dis, /role="group"[^>]*aria-disabled="true"/);
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ label: 'A', size }), new RegExp(`data-size="${size}"`));
  checks.push('readonly, disabled (wins over readonly), invalid, required, three sizes');
});

test('the hidden input submits the value; invalid values show as empty', async () => {
  assert.match(
    await render({ label: 'A', name: 't', value: '07:30' }),
    /<input type="hidden" name="t" value="07:30"\/>/
  );
  assert.match(await render({ label: 'A', name: 't', value: '07:30:15', seconds: true }), /value="07:30:15"/);
  assert.match(await render({ label: 'A', name: 't', value: '07:30', disabled: true }), /value="07:30" disabled=""/);
  const bad = await render({ label: 'A', name: 't', value: '25:99' });
  assert.match(bad, /<input type="hidden" name="t" value=""\/>/);
  assert.doesNotMatch(bad, /data-complete/);
  checks.push('hidden input HH:mm, HH:mm:ss, disabled; an invalid value shows empty and submits empty');
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
