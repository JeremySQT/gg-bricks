<script lang="ts">
  // SSR fixture: a RadioGroup with three radios; `radios` overrides their props.
  import RadioGroup from '../../../packages/svelte/src/components/radio-group/RadioGroup.svelte';
  import Radio from '../../../packages/svelte/src/components/radio/Radio.svelte';

  let { radios = {}, ...group }: Record<string, unknown> = $props();
  const items = [
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
    { value: 'pickup', label: 'Pick up' }
  ];
</script>

<RadioGroup label="Delivery" {...group}>
  {#each items as item (item.value)}
    <Radio id={`r-${item.value}`} {...item} {...(radios as Record<string, Record<string, unknown>>)[item.value]} />
  {/each}
</RadioGroup>
