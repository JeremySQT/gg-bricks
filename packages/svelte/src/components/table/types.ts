import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLTdAttributes, HTMLThAttributes } from 'svelte/elements';
import type { TableCellAlign, TableHeadingAlign, TableSize } from './contract.generated.js';

export interface TableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'tabindex'> {
  /** The table's accessible name; shown above the table unless hideCaption. Required and non-empty. */
  caption: string;
  /** Announce the caption without showing it, when a heading next to the table already names it. Default false. */
  hideCaption?: boolean;
  /** Minimum row height: sm 32, md 40, lg 48 px in the standard density. Default md. */
  size?: TableSize;
  /** Vertical lines between columns. Default false. */
  columnLines?: boolean;
  /** TableHeader (optional), TableBody, TableFooter (optional), in that order. */
  children: Snippet;
  /** The root element (caption and frame). */
  ref?: HTMLDivElement | null;
}

export interface TableSectionProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  /** TableRow children. */
  children?: Snippet;
  ref?: HTMLTableSectionElement | null;
}

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'children'> {
  /** TableHeading (in the header) or TableCell children, in column order. */
  children?: Snippet;
  ref?: HTMLTableRowElement | null;
}

export interface TableHeadingProps extends Omit<HTMLThAttributes, 'children' | 'scope' | 'align'> {
  /** start, center or end (end for a column of numbers, like its cells). Default start. */
  align?: TableHeadingAlign;
  /** The column's name. */
  children?: Snippet;
  ref?: HTMLTableCellElement | null;
}

export interface TableCellProps extends Omit<HTMLTdAttributes & HTMLThAttributes, 'children' | 'scope' | 'align'> {
  /** start, center or end (end for numbers). Default start. */
  align?: TableCellAlign;
  /** The cell names its row (exposed as a row header); it looks like the other cells. Default false. */
  rowHeader?: boolean;
  /** Plain text or free content (Badge, Link, Avatar with a name, row actions). */
  children?: Snippet;
  ref?: HTMLTableCellElement | null;
}
