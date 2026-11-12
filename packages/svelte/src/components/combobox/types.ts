import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComboboxFilter, ComboboxOptionsRecord, ComboboxSize } from './contract.generated.js';

type Owned =
  | 'children'
  | 'role'
  | 'value'
  | 'type'
  | 'size'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'aria-autocomplete'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-activedescendant';

export interface ComboboxProps extends Omit<HTMLInputAttributes, Owned> {
  /** Value of the selected option; bind it (`bind:value`). Always one of the options, or empty. */
  value?: string;
  /** Text of the input; bind it (`bind:inputValue`). Shows the selected option's label when a value is set. */
  inputValue?: string;
  /** The options, in order: value, label, optional disabled and group. */
  options: ComboboxOptionsRecord[];
  /** contains: the list shows the options whose label contains the text (case and accents ignored); none: the
   * application updates options from `oninputchange` (a server search). Default contains. */
  filter?: ComboboxFilter;
  /** Shown in the input while its text is empty; never the accessible name. */
  placeholder?: string;
  /** Accessible name when the combobox is not inside a Field (not displayed). */
  label?: string;
  /** Shown in the panel when no option matches. Default "No results". */
  emptyLabel?: string;
  /** Height, text and spacing, like InputText. Default md. */
  size?: ComboboxSize;
  /** Whether the list is open; bind it (`bind:open`). */
  open?: boolean;
  disabled?: boolean;
  /** Focusable and submitted, but never opens and the value cannot change. */
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** Submits the value (not the text) under this name with a form. */
  name?: string;
  /** One decorative icon before the text. */
  leading?: Snippet;
  /** Called with the value of the option the user chooses, or an empty value when the user clears the text. */
  onvaluechange?: (value: string) => void;
  /** Called with the text on every user edit. */
  oninputchange?: (text: string) => void;
  /** Called when the user opens or closes the list. */
  onopenchange?: (open: boolean) => void;
  /** The input element. */
  ref?: HTMLInputElement | null;
}

export type { ComboboxOptionsRecord };
