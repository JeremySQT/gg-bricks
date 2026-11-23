import type { HTMLAttributes } from 'svelte/elements';
import type { DatePickerSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and the enclosing Field. */
type Owned = 'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-invalid' | 'aria-disabled';

export interface DatePickerOptions {
  /** The date, ISO 8601 (YYYY-MM-DD), or empty; bind it (`bind:value`). Default empty. */
  value?: string;
  /** Earliest date (YYYY-MM-DD): earlier days are disabled in the calendar. A typed earlier date is kept. */
  min?: string;
  /** Latest date (YYYY-MM-DD): later days are disabled in the calendar. A typed later date is kept. */
  max?: string;
  /** BCP 47 locale: order, separators and placeholders of the parts, month and day names, first day of the week. */
  locale?: string;
  /** Accessible name when the date picker is not inside a Field (not displayed). Inside a Field, its label wins. */
  label?: string;
  /** Height, padding, text and button size of the field, matching InputText. The calendar has no size. Default md. */
  size?: DatePickerSize;
  /** Whether the calendar is open; bind it (`bind:open`) to open or close it from the application. */
  open?: boolean;
  /** Not focusable, button disabled, never opens, not submitted. */
  disabled?: boolean;
  /** Parts focusable and announced, not editable; button disabled; submitted. */
  readonly?: boolean;
  /** Announced as invalid; the explanation belongs to the enclosing Field. Never set by the component. */
  invalid?: boolean;
  /** Announced as required; the visible marker belongs to the enclosing Field. */
  required?: boolean;
  /** Submits the value under this name, as an ISO 8601 date or empty. */
  name?: string;
  /** Accessible name of the calendar button. Default "Choose date". */
  openLabel?: string;
  /** Accessible name of the previous month button. Default "Previous month". */
  previousLabel?: string;
  /** Accessible name of the next month button. Default "Next month". */
  nextLabel?: string;
  /** Called when the user completes, changes or clears the date (segments or calendar). */
  onvaluechange?: (value: string) => void;
  /** Called when the user opens or closes the calendar. */
  onopenchange?: (open: boolean) => void;
  /** The visible field, exposed as the group of parts. */
  ref?: HTMLElement | null;
}

/** Other attributes (id, class, data-*, aria-describedby…) go to the visible field, which is the group of parts. */
export type DatePickerProps = DatePickerOptions & Omit<HTMLAttributes<HTMLDivElement>, Owned | keyof DatePickerOptions>;
