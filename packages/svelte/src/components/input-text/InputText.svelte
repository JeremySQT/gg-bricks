<script lang="ts">
  import { getContext } from 'svelte';
  import type { InputTextActionProps, InputTextProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './input-text.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly controlId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    readonly labelId: string;
    register(kind: 'text' | 'choice', id?: () => string): void;
  }

  let {
    value = $bindable(defaults.value),
    type = defaults.type,
    size = defaults.size,
    placeholder,
    label,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    leading,
    trailing,
    action,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: InputTextProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  // The label targets the element id, the consumer's or the field's; the field label also names the control through
  // aria-labelledby, which holds even before hydration or with a custom id.
  field?.register('text', () => id ?? field.controlId);

  // Fail identically on the server and in the browser rather than render an input without a name.
  const name = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('InputText requires a non-empty label when it is not inside a Field.');
    return label;
  });

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  // The trailing IconButton is one size smaller than the input; sm has no room for a second target.
  const actionProps = $derived<InputTextActionProps | null>(
    size === 'sm'
      ? null
      : { size: size === 'lg' ? 'md' : 'sm', intent: 'neutral', appearance: 'ghost', disabled: isDisabled }
  );
  $effect(() => {
    if (action && !actionProps) console.warn('InputText: an action is not rendered at size sm.');
  });
  const hasAction = $derived(!!action && !!actionProps);

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    value = event.currentTarget.value;
    onvaluechange?.(value);
  }

  // A press on the container, a decorative slot or the extended target focuses the input without moving the caret
  // away from where a press on the text would put it. The action keeps its own behavior.
  function handlePointerdown(event: PointerEvent) {
    const target = event.target as Element;
    if (isDisabled || !ref || target === ref || target.closest('.ggb-input-text__action')) return;
    event.preventDefault();
    ref.focus();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={['ggb-input-text', className]}
  data-size={size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={readonly && !isDisabled ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  data-action={hasAction ? '' : undefined}
  onpointerdown={handlePointerdown}
>
  {#if leading}
    <span class="ggb-input-text__leading" aria-hidden="true">{@render leading()}</span>
  {/if}
  <input
    {...rest}
    bind:this={ref}
    id={id ?? field?.controlId}
    class="ggb-input-text__input"
    {type}
    {value}
    {placeholder}
    disabled={isDisabled}
    {readonly}
    required={isRequired}
    aria-invalid={isInvalid ? 'true' : undefined}
    aria-label={name}
    aria-labelledby={field?.labelId}
    aria-describedby={describedByIds}
    oninput={(event) => {
      handleInput(event);
      (rest.oninput as ((e: Event) => void) | undefined)?.(event);
    }}
  />
  {#if hasAction && actionProps}
    <span class="ggb-input-text__action">{@render action!(actionProps)}</span>
  {:else if trailing}
    <span class="ggb-input-text__trailing" aria-hidden="true">{@render trailing()}</span>
  {/if}
</div>
