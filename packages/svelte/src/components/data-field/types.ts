import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { DataFieldOrientation, DataFieldSize } from './contract.generated.js';

/** The field is a named group with a fixed structure: no role or tab stop from outside. */
type Owned = 'role' | 'tabindex';

export interface DataFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, Owned | 'children'> {
  /** The name of the information (Email, Owner, Created on). Required and non-empty; it names the group. */
  label: string;
  /** The value as plain text. Ignored when children are given. */
  value?: string;
  /** Rich value instead of value: a Badge, a Link, an Avatar with a name, several lines. */
  children?: Snippet;
  /** vertical stacks label above value; horizontal places them side by side. Default vertical. */
  orientation?: DataFieldOrientation;
  /** sm for dense panels, md by default. */
  size?: DataFieldSize;
  /** Announced instead of the em dash shown for an empty value. Default "No value". */
  emptyLabel?: string;
  /** The rendered element. */
  ref?: HTMLDivElement | null;
}
