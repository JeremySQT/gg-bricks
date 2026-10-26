<script lang="ts">
  import { getContext } from 'svelte';
  import type { TextareaProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './textarea.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly controlId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    register(kind: 'text' | 'choice'): void;
  }

  let {
    value = $bindable(defaults.value),
    size = defaults.size,
    rows = defaults.rows,
    resize = defaults.resize,
    maxRows = defaults.maxRows,
    placeholder,
    label,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: TextareaProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('text');

  const name = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('Textarea requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const lines = (n: number, fallback: number) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : fallback);
  const rowCount = $derived(lines(rows, defaults.rows));
  const maxCount = $derived(Math.max(rowCount, lines(maxRows, defaults.maxRows)));

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
    value = event.currentTarget.value;
    onvaluechange?.(value);
  }

  // A press on the target extension around a short textarea focuses it.
  function handlePointerdown(event: PointerEvent) {
    if (isDisabled || !ref || event.target === ref) return;
    event.preventDefault();
    ref.focus();
  }

  // resize auto: the block size follows the content between rows and maxRows lines (CSS sets both limits), the
  // content scrolls beyond. Measured after every value change, including values set by the application.
  $effect(() => {
    void value;
    void rowCount;
    void maxCount;
    const el = ref;
    if (resize !== 'auto' || !el) {
      if (el) el.style.blockSize = '';
      return;
    }
    el.style.blockSize = 'auto';
    const style = getComputedStyle(el);
    const border = parseFloat(style.borderBlockStartWidth) + parseFloat(style.borderBlockEndWidth);
    el.style.blockSize = `${el.scrollHeight + border}px`;
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={['ggb-textarea', className]}
  data-size={size}
  data-resize={resize}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={readonly && !isDisabled ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  style:--_rows={rowCount}
  style:--_max-rows={maxCount}
  onpointerdown={handlePointerdown}
>
  <textarea
    {...rest}
    bind:this={ref}
    id={id ?? field?.controlId}
    class="ggb-textarea__input"
    {value}
    rows={rowCount}
    {placeholder}
    disabled={isDisabled}
    {readonly}
    required={isRequired}
    aria-invalid={isInvalid ? 'true' : undefined}
    aria-label={name}
    aria-describedby={describedByIds}
    oninput={(event) => {
      handleInput(event);
      (rest.oninput as ((e: Event) => void) | undefined)?.(event);
    }}
  ></textarea>
</div>
