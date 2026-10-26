<script lang="ts">
  // Badge playground: intent, appearance, size and the optional leading icon.
  import { Badge, Icon } from '@ggbrick/svelte';
  import type { BadgeAppearance, BadgeIntent, BadgeSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let intent = $state<BadgeIntent>('success');
  let appearance = $state<BadgeAppearance>('subtle');
  let size = $state<BadgeSize>('md');
  let icon = $state('none');
  const labels: Record<BadgeIntent, string> = {
    neutral: 'Draft',
    accent: 'New',
    info: 'In review',
    success: 'Paid',
    warning: 'Due soon',
    danger: 'Overdue'
  };
  const glyphs: Record<BadgeIntent, string> = {
    neutral: 'check',
    accent: 'plus',
    info: 'warning-circle',
    success: 'check',
    warning: 'warning-circle',
    danger: 'warning-circle'
  };
</script>

{#snippet leading()}<Icon><path d={phosphor[glyphs[intent]]} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as BadgeIntent)
      }
    ],
    topEnd: [
      {
        label: 'Appearance',
        options: ['subtle', 'strong'],
        value: appearance,
        onchange: (v) => (appearance = v as BadgeAppearance)
      }
    ],
    bottomStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as BadgeSize) }
    ],
    bottomEnd: [{ label: 'Leading icon', options: ['none', 'icon'], value: icon, onchange: (v) => (icon = v) }]
  }}
>
  <Badge label={labels[intent]} {intent} {appearance} {size} leading={icon === 'icon' ? leading : undefined} />
</PlaygroundFrame>
