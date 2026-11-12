import type { HTMLAttributes } from 'svelte/elements';
import type { PaginationSize } from './contract.generated.js';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The current page, from 1; bind it (`bind:page`). Clamped between 1 and pageCount. */
  page?: number;
  /** Number of pages, at least 1. */
  pageCount?: number;
  /** Pages shown on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Turns every control into a link: each `{page}` is replaced by its page number (`?page={page}`). */
  href?: string;
  /** Adds first-page and last-page buttons around previous and next. Default false. */
  showEdges?: boolean;
  /** Size of the pages and of the previous and next buttons. Default md. */
  size?: PaginationSize;
  /** Accessible name of the navigation landmark. Default "Pagination". */
  label?: string;
  /** Name of the previous button. Default "Previous page". */
  previousLabel?: string;
  /** Name of the next button. Default "Next page". */
  nextLabel?: string;
  /** Name of the first-page button. Default "First page". */
  firstLabel?: string;
  /** Name of the last-page button. Default "Last page". */
  lastLabel?: string;
  /** Called with the new page when the user changes it. */
  onpagechange?: (page: number) => void;
  /** The navigation element. */
  ref?: HTMLElement | null;
}

export type PaginationEntry = { kind: 'page'; page: number } | { kind: 'ellipsis'; key: 'start' | 'end' };
