import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { TextareaResize, TextareaSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  'children' | 'value' | 'rows' | 'placeholder' | 'disabled' | 'readonly' | 'required' | 'aria-invalid' | 'aria-label';

export interface TextareaOptions {
  /** The value; bind it (`bind:value`). Default empty. */
  value?: string;
  /** Padding and text size, matching an InputText of the same size. Default md. */
  size?: TextareaSize;
  /** Initial number of visible lines. Default 3, at least 1. */
  rows?: number;
  /** vertical: the user resizes the height; auto: the height follows the content up to maxRows; none: fixed. */
  resize?: TextareaResize;
  /** Largest number of lines shown with resize auto before the content scrolls. Default 8. */
  maxRows?: number;
  /** An example of the expected value, shown while the value is empty. Never a label. */
  placeholder?: string;
  /** Accessible name when the textarea is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** Not focusable, not editable, not submitted. */
  disabled?: boolean;
  /** Focusable, scrollable and selectable, submitted, not editable. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Called on every user edit with the new value; not when the application sets the value. */
  onvaluechange?: (value: string) => void;
  /** The textarea element. */
  ref?: HTMLTextAreaElement | null;
  /** Class of the visible container. */
  class?: HTMLTextareaAttributes['class'];
}

/** Other native attributes (id, name, maxlength, spellcheck, oninput…) go to the textarea element. */
export type TextareaProps = TextareaOptions & Omit<HTMLTextareaAttributes, Owned | keyof TextareaOptions>;
