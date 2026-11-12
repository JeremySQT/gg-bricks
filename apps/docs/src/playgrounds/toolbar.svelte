<script lang="ts">
  // Toolbar playground: size and orientation of a selection toolbar (icon buttons named by tooltips, a separator, a
  // Button and a Menu), in a frame that shows the available inline size; the narrow width shows the overflow menu.
  import { Button, Icon, IconButton, Menu, MenuItem, Toolbar, ToolbarSeparator, Tooltip } from '@ggbrick/svelte';
  import type { ToolbarOrientation, ToolbarSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { glyphs } from '../../../../examples/icon-button/glyphs.ts';

  let size = $state<ToolbarSize>('md');
  let orientation = $state<ToolbarOrientation>('horizontal');
  let width = $state('wide');
  let last = $state('none');

  const run = (action: string) => () => {
    last = action;
  };
</script>

{#snippet copy()}<Icon><path d={glyphs.copy} /></Icon>{/snippet}
{#snippet rename()}<Icon><path d={glyphs['pencil-simple']} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={glyphs.trash} /></Icon>{/snippet}
{#snippet download()}<Icon><path d={glyphs['download-simple']} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        value: orientation,
        onchange: (v) => (orientation = v as ToolbarOrientation)
      }
    ],
    topEnd: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ToolbarSize) }],
    bottomStart: [{ label: 'Width', options: ['wide', 'narrow'], value: width, onchange: (v) => (width = v) }]
  }}
>
  <div
    style="inline-size: {width === 'wide'
      ? 'min(36rem, 100%)'
      : 'min(16rem, 100%)'}; padding: var(--ggb-space-content-sm); border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default)"
  >
    <Toolbar label="Selection actions" {size} {orientation}>
      <Tooltip label="Copy">
        <IconButton label="Copy" icon={copy} onactivate={run('copy')} />
      </Tooltip>
      <Tooltip label="Rename">
        <IconButton label="Rename" icon={rename} onactivate={run('rename')} />
      </Tooltip>
      <Tooltip label="Delete">
        <IconButton label="Delete" icon={trash} intent="danger" onactivate={run('delete')} />
      </Tooltip>
      <ToolbarSeparator />
      <Button label="Download" intent="neutral" appearance="ghost" leading={download} onactivate={run('download')} />
      <Menu onselect={(value) => (last = value)}>
        {#snippet trigger(props)}<Button label="Sort" intent="neutral" appearance="ghost" {...props} />{/snippet}
        <MenuItem label="By name" value="sort by name" />
        <MenuItem label="By date" value="sort by date" />
      </Menu>
    </Toolbar>
  </div>
  <p>Last action: {last}</p>
</PlaygroundFrame>
