<script lang="ts">
  // Button implementation review: a playground with every option, the intent × appearance matrix per size,
  // slots, states, forms, links and difficult cases, in any brand, appearance and density.
  import { Button } from '../../packages/svelte/src/index.ts';
  import type { ButtonAppearance, ButtonIntent, ButtonSize } from '../../packages/svelte/src/index.ts';
  import Fixture from './Fixtures.svelte';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const intents: ButtonIntent[] = ['accent', 'neutral', 'danger'];
  const appearances: ButtonAppearance[] = ['solid', 'outline', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  const trailingKinds = ['none', 'icon', 'counter', 'shortcut'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let intent = $state<ButtonIntent>('accent');
  let appearance = $state<ButtonAppearance>('solid');
  let size = $state<ButtonSize>('md');
  let label = $state('Save changes');
  let disabled = $state(false);
  let loading = $state(false);
  let withLeading = $state(false);
  let trailing = $state<(typeof trailingKinds)[number]>('none');
  let activations = $state(0);
  let navigations = $state(0);

  // Async example
  let saving = $state(false);
  let saved = $state(0);
  function save() {
    saving = true;
    setTimeout(() => {
      saving = false;
      saved++;
    }, 1500);
  }

  // Form example
  let submissions = $state(0);
  let resets = $state(0);
  let itemName = $state('Quarterly report');

  // Constrained width
  let width = $state(220);
</script>

<!-- Slot fixtures shared by the sections below. -->
{#snippet leadingIcon()}<Fixture kind="icon" value="check" />{/snippet}
{#snippet leadingPlus()}<Fixture kind="icon" value="plus" />{/snippet}
{#snippet iconPlus()}<Fixture kind="icon" value="plus" />{/snippet}
{#snippet iconArrow()}<Fixture kind="icon" value="arrow" />{/snippet}
{#snippet iconDownload()}<Fixture kind="icon" value="download" />{/snippet}
{#snippet iconTrash()}<Fixture kind="icon" value="trash" />{/snippet}
{#snippet counter()}<Fixture kind="counter" value="8" />{/snippet}
{#snippet shortcut()}<Fixture kind="shortcut" value="⌘S" />{/snippet}
{#snippet trailingContent()}
  {#if trailing === 'icon'}<Fixture kind="icon" value="arrow" />{:else if trailing === 'counter'}<Fixture
      kind="counter"
      value="12"
    />{:else}<Fixture kind="shortcut" value="⌘S" />{/if}
{/snippet}

<svelte:window onhashchange={() => location.hash === '#new-item' && navigations++} />

<div
  class="page"
  class:show-targets={showTargets}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header class="hero">
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Button</h1>
    <p class="lede">
      Triggers an action or moves to the next step of a task. Hover, press, tab to and activate every button below: the
      rendering is the real Svelte component on the approved tokens.
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
      <label class="check"
        ><input id="ctx-targets" type="checkbox" bind:checked={showTargets} /> Show 44 px targets</label
      >
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        <Button
          id="play-action"
          label={label.trim() || 'Save changes'}
          {intent}
          {appearance}
          {size}
          {disabled}
          {loading}
          leading={withLeading ? leadingIcon : undefined}
          trailing={trailing === 'none' ? undefined : trailingContent}
          onactivate={() => activations++}
        />
        <Button
          id="play-link"
          href="#new-item"
          label="Open as link"
          {intent}
          {appearance}
          {size}
          {disabled}
          {loading}
          leading={withLeading ? leadingIcon : undefined}
          trailing={trailing === 'none' ? undefined : trailingContent}
        />
        <p class="readout" aria-live="polite">
          <span data-testid="activations">Activations: {activations}</span> ·
          <span data-testid="navigations">Navigations: {navigations}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Intent <select id="opt-intent" bind:value={intent}
            >{#each intents as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Appearance <select id="opt-appearance" bind:value={appearance}
            >{#each appearances as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" bind:value={label} /></label>
        <label
          >Trailing <select id="opt-trailing" bind:value={trailing}
            >{#each trailingKinds as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-leading" type="checkbox" bind:checked={withLeading} /> Leading icon</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-loading" type="checkbox" bind:checked={loading} /> Loading</label>
      </fieldset>
    </div>
    {#if label.trim() === ''}
      <p class="note" role="status">
        An empty label is rejected by the Button (it requires a non-empty accessible name); the playground keeps the
        previous default.
      </p>
    {/if}
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Intent × appearance</h2>
    <p>Hierarchy on one surface: solid for the main action, outline for secondary, ghost for tertiary.</p>
    {#each sizes as s (s)}
      <h3>Size {s}</h3>
      <div class="matrix">
        <span></span>
        {#each appearances as a (a)}<span class="col-head">{a}</span>{/each}
        {#each intents as i (i)}
          <span class="row-head">{i}</span>
          {#each appearances as a (a)}
            <div class="cell">
              <Button
                id={`matrix-${i}-${a}-${s}`}
                data-testid="matrix"
                label={i === 'danger' ? 'Delete' : 'Continue'}
                intent={i}
                appearance={a}
                size={s}
                leading={s === 'md' ? leadingPlus : undefined}
              />
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </section>

  <section id="states" aria-labelledby="states-title">
    <h2 id="states-title">Static states</h2>
    <p>Hover and pressed are interactive: point at and press any button. Loading keeps the width; disabled wins.</p>
    <div class="grid">
      {#each appearances as a (a)}
        <div class="panel">
          <p class="panel-title">{a}</p>
          <div class="row">
            <Button id={`state-default-${a}`} label="Default" appearance={a} />
            <Button id={`state-loading-${a}`} label="Loading" appearance={a} loading />
            <Button id={`state-disabled-${a}`} label="Disabled" appearance={a} disabled />
            <Button id={`state-both-${a}`} label="Both" appearance={a} disabled loading />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="slots" aria-labelledby="slots-title">
    <h2 id="slots-title">Leading and trailing content</h2>
    <p>Icon, counter and shortcut fixtures stand in for the Icon, Counter and Shortcut components of wave 1.</p>
    <div class="row wrap">
      <Button id="slot-leading" label="New project" leading={iconPlus} />
      <Button id="slot-trailing" label="Continue" appearance="outline" trailing={iconArrow} />
      <Button id="slot-counter" label="Inbox" intent="neutral" appearance="ghost" trailing={counter} />
      <Button id="slot-shortcut" label="Save" intent="neutral" appearance="outline" trailing={shortcut} />
      <Button id="slot-both" label="Download" intent="neutral" leading={iconDownload} trailing={shortcut} />
      <Button id="slot-danger" label="Delete" intent="danger" appearance="outline" leading={iconTrash} />
      {#each sizes as s (s)}
        <Button id={`slot-size-${s}`} label={`Size ${s}`} size={s} leading={iconPlus} trailing={counter} />
      {/each}
    </div>
  </section>

  <section id="behavior" aria-labelledby="behavior-title">
    <h2 id="behavior-title">Behavior</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Asynchronous action</p>
        <p>Click: the button turns busy for 1.5 s, keeps its width and focus, and ignores repeated presses.</p>
        <div class="row">
          <Button id="async" label="Save changes" loading={saving} onactivate={save} />
          <span data-testid="saved">Saved: {saved}</span>
        </div>
      </div>
      <form
        class="panel"
        onsubmit={(e) => {
          e.preventDefault();
          submissions++;
        }}
        onreset={() => resets++}
      >
        <p class="panel-title">Form</p>
        <label class="field">Item name <input id="item-name" required bind:value={itemName} /></label>
        <div class="row">
          <Button id="submit" type="submit" label="Create item" />
          <Button id="reset" type="reset" label="Reset" appearance="ghost" intent="neutral" />
          <Button id="ordinary" label="Preview" appearance="outline" intent="neutral" />
        </div>
        <p>
          <span data-testid="submissions">Submissions: {submissions}</span> ·
          <span data-testid="resets">Resets: {resets}</span>
        </p>
      </form>
      <div class="panel">
        <p class="panel-title">Navigation to a task</p>
        <p>A Button with <code>href</code> is a link with the button appearance.</p>
        <div class="row">
          <Button id="link" href="#new-item" label="Create project" leading={iconPlus} />
          <Button id="link-disabled" href="#new-item" label="Unavailable" disabled appearance="outline" />
        </div>
      </div>
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Long label in a constrained width</p>
        <label class="field"
          >Width: {width}px <input id="width" type="range" min="80" max="480" bind:value={width} /></label
        >
        <div class="constrained" style:inline-size={`${width}px`}>
          <Button
            id="truncated"
            label="Create a new item with a deliberately long action label"
            leading={iconPlus}
            trailing={counter}
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Stretched by layout</p>
        <p>No width option: the layout stretches the button.</p>
        <div class="stack">
          <Button id="stretched" label="Sign in" size="lg" style="inline-size: 100%" />
          <Button label="Create an account" size="lg" appearance="outline" intent="neutral" style="inline-size: 100%" />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Short labels and small sizes</p>
        <div class="row">
          {#each sizes as s (s)}<Button id={`short-${s}`} label="OK" size={s} appearance="outline" />{/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <div class="row" dir="rtl" lang="ar">
          <Button id="rtl" label="متابعة" leading={iconPlus} trailing={iconArrow} />
        </div>
      </div>
      <div class="panel" data-ggb-appearance={mode === 'light' ? 'dark' : 'light'}>
        <p class="panel-title">Nested opposite mode</p>
        <div class="row">
          <Button label="Continue" />
          <Button label="Cancel" appearance="outline" intent="neutral" />
          <Button label="Skip" appearance="ghost" intent="neutral" />
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
  h3 {
    font: var(--ggb-typography-heading-sm);
    margin: var(--ggb-space-layout-md) 0 var(--ggb-space-content-sm);
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
  code {
    font: var(--ggb-typography-code-sm);
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
  .options label,
  .field {
    display: flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  .field {
    margin-block-end: var(--ggb-space-content-md);
  }
  select,
  input:not([type]),
  input[required] {
    font: inherit;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
  }
  select:focus-visible,
  input:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  input[type='checkbox'],
  input[type='range'] {
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
  .options label.check {
    justify-content: flex-start;
  }
  .note {
    margin-block-start: var(--ggb-space-content-md);
    color: var(--ggb-color-status-warning-content, var(--ggb-color-content-secondary));
  }
  .matrix {
    display: grid;
    grid-template-columns: max-content repeat(3, minmax(0, 1fr));
    align-items: center;
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
    gap: var(--ggb-space-content-sm);
  }
  .stack {
    display: grid;
    gap: var(--ggb-space-content-sm);
  }
  .constrained {
    display: flex;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-control);
  }
  .show-targets :global(.ggb-button) {
    outline: 1px dashed var(--ggb-color-border-strong);
  }
  @media (max-width: 720px) {
    .page {
      padding: var(--ggb-space-layout-md) var(--ggb-space-layout-sm);
    }
    .playground {
      grid-template-columns: minmax(0, 1fr);
    }
    .matrix {
      grid-template-columns: max-content repeat(3, max-content);
      overflow-x: auto;
    }
  }
</style>
