<script lang="ts">
  // Tooltip implementation review: icon buttons named and described, sides and alignments, a disabled control,
  // tooltips in a dark subtree and in a clipped container, in any brand, appearance and density.
  import { Button, Dialog, Icon, IconButton, Link, Popover, Tooltip } from '../../packages/svelte/src/index.ts';
  import type { TooltipAlign, TooltipSide } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';
  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let side = $state<TooltipSide>('top');
  let align = $state<TooltipAlign>('center');
  let open = $state(false);
  let changes = $state(0);
  let dialogOpen = $state(false);
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Tooltip</h1>
    <p class="lede">
      A short text about a control, shown on hover after a short delay and at once on keyboard focus. It describes the
      control; it never holds anything to press. Every control below is the real Svelte component on the approved
      tokens.
    </p>
    <div class="controls" role="group" aria-label="Context">
      <label
        >Brand <select id="ctx-brand" bind:value={brand}
          >{#each brands as b (b)}<option value={b}>{b}</option>{/each}</select
        ></label
      >
      <label
        >Mode <select id="ctx-mode" bind:value={mode}
          >{#each modes as m (m)}<option value={m}>{m}</option>{/each}</select
        ></label
      >
      <label
        >Density <select id="ctx-density" bind:value={density}
          >{#each densities as d (d)}<option value={d}>{d}</option>{/each}</select
        ></label
      >
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        <button type="button" id="before">Before</button>
        <Tooltip id="tip-copy" label="Copy the link" {side} {align} bind:open onopenchange={() => changes++}>
          <IconButton id="copy" label="Copy" intent="neutral" appearance="outline"
            >{#snippet icon()}{@render iconFor('copy')}{/snippet}</IconButton
          >
        </Tooltip>
        <Tooltip id="tip-edit" label="Edit">
          <IconButton id="edit" label="Edit" intent="neutral" appearance="outline"
            >{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton
          >
        </Tooltip>
        <Tooltip id="tip-save" label="Saves a copy in your drafts folder">
          <Button id="save" label="Save draft" intent="neutral" appearance="outline" />
        </Tooltip>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="open">Open: {open}</span> · <span data-testid="changes">Changes: {changes}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Side <select id="opt-side" bind:value={side}
            >{#each ['top', 'bottom'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Align <select id="opt-align" bind:value={align}
            >{#each ['start', 'center', 'end'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-open" type="checkbox" bind:checked={open} /> Open (application)</label>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">A keyboard shortcut, a link, a disabled control</p>
        <div class="row">
          <Tooltip id="tip-bold" label="Bold (Ctrl+B)">
            <IconButton id="bold" label="Bold" intent="neutral" appearance="ghost"
              >{#snippet icon()}{@render iconFor('star')}{/snippet}</IconButton
            >
          </Tooltip>
          <Tooltip id="tip-docs" label="Opens the API reference"><Link id="docs" href="#api" label="API" /></Tooltip>
          <Tooltip id="tip-disabled" label="Never shown"
            ><Button id="disabled" label="Archive" disabled intent="neutral" appearance="outline" /></Tooltip
          >
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a Popover and a Dialog: Escape closes the tooltip first</p>
        <div class="row">
          <Popover id="host-pop" label="Formatting">
            {#snippet trigger(props)}<Button
                label="Formatting"
                intent="neutral"
                appearance="outline"
                {...props}
              />{/snippet}
            <Tooltip id="tip-in-pop" label="Italic (Ctrl+I)">
              <IconButton id="in-pop" label="Italic" intent="neutral" appearance="ghost"
                >{#snippet icon()}{@render iconFor('star')}{/snippet}</IconButton
              >
            </Tooltip>
          </Popover>
          <Button
            id="host-dialog-open"
            label="Open a dialog"
            intent="neutral"
            appearance="outline"
            onactivate={() => (dialogOpen = true)}
          />
          <Dialog id="host-dialog" bind:open={dialogOpen} title="Share the report">
            <Tooltip id="tip-in-dialog" label="Copy the link">
              <IconButton id="in-dialog" label="Copy" intent="neutral" appearance="outline"
                >{#snippet icon()}{@render iconFor('info')}{/snippet}</IconButton
              >
            </Tooltip>
          </Dialog>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a dark subtree and a clipped container</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <div class="clip">
            <Tooltip id="tip-dark" label="Inherits the dark appearance and escapes the clipping" side="bottom">
              <IconButton id="dark" label="Info" intent="neutral" appearance="outline"
                >{#snippet icon()}{@render iconFor('info')}{/snippet}</IconButton
              >
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#snippet iconFor(name: string)}{@render icon(name)}{/snippet}
</div>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-md);
  }
  .dark-panel {
    padding: var(--ggb-space-content-lg);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  .clip {
    block-size: 3.5rem;
    overflow: hidden;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
</style>
