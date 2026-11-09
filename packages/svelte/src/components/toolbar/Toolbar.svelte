<script lang="ts">
  import { setContext } from 'svelte';
  import { rovingFocus } from '../../lib/roving-focus/index.js';
  import type { ToolbarProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './toolbar.css';

  let {
    label,
    size = defaults.size,
    orientation = defaults.orientation,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ToolbarProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed toolbar.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Toolbar requires a non-empty label.');
    return label;
  });

  // Every Button and IconButton of the toolbar takes its size, including the triggers of its Menus and Popovers and
  // the controls inside its Tooltips (the context key ButtonGroup uses; Popover content resets it).
  setContext('ggb:button-group', {
    get size() {
      return size;
    }
  });

  setContext('ggb:toolbar', {
    get orientation() {
      return orientation;
    }
  });

  // Items: the toolbar's buttons and links, wherever a Tooltip, Menu or Popover wrapper puts them; the content of an
  // open menu or popover is left out by the roving-focus module.
  const items = 'button, a[href], [role="button"]';
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-toolbar', className]}
  role="toolbar"
  aria-label={name}
  aria-orientation={orientation}
  data-size={size}
  data-orientation={orientation}
  {@attach rovingFocus({ orientation: () => orientation, items })}
>
  {@render children()}
</div>
