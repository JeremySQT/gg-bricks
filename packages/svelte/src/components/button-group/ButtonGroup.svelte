<script lang="ts">
  import { getContext, setContext, untrack } from 'svelte';
  import type { ButtonGroupContext, ButtonGroupProps } from './types.js';
  import type { ButtonGroupSize } from './contract.generated.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './button-group.css';

  let {
    size,
    orientation = defaults.orientation,
    align = defaults.align,
    reflow = defaults.reflow,
    label,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ButtonGroupProps = $props();

  // A host (Alert) may ask for a size for its actions; an explicit size on the group wins.
  const host = getContext<{ readonly size: ButtonGroupSize } | undefined>('ggb:button-group-host');
  const resolvedSize = $derived(size ?? host?.size ?? defaults.size);

  setContext<ButtonGroupContext>('ggb:button-group', {
    get size() {
      return resolvedSize;
    }
  });

  const name = $derived(typeof label === 'string' && label.trim() ? label : undefined);

  // reflow stack: a horizontal group that does not fit its inline size lays out as a vertical stretched stack. While
  // horizontal the items never wrap and never shrink below their content, so the group compares the extent of its
  // items (from the first item's start edge to the last item's end edge, whatever the alignment) with its own inline
  // size; once stacked it remembers that extent and returns to its line when the inline size holds it again.
  let stacked = $state(false);
  $effect(() => {
    const element = ref;
    if (!element || orientation !== 'horizontal' || reflow !== 'stack' || typeof ResizeObserver === 'undefined') {
      stacked = false;
      return;
    }
    let needed = 0;
    const extent = () => {
      const items = [...element.children] as HTMLElement[];
      if (!items.length) return 0;
      const boxes = items.map((item) => item.getBoundingClientRect());
      return Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left));
    };
    const check = () =>
      untrack(() => {
        const available = element.clientWidth;
        if (!stacked) {
          const width = extent();
          if (width > available + 0.5) {
            needed = width;
            stacked = true;
          }
        } else if (available >= needed) stacked = false;
      });
    const observer = new ResizeObserver(check);
    observer.observe(element);
    check();
    return () => observer.disconnect();
  });
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-button-group', className]}
  data-size={resolvedSize}
  data-orientation={orientation}
  data-align={align}
  data-reflow={reflow}
  data-stacked={stacked ? '' : undefined}
  role={name ? 'group' : undefined}
  aria-label={name}
>
  {@render children()}
</div>
