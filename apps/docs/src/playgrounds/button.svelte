<script lang="ts">
  // Button playground: intent, appearance, size, state and slot content.
  import { Button, Counter, Icon, Shortcut } from '@ggbrick/svelte';
  import type { ButtonAppearance, ButtonIntent, ButtonSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let intent = $state<ButtonIntent>('accent');
  let appearance = $state<ButtonAppearance>('solid');
  let size = $state<ButtonSize>('md');
  let buttonState = $state('default');
  let content = $state('label only');
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet arrow()}<Icon><path d={phosphor['arrow-right']} /></Icon>{/snippet}
{#snippet counter()}<Counter value={8} {size} />{/snippet}
{#snippet shortcut()}<Shortcut keys="Mod+S" {size} />{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['accent', 'neutral', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as ButtonIntent)
      }
    ],
    topEnd: [
      {
        label: 'Appearance',
        options: ['solid', 'outline', 'ghost'],
        value: appearance,
        onchange: (v) => (appearance = v as ButtonAppearance)
      }
    ],
    bottomStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ButtonSize) },
      {
        label: 'Content',
        options: ['label only', 'leading icon', 'trailing icon', 'counter', 'shortcut'],
        value: content,
        onchange: (v) => (content = v)
      }
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
  <Button
    label={content === 'counter' ? 'Inbox' : 'Save changes'}
    {intent}
    {appearance}
    {size}
    loading={buttonState === 'loading'}
    disabled={buttonState === 'disabled'}
    leading={content === 'leading icon' ? plus : undefined}
    trailing={content === 'trailing icon'
      ? arrow
      : content === 'counter'
        ? counter
        : content === 'shortcut'
          ? shortcut
          : undefined}
  />
</PlaygroundFrame>
