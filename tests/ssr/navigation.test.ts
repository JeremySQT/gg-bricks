import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { accordion: [], breadcrumb: [], pagination: [] };
const accordion = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/AccordionWith.svelte', props)).body;
const breadcrumb = async (props: Record<string, unknown>) =>
  (await renderComponent('components/breadcrumb/Breadcrumb.svelte', props)).body;
const pagination = async (props: Record<string, unknown>) =>
  (await renderComponent('components/pagination/Pagination.svelte', props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

const tag = (html: string, id: string) => html.match(new RegExp(`<[a-z]+[^>]* id="${id}"[^>]*>`))?.[0] ?? '';

test('Accordion: triggers in headings of the level, expanded state and controlled regions', async () => {
  const html = await accordion({ value: ['returns'], headingLevel: 4 });
  assert.equal(html.match(/role="heading" aria-level="4"/g)?.length, 3);
  for (const a of ['aria-expanded="false"', 'aria-controls="a-content"'])
    assert.ok(tag(html, 'a-trigger').includes(a), a);
  for (const a of ['aria-expanded="true"', 'aria-controls="c-content"'])
    assert.ok(tag(html, 'c-trigger').includes(a), a);
  assert.ok(tag(html, 'b-trigger').includes('disabled'));
  for (const a of ['role="region"', 'aria-labelledby="c-trigger"', 'data-state="open"'])
    assert.ok(tag(html, 'c-content').includes(a), a);
  assert.ok(tag(html, 'a-content').includes('data-state="closed"'));
  const fallback = await accordion({ headingLevel: 9 });
  assert.match(fallback, /role="heading" aria-level="3"/);
  await assert.rejects(accordion({ itemLabel: '' }), /non-empty label/);
  await assert.rejects(accordion({ lone: true }), /placed in an Accordion/);
  checks.accordion.push('each trigger in a heading of headingLevel (3 when out of range); expanded state exposed');
  checks.accordion.push('content is a region labelled by its trigger and controlled by it (completing Bits UI)');
  checks.accordion.push('blank label and an item outside an Accordion are rejected');
});

test('Breadcrumb: a named navigation with an ordered list; the last item is the current page, never a link', async () => {
  const items = [{ label: 'Home', href: '/' }, { label: 'Docs' }, { label: 'Tabs', href: '/tabs' }];
  const html = await breadcrumb({ items });
  assert.match(
    html,
    /<nav class="ggb-breadcrumb" aria-label="Breadcrumb" data-size="sm"><ol class="ggb-breadcrumb__list">/
  );
  assert.match(html, /<a class="ggb-breadcrumb__item" href="\/">/);
  assert.match(
    html,
    /<span class="ggb-breadcrumb__item"><!--\[-1--><!--\]--><span class="ggb-breadcrumb__item-label">Docs/
  );
  assert.match(html, /<span class="ggb-breadcrumb__item" data-current="" aria-current="page">/);
  assert.doesNotMatch(html, /href="\/tabs"/);
  assert.equal(html.match(/class="ggb-breadcrumb__separator"/g)?.length, 2);
  assert.equal(html.match(/aria-hidden="true"/g)?.length, 2);
  await assert.rejects(breadcrumb({ items: [] }), /at least one item/);
  await assert.rejects(breadcrumb({ items: [{ label: ' ' }] }), /non-empty label/);
  checks.breadcrumb.push('nav named by label (default Breadcrumb) holding an ordered list');
  checks.breadcrumb.push(
    'ancestors with href are links, without href plain text; the last is the current page, not a link'
  );
  checks.breadcrumb.push('one decorative separator between items; empty list and blank labels rejected');
});

test('Breadcrumb: maxItems keeps the first and the last items and puts the others in a menu', async () => {
  const items = ['A', 'B', 'C', 'D', 'E', 'F'].map((label) => ({ label, href: `#${label}` }));
  const html = await breadcrumb({ items, maxItems: 4, moreLabel: 'More pages' });
  const shown = [...html.matchAll(/class="ggb-breadcrumb__item-label">(\w)/g)].map((m) => m[1]);
  assert.deepEqual(shown, ['A', 'D', 'E', 'F']);
  assert.match(html, /class="ggb-breadcrumb__item ggb-breadcrumb__more-trigger" aria-label="More pages"/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /role="menuitem" tabindex="-1" href="#B"/);
  assert.match(html, /role="menuitem" tabindex="-1" href="#C"/);
  const small = await breadcrumb({ items, maxItems: 1 });
  // Item labels, without the more button's ellipsis.
  assert.equal([...small.matchAll(/class="ggb-breadcrumb__item-label">\w/g)].length, 3);
  checks.breadcrumb.push(
    'collapse: first item, more button named moreLabel opening a menu of the hidden links, last maxItems - 1'
  );
  checks.breadcrumb.push('maxItems below 3 counts as 3');
});

test('Pagination: a named navigation; previous, pages and next; the current page and the bounds', async () => {
  const html = await pagination({ page: 1, pageCount: 20 });
  assert.match(html, /<nav class="ggb-pagination" aria-label="Pagination" data-size="md">/);
  const pages = [...html.matchAll(/data-page="(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(pages, ['1', '2', '3', '4', '5', '20']);
  assert.match(html, /aria-current="page" data-page="1"/);
  assert.match(html, /aria-label="Previous page"[^>]*disabled|disabled[^>]*aria-label="Previous page"/);
  assert.match(html, /class="ggb-pagination__ellipsis" aria-hidden="true">…</);
  const last = await pagination({ page: 99, pageCount: 20 });
  assert.match(last, /aria-current="page" data-page="20"/);
  checks.pagination.push(
    'nav named by label; previous disabled on page 1; pages 1 to 5, ellipsis, 20; current page exposed'
  );
  checks.pagination.push('page clamped to pageCount');
});

test('Pagination: href turns pages and the enabled controls into links with the page number', async () => {
  const html = await pagination({ page: 2, pageCount: 3, href: '/list?page={page}' });
  assert.match(html, /<a class="ggb-pagination__item" href="\/list\?page=1" data-page="1">1<\/a>/);
  assert.match(html, /href="\/list\?page=2" aria-current="page"/);
  assert.match(
    html,
    /href="\/list\?page=1"[^>]*aria-label="Previous page"|aria-label="Previous page"[^>]*href="\/list\?page=1"/
  );
  assert.match(
    html,
    /href="\/list\?page=3"[^>]*aria-label="Next page"|aria-label="Next page"[^>]*href="\/list\?page=3"/
  );
  checks.pagination.push('href: pages, previous and next are links with {page} replaced');
});
