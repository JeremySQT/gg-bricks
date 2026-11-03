<script lang="ts">
  // SSR fixture: a ButtonGroup with two Buttons (the second asks for lg on its own) and an IconButton.
  import ButtonGroup from '../../../packages/svelte/src/components/button-group/ButtonGroup.svelte';
  import Button from '../../../packages/svelte/src/components/button/Button.svelte';
  import IconButton from '../../../packages/svelte/src/components/icon-button/IconButton.svelte';

  let { ...group }: Record<string, unknown> = $props();
</script>

{#snippet glyph()}<svg viewBox="0 0 256 256"><path d="M0 0h256v256H0z" /></svg>{/snippet}

<ButtonGroup {...group}>
  <Button id="cancel" label="Cancel" intent="neutral" appearance="outline" />
  <Button id="save" label="Save" size="lg" />
  <IconButton id="more" label="More" icon={glyph} />
</ButtonGroup>
