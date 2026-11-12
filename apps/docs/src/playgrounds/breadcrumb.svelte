<script lang="ts">
  // Breadcrumb playground: size, separator, a home icon with or without its label, and the collapse behind “…”
  // (maxItems), on a back-office path of five levels.
  import { Breadcrumb, Icon } from '@ggbrick/svelte';
  import type { BreadcrumbItem, BreadcrumbSeparator, BreadcrumbSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  // Phosphor Icons 2.1.1 (MIT), house, regular weight.
  const house =
    'M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z';

  let size = $state<BreadcrumbSize>('sm');
  let separator = $state<BreadcrumbSeparator>('chevron');
  let homeIcon = $state('shown');
  // hideLabel only takes effect next to an icon: without the home icon the label shows whatever this says.
  let homeLabel = $state('shown');
  let maxItems = $state('0');
  const items: BreadcrumbItem[] = $derived([
    { label: 'Home', href: '#home', hideLabel: homeLabel === 'hidden' },
    { label: 'Projects', href: '#projects' },
    { label: 'Acme website', href: '#acme' },
    { label: 'Settings', href: '#settings' },
    { label: 'Members' }
  ]);
</script>

{#snippet home(_item: BreadcrumbItem, index: number)}{#if index === 0}<Icon><path d={house} /></Icon>{/if}{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md'], value: size, onchange: (v) => (size = v as BreadcrumbSize) },
      {
        label: 'Separator',
        options: ['chevron', 'slash'],
        value: separator,
        onchange: (v) => (separator = v as BreadcrumbSeparator)
      }
    ],
    topEnd: [
      { label: 'Home icon', options: ['shown', 'none'], value: homeIcon, onchange: (v) => (homeIcon = v) },
      { label: 'Home label', options: ['shown', 'hidden'], value: homeLabel, onchange: (v) => (homeLabel = v) }
    ],
    bottomStart: [{ label: 'Max items', options: ['0', '3', '4'], value: maxItems, onchange: (v) => (maxItems = v) }]
  }}
>
  <Breadcrumb
    {items}
    {size}
    {separator}
    maxItems={Number(maxItems)}
    leading={homeIcon === 'shown' ? home : undefined}
  />
</PlaygroundFrame>
