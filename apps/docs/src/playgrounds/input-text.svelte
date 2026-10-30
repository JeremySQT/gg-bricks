<script lang="ts">
  // InputText playground: size, type, condition and the leading icon or trailing action.
  import { Icon, IconButton, InputText } from '@ggbrick/svelte';
  import type { InputTextActionProps, InputTextSize, InputTextType } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { glyphs } from '../../../../examples/input-text/glyphs.ts';

  let size = $state<InputTextSize>('md');
  let type = $state<InputTextType>('search');
  let condition = $state('default');
  let slots = $state('leading icon');
  let value = $state('Invoices');
</script>

{#snippet glyph(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}
{#snippet leading()}{@render glyph('magnifying-glass')}{/snippet}
{#snippet clearIcon()}{@render glyph('x')}{/snippet}
{#snippet clear(action: InputTextActionProps)}
  <IconButton {...action} label="Clear" icon={clearIcon} onactivate={() => (value = '')} />
{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as InputTextSize) }
    ],
    topEnd: [
      {
        label: 'Type',
        options: ['text', 'email', 'password', 'search', 'tel', 'url'],
        value: type,
        onchange: (v) => (type = v as InputTextType)
      }
    ],
    bottomStart: [
      {
        label: 'Slots',
        options: ['none', 'leading icon', 'clear action', 'both'],
        value: slots,
        onchange: (v) => (slots = v)
      }
    ],
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
  <div style="inline-size: min(20rem, 100%)">
    <InputText
      label="Search invoices"
      placeholder="Search"
      bind:value
      {size}
      {type}
      readonly={condition === 'readonly'}
      invalid={condition === 'invalid'}
      disabled={condition === 'disabled'}
      leading={slots === 'leading icon' || slots === 'both' ? leading : undefined}
      action={slots === 'clear action' || slots === 'both' ? clear : undefined}
    />
  </div>
</PlaygroundFrame>
