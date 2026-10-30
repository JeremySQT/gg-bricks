<script lang="ts">
  // RadioGroup playground: orientation, size and condition, in a Field.
  import { Field, Radio, RadioGroup } from '@ggbrick/svelte';
  import type { RadioGroupOrientation, RadioGroupSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let orientation = $state<RadioGroupOrientation>('vertical');
  let size = $state<RadioGroupSize>('md');
  let condition = $state('default');
  let value = $state('express');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['vertical', 'horizontal'],
        value: orientation,
        onchange: (v) => (orientation = v as RadioGroupOrientation)
      }
    ],
    topEnd: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as RadioGroupSize) }
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
  <Field
    label="Delivery speed"
    invalid={condition === 'invalid'}
    disabled={condition === 'disabled'}
    message="Choose a delivery speed."
  >
    <RadioGroup bind:value {orientation} {size} readonly={condition === 'readonly'}>
      <Radio value="standard" label="Standard" />
      <Radio value="express" label="Express" />
      <Radio value="pickup" label="Pick up in store" />
    </RadioGroup>
  </Field>
</PlaygroundFrame>
