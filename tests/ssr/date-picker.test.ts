import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/date-picker/DatePicker.svelte', props)).body;
const parts = (html: string) =>
  [...html.matchAll(/data-segment="(\w+)"[^>]*>([^<]*)</g)]
    .filter(([, part]) => part !== 'literal')
    .map(([, part, text]) => `${part}=${text}`)
    .join(' ');
after(async () => {
  writeSsrReport('date-picker', checks);
  await closeServer();
});

test('renders the parts of the value in the order of the locale, before hydration', async () => {
  assert.equal(parts(await render({ label: 'Due', value: '2026-07-14' })), 'month=07 day=14 year=2026');
  assert.equal(parts(await render({ label: 'Due', value: '2026-07-14', locale: 'fr' })), 'day=14 month=07 year=2026');
  assert.equal(parts(await render({ label: 'Due', value: '2026-07-14', locale: 'de' })), 'day=14 month=07 year=2026');
  assert.equal(
    parts(await render({ label: 'Due', value: '2026-07-14', locale: 'th-TH' })),
    'day=14 month=07 year=2026',
    'Gregorian'
  );
  assert.match(parts(await render({ label: 'Due', value: '2026-07-14', locale: 'ar-EG' })), /year=٢٠٢٦/);
  assert.equal(parts(await render({ label: 'Due', locale: 'fr' })), 'day=jj month=mm year=aaaa');
  checks.push('en, fr, de, th-TH (Gregorian), ar-EG digits, French placeholders rendered on the server');
});

test('a group named by the label; each part a spin button named by the label and the part; the calendar button', async () => {
  const html = await render({ label: 'Due', value: '2026-07-14', id: 'g' });
  assert.match(html, /<div class="ggb-date-picker" data-size="md">/);
  const group = html.match(/<div[^>]*class="ggb-date-picker__field"[^>]*>/)![0];
  assert.match(group, /role="group"/);
  assert.match(group, /\bid="g"/);
  assert.match(group, /data-complete=""/);
  assert.match(group, /aria-labelledby="ggb-date-picker-[^"]+-name"/);
  const day = html.match(/<span[^>]*data-segment="day"[^>]*>/)![0];
  assert.match(day, /role="spinbutton"/);
  assert.match(day, /aria-labelledby="ggb-date-picker-\S+-name ggb-date-picker-\S+-day"/);
  assert.match(day, /aria-valuenow="14"/);
  assert.doesNotMatch(day, /aria-label=|data-invalid/);
  assert.match(html, /-name" hidden="">Due<\/span>/);
  assert.match(html, /-day" hidden="">day<\/span>/);
  assert.match(await render({ label: 'Échéance', locale: 'fr' }), /-year" hidden="">année<\/span>/);
  const button = html.match(/<button[^>]*class="ggb-date-picker__button"[^>]*>/)![0];
  assert.match(button, /type="button"/);
  assert.match(button, /popovertarget="ggb-date-picker-[^"]+-panel"/);
  assert.match(button, /aria-haspopup="dialog"/);
  assert.match(button, /aria-expanded="false"/);
  assert.match(button, /aria-label="Choose date"/);
  assert.match(
    html,
    /<div id="ggb-date-picker-[^"]+-panel" class="ggb-date-picker__panel ggb-overlay" role="dialog" aria-labelledby="ggb-date-picker-[^"]+-heading" tabindex="-1" popover="auto">/
  );
  assert.doesNotMatch(html, /ggb-date-picker__day|role="grid"/, 'the calendar is rendered only once opened');
  checks.push(
    'group, named spin buttons (part names in the locale), calendar button controlling a dialog popover, no calendar before opening'
  );
});

test('empty parts expose no value; outside min..max is not invalid; states; sizes', async () => {
  const empty = await render({ label: 'A' });
  assert.doesNotMatch(empty, /data-complete|aria-valuenow|aria-valuetext/);
  const outside = await render({ label: 'A', value: '2026-01-01', min: '2026-06-01' });
  assert.doesNotMatch(outside, /aria-invalid|data-invalid/, 'the date picker never marks itself invalid');
  const ro = await render({ label: 'A', value: '2026-01-01', readonly: true, invalid: true, required: true });
  const roGroup = ro.match(/<div[^>]*class="ggb-date-picker__field"[^>]*>/)![0];
  assert.match(roGroup, /data-readonly=""/);
  assert.match(roGroup, /data-invalid=""/);
  const roDay = ro.match(/<span[^>]*data-segment="day"[^>]*>/)![0];
  assert.match(roDay, /aria-invalid="true"/);
  assert.match(roDay, /aria-required="true"/);
  assert.doesNotMatch(roDay, /contenteditable/);
  assert.match(ro, /class="ggb-date-picker__button"[^>]*disabled=""/);
  const dis = await render({ label: 'A', value: '2026-01-01', disabled: true, readonly: true });
  assert.match(dis, /data-disabled=""/);
  assert.doesNotMatch(dis, /data-readonly/);
  assert.match(dis, /class="ggb-date-picker__button"[^>]*disabled=""/);
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ label: 'A', size }), new RegExp(`data-size="${size}"`));
  checks.push('empty parts without value, no self-invalid, readonly and disabled disable the button, three sizes');
});

test('the hidden input submits the ISO date; an invalid date shows and submits as empty', async () => {
  assert.match(
    await render({ label: 'A', name: 'd', value: '2026-07-14' }),
    /<input type="hidden" name="d" value="2026-07-14"\/>/
  );
  assert.match(
    await render({ label: 'A', name: 'd', value: '2026-07-14', disabled: true }),
    /value="2026-07-14" disabled=""/
  );
  const bad = await render({ label: 'A', name: 'd', value: '2026-02-30' });
  assert.match(bad, /<input type="hidden" name="d" value=""\/>/);
  assert.doesNotMatch(bad, /data-complete/);
  checks.push('hidden input ISO, disabled; 2026-02-30 shows empty');
});

test('rejects a missing, empty or blank label outside a Field', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
