<script lang="ts">
  // Divider playground: orientation and the optional label (ignored when vertical), between two groups of content laid
  // out in a column (horizontal) or in a row of fixed height (vertical).
  import { Divider } from '@ggbrick/svelte';
  import type { DividerOrientation } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let orientation = $state<DividerOrientation>('horizontal');
  let label = $state('none');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        value: orientation,
        onchange: (v) => (orientation = v as DividerOrientation)
      }
    ],
    topEnd: [{ label: 'Label', options: ['none', 'Or', 'Today'], value: label, onchange: (v) => (label = v) }]
  }}
>
  {#if orientation === 'horizontal'}
    <div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); inline-size: min(28rem, 100%)">
      <p style="margin: 0">First group of content</p>
      <Divider label={label === 'none' ? undefined : label} />
      <p style="margin: 0">Second group of content</p>
    </div>
  {:else}
    <div style="display: flex; align-items: center; gap: var(--ggb-space-content-md); block-size: 4rem">
      <span>First</span>
      <Divider orientation="vertical" label={label === 'none' ? undefined : label} />
      <span>Second</span>
    </div>
  {/if}
</PlaygroundFrame>
