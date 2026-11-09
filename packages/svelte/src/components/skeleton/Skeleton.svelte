<script lang="ts">
  import type { SkeletonProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './skeleton.css';

  let {
    shape = defaults.shape,
    lines = defaults.lines,
    size = defaults.size,
    ref = $bindable(null),
    class: className,
    ...rest
  }: SkeletonProps = $props();

  const count = $derived(shape === 'text' ? Math.max(1, Math.floor(Number.isFinite(lines) ? lines : 1)) : 0);

  // Every skeleton of the page pulses in phase: each pulse animation starts at the origin of the document timeline,
  // whenever its element was inserted.
  $effect(() => {
    const element = ref;
    void [shape, count];
    if (!element || typeof element.getAnimations !== 'function') return;
    for (const animation of element.getAnimations({ subtree: true })) animation.startTime = 0;
  });
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-skeleton', className]}
  data-shape={shape}
  data-size={size}
  aria-hidden="true"
>
  {#each { length: count }, i (i)}
    <span class="ggb-skeleton__line"></span>
  {/each}
</div>
