<script lang="ts">
  // Home page showcase: the wave 1 components in the reader's brand, appearance and density.
  import { Button, Counter, Icon, Shortcut } from '@ggbrick/svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let saving = $state(false);
  function save() {
    saving = true;
    setTimeout(() => (saving = false), 1200);
  }
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet unread()}<Counter value={8} size="md" />{/snippet}
{#snippet saveKeys()}<Shortcut keys="Mod+S" size="md" />{/snippet}

<div class="showcase">
  <Button label="New project" leading={plus} />
  <Button label="Inbox" intent="neutral" appearance="outline" trailing={unread} />
  <Button label="Save" appearance="ghost" trailing={saveKeys} loading={saving} onactivate={save} />
  <Button label="Delete" intent="danger" appearance="ghost" />
</div>

<style>
  .showcase {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ggb-space-content-md);
    padding: var(--ggb-space-layout-lg);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
  }
</style>
