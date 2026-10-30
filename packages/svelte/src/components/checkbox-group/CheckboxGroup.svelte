<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import { Checkbox as Primitive } from 'bits-ui';
  import type { CheckboxGroupContext, CheckboxGroupProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './checkbox-group.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly labelId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    register(kind: 'text' | 'choice', id?: () => string): void;
  }

  let {
    value = $bindable([...defaults.value]),
    label,
    orientation = defaults.orientation,
    size = defaults.size,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    children,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    'aria-describedby': describedBy,
    ...rest
  }: CheckboxGroupProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  const name = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('CheckboxGroup requires a non-empty label when it is not inside a Field.');
    return label;
  });

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const isReadonly = $derived(readonly && !isDisabled);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  setContext<CheckboxGroupContext>('ggb:checkbox-group', {
    get value() {
      return value;
    },
    get size() {
      return size;
    },
    get readonly() {
      return isReadonly;
    },
    get invalid() {
      return isInvalid;
    },
    get disabled() {
      return isDisabled;
    }
  });

  // The user changed the selection (Bits UI appends a newly checked value): keep the values in the source order of
  // the checkboxes, then notify. Values that match no checkbox stay at the end, untouched.
  function changed(next: string[]) {
    const order = ref
      ? [...ref.querySelectorAll<HTMLElement>('[data-checkbox-value]')].map((el) => el.dataset.checkboxValue ?? '')
      : [];
    const rank = (v: string) => (order.includes(v) ? order.indexOf(v) : order.length);
    value = [...next].sort((a, b) => rank(a) - rank(b));
    onvaluechange?.(value);
  }
</script>

<!-- required is not passed to the primitive: it would announce every checkbox as mandatory. -->
<Primitive.Group
  {...rest}
  bind:ref
  bind:value={() => value, changed}
  class={['ggb-checkbox-group', className]}
  data-orientation={orientation}
  data-size={size}
  data-invalid={isInvalid ? '' : undefined}
  data-required={isRequired ? '' : undefined}
  disabled={isDisabled}
  readonly={isReadonly}
  aria-label={name}
  aria-labelledby={field?.labelId}
  aria-describedby={describedByIds}
>
  {@render children()}
</Primitive.Group>
