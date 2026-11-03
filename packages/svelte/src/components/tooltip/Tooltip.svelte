<script module lang="ts">
  // One tooltip at a time across the page: opening one closes the other. Once a tooltip has been open, moving to
  // another trigger opens its tooltip at once (no hover delay) for a short while.
  let current: (() => void) | null = null;
  let lastShown = 0;
  const SKIP_DELAY = 300;
</script>

<script lang="ts">
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { TooltipProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './tooltip.css';

  let {
    label,
    side = defaults.side,
    align = defaults.align,
    open = $bindable(defaults.open),
    children,
    onopenchange,
    id
  }: TooltipProps = $props();

  // Fail identically on the server and in the browser rather than render an empty tooltip.
  const text = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Tooltip requires a non-empty label.');
    return label;
  });

  const uid = $props.id();
  const tooltipId = $derived(id ?? `${uid}-tooltip`);
  let wrapper = $state<HTMLElement | null>(null);
  let tip = $state<HTMLElement | null>(null);
  /** The trigger: the first element the snippet renders. */
  const anchor = () => (wrapper?.firstElementChild as HTMLElement | null) ?? null;

  function set(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }
  const close = () => set(false);
  $effect(() => {
    if (!open) return;
    if (current && current !== close) current();
    current = close;
    lastShown = performance.now();
    // Escape closes the tooltip without moving focus.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (current === close) current = null;
      lastShown = performance.now();
    };
  });

  const blocked = () => {
    const el = anchor();
    return !el || el.matches(':disabled, [aria-disabled="true"], [data-disabled]');
  };
  const delay = () => {
    const el = tip;
    const ms = el ? parseFloat(getComputedStyle(el).getPropertyValue('--ggb-tooltip-motionDelay')) : 0;
    return Number.isFinite(ms) ? ms : 0;
  };

  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  };
  function pointerEnter(event: PointerEvent) {
    // On touch a press activates the trigger; the tooltip never opens.
    if (event.pointerType === 'touch' || blocked()) return;
    cancel();
    const skip = current !== null || performance.now() - lastShown < SKIP_DELAY;
    if (skip) set(true);
    else openTimer = setTimeout(() => set(true), delay());
  }
  function pointerLeave() {
    clearTimeout(openTimer);
    // A short grace lets the pointer travel to the tooltip, which keeps it open.
    closeTimer = setTimeout(() => {
      if (!wrapper?.matches(':focus-within')) close();
    }, 100);
  }
  function focusIn(event: FocusEvent) {
    if (blocked()) return;
    if ((event.target as Element).matches(':focus-visible')) {
      cancel();
      set(true);
    }
  }

  // The tooltip describes its trigger, unless the trigger's name already says the same thing (an IconButton named
  // by the same text).
  $effect(() => {
    const el = anchor();
    if (!el) return;
    if ((el.getAttribute('aria-label') ?? '').trim() === text.trim()) return;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(tooltipId)) el.setAttribute('aria-describedby', [...ids, tooltipId].join(' '));
    return () => {
      const rest = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((x) => x && x !== tooltipId);
      if (rest.length) el.setAttribute('aria-describedby', rest.join(' '));
      else el.removeAttribute('aria-describedby');
    };
  });
</script>

<!-- display: contents: the wrapper only listens; the trigger keeps its own layout. -->
<span
  class="ggb-tooltip-trigger"
  bind:this={wrapper}
  role="none"
  onpointerenter={pointerEnter}
  onpointerleave={pointerLeave}
  onfocusin={focusIn}
  onfocusout={(event) => {
    if (!wrapper?.contains(event.relatedTarget as Node | null)) close();
  }}
  onclick={close}
  onkeydown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') close();
  }}
>
  {@render children()}
  <span
    bind:this={tip}
    id={tooltipId}
    class="ggb-tooltip ggb-overlay"
    role="tooltip"
    popover="manual"
    data-side={side}
    data-align={align}
    onpointerenter={() => clearTimeout(closeTimer)}
    onpointerleave={pointerLeave}
    {@attach floating({ anchor, open: () => open, onOpenChange: set, side, align, mode: 'manual' })}>{text}</span
  >
</span>
