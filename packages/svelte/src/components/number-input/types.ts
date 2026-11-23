import type { HTMLInputAttributes } from 'svelte/elements';
import type { NumberInputSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  | 'children'
  | 'type'
  | 'value'
  | 'size'
  | 'min'
  | 'max'
  | 'step'
  | 'name'
  | 'placeholder'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'role'
  | 'inputmode'
  | 'aria-invalid'
  | 'aria-required'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-valuenow'
  | 'aria-valuemin'
  | 'aria-valuemax'
  | 'aria-valuetext';

export interface NumberInputOptions {
  /** The number, or undefined for an empty field; bind it (`bind:value`). Committed on Enter, blur or a step. */
  value?: number;
  /** Lowest value: a committed number below it becomes min; Home sets it; decrease is disabled at min. */
  min?: number;
  /** Highest value: a committed number above it becomes max; End sets it; increase is disabled at max. */
  max?: number;
  /** Amount of one step (greater than zero). Its number of decimals sets the fraction digits shown. Default 1. */
  step?: number;
  /** BCP 47 locale of the grouping and decimal separators, for display and typing. Default "en". */
  locale?: string;
  /** An example of the expected value, shown while the field is empty. Never a label. */
  placeholder?: string;
  /** Accessible name when the input is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** Height, padding, text, icon and stepper size, matching InputText. Default md. */
  size?: NumberInputSize;
  /** Without the decrease and increase buttons. */
  hideSteppers?: boolean;
  /** Not focusable, not editable, not submitted. */
  disabled?: boolean;
  /** Focusable and selectable, submitted, not editable. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Submits the value under this name, as a plain decimal number (period, no grouping), or empty. */
  name?: string;
  /** Accessible name of the decrease button. Default "Decrease". */
  decreaseLabel?: string;
  /** Accessible name of the increase button. Default "Increase". */
  increaseLabel?: string;
  /** Called when a commit or a step changes the value (undefined when cleared); not when the application sets it. */
  onvaluechange?: (value: number | undefined) => void;
  /** The text input element. */
  ref?: HTMLInputElement | null;
  /** Class of the visible container. */
  class?: HTMLInputAttributes['class'];
}

/**
 * Other native attributes (id, autocomplete, onkeydown, onblur…) go to the text input; the consumer's handlers run
 * before the component's.
 */
export type NumberInputProps = NumberInputOptions & Omit<HTMLInputAttributes, Owned | keyof NumberInputOptions>;
