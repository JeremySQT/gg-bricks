<script lang="ts">
  import { setContext, tick } from 'svelte';
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { PopoverProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './popover.css';

  let {
    open = $bindable(defaults.open),
    label,
    side = defaults.side,
    align = defaults.align,
    trigger,
    children,
    onopenchange,
    id,
    ref = $bindable(null),
    class: className,
    ...rest
  }: PopoverProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed dialog.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Popover requires a non-empty label.');
    return label;
  });

  const uid = $props.id();
  const panelId = $derived(id ?? `${uid}-popover`);
  const triggerId = $derived(`${panelId}-trigger`);
  const anchor = () => document.getElementById(triggerId);

  // Content inside the panel is not sized by a ButtonGroup around the popover.
  setContext('ggb:button-group', undefined);

  function set(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  // The trigger toggles the panel natively (popovertarget), which also spares it from light dismiss. On opening,
  // focus moves to the first focusable element of the content, or to the panel.
  async function opened(isOpen: boolean) {
    set(isOpen);
    if (!isOpen || !ref) return;
    // Never taller than the larger room above or below the trigger: the panel flips to that side and scrolls.
    const box = anchor()?.getBoundingClientRect();
    if (box) ref.style.setProperty('--_room', `${Math.max(box.top, innerHeight - box.bottom)}px`);
    await tick();
    const focusable = ref.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    );
    (focusable ?? ref).focus();
  }

  // Focus leaving the panel and its trigger closes it; focus stays where it went.
  function focusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!next || ref?.contains(next) || anchor()?.contains(next)) return;
    set(false);
  }
</script>

{@render trigger({
  id: triggerId,
  popovertarget: panelId,
  'aria-haspopup': 'dialog',
  'aria-expanded': open,
  'aria-controls': panelId
})}
<div
  {...rest}
  bind:this={ref}
  id={panelId}
  class={['ggb-popover', 'ggb-overlay', className]}
  role="dialog"
  aria-label={name}
  tabindex="-1"
  popover="auto"
  onfocusout={focusOut}
  {@attach floating({ anchor, open: () => open, onOpenChange: opened, side, align })}
>
  {@render children()}
</div>
