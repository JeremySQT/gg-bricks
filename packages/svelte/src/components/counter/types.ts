import type { HTMLAttributes } from 'svelte/elements';
import type { CounterSize } from './contract.generated.js';

/**
 * Attributes the component owns: the content follows from the props, and a counter is never interactive,
 * so it takes no role and no place in the tab order.
 */
type Owned = 'children' | 'role' | 'tabindex';

export interface CounterProps extends Omit<HTMLAttributes<HTMLSpanElement>, Owned> {
  /** Quantity shown. Rounded down to an integer; a negative value shows 0. Default 0. */
  value?: number;
  /** Largest quantity shown exactly; above it the counter shows max followed by a plus sign (99+). Default 99. */
  max?: number;
  /** Typography, padding and corner radius step; named like Button sizes so a host passes its own size through. */
  size?: CounterSize;
  /** Meaning of the number for assistive technology, read after the visible text (8 unread messages). */
  label?: string;
  /** The rendered element. */
  ref?: HTMLSpanElement | null;
}
