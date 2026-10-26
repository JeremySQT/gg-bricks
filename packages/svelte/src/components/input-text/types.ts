import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { InputTextSize, InputTextType } from './contract.generated.js';

/**
 * Options the input imposes on the IconButton of its `action` snippet: spread them on the IconButton
 * (`<IconButton {...action} label="Clear" icon={x} />`). The size is one step smaller than the input.
 */
export interface InputTextActionProps {
  size: 'sm' | 'md';
  intent: 'neutral';
  appearance: 'ghost';
  disabled: boolean;
}

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned =
  | 'children'
  | 'type'
  | 'value'
  | 'size'
  | 'placeholder'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'aria-invalid'
  | 'aria-required'
  | 'aria-label'
  | 'aria-labelledby';

export interface InputTextOptions {
  /** The value; bind it (`bind:value`). Default empty. */
  value?: string;
  /** Kind of value, for the platform keyboard, autofill and masking. Default text. */
  type?: InputTextType;
  /** Height, padding, text and icon size, matching a Button of the same size. Default md. */
  size?: InputTextSize;
  /** An example of the expected value, shown while the value is empty. Never a label. */
  placeholder?: string;
  /** Accessible name when the input is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** Not focusable, not editable, not submitted. */
  disabled?: boolean;
  /** Focusable and selectable, submitted, not editable. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** One decorative icon before the value, at the input icon size in the current color. */
  leading?: Snippet;
  /** One decorative icon after the value. Ignored when `action` is set. */
  trailing?: Snippet;
  /**
   * One IconButton after the value (clear, show password), at sizes md and lg only: at sm it is not rendered and a
   * warning is logged. Spread the received options on the IconButton.
   */
  action?: Snippet<[InputTextActionProps]>;
  /** Called on every user edit with the new value; not when the application sets the value. */
  onvaluechange?: (value: string) => void;
  /** The input element. */
  ref?: HTMLInputElement | null;
  /** Class of the visible container. */
  class?: HTMLInputAttributes['class'];
}

/** Other native attributes (id, name, autocomplete, inputmode, maxlength, oninput…) go to the input element. */
export type InputTextProps = InputTextOptions & Omit<HTMLInputAttributes, Owned | keyof InputTextOptions>;
