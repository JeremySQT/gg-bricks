<script lang="ts">
  // Tabs playground: appearance, size and orientation of a project's views, with leading icons, a Counter, a Badge
  // and a disabled tab.
  import { Badge, Counter, Icon, Tabs, TabsPanel, TabsTrigger } from '@ggbrick/svelte';
  import type { TabsAppearance, TabsOrientation, TabsSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let appearance = $state<TabsAppearance>('contained');
  let size = $state<TabsSize>('md');
  let orientation = $state<TabsOrientation>('horizontal');
  let value = $state('overview');
</script>

{#snippet checks()}<Icon><path d={phosphor.check} /></Icon>{/snippet}
{#snippet issues()}<Icon><path d={phosphor['warning-circle']} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Appearance',
        options: ['contained', 'line'],
        value: appearance,
        onchange: (v) => (appearance = v as TabsAppearance)
      }
    ],
    topEnd: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as TabsSize) }],
    bottomStart: [
      {
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        value: orientation,
        onchange: (v) => (orientation = v as TabsOrientation)
      }
    ]
  }}
>
  <div style="inline-size: min(40rem, 100%)">
    <Tabs label="Project" bind:value {appearance} {size} {orientation}>
      {#snippet list()}
        <TabsTrigger label="Overview" value="overview" />
        <TabsTrigger label="Checks" value="checks" leading={checks} />
        <TabsTrigger label="Issues" value="issues" leading={issues}>
          {#snippet trailing()}<Counter value={3} label="open" {size} />{/snippet}
        </TabsTrigger>
        <TabsTrigger label="Billing" value="billing" disabled />
        <TabsTrigger label="Settings" value="settings">
          {#snippet trailing()}<Badge label="New" intent="accent" {size} />{/snippet}
        </TabsTrigger>
      {/snippet}
      <TabsPanel value="overview"><p>Owner, status and the latest milestone of the project.</p></TabsPanel>
      <TabsPanel value="checks"><p>All 24 checks passed on the latest build.</p></TabsPanel>
      <TabsPanel value="issues"><p>Three open issues, one of them blocking the release.</p></TabsPanel>
      <TabsPanel value="billing"><p>Billing is not available for this project.</p></TabsPanel>
      <TabsPanel value="settings"><p>Name, members and notifications.</p></TabsPanel>
    </Tabs>
  </div>
</PlaygroundFrame>
