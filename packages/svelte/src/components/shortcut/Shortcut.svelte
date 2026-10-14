<script lang="ts">
  import { onMount } from 'svelte';
  import type { ShortcutProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { detectPlatform, resolveShortcut, type PlatformSource, type ResolvedPlatform } from './keys.js';
  import './tokens.generated.css';
  import './shortcut.css';

  let {
    keys,
    platform = defaults.platform,
    appearance = defaults.appearance,
    size = defaults.size,
    label,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ShortcutProps = $props();

  // The server cannot know the platform: auto renders the other form there and in the first browser render (so
  // that hydration matches), then, once mounted, detection reads the browser and the component re-renders once.
  let detected = $state<ResolvedPlatform | null>(null);
  onMount(() => {
    detected = detectPlatform(navigator as PlatformSource);
  });
  const resolved = $derived<ResolvedPlatform>(platform === 'auto' ? (detected ?? 'other') : platform);
  const model = $derived(resolveShortcut(keys, resolved));
  // A non-empty label replaces the generated spoken equivalent.
  const name = $derived(typeof label === 'string' && label.trim() ? label : model.spoken);
</script>

<!--
  kbd root holding one kbd per key (the HTML pattern for a combination). kbd has no ARIA role, so the spoken
  equivalent is a visually hidden span and the visible keys and separators are presentation only (aria-hidden).
  data-platform carries the resolved platform (mac or other), never auto, so that styles and tests can read it.
-->
<kbd
  bind:this={ref}
  {...rest}
  class={['ggb-shortcut', className]}
  data-platform={resolved}
  data-appearance={appearance}
  data-size={size}
>
  <span class="ggb-shortcut__name">{name}</span>
  <span class="ggb-shortcut__container" aria-hidden="true">
    {#each model.keys as key, index (index)}
      {#if index > 0 && model.separator !== null}<span class="ggb-shortcut__separator">{model.separator}</span>{/if}<kbd
        class="ggb-shortcut__key"
        data-key={key.id}
        data-kind={key.kind}>{key.text}</kbd
      >
    {/each}
  </span>
</kbd>
