<script lang="ts">
  import { flushSync } from 'svelte';
  import { Button as Primitive } from 'bits-ui';
  import type { ButtonProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './button.css';

  let {
    label,
    intent = defaults.intent,
    appearance = defaults.appearance,
    size = defaults.size,
    disabled = defaults.disabled,
    loading = defaults.loading,
    href,
    type = 'button',
    onactivate,
    leading,
    trailing,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ButtonProps = $props();

  // Fail identically on the server and in the browser rather than render a control without a name.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Button requires a non-empty label.');
    return label;
  });

  // Contract precedence: disabled wins over loading; both block activation and navigation.
  const blocked = $derived(disabled || loading);

  function handleClick(event: MouseEvent) {
    if (blocked) {
      // Cancels navigation and form submission; loading keeps focus, so keyboard presses land here.
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    (rest as { onclick?: (event: MouseEvent) => void }).onclick?.(event);
    onactivate?.(event);
  }

  // Tight ellipsis (contract: a truncated label ends at the ellipsis). Native text-overflow drops whole
  // characters and leaves the rest of the label box empty, which pushes trailing content away from the
  // visible text, and where it cuts cannot be predicted to the pixel. So the component measures the space
  // the label may take, renders the truncated text itself (with a safety margin) and lets the box fit it;
  // the full label stays in the DOM, visually hidden, as the accessible name. Without script (or before
  // hydration) the native ellipsis applies. Re-fitted when the text, the size, the fonts or the space change.
  let labelElement = $state<HTMLSpanElement | null>(null);
  let shown = $state<string | null>(null);
  const SAFETY = 2; // px kept free so that the rendered text always fits whatever the rounding
  $effect(() => {
    const element = labelElement;
    void [name, size];
    if (!element || typeof ResizeObserver === 'undefined') return;
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return;
    let frame = 0;
    const fit = () => {
      // Measure with the whole label, as laid out natively, to learn the available width.
      shown = null;
      flushSync();
      if (element.scrollWidth <= element.clientWidth) return;
      const style = getComputedStyle(element);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const width = (text: string) => context.measureText(text).width + spacing * [...text].length;
      const available = element.clientWidth - SAFETY;
      let low = 0;
      let high = name.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (width(name.slice(0, middle) + '…') <= available) low = middle;
        else high = middle - 1;
      }
      shown = name.slice(0, low).trimEnd() + '…';
      flushSync();
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(schedule);
    const root = element.closest('.ggb-button');
    if (root) observer.observe(root);
    if (root?.parentElement) observer.observe(root.parentElement);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      shown = null;
    };
  });

  // Bits UI renders <a> when href is set and <button> otherwise. Disabled removes the href, the
  // native focus and activation; loading keeps them and is guarded in handleClick.
  // Destructuring loses the correlation between href and the native attributes in TypeScript;
  // the discriminated Bits UI props are reassembled here, at the adapter boundary.
  const primitiveProps = $derived({
    ...rest,
    ...(href === undefined ? { type, disabled } : { href, disabled }),
    class: ['ggb-button', className],
    'data-intent': intent,
    'data-appearance': appearance,
    'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'aria-busy': loading && !disabled ? 'true' : undefined,
    'aria-disabled': blocked ? 'true' : undefined,
    onclick: handleClick
  } as Primitive.RootProps);
</script>

<Primitive.Root {...primitiveProps} bind:ref>
  <span class="ggb-button__container">
    {#if leading}
      <span class="ggb-button__leading" aria-hidden="true">{@render leading()}</span>
    {/if}
    <span class="ggb-button__label" bind:this={labelElement}
      >{#if shown}<span aria-hidden="true">{shown}</span><span class="ggb-button__name">{name}</span
        >{:else}{name}{/if}</span
    >
    {#if trailing}
      <span class="ggb-button__trailing" aria-hidden="true">{@render trailing()}</span>
    {/if}
    {#if loading}
      <span class="ggb-button__loadingIndicator" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </span>
    {/if}
  </span>
</Primitive.Root>
