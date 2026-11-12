<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  // The content of the panel is not sized by a ButtonGroup or Toolbar around the popover; its trigger is (the reset
  // lives in this inner component so that it covers the content only).
  let { children }: { children: Snippet } = $props();
  setContext('ggb:button-group', undefined);
</script>

<!-- The content scrolls inside the panel's padding, so that the scrollbar never meets the round corners. -->
<div class="ggb-popover__content">{@render children()}</div>
