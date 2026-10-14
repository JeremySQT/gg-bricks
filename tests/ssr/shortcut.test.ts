import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/shortcut/Shortcut.svelte', props)).body;
after(async () => {
  writeSsrReport('shortcut', checks);
  await closeServer();
});

/** Visible texts of the key parts, in document order. */
const keyTexts = (html: string) =>
  [...html.matchAll(/<kbd class="ggb-shortcut__key"[^>]*>(?:<!--[^>]*-->)*([^<]*)/g)].map((m) => m[1]);
const separators = (html: string) => html.match(/ggb-shortcut__separator/g)?.length ?? 0;
const name = (html: string) => html.match(/<span class="ggb-shortcut__name">(?:<!--[^>]*-->)*([^<]*)/)?.[1];

test('renders a kbd root with defaults, anatomy and the other form for platform auto', async () => {
  const html = await render({ keys: 'Mod+K' });
  assert.match(html, /^(<!--[^>]*-->)*<kbd\b/);
  assert.match(html, /class="ggb-shortcut"/);
  assert.match(html, /data-platform="other"/);
  assert.match(html, /data-appearance="plain"/);
  assert.match(html, /data-size="md"/);
  assert.match(html, /<span class="ggb-shortcut__container" aria-hidden="true">/);
  assert.deepEqual(keyTexts(html), ['Ctrl', 'K']);
  assert.equal(separators(html), 1);
  assert.equal(name(html), 'Control K');
  assert.doesNotMatch(html, /role=|aria-label=/);
  checks.push('default: kbd root, class, enum data attributes, other form on the server, anatomy, spoken text');
});

test('a forced platform renders that form: mac glyphs juxtaposed, other short names with separators', async () => {
  const mac = await render({ keys: 'Shift+Mod+P', platform: 'mac' });
  assert.match(mac, /data-platform="mac"/);
  assert.deepEqual(keyTexts(mac), ['⇧', '⌘', 'P']);
  assert.equal(separators(mac), 0);
  assert.equal(name(mac), 'Shift Command P');
  const other = await render({ keys: 'Shift+Mod+P', platform: 'other' });
  assert.deepEqual(keyTexts(other), ['Ctrl', 'Shift', 'P']);
  assert.equal(separators(other), 2);
  assert.equal(name(other), 'Control Shift P');
  checks.push('forced mac and other: order, glyphs, separators, spoken text');
});

test('keycap appearance and every size are data attributes; the markup is the same as plain', async () => {
  for (const appearance of ['plain', 'keycap'])
    for (const size of ['sm', 'md', 'lg']) {
      const html = await render({ keys: 'Mod+K', appearance, size, platform: 'mac' });
      assert.match(html, new RegExp(`data-appearance="${appearance}"[^>]*data-size="${size}"`));
      assert.deepEqual(keyTexts(html), ['⌘', 'K']);
    }
  checks.push('2 appearances x 3 sizes');
});

test('label replaces the spoken equivalent; a blank label does not', async () => {
  assert.equal(name(await render({ keys: 'Mod+K', label: 'Commande K' })), 'Commande K');
  assert.equal(name(await render({ keys: 'Mod+K', label: '   ' })), 'Control K');
  checks.push('label as the accessible text, blank label ignored');
});

test('passes extra classes and native attributes through; never throws on content', async () => {
  const html = await render({ keys: 'Escape', class: 'hint', id: 'esc', 'data-testid': 'x', title: 'Close' });
  assert.match(html, /class="ggb-shortcut hint"/);
  assert.match(html, /id="esc"/);
  assert.match(html, /data-testid="x"/);
  assert.match(html, /title="Close"/);
  assert.deepEqual(keyTexts(html), ['Esc']);
  const empty = await render({ keys: '' });
  assert.deepEqual(keyTexts(empty), []);
  assert.equal(name(empty), '');
  const unknown = await render({ keys: 'Ctrl++Foo+g', platform: 'mac' });
  assert.deepEqual(keyTexts(unknown), ['⌃', 'Foo', 'G']);
  checks.push('class merge, native attributes, empty keys, empty token, unknown literal, uppercase letter');
});
