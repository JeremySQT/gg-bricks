<script lang="ts">
  import { setContext, tick } from 'svelte';
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { MenuProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './menu.css';

  let {
    open = $bindable(defaults.open),
    label,
    side = defaults.side,
    align = defaults.align,
    trigger,
    children,
    onselect,
    onopenchange,
    id,
    ref = $bindable(null),
    class: className,
    ...rest
  }: MenuProps = $props();

  const uid = $props.id();
  const menuId = $derived(id ?? `${uid}-menu`);
  const triggerId = $derived(`${menuId}-trigger`);
  const anchor = () => document.getElementById(triggerId);
  const name = $derived(typeof label === 'string' && label.trim() ? label : undefined);

  // Items are not sized by a ButtonGroup around the menu.
  setContext('ggb:button-group', undefined);

  function set(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  const items = () => (ref ? [...ref.querySelectorAll<HTMLElement>('.ggb-menu__item')] : []);
  const highlight = (item: HTMLElement | undefined) => item?.focus({ preventScroll: false });
  // Opening the menu, or the first arrow key when no item is highlighted, starts on an enabled item (the contract):
  // disabled items are reached afterwards by the arrow keys, Home and End.
  const isEnabled = (item: HTMLElement) => item.getAttribute('aria-disabled') !== 'true';
  const firstEnabled = (list: HTMLElement[]) => list.find(isEnabled);
  const lastEnabled = (list: HTMLElement[]) => [...list].reverse().find(isEnabled);

  // How the menu opens decides the first highlight: by keyboard the first (or last) item, by pointer none.
  let pending: 'first' | 'last' | 'none' = 'none';
  async function toggled(isOpen: boolean) {
    set(isOpen);
    if (!isOpen || !ref) return;
    // The panel is at least as wide as its trigger, and never taller than the larger room above or below it (it
    // flips to that side and scrolls when its items do not fit).
    const box = anchor()?.getBoundingClientRect();
    ref.style.setProperty('--_anchor-inline-size', `${box?.width ?? 0}px`);
    if (box) ref.style.setProperty('--_room', `${Math.max(box.top, innerHeight - box.bottom)}px`);
    await tick();
    // Only when focus has not moved since the menu opened (from its trigger or the document).
    const active = document.activeElement;
    if (!ref.matches(':popover-open') || (active && active !== document.body && active !== anchor())) {
      pending = 'none';
      return;
    }
    const list = items();
    if (pending === 'first') highlight(firstEnabled(list));
    else if (pending === 'last') highlight(lastEnabled(list));
    else ref.focus();
    pending = 'none';
  }
  function triggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      pending = event.key === 'ArrowDown' ? 'first' : 'last';
      if (open) toggled(true);
      else ref?.showPopover();
    } else if (event.key === 'Enter' || event.key === ' ') {
      pending = 'first';
    }
  }
  function triggerPointerdown() {
    pending = 'none';
  }

  function closeTo(target: 'trigger' | 'stay') {
    ref?.hidePopover();
    if (target === 'trigger') anchor()?.focus();
  }

  function activate(item: HTMLElement, event: Event) {
    if (item.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }
    onselect?.(item.dataset.value ?? '');
    // A link item navigates through its own default action; the menu closes in either case.
    closeTo(item.hasAttribute('href') ? 'stay' : 'trigger');
  }

  // Typeahead: characters typed within half a second build a prefix; the next item whose label starts with it is
  // highlighted (from the current one, wrapping).
  let typed = '';
  let typedAt = 0;
  function typeahead(char: string) {
    const now = performance.now();
    typed = now - typedAt > 500 ? char : typed + char;
    typedAt = now;
    const list = items();
    const start = list.indexOf(document.activeElement as HTMLElement);
    const ordered = [...list.slice(start + 1), ...list.slice(0, start + 1)];
    const prefix = typed.toLowerCase();
    const match = ordered.find((i) => (i.dataset.label ?? '').toLowerCase().startsWith(prefix));
    if (match) highlight(match);
  }

  function keydown(event: KeyboardEvent) {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        highlight(index < 0 ? firstEnabled(list) : list[(index + 1) % list.length]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        highlight(index < 0 ? lastEnabled(list) : list[index === 0 ? list.length - 1 : index - 1]);
        break;
      case 'Home':
        event.preventDefault();
        highlight(list[0]);
        break;
      case 'End':
        event.preventDefault();
        highlight(list.at(-1));
        break;
      case 'Enter':
      case ' ':
        if (index >= 0) {
          event.preventDefault();
          if (list[index].hasAttribute('href') && list[index].getAttribute('aria-disabled') !== 'true')
            list[index].click();
          else activate(list[index], event);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeTo('trigger');
        break;
      case 'Tab':
        // Focus moves on from the trigger: the menu closes, focus goes back to the trigger, and the Tab press
        // continues from there.
        closeTo('trigger');
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeahead(event.key);
    }
  }

  function click(event: MouseEvent) {
    const item = (event.target as Element).closest<HTMLElement>('.ggb-menu__item');
    if (item) activate(item, event);
  }
  // The pointer highlights the item under it; leaving the panel removes the highlight.
  function pointermove(event: PointerEvent) {
    const item = (event.target as Element).closest<HTMLElement>('.ggb-menu__item');
    if (item && document.activeElement !== item) item.focus({ preventScroll: true });
  }
  function pointerleave() {
    if (ref?.contains(document.activeElement)) ref.focus({ preventScroll: true });
  }
</script>

{@render trigger({
  id: triggerId,
  popovertarget: menuId,
  'aria-haspopup': 'menu',
  'aria-expanded': open,
  'aria-controls': menuId,
  onkeydown: triggerKeydown,
  onpointerdown: triggerPointerdown
})}
<div
  {...rest}
  bind:this={ref}
  id={menuId}
  class={['ggb-menu', 'ggb-overlay', className]}
  role="menu"
  aria-label={name}
  aria-labelledby={name ? undefined : triggerId}
  tabindex="-1"
  popover="auto"
  onkeydown={keydown}
  onclick={click}
  onpointermove={pointermove}
  onpointerleave={pointerleave}
  {@attach floating({ anchor, open: () => open, onOpenChange: toggled, side, align })}
>
  {@render children()}
</div>
