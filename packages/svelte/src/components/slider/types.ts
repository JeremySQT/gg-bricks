import type { HTMLAttributes } from 'svelte/elements';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  | 'children'
  | 'role'
  | 'tabindex'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-valuenow'
  | 'aria-valuemin'
  | 'aria-valuemax'
  | 'aria-valuetext'
  | 'aria-orientation'
  | 'aria-disabled';

export interface SliderOptions {
  /** The value; bind it (`bind:value`). Shown within min and max, at the nearest step. Default 0. */
  value?: number;
  /** Lowest value, at the start of the track. Default 0. */
  min?: number;
  /** Highest value, at the end of the track, always reachable. Default 100. */
  max?: number;
  /** Amount of one step (greater than zero), counted from min. Default 1. */
  step?: number;
  /** Accessible name when the slider is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** Shows the value at the end of the track, formatted for the locale. */
  showValue?: boolean;
  /** BCP 47 locale of the value text (shown and announced). Default "en". */
  locale?: string;
  /** Not focusable, ignores pointer and keyboard, not submitted. */
  disabled?: boolean;
  /** Submits the value under this name, as a plain decimal number. */
  name?: string;
  /** Called on every change made by the user (each step of a drag, a press on the track, a key). */
  onvaluechange?: (value: number) => void;
  /** Called when the user ends a change: pointer released, or a key that changed the value. */
  onvaluecommit?: (value: number) => void;
  /** The thumb element. */
  ref?: HTMLElement | null;
  /** Class of the visible container. */
  class?: HTMLAttributes<HTMLElement>['class'];
}

/**
 * Other attributes (id, data-*, onkeydown, onfocus…) go to the thumb, the element that takes focus; the consumer's
 * handlers run before the component's.
 */
export type SliderProps = SliderOptions & Omit<HTMLAttributes<HTMLElement>, Owned | keyof SliderOptions>;
