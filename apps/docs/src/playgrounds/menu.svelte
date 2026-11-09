<script lang="ts">
  // Menu playground: side and alignment of the panel against its trigger, with icons, a shortcut, a group, a
  // disabled item and a destructive item.
  import { Button, Icon, Menu, MenuGroup, MenuItem, MenuSeparator, Shortcut } from '@ggbrick/svelte';
  import type { MenuAlign, MenuSide } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let side = $state<MenuSide>('bottom');
  let align = $state<MenuAlign>('start');
  let selected = $state('none');
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Side', options: ['bottom', 'top'], value: side, onchange: (v) => (side = v as MenuSide) }],
    topEnd: [
      {
        label: 'Align',
        options: ['start', 'center', 'end'],
        value: align,
        onchange: (v) => (align = v as MenuAlign)
      }
    ]
  }}
>
  <Menu {side} {align} onselect={(value) => (selected = value)}>
    {#snippet trigger(props)}<Button label="Actions" intent="neutral" appearance="outline" {...props} />{/snippet}
    <MenuItem label="New section" value="new" leading={plus}>
      {#snippet trailing()}<Shortcut keys="Mod+Enter" size="sm" />{/snippet}
    </MenuItem>
    <MenuItem label="Duplicate" value="duplicate" />
    <MenuItem label="Archive" value="archive" disabled />
    <MenuGroup label="Export">
      <MenuItem label="Download as PDF" value="pdf" leading={download} />
      <MenuItem label="Download as CSV" value="csv" />
    </MenuGroup>
    <MenuSeparator />
    <MenuItem label="Delete" value="delete" intent="danger" leading={trash} />
  </Menu>
  <p>Selected: {selected}</p>
</PlaygroundFrame>
