import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ButtonAppearance, ButtonIntent, ButtonSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and states. */
type Owned = 'children' | 'href' | 'type' | 'disabled' | 'aria-busy' | 'aria-disabled' | 'role' | 'onclick';

interface ButtonOptions {
  /** Visible text and accessible name. Required and non-empty; one line, truncated visually when space is short. */
  label: string;
  /** Visual emphasis. */
  intent?: ButtonIntent;
  /** Visual treatment: filled, bordered or text only. */
  appearance?: ButtonAppearance;
  /** Control height, padding, label size and icon size. */
  size?: ButtonSize;
  /** Not focusable and not activatable. Takes precedence over loading. */
  disabled?: boolean;
  /** Shows a centered loading indicator, keeps width and focus, blocks activation and navigation. */
  loading?: boolean;
  /** Called when the button is activated (click, Enter, Space) while neither disabled nor loading. */
  onactivate?: (event: MouseEvent) => void;
  /** One decorative icon before the label, rendered at the button icon size in the current color. */
  leading?: Snippet;
  /** One decorative icon, counter or shortcut after the label, in the current color. */
  trailing?: Snippet;
  /** The rendered element (button or a). */
  ref?: HTMLElement | null;
}

/** Native button: `type` defaults to "button" so that a Button never submits a form by accident. */
export type ButtonAsButton = ButtonOptions &
  Omit<HTMLButtonAttributes, Owned> & {
    href?: undefined;
    type?: 'button' | 'submit' | 'reset';
  };

/** Link with a button appearance, for navigation to a task. Disabled or loading never navigates. */
export type ButtonAsLink = ButtonOptions &
  Omit<HTMLAnchorAttributes, Owned> & {
    href: string;
    type?: undefined;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;
