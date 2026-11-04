<script lang="ts">
  // Spinner playground: size, a decorative or named spinner, and the content color it inherits.
  import { Spinner } from '@ggbrick/svelte';
  import type { SpinnerSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<SpinnerSize>('md');
  let label = $state('named');
  let color = $state('primary');
  const colors: Record<string, string> = {
    primary: 'var(--ggb-color-content-primary)',
    secondary: 'var(--ggb-color-content-secondary)'
  };
</script>

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Label', options: ['named', 'decorative'], value: label, onchange: (v) => (label = v) }],
    topEnd: [
      {
        label: 'Size',
        options: ['sm', 'md', 'lg', 'xl'],
        value: size,
        onchange: (v) => (size = v as SpinnerSize)
      }
    ],
    bottomEnd: [
      { label: 'Content color', options: ['primary', 'secondary'], value: color, onchange: (v) => (color = v) }
    ]
  }}
>
  <span style="display: inline-flex; align-items: center; gap: var(--ggb-space-content-sm); color: {colors[color]}">
    <Spinner {size} label={label === 'named' ? 'Loading comments' : ''} />
    <span aria-hidden="true">Loading comments…</span>
  </span>
</PlaygroundFrame>
