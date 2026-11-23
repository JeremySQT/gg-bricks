<script lang="ts">
  import type { TableSectionProps } from './types.js';

  let { children, ref = $bindable(null), class: className, ...rest }: TableSectionProps = $props();
</script>

<tbody {...rest} bind:this={ref} class={['ggb-table__body', className]}>{@render children?.()}</tbody>
