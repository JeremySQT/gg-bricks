<script lang="ts">
  import type { TableSectionProps } from './types.js';

  let { children, ref = $bindable(null), class: className, ...rest }: TableSectionProps = $props();
</script>

<thead {...rest} bind:this={ref} class={['ggb-table__header', className]}>{@render children?.()}</thead>
