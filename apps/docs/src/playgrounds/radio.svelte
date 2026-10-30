<script lang="ts">
  // Radio playground: radios of a group with descriptions; size and the disabled option.
  import { Radio, RadioGroup } from '@ggbrick/svelte';
  import type { RadioGroupSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<RadioGroupSize>('md');
  let description = $state('on');
  let third = $state('enabled');
  let value = $state('team');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as RadioGroupSize) }
    ],
    topEnd: [{ label: 'Description', options: ['on', 'off'], value: description, onchange: (v) => (description = v) }],
    bottomEnd: [{ label: 'Third option', options: ['enabled', 'disabled'], value: third, onchange: (v) => (third = v) }]
  }}
>
  <RadioGroup label="Plan" bind:value {size}>
    <Radio value="starter" label="Starter" description={description === 'on' ? 'Up to 3 projects.' : undefined} />
    <Radio value="team" label="Team" description={description === 'on' ? 'Unlimited projects.' : undefined} />
    <Radio
      value="enterprise"
      label="Enterprise"
      description={description === 'on' ? 'Contact sales to enable it.' : undefined}
      disabled={third === 'disabled'}
    />
  </RadioGroup>
</PlaygroundFrame>
