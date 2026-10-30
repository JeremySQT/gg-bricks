import type { Snippet } from 'svelte';
import type { Checkbox as Primitive } from 'bits-ui';
import type { CheckboxGroupOrientation, CheckboxGroupSize } from './contract.generated.js';

/**
 * What a CheckboxGroup shares with its Checkbox children, through the Svelte context key `ggb:checkbox-group` (a
 * string, so that the checkbox folder does not import this one). Checkbox declares the same shape locally.
 */
export interface CheckboxGroupContext {
  /** Values of the checked checkboxes. */
  readonly value: readonly string[];
  readonly size: CheckboxGroupSize;
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
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'aria-label'
  | 'aria-labelledby'
  | 'ref';

export interface CheckboxGroupOptions {
  /** Values of the checked checkboxes, in their source order; bind it (`bind:value`). */
  value?: string[];
  /** Accessible name when the group is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** vertical: stacked (default). horizontal: on one line, wrapping when space runs out. */
  orientation?: CheckboxGroupOrientation;
  /** Size of every checkbox. Default md. */
  size?: CheckboxGroupSize;
  /** Disables every checkbox. */
  disabled?: boolean;
  /** Checkboxes stay focusable and announced read-only; nothing can be checked or unchecked. */
  readonly?: boolean;
  /** Every checkbox is announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /**
   * At least one checkbox must be checked. Not announced on the checkboxes (it would make each one mandatory): say
   * it in the Field label or description. The application validates.
   */
  required?: boolean;
  /** Two or more Checkbox components, each with a unique value. */
  children: Snippet;
  /** Called when the user checks or unchecks a checkbox, with the new list; not when the application sets it. */
  onvaluechange?: (value: string[]) => void;
  /** The group element. */
  ref?: HTMLElement | null;
}

/** Other attributes (id, name, class, aria-describedby…) go to the group element; `name` adds hidden inputs. */
export type CheckboxGroupProps = CheckboxGroupOptions & Omit<Primitive.GroupProps, Owned | keyof CheckboxGroupOptions>;
