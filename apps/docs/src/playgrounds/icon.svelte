<script lang="ts">
  // Icon playground: size and glyph, next to a label.
  import { Icon } from '@ggbrick/svelte';
  import type { IconSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { names, phosphor } from '../../../../examples/icon/glyphs.ts';

  let size = $state<IconSize>('md');
  let glyph = $state('check');
  let context = $state('next to text');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'], value: size, onchange: (v) => (size = v as IconSize) }
    ],
    topEnd: [{ label: 'Glyph', options: names, value: glyph, onchange: (v) => (glyph = v) }],
    bottomStart: [
      { label: 'Context', options: ['next to text', 'alone'], value: context, onchange: (v) => (context = v) }
    ]
  }}
>
  {#if context === 'alone'}
    <Icon {size} label={glyph}><path d={phosphor[glyph]} /></Icon>
  {:else}
    <span class="row"><Icon {size}><path d={phosphor[glyph]} /></Icon> Changes saved</span>
  {/if}
</PlaygroundFrame>

<style>
  .row {
    display: inline-flex;
    align-items: center;
    gap: var(--ggb-space-content-xs);
  }
</style>
