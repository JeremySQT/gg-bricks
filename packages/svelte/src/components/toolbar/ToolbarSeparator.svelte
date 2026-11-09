<script lang="ts">
  import { getContext } from 'svelte';
  import type { ToolbarSeparatorProps } from './types.js';
  import type { ToolbarOrientation } from './contract.generated.js';
  import './tokens.generated.css';
  import './toolbar.css';

  let { class: className, ...rest }: ToolbarSeparatorProps = $props();

  // A separator is perpendicular to its toolbar: vertical in a horizontal toolbar.
  const toolbar = getContext<{ readonly orientation: ToolbarOrientation } | undefined>('ggb:toolbar');
  const orientation = $derived(toolbar?.orientation === 'vertical' ? 'horizontal' : 'vertical');
</script>

<div {...rest} class={['ggb-toolbar__separator', className]} role="separator" aria-orientation={orientation}></div>
