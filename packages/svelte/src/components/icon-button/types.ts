import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { IconButtonAppearance, IconButtonIntent, IconButtonSize } from './contract.generated.js';

/**
 * Attributes the component owns: they follow from the contract props and states. A native `onclick` or
 * `onauxclick` may still be passed: the component calls it only while neither disabled nor loading.
 */
type Owned = 'children' | 'href' | 'type' | 'disabled' | 'aria-busy' | 'aria-disabled' | 'aria-label' | 'role';

interface IconButtonOptions {
  /** Accessible name. Required and non-empty; never shown (a tooltip, composed by the integration, may show it). */
  label: string;
  /** The one icon, rendered at the icon button icon size in the current color. Decorative. */
  icon: Snippet;
  /** Visual emphasis. Default neutral. */
  intent?: IconButtonIntent;
  /** Visual treatment: filled, bordered or text only. Default ghost. */
  appearance?: IconButtonAppearance;
  /** Square size and icon size, matching a Button of the same size. */
  size?: IconButtonSize;
  /** Not focusable and not activatable. Takes precedence over loading. */
  disabled?: boolean;
  /** Shows a loading indicator in place of the icon, keeps focus, blocks activation and navigation. */
  loading?: boolean;
  /** Called when the icon button is activated (click, Enter, Space) while neither disabled nor loading. */
  onactivate?: (event: MouseEvent) => void;
  /** The rendered element (button or a). */
  ref?: HTMLElement | null;
}

/** Native button: `type` defaults to "button" so that an icon button never submits a form by accident. */
export type IconButtonAsButton = IconButtonOptions &
  Omit<HTMLButtonAttributes, Owned> & {
    href?: undefined;
    type?: 'button' | 'submit' | 'reset';
  };

/** Icon-only link with a button appearance, for navigation to a task. Disabled or loading never navigates. */
export type IconButtonAsLink = IconButtonOptions &
  Omit<HTMLAnchorAttributes, Owned> & {
    href: string;
    type?: undefined;
  };

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;
