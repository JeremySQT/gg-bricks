<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { Tabs as Primitive } from 'bits-ui';
  import type { TabsContext, TabsPanelProps } from './types.js';
  import './tokens.generated.css';
  import './tabs.css';

  let { value, children, class: className, ...rest }: TabsPanelProps = $props();

  const tabs = getContext<TabsContext | undefined>('ggb:tabs');
  if (!tabs) throw new Error('TabsPanel must be placed in a Tabs.');
  // Checked once: a tab's value does not change.
  if (typeof untrack(() => value) !== 'string') throw new Error('TabsPanel requires a value.');

  // Shown from the ggbrick fallback (see TabsTrigger), also during server rendering.
  const shown = $derived(tabs.selected === value);

  // The panel is a stop in sequential focus only when its content has no focusable element (WAI-ARIA tabs pattern).
  let ref = $state<HTMLElement | null>(null);
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

<Primitive.Content
  {...rest}
  bind:ref
  {value}
  id={tabs.panelId(value)}
  class={['ggb-tabs__panel', className]}
  tabindex={focusable ? 0 : -1}
>
  {#snippet child({ props })}
    <div {...props} hidden={!shown} data-state={shown ? 'active' : 'inactive'}>
      {@render children()}
    </div>
  {/snippet}
</Primitive.Content>
