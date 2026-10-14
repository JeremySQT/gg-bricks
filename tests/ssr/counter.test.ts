import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/counter/Counter.svelte', props)).body;
/** Visible text of the value part (hydration markers may surround it). */
const shown = (html: string) =>
  html.match(/<span class="ggb-counter__value">(?:<!--[^>]*-->)*([^<]*)(?:<!--[^>]*-->)*<\/span>/)?.[1];
/** Text content of the whole counter, tags and hydration markers removed, whitespace collapsed. */
const text = (html: string) =>
  html
    .replace(/<!--[^>]*-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
// The component formats with the locale of the environment; the expectations use the same formatter.
const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
after(async () => {
  writeSsrReport('counter', checks);
  await closeServer();
});

test('renders a span with defaults, anatomy and 0 as the value', async () => {
  const html = await render({});
  assert.match(html, /^(<!--[^>]*-->)*<span\b/);
  assert.match(html, /class="ggb-counter"/);
  assert.match(html, /data-size="md"/);
  assert.equal(shown(html), '0');
  assert.doesNotMatch(html, /data-overflow|ggb-counter__label|role=|tabindex=|aria-/);
  assert.equal(text(html), '0');
  checks.push('defaults: span, class, data-size md, value 0, no overflow, no label, no role');
});

test('shows the value as a non-negative integer', async () => {
  assert.equal(shown(await render({ value: 0 })), '0');
  assert.equal(shown(await render({ value: 8 })), '8');
  assert.equal(shown(await render({ value: 99 })), '99');
  assert.equal(shown(await render({ value: 7.9 })), '7');
  assert.equal(shown(await render({ value: -5 })), '0');
  assert.equal(shown(await render({ value: Number.NaN })), '0');
  assert.equal(shown(await render({ value: 1234, max: 9999 })), format.format(1234));
  for (const value of [7.9, -5, Number.NaN, 1234])
    assert.doesNotMatch(await render({ value, max: 9999 }), /data-overflow/);
  checks.push('0, 8, 99 shown exactly; 7.9 rounds down; -5 and NaN show 0; 1234 grouped by the locale');
});

test('overflows above max with the derived state, by default at 99 and with a custom max', async () => {
  const over = await render({ value: 100 });
  assert.equal(shown(over), '99+');
  assert.match(over, /data-overflow=""/);
  const exact = await render({ value: 99 });
  assert.equal(shown(exact), '99');
  assert.doesNotMatch(exact, /data-overflow/);
  assert.equal(shown(await render({ value: 8, max: 5 })), '5+');
  assert.equal(shown(await render({ value: 1234, max: 999 })), `${format.format(999)}+`);
  assert.equal(shown(await render({ value: 5, max: 0.5 })), '1+'); // max is at least 1
  assert.equal(shown(await render({ value: 120, max: Number.NaN })), '99+'); // an invalid max falls back to 99
  checks.push('99+ at 100, exact at 99, custom max 5+ and 999+, max floor at 1, invalid max');
});

test('appends the label to the accessible text, visually hidden', async () => {
  const html = await render({ value: 8, label: 'unread messages' });
  assert.equal(shown(html), '8');
  assert.match(html, /<span class="ggb-counter__label">(?:<!--[^>]*-->)* unread messages/);
  assert.equal(text(html), '8 unread messages');
  assert.equal(text(await render({ value: 120, label: 'unread messages' })), '99+ unread messages');
  assert.doesNotMatch(await render({ value: 8, label: '' }), /ggb-counter__label/);
  checks.push('label after the value with a separating space; 99+ unread messages; empty label omitted');
});

test('reflects the size as a data attribute', async () => {
  for (const size of ['sm', 'md', 'lg'])
    assert.match(await render({ value: 1, size }), new RegExp(`data-size="${size}"`));
  checks.push('3 sizes');
});

test('passes extra classes and native attributes through', async () => {
  const html = await render({ value: 3, class: 'wide', id: 'inbox-count', 'data-testid': 'x', title: 'Inbox' });
  assert.match(html, /class="ggb-counter wide"/);
  assert.match(html, /id="inbox-count"/);
  assert.match(html, /data-testid="x"/);
  assert.match(html, /title="Inbox"/);
  checks.push('class merge, id, data-testid, title');
});
