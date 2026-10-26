<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import { RadioGroup as Primitive } from 'bits-ui';
  import type { RadioGroupContext, RadioGroupProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './radio-group.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly labelId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    register(kind: 'text' | 'choice'): void;
  }

  let {
    value = $bindable(defaults.value),
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
    onkeydown,
    ...rest
  }: RadioGroupProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  const name = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('RadioGroup requires a non-empty label when it is not inside a Field.');
    return label;
  });

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const isReadonly = $derived(readonly && !isDisabled);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  setContext<RadioGroupContext>('ggb:radio-group', {
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

  // Arrow keys select the radio they move to. Bits UI does so only once a value exists; the first arrow press in a
  // group without a selection is completed here, after the primitive has moved focus (this handler runs on the
  // group, once the radio's own handler has run).
  const navigation = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    (onkeydown as ((e: KeyboardEvent) => void) | undefined)?.(event);
    if (isReadonly || isDisabled || !navigation.has(event.key)) return;
    const focused = document.activeElement;
    if (
      focused instanceof HTMLElement &&
      event.currentTarget.contains(focused) &&
      focused.getAttribute('role') === 'radio' &&
      focused.getAttribute('aria-checked') !== 'true'
    )
      focused.click();
  }
</script>

<Primitive.Root
  {...rest}
  bind:value
  bind:ref
  class={['ggb-radio-group', className]}
  data-size={size}
  data-invalid={isInvalid ? '' : undefined}
  {orientation}
  loop
  disabled={isDisabled}
  readonly={isReadonly}
  required={isRequired}
  aria-label={name}
  aria-labelledby={field?.labelId}
  aria-describedby={describedByIds}
  aria-invalid={isInvalid ? 'true' : undefined}
  onkeydown={handleKeydown}
  onValueChange={(v) => onvaluechange?.(v)}
>
  {@render children()}
</Primitive.Root>
