import type { HTMLAttributes } from 'svelte/elements';
import type { AvatarShape, AvatarSize } from './contract.generated.js';

/** The avatar shows its own content and is never interactive: no children, role or tab stop from outside. */
type Owned = 'children' | 'role' | 'tabindex';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, Owned> {
  /** The person's or the organization's name: the accessible name, and the source of the initials. */
  name?: string;
  /** Text shown instead of the initials computed from name (at most three characters, an abbreviation). */
  initials?: string;
  /** Picture URL. Shown only once it has loaded; the initials or the glyph stay while it loads or if it fails. */
  src?: string;
  /** 24, 32, 40, 48 or 64 px. Ignored inside an AvatarGroup, which sets it. Default md. */
  size?: AvatarSize;
  /** circle for a person, square for an organization, a team or a project. Default circle. */
  shape?: AvatarShape;
  /** Hide the avatar from assistive technology when the name is written next to it. Default false. */
  decorative?: boolean;
  /** The rendered element. */
  ref?: HTMLSpanElement | null;
}

/** The status of the picture: none without src, then loading, loaded or error. */
export type AvatarImageStatus = 'none' | 'loading' | 'loaded' | 'error';
