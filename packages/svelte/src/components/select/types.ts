import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { SelectOptionsRecord, SelectSize } from './contract.generated.js';

type Owned =
  | 'children'
  | 'role'
  | 'value'
  | 'type'
  | 'disabled'
  | 'popovertarget'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-activedescendant';

export interface SelectProps extends Omit<HTMLButtonAttributes, Owned> {
  /** Value of the selected option; bind it (`bind:value`). A value that matches no option shows the placeholder. */
  value?: string;
  /** The options, in order: value, label, optional disabled and group (consecutive records of a group share a heading). */
  options: SelectOptionsRecord[];
  /** Shown in the field while no option is selected; never the accessible name. */
  placeholder?: string;
  /** Accessible name when the select is not inside a Field (not displayed). */
  label?: string;
  /** Height, text and spacing, like InputText. Default md. */
  size?: SelectSize;
  /** Whether the list is open; bind it (`bind:open`). */
  open?: boolean;
  disabled?: boolean;
  /** Focusable and submitted, but never opens and the value cannot change. */
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** Submits the value under this name with a form (a hidden input). */
  name?: string;
  /** One decorative icon before the value. */
  leading?: Snippet;
  /** Called with the value of the option the user chooses. */
  onvaluechange?: (value: string) => void;
  /** Called when the user opens or closes the list. */
  onopenchange?: (open: boolean) => void;
  /** The trigger element. */
  ref?: HTMLButtonElement | null;
}

export type { SelectOptionsRecord };
