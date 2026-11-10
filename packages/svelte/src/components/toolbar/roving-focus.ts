// Roving focus of the Toolbar: one stop in sequential focus, arrow keys between the items. The rules match those of
// Bits UI Tabs, which Tabs uses (user, 2026-10-20: Toolbar shares the keyboard rules of Tabs).
//   - One item has tabindex 0 (the current one), the others -1, so that Tab enters and leaves the widget once.
//   - Horizontal: Right and Left Arrow move to the next and previous enabled item, reversed in right-to-left text;
//     vertical: Down and Up Arrow. Both wrap at the ends. Home and End move to the first and last enabled item.
//   - Disabled items (`:disabled`, `aria-disabled="true"`) are skipped and never hold the tab stop.
// The keys are handled in the capture phase and only when they come from an item, so that an item's own handler
// does not also act on them (a Menu trigger opening on Down Arrow inside a vertical toolbar) and so that keys inside
// an overlay the widget holds (a menu panel) are left alone.

export type Orientation = 'horizontal' | 'vertical';

export interface RovingFocusOptions {
  /** Orientation of the arrow keys (a getter, read on every key press). */
  orientation: () => Orientation;
  /** Selector of the items, matched inside the container; items inside a `[popover]` or `dialog` are ignored. */
  items: string;
  /**
   * The item that holds the tab stop when focus has never been in the widget (the selected tab; by default the first
   * enabled item). Read whenever the items change.
   */
  initial?: (items: HTMLElement[]) => HTMLElement | undefined;
  /** Called after a key moved focus to an item (Tabs selects it with automatic activation). */
  onMove?: (item: HTMLElement) => void;
  /**
   * Whether the module writes the tabindex of the items (default true). Tabs renders tabindex itself from its
   * selection; Toolbar holds foreign components and lets the module write it.
   */
  manageTabIndex?: boolean;
}

export const isDisabled = (item: Element): boolean =>
  item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true';

/** The items of a container, in DOM order, without those inside an overlay the container holds. */
export function itemsOf(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter((item) => {
    const overlay = item.parentElement?.closest('[popover], dialog');
    // Items moved out of view (a toolbar's overflow) are skipped.
    return (!overlay || !container.contains(overlay)) && !item.closest('[data-ggb-overflowed], [hidden]');
  });
}

/** Attachment: `<div role="toolbar" {@attach rovingFocus({ … })}>`. */
export function rovingFocus(options: RovingFocusOptions) {
  return (container: HTMLElement) => {
    const manage = options.manageTabIndex ?? true;
    let current: HTMLElement | null = null;
    const list = () => itemsOf(container, options.items);
    const enabled = () => list().filter((item) => !isDisabled(item));

    // Exactly one enabled item holds the tab stop: the last focused one while it stays enabled, else the initial one.
    const sync = () => {
      if (!manage) return;
      const all = list();
      const usable = all.filter((item) => !isDisabled(item));
      if (!current || !usable.includes(current)) current = options.initial?.(usable) ?? usable[0] ?? null;
      for (const item of all) {
        const value = item === current ? '0' : '-1';
        if (item.getAttribute('tabindex') !== value) item.setAttribute('tabindex', value);
      }
    };

    const move = (target: HTMLElement | undefined) => {
      if (!target) return;
      current = target;
      sync();
      target.focus();
      target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      options.onMove?.(target);
    };

    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const items = enabled();
      const from = items.find((item) => item === event.target || item.contains(event.target as Node));
      if (!from) return;
      const horizontal = options.orientation() === 'horizontal';
      const rtl = getComputedStyle(container).direction === 'rtl';
      const next = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const previous = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
      const index = items.indexOf(from);
      let target: HTMLElement | undefined;
      if (event.key === next) target = items[(index + 1) % items.length];
      else if (event.key === previous) target = items[(index - 1 + items.length) % items.length];
      else if (event.key === 'Home') target = items[0];
      else if (event.key === 'End') target = items.at(-1);
      else return;
      event.preventDefault();
      event.stopPropagation();
      move(target);
    };

    // Focus reaching an item by any means (pointer, script, a menu returning focus to its trigger) makes it current.
    const focusin = (event: FocusEvent) => {
      const item = list().find((i) => i === event.target);
      if (item && !isDisabled(item) && item !== current) {
        current = item;
        sync();
      }
    };

    container.addEventListener('keydown', keydown, true);
    container.addEventListener('focusin', focusin);
    const observer = new MutationObserver(sync);
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'data-ggb-overflowed']
    });
    sync();
    return () => {
      container.removeEventListener('keydown', keydown, true);
      container.removeEventListener('focusin', focusin);
      observer.disconnect();
    };
  };
}
