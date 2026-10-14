import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { IconSize } from './contract.generated.js';

/** Attributes the component owns: they follow from the contract props and rules. */
type Owned = 'children' | 'viewBox' | 'width' | 'height' | 'fill' | 'focusable' | 'role' | 'aria-label' | 'aria-hidden';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, Owned> {
  /** Box size: xs 12, sm 16, md 20, lg 24, xl 32 px (size.icon.*), identical in every density. */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative and hidden from assistive technology. */
  label?: string;
  /**
   * Coordinate box of the glyph. Defaults to the Phosphor grid; pass another set's grid
   * (for example "0 0 24 24") when its glyphs are drawn on it.
   */
  viewBox?: string;
  /** The glyph: the drawing (paths, shapes) in the coordinate box, one color, painted in currentColor. */
  children?: Snippet;
}
