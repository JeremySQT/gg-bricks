<script lang="ts">
  // Pagination implementation review: a playground (pages, siblings, size), the bounds, few pages, links instead of
  // buttons, a narrow column that wraps, right-to-left, in any brand, appearance and density.
  import { Pagination } from '../../packages/svelte/src/index.ts';
  import type { PaginationSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let page = $state(1);
  let pageCount = $state(20);
  let siblingCount = $state(1);
  let size = $state<PaginationSize>('md');
  let changes = $state(0);
  let linked = $state(4);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Pagination</h1>
    <p class="lede">
      Moves through numbered pages. The number of items stays the same while you page, so that Previous and Next do not
      move. Every control below is the real Svelte component on the approved tokens.
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
        <Pagination id="play" bind:page {pageCount} {siblingCount} {size} onpagechange={() => changes++} />
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="page">Page: {page}</span> · <span data-testid="changes">Changes: {changes}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Pages <select id="opt-count" bind:value={pageCount}
            >{#each [1, 5, 7, 8, 20, 120] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Siblings <select id="opt-siblings" bind:value={siblingCount}
            >{#each [0, 1, 2] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each ['sm', 'md', 'lg'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <button type="button" id="set-ten" onclick={() => (page = 10)}>Go to page 10 from the app</button>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      {#each ['sm', 'md', 'lg'] as s (s)}
        <div class="panel">
          <p class="panel-title">Size {s}, page 50 of 100</p>
          <Pagination id={`size-${s}`} page={50} pageCount={100} size={s as PaginationSize} />
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">Links: every control points to ?page=N</p>
        <Pagination id="links" bind:page={linked} pageCount={12} href={'#page-{page}'} />
      </div>
      <div class="panel">
        <p class="panel-title">Right-to-left: the chevrons are mirrored</p>
        <div dir="rtl"><Pagination id="rtl" page={3} pageCount={9} label="ترقيم الصفحات" /></div>
      </div>
    </div>
  </section>
</div>
