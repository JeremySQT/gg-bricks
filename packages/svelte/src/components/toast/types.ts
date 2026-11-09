import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ToastItemAppearance, ToastItemIntent, ToastPlacement } from './contract.generated.js';

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
  /** Glyph and icon color: neutral (default), info, success, warning, danger. */
  intent?: ToastItemIntent;
  /** neutral (default): overlay surface, the icon carries the intent. intense: tinted by the intent, for a stronger message. */
  appearance?: ToastItemAppearance;
  /** What happened (Message sent). Required and non-empty. */
  title: string;
  /** A short detail under the title. */
  description?: string;
  /**
   * Milliseconds before the toast leaves by itself. Not set: none for danger (even with an action), 8000 with an action (time to undo), 5000 otherwise.
   * 0 keeps the toast until it is dismissed or its action is activated.
   */
  duration?: number;
  /** Shows the dismiss button (default true). Ignored for a toast without a countdown, which always keeps it. */
  closable?: boolean;
  /** Accessible name of the dismiss button. Default Dismiss. */
  dismissLabel?: string;
  /** Replaces the intrinsic glyph of the intent (decorative, drawn in currentColor). */
  icon?: Snippet;
  /**
   * One small Button for a secondary follow-up (Undo, View, Retry), also reachable elsewhere in the interface: ghost or
   * outline, neutral (or danger for a destructive follow-up); never an accent call to action.
   */
  action?: Snippet;
  /**
   * Called when the toast asks to leave: dismiss button, end of the countdown, Escape inside it, or after its action.
   * The application removes it from the list.
   */
  ondismiss?: () => void;
  /** The toast element. */
  ref?: HTMLDivElement | null;
}
