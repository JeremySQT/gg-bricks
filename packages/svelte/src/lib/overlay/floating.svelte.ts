import { tick } from 'svelte';

export type Side = 'top' | 'bottom';
export type Align = 'start' | 'center' | 'end';

export interface FloatingOptions {
  /** The element the overlay is placed against (a getter, read when the overlay opens). */
  anchor: () => HTMLElement | null;
  /** The open state (a getter); the attachment shows or hides the popover to match it. */
  open: () => boolean;
  /** Called when the browser closes the popover (light dismiss, Escape) or opens it. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flipped when the viewport is too small. Default bottom. */
  side?: Side;
  /** Alignment along the anchor's inline axis. Default start. */
  align?: Align;
  /**
   * Popover mode: `auto` gives the browser's light dismiss and Escape and closes other auto popovers;
   * `manual` leaves dismissal to the caller (a Bits UI layer, for example). Default auto.
   */
  mode?: 'auto' | 'manual';
  /** Positioning engine: `auto` uses CSS anchor positioning where the browser supports it; `measured` forces the
   * JavaScript fallback (tests and review pages exercise it in a browser that supports both). Default auto. */
  positioning?: 'auto' | 'measured';
}

/** True when the browser positions popovers with CSS anchor positioning; otherwise the attachment measures. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' && CSS.supports('position-area: block-end') && CSS.supports('anchor-name: --a');

let counter = 0;

/**
 * Attachment for an element rendered with the `popover` attribute:
 * `<div class="ggb-overlay" popover="auto" {@attach floating({…})}>`.
 * It names the anchor, sets the side and alignment the stylesheet positions by (`overlay.css`, CSS anchor
 * positioning with `position-try-fallbacks`), and, where anchor positioning is missing, measures the anchor and
 * sets inset coordinates itself while the popover is open. The element is never moved in the DOM.
 */
export function floating(options: FloatingOptions) {
  return (node: HTMLElement) => {
    const mode = options.mode ?? 'auto';
    const side = options.side ?? 'bottom';
    const align = options.align ?? 'start';
    const name = `--ggb-anchor-${++counter}`;
    // Write `popover` in the markup: an element rendered without it is displayed for a frame, then plays its exit
    // transition when the attribute arrives. The attachment only completes a missing attribute.
    if (!node.hasAttribute('popover')) node.setAttribute('popover', mode);
    node.dataset.side = side;
    node.dataset.align = align;
    const native = options.positioning !== 'measured' && supportsAnchorPositioning();
    if (native) node.style.setProperty('position-anchor', name);
    else node.dataset.positioning = 'measured';

    let anchored: HTMLElement | null = null;
    const bindAnchor = () => {
      const anchor = options.anchor();
      if (anchor === anchored) return;
      if (native) {
        anchored?.style.removeProperty('anchor-name');
        anchor?.style.setProperty('anchor-name', name);
      }
      anchored = anchor;
    };

    // Measured fallback: inset coordinates from the anchor's box, flipped when the preferred side lacks room.
    const offset = () => parseFloat(getComputedStyle(node).getPropertyValue('--_offset')) || 0;
    const measure = () => {
      const anchor = anchored;
      if (!anchor) return;
      const a = anchor.getBoundingClientRect();
      const gap = offset();
      const height = node.offsetHeight;
      const width = node.offsetWidth;
      const roomBelow = window.innerHeight - a.bottom - gap;
      const roomAbove = a.top - gap;
      const below =
        side === 'bottom' ? roomBelow >= height || roomBelow >= roomAbove : roomAbove < height && roomBelow > roomAbove;
      const top = below ? a.bottom + gap : a.top - gap - height;
      const rtl = getComputedStyle(anchor).direction === 'rtl';
      const startEdge = rtl ? a.right - width : a.left;
      const endEdge = rtl ? a.left : a.right - width;
      let left = align === 'start' ? startEdge : align === 'end' ? endEdge : a.left + (a.width - width) / 2;
      left = Math.max(0, Math.min(left, window.innerWidth - width));
      node.style.top = `${Math.max(0, top)}px`;
      node.style.left = `${left}px`;
      node.dataset.placedSide = below ? 'bottom' : 'top';
    };
    const listen = (on: boolean) => {
      const method = on ? 'addEventListener' : 'removeEventListener';
      window[method]('resize', measure);
      document[method]('scroll', measure, true);
    };

    const onToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === 'open';
      if (!native) {
        if (open) {
          measure();
          listen(true);
        } else listen(false);
      }
      if (open !== options.open()) options.onOpenChange?.(open);
    };
    node.addEventListener('toggle', onToggle);

    $effect(() => {
      const open = options.open();
      bindAnchor();
      if (!node.isConnected) return;
      const shown = node.matches(':popover-open');
      if (open && !shown) {
        // After the current render so that the content exists before it is measured.
        void tick().then(() => {
          if (node.isConnected && options.open() && !node.matches(':popover-open')) node.showPopover();
        });
      } else if (!open && shown) node.hidePopover();
    });

    return () => {
      node.removeEventListener('toggle', onToggle);
      listen(false);
      if (node.matches(':popover-open')) node.hidePopover();
      if (native) anchored?.style.removeProperty('anchor-name');
    };
  };
}
