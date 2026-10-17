<script lang="ts">
  import type { BadgeProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './badge.css';

  let {
    label,
    intent = defaults.intent,
    appearance = defaults.appearance,
    size = defaults.size,
    leading,
    ref = $bindable(null),
    class: className,
    ...rest
  }: BadgeProps = $props();

  // Fail identically on the server and in the browser rather than render an empty badge.
  const text = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Badge requires a non-empty label.');
    return label;
  });
</script>

<!--
  Static text: no role and no aria-label, so the label is read where it stands. A truncated label keeps its
  full text in the DOM (text-overflow only hides it visually), so assistive technology reads all of it.
-->
<span
  {...rest}
  class={['ggb-badge', className]}
  data-intent={intent}
  data-appearance={appearance}
  data-size={size}
  bind:this={ref}
  >{#if leading}<span class="ggb-badge__leading" aria-hidden="true">{@render leading()}</span>{/if}<span
    class="ggb-badge__label">{text}</span
  ></span
>
