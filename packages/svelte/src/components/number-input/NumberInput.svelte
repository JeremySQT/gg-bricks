<script lang="ts">
  import { getContext } from 'svelte';
  import type { NumberInputProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { clamp, formatNumber, parseNumber, plainNumber, stepValue, decimalsOf } from './number.js';
  import './tokens.generated.css';
  import './number-input.css';

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
    value = $bindable(),
    min,
    max,
    step = defaults.step,
    locale = defaults.locale,
    placeholder,
    label,
    size = defaults.size,
    hideSteppers = defaults.hideSteppers,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    name,
    decreaseLabel = defaults.decreaseLabel,
    increaseLabel = defaults.increaseLabel,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    onkeydown,
    oninput,
    onblur,
    ...rest
  }: NumberInputProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('text', () => id ?? field.controlId);

  // Fail identically on the server and in the browser rather than render an input without a name.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('NumberInput requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const safeStep = $derived(Number.isFinite(step) && step > 0 ? step : defaults.step);

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isReadonly = $derived(readonly && !isDisabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);
  const hasValue = $derived(value !== undefined && value !== null && Number.isFinite(value));
  const formatted = $derived(hasValue ? formatNumber(value, locale, safeStep) : '');

  // The text follows the value except while the user edits it; a commit or a step formats it again.
  let editing = $state(false);
  let draft = $state('');
  const text = $derived(editing ? draft : formatted);

  // Mobile keyboards: digits only when the number is a non-negative integer; a decimal key when it has fractions;
  // a full keyboard when a minus sign may be needed (numeric keypads have none).
  const inputmode = $derived(
    min !== undefined && min >= 0 ? (decimalsOf(safeStep) > 0 ? 'decimal' : 'numeric') : 'text'
  );
  const atMin = $derived(hasValue && min !== undefined && (value as number) <= min);
  const atMax = $derived(hasValue && max !== undefined && (value as number) >= max);
  const steppersOff = $derived(isDisabled || isReadonly);

  function set(next: number | undefined) {
    editing = false;
    if (next === value || (next !== undefined && value !== undefined && Object.is(next, value))) return;
    value = next;
    onvaluechange?.(next);
  }

  /** Reads the typed text: a number within min and max, undefined when empty, the current value when unreadable. */
  function read(): number | undefined {
    if (!editing) return hasValue ? value : undefined;
    const n = parseNumber(draft, locale);
    if (n === undefined) return undefined;
    if (Number.isNaN(n)) return hasValue ? value : undefined;
    return clamp(n, min, max);
  }

  function commit() {
    if (!editing) return;
    set(read());
  }

  function stepBy(count: number) {
    if (isDisabled || isReadonly) return;
    set(stepValue(read(), count, safeStep, min, max));
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    oninput?.(event as Parameters<NonNullable<typeof oninput>>[0]);
    if (isReadonly) return;
    draft = event.currentTarget.value;
    editing = true;
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    onkeydown?.(event as Parameters<NonNullable<typeof onkeydown>>[0]);
    if (event.defaultPrevented || isDisabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const big = event.shiftKey ? 10 : 1;
    let handled = true;
    switch (event.key) {
      case 'ArrowUp':
        stepBy(big);
        break;
      case 'ArrowDown':
        stepBy(-big);
        break;
      case 'PageUp':
        stepBy(10);
        break;
      case 'PageDown':
        stepBy(-10);
        break;
      case 'Home':
        if (min === undefined || isReadonly) handled = false;
        else set(min);
        break;
      case 'End':
        if (max === undefined || isReadonly) handled = false;
        else set(max);
        break;
      case 'Enter':
        commit();
        handled = false; // Enter still submits the enclosing form.
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  function handleBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
    onblur?.(event as Parameters<NonNullable<typeof onblur>>[0]);
    commit();
  }

  // A press on a stepper steps once and keeps focus in the input (or moves it there) without moving the caret.
  function stepperDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    ref?.focus();
  }

  // A press on the container (padding, extended target) focuses the input.
  function containerDown(event: PointerEvent) {
    const target = event.target as Element;
    if (isDisabled || !ref || target === ref || target.closest('.ggb-number-input__stepper')) return;
    event.preventDefault();
    ref.focus();
  }
</script>

{#snippet minus()}
  <!-- Phosphor Icons 2.1.1 (MIT), minus, regular weight: the decrease stepper, named by the button. -->
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" /></svg
  >
{/snippet}
{#snippet plus()}
  <!-- Phosphor Icons 2.1.1 (MIT), plus, regular weight: the increase stepper, named by the button. -->
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
    /></svg
  >
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={['ggb-number-input', className]}
  data-size={size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  data-steppers={hideSteppers ? undefined : ''}
  onpointerdown={containerDown}
>
  {#if !hideSteppers}
    <button
      type="button"
      class="ggb-number-input__stepper ggb-number-input__decrease"
      tabindex="-1"
      aria-label={decreaseLabel}
      disabled={steppersOff || atMin}
      onpointerdown={stepperDown}
      onclick={() => stepBy(-1)}>{@render minus()}</button
    >
  {/if}
  <input
    {...rest}
    bind:this={ref}
    id={id ?? field?.controlId}
    class="ggb-number-input__input"
    type="text"
    role="spinbutton"
    {inputmode}
    autocomplete={rest.autocomplete ?? 'off'}
    value={text}
    {placeholder}
    disabled={isDisabled}
    readonly={isReadonly}
    required={isRequired}
    aria-valuenow={hasValue ? value : undefined}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuetext={formatted || undefined}
    aria-invalid={isInvalid ? 'true' : undefined}
    aria-label={accessibleName}
    aria-labelledby={field?.labelId}
    aria-describedby={describedByIds}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onblur={handleBlur}
  />
  {#if !hideSteppers}
    <button
      type="button"
      class="ggb-number-input__stepper ggb-number-input__increase"
      tabindex="-1"
      aria-label={increaseLabel}
      disabled={steppersOff || atMax}
      onpointerdown={stepperDown}
      onclick={() => stepBy(1)}>{@render plus()}</button
    >
  {/if}
  {#if name}
    <input type="hidden" {name} value={plainNumber(hasValue ? value : undefined)} disabled={isDisabled} />
  {/if}
</div>
