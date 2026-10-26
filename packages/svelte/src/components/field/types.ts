import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

/**
 * What a Field shares with the control it wraps, through the Svelte context key `ggb:field` (a string, so that
 * neither component folder imports the other). InputText, Textarea, Checkbox and RadioGroup read it when present
 * and declare the same shape locally.
 */
export interface FieldContext {
  /** Id for a text entry: the field label points to it. */
  readonly controlId: string;
  /** Id of the field label: names a RadioGroup, or the question a Checkbox answers. */
  readonly labelId: string;
  /** Ids of the description and of the visible message, in that order; undefined when neither shows. */
  readonly describedBy: string | undefined;
  readonly required: boolean;
  readonly invalid: boolean;
  readonly disabled: boolean;
  /** Called once by the control: a text entry is labelled by `for`, a choice control by `aria-labelledby`. */
  register(kind: 'text' | 'choice'): void;
}

type Owned = 'children' | 'role';

export interface FieldOptions {
  /** Visible label, required and non-empty. Names a text entry or a radio group, or the question a checkbox answers. */
  label: string;
  /** Help text between the label and the control, read as the control's description. */
  description?: string;
  /** Error message shown below the control while `invalid` is true. */
  message?: string;
  /** Shows the asterisk after the label and makes the control required. */
  required?: boolean;
  /** Makes the control invalid and shows `message`. */
  invalid?: boolean;
  /** Disables the control and dims the label and description. */
  disabled?: boolean;
  /** Exactly one control: InputText, Textarea, Checkbox or RadioGroup. */
  children: Snippet;
}

export type FieldProps = FieldOptions & Omit<HTMLAttributes<HTMLDivElement>, Owned>;
