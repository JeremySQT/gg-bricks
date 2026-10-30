<script lang="ts">
  import { getContext } from 'svelte';
  import { Checkbox as Primitive } from 'bits-ui';
  import type { CheckboxProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './checkbox.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly labelId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    register(kind: 'text' | 'choice', id?: () => string): void;
  }
  // Shape shared by CheckboxGroup through the context key `ggb:checkbox-group` (declared again here).
  interface CheckboxGroupContext {
    readonly value: readonly string[];
    readonly size: 'sm' | 'md' | 'lg';
    readonly readonly: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
  }

  let {
    checked = $bindable(defaults.checked),
    indeterminate = $bindable(defaults.indeterminate),
    value = defaults.value,
    label,
    hideLabel = defaults.hideLabel,
    description,
    size = defaults.size,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    oncheckedchange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: CheckboxProps = $props();

  // Inside a CheckboxGroup, the group answers to the Field and passes its size and conditions to the checkbox.
  const group = getContext<CheckboxGroupContext | undefined>('ggb:checkbox-group');
  const field = group ? undefined : getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  const uid = $props.id();
  const base = $derived(id ?? `ggb-checkbox-${uid}`);
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Checkbox requires a non-empty label.');
    return label;
  });
  const itemValue = $derived.by(() => {
    if (group && !value) throw new Error('A Checkbox inside a CheckboxGroup requires a value.');
    return value || undefined;
  });
  const hasDescription = $derived(typeof description === 'string' && description.trim() !== '');

  const isDisabled = $derived(disabled || !!field?.disabled || !!group?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid || !!group?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const isReadonly = $derived((readonly || !!group?.readonly) && !isDisabled);
  const shownSize = $derived(group?.size ?? size);
  // Checkboxes of a group are never indeterminate; their selection follows the group value (on the server too, where
  // the primitive syncs checked only after the label has rendered).
  const mixed = $derived(!group && indeterminate);
  const selected = $derived(group ? group.value.includes(itemValue ?? '') : checked);
  const describedByIds = $derived(
    [hasDescription && `${base}-description`, field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined
  );
</script>

{#snippet checkbox()}
  <label
    class={['ggb-checkbox', className]}
    data-size={shownSize}
    data-selection={selected || mixed ? 'on' : 'off'}
    data-hide-label={hideLabel ? '' : undefined}
    data-disabled={isDisabled ? '' : undefined}
    data-readonly={isReadonly ? '' : undefined}
    data-invalid={isInvalid ? '' : undefined}
  >
    <Primitive.Root
      {...rest}
      bind:checked
      bind:indeterminate={() => mixed, (v) => (indeterminate = v)}
      bind:ref
      value={itemValue}
      data-checkbox-value={group ? itemValue : undefined}
      id={base}
      class="ggb-checkbox__control"
      disabled={isDisabled}
      readonly={isReadonly}
      required={isRequired}
      aria-labelledby={`${base}-label`}
      aria-describedby={describedByIds}
      aria-invalid={isInvalid ? 'true' : undefined}
      onCheckedChange={(value) => oncheckedchange?.(value)}
    >
      {#snippet children({ checked: on, indeterminate: mixed })}
        {#if mixed || on}
          <!-- Phosphor Icons 2.1.1 (MIT), bold weight: minus for indeterminate, check for checked. -->
          <svg
            class="ggb-checkbox__mark"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            {#if mixed}
              <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z" />
            {:else}
              <path
                d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"
              />
            {/if}
          </svg>
        {/if}
      {/snippet}
    </Primitive.Root>
    <span class="ggb-checkbox__text">
      <span class="ggb-checkbox__label" id={`${base}-label`}>{name}</span>
      {#if hasDescription}
        <span class="ggb-checkbox__description" id={`${base}-description`}>{description}</span>
      {/if}
    </span>
  </label>
{/snippet}

<!-- Inside a Field, the field label names the question this checkbox answers; the checkbox keeps its own name. -->
{#if field}
  <div class="ggb-checkbox__group" role="group" aria-labelledby={field.labelId}>{@render checkbox()}</div>
{:else}
  {@render checkbox()}
{/if}
