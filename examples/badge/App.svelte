<script lang="ts">
  // Badge implementation review: a playground with every option, the intent x appearance matrix in every size,
  // leading icons, badges in a table and beside headings, truncation in narrow cells and alignment with Counter,
  // in any brand, appearance and density.
  import { Badge, Counter, Icon } from '../../packages/svelte/src/index.ts';
  import type { BadgeAppearance, BadgeIntent, BadgeSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: BadgeSize[] = ['sm', 'md', 'lg'];
  const intents: BadgeIntent[] = ['neutral', 'accent', 'info', 'success', 'warning', 'danger'];
  const appearances: BadgeAppearance[] = ['subtle', 'strong'];
  const words: Record<BadgeIntent, string> = {
    neutral: 'Draft',
    accent: 'New',
    info: 'In review',
    success: 'Paid',
    warning: 'Due soon',
    danger: 'Overdue'
  };
  const icons: Record<BadgeIntent, string> = {
    neutral: 'pencil-simple',
    accent: 'star',
    info: 'info',
    success: 'check',
    warning: 'warning-circle',
    danger: 'warning-circle'
  };

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showBoxes = $state(false);

  // Playground
  let label = $state('Paid');
  let intent = $state<BadgeIntent>('success');
  let appearance = $state<BadgeAppearance>('subtle');
  let size = $state<BadgeSize>('md');
  let withIcon = $state(false);
  let cell = $state(5);
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}
{#snippet playIcon()}{@render icon(icons[intent])}{/snippet}

<div
  class="page"
  class:show-boxes={showBoxes}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Badge</h1>
    <p class="lede">
      A short, read-only word that describes an object: a status (Paid, Overdue) or a category (Draft, New). The word
      carries the meaning; the color reinforces it. Not interactive: a removable value is a Tag, a number is a Counter.
      Every badge below is the real Svelte component on the approved tokens.
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
      <label class="check"><input id="ctx-boxes" type="checkbox" bind:checked={showBoxes} /> Show boxes</label>
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        {#if withIcon}
          <Badge id="play" label={label.trim() || 'Badge'} {intent} {appearance} {size} leading={playIcon} />
        {:else}
          <Badge id="play" label={label.trim() || 'Badge'} {intent} {appearance} {size} />
        {/if}
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
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
        <label class="check"><input id="opt-icon" type="checkbox" bind:checked={withIcon} /> Leading icon</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Intents, appearances and sizes</h2>
    <p>
      Neutral and accent are categories; info, success, warning and danger are statuses. Default: neutral subtle md.
    </p>
    {#each sizes as s (s)}
      <h3>Size {s}</h3>
      <div class="matrix badges">
        <span></span>
        {#each intents as i (i)}<span class="col-head">{i}</span>{/each}
        {#each appearances as a (a)}
          <span class="row-head">{a}</span>
          {#each intents as i (i)}
            <div>
              <Badge
                id={`badge-${i}-${a}-${s}`}
                data-testid="matrix"
                intent={i}
                appearance={a}
                size={s}
                label={words[i]}
              />
            </div>
          {/each}
          <span class="row-head">+ icon</span>
          {#each intents as i (i)}
            {#snippet lead()}{@render icon(icons[i])}{/snippet}
            <div>
              <Badge
                id={`badge-icon-${i}-${a}-${s}`}
                data-testid="matrix-icon"
                intent={i}
                appearance={a}
                size={s}
                label={words[i]}
                leading={lead}
              />
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </section>

  <section id="contexts" aria-labelledby="contexts-title">
    <h2 id="contexts-title">In context</h2>
    <div class="grid">
      <div class="panel wide">
        <p class="panel-title">Table (sm)</p>
        <table>
          <thead>
            <tr><th>Invoice</th><th>Customer</th><th>Status</th></tr>
          </thead>
          <tbody>
            {#each [['1024', 'Acme', 'success'], ['1025', 'Globex', 'warning'], ['1026', 'Initech', 'danger'], ['1027', 'Umbrella', 'neutral']] as [n, c, i] (n)}
              {@const intentOf = i as BadgeIntent}
              <tr>
                <td>#{n}</td>
                <td>{c}</td>
                <td><Badge id={`table-${n}`} size="sm" intent={intentOf} label={words[intentOf]} /></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="panel">
        <p class="panel-title">Beside a heading</p>
        <h3 class="title">Billing API <Badge id="heading-beta" intent="accent" label="Beta" /></h3>
        <h3 class="title">
          Legacy export <Badge id="heading-deprecated" intent="warning" appearance="strong" label="Deprecated" />
        </h3>
      </div>
      <div class="panel">
        <p class="panel-title">Same line as Counter</p>
        {#each sizes as s (s)}
          <div class="row line" data-testid={`counter-line-${s}`}>
            <Badge id={`line-badge-${s}`} size={s} intent="info" label="Open" />
            <Counter id={`line-counter-${s}`} size={s} value={12} />
            <span class={`label-${s}`}>Issues</span>
          </div>
        {/each}
      </div>
      <div class="panel">
        <p class="panel-title">Narrow cell: the label truncates</p>
        <label class="width">Width <input id="cell" type="range" min="3" max="12" bind:value={cell} /> {cell} em</label>
        <div class="cell" style:inline-size={`${cell}em`} data-testid="cell">
          <Badge id="truncated" intent="warning" label="Waiting for customer approval" leading={playIcon} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Long and short labels</p>
        <div class="row">
          <Badge id="short" label="A" />
          <Badge id="long" intent="info" label="Scheduled for the next maintenance window" />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .badges {
    grid-template-columns: max-content repeat(6, max-content);
  }
  .wide {
    grid-column: 1 / -1;
  }
  table {
    inline-size: 100%;
    border-collapse: collapse;
    font: var(--ggb-typography-body-sm);
  }
  th {
    text-align: start;
    font: var(--ggb-typography-label-sm);
    color: var(--ggb-color-content-tertiary);
  }
  th,
  td {
    padding: var(--ggb-space-content-sm);
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .title {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
  }
  .line {
    margin-block-end: var(--ggb-space-content-sm);
  }
  .label-sm {
    font: var(--ggb-typography-label-sm);
  }
  .label-md {
    font: var(--ggb-typography-label-md);
  }
  .label-lg {
    font: var(--ggb-typography-label-lg);
  }
  .width {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    font: var(--ggb-typography-label-sm);
    margin-block-end: var(--ggb-space-content-md);
  }
  .cell {
    display: flex;
    max-inline-size: 100%;
    padding: var(--ggb-space-content-xs);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
  .show-boxes :global(.ggb-badge) {
    outline: 1px dashed var(--ggb-color-border-strong);
    outline-offset: 1px;
  }
</style>
