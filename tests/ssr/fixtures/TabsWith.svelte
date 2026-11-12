<script lang="ts">
  // SSR fixture: Tabs with three triggers (the first disabled) and their panels, or a trigger outside Tabs.
  import Tabs from '../../../packages/svelte/src/components/tabs/Tabs.svelte';
  import TabsTrigger from '../../../packages/svelte/src/components/tabs/TabsTrigger.svelte';
  import TabsPanel from '../../../packages/svelte/src/components/tabs/TabsPanel.svelte';

  let { lone = false, triggerLabel = 'Activity', ...tabs }: Record<string, unknown> = $props();
</script>

{#if lone}
  <TabsTrigger label="Alone" value="alone" />
{:else}
  <Tabs id="t" {...tabs}>
    {#snippet list()}
      <TabsTrigger label="Locked" value="locked" disabled />
      <TabsTrigger label={triggerLabel as string} value="activity" />
      <TabsTrigger label="Files" value="files" />
    {/snippet}
    <TabsPanel value="locked"><p>Locked</p></TabsPanel>
    <TabsPanel value="activity"><button type="button">More</button></TabsPanel>
    <TabsPanel value="files"><p>Files</p></TabsPanel>
  </Tabs>
{/if}
