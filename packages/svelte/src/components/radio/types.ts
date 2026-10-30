import type { RadioGroup as Primitive } from 'bits-ui';

/** Attributes the component owns: they follow from the contract props and the group. */
type Owned = 'children' | 'child' | 'value' | 'disabled' | 'aria-labelledby' | 'ref' | 'class';

export interface RadioOptions {
  /** Value set on the group when this radio is selected; unique within the group. */
  value: string;
  /** Visible label, required and non-empty: the accessible name. */
  label: string;
  /** Help text below the label: the accessible description. */
  description?: string;
  /** Disables this radio only (the group can disable all of them). */
  disabled?: boolean;
  /** The control element (a button with the radio role). */
  ref?: HTMLElement | null;
  /** Class of the container. */
  class?: string;
}

/** Other attributes (id, aria-describedby…) go to the control. Size, readonly and invalid come from the group. */
export type RadioProps = RadioOptions & Omit<Primitive.ItemProps, Owned | keyof RadioOptions>;
