<script lang="ts">
  // Switch playground: size, label position, condition and the description.
  import { Switch } from '@ggbrick/svelte';
  import type { SwitchLabelPosition, SwitchSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<SwitchSize>('md');
  let labelPosition = $state<SwitchLabelPosition>('end');
  let condition = $state('default');
  let description = $state('on');
  let checked = $state(true);
</script>

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as SwitchSize) }],
    topEnd: [
      {
        label: 'Label position',
        options: ['end', 'start'],
        value: labelPosition,
        onchange: (v) => (labelPosition = v as SwitchLabelPosition)
      }
    ],
    bottomStart: [
      { label: 'Description', options: ['on', 'off'], value: description, onchange: (v) => (description = v) }
    ],
    bottomEnd: [
      {
        label: 'Condition',
        options: ['default', 'readonly', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ]
  }}
>
  <div style="inline-size: min(20rem, 100%)">
    <Switch
      label="Notifications"
      description={description === 'on' ? 'Push notifications on this device.' : undefined}
      bind:checked
      {size}
      {labelPosition}
      readonly={condition === 'readonly'}
      disabled={condition === 'disabled'}
    />
  </div>
</PlaygroundFrame>
