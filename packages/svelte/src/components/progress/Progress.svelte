<script lang="ts">
  import { Progress as Primitive } from 'bits-ui';
  import type { ProgressProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './progress.css';

  let {
    value = defaults.value,
    max = defaults.max,
    indeterminate = defaults.indeterminate,
    label,
    showLabel = defaults.showLabel,
    showValue = defaults.showValue,
    intent = defaults.intent,
    size = defaults.size,
    ref = $bindable(null),
    class: className,
    id,
    ...rest
  }: ProgressProps = $props();

  // Fail identically on the server and in the browser rather than render a progress bar without a name.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Progress requires a non-empty label.');
    return label;
  });

  const uid = $props.id();
  const labelId = $derived(`${id ?? uid}-label`);
  const bound = $derived(Number.isFinite(max) && max > 0 ? max : defaults.max);
  const current = $derived(Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), bound));
  const fraction = $derived(current / bound);
  const percent = $derived(Math.round(fraction * 100));
</script>

<div class={['ggb-progress', className]} data-intent={intent} data-size={size}>
  {#if showLabel || (showValue && !indeterminate)}
    <div class="ggb-progress__header">
      <span class="ggb-progress__label" class:ggb-progress__label--hidden={!showLabel} id={labelId}>{name}</span>
      {#if showValue && !indeterminate}
        <span class="ggb-progress__valueText" aria-hidden="true">{percent}%</span>
      {/if}
    </div>
  {:else}
    <span class="ggb-progress__label ggb-progress__label--hidden" id={labelId}>{name}</span>
  {/if}
  <!-- Bits UI does not render the id it is given: the child snippet places it on the progress bar itself. -->
  <Primitive.Root
    {...rest}
    bind:ref
    value={indeterminate ? null : current}
    max={bound}
    min={0}
    aria-labelledby={labelId}
    data-indeterminate={indeterminate ? '' : undefined}
  >
    {#snippet child({ props })}
      <div {...props} {id} class="ggb-progress__track">
        <div
          class="ggb-progress__indicator"
          style:inline-size={indeterminate ? undefined : `${fraction * 100}%`}
          hidden={!indeterminate && fraction === 0}
        ></div>
      </div>
    {/snippet}
  </Primitive.Root>
</div>
