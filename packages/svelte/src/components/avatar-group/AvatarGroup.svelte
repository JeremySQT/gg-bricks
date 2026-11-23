<script lang="ts">
  import Avatar from '../avatar/Avatar.svelte';
  import type { AvatarGroupProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './avatar-group.css';

  let {
    label,
    avatars,
    size = defaults.size,
    shape = defaults.shape,
    max = defaults.max,
    total = defaults.total,
    moreLabel = defaults.moreLabel,
    ref = $bindable(null),
    class: className,
    ...rest
  }: AvatarGroupProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed or empty list.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('AvatarGroup requires a non-empty label.');
    return label.trim();
  });
  const people = $derived.by(() => {
    if (!Array.isArray(avatars) || !avatars.length) throw new Error('AvatarGroup requires at least one avatar.');
    return avatars;
  });

  // The number of people is total when the application knows more than it shows. With max, the group never shows
  // more than max boxes, the +N box included.
  const count = $derived(Math.max(Math.floor(Number(total) || 0), people.length));
  const limit = $derived(Math.max(0, Math.floor(Number(max) || 0)));
  const shown = $derived(limit > 0 && count > limit ? Math.max(1, limit - 1) : people.length);
  const visible = $derived(people.slice(0, shown));
  const others = $derived(count - visible.length);
  const word = $derived(typeof moreLabel === 'string' && moreLabel.trim() ? moreLabel.trim() : defaults.moreLabel);
</script>

<ul
  {...rest}
  bind:this={ref}
  class={['ggb-avatar-group', className]}
  role="list"
  aria-label={name}
  data-size={size}
  data-shape={shape}
>
  {#each visible as person, index (index)}
    <li class="ggb-avatar-group__item">
      <Avatar name={person.name} src={person.src} initials={person.initials} {size} {shape} />
    </li>
  {/each}
  {#if others > 0}
    <li class="ggb-avatar-group__item ggb-avatar-group__overflow">
      <Avatar name={`${others} ${word}`} initials={`+${Math.min(others, 99)}`} {size} {shape} />
    </li>
  {/if}
</ul>
