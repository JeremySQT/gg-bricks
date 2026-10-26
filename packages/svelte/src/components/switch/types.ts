import type { Switch as Primitive } from 'bits-ui';
import type { SwitchLabelPosition, SwitchSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props. */
type Owned =
  | 'children'
  | 'child'
  | 'checked'
  | 'onCheckedChange'
  | 'disabled'
  | 'required'
  | 'type'
  | 'aria-labelledby'
  | 'aria-readonly'
  | 'ref'
  | 'class';

export interface SwitchOptions {
  /** On or off; bind it (`bind:checked`). The setting takes effect immediately. */
  checked?: boolean;
  /** Visible label, required and non-empty: names the setting (not its state) and is the accessible name. */
  label: string;
  /** Hides label and description visually; they stay the accessible name and description. */
  hideLabel?: boolean;
  /** Help text below the label: the accessible description. */
  description?: string;
  /** end: track then label (default). start: label then track, the track aligned at the end of the row. */
  labelPosition?: SwitchLabelPosition;
  /** Track and text size. Default md. */
  size?: SwitchSize;
  /** Not focusable, ignores activation. */
  disabled?: boolean;
  /** Focusable and announced read-only, ignores activation. */
  readonly?: boolean;
  /** Called when the user turns the switch on or off, with the new value. */
  oncheckedchange?: (checked: boolean) => void;
  /** The control element (a button with the switch role). */
  ref?: HTMLElement | null;
  /** Class of the container. */
  class?: string;
}

/** Other attributes (id, name, value, aria-describedby…) go to the control; `name` adds a hidden input. */
export type SwitchProps = SwitchOptions & Omit<Primitive.RootProps, Owned | keyof SwitchOptions>;
