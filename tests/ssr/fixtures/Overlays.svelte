<script lang="ts">
  // SSR fixture: one overlay chosen by `kind` (tooltip, popover, dialog, menu) with a trigger and content.
  import Tooltip from '../../../packages/svelte/src/components/tooltip/Tooltip.svelte';
  import Popover from '../../../packages/svelte/src/components/popover/Popover.svelte';
  import Dialog from '../../../packages/svelte/src/components/dialog/Dialog.svelte';
  import Menu from '../../../packages/svelte/src/components/menu/Menu.svelte';
  import MenuItem from '../../../packages/svelte/src/components/menu/MenuItem.svelte';
  import MenuGroup from '../../../packages/svelte/src/components/menu/MenuGroup.svelte';
  import MenuSeparator from '../../../packages/svelte/src/components/menu/MenuSeparator.svelte';
  import Button from '../../../packages/svelte/src/components/button/Button.svelte';
  import ButtonGroup from '../../../packages/svelte/src/components/button-group/ButtonGroup.svelte';

  let { kind, ...props }: { kind: string } & Record<string, unknown> = $props();
</script>

{#if kind === 'tooltip'}
  <Tooltip label="Copy the link" {...props}><Button id="copy" label="Copy" /></Tooltip>
{:else if kind === 'popover'}
  <Popover id="filters" label="Filters" {...props}>
    {#snippet trigger(p)}<Button label="Filters" {...p} />{/snippet}
    <p>Content</p>
  </Popover>
{:else if kind === 'dialog'}
  <ButtonGroup size="lg">
    <Dialog id="d" title="Delete this project?" {...props}>
      <p>Body</p>
      {#snippet footer()}<ButtonGroup><Button id="ok" label="Delete" /></ButtonGroup>{/snippet}
    </Dialog>
  </ButtonGroup>
{:else if kind === 'menu'}
  <Menu id="m" {...props}>
    {#snippet trigger(p)}<Button label="Actions" {...p} />{/snippet}
    <MenuItem id="edit" label="Edit" />
    <MenuItem id="open" label="Open" value="open-tab" href="/report" />
    <MenuItem id="archive" label="Archive" disabled href="/archive" />
    <MenuSeparator />
    <MenuGroup label="Danger zone"><MenuItem id="delete" label="Delete" intent="danger" /></MenuGroup>
  </Menu>
{/if}
