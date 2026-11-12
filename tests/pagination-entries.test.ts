// The item algorithm of Pagination (packages/svelte/src/components/pagination/pages.ts): first, last, current and
// siblings, ellipses only for gaps of two pages or more, and a constant count.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entries } from '../packages/svelte/src/components/pagination/pages.ts';

const show = (page: number, count: number, siblings: number) =>
  entries(page, count, siblings)
    .map((e) => (e.kind === 'page' ? String(e.page) : '…'))
    .join(' ');

test('few pages are all shown', () => {
  assert.equal(show(1, 1, 1), '1');
  assert.equal(show(3, 7, 1), '1 2 3 4 5 6 7');
});

test('known layouts with one sibling', () => {
  assert.equal(show(1, 20, 1), '1 2 3 4 5 … 20');
  assert.equal(show(4, 20, 1), '1 2 3 4 5 … 20');
  assert.equal(show(5, 20, 1), '1 … 4 5 6 … 20');
  assert.equal(show(16, 20, 1), '1 … 15 16 17 … 20');
  assert.equal(show(17, 20, 1), '1 … 16 17 18 19 20');
  assert.equal(show(20, 20, 1), '1 … 16 17 18 19 20');
});

test('every page of every count keeps a constant number of items, the current page, first and last', () => {
  for (const siblings of [0, 1, 2, 3])
    for (let count = 1; count <= 40; count++)
      for (let page = 1; page <= count; page++) {
        const list = entries(page, count, siblings);
        const pages = list.flatMap((e) => (e.kind === 'page' ? [e.page] : []));
        assert.equal(list.length, Math.min(count, siblings * 2 + 5), `${page}/${count}/${siblings}`);
        assert.ok(pages.includes(page) && pages.includes(1) && pages.includes(count));
        assert.deepEqual(
          [...pages].sort((a, b) => a - b),
          pages,
          'ascending'
        );
        // An ellipsis always stands for two hidden pages or more.
        list.forEach((e, i) => {
          if (e.kind !== 'ellipsis') return;
          const before = list[i - 1] as { page: number };
          const after = list[i + 1] as { page: number };
          assert.ok(after.page - before.page > 2, `${page}/${count}/${siblings} gap`);
        });
      }
});
