<script lang="ts">
  // Spike prototype: an anchored popover in the top layer (native `popover="auto"`), themed by its DOM subtree.
  import type { Snippet } from 'svelte';
  import { Button } from '../../packages/svelte/src/index.ts';
  import { floating, type Align, type Side } from '../../packages/svelte/src/lib/overlay/index.ts';
  import { positioning } from './positioning.ts';
  import '../../packages/svelte/src/lib/overlay/overlay.css';
  import './spike.css';

  let {
    label,
    title,
    side = 'bottom',
    align = 'start',
    id,
    children
  }: { label: string; title: string; side?: Side; align?: Align; id: string; children: Snippet } = $props();
  let open = $state(false);
  let trigger = $state<HTMLElement | null>(null);
</script>

<Button
  {label}
  intent="neutral"
  appearance="outline"
  id={`${id}-trigger`}
  aria-expanded={open}
  aria-controls={id}
  bind:ref={trigger}
  onactivate={() => (open = !open)}
/>
<div
  {id}
  class="ggb-overlay spike-popover"
  popover="auto"
  role="dialog"
  aria-label={title}
  data-testid={id}
  {@attach floating({
    anchor: () => trigger,
    open: () => open,
    onOpenChange: (o) => (open = o),
    side,
    align,
    positioning
  })}
>
  <strong>{title}</strong>
  {@render children()}
  <div class="spike-actions">
    <Button label="Close" size="sm" intent="neutral" appearance="ghost" onactivate={() => (open = false)} />
  </div>
</div>
