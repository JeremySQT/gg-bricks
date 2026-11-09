<script lang="ts">
  // Popover playground: side, alignment and trigger, around a filters panel that Apply closes.
  import { Button, ButtonGroup, Checkbox, Icon, IconButton, Popover } from '@ggbrick/svelte';
  import type { PopoverAlign, PopoverSide } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let side = $state<PopoverSide>('bottom');
  let align = $state<PopoverAlign>('start');
  let triggerKind = $state('button');
  let open = $state(false);
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Side', options: ['bottom', 'top'], value: side, onchange: (v) => (side = v as PopoverSide) }],
    topEnd: [
      {
        label: 'Align',
        options: ['start', 'center', 'end'],
        value: align,
        onchange: (v) => (align = v as PopoverAlign)
      }
    ],
    bottomStart: [
      { label: 'Trigger', options: ['button', 'icon button'], value: triggerKind, onchange: (v) => (triggerKind = v) }
    ]
  }}
>
  <Popover label="Filters" {side} {align} bind:open>
    {#snippet trigger(props)}
      {#if triggerKind === 'button'}
        <Button label="Filters" intent="neutral" appearance="outline" {...props} />
      {:else}
        <IconButton label="Add filters" icon={plus} appearance="outline" {...props} />
      {/if}
    {/snippet}
    <div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)">
      <p style="margin: 0; font: var(--ggb-typography-label-md)">Filters</p>
      <Checkbox label="Open issues" checked />
      <Checkbox label="Assigned to me" />
      <ButtonGroup align="end" size="sm">
        <Button label="Apply" onactivate={() => (open = false)} />
      </ButtonGroup>
    </div>
  </Popover>
</PlaygroundFrame>
