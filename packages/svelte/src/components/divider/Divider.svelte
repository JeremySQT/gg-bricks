<script lang="ts">
  import { Separator } from 'bits-ui';
  import type { DividerProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './divider.css';

  let {
    orientation = defaults.orientation,
    label,
    decorative = defaults.decorative,
    ref = $bindable(null),
    class: className,
    ...rest
  }: DividerProps = $props();

  // A label is shown on a horizontal divider only; it names the separator for assistive technology.
  const text = $derived(orientation === 'horizontal' && typeof label === 'string' && label.trim() ? label.trim() : '');
</script>

<Separator.Root bind:ref {orientation} {decorative}>
  {#snippet child({ props })}
    <div
      {...props}
      {...rest}
      class={['ggb-divider', className]}
      data-orientation={orientation}
      data-labelled={text ? '' : undefined}
      aria-label={text && !decorative ? text : undefined}
    >
      {#if text}<span class="ggb-divider__label" aria-hidden="true">{text}</span>{/if}
    </div>
  {/snippet}
</Separator.Root>
