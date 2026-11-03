<script lang="ts">
  // Skeleton implementation review: text lines in each body size next to the real text they stand for, blocks and
  // circles sized by the layout, a card loading then loaded, in any brand, appearance and density.
  import { Skeleton } from '../../packages/svelte/src/index.ts';
  import type { SkeletonShape, SkeletonSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: SkeletonSize[] = ['sm', 'md', 'lg'];
  const shapes: SkeletonShape[] = ['text', 'block', 'circle'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let shape = $state<SkeletonShape>('text');
  let lines = $state(3);
  let size = $state<SkeletonSize>('md');
  let loaded = $state(false);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Skeleton</h1>
    <p class="lede">
      Stands in for content that is loading, with its shape and size, so that the layout does not move when it arrives.
      Text lines take the height of the real lines. Every control below is the real Svelte component on the approved
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
        <div class="box" data-testid="box"><Skeleton id="play" {shape} {lines} {size} /></div>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Shape <select id="opt-shape" bind:value={shape}
            >{#each shapes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Lines <input id="opt-lines" type="number" min="1" max="8" bind:value={lines} /></label>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Text lines beside the text they stand for</h2>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">body {s}</p>
          <div class="pair">
            <Skeleton id={`sk-${s}`} lines={3} size={s} />
            <p class={`real real-${s}`} id={`real-${s}`}>
              The quarterly report is ready. It covers revenue, churn and the new regions, line by line.
            </p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">A card loading, then loaded</p>
        <label class="check"><input id="opt-loaded" type="checkbox" bind:checked={loaded} /> Loaded</label>
        <article class="card" aria-busy={!loaded}>
          {#if loaded}
            <div class="avatar" aria-hidden="true">AL</div>
            <div class="body">
              <strong>Ada Lovelace</strong>
              <p>Commented on the roadmap: the second wave looks right, ship it next week.</p>
            </div>
          {:else}
            <div class="avatar-slot"><Skeleton id="card-avatar" shape="circle" /></div>
            <div class="body"><Skeleton id="card-text" lines={3} size="sm" /></div>
          {/if}
        </article>
      </div>
      <div class="panel">
        <p class="panel-title">A chart block</p>
        <div class="chart"><Skeleton id="chart" shape="block" /></div>
      </div>
    </div>
  </section>
</div>

<style>
  .box {
    inline-size: min(22rem, 100%);
    block-size: 8rem;
  }
  .pair {
    display: grid;
    gap: var(--ggb-space-content-md);
  }
  .real {
    margin: 0;
    color: var(--ggb-color-content-primary);
  }
  .real-sm {
    font: var(--ggb-typography-body-sm);
  }
  .real-md {
    font: var(--ggb-typography-body-md);
  }
  .real-lg {
    font: var(--ggb-typography-body-lg);
  }
  .card {
    display: flex;
    gap: var(--ggb-space-content-md);
    align-items: flex-start;
    padding: var(--ggb-space-content-md);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-container);
    min-block-size: 6rem;
  }
  .avatar,
  .avatar-slot {
    flex: none;
    inline-size: 40px;
  }
  .avatar {
    display: grid;
    place-items: center;
    block-size: 40px;
    border-radius: var(--ggb-radius-full);
    background: var(--ggb-color-action-accent-solid-default-surface);
    color: var(--ggb-color-action-accent-solid-default-content);
    font: var(--ggb-typography-label-sm);
  }
  .body {
    flex: 1;
    min-inline-size: 0;
    font: var(--ggb-typography-body-sm);
  }
  .body p {
    margin: 0;
  }
  .chart {
    block-size: 10rem;
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
</style>
