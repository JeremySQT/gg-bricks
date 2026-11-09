import type { HTMLAttributes } from 'svelte/elements';
import type { SpinnerSize } from './contract.generated.js';

/** Attributes the component owns: the role and the name follow from `label`. */
type Owned = 'children' | 'role' | 'aria-label' | 'aria-hidden';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, Owned> {
  /** Icon-scale size: sm 16, md 20 (default), lg 24, xl 32 px. Does not change with density. */
  size?: SpinnerSize;
  /**
   * Empty (default): decorative and hidden from assistive technology, the element that is loading says so. Non-empty:
   * a polite status named by this text (Loading comments).
   */
  label?: string;
  /** The rendered element. */
  ref?: HTMLSpanElement | null;
}
