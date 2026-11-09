import type { PaginationEntry } from './types.js';

/**
 * The items of a pagination: page 1, the last page, the current page and `siblings` pages on each side, an ellipsis
 * for a gap of two pages or more (a single hidden page is shown instead). The count is constant (siblings × 2 + 5, or
 * pageCount when smaller), so that the previous and next controls do not move while the user pages.
 */
export function entries(page: number, pageCount: number, siblings: number): PaginationEntry[] {
  const total = siblings * 2 + 5;
  const range = (from: number, to: number): PaginationEntry[] =>
    Array.from({ length: to - from + 1 }, (_, i) => ({ kind: 'page', page: from + i }));
  if (pageCount <= total) return range(1, pageCount);
  if (page <= siblings + 3)
    return [...range(1, siblings * 2 + 3), { kind: 'ellipsis', key: 'end' }, { kind: 'page', page: pageCount }];
  if (page >= pageCount - siblings - 2)
    return [
      { kind: 'page', page: 1 },
      { kind: 'ellipsis', key: 'start' },
      ...range(pageCount - (siblings * 2 + 2), pageCount)
    ];
  return [
    { kind: 'page', page: 1 },
    { kind: 'ellipsis', key: 'start' },
    ...range(page - siblings, page + siblings),
    { kind: 'ellipsis', key: 'end' },
    { kind: 'page', page: pageCount }
  ];
}
