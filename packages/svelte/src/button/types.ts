import type { Snippet } from 'svelte';
import type { MouseEventHandler } from 'svelte/elements';
import type { Button as Primitive } from 'bits-ui';
import type { ButtonIntent, ButtonAppearance, ButtonSize } from './contract.generated.js';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ButtonProps = DistributiveOmit<Primitive.RootProps,
  'children' | 'aria-busy' | 'aria-disabled' | 'role' | 'onclick'> & {
  /** Required, non-empty. Remains the accessible name while visually loading. */
  label: string;
  onclick?: MouseEventHandler<HTMLElement>;
  intent?: ButtonIntent;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  loading?: boolean;
  /** One decorative, non-interactive icon. Uses currentColor. */
  leading?: Snippet;
  /** One non-interactive icon, counter or shortcut. Inherits color. */
  trailing?: Snippet;
};
