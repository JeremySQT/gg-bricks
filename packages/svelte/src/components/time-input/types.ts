import type { HTMLAttributes } from 'svelte/elements';
import type { TimeInputHourCycle, TimeInputSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned = 'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-invalid' | 'aria-disabled';

export interface TimeInputOptions {
  /** The time, 24-hour HH:mm (HH:mm:ss with seconds), or empty; bind it (`bind:value`). Default empty. */
  value?: string;
  /** Earliest time (HH:mm): Up and Down skip earlier times; a typed earlier time becomes min when focus leaves. */
  min?: string;
  /** Latest time (HH:mm), not before min: Up and Down skip later times; a typed later time becomes max on leaving. */
  max?: string;
  /** BCP 47 locale: order and separators of the parts, hour cycle when hourCycle is auto. Default "en". */
  locale?: string;
  /** auto follows the locale; h12 shows 1 to 12 with a day period; h23 shows 00 to 23. Default auto. */
  hourCycle?: TimeInputHourCycle;
  /** Shows and edits seconds; value becomes HH:mm:ss. */
  seconds?: boolean;
  /** Accessible name when the input is not inside a Field (not displayed). Inside a Field, the field label wins. */
  label?: string;
  /** Height, padding and text size, matching InputText. Default md. */
  size?: TimeInputSize;
  /** Not focusable, not editable, not submitted. */
  disabled?: boolean;
  /** Focusable, announced, submitted, not editable. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Submits the value under this name, in the format of value. */
  name?: string;
  /** Called when the user completes, changes or clears the time; not when the application sets it. */
  onvaluechange?: (value: string) => void;
  /** The visible container, exposed as the group of parts. */
  ref?: HTMLElement | null;
}

/** Other attributes (id, class, data-*, aria-describedby…) go to the visible container, which is the group. */
export type TimeInputProps = TimeInputOptions & Omit<HTMLAttributes<HTMLDivElement>, Owned | keyof TimeInputOptions>;
