// Wave 5 components on the server: Avatar, AvatarGroup, DataField, Divider and Table render their structure, names
// and defaults without a browser, and reject invalid input identically on the server.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, loadModule, closeServer, writeSsrReport } from './helpers.ts';

type RawSnippet = (fn: () => { render: () => string }) => unknown;
let badge: unknown;
before(async () => {
  const { createRawSnippet } = await loadModule<{ createRawSnippet: RawSnippet }>('svelte');
  badge = createRawSnippet(() => ({ render: () => '<span class="fixture-badge">Active</span>' }));
});
const checks: Record<string, string[]> = { avatar: [], 'avatar-group': [], 'data-field': [], divider: [], table: [] };
const body = async (file: string, props: Record<string, unknown>) => (await renderComponent(file, props)).body;
const avatar = (p: Record<string, unknown>) => body('components/avatar/Avatar.svelte', p);
const group = (p: Record<string, unknown>) => body('components/avatar-group/AvatarGroup.svelte', p);
const field = (p: Record<string, unknown>) => body('components/data-field/DataField.svelte', p);
const divider = (p: Record<string, unknown>) => body('components/divider/Divider.svelte', p);
const table = (p: Record<string, unknown>) => body('../../../tests/ssr/fixtures/TableWith.svelte', p);
const strip = (html: string) => html.replace(/<!--[^>]*-->/g, '');
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

