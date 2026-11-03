import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ButtonGroupAlign, ButtonGroupOrientation, ButtonGroupSize } from './contract.generated.js';

/**
 * What a ButtonGroup shares with its Button and IconButton items, through the Svelte context key
 * `ggb:button-group` (a string, so that the button folders do not import this one; they declare the same shape).
 */
export interface ButtonGroupContext {
  readonly size: ButtonGroupSize;
}

/** Attributes the component owns: the group role and name follow from `label`. */
type Owned = 'children' | 'role' | 'aria-label';

export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, Owned> {
  /**
   * Size of every Button and IconButton of the group (their own size is ignored). Default md, or the size a host
   * (Alert) asks for its actions.
   */
  size?: ButtonGroupSize;
  /** horizontal: one line (default). vertical: one item per line. */
  orientation?: ButtonGroupOrientation;
  /**
   * Horizontal groups: start, center or end place the line; stretch shares the inline size equally. Default start.
   * A vertical group always gives every item the full inline size. A horizontal group that does not fit stacks.
   */
  align?: ButtonGroupAlign;
  /** Names the group for assistive technology (a group of related actions); without it the group adds no semantics. */
  label?: string;
  /** Buttons and IconButtons, in priority reading order. */
  children: Snippet;
  /** The group element. */
  ref?: HTMLDivElement | null;
}
