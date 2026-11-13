<script lang="ts">
  import type { TableCellProps } from './types.js';
  import { childDefaults } from './contract.generated.js';

  let {
    align = childDefaults.cell.align,
    rowHeader = childDefaults.cell.rowHeader,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: TableCellProps = $props();
</script>

{#if rowHeader}
  <th {...rest} bind:this={ref} scope="row" class={['ggb-table__cell', className]} data-align={align} data-row-header=""
    >{@render children?.()}</th
  >
{:else}
  <td {...rest} bind:this={ref} class={['ggb-table__cell', className]} data-align={align}>{@render children?.()}</td>
{/if}
