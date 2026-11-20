<script lang="ts">
  // AvatarGroup playground: size, shape, max (the +N box included) and the number of people.
  import { AvatarGroup } from '@ggbrick/svelte';
  import type { AvatarGroupShape, AvatarGroupSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<AvatarGroupSize>('md');
  let shape = $state<AvatarGroupShape>('circle');
  let max = $state('5');
  let count = $state('7');
  const names = [
    'Olivia Rhye',
    'Phoenix Baker',
    'Lana Steiner',
    'Demi Wilkinson',
    'Candice Wu',
    'Natali Craig',
    'Drew Cano',
    'Orlando Diggs',
    'Andi Lane',
    'Kate Morrison',
    'Koray Okumus',
    'Ava Wright'
  ];
  const avatars = $derived(names.slice(0, Number(count)).map((name) => ({ name })));
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        value: size,
        onchange: (v) => (size = v as AvatarGroupSize)
      }
    ],
    topEnd: [
      {
        label: 'Shape',
        options: ['circle', 'square'],
        value: shape,
        onchange: (v) => (shape = v as AvatarGroupShape)
      }
    ],
    bottomStart: [{ label: 'Max', options: ['0', '3', '4', '5', '6'], value: max, onchange: (v) => (max = v) }],
    bottomEnd: [{ label: 'People', options: ['1', '3', '5', '7', '12'], value: count, onchange: (v) => (count = v) }]
  }}
>
  <AvatarGroup label="Assignees" {avatars} {size} {shape} max={Number(max)} />
</PlaygroundFrame>
