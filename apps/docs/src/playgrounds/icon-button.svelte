<script lang="ts">
  // IconButton playground: intent, appearance, size, state and glyph, beside a Button of the same size.
  import { IconButton, Icon } from '@ggbrick/svelte';
  import type { IconButtonAppearance, IconButtonIntent, IconButtonSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let intent = $state<IconButtonIntent>('neutral');
  let appearance = $state<IconButtonAppearance>('ghost');
  let size = $state<IconButtonSize>('md');
  let buttonState = $state('default');
  let glyph = $state('trash');
  const labels: Record<string, string> = {
    trash: 'Delete invoice',
    plus: 'Add item',
    'download-simple': 'Download report',
    'arrow-right': 'Next page'
  };
</script>

{#snippet icon()}<Icon><path d={phosphor[glyph]} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['neutral', 'accent', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as IconButtonIntent)
      }
    ],
    topEnd: [
      {
        label: 'Appearance',
        options: ['ghost', 'outline', 'solid'],
        value: appearance,
        onchange: (v) => (appearance = v as IconButtonAppearance)
      }
    ],
    bottomStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as IconButtonSize) },
      { label: 'Icon', options: Object.keys(labels), value: glyph, onchange: (v) => (glyph = v) }
    ],
    bottomEnd: [
      {
        label: 'State',
        options: ['default', 'loading', 'disabled'],
        value: buttonState,
        onchange: (v) => (buttonState = v)
      }
    ]
  }}
>
  <IconButton
    label={labels[glyph]}
    {icon}
    {intent}
    {appearance}
    {size}
    loading={buttonState === 'loading'}
    disabled={buttonState === 'disabled'}
  />
</PlaygroundFrame>
