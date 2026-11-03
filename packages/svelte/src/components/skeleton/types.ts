import type { HTMLAttributes } from 'svelte/elements';
import type { SkeletonShape, SkeletonSize } from './contract.generated.js';

/** Attributes the component owns: a skeleton is hidden from assistive technology and has no content. */
type Owned = 'children' | 'role' | 'aria-hidden' | 'tabindex';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, Owned> {
  /**
   * text (default): lines of running text in the body typography of `size`; block: fills the size the layout gives
   * it (a card, an image); circle: a disc as wide as the layout makes it (an avatar).
   */
  shape?: SkeletonShape;
  /** Number of text lines (the last one covers 60 percent when more than one). Default 1. */
  lines?: number;
  /** Body typography the text lines stand for. Default md. */
  size?: SkeletonSize;
  /** The rendered element. */
  ref?: HTMLDivElement | null;
}
