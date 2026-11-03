<script lang="ts">
  // Icon implementation review: every size, decorative versus labelled icons, inline with text, inside
  // Button slots (the host sizes the icon), another grid through viewBox, color inheritance and layout
  // behavior, in any brand, appearance and density.
  import { Button, Icon } from '../../packages/svelte/src/index.ts';
  import type { ButtonSize, IconSize } from '../../packages/svelte/src/index.ts';
  import { phosphor, names, squareOn24 } from './glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showBoxes = $state(false);

  // Playground
  let name = $state('plus');
  let size = $state<IconSize>('md');
  let label = $state('');
</script>

{#snippet glyph(id: string)}<path d={phosphor[id]} />{/snippet}
{#snippet plus()}<Icon>{@render glyph('plus')}</Icon>{/snippet}
{#snippet arrow()}<Icon size="xs">{@render glyph('arrow-right')}</Icon>{/snippet}

<div
  class="page"
  class:show-boxes={showBoxes}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header class="hero">
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Icon</h1>
    <p class="lede">
      Displays a glyph from the application's icon set at a system size, in the current text color. The glyphs below are
      Phosphor Icons, the reference set; ggbrick bundles none.
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
      <label class="check"><input id="ctx-boxes" type="checkbox" bind:checked={showBoxes} /> Show icon boxes</label>
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        <Icon id="play-icon" {size} label={label.trim() || undefined}>{@render glyph(name)}</Icon>
        <p class="readout" data-testid="readout">
          {size} · {label.trim() ? `image "${label.trim()}"` : 'decorative (hidden from assistive technology)'}
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Glyph <select id="opt-name" bind:value={name}
            >{#each names as n (n)}<option value={n}>{n}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as s (s)}<option value={s}>{s}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" bind:value={label} placeholder="empty: decorative" /></label>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes</h2>
    <p>Five sizes from size.icon (12, 16, 20, 24, 32 px); they do not change with density.</p>
    <div class="matrix">
      <span></span>
      {#each sizes as s (s)}<span class="col-head">{s}</span>{/each}
      {#each names as n (n)}
        <span class="row-head">{n}</span>
        {#each sizes as s (s)}
          <div class="cell"><Icon id={`size-${n}-${s}`} size={s}>{@render glyph(n)}</Icon></div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="semantics" aria-labelledby="semantics-title">
    <h2 id="semantics-title">Decorative or named</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Decorative, next to text</p>
        <p>The icon repeats the text and is hidden from assistive technology.</p>
        <ul class="list">
          <li><Icon id="deco-1" size="sm">{@render glyph('check')}</Icon> Changes saved</li>
          <li><Icon id="deco-2" size="sm">{@render glyph('download-simple')}</Icon> Download the report</li>
          <li><Icon id="deco-3" size="sm">{@render glyph('trash')}</Icon> Move to trash</li>
        </ul>
      </div>
      <div class="panel">
        <p class="panel-title">Named, carrying meaning</p>
        <p>The icon is the only cue; its label is its accessible name.</p>
        <table class="table">
          <tbody>
            <tr>
              <td>Invoice 2041</td>
              <td><Icon id="named-1" size="sm" label="Paid">{@render glyph('check')}</Icon></td>
            </tr>
            <tr>
              <td>Invoice 2042</td>
              <td><Icon id="named-2" size="sm" label="Attention needed">{@render glyph('warning-circle')}</Icon></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <p class="panel-title">Inline with every text size</p>
        <p class="inline body-lg"><Icon size="md">{@render glyph('plus')}</Icon> Body large, icon md</p>
        <p class="inline body-md"><Icon size="sm">{@render glyph('plus')}</Icon> Body medium, icon sm</p>
        <p class="inline caption"><Icon size="xs">{@render glyph('plus')}</Icon> Caption, icon xs</p>
        <p class="inline heading"><Icon size="lg">{@render glyph('plus')}</Icon> Heading, icon lg</p>
      </div>
    </div>
  </section>

  <section id="hosts" aria-labelledby="hosts-title">
    <h2 id="hosts-title">Inside a Button</h2>
    <p>The button sizes its slot icons; the icon's own size option is ignored there.</p>
    <div class="row wrap">
      {#each buttonSizes as s (s)}
        <Button id={`button-${s}`} size={s} label={`Add ${s}`} leading={plus} />
      {/each}
      <Button id="button-trailing" size="md" label="Continue" appearance="outline" intent="neutral" trailing={arrow} />
      <Button id="button-ghost" size="md" label="Delete" appearance="ghost" intent="danger" leading={plus} />
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Another grid</p>
        <p>
          A glyph drawn on a 24-unit grid (a square from 3 to 21), through the viewBox option: the grid maps to the box.
        </p>
        <div class="row">
          <Icon id="grid-24" size="lg" viewBox="0 0 24 24"><path d={squareOn24} /></Icon>
          <Icon id="grid-256" size="lg">{@render glyph('plus')}</Icon>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Color follows the container</p>
        <div class="row">
          <span class="tinted danger"><Icon id="color-danger" size="md">{@render glyph('trash')}</Icon> Danger</span>
          <span class="tinted success"><Icon id="color-success" size="md">{@render glyph('check')}</Icon> Success</span>
          <span class="tinted tertiary"
            ><Icon id="color-tertiary" size="md">{@render glyph('plus')}</Icon> Tertiary</span
          >
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Never shrinks, never stretches</p>
        <div class="squeeze">
          <Icon id="squeezed" size="lg">{@render glyph('warning-circle')}</Icon>
          <span>A long piece of text that pushes against the icon in a narrow flex row without wrapping it</span>
        </div>
      </div>
      <div class="panel" data-ggb-appearance={mode === 'light' ? 'dark' : 'light'}>
        <p class="panel-title">Nested opposite mode</p>
        <div class="row">
          {#each sizes as s (s)}<Icon size={s}>{@render glyph('check')}</Icon>{/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  :global(*) {
    box-sizing: border-box;
  }
  .page {
    min-height: 100vh;
    padding: var(--ggb-space-layout-xl) var(--ggb-space-layout-lg);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  section,
  header {
    max-width: 1200px;
    margin: 0 auto var(--ggb-space-layout-xl);
  }
  h1 {
    font: var(--ggb-typography-display-md);
    letter-spacing: var(--ggb-typography-display-md-letterSpacing);
    margin: var(--ggb-space-content-sm) 0;
  }
  h2 {
    font: var(--ggb-typography-heading-lg);
    letter-spacing: var(--ggb-typography-heading-lg-letterSpacing);
    margin: 0 0 var(--ggb-space-content-sm);
    padding-top: var(--ggb-space-layout-md);
    border-top: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  p {
    color: var(--ggb-color-content-secondary);
    margin: 0 0 var(--ggb-space-content-lg);
    max-width: 72ch;
  }
  .lede {
    font: var(--ggb-typography-body-lg);
  }
  .eyebrow,
  .panel-title,
  .col-head,
  .row-head,
  legend {
    font: var(--ggb-typography-label-sm);
    letter-spacing: var(--ggb-typography-label-sm-letterSpacing);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  .controls,
  .options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-md) var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    margin: 0;
    background: var(--ggb-color-surface-subtle);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .controls label,
  .options label {
    display: flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  select,
  input:not([type]) {
    font: inherit;
    color: var(--ggb-color-input-default-content);
    background: var(--ggb-color-input-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-input-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
  }
  select:focus-visible,
  input:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  input[type='checkbox'] {
    accent-color: var(--ggb-color-action-accent-solid-default-surface);
  }
  .playground {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 22rem);
    gap: var(--ggb-space-layout-sm);
  }
  .stage {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
    gap: var(--ggb-space-content-lg);
    min-block-size: 14rem;
    padding: var(--ggb-space-layout-md);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .readout {
    flex-basis: 100%;
    text-align: center;
    margin: 0;
    font: var(--ggb-typography-label-sm);
  }
  .options {
    flex-direction: column;
    align-items: stretch;
  }
  .options label {
    justify-content: space-between;
  }
  .matrix {
    display: grid;
    grid-template-columns: max-content repeat(5, minmax(0, 1fr));
    align-items: center;
    justify-items: start;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .col-head,
  .row-head {
    margin: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: var(--ggb-space-layout-sm);
  }
  .panel {
    margin: 0;
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-md);
  }
  .list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--ggb-space-content-sm);
  }
  .list li {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
  }
  .table {
    border-collapse: collapse;
  }
  .table td {
    padding: var(--ggb-space-content-xs) var(--ggb-space-content-md) var(--ggb-space-content-xs) 0;
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .inline {
    color: var(--ggb-color-content-primary);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  .body-lg {
    font: var(--ggb-typography-body-lg);
  }
  .body-md {
    font: var(--ggb-typography-body-md);
  }
  .caption {
    font: var(--ggb-typography-caption-md);
  }
  .heading {
    font: var(--ggb-typography-heading-md);
  }
  .tinted {
    display: inline-flex;
    align-items: center;
    gap: var(--ggb-space-content-xs);
    font: var(--ggb-typography-label-md);
  }
  .danger {
    color: var(--ggb-color-status-danger-content);
  }
  .success {
    color: var(--ggb-color-status-success-content);
  }
  .tertiary {
    color: var(--ggb-color-content-tertiary);
  }
  .squeeze {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    inline-size: 14rem;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-caption-md);
  }
  .show-boxes :global(.ggb-icon) {
    outline: 1px dashed var(--ggb-color-border-strong);
  }
  @media (max-width: 720px) {
    .page {
      padding: var(--ggb-space-layout-md) var(--ggb-space-layout-sm);
    }
    .playground {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
