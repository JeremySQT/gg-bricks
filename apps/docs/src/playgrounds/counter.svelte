<script lang="ts">
  // Counter playground: size, value and maximum, after a label of the same size.
  import { Counter } from '@ggbrick/svelte';
  import type { CounterSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<CounterSize>('md');
  let value = $state('8');
  let max = $state('99');
</script>

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as CounterSize) }],
    topEnd: [{ label: 'Value', options: ['0', '8', '42', '99', '100', '1234'], value, onchange: (v) => (value = v) }],
    bottomStart: [{ label: 'Maximum', options: ['99', '999', '9999'], value: max, onchange: (v) => (max = v) }]
  }}
>
  <span style="font: var(--ggb-typography-label-{size})">
    Inbox <Counter {size} value={Number(value)} max={Number(max)} label="unread messages" />
  </span>
</PlaygroundFrame>
