<script lang="ts">
  // SSR fixture: an Alert with optional content and an actions ButtonGroup.
  import Alert from '../../../packages/svelte/src/components/alert/Alert.svelte';
  import ButtonGroup from '../../../packages/svelte/src/components/button-group/ButtonGroup.svelte';
  import Button from '../../../packages/svelte/src/components/button/Button.svelte';

  let { content = true, actions = false, ...alert }: Record<string, unknown> = $props();
</script>

{#snippet act()}<ButtonGroup><Button id="retry" label="Try again" /></ButtonGroup>{/snippet}

{#if content}
  <Alert {...alert} actions={actions ? act : undefined}>The connection was lost.</Alert>
{:else}
  <Alert {...alert} actions={actions ? act : undefined} />
{/if}
