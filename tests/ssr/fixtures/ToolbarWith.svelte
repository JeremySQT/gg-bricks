<script lang="ts">
  // SSR fixture: a Toolbar with an IconButton, a separator, a Button asking for sm and a Menu trigger.
  import Toolbar from '../../../packages/svelte/src/components/toolbar/Toolbar.svelte';
  import ToolbarSeparator from '../../../packages/svelte/src/components/toolbar/ToolbarSeparator.svelte';
  import Button from '../../../packages/svelte/src/components/button/Button.svelte';
  import IconButton from '../../../packages/svelte/src/components/icon-button/IconButton.svelte';
  import Menu from '../../../packages/svelte/src/components/menu/Menu.svelte';
  import MenuItem from '../../../packages/svelte/src/components/menu/MenuItem.svelte';

  let { ...toolbar }: Record<string, unknown> = $props();
</script>

{#snippet glyph()}<svg viewBox="0 0 256 256"><path d="M0 0h256v256H0z" /></svg>{/snippet}

<Toolbar label="Actions" {...toolbar}>
  <IconButton id="copy" label="Copy" icon={glyph} />
  <ToolbarSeparator />
  <Button id="share" label="Share" size="sm" />
  <Menu id="more">
    {#snippet trigger(props)}<IconButton {...props} label="More" icon={glyph} />{/snippet}
    <MenuItem label="Archive" />
  </Menu>
</Toolbar>
