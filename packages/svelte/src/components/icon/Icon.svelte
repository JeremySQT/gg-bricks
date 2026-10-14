<script lang="ts">
  import type { IconProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './icon.css';

  let {
    size = defaults.size,
    label,
    viewBox = '0 0 256 256',
    children,
    class: className,
    ...rest
  }: IconProps = $props();

  // A label makes the icon an image with that name; without one it is decorative and hidden.
  const named = $derived(typeof label === 'string' && label.trim().length > 0);
</script>

<!--
  The svg is the root element on purpose: a host that sizes its slot content (the Button's leading and
  trailing slots select "> svg") sizes and offsets the icon exactly as it does a raw glyph.
-->
<svg
  {...rest}
  class={['ggb-icon', className]}
  data-size={size}
  {viewBox}
  fill="currentColor"
  focusable="false"
  role={named ? 'img' : undefined}
  aria-label={named ? label : undefined}
  aria-hidden={named ? undefined : 'true'}
>
  {@render children?.()}
</svg>
