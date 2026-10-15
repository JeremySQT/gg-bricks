<script lang="ts">
  // Shortcut playground: appearance, platform, size and combination, after a label of the same size.
  import { Shortcut } from '@ggbrick/svelte';
  import type { ShortcutAppearance, ShortcutPlatform, ShortcutSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let appearance = $state<ShortcutAppearance>('plain');
  let platform = $state<ShortcutPlatform>('auto');
  let size = $state<ShortcutSize>('md');
  let keys = $state('Mod+K');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Appearance',
        options: ['plain', 'keycap'],
        value: appearance,
        onchange: (v) => (appearance = v as ShortcutAppearance)
      }
    ],
    topEnd: [
      {
        label: 'Platform',
        options: ['auto', 'mac', 'other'],
        value: platform,
        onchange: (v) => (platform = v as ShortcutPlatform)
      }
    ],
    bottomStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ShortcutSize) }
    ],
    bottomEnd: [
      {
        label: 'Keys',
        options: ['Mod+K', 'Mod+Shift+P', 'Ctrl+Alt+Delete', 'Enter', 'Shift+ArrowUp'],
        value: keys,
        onchange: (v) => (keys = v)
      }
    ]
  }}
>
  <span style="font: var(--ggb-typography-label-{size})">
    Command palette <Shortcut {keys} {platform} {appearance} {size} />
  </span>
</PlaygroundFrame>
