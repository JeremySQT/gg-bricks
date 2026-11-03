<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import IconButton from '../icon-button/IconButton.svelte';
  import type { ToastProps, ToastRegionContext } from './types.js';
  import { childDefaults } from './contract.generated.js';
  import { glyphs } from './glyphs.js';
  import './tokens.generated.css';
  import './toast.css';

  const defaults = childDefaults.item;

  let {
    intent = defaults.intent,
    title,
    description = defaults.description,
    duration = defaults.duration,
    dismissLabel = defaults.dismissLabel,
    icon,
    action,
    ondismiss,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ToastProps = $props();

  // Fail identically on the server and in the browser rather than render a toast that says nothing.
  const heading = $derived.by(() => {
    if (typeof title !== 'string' || !title.trim()) throw new Error('Toast requires a non-empty title.');
    return title;
  });

  const region = getContext<ToastRegionContext | undefined>('ggb:toast');
  // The action Button and the dismiss IconButton are small, whatever group surrounds the region.
  setContext('ggb:button-group', { size: 'sm' });

  const glyph = $derived(
    intent === 'success'
      ? glyphs['check-circle']
      : intent === 'warning'
        ? glyphs.warning
        : intent === 'danger'
          ? glyphs['warning-circle']
          : glyphs.info
  );

  let left = false;
  function dismiss() {
    if (left) return;
    left = true;
    ondismiss?.();
  }

  // Countdown: only for a toast without an action and with a duration; paused with the region and while queued.
  let queued = $state(false);
  $effect(() => {
    const element = ref;
    if (!element) return;
    const observer = new MutationObserver(() => (queued = element.hasAttribute('data-queued')));
    observer.observe(element, { attributes: true, attributeFilter: ['data-queued'] });
    queued = element.hasAttribute('data-queued');
    return () => observer.disconnect();
  });
  const timed = $derived(!action && Number.isFinite(duration) && duration > 0);
  const paused = $derived(queued || !!region?.paused);
  // Time left before the toast leaves; reset when the duration changes, lowered while the countdown is paused.
  let remaining = $derived(timed ? duration : 0);
  $effect(() => {
    if (!timed || paused || remaining <= 0) return;
    const started = performance.now();
    const budget = remaining;
    const timer = setTimeout(dismiss, budget);
    return () => {
      clearTimeout(timer);
      remaining = Math.max(0, budget - (performance.now() - started));
    };
  });

  // Leaving: fades out and collapses so that the others close the gap; under reduced motion it only fades.
  function leave(node: HTMLElement) {
    node.setAttribute('data-leaving', '');
    const style = getComputedStyle(node);
    const ms = parseFloat(style.getPropertyValue('--ggb-toast-item-motionDuration')) || 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const height = node.offsetHeight;
    return {
      duration: ms,
      css: (t: number) =>
        reduced
          ? `opacity: ${t}`
          : `opacity: ${t}; block-size: ${t * height}px; overflow: hidden; margin-block-end: ${(t - 1) * parseFloat(getComputedStyle(node.parentElement ?? node).rowGap || '0')}px`
    };
  }
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-toast__item', className]}
  data-intent={intent}
  role={intent === 'danger' ? 'alert' : 'status'}
  aria-atomic="true"
  onkeydown={(event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      dismiss();
    }
  }}
  out:leave|global
>
  <span class="ggb-toast__icon" aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      <svg viewBox="0 0 256 256" fill="currentColor" focusable="false"><path d={glyph} /></svg>
    {/if}
  </span>
  <div class="ggb-toast__text">
    <div class="ggb-toast__title">{heading}</div>
    {#if description}<div class="ggb-toast__description">{description}</div>{/if}
  </div>
  {#if action}
    <!-- Activating the action performs it (its own handler), then the toast asks to leave. A keyboard activation of
         the button also arrives as a click. -->
    <span
      class="ggb-toast__action"
      role="none"
      onclick={(event) => {
        if ((event.target as Element).closest('button, a')) queueMicrotask(dismiss);
      }}
    >
      {@render action()}
    </span>
  {/if}
  <span class="ggb-toast__dismiss">
    <IconButton label={dismissLabel} size="sm" intent="neutral" appearance="ghost" onactivate={dismiss}>
      {#snippet icon()}
        <svg viewBox="0 0 256 256" fill="currentColor" focusable="false" aria-hidden="true"><path d={glyphs.x} /></svg>
      {/snippet}
    </IconButton>
  </span>
</div>
