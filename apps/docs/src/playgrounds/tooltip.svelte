<script lang="ts">
  // Tooltip playground: side, alignment and trigger; "shown" keeps the tooltip open to compare placements.
  import { Button, Icon, IconButton, Link, Tooltip } from '@ggbrick/svelte';
  import type { TooltipAlign, TooltipSide } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let side = $state<TooltipSide>('top');
  let align = $state<TooltipAlign>('center');
  let trigger = $state('icon button');
  let display = $state('on hover or focus');
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Side', options: ['top', 'bottom'], value: side, onchange: (v) => (side = v as TooltipSide) }],
    topEnd: [
      {
        label: 'Align',
        options: ['start', 'center', 'end'],
        value: align,
        onchange: (v) => (align = v as TooltipAlign)
      }
    ],
    bottomStart: [
      {
        label: 'Trigger',
        options: ['icon button', 'button', 'link'],
        value: trigger,
        onchange: (v) => (trigger = v)
      }
    ],
    bottomEnd: [
      {
        label: 'Display',
        options: ['on hover or focus', 'shown'],
        value: display,
        onchange: (v) => (display = v)
      }
    ]
  }}
>
  {#if trigger === 'icon button'}
    <Tooltip label="New item (Ctrl+N)" {side} {align} open={display === 'shown'}>
      <IconButton label="New item" icon={plus} appearance="outline" />
    </Tooltip>
  {:else if trigger === 'button'}
    <Tooltip label="Saves a copy in your drafts folder" {side} {align} open={display === 'shown'}>
      <Button label="Save draft" intent="neutral" appearance="outline" />
    </Tooltip>
  {:else}
    <Tooltip label="Opens the API reference" {side} {align} open={display === 'shown'}>
      <Link href="#api" label="API reference" />
    </Tooltip>
  {/if}
</PlaygroundFrame>
