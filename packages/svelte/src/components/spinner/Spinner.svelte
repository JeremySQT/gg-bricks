<script lang="ts">
  import type { SpinnerProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './spinner.css';

  let {
    size = defaults.size,
    label = defaults.label,
    ref = $bindable(null),
    class: className,
    ...rest
  }: SpinnerProps = $props();

  const name = $derived(typeof label === 'string' ? label.trim() : '');
</script>

<span
  {...rest}
  bind:this={ref}
  class={['ggb-spinner', className]}
  data-size={size}
  role={name ? 'status' : undefined}
  aria-label={name || undefined}
  aria-hidden={name ? undefined : 'true'}
>
  <!-- The drawing of the Button loading indicator: a ring of radius 9 in a 24-unit box, stroke 2.5 (1/9 of the size). -->
  <svg class="ggb-spinner__svg" viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true">
    <circle class="ggb-spinner__track" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" />
    <path
      class="ggb-spinner__indicator"
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
    />
  </svg>
  {#if name}<span class="ggb-spinner__label">{name}</span>{/if}
</span>
