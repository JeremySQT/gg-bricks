<script lang="ts">
  // Spinner implementation review: sizes, the inherited color on surfaces and inside actions, a named status, and the
  // turn speed to judge (open question 5 of the contract gate), in any brand, appearance and density.
  import { Button, Spinner } from '../../packages/svelte/src/index.ts';
  import type { SpinnerSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let reduced = $state(false);
  let size = $state<SpinnerSize>('md');
  let named = $state(true);
  let loading = $state(false);
  let shown = $state(true);
</script>

<div class="page" class:reduced data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Spinner</h1>
    <p class="lede">
      Shows that something is loading when its duration is unknown and its place is small. It draws the same ring as the
      Button loading state, in the color of the text around it. Judge the turn speed (700 ms) here. Every control below
      is the real Svelte component on the approved tokens.
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
        ><input id="ctx-reduced" type="checkbox" bind:checked={reduced} /> Simulate reduced motion</label
      >
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        {#if shown}
          <span class="inline" id="play-wrap">
            <Spinner id="play" {size} label={named ? 'Loading comments' : ''} />
            {#if named}<span aria-hidden="true">Loading comments…</span>{/if}
          </span>
        {/if}
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-named" type="checkbox" bind:checked={named} /> Named status</label>
        <label class="check"><input id="opt-shown" type="checkbox" bind:checked={shown} /> Shown</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes and surfaces</h2>
    <p>The spinner takes the color of the text around it: primary text, secondary text, an inverse surface.</p>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">{s}</p>
          <div class="row">
            <Spinner id={`sp-${s}`} size={s} />
            <span class="secondary"><Spinner id={`sp-${s}-secondary`} size={s} /></span>
            <span class="inverse"><Spinner id={`sp-${s}-inverse`} size={s} /></span>
          </div>
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">Beside the Button loading state</p>
        <div class="row">
          <Button id="btn-loading" label="Save" {loading} onactivate={() => (loading = true)} />
          <Button
            id="btn-reset"
            label="Reset"
            intent="neutral"
            appearance="outline"
            onactivate={() => (loading = false)}
          />
          <Spinner id="sp-beside" size="md" />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">An empty panel loading</p>
        <div class="empty" aria-busy="true">
          <Spinner id="sp-panel" size="xl" label="Loading the activity" />
          <span>Loading the activity…</span>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .inline,
  .row {
    display: inline-flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    flex-wrap: wrap;
  }
  .secondary {
    color: var(--ggb-color-content-secondary);
  }
  .inverse {
    display: inline-flex;
    padding: var(--ggb-space-content-xs);
    border-radius: var(--ggb-radius-control);
    background: var(--ggb-color-surface-inverse);
    color: var(--ggb-color-content-inverse);
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    padding: var(--ggb-space-layout-md);
    color: var(--ggb-color-content-secondary);
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .reduced :global(.ggb-spinner__svg) {
    animation-duration: calc(3 * var(--ggb-spinner-motionDuration)) !important;
  }
</style>
