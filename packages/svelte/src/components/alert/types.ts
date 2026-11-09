import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { AlertIntent } from './contract.generated.js';

/** Attributes the component owns: the live role follows from `live` and `intent`. */
type Owned = 'children' | 'role' | 'aria-live' | 'title';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, Owned> {
  /** Color family and default glyph: neutral, info (default), success, warning, danger. */
  intent?: AlertIntent;
  /** A short heading, in label typography. Optional; the alert needs a title, a content or both. */
  title?: string;
  /** The message: a sentence, a link, a short list (body typography). */
  children?: Snippet;
  /** Replaces the intrinsic glyph of the intent (an Icon or an svg drawn in currentColor; decorative). */
  icon?: Snippet;
  /** One ButtonGroup of follow-up actions under the content; its buttons are small (sm) unless the group says otherwise. */
  actions?: Snippet;
  /** Shows a dismiss button at the inline end; the application removes the alert when `ondismiss` fires. */
  dismissible?: boolean;
  /** Accessible name of the dismiss button. Default Dismiss. */
  dismissLabel?: string;
  /** Announce the alert when it appears or its text changes: assertive for danger and warning, polite otherwise. */
  live?: boolean;
  /** Called when the user activates the dismiss button. */
  ondismiss?: () => void;
  /** The alert element. */
  ref?: HTMLDivElement | null;
}
