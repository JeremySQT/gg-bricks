<script lang="ts">
  import { getContext, onDestroy, untrack } from 'svelte';
  import type { TabsContext, TabsTriggerProps } from './types.js';
  import { childDefaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './tabs.css';

  const defaults = childDefaults.trigger;
  let {
    label,
    value,
    disabled = defaults.disabled,
    leading,
    trailing,
    class: className,
    onclick,
    ...rest
  }: TabsTriggerProps = $props();

  const tabs = getContext<TabsContext | undefined>('ggb:tabs');
  // Fail identically on the server and in the browser rather than render an unnamed or unplaced tab.
  if (!tabs) throw new Error('TabsTrigger must be placed in the list of a Tabs.');
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('TabsTrigger requires a non-empty label.');
    return label;
  });
  // Checked once: a tab's value does not change.
  if (typeof untrack(() => value) !== 'string') throw new Error('TabsTrigger requires a value.');

  // Registered once, in source order, for the life of the component (a tab's value does not change).
  // svelte-ignore state_referenced_locally
  onDestroy(tabs.register(value, () => disabled));

  const isSelected = $derived(tabs.selected === value);

  function click(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
    onclick?.(event);
    if (!disabled) tabs?.select(value);
  }
</script>

<button
  {...rest}
  type="button"
  class={['ggb-tabs__trigger', className]}
  role="tab"
  id={tabs.tabId(value)}
  aria-selected={isSelected}
  aria-controls={tabs.panelId(value)}
  tabindex={isSelected ? 0 : -1}
  {disabled}
  data-value={value}
  data-selected={isSelected ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  onclick={click}
>
  {#if leading}<span class="ggb-tabs__trigger-leading" aria-hidden="true">{@render leading()}</span>{/if}
  <span class="ggb-tabs__trigger-label">{name}</span>
  {#if trailing}<span class="ggb-tabs__trigger-trailing">{@render trailing()}</span>{/if}
</button>
