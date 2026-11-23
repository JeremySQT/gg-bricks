<script lang="ts">
  // AvatarGroup implementation review: a playground (number of people, max, total, size, shape), the five sizes in
  // both shapes, the +N box and its bounds, the ring on other surfaces, and groups in context (a table cell, a card
  // header, a meeting), in any brand, appearance and density.
  import { AvatarGroup } from '../../packages/svelte/src/index.ts';
  import type { AvatarGroupShape, AvatarGroupSize } from '../../packages/svelte/src/index.ts';
  import { people, portraits } from '../avatar/portraits.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  const sizes: AvatarGroupSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const shapes: AvatarGroupShape[] = ['circle', 'square'];
  const teams = [
    { name: 'Acme Inc', src: portraits.acme },
    { name: 'Northwind Traders' },
    { name: 'Globex' },
    { name: 'Initech' }
  ];

  let count = $state(7);
  let max = $state(5);
  let total = $state(0);
  let size = $state<AvatarGroupSize>('md');
  let shape = $state<AvatarGroupShape>('circle');
  const crowd = $derived(Array.from({ length: count }, (_, i) => people[i % people.length]));
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>AvatarGroup</h1>
    <p class="lede">
      The people (or teams) involved in an object as a row of overlapping avatars, each drawn over the previous one,
      with a ring in the surface color, then a +N box for the others. max counts the +N box; total is a number the
      application knows beyond the avatars it passes. Not interactive.
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
        <AvatarGroup id="play" label="Assignees" avatars={crowd} {max} {total} {size} {shape} />
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Avatars <input id="opt-count" type="number" min="1" max="20" bind:value={count} /></label>
        <label>Max <input id="opt-max" type="number" min="0" max="20" bind:value={max} /></label>
        <label>Total <input id="opt-total" type="number" min="0" max="500" bind:value={total} /></label>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Shape <select id="opt-shape" bind:value={shape}
            >{#each shapes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes and shapes</h2>
    <p>Overlap of a quarter of the size (6, 8, 10, 12, 16 px); ring of 2 px. Default: md circle, max 5.</p>
    {#each shapes as sh (sh)}
      <h3>{sh}</h3>
      <div class="panel stack">
        {#each sizes as s (s)}
          <div class="row">
            <span class="row-head size">{s}</span>
            <AvatarGroup
              id={`m-${sh}-${s}`}
              data-testid="matrix"
              label={sh === 'circle' ? 'Reviewers' : 'Teams'}
              avatars={sh === 'circle' ? people.slice(0, 7) : teams}
              total={sh === 'circle' ? 0 : 6}
              size={s}
              shape={sh}
            />
          </div>
        {/each}
      </div>
    {/each}
  </section>

  <section id="bounds" aria-labelledby="bounds-title">
    <h2 id="bounds-title">Counting</h2>
    <div class="panel stack">
      <div class="row">
        <AvatarGroup id="b-one" label="Owner" avatars={people.slice(0, 1)} /><span class="text">one person</span>
      </div>
      <div class="row">
        <AvatarGroup id="b-five" label="Team" avatars={people.slice(0, 5)} /><span class="text"
          >5 people, max 5: all shown</span
        >
      </div>
      <div class="row">
        <AvatarGroup id="b-six" label="Team" avatars={people.slice(0, 6)} /><span class="text"
          >6 people, max 5: 4 avatars and +2</span
        >
      </div>
      <div class="row">
        <AvatarGroup id="b-total" label="Participants" avatars={people.slice(0, 3)} total={8} /><span class="text"
          >3 avatars passed, total 8: +5</span
        >
      </div>
      <div class="row">
        <AvatarGroup id="b-cap" label="Followers" avatars={people.slice(0, 4)} total={1200} max={4} /><span class="text"
          >total 1200: capped at +99</span
        >
      </div>
      <div class="row">
        <AvatarGroup id="b-all" label="Everyone" avatars={people} max={0} /><span class="text">max 0: every avatar</span
        >
      </div>
    </div>
  </section>

  <section id="surfaces" aria-labelledby="surfaces-title">
    <h2 id="surfaces-title">Ring and surfaces</h2>
    <p>The ring is the default surface. On another surface the integration sets the ring color to that surface.</p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Default surface</p>
        <AvatarGroup id="s-default" label="Team" avatars={people.slice(0, 6)} />
      </div>
      <div class="panel subtle">
        <p class="panel-title">Subtle surface, ring not adapted</p>
        <AvatarGroup id="s-subtle-raw" label="Team" avatars={people.slice(0, 6)} />
      </div>
      <div class="panel subtle">
        <p class="panel-title">Subtle surface, ring set by the integration</p>
        <AvatarGroup
          id="s-subtle"
          label="Team"
          avatars={people.slice(0, 6)}
          style="--ggb-avatar-group-ringColor: var(--ggb-color-surface-subtle)"
        />
      </div>
    </div>
  </section>

  <section id="contexts" aria-labelledby="contexts-title">
    <h2 id="contexts-title">In context</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Card header</p>
        <div class="card-head">
          <div>
            <p class="text strong">Website redesign</p>
            <p class="text muted">Due Friday</p>
          </div>
          <AvatarGroup id="c-card" label="Members" avatars={people.slice(2, 9)} size="sm" max={4} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Beside a count</p>
        <div class="row">
          <AvatarGroup id="c-meeting" label="Attendees" avatars={people.slice(0, 3)} size="xs" max={0} />
          <span class="text small">Olivia, Phoenix and 9 others are attending</span>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-lg);
  }
  .size {
    inline-size: 2rem;
  }
  .subtle {
    background: var(--ggb-color-surface-subtle);
  }
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ggb-space-content-md);
  }
  .page .text {
    margin: 0;
  }
  .strong {
    font: var(--ggb-typography-label-md);
  }
  .page .muted,
  .page .small {
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-secondary);
  }
</style>
