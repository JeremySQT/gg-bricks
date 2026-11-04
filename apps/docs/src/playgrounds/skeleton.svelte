<script lang="ts">
  // Skeleton playground: shape, and for text the body size and the number of lines; block and circle take their box.
  import { Skeleton } from '@ggbrick/svelte';
  import type { SkeletonShape, SkeletonSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let shape = $state<SkeletonShape>('text');
  let size = $state<SkeletonSize>('md');
  let lines = $state('3');
  const boxes: Record<SkeletonShape, string> = {
    text: 'inline-size: min(22rem, 100%)',
    block: 'inline-size: min(22rem, 100%); block-size: 8rem',
    circle: 'inline-size: 4rem'
  };
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Shape',
        options: ['text', 'block', 'circle'],
        value: shape,
        onchange: (v) => (shape = v as SkeletonShape)
      }
    ],
    topEnd: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as SkeletonSize) }],
    bottomEnd: [{ label: 'Lines', options: ['1', '2', '3', '5'], value: lines, onchange: (v) => (lines = v) }]
  }}
>
  <div style={boxes[shape]}>
    <Skeleton {shape} {size} lines={Number(lines)} />
  </div>
</PlaygroundFrame>
