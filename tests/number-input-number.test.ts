// NumberInput reading, formatting and stepping (packages/svelte/src/components/number-input/number.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decimalsOf,
  formatNumber,
  parseNumber,
  plainNumber,
  stepValue
} from '../packages/svelte/src/components/number-input/number.ts';

test('reads typed text for the locale: grouping and spaces ignored, decimal separator, period, minus', () => {
  assert.equal(parseNumber('1 234,5', 'fr'), 1234.5);
  assert.equal(parseNumber('1\u202f234,5', 'fr'), 1234.5);
  assert.equal(parseNumber('1234.5', 'fr'), 1234.5, 'the period is accepted where it does not group');
  assert.equal(parseNumber('1.234,5', 'de'), 1234.5);
  assert.equal(parseNumber('1.5', 'de'), 15, 'in German the period groups digits');
  assert.equal(parseNumber("1'234.5", 'de-CH'), 1234.5);
  assert.equal(parseNumber('1\u2019234.5', 'de-CH'), 1234.5);
  assert.equal(parseNumber('1,234.5', 'en'), 1234.5);
  assert.equal(parseNumber('-3', 'en'), -3);
  assert.equal(parseNumber('\u22123', 'en'), -3);
  assert.equal(parseNumber('\u0661\u0662\u0663', 'ar-EG'), 123, 'the locale digits are read');
  assert.equal(parseNumber('', 'en'), undefined);
  assert.equal(parseNumber('   ', 'en'), undefined);
  for (const bad of ['abc', '1e3', '--1', '1.2.3', '1-'])
    assert.ok(Number.isNaN(parseNumber(bad, 'en') as number), bad);
});

test('formats with the fraction digits of step, more when the value has more, never rounding', () => {
  assert.equal(formatNumber(2.5, 'en', 0.01), '2.50');
  assert.equal(formatNumber(2.5, 'fr', 0.01), '2,50');
  assert.equal(formatNumber(1.237, 'en', 0.01), '1.237');
  assert.equal(formatNumber(1234567, 'en', 1), '1,234,567');
  assert.equal(formatNumber(undefined, 'en', 1), '');
  assert.equal(decimalsOf(1e-7), 7);
  assert.equal(plainNumber(1234.5), '1234.5');
  assert.equal(plainNumber(1e-7), '0.0000001');
  assert.equal(plainNumber(undefined), '');
});

test('steps to the next multiple of step from min (or zero), by whole steps, within min and max, in decimals', () => {
  assert.equal(stepValue(0.1, 1, 0.1), 0.2);
  assert.equal(stepValue(0.2, 1, 0.1), 0.3, '0.2 + 0.1 is 0.3');
  assert.equal(stepValue(1.237, 1, 0.01), 1.24);
  assert.equal(stepValue(1.237, -1, 0.01), 1.23);
  assert.equal(stepValue(4, 1, 2, 1), 5, 'multiples of 2 counted from min 1');
  assert.equal(stepValue(3, 10, 1, 0, 8), 8, 'clamped to max');
  assert.equal(stepValue(3, -10, 1, 0, 8), 0, 'clamped to min');
  assert.equal(stepValue(5, 10, 1), 15, 'ten steps');
  assert.equal(stepValue(undefined, 1, 1, 5), 5, 'from no value, up starts at min');
  assert.equal(stepValue(undefined, -1, 1, undefined, 9), 9, 'from no value, down starts at max');
  assert.equal(stepValue(undefined, 1, 1), 0, 'otherwise at zero');
});
