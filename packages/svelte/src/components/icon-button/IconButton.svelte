<script lang="ts">
  import { getContext } from 'svelte';
  import { Button as Primitive } from 'bits-ui';
  import Spinner from '../spinner/Spinner.svelte';
  import type { IconButtonProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './icon-button.css';

  let {
    label,
    icon,
    intent = defaults.intent,
    appearance = defaults.appearance,
    size: ownSize = defaults.size,
    disabled = defaults.disabled,
    loading = defaults.loading,
    href,
    type = 'button',
    onactivate,
    ref = $bindable(null),
    class: className,
    ...rest
  }: IconButtonProps = $props();

  // Inside a ButtonGroup the group's size applies to every item (context key `ggb:button-group`, a string so that the
  // folders stay independent; the shape is declared again here) and the item's own size is ignored.
  const group = getContext<{ readonly size: typeof ownSize } | undefined>('ggb:button-group');
  const size = $derived(group ? group.size : ownSize);

  // Fail identically on the server and in the browser rather than render a control without a name.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('IconButton requires a non-empty label.');
    return label;
  });

  // Contract precedence: disabled wins over loading; both block activation and navigation.
  const blocked = $derived(disabled || loading);

  type Handler = (event: MouseEvent) => void;
  const handlers = $derived(rest as { onclick?: Handler; onauxclick?: Handler });

  function handleClick(event: MouseEvent) {
    if (blocked) {
      // Cancels navigation and form submission; loading keeps focus, so keyboard presses land here.
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    handlers.onclick?.(event);
    onactivate?.(event);
  }

  // A middle click on a link opens it in a new tab through auxclick, not click: a loading link keeps
  // its href (to stay focusable), so that path is guarded too. Disabled links have no href.
  function handleAuxclick(event: MouseEvent) {
    if (blocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    handlers.onauxclick?.(event);
  }

  // Bits UI renders <a> when href is set and <button> otherwise. Disabled removes the href, the
  // native focus and activation; loading keeps them and is guarded in handleClick. The label is the
  // accessible name through aria-label: the element has no visible text.
  const primitiveProps = $derived({
    ...rest,
    ...(href === undefined ? { type, disabled } : { href, disabled }),
    class: ['ggb-icon-button', className],
    'aria-label': name,
    'data-intent': intent,
    'data-appearance': appearance,
    'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'aria-busy': loading && !disabled ? 'true' : undefined,
    'aria-disabled': blocked ? 'true' : undefined,
    onclick: handleClick,
    onauxclick: handleAuxclick
  } as Primitive.RootProps);
</script>

<Primitive.Root {...primitiveProps} bind:ref>
  <span class="ggb-icon-button__container">
    {#if loading}
      <span class="ggb-icon-button__loadingIndicator" aria-hidden="true">
        <Spinner {size} />
      </span>
    {:else}
      <span class="ggb-icon-button__icon" aria-hidden="true">{@render icon()}</span>
    {/if}
  </span>
</Primitive.Root>
