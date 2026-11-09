<script lang="ts">
  import type { MenuSeparatorProps } from './types.js';
  import './tokens.generated.css';
  import './menu.css';

  let { class: className, ...rest }: MenuSeparatorProps = $props();
</script>

<div {...rest} class={['ggb-menu__separator', className]} role="separator"></div>
