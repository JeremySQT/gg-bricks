import type { HTMLAttributes } from 'svelte/elements';
import type { DividerOrientation } from './contract.generated.js';

/** The divider draws its own line and label: no children, role or tab stop from outside. */
type Owned = 'children' | 'role' | 'tabindex';

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, Owned> {
  /** horizontal spans the inline size; vertical separates items laid out in a row. Default horizontal. */
  orientation?: DividerOrientation;
  /** Short text centered on a horizontal line (Or, Today); ignored when vertical. */
  label?: string;
  /** Hide the divider from assistive technology when it only repeats the structure. Default false. */
  decorative?: boolean;
  /** The rendered element. */
  ref?: HTMLDivElement | null;
}
