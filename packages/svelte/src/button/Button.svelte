<script lang="ts">
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
    <span class="ggb-button__label">{name}</span>
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
