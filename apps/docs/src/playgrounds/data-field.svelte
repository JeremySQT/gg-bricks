<script lang="ts">
  // DataField playground: orientation, size and the kind of value (text, Badge, Link, empty).
  import { Badge, DataField, Link } from '@ggbrick/svelte';
  import type { DataFieldOrientation, DataFieldSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let orientation = $state<DataFieldOrientation>('vertical');
  let size = $state<DataFieldSize>('md');
  let content = $state('text');
  const labels: Record<string, string> = { text: 'Email', badge: 'Status', link: 'Website', empty: 'Phone' };
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['vertical', 'horizontal'],
        value: orientation,
        onchange: (v) => (orientation = v as DataFieldOrientation)
      }
    ],
    topEnd: [
      {
        label: 'Content',
        options: ['text', 'badge', 'link', 'empty'],
        value: content,
        onchange: (v) => (content = v)
      }
    ],
    bottomStart: [{ label: 'Size', options: ['sm', 'md'], value: size, onchange: (v) => (size = v as DataFieldSize) }]
  }}
>
  <div style="inline-size: min(24rem, 100%)">
    {#if content === 'badge'}
      <DataField label={labels.badge} {orientation} {size}><Badge intent="success" label="Paid" /></DataField>
    {:else if content === 'link'}
      <DataField label={labels.link} {orientation} {size}><Link href="#acme" label="acme.example.com" /></DataField>
    {:else if content === 'empty'}
      <DataField label={labels.empty} {orientation} {size} />
    {:else}
      <DataField label={labels.text} value="olivia@example.com" {orientation} {size} />
    {/if}
  </div>
</PlaygroundFrame>
