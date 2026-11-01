<script lang="ts">
  // Spike prototype: a modal dialog in the top layer (native <dialog>.showModal()), themed by its DOM subtree.
  import type { Snippet } from 'svelte';
  import { Button } from '../../packages/svelte/src/index.ts';
  import { modal } from '../../packages/svelte/src/lib/overlay/index.ts';
  import '../../packages/svelte/src/lib/overlay/overlay.css';
  import './spike.css';

  let { label, title, id, children }: { label: string; title: string; id: string; children: Snippet } = $props();
  let open = $state(false);
</script>

<Button {label} id={`${id}-trigger`} onactivate={() => (open = true)} />
<dialog
  {id}
  class="ggb-overlay spike-dialog"
  aria-labelledby={`${id}-title`}
  data-testid={id}
  {@attach modal({ open: () => open, onOpenChange: (o) => (open = o) })}
>
  <h2 id={`${id}-title`}>{title}</h2>
  {@render children()}
  <div class="spike-actions">
    <Button label="Cancel" intent="neutral" appearance="ghost" onactivate={() => (open = false)} />
    <Button label="Confirm" onactivate={() => (open = false)} />
  </div>
</dialog>
