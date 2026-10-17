import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BadgeAppearance, BadgeIntent, BadgeSize } from './contract.generated.js';

/**
 * Attributes the component owns: the content follows from the props, and a badge is never interactive,
 * so it takes no role and no place in the tab order.
 */
type Owned = 'children' | 'role' | 'tabindex';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, Owned> {
  /** Visible status or category word, read as plain text. Required and non-empty; one line, truncated when short of space. */
  label: string;
  /** Color family: neutral or accent for a category, info, success, warning or danger for a status. Default neutral. */
  intent?: BadgeIntent;
  /** subtle: tinted surface with an edge; strong: filled surface for a signal that must stand out. Default subtle. */
  appearance?: BadgeAppearance;
  /** Typography step, named like Button sizes. Default md. */
  size?: BadgeSize;
  /** One decorative icon before the label (12 px, in the status icon color). */
  leading?: Snippet;
  /** The rendered element. */
  ref?: HTMLSpanElement | null;
}
