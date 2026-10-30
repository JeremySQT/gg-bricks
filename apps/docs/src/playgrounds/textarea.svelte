<script lang="ts">
  // Textarea playground: size, resize mode, rows and condition.
  import { Textarea } from '@ggbrick/svelte';
  import type { TextareaResize, TextareaSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<TextareaSize>('md');
  let resize = $state<TextareaResize>('vertical');
  let rows = $state('3');
  let condition = $state('default');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as TextareaSize) }
    ],
    topEnd: [
      {
        label: 'Resize',
        options: ['vertical', 'auto', 'none'],
        value: resize,
        onchange: (v) => (resize = v as TextareaResize)
      }
    ],
    bottomStart: [{ label: 'Rows', options: ['1', '2', '3', '5'], value: rows, onchange: (v) => (rows = v) }],
    bottomEnd: [
      {
        label: 'Condition',
        options: ['default', 'readonly', 'invalid', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ]
  }}
>
  <div style="inline-size: min(22rem, 100%)">
    <Textarea
      label="Delivery note"
      placeholder="Door code, floor, or where to leave the parcel"
      {size}
      {resize}
      rows={Number(rows)}
      readonly={condition === 'readonly'}
      invalid={condition === 'invalid'}
      disabled={condition === 'disabled'}
    />
  </div>
</PlaygroundFrame>
