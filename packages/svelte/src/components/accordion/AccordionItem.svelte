<script lang="ts">
  import { getContext } from 'svelte';
  import type { AccordionContext, AccordionItemProps } from './types.js';
  import { childDefaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './accordion.css';

  const defaults = childDefaults.item;
  let {
    value,
    label,
    disabled = defaults.disabled,
    leading,
    children,
    id,
    class: className,
    ...rest
  }: AccordionItemProps = $props();

  const accordion = getContext<AccordionContext | undefined>('ggb:accordion');
  // Fail identically on the server and in the browser rather than render an unnamed or unplaced item.
  if (!accordion) throw new Error('AccordionItem must be placed in an Accordion.');
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('AccordionItem requires a non-empty label.');
    return label;
  });

  const uid = $props.id();
  const base = $derived(id ?? uid);
  const expanded = $derived(accordion.isExpanded(value));
</script>

<div
  {...rest}
  class={['ggb-accordion__item', className]}
  data-expanded={expanded ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  <svelte:element this={`h${accordion.headingLevel}`} class="ggb-accordion__item-heading">
    <button
      type="button"
      class="ggb-accordion__trigger"
      id={`${base}-trigger`}
      aria-expanded={expanded}
      aria-controls={`${base}-content`}
      {disabled}
      onclick={() => !disabled && accordion.toggle(value)}
    >
      {#if leading}<span class="ggb-accordion__item-leading" aria-hidden="true">{@render leading()}</span>{/if}
      <span class="ggb-accordion__item-label">{name}</span>
      <!-- Phosphor Icons 2.1.1 (MIT), caret-down, regular weight: decorative, rotated when expanded. -->
      <svg
        class="ggb-accordion__item-indicator"
        viewBox="0 0 256 256"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        ><path
          d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
        /></svg
      >
    </button>
  </svelte:element>
  <div
    class="ggb-accordion__item-content"
    id={`${base}-content`}
    role="region"
    aria-labelledby={`${base}-trigger`}
    data-expanded={expanded ? '' : undefined}
  >
    <div class="ggb-accordion__item-body">
      <div class="ggb-accordion__item-inner">{@render children()}</div>
    </div>
  </div>
</div>
