<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import type { TabsContext, TabsPanelProps } from './types.js';
  import './tokens.generated.css';
  import './tabs.css';

  let { value, children, class: className, ...rest }: TabsPanelProps = $props();

  const tabs = getContext<TabsContext | undefined>('ggb:tabs');
  if (!tabs) throw new Error('TabsPanel must be placed in a Tabs.');
  // Checked once: a tab's value does not change.
  if (typeof untrack(() => value) !== 'string') throw new Error('TabsPanel requires a value.');

  const shown = $derived(tabs.selected === value);
  let ref = $state<HTMLDivElement | null>(null);
  // The panel is a stop in sequential focus only when its content has no focusable element (WAI-ARIA tabs pattern).
  let focusable = $state(true);
  $effect(() => {
    const el = ref;
    if (!el) return;
    const check = () => {
      focusable = !el.querySelector(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
      );
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(el, { subtree: true, childList: true, attributes: true });
    return () => observer.disconnect();
  });
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-tabs__panel', className]}
  role="tabpanel"
  id={tabs.panelId(value)}
  aria-labelledby={tabs.tabId(value)}
  tabindex={focusable ? 0 : undefined}
  hidden={!shown}
>
  {@render children()}
</div>
