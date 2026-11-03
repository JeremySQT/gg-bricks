<script lang="ts">
  // Popover implementation review: a filters panel with a form, sides and alignments, a nested popover, a popover
  // in a dark subtree and in a clipped container, focus on opening and on closing, in any context.
  import {
    Button,
    ButtonGroup,
    Checkbox,
    Field,
    Icon,
    IconButton,
    InputText,
    Popover
  } from '../../packages/svelte/src/index.ts';
  import type { PopoverAlign, PopoverSide } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';
  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let side = $state<PopoverSide>('bottom');
  let align = $state<PopoverAlign>('start');
  let open = $state(false);
  let changes = $state(0);
  let name = $state('Quarterly report');
  let applied = $state(0);
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Popover</h1>
    <p class="lede">
      A non-modal panel anchored to its trigger, for content the user works with: filters, a short form, details. The
      page stays usable; Escape, a press outside or leaving with Tab closes it. Every control below is the real Svelte
      component on the approved tokens.
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
        <Popover id="filters" label="Filters" {side} {align} bind:open onopenchange={() => changes++}>
          {#snippet trigger(props)}<Button label="Filters" intent="neutral" appearance="outline" {...props} />{/snippet}
          <div class="form">
            <strong class="heading">Filters</strong>
            <Checkbox id="f-open" label="Open issues" checked />
            <Checkbox id="f-mine" label="Assigned to me" />
            <ButtonGroup align="end" size="sm">
              <Button
                id="f-apply"
                label="Apply"
                onactivate={() => {
                  applied++;
                  open = false;
                }}
              />
            </ButtonGroup>
          </div>
        </Popover>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="open">Open: {open}</span> · <span data-testid="changes">Changes: {changes}</span> ·
          <span data-testid="applied">Applied: {applied}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Side <select id="opt-side" bind:value={side}
            >{#each ['bottom', 'top'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Align <select id="opt-align" bind:value={align}
            >{#each ['start', 'center', 'end'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <button type="button" id="opt-open" onclick={() => (open = !open)}>Toggle (application)</button>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Rename: a short form, a nested popover</p>
        <Popover id="rename" label="Rename the report">
          {#snippet trigger(props)}<IconButton label="Rename" intent="neutral" appearance="outline" {...props}
              >{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton
            >{/snippet}
          <div class="form">
            <Field label="Name"><InputText id="rename-input" bind:value={name} /></Field>
            <Popover id="nested" label="Naming rules" side="top">
              {#snippet trigger(props)}<Button
                  label="Naming rules"
                  size="sm"
                  intent="neutral"
                  appearance="ghost"
                  {...props}
                />{/snippet}
              <p class="note">Up to 80 characters; no slash.</p>
            </Popover>
          </div>
        </Popover>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a dark subtree and a clipped container</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <div class="clip">
            <Popover id="dark" label="Details">
              {#snippet trigger(props)}<Button
                  label="Details"
                  intent="neutral"
                  appearance="outline"
                  {...props}
                />{/snippet}
              <p class="note">Inherits the dark appearance and escapes the clipping container.</p>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#snippet iconFor(name: string)}{@render icon(name)}{/snippet}
</div>

<style>
  .dark-panel {
    padding: var(--ggb-space-content-lg);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  .clip {
    block-size: 6rem;
    overflow: hidden;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-sm);
    min-inline-size: 14rem;
  }
  .heading {
    font: var(--ggb-typography-label-md);
  }
  .note {
    margin: 0;
    max-inline-size: 18rem;
  }
</style>
