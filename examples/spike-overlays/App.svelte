<script lang="ts">
  // Overlay spike (decision of 2026-10-31): popovers and dialogs in the browser top layer, opened from themed
  // subtrees, nested, inside clipping containers, with CSS anchor positioning and its measured fallback.
  import { Button } from '../../packages/svelte/src/index.ts';
  import { supportsAnchorPositioning } from '../../packages/svelte/src/lib/overlay/index.ts';
  import { positioning } from './positioning.ts';
  import Popover from './Popover.svelte';
  import Dialog from './Dialog.svelte';
  import BitsPopover from './BitsPopover.svelte';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  const anchorNative = positioning === 'auto' && supportsAnchorPositioning();
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = $state('inbox');
  const items = ['inbox', 'drafts', 'archive'];
</script>

{#snippet list()}
  <div role="listbox" aria-label="Folders">
    {#each items as item (item)}
      <div
        class="spike-item"
        role="option"
        tabindex="0"
        aria-selected={selected === item}
        onclick={() => (selected = item)}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selected = item)}
      >
        {item}
      </div>
    {/each}
  </div>
{/snippet}

<main data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header class="toolbar">
    <h1>Overlay spike</h1>
    <label
      >Brand <select bind:value={brand} id="ctx-brand"
        >{#each brands as b (b)}<option>{b}</option>{/each}</select
      ></label
    >
    <label
      >Appearance <select bind:value={mode} id="ctx-mode"
        >{#each modes as m (m)}<option>{m}</option>{/each}</select
      ></label
    >
    <label
      >Density <select bind:value={density} id="ctx-density"
        >{#each densities as d (d)}<option>{d}</option>{/each}</select
      ></label
    >
    <span class="tag" data-testid="positioning"
      >anchor positioning: {anchorNative ? 'native (CSS)' : 'measured (JS fallback)'}</span
    >
    <span class="tag">reduced motion: {reduced ? 'on' : 'off'}</span>
  </header>

  <section id="root">
    <h2>1. From the page (root context)</h2>
    <p>
      Native <code>popover="auto"</code> and <code>&lt;dialog&gt;.showModal()</code>. Escape and a press outside close
      them.
    </p>
    <div class="row">
      <Popover id="pop-root" label="Open popover" title="Folders">{@render list()}</Popover>
      <Dialog id="dlg-root" label="Open dialog" title="Archive 12 conversations?">
        <p>They move to the archive and leave the inbox. You can bring them back at any time.</p>
        <div class="row">
          <Popover id="pop-in-dialog" label="Choose a folder" title="Folders">{@render list()}</Popover>
        </div>
      </Dialog>
    </div>
  </section>

  <section id="dark">
    <h2>2. From a dark subtree</h2>
    <div class="panel" data-ggb-appearance="dark" data-testid="dark-panel">
      <p>This panel sets <code>data-ggb-appearance="dark"</code>. The overlays it opens must be dark too.</p>
      <div class="row">
        <Popover id="pop-dark" label="Open popover" title="Folders">{@render list()}</Popover>
        <Dialog id="dlg-dark" label="Open dialog" title="Delete the draft?">
          <p>The draft is deleted for good.</p>
        </Dialog>
        <BitsPopover id="pop-bits-dark" label="Bits UI popover" title="Folders (Bits UI)">{@render list()}</BitsPopover>
      </div>
    </div>
  </section>

  <section id="brand">
    <h2>3. From another brand and density</h2>
    <div class="panel" data-ggb-brand="brick" data-ggb-appearance="light" data-ggb-density="compact">
      <p>This panel is <code>brick</code>, light, compact (a brand switch restates the two other axes).</p>
      <div class="row">
        <Popover id="pop-brick" label="Open popover" title="Folders">
          {@render list()}
          <Button label="Brick accent" size="sm" />
        </Popover>
        <Dialog id="dlg-brick" label="Open dialog" title="Rename the folder?">
          <p>The new name applies everywhere.</p>
        </Dialog>
      </div>
    </div>
  </section>

  <section id="clipping">
    <h2>4. Inside a clipping, transformed, scrolling container</h2>
    <p>
      The container has <code>overflow: hidden</code>, a <code>transform</code> and scrolls. A portal-free overlay must still
      escape it.
    </p>
    <div class="clip" data-testid="clip">
      <div class="clip-inner">
        <p>Scroll me. The trigger sits near the container's bottom edge.</p>
        <div class="spacer"></div>
        <Popover id="pop-clipped" label="Open popover" title="Folders">{@render list()}</Popover>
        <div class="spacer"></div>
      </div>
    </div>
  </section>

  <section id="placement">
    <h2>5. Sides and alignments</h2>
    <div class="row wrap">
      {#each ['bottom', 'top'] as side (side)}
        {#each ['start', 'center', 'end'] as align (align)}
          <Popover
            id={`pop-${side}-${align}`}
            label={`${side} ${align}`}
            title={`${side} ${align}`}
            side={side as 'top' | 'bottom'}
            align={align as 'start' | 'center' | 'end'}
          >
            <p>Placed {side}, aligned {align}; flips when the viewport is short.</p>
          </Popover>
        {/each}
      {/each}
    </div>
    <div class="bottom-edge">
      <Popover id="pop-flip" label="Near the viewport bottom (flips up)" title="Flipped">
        <p>Preferred side bottom, flipped to top because the viewport ends here.</p>
      </Popover>
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
  }
  main {
    min-block-size: 100vh;
    padding: var(--ggb-space-layout-md);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  h1 {
    margin: 0;
    font: var(--ggb-typography-heading-md);
  }
  h2 {
    font: var(--ggb-typography-heading-sm);
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-md);
    align-items: center;
    margin-block-end: var(--ggb-space-layout-md);
  }
  .toolbar label {
    display: flex;
    gap: var(--ggb-space-content-xs);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  .tag {
    padding: 2px var(--ggb-space-content-sm);
    border-radius: var(--ggb-radius-full);
    background: var(--ggb-color-surface-subtle);
    font: var(--ggb-typography-code-sm);
  }
  section {
    margin-block-end: var(--ggb-space-layout-lg);
  }
  .row {
    display: flex;
    gap: var(--ggb-space-control-gap-md);
    align-items: center;
  }
  .row.wrap {
    flex-wrap: wrap;
  }
  .panel {
    padding: var(--ggb-space-layout-sm);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    color: var(--ggb-color-content-primary);
  }
  .clip {
    inline-size: 24rem;
    block-size: 10rem;
    overflow: hidden;
    transform: translateZ(0);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-strong);
    border-radius: var(--ggb-radius-container);
  }
  .clip-inner {
    block-size: 100%;
    overflow: auto;
    padding: var(--ggb-space-content-md);
  }
  .spacer {
    block-size: 4rem;
  }
  .bottom-edge {
    margin-block-start: 60vh;
  }
</style>
