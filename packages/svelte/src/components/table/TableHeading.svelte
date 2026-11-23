<script lang="ts">
  import type { TableHeadingProps } from './types.js';
  import { childDefaults } from './contract.generated.js';

  let {
    align = childDefaults.heading.align,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: TableHeadingProps = $props();
</script>

<th {...rest} bind:this={ref} scope="col" class={['ggb-table__heading', className]} data-align={align}
  >{@render children?.()}</th
>
