<script lang="ts">
  import { setContext } from 'svelte';
  import type { ToastRegionContext, ToastRegionProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './toast.css';

  let {
    placement = defaults.placement,
    max = defaults.max,
    label = defaults.label,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ToastRegionProps = $props();

  let hovered = $state(false);
  let focused = $state(false);
  let hidden = $state(false);
  setContext<ToastRegionContext>('ggb:toast', {
    get paused() {
      return hovered || focused || hidden;
    }
  });

  const limit = $derived(Math.max(1, Math.floor(Number.isFinite(max) ? max : defaults.max)));

  $effect(() => {
    const region = ref;
    if (!region) return;
    // The region lives in the top layer (popover manual: no light dismiss), above the page and above dialogs opened
    // before the newest toast. It is raised again whenever another overlay enters the top layer after it.
    const show = () => {
      if (!region.isConnected) return;
      if (region.matches(':popover-open')) region.hidePopover();
      region.showPopover();
    };
    if (typeof region.showPopover === 'function') show();
    const onToggle = (event: Event) => {
      const target = event.target as Element;
      if (target !== region && (event as ToggleEvent).newState === 'open' && !region.contains(target)) show();
    };
    document.addEventListener('toggle', onToggle, true);

    // At most `limit` toasts are shown, in the application's order; the next ones wait (data-queued).
    const mark = () => {
      const items = [...region.querySelectorAll<HTMLElement>(':scope > .ggb-toast__item:not([data-leaving])')];
      items.forEach((item, i) => item.toggleAttribute('data-queued', i >= limit));
    };
    const observer = new MutationObserver(mark);
    observer.observe(region, { childList: true });
    mark();

    const onVisibility = () => (hidden = document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
    return () => {
      document.removeEventListener('toggle', onToggle, true);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      if (region.matches(':popover-open')) region.hidePopover();
    };
  });
</script>

<!-- A div with the region role rather than a section element, so that an application's element styles (section
     margins) never move the region. -->
<div
  {...rest}
  role="region"
  bind:this={ref}
  class={['ggb-toast', className]}
  data-placement={placement}
  aria-label={label}
  popover="manual"
  onpointerenter={() => (hovered = true)}
  onpointerleave={() => (hovered = false)}
  onfocusin={() => (focused = true)}
  onfocusout={(event) => {
    if (!ref?.contains(event.relatedTarget as Node | null)) focused = false;
  }}
>
  {@render children?.()}
</div>
