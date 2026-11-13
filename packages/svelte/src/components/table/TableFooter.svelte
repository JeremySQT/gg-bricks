<script lang="ts">
  import type { TableSectionProps } from './types.js';

  let { children, ref = $bindable(null), class: className, ...rest }: TableSectionProps = $props();
</script>

<tfoot {...rest} bind:this={ref} class={['ggb-table__footer', className]}>{@render children?.()}</tfoot>
