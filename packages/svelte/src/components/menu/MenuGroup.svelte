<script lang="ts">
  import type { MenuGroupProps } from './types.js';
  import './tokens.generated.css';
  import './menu.css';

  let { label, children, class: className, ...rest }: MenuGroupProps = $props();

  const uid = $props.id();
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('MenuGroup requires a non-empty label.');
    return label;
  });
</script>

<div {...rest} class={['ggb-menu__group', className]} role="group" aria-labelledby={`${uid}-heading`}>
  <div class="ggb-menu__group-heading" id={`${uid}-heading`} role="presentation">{name}</div>
  {@render children()}
</div>
