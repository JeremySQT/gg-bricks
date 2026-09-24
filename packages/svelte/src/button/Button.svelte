<script lang="ts">
  import { Button as Primitive } from 'bits-ui';
  import type { ButtonProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './button.css';
  import './tokens.generated.css';

  let {
    label, intent = defaults.intent, appearance = defaults.appearance, size = defaults.size,
    disabled = defaults.disabled, loading = defaults.loading, leading, trailing,
    href, type = 'button', ref = $bindable(null), class: className = '', onclick,
    'aria-label': accessibleLabel, ...rest
  }: ButtonProps = $props();

  const blocked = $derived(Boolean(disabled || loading));
  const element = $derived(href
    ? { href, disabled: blocked }
    : { type, disabled });

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
    if (blocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    onclick?.(event);
  }

  // Fail equally in SSR and the browser instead of producing an unnamed control.
  function checkedLabel(value: string) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Button requires a non-empty label.');
    return value;
  }

  // Destructuring loses the href/native-attribute correlation in TypeScript.
  // Reassemble the same discriminated Bits UI props at this adapter boundary.
  const primitiveProps = $derived({
    ...rest, ...element,
    class: `ds-button ${className}`,
    'data-intent': intent, 'data-appearance': appearance, 'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'aria-label': accessibleLabel ?? checkedLabel(label),
    'aria-busy': loading || undefined,
    'aria-disabled': blocked || undefined,
    tabindex: disabled ? -1 : (rest.tabindex ?? 0),
    onclick: handleClick
  } as Primitive.RootProps);
</script>

<Primitive.Root {...primitiveProps} bind:ref>
  <span class="ds-button__surface">
    <span class="ds-button__content" aria-hidden="true">
      {#if leading}<span class="ds-button__slot ds-button__leading">{@render leading()}</span>{/if}
      <span class="ds-button__label">{checkedLabel(label)}</span>
      {#if trailing}<span class="ds-button__slot ds-button__trailing">{@render trailing()}</span>{/if}
    </span>
    {#if loading}
      <span class="ds-button__loader" aria-hidden="true">
        <svg class="ds-button__spinner" viewBox="0 0 20 20" fill="none" focusable="false">
          <path d="M 18 10 C 18 14.42 14.42 18 10 18 C 5.58 18 2 14.42 2 10 C 2 5.58 5.58 2 10 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
    {/if}
  </span>
</Primitive.Root>
