<script lang="ts">
  import type { MenuItemProps } from './types.js';
  import { childDefaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './menu.css';

  const defaults = childDefaults.item;
  let {
    label,
    value,
    intent = defaults.intent,
    href,
    disabled = defaults.disabled,
    leading,
    trailing,
    class: className,
    ...rest
  }: MenuItemProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed item.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('MenuItem requires a non-empty label.');
    return label;
  });
  const resolvedValue = $derived(value || name);
</script>

{#snippet content()}
  {#if leading}<span class="ggb-menu__item-leading" aria-hidden="true">{@render leading()}</span>{/if}
  <span class="ggb-menu__item-label">{name}</span>
  {#if trailing}<span class="ggb-menu__item-trailing" aria-hidden="true">{@render trailing()}</span>{/if}
{/snippet}

{#if href && !disabled}
  <a
    {...rest}
    class={['ggb-menu__item', className]}
    role="menuitem"
    tabindex="-1"
    {href}
    data-intent={intent}
    data-value={resolvedValue}
    data-label={name}>{@render content()}</a
  >
{:else}
  <div
    {...rest}
    class={['ggb-menu__item', className]}
    role="menuitem"
    tabindex="-1"
    aria-disabled={disabled ? 'true' : undefined}
    data-intent={intent}
    data-disabled={disabled ? '' : undefined}
    data-value={resolvedValue}
    data-label={name}
  >
    {@render content()}
  </div>
{/if}
