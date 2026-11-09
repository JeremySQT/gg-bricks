<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  // The content of the panel is not sized by a ButtonGroup or Toolbar around the popover; its trigger is (the reset
  // lives in this inner component so that it covers the content only).
  let { children }: { children: Snippet } = $props();
  setContext('ggb:button-group', undefined);
</script>

{@render children()}
