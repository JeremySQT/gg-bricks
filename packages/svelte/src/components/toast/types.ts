import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ToastItemIntent, ToastPlacement } from './contract.generated.js';

/** What the region shares with its toasts, through the Svelte context key `ggb:toast`. */
export interface ToastRegionContext {
  /** True while the pointer is over the region, focus is inside it or the document is hidden. */
  readonly paused: boolean;
}

type RegionOwned = 'children' | 'role' | 'aria-label' | 'popover';

export interface ToastRegionProps extends Omit<HTMLAttributes<HTMLDivElement>, RegionOwned> {
  /** Viewport corner or edge center where toasts appear. Default bottom-end. */
  placement?: ToastPlacement;
  /** How many toasts are shown at once; the next ones wait their turn. Default 3. */
  max?: number;
  /** Name of the notifications landmark. Default Notifications. */
  label?: string;
  /** The toasts, oldest first, as the application lists them. */
  children?: Snippet;
  /** The region element. */
  ref?: HTMLDivElement | null;
}

type ToastOwned = 'children' | 'role' | 'title' | 'aria-live' | 'aria-atomic';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, ToastOwned> {
  /** Glyph and icon color: neutral (default), info, success, warning, danger. The surface stays neutral. */
  intent?: ToastItemIntent;
  /** What happened (Message sent). Required and non-empty. */
  title: string;
  /** A short detail under the title. */
  description?: string;
  /**
   * Milliseconds before the toast leaves by itself (default 5000); 0 keeps it until dismissed. A toast with an action
   * never leaves by itself.
   */
  duration?: number;
  /** Accessible name of the dismiss button. Default Dismiss. */
  dismissLabel?: string;
  /** Replaces the intrinsic glyph of the intent (decorative, drawn in currentColor). */
  icon?: Snippet;
  /** One small Button for an immediate follow-up (Undo, View), also reachable elsewhere in the interface. */
  action?: Snippet;
  /**
   * Called when the toast asks to leave: dismiss button, end of the countdown, Escape inside it, or after its action.
   * The application removes it from the list.
   */
  ondismiss?: () => void;
  /** The toast element. */
  ref?: HTMLDivElement | null;
}
