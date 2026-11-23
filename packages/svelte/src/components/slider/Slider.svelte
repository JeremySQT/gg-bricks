<script lang="ts">
  import { getContext } from 'svelte';
  import { Slider } from 'bits-ui';
  import type { SliderProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './slider.css';

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
    min = defaults.min,
    max = defaults.max,
    step = defaults.step,
    label,
    showValue = defaults.showValue,
    locale = defaults.locale,
    disabled = defaults.disabled,
    name,
    onvaluechange,
    onvaluecommit,
    ref = $bindable(null),
    class: className,
    'aria-describedby': describedBy,
    onkeydown,
    ...rest
  }: SliderProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  // Fail identically on the server and in the browser rather than render a slider without a name.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('Slider requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const isDisabled = $derived(disabled || !!field?.disabled);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  // Bounds and steps. The steps are counted from min and max is always one of them, even when the range is not a
  // multiple of step (Bits UI's own steps would leave it out); values are rounded to the step's decimals.
  const lo = $derived(Number.isFinite(min) ? min : defaults.min);
  const hi = $derived(Number.isFinite(max) && max > lo ? max : lo + 1);
  const s = $derived(Number.isFinite(step) && step > 0 ? step : defaults.step);
  const decimals = (n: number) => (Number.isInteger(n) ? 0 : (String(n).split('.')[1]?.length ?? 0));
  const precision = $derived(Math.max(decimals(s), decimals(lo), decimals(hi)));
  const round = (n: number) => Number(n.toFixed(Math.min(precision, 15)));
  const steps = $derived.by(() => {
    const list: number[] = [];
    const count = Math.floor(round((hi - lo) / s) + 1e-9);
    for (let i = 0; i <= count; i++) list.push(round(lo + i * s));
    if (list[list.length - 1] !== hi) list.push(hi);
    return list;
  });
  /** The value shown: within min and max, at the nearest step (max included). The application's value is kept. */
  const snap = (v: number) => {
    if (!Number.isFinite(v) || v <= lo) return lo;
    if (v >= hi) return hi;
    const k = Math.round((v - lo) / s);
    const below = Math.min(round(lo + k * s), hi);
    return Math.abs(hi - v) < Math.abs(below - v) ? hi : below;
  };
  const shown = $derived(snap(value));
  const fraction = $derived((shown - lo) / (hi - lo));

  const format = $derived.by(() => {
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals(s) });
    } catch {
      return new Intl.NumberFormat('en', { maximumFractionDigits: decimals(s) });
    }
  });
  const valueText = $derived(format.format(shown));

  // Right to left: the server renders the reading direction through logical CSS; Bits UI maps the pointer with the
  // direction measured once mounted.
  let direction = $state<'ltr' | 'rtl'>('ltr');
  let root = $state<HTMLElement | null>(null);
  $effect(() => {
    if (root) direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
  });

  // valueCommit ends a change the user made: it follows at least one valueChange since the last commit.
  let changed = false;
  function handleChange(next: number) {
    if (next === shown) return;
    changed = true;
    value = next;
    onvaluechange?.(next);
  }
  function handleCommit(next: number) {
    if (!changed) return;
    changed = false;
    onvaluecommit?.(next);
  }

  // Page Up and Page Down change by ten steps (Bits UI handles the arrows, Home and End). The consumer's handler runs
  // first, then this one; Bits UI's runs last unless the event was handled.
  function handleKeydown(event: KeyboardEvent) {
    (onkeydown as ((e: KeyboardEvent) => void) | undefined)?.(event);
    if (event.defaultPrevented || isDisabled) return;
    if (event.key !== 'PageUp' && event.key !== 'PageDown') return;
    event.preventDefault();
    const index = steps.indexOf(shown);
    const next = steps[Math.max(0, Math.min(steps.length - 1, index + (event.key === 'PageUp' ? 10 : -10)))];
    handleChange(next);
    handleCommit(next);
  }

  // A drag moves without transition; a press on the track or a key moves with one.
  let dragging = $state(false);
  let pressed = false;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (pointer tracking only; the thumb is the control) -->
<div
  class={['ggb-slider', className]}
  data-disabled={isDisabled ? '' : undefined}
  data-dragging={dragging ? '' : undefined}
  data-show-value={showValue ? '' : undefined}
  style:--_fraction={fraction}
  onpointerdown={() => (pressed = true)}
  onpointermove={(event) => {
    if (pressed && event.buttons) dragging = true;
  }}
  onpointerup={() => ((pressed = false), (dragging = false))}
  onpointercancel={() => ((pressed = false), (dragging = false))}
  onlostpointercapture={() => ((pressed = false), (dragging = false))}
>
  <Slider.Root
    bind:ref={root}
    type="single"
    value={shown}
    onValueChange={handleChange}
    onValueCommit={handleCommit}
    min={lo}
    max={hi}
    step={steps}
    dir={direction}
    disabled={isDisabled}
    thumbPositioning="exact"
    class="ggb-slider__control"
  >
    <span class="ggb-slider__track" aria-hidden="true"
      ><Slider.Range
        >{#snippet child({ props })}<span {...props} style={undefined} class="ggb-slider__range"
          ></span>{/snippet}</Slider.Range
      ></span
    >
    <Slider.Thumb index={0} {...rest as Record<string, unknown>} onkeydown={handleKeydown}>
      {#snippet child({ props })}
        <span
          {...props}
          bind:this={ref}
          style={undefined}
          class="ggb-slider__thumb"
          aria-label={accessibleName}
          aria-labelledby={field?.labelId}
          aria-describedby={describedByIds}
          aria-valuetext={valueText}
        ></span>
      {/snippet}
    </Slider.Thumb>
  </Slider.Root>
  {#if showValue}
    <span class="ggb-slider__value" aria-hidden="true">
      <span class="ggb-slider__value-text">{valueText}</span>
      <span class="ggb-slider__value-sizer">{format.format(lo)}</span>
      <span class="ggb-slider__value-sizer">{format.format(hi)}</span>
    </span>
  {/if}
  {#if name}
    <input type="hidden" {name} value={String(shown)} disabled={isDisabled} />
  {/if}
</div>
