<script lang="ts">
  // ButtonGroup playground: orientation, alignment and size of a dialog footer with an IconButton, in a frame that
  // shows the available inline size.
  import { Button, ButtonGroup, Icon, IconButton } from '@ggbrick/svelte';
  import type { ButtonGroupAlign, ButtonGroupOrientation, ButtonGroupSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let orientation = $state<ButtonGroupOrientation>('horizontal');
  let align = $state<ButtonGroupAlign>('start');
  let size = $state<ButtonGroupSize>('md');
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        value: orientation,
        onchange: (v) => (orientation = v as ButtonGroupOrientation)
      }
    ],
    topEnd: [
      {
        label: 'Align',
        options: ['start', 'center', 'end', 'stretch'],
        value: align,
        onchange: (v) => (align = v as ButtonGroupAlign)
      }
    ],
    bottomEnd: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ButtonGroupSize) }
    ]
  }}
>
  <div
    style="inline-size: min(32rem, 100%); padding: var(--ggb-space-content-sm); border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default)"
  >
    <ButtonGroup {orientation} {align} {size}>
      <Button label="Cancel" intent="neutral" appearance="ghost" />
      <Button label="Save draft" intent="neutral" appearance="outline" />
      <Button label="Publish" />
      <IconButton label="Download" icon={download} intent="neutral" appearance="ghost" />
    </ButtonGroup>
  </div>
</PlaygroundFrame>
