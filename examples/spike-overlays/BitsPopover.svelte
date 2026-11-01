<script lang="ts">
  // Spike prototype: Bits UI Popover (roles, focus and dismissal layers) with its portal left out and its static
  // content placed in the top layer by the ggbrick attachment in manual mode. Checks that the two coexist.
  import type { Snippet } from 'svelte';
  import { Popover } from 'bits-ui';
  import { Button } from '../../packages/svelte/src/index.ts';
  import { floating } from '../../packages/svelte/src/lib/overlay/index.ts';
  import { positioning } from './positioning.ts';
  import '../../packages/svelte/src/lib/overlay/overlay.css';
  import './spike.css';

  let { label, title, id, children }: { label: string; title: string; id: string; children: Snippet } = $props();
  let open = $state(false);
  let trigger = $state<HTMLElement | null>(null);
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={trigger}>
    {#snippet child({ props })}
      <Button {...props} {label} intent="neutral" appearance="outline" id={`${id}-trigger`} />
    {/snippet}
  </Popover.Trigger>
  <Popover.ContentStatic
    {id}
    class="ggb-overlay spike-popover"
    popover="manual"
    aria-label={title}
    data-testid={id}
    {@attach floating({
      anchor: () => trigger,
      open: () => open,
      onOpenChange: (o) => (open = o),
      mode: 'manual',
      positioning
    })}
  >
    <strong>{title}</strong>
    {@render children()}
    <div class="spike-actions">
      <Popover.Close>
        {#snippet child({ props })}
          <Button {...props} label="Close" size="sm" intent="neutral" appearance="ghost" />
        {/snippet}
      </Popover.Close>
    </div>
  </Popover.ContentStatic>
</Popover.Root>
