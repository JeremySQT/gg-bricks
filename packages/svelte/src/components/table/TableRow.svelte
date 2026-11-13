<script lang="ts">
  import type { TableRowProps } from './types.js';

  let { children, ref = $bindable(null), class: className, ...rest }: TableRowProps = $props();
</script>

<tr {...rest} bind:this={ref} class={['ggb-table__row', className]}>{@render children?.()}</tr>
