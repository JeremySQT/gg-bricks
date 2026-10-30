<script lang="ts">
  // Checkbox playground: size, selection, condition and the description.
  import { Checkbox } from '@ggbrick/svelte';
  import type { CheckboxSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<CheckboxSize>('md');
  let selection = $state('on');
  let condition = $state('default');
  let description = $state('on');
  // Reset the bound state when the selection select changes.
  let checked = $state(true);
  let indeterminate = $state(false);
  const select = (v: string) => {
    selection = v;
    checked = v === 'on';
    indeterminate = v === 'indeterminate';
  };
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as CheckboxSize) }
    ],
    topEnd: [{ label: 'Selection', options: ['off', 'on', 'indeterminate'], value: selection, onchange: select }],
    bottomStart: [
      { label: 'Description', options: ['on', 'off'], value: description, onchange: (v) => (description = v) }
    ],
    bottomEnd: [
      {
        label: 'Condition',
        options: ['default', 'readonly', 'invalid', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ]
  }}
>
  <Checkbox
    label="Email me a receipt"
    description={description === 'on' ? 'Sent to the billing address.' : undefined}
    bind:checked
    bind:indeterminate
    {size}
    readonly={condition === 'readonly'}
    invalid={condition === 'invalid'}
    disabled={condition === 'disabled'}
  />
</PlaygroundFrame>
