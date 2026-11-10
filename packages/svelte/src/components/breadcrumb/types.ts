import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BreadcrumbSeparator, BreadcrumbSize } from './contract.generated.js';

/** One level of the hierarchy: its label and, for an ancestor with a page, its address. */
export interface BreadcrumbItem {
  /** Required and non-empty; the link's accessible name. */
  label: string;
  /** The ancestor's page; the last item (the current page) is never a link. */
  href?: string;
  /** Hides the label when the item has a leading icon (a home icon): the label stays the accessible name and is shown
   * on hover. Without an icon the label is always displayed. */
  hideLabel?: boolean;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The levels from the top to the current page (last). At least one. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Default "Breadcrumb". */
  label?: string;
  /** sm (default) or md text. */
  size?: BreadcrumbSize;
  /** chevron (default) or slash between items. */
  separator?: BreadcrumbSeparator;
  /** Above zero, keeps the first and the last maxItems - 1 items and puts the others in a menu. Default 0. */
  maxItems?: number;
  /** Name of the button that opens the menu of hidden items. Default "Show hidden pages". */
  moreLabel?: string;
  /** One decorative icon before the label of an item (a home icon on the first): `(item, index) => …`. */
  leading?: Snippet<[BreadcrumbItem, number]>;
  /** The navigation element. */
  ref?: HTMLElement | null;
}
