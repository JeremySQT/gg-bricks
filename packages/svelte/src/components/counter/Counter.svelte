<script lang="ts">
  import type { CounterProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './counter.css';

  let {
    value = defaults.value,
    max = defaults.max,
    size = defaults.size,
    label,
    ref = $bindable(null),
    class: className,
    ...rest
  }: CounterProps = $props();

  // Contract: a non-negative integer; a fractional value is rounded down and a negative value shows 0.
  // A value that is not a finite number (NaN, Infinity) is treated like an absent one and shows 0.
  const quantity = $derived(Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
  // max is at least 1 and an integer, so that the overflow text is itself a counter value.
  const limit = $derived(Number.isFinite(max) ? Math.max(1, Math.floor(max)) : defaults.max);
  // Derived state: value exceeds max; the visible text is then max followed by a plus sign.
  const overflow = $derived(quantity > limit);

  // Digit grouping follows the locale of the environment (server or browser); never fraction digits.
  const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const text = $derived(overflow ? `${format.format(limit)}+` : format.format(quantity));
  // The label starts with a space so that value and label read as one phrase; white-space: pre keeps it.
  const labelText = $derived(label ? ` ${label}` : '');
</script>

<!--
  The accessible text is the visible text followed by the label: the label span is visually hidden and
  starts with a space so that the two read as one phrase (8 unread messages). No role and no aria-label:
  the visible text stays the text, and the host decides whether the counter is announced at all.
-->
<span
  {...rest}
  class={['ggb-counter', className]}
  data-size={size}
  data-overflow={overflow ? '' : undefined}
  bind:this={ref}
  ><span class="ggb-counter__value">{text}</span>{#if labelText}<span class="ggb-counter__label">{labelText}</span
    >{/if}</span
>
