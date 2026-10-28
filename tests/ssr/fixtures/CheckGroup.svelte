<script lang="ts">
  // SSR fixture: a CheckboxGroup with three checkboxes; `boxes` overrides their props.
  import CheckboxGroup from '../../../packages/svelte/src/components/checkbox-group/CheckboxGroup.svelte';
  import Checkbox from '../../../packages/svelte/src/components/checkbox/Checkbox.svelte';

  let { boxes = {}, ...group }: Record<string, unknown> = $props();
  const items = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push' }
  ];
</script>

<CheckboxGroup label="Channels" {...group}>
  {#each items as item (item.value)}
    <Checkbox id={`c-${item.value}`} {...item} {...(boxes as Record<string, Record<string, unknown>>)[item.value]} />
  {/each}
</CheckboxGroup>
