<script lang="ts">
  // Divider implementation review: a playground (orientation, label, decorative), horizontal dividers between
  // sections and groups of fields, a labeled break, vertical dividers in rows of different heights and in running text,
  // in any brand, appearance and density.
  import { Divider, Button, Badge } from '../../packages/svelte/src/index.ts';
  import type { DividerOrientation } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let orientation = $state<DividerOrientation>('horizontal');
  let label = $state('');
  let decorative = $state(false);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Divider</h1>
    <p class="lede">
      A thin line between two groups of content, horizontal or vertical, with an optional centered label. It adds no
      margin: spacing comes from the layout that holds it. The thickness is a component token (1 px).
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
        {#if orientation === 'horizontal'}
          <div class="column">
            <p class="text">First group of content</p>
            <Divider id="play" {orientation} label={label || undefined} {decorative} />
            <p class="text">Second group of content</p>
          </div>
        {:else}
          <div class="row tall">
            <span class="text">First</span>
            <Divider id="play" {orientation} label={label || undefined} {decorative} />
            <span class="text">Second</span>
          </div>
        {/if}
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Orientation <select id="opt-orientation" bind:value={orientation}
            ><option value="horizontal">horizontal</option><option value="vertical">vertical</option></select
          ></label
        >
        <label>Label <input id="opt-label" type="text" bind:value={label} placeholder="none" /></label>
        <label class="check"><input id="opt-decorative" type="checkbox" bind:checked={decorative} /> Decorative</label>
      </fieldset>
    </div>
  </section>

  <section id="horizontal" aria-labelledby="horizontal-title">
    <h2 id="horizontal-title">Horizontal</h2>
    <div class="grid">
      <div class="panel column">
        <p class="panel-title">Between sections of a panel</p>
        <div class="column">
          <p class="text strong">Profile</p>
          <p class="text muted">Name, photo and bio.</p>
        </div>
        <Divider id="h-sections" />
        <div class="column">
          <p class="text strong">Notifications</p>
          <p class="text muted">Email and push preferences.</p>
        </div>
      </div>
      <div class="panel column">
        <p class="panel-title">Labeled break</p>
        <Button intent="neutral" appearance="outline" label="Continue with Google" />
        <Divider id="h-or" label="Or" />
        <Button label="Continue with email" />
      </div>
      <div class="panel column">
        <p class="panel-title">Date separator in a feed</p>
        <p class="text">Draft saved</p>
        <Divider id="h-today" label="Today" />
        <p class="text">Invoice #3066 paid</p>
      </div>
    </div>
  </section>

  <section id="vertical" aria-labelledby="vertical-title">
    <h2 id="vertical-title">Vertical</h2>
    <div class="grid">
      <div class="panel column">
        <p class="panel-title">Metadata on one line</p>
        <div class="row meta">
          <span>Updated 2 days ago</span><Divider id="v-meta" orientation="vertical" decorative /><span
            >12 comments</span
          ><Divider orientation="vertical" decorative /><Badge size="sm" intent="success" label="Published" />
        </div>
      </div>
      <div class="panel column">
        <p class="panel-title">Between groups of buttons (stretched to the row)</p>
        <div class="row">
          <Button size="sm" appearance="outline" intent="neutral" label="Bold" />
          <Button size="sm" appearance="outline" intent="neutral" label="Italic" />
          <Divider id="v-buttons" orientation="vertical" />
          <Button size="sm" appearance="outline" intent="neutral" label="Link" />
        </div>
      </div>
      <div class="panel column">
        <p class="panel-title">In running text (the line box; spacing set by the integration)</p>
        <p class="text inline-links">
          Docs <Divider id="v-text" orientation="vertical" decorative /> Changelog <Divider
            orientation="vertical"
            decorative
          /> Support
        </p>
      </div>
    </div>
  </section>
</div>

<style>
  .column {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-md);
    inline-size: 100%;
  }
  .stage .column {
    max-inline-size: 28rem;
  }
  .inline-links :global(.ggb-divider) {
    margin-inline: var(--ggb-space-content-sm);
  }
  .tall {
    block-size: 4rem;
  }
  .page .text {
    margin: 0;
  }
  .strong {
    font: var(--ggb-typography-label-md);
  }
  .page .muted,
  .meta {
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-secondary);
  }
</style>
