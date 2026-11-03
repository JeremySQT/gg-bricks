<script lang="ts">
  import { setContext } from 'svelte';
  import IconButton from '../icon-button/IconButton.svelte';
  import type { AlertProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { glyphs } from './glyphs.js';
  import './tokens.generated.css';
  import './alert.css';

  let {
    intent = defaults.intent,
    title = defaults.title,
    children,
    icon,
    actions,
    dismissible = defaults.dismissible,
    dismissLabel = defaults.dismissLabel,
    live = defaults.live,
    ondismiss,
    ref = $bindable(null),
    class: className,
    ...rest
  }: AlertProps = $props();

  // Fail identically on the server and in the browser rather than render an empty message.
  const heading = $derived.by(() => {
    const text = typeof title === 'string' ? title.trim() : '';
    if (!text && !children) throw new Error('Alert requires a title, a content or both.');
    return text;
  });

  const glyph = $derived(
    intent === 'success'
      ? glyphs['check-circle']
      : intent === 'warning'
        ? glyphs.warning
        : intent === 'danger'
          ? glyphs['warning-circle']
          : glyphs.info
  );
  // Announced only on request: danger and warning interrupt (role alert), the other intents wait (role status).
  const role = $derived(live ? (intent === 'danger' || intent === 'warning' ? 'alert' : 'status') : undefined);

  // The ButtonGroup of the actions slot is small unless it sets its own size; the dismiss button is small too.
  setContext('ggb:button-group-host', { size: 'sm' });
  // A ButtonGroup around the alert does not size the dismiss button.
  setContext('ggb:button-group', undefined);
  // Links in the content take the alert's text color (tone inherit) unless they set their own tone.
  setContext('ggb:link-tone', { tone: 'inherit' });
</script>

<div {...rest} bind:this={ref} class={['ggb-alert', className]} data-intent={intent} {role}>
  <span class="ggb-alert__icon" aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      <svg viewBox="0 0 256 256" fill="currentColor" focusable="false"><path d={glyph} /></svg>
    {/if}
  </span>
  <div class="ggb-alert__body">
    {#if heading}<div class="ggb-alert__title">{heading}</div>{/if}
    {#if children}<div class="ggb-alert__content">{@render children()}</div>{/if}
    {#if actions}<div class="ggb-alert__actions">{@render actions()}</div>{/if}
  </div>
  {#if dismissible}
    <span class="ggb-alert__dismiss">
      <IconButton label={dismissLabel} size="sm" intent="neutral" appearance="ghost" onactivate={() => ondismiss?.()}>
        {#snippet icon()}
          <svg viewBox="0 0 256 256" fill="currentColor" focusable="false" aria-hidden="true"><path d={glyphs.x} /></svg
          >
        {/snippet}
      </IconButton>
    </span>
  {/if}
</div>
