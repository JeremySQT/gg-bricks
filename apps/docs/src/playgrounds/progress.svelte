<script lang="ts">
  // Progress playground: intent, size, the value (or the indeterminate state) and the percentage.
  import { Progress } from '@ggbrick/svelte';
  import type { ProgressIntent, ProgressSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let intent = $state<ProgressIntent>('accent');
  let size = $state<ProgressSize>('md');
  let value = $state('40');
  let percentage = $state('shown');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['accent', 'success', 'warning', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as ProgressIntent)
      }
    ],
    topEnd: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ProgressSize) }],
    bottomStart: [
      {
        label: 'Value',
        options: ['0', '20', '40', '60', '80', '100', 'indeterminate'],
        value,
        onchange: (v) => (value = v)
      }
    ],
    bottomEnd: [
      {
        label: 'Percentage',
        options: ['shown', 'hidden'],
        value: percentage,
        onchange: (v) => (percentage = v)
      }
    ]
  }}
>
  <div style="inline-size: min(28rem, 100%)">
    <Progress
      label="Uploading quarterly-report.pdf"
      value={value === 'indeterminate' ? 0 : Number(value)}
      indeterminate={value === 'indeterminate'}
      showValue={percentage === 'shown'}
      {intent}
      {size}
    />
  </div>
</PlaygroundFrame>
