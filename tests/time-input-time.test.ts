// TimeInput parts (packages/svelte/src/components/time-input/time.ts): layout per locale and hour cycle, typing,
// stepping and the value.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutOf, partsOf, stepPart, typeDigit, valueOf } from '../packages/svelte/src/components/time-input/time.ts';

const order = (locale: string, cycle: 'auto' | 'h12' | 'h23', seconds = false) =>
  layoutOf(locale, cycle, seconds)
    .items.map((i) => ('part' in i ? i.part : `'${i.literal.replace(/\s/g, ' ')}'`))
    .join(' ');

test('order, separators, hour cycle and day period texts come from the locale', () => {
  assert.equal(order('en', 'auto'), "hour ':' minute ' ' dayPeriod");
  assert.equal(order('fr', 'auto'), "hour ':' minute");
  assert.equal(order('fr', 'h12'), "hour ':' minute ' ' dayPeriod", 'h12 forced on a 24-hour locale has a period');
  assert.equal(order('en', 'h23', true), "hour ':' minute ':' second");
  assert.equal(order('ko', 'auto'), "dayPeriod ' ' hour ':' minute");
  const ko = layoutOf('ko', 'auto', false);
  assert.deepEqual([ko.twelve, ko.am, ko.pm], [true, '오전', '오후'], 'not AM and PM outside English');
  const gb = layoutOf('en-GB', 'h12', false);
  assert.deepEqual([gb.am, gb.pm], ['am', 'pm']);
  assert.equal(layoutOf('ja', 'h12', false).twelve, true, 'h11 locales are shown 1 to 12');
});

test('a 24-hour value becomes shown parts and back', () => {
  assert.deepEqual(partsOf('14:05', true), { hour: 2, minute: 5, second: 0, dayPeriod: 'pm' });
  assert.deepEqual(partsOf('00:30', true), { hour: 12, minute: 30, second: 0, dayPeriod: 'am' });
  assert.deepEqual(partsOf('14:05:09', false), { hour: 14, minute: 5, second: 9, dayPeriod: null });
  for (const bad of ['', '25:00', '12:60', '1:05', 'noon'])
    assert.deepEqual(partsOf(bad, false), { hour: null, minute: null, second: null, dayPeriod: null }, bad);
  assert.equal(valueOf(partsOf('14:05', true), true, false), '14:05');
  assert.equal(valueOf(partsOf('12:30', true), true, false), '12:30');
  assert.equal(valueOf(partsOf('00:30', true), true, false), '00:30');
  assert.equal(valueOf(partsOf('14:05:09', false), false, false), '14:05', 'seconds dropped without seconds');
  assert.equal(valueOf({ hour: 2, minute: 5, second: null, dayPeriod: null }, true, false), '', 'period missing');
  assert.equal(valueOf({ hour: 2, minute: 5, second: null, dayPeriod: null }, false, true), '', 'seconds missing');
});

test('Up and Down wrap within the range; from empty they start at either end; the period toggles', () => {
  const empty = partsOf('', true);
  assert.equal(stepPart(empty, 'hour', 1, true).hour, 1);
  assert.equal(stepPart(empty, 'hour', -1, true).hour, 12);
  assert.equal(stepPart(partsOf('', false), 'hour', -1, false).hour, 23);
  assert.equal(stepPart(partsOf('12:00', true), 'hour', 1, true).hour, 1);
  assert.equal(stepPart(partsOf('10:59', false), 'minute', 1, false).minute, 0);
  assert.equal(stepPart(partsOf('10:00', true), 'dayPeriod', 1, true).dayPeriod, 'pm');
  assert.equal(stepPart(empty, 'dayPeriod', 1, true).dayPeriod, 'am');
});

test('digits fill a part and complete it when no further digit can follow', () => {
  assert.deepEqual(typeDigit('hour', '', 1, true), { value: 1, buffer: '1', complete: false });
  assert.deepEqual(typeDigit('hour', '1', 2, true), { value: 12, buffer: '', complete: true });
  assert.deepEqual(typeDigit('hour', '', 3, true), { value: 3, buffer: '', complete: true });
  assert.deepEqual(typeDigit('hour', '', 2, false), { value: 2, buffer: '2', complete: false });
  assert.deepEqual(typeDigit('hour', '2', 3, false), { value: 23, buffer: '', complete: true });
  assert.deepEqual(typeDigit('hour', '2', 5, false), { value: 5, buffer: '', complete: true }, '25 restarts at 5');
  assert.deepEqual(typeDigit('minute', '', 7, false), { value: 7, buffer: '', complete: true });
  assert.deepEqual(typeDigit('hour', '', 0, true), { value: null, buffer: '0', complete: false });
  assert.deepEqual(typeDigit('hour', '0', 0, true), { value: 12, buffer: '', complete: true }, '00 is 12');
});

test('bounds: Up and Down skip the times outside min and max; a typed time outside becomes the nearest bound', async () => {
  const { secondsOf, stepPartWithin, clampValue, withinBounds } =
    await import('../packages/svelte/src/components/time-input/time.ts');
  const bounds = { min: secondsOf('09:00'), max: secondsOf('18:00') };
  const empty24 = partsOf('', false);
  assert.equal(stepPartWithin(empty24, 'hour', 1, false, false, bounds).hour, 9, 'from empty, Up starts at min');
  assert.equal(stepPartWithin(empty24, 'hour', -1, false, false, bounds).hour, 18, 'from empty, Down starts at max');
  assert.equal(stepPartWithin(partsOf('18:00', false), 'hour', 1, false, false, bounds).hour, 9, 'wraps within bounds');
  assert.equal(stepPartWithin(partsOf('18:00', false), 'minute', 1, false, false, bounds).minute, 0, 'no later minute');
  assert.equal(
    stepPartWithin(partsOf('10:00', true), 'dayPeriod', 1, true, false, bounds).dayPeriod,
    'am',
    '22:00 is outside: the period does not change'
  );
  assert.equal(stepPartWithin(partsOf('10:00', false), 'hour', 1, false, false, {}).hour, 11, 'no bounds');
  assert.equal(withinBounds(partsOf('07:30', false), false, false, bounds), false);
  assert.equal(withinBounds({ hour: 8, minute: null, second: null, dayPeriod: null }, false, false, bounds), false);
  assert.equal(
    withinBounds({ hour: 6, minute: null, second: null, dayPeriod: null }, true, false, bounds),
    true,
    '6 PM'
  );
  assert.equal(clampValue('19:30', bounds, false), '18:00');
  assert.equal(clampValue('07:05', bounds, false), '09:00');
  assert.equal(clampValue('12:00', bounds, false), '12:00');
  assert.equal(clampValue('19:30:15', bounds, true), '18:00:00');
  assert.equal(clampValue('', bounds, false), '');
});
