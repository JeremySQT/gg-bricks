<script lang="ts">
  import { getContext, onDestroy, untrack } from 'svelte';
  import { Tabs as Primitive } from 'bits-ui';
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

  // The selection is rendered from the ggbrick fallback (tabs.selected), which equals the value Bits UI receives once
  // mounted; during server rendering Bits UI reads the value before the triggers register and would select none.
  const isSelected = $derived(tabs.selected === value);
</script>

<Primitive.Trigger
  {...rest}
  {value}
  {disabled}
  id={tabs.tabId(value)}
  class={['ggb-tabs__trigger', className]}
  data-disabled={disabled ? '' : undefined}
>
  {#snippet child({ props })}
    <button
      {...props}
      role="tab"
      aria-selected={isSelected ? 'true' : 'false'}
      data-state={isSelected ? 'active' : 'inactive'}
      tabindex={isSelected ? 0 : -1}
    >
      {#if leading}<span class="ggb-tabs__trigger-leading" aria-hidden="true">{@render leading()}</span>{/if}
      <span class="ggb-tabs__trigger-label">{name}</span>
      {#if trailing}<span class="ggb-tabs__trigger-trailing">{@render trailing()}</span>{/if}
    </button>
  {/snippet}
</Primitive.Trigger>
