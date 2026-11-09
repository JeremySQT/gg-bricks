<script lang="ts">
  // SSR fixture: an Accordion with three items (the second disabled), or an item outside an Accordion.
  import Accordion from '../../../packages/svelte/src/components/accordion/Accordion.svelte';
  import AccordionItem from '../../../packages/svelte/src/components/accordion/AccordionItem.svelte';

  let { lone = false, itemLabel = 'Shipping', ...accordion }: Record<string, unknown> = $props();
</script>

{#if lone}
  <AccordionItem value="x" label="Alone"><p>x</p></AccordionItem>
{:else}
  <Accordion {...accordion}>
    <AccordionItem id="a" value="shipping" label={itemLabel as string}><p>Two days</p></AccordionItem>
    <AccordionItem id="b" value="gift" label="Gift" disabled><p>No</p></AccordionItem>
    <AccordionItem id="c" value="returns" label="Returns"><p>30 days</p></AccordionItem>
  </Accordion>
{/if}
