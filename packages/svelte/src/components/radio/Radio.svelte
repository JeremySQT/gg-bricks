<script lang="ts">
  import { getContext } from 'svelte';
  import { RadioGroup as Primitive } from 'bits-ui';
  import type { RadioProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './radio.css';

  // Shape shared by RadioGroup through the context key `ggb:radio-group` (declared again here: no import between
  // folders).
  interface RadioGroupContext {
    readonly size: 'sm' | 'md' | 'lg';
    readonly readonly: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
  }

  let {
    value,
    label,
    description,
    disabled = defaults.disabled,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: RadioProps = $props();

  const group = getContext<RadioGroupContext | undefined>('ggb:radio-group');
  if (!group) throw new Error('Radio must be placed inside a RadioGroup.');

  const uid = $props.id();
  const base = $derived(id ?? `ggb-radio-${uid}`);
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Radio requires a non-empty label.');
    return label;
  });
  const hasDescription = $derived(typeof description === 'string' && description.trim() !== '');
  const isDisabled = $derived(disabled || group.disabled);
  const isReadonly = $derived(group.readonly && !isDisabled);
  const describedByIds = $derived(
    [hasDescription && `${base}-description`, describedBy].filter(Boolean).join(' ') || undefined
  );
</script>

<label
  class={['ggb-radio', className]}
  data-size={group.size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
  data-invalid={group.invalid ? '' : undefined}
>
  <Primitive.Item
    {...rest}
    bind:ref
    {value}
    id={base}
    class="ggb-radio__control"
    disabled={isDisabled}
    aria-labelledby={`${base}-label`}
    aria-describedby={describedByIds}
  >
    {#snippet children({ checked })}
      <!-- Ring and dot are drawn as centered circles: SVG geometry is antialiased instead of snapped to device
           pixels, so they stay round and centered at fractional display scales (125 %, 150 %). -->
      <svg class="ggb-radio__circle" aria-hidden="true" focusable="false">
        <circle class="ggb-radio__ring" />
        {#if checked}<circle class="ggb-radio__mark" />{/if}
      </svg>
    {/snippet}
  </Primitive.Item>
  <span class="ggb-radio__text">
    <span class="ggb-radio__label" id={`${base}-label`}>{name}</span>
    {#if hasDescription}
      <span class="ggb-radio__description" id={`${base}-description`}>{description}</span>
    {/if}
  </span>
</label>
