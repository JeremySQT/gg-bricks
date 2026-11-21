<script lang="ts">
  import { Avatar as AvatarPrimitive } from 'bits-ui';
  import type { AvatarImageStatus, AvatarProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { graphemes, initialsOf } from './initials.js';
  import './tokens.generated.css';
  import './avatar.css';

  let {
    name,
    initials,
    src,
    size = defaults.size,
    shape = defaults.shape,
    decorative = defaults.decorative,
    ref = $bindable(null),
    class: className,
    ...rest
  }: AvatarProps = $props();

  const label = $derived(typeof name === 'string' && name.trim() ? name.trim() : undefined);
  const given = $derived(typeof initials === 'string' && initials.trim() ? graphemes(initials.trim(), 3) : '');
  const text = $derived(given || initialsOf(label, size === 'xs'));
  const source = $derived(typeof src === 'string' && src.trim() ? src : undefined);

  // Bits UI reports the loading status of one picture; it is kept with the source it belongs to, so that a new src
  // starts from loading again (the fallback shows until the new picture has loaded).
  let loaded = $state<{ src: string | undefined; status: AvatarImageStatus }>({ src: undefined, status: 'loading' });
  const imageStatus = $derived<AvatarImageStatus>(!source ? 'none' : loaded.src === source ? loaded.status : 'loading');
  const hidden = $derived(decorative || !label);
</script>

{#snippet content()}
  {#if imageStatus !== 'loaded'}
    {#if text}
      <span class="ggb-avatar__initials" aria-hidden="true">{text}</span>
    {:else}
      <!-- Phosphor Icons 2.1.1 (MIT), user, regular weight: the generic person glyph, decorative. -->
      <svg class="ggb-avatar__icon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
        ><path
          d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
        /></svg
      >
    {/if}
  {/if}
{/snippet}

{#key source}
  <AvatarPrimitive.Root bind:ref onLoadingStatusChange={(status) => (loaded = { src: source, status })}>
    {#snippet child({ props })}
      <span
        {...props}
        {...rest}
        class={['ggb-avatar', className]}
        data-size={size}
        data-shape={shape}
        data-image={imageStatus}
        role={hidden ? undefined : 'img'}
        aria-label={hidden ? undefined : label}
        aria-hidden={hidden ? 'true' : undefined}
      >
        {#if source}<AvatarPrimitive.Image src={source} alt="" class="ggb-avatar__image" />{/if}
        {@render content()}
      </span>
    {/snippet}
  </AvatarPrimitive.Root>
{/key}
