<script lang="ts">
  // SSR fixture: a Field around one control, chosen by `control`.
  import Field from '../../../packages/svelte/src/components/field/Field.svelte';
  import InputText from '../../../packages/svelte/src/components/input-text/InputText.svelte';
  import Textarea from '../../../packages/svelte/src/components/textarea/Textarea.svelte';
  import Checkbox from '../../../packages/svelte/src/components/checkbox/Checkbox.svelte';
  import RadioGroup from '../../../packages/svelte/src/components/radio-group/RadioGroup.svelte';
  import Radio from '../../../packages/svelte/src/components/radio/Radio.svelte';

  let { control = 'input-text', controlProps = {}, ...field }: Record<string, unknown> = $props();
</script>

<Field label="Email" {...field}>
  {#if control === 'input-text'}
    <InputText {...controlProps} />
  {:else if control === 'textarea'}
    <Textarea {...controlProps} />
  {:else if control === 'checkbox'}
    <Checkbox label="I accept" {...controlProps} />
  {:else}
    <RadioGroup {...controlProps}>
      <Radio value="a" label="A" />
      <Radio value="b" label="B" />
    </RadioGroup>
  {/if}
</Field>
