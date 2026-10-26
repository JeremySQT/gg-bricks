import type { Checkbox as Primitive } from 'bits-ui';
import type { CheckboxSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  | 'children'
  | 'child'
  | 'checked'
  | 'indeterminate'
  | 'onCheckedChange'
  | 'onIndeterminateChange'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'type'
  | 'aria-labelledby'
  | 'aria-invalid'
  | 'ref'
  | 'class';

export interface CheckboxOptions {
  /** Checked state; bind it (`bind:checked`). */
  checked?: boolean;
  /** Mixed state (some of a set selected); bind it. Activating an indeterminate checkbox checks it. */
  indeterminate?: boolean;
  /** Visible label, required and non-empty: the accessible name. */
  label: string;
  /** Hides label and description visually; they stay the accessible name and description (table row selector). */
  hideLabel?: boolean;
  /** Help text below the label: the accessible description. */
  description?: string;
  /** Box and text size. Default md. */
  size?: CheckboxSize;
  /** Not focusable, ignores activation. */
  disabled?: boolean;
  /** Focusable and announced read-only, ignores activation; still submitted. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Called when the user toggles the checkbox, with the new checked value. */
  oncheckedchange?: (checked: boolean) => void;
  /** The control element (a button with the checkbox role). */
  ref?: HTMLElement | null;
  /** Class of the container. */
  class?: string;
}

/** Other attributes (id, name, value, form, aria-describedby…) go to the control; `name` adds a hidden input. */
export type CheckboxProps = CheckboxOptions & Omit<Primitive.RootProps, Owned | keyof CheckboxOptions>;
