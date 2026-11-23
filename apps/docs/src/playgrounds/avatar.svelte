<script lang="ts">
  // Avatar playground: size, shape and what the box shows (a picture, initials or the generic glyph).
  import { Avatar } from '@ggbrick/svelte';
  import type { AvatarShape, AvatarSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { portraits } from '../../../../examples/avatar/portraits.ts';

  let size = $state<AvatarSize>('lg');
  let shape = $state<AvatarShape>('circle');
  let content = $state('picture');
  const person = $derived(
    shape === 'circle'
      ? { name: 'Olivia Rhye', src: portraits.olivia }
      : { name: 'Acme Corporation', src: portraits.acme }
  );
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        value: size,
        onchange: (v) => (size = v as AvatarSize)
      }
    ],
    topEnd: [
      { label: 'Shape', options: ['circle', 'square'], value: shape, onchange: (v) => (shape = v as AvatarShape) }
    ],
    bottomStart: [
      {
        label: 'Content',
        options: ['picture', 'initials', 'glyph'],
        value: content,
        onchange: (v) => (content = v)
      }
    ]
  }}
>
  <Avatar
    name={content === 'glyph' ? undefined : person.name}
    src={content === 'picture' ? person.src : undefined}
    {size}
    {shape}
  />
</PlaygroundFrame>
