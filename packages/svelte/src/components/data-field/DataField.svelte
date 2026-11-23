<script lang="ts">
  import type { DataFieldProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './data-field.css';

  let {
    label,
    value,
    children,
    orientation = defaults.orientation,
    size = defaults.size,
    emptyLabel = defaults.emptyLabel,
    id,
    ref = $bindable(null),
    class: className,
    ...rest
  }: DataFieldProps = $props();

  const uid = $props.id();
  const labelId = $derived(`${id ?? `ggb-data-field-${uid}`}-label`);

  // Fail identically on the server and in the browser rather than render an unnamed field.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('DataField requires a non-empty label.');
    return label;
  });
  const text = $derived(typeof value === 'string' && value.trim() ? value : '');
  const empty = $derived(!children && !text);
  const announced = $derived(typeof emptyLabel === 'string' && emptyLabel.trim() ? emptyLabel : defaults.emptyLabel);
</script>

<!-- The root is the size container of the horizontal layout; the inner element lays out label and value. -->
<div
  {...rest}
  {id}
  bind:this={ref}
  class={['ggb-data-field', className]}
  role="group"
  aria-labelledby={labelId}
  data-orientation={orientation}
  data-size={size}
  data-empty={empty ? '' : undefined}
>
  <div class="ggb-data-field__layout">
    <div class="ggb-data-field__label" id={labelId}>{name}</div>
    <div class="ggb-data-field__value">
      {#if children}
        {@render children()}
      {:else if text}
        {text}
      {:else}
        <span class="ggb-data-field__empty"
          ><span aria-hidden="true">—</span><span class="ggb-data-field__hidden">{announced}</span></span
        >
      {/if}
    </div>
  </div>
</div>
