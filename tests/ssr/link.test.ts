import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/link/Link.svelte', props)).body;
// Text content without tags and hydration markers, whitespace collapsed: the accessible name of the link.
const text = (html: string) =>
  html
    .replace(/<!--[^>]*-->/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
after(async () => {
  writeSsrReport('link', checks);
  await closeServer();
});

test('renders a native link with the accent tone, page destination, underlined label and nothing else', async () => {
  const html = await render({ label: 'Billing settings', href: '/billing' });
  assert.match(html, /^(<!--[^>]*-->)*<a\b/);
  assert.match(html, /class="ggb-link"/);
  assert.match(html, /href="\/billing"/);
  assert.match(html, /data-tone="accent"/);
  assert.match(html, /data-destination="page"/);
  assert.match(html, /<span class="ggb-link__label">(<!--[^>]*-->)*Billing settings(<!--[^>]*-->)*<\/span>/);
  assert.doesNotMatch(html, /target=|rel=|ggb-link__indicator|ggb-link__meta|ggb-link__suffix|aria-disabled|role=/);
  assert.equal(text(html), 'Billing settings');
  checks.push('page link: element, class, href, defaults, label only, same context');
});

test('external opens a new context without opener, shows the arrow and announces the suffix', async () => {
  const html = await render({
    label: 'Svelte docs',
    href: 'https://svelte.dev',
    destination: 'external',
    rel: 'external'
  });
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="external noopener noreferrer"/);
  assert.match(html, /<svg class="ggb-link__indicator"[^>]*aria-hidden="true"/);
  assert.match(html, /<span class="ggb-link__suffix">/);
  assert.equal(text(html), 'Svelte docs (opens in a new tab)');
  checks.push('external: new context, rel merged with noopener noreferrer, glyph hidden, suffix');
});

test('email, phone and print have their glyph and suffix and stay in the same context', async () => {
  for (const [destination, suffix] of [
    ['email', 'email'],
    ['phone', 'phone'],
    ['print', 'printable version']
  ]) {
    const html = await render({ label: 'Contact', href: 'mailto:a@b.c', destination });
    assert.match(html, new RegExp(`data-destination="${destination}"`));
    assert.match(html, /ggb-link__indicator/);
    assert.doesNotMatch(html, /target=|rel=/);
    assert.equal(text(html), `Contact (${suffix})`);
  }
  checks.push('email, phone, print: glyph, suffix, same context');
});

test('file shows the format and size as text after the last word, with the glyph, kept on one line', async () => {
  const html = await render({
    label: 'Annual report',
    href: '/r.pdf',
    destination: 'file',
    fileType: '.PDF',
    fileSize: '2.4 MB'
  });
  assert.match(
    html,
    /<span class="ggb-link__label">(<!--[^>]*-->)*Annual (<!--[^>]*-->)*<\/span>(<!--[^>]*-->)*<span class="ggb-link__tail"><span class="ggb-link__label">(<!--[^>]*-->)*report/
  );
  assert.match(html, /<span class="ggb-link__meta">/);
  assert.match(html, /ggb-link__indicator/);
  assert.doesNotMatch(html, /ggb-link__suffix|target=/);
  assert.equal(text(html), 'Annual report (PDF, 2.4 MB)');
  const bare = await render({ label: 'Attachment', href: '/a', destination: 'file' });
  assert.doesNotMatch(bare, /ggb-link__meta/);
  assert.equal(text(bare), 'Attachment');
  checks.push('file: meta text, glyph, last word kept with them, no suffix; no meta without type and size');
});

test('destinationLabel translates the suffix; tone inherit is reflected; native attributes pass through', async () => {
  const html = await render({
    label: 'documentation',
    href: 'https://example.com',
    destination: 'external',
    destinationLabel: "s'ouvre dans un nouvel onglet",
    tone: 'inherit',
    class: 'x',
    id: 'doc',
    target: '_self'
  });
  assert.equal(text(html).replace(/&#39;/g, "'"), "documentation (s'ouvre dans un nouvel onglet)");
  assert.match(html, /data-tone="inherit"/);
  assert.match(html, /class="ggb-link x"/);
  assert.match(html, /id="doc"/);
  // target belongs to the destination.
  assert.match(html, /target="_blank"/);
  checks.push('translated suffix, tone inherit, class merge, native attributes, owned target');
});

test('rejects a missing or blank label or href', async () => {
  for (const label of [undefined, '', '  '])
    await assert.rejects(() => render({ label, href: '/x' }), /non-empty label/);
  for (const href of [undefined, '', '  ']) await assert.rejects(() => render({ label: 'X', href }), /non-empty href/);
  checks.push('invalid label and href rejected on the server');
});
