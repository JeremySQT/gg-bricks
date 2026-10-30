<script lang="ts">
  // CheckboxGroup playground: orientation, size and condition, in a Field that states the requirement.
  import { Checkbox, CheckboxGroup, Field } from '@ggbrick/svelte';
  import type { CheckboxGroupOrientation, CheckboxGroupSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let orientation = $state<CheckboxGroupOrientation>('vertical');
  let size = $state<CheckboxGroupSize>('md');
  let condition = $state('default');
  let value = $state<string[]>(['email']);
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['vertical', 'horizontal'],
        value: orientation,
        onchange: (v) => (orientation = v as CheckboxGroupOrientation)
      }
    ],
    topEnd: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as CheckboxGroupSize) }
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
    label="How can we reach you?"
    description="Select at least one channel."
    required
    invalid={condition === 'invalid'}
    disabled={condition === 'disabled'}
    message="Select at least one channel."
  >
    <CheckboxGroup bind:value {orientation} {size} readonly={condition === 'readonly'}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="Text message" />
      <Checkbox value="push" label="Push notification" />
    </CheckboxGroup>
  </Field>
</PlaygroundFrame>
