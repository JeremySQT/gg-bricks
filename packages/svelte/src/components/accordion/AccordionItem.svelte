<script lang="ts">
  import { getContext } from 'svelte';
  import { Accordion as Primitive } from 'bits-ui';
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
  type Level = 1 | 2 | 3 | 4 | 5 | 6;
</script>

<Primitive.Item {...rest} {value} {disabled} class={['ggb-accordion__item', className]}>
  <Primitive.Header level={accordion.headingLevel as Level} class="ggb-accordion__item-heading">
    <!-- aria-controls completes Bits UI, which does not set it (contract: the trigger names the content it controls). -->
    <Primitive.Trigger class="ggb-accordion__trigger" id={`${base}-trigger`} aria-controls={`${base}-content`}>
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
    </Primitive.Trigger>
  </Primitive.Header>
  <!-- Always mounted (the block size animates in CSS); the region and its name complete Bits UI (contract). -->
  <Primitive.Content
    forceMount
    class="ggb-accordion__item-content"
    id={`${base}-content`}
    role="region"
    aria-labelledby={`${base}-trigger`}
  >
    <div class="ggb-accordion__item-body">
      <div class="ggb-accordion__item-inner">{@render children()}</div>
    </div>
  </Primitive.Content>
</Primitive.Item>
