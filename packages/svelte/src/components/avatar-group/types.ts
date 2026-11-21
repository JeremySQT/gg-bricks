import type { HTMLAttributes } from 'svelte/elements';
import type { AvatarGroupShape, AvatarGroupSize } from './contract.generated.js';

/** One person (or team) of the group, rendered as an Avatar of the group's size and shape. */
export interface AvatarGroupItem {
  /** The accessible name of the avatar and the source of its initials. Required. */
  name: string;
  /** Picture URL; the initials stay while it loads or if it fails. */
  src?: string;
  /** Text shown instead of the computed initials (an abbreviation). */
  initials?: string;
}

/** The group renders its list of avatars from `avatars`: no children, role or tab stop from outside. */
type Owned = 'children' | 'role' | 'tabindex' | 'aria-label';

export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLUListElement>, Owned> {
  /** Accessible name of the list (Assignees, Participants). Required. */
  label: string;
  /** The people of the group, in order; each avatar is drawn above the previous one. At least one. */
  avatars: AvatarGroupItem[];
  /** Size of every avatar, 24 to 64 px. Default md. */
  size?: AvatarGroupSize;
  /** Shape of every avatar. Default circle. */
  shape?: AvatarGroupShape;
  /** Most boxes shown, the +N box included; 0 shows every avatar. Default 5. */
  max?: number;
  /** Number of people when the application knows more than it passes in avatars. Default 0 (the avatars). */
  total?: number;
  /** Word after the number of the others in the +N box's accessible name (3 more). Default "more". */
  moreLabel?: string;
  /** The rendered list. */
  ref?: HTMLUListElement | null;
}