test('Avatar: an image named by name, initials hidden, defaults md circle, picture not shown before it loads', async () => {
  const html = strip(await avatar({ name: 'Olivia Rhye' }));
  assert.match(html, /^<span[^>]*class="ggb-avatar"/);
  assert.match(html, /data-size="md"/);
  assert.match(html, /data-shape="circle"/);
  assert.match(html, /data-image="none"/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Olivia Rhye"/);
  assert.match(html, /<span class="ggb-avatar__initials" aria-hidden="true">OR<\/span>/);
  assert.doesNotMatch(html, /tabindex|<img/);
  const pic = strip(await avatar({ name: 'Olivia Rhye', src: '/olivia.png' }));
  assert.match(pic, /data-image="loading"/);
  assert.match(pic, /<img[^>]*class="ggb-avatar__image"[^>]*>/);
  assert.match(pic, /<img[^>]*style="display: none;?"/);
  assert.match(pic, /ggb-avatar__initials/);
  checks.avatar.push('named image, initials hidden, defaults, picture hidden and fallback shown while loading');
});

test('Avatar: initials from graphemes, one at xs, given initials, glyph without letters, decorative', async () => {
  const cases: [Record<string, unknown>, string][] = [
    [{ name: 'Jean-Pierre de La Fontaine' }, 'JF'],
    [{ name: 'Cher' }, 'C'],
    [{ name: 'élise durand' }, 'ÉD'],
    [{ name: '李小龙' }, '李'],
    [{ name: '(Ann) Lee' }, 'AL'],
    [{ name: '🎉 Party Team' }, 'PT'],
    [{ name: 'Olivia Rhye', size: 'xs' }, 'O'],
    [{ name: 'Acme Corporation', initials: 'ACME' }, 'ACM'],
    // Given initials are cut by graphemes: an emoji with a skin tone stays whole.
    [{ name: 'Thumbs', initials: '👍🏽xyz' }, '👍🏽xy']
  ];
  for (const [props, text] of cases)
    assert.match(strip(await avatar(props)), new RegExp(`ggb-avatar__initials" aria-hidden="true">${text}<`), text);
  for (const props of [{ name: '!!!' }, {}]) {
    const html = strip(await avatar(props));
    assert.match(html, /<svg class="ggb-avatar__icon"[^>]*aria-hidden="true"/);
    assert.doesNotMatch(html, /ggb-avatar__initials/);
  }
  assert.match(strip(await avatar({})), /aria-hidden="true"[^>]*>/);
  assert.doesNotMatch(strip(await avatar({})), /role="img"/);
  const dec = strip(await avatar({ name: 'Olivia Rhye', decorative: true }));
  assert.match(dec, /^<span[^>]*aria-hidden="true"/);
  assert.doesNotMatch(dec, /role="img"|aria-label/);
  checks.avatar.push(
    'initials: hyphen, one word, accents, CJK, punctuation, emoji, xs, given initials cut by graphemes; glyph; decorative'
  );
});

test('AvatarGroup: a named list, size and shape passed down, max counts the +N box, total, cap at +99', async () => {
  const people = ['Ann Lee', 'Bo Chen', 'Cy Diaz', 'Di Eko', 'Ed Fox', 'Flo Gu', 'Gil Ho'].map((name) => ({ name }));
  const html = strip(await group({ label: 'Assignees', avatars: people, size: 'sm', shape: 'square' }));
  assert.match(html, /^<ul[^>]*class="ggb-avatar-group"[^>]*role="list"[^>]*aria-label="Assignees"/);
  assert.equal((html.match(/<li /g) ?? []).length, 5);
  assert.equal((html.match(/data-size="sm"/g) ?? []).length, 6);
  assert.equal((html.match(/data-shape="square"/g) ?? []).length, 6);
  assert.match(html, /ggb-avatar-group__overflow[^]*aria-label="3 more"[^]*>\+3</);
  const five = strip(await group({ label: 'T', avatars: people.slice(0, 5) }));
  assert.equal((five.match(/<li /g) ?? []).length, 5);
  assert.doesNotMatch(five, /__overflow/);
  const total = strip(await group({ label: 'T', avatars: people.slice(0, 3), total: 8 }));
  assert.match(total, /aria-label="5 more"[^]*>\+5</);
  const cap = strip(
    await group({ label: 'T', avatars: people.slice(0, 4), total: 1200, max: 4, moreLabel: 'de plus' })
  );
  assert.match(cap, /aria-label="1197 de plus"[^]*>\+99</);
  const all = strip(await group({ label: 'T', avatars: people, max: 0 }));
  assert.equal((all.match(/<li /g) ?? []).length, 7);
  await assert.rejects(() => group({ label: ' ', avatars: people }), /non-empty label/);
  await assert.rejects(() => group({ label: 'T', avatars: [] }), /at least one avatar/);
  checks['avatar-group'].push(
    'named list, size and shape on every avatar, max with +N, total, +99 cap, max 0, invalid input'
  );
});

test('DataField: a group named by its label, the value, an empty value announced, rich content, options', async () => {
  const html = strip(await field({ label: 'Email', value: 'olivia@example.com', id: 'f' }));
  assert.match(html, /^<div[^>]*id="f"[^>]*class="ggb-data-field"[^>]*role="group"[^>]*aria-labelledby="f-label"/);
  assert.match(html, /data-orientation="vertical"[^>]*data-size="md"/);
  assert.match(html, /<div class="ggb-data-field__label" id="f-label">Email<\/div>/);
  assert.match(html, /<div class="ggb-data-field__value">olivia@example.com<\/div>/);
  const empty = strip(await field({ label: 'Phone', value: '  ', emptyLabel: 'Not set' }));
  assert.match(empty, /data-empty=""/);
  assert.match(empty, /<span aria-hidden="true">—<\/span><span class="ggb-data-field__hidden">Not set<\/span>/);
  const rich = strip(
    await field({ label: 'Status', value: 'ignored', children: badge, orientation: 'horizontal', size: 'sm' })
  );
  assert.match(rich, /data-orientation="horizontal"[^>]*data-size="sm"/);
  assert.match(rich, /<span class="fixture-badge">Active<\/span>/);
  assert.doesNotMatch(rich, /ignored|tabindex/);
  for (const label of [undefined, '', '  ']) await assert.rejects(() => field({ label }), /non-empty label/);
  checks['data-field'].push(
    'named group, value, empty value with em dash and announced label, rich content, options, invalid label'
  );
});

test('Divider: a separator with its orientation, a label naming it, decorative hidden, no label when vertical', async () => {
  const html = strip(await divider({}));
  assert.match(html, /^<div[^>]*role="separator"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /class="ggb-divider"/);
  assert.match(html, /data-orientation="horizontal"/);
  const labelled = strip(await divider({ label: 'Or' }));
  assert.match(labelled, /aria-label="Or"/);
  assert.match(labelled, /data-labelled=""/);
  assert.match(labelled, /<span class="ggb-divider__label" aria-hidden="true">Or<\/span>/);
  const vertical = strip(await divider({ orientation: 'vertical', label: 'Or' }));
  assert.match(vertical, /aria-orientation="vertical"/);
  assert.doesNotMatch(vertical, /data-labelled|aria-label=|__label/);
  const dec = strip(await divider({ decorative: true, label: 'Today' }));
  assert.match(dec, /role="none"/);
  assert.match(dec, /aria-hidden="true"/);
  assert.doesNotMatch(dec, /aria-label=/);
  checks.divider.push('separator role and orientation, label as name, vertical ignores label, decorative hidden');
});

test('Table: native table named by its caption, sections, scopes, alignments, options', async () => {
  const html = strip(await table({}));
  assert.match(html, /^<div[^>]*class="ggb-table"/);
  assert.doesNotMatch(html, /data-size/);
  assert.match(html, /<div class="ggb-table__caption" aria-hidden="true">Invoices<\/div>/);
  assert.match(
    html,
    /<table class="ggb-table__table"><caption class="ggb-table__hidden">Invoices<\/caption><thead class="ggb-table__header">/
  );
  assert.match(html, /<th scope="col" class="ggb-table__heading" data-align="start">Invoice<\/th>/);
  assert.match(html, /<th scope="col" class="ggb-table__heading" data-align="end">Amount<\/th>/);
  assert.match(html, /<th scope="row" class="ggb-table__cell" data-align="start" data-row-header="">#3066<\/th>/);
  assert.match(html, /<td class="ggb-table__cell" data-align="end">1,240.00<\/td>/);
  assert.match(html, /<tfoot class="ggb-table__footer">/);
  // Overflow cannot be measured on the server: the scroll area is a named focus stop until the browser measures it.
  assert.match(html, /<div class="ggb-table__container" role="region" aria-label="Invoices" tabindex="0">/);
  assert.doesNotMatch(html, /data-scrollable|data-column-lines/);
  const options = strip(await table({ hideCaption: true, columnLines: true, bare: true }));
  assert.match(options, /data-column-lines=""/);
  assert.doesNotMatch(options, /ggb-table__caption|<thead|<tfoot/);
  assert.match(options, /<caption class="ggb-table__hidden">Invoices<\/caption>/);
  for (const caption of [undefined, '', ' ']) await assert.rejects(() => table({ caption }), /non-empty caption/);
  checks.table.push(
    'caption names the table (visible copy hidden), sections, column and row scopes, alignment, no size (density only), scroll area a named focus stop until measured, column lines, hideCaption, invalid caption'
  );
});
