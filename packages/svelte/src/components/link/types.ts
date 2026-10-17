import type { HTMLAnchorAttributes } from 'svelte/elements';
import type { LinkDestination, LinkTone } from './contract.generated.js';

/**
 * Attributes the component owns: the content follows from the props, the destination decides the browsing
 * context, and a link is never disabled.
 */
type Owned = 'children' | 'href' | 'target' | 'aria-label' | 'aria-disabled' | 'role';

export interface LinkProps extends Omit<HTMLAnchorAttributes, Owned> {
  /** Visible text and start of the accessible name. Required and non-empty; wraps with the surrounding text. */
  label: string;
  /** Destination. Required: a link that cannot be followed is plain text. mailto: for email, tel: for phone. */
  href: string;
  /** accent draws the link in the link color; inherit takes the color of the surrounding text. Default accent. */
  tone?: LinkTone;
  /**
   * What the link leads to, shown by a glyph after the label: page (none, default), external (new tab),
   * email, phone, file (format glyph and visible format and size), print (a printable version).
   */
  destination?: LinkDestination;
  /** File format with destination file (pdf, docx…): chooses the glyph and is shown in uppercase. */
  fileType?: string;
  /** File size with destination file, shown as given (2.4 MB): the application formats it. */
  fileSize?: string;
  /** Replaces the English suffix announced after the name (opens in a new tab, email…), for translation. */
  destinationLabel?: string;
  /** The rendered element. */
  ref?: HTMLAnchorElement | null;
}
