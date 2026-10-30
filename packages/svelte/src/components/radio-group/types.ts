import type { Snippet } from 'svelte';
import type { RadioGroup as Primitive } from 'bits-ui';
import type { RadioGroupOrientation, RadioGroupSize } from './contract.generated.js';

/**
 * What a RadioGroup shares with its Radio children, through the Svelte context key `ggb:radio-group` (a string, so
 * that the radio folder does not import this one). Radio declares the same shape locally.
 */
export interface RadioGroupContext {
  readonly size: RadioGroupSize;
  readonly readonly: boolean;
  readonly invalid: boolean;
  readonly disabled: boolean;
}

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  | 'children'
  | 'child'
  | 'value'
  | 'onValueChange'
  | 'orientation'
  | 'loop'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-invalid'
  | 'ref';

export interface RadioGroupOptions {
  /** Value of the selected radio; bind it (`bind:value`). Empty, or a value no radio has, selects none. */
  value?: string;
  /** Accessible name when the group is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** vertical: stacked (default). horizontal: on one line, wrapping when space runs out. */
  orientation?: RadioGroupOrientation;
  /** Size of every radio. Default md. */
  size?: RadioGroupSize;
  /** Disables every radio. */
  disabled?: boolean;
  /** Arrow keys move focus without selecting; nothing can be selected. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Two or more Radio components. */
  children: Snippet;
  /** Called when the user selects a radio, with its value; not when the application sets the value. */
  onvaluechange?: (value: string) => void;
  /** The group element. */
  ref?: HTMLElement | null;
}

/** Other attributes (id, name, class, aria-describedby…) go to the group element; `name` adds a hidden input. */
export type RadioGroupProps = RadioGroupOptions & Omit<Primitive.RootProps, Owned | keyof RadioGroupOptions>;
