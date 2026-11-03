<script lang="ts">
  // Progress implementation review: a playground with every option and a value slider, intents and sizes, the
  // indeterminate sweep, a hidden label, long labels in a narrow column, in any brand, appearance and density.
  import { Button, Progress } from '../../packages/svelte/src/index.ts';
  import type { ProgressIntent, ProgressSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: ProgressSize[] = ['sm', 'md', 'lg'];
  const intents: ProgressIntent[] = ['accent', 'success', 'warning', 'danger'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let value = $state(40);
  let max = $state(100);
  let indeterminate = $state(false);
  let showLabel = $state(true);
  let showValue = $state(true);
  let intent = $state<ProgressIntent>('accent');
  let size = $state<ProgressSize>('md');

  let upload = $state(0);
  let timer: ReturnType<typeof setInterval> | undefined;
  function start() {
    clearInterval(timer);
    upload = 0;
    timer = setInterval(() => {
      upload = Math.min(upload + 7, 100);
      if (upload === 100) clearInterval(timer);
    }, 300);
  }
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Progress</h1>
    <p class="lede">
      Shows how far a task of known size has gone, or that a longer task is under way. The label says what is in
      progress and names the bar for assistive technology; the percentage is optional. Every control below is the real
      Svelte component on the approved tokens.
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
        <div class="wide">
          <Progress
            id="play"
            label="Uploading quarterly-report.pdf"
            {value}
            {max}
            {indeterminate}
            {showLabel}
            {showValue}
            {intent}
            {size}
          />
        </div>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Value <input id="opt-value" type="range" min="-10" max="130" step="1" bind:value /> {value}</label>
        <label>Max <input id="opt-max" type="number" min="1" bind:value={max} /></label>
        <label
          >Intent <select id="opt-intent" bind:value={intent}
            >{#each intents as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"
          ><input id="opt-indeterminate" type="checkbox" bind:checked={indeterminate} /> Indeterminate</label
        >
        <label class="check"><input id="opt-label" type="checkbox" bind:checked={showLabel} /> Show label</label>
        <label class="check"><input id="opt-value-text" type="checkbox" bind:checked={showValue} /> Show value</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Intents and sizes</h2>
    <div class="grid">
      {#each intents as i (i)}
        <div class="panel">
          <p class="panel-title">{i}</p>
          <div class="stack">
            {#each sizes as s (s)}
              <Progress id={`pr-${i}-${s}`} label={`${i} ${s}`} value={60} intent={i} size={s} showValue />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">An upload that advances</p>
        <div class="stack">
          <Progress
            id="upload"
            label={upload === 100 ? 'Upload complete' : 'Uploading photos'}
            value={upload}
            intent={upload === 100 ? 'success' : 'accent'}
            showValue
          />
          <Button
            id="upload-start"
            label="Start upload"
            size="sm"
            intent="neutral"
            appearance="outline"
            onactivate={start}
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Indeterminate, label hidden</p>
        <Progress id="processing" label="Processing the import" indeterminate showLabel={false} />
      </div>
      <div class="panel">
        <p class="panel-title">Steps as a fraction, failed</p>
        <Progress id="failed" label="Import failed at step 3 of 5" value={3} max={5} intent="danger" showValue />
      </div>
      <div class="panel">
        <p class="panel-title">A long label in a narrow column</p>
        <div class="narrow">
          <Progress
            id="long"
            label="Synchronizing the shared drive with every device of the team"
            value={72}
            showValue
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Empty and full</p>
        <div class="stack">
          <Progress id="empty" label="Not started" value={0} showValue />
          <Progress id="full" label="Done" value={150} intent="success" showValue />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .wide {
    inline-size: min(28rem, 100%);
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--ggb-space-content-md);
  }
  .narrow {
    inline-size: 12rem;
    max-inline-size: 100%;
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
</style>
