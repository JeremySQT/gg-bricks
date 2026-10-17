<script lang="ts">
  // IconButton implementation review: a playground with every option, the intent x appearance matrix in every
  // size, states, links, alignment with Buttons, toolbars and table rows, interaction targets, in any brand,
  // appearance and density.
  import { Button, Icon, IconButton } from '../../packages/svelte/src/index.ts';
  import type { IconButtonAppearance, IconButtonIntent, IconButtonSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from './glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: IconButtonSize[] = ['sm', 'md', 'lg'];
  const intents: IconButtonIntent[] = ['accent', 'neutral', 'danger'];
  const appearances: IconButtonAppearance[] = ['solid', 'outline', 'ghost'];
  const glyphNames = ['x', 'dots-three', 'pencil-simple', 'copy', 'trash', 'plus', 'magnifying-glass', 'star'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let intent = $state<IconButtonIntent>('neutral');
  let appearance = $state<IconButtonAppearance>('ghost');
  let size = $state<IconButtonSize>('md');
  let glyph = $state('pencil-simple');
  let label = $state('Edit');
  let disabled = $state(false);
  let loading = $state(false);
  let asLink = $state(false);
  let activations = $state(0);

  // Async case: loading while a pretend request runs.
  let saving = $state(false);
  let saved = $state(0);
  function save() {
    saving = true;
    setTimeout(() => {
      saving = false;
      saved += 1;
    }, 1500);
  }

  let submitted = $state(0);
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}
{#snippet pencil()}{@render icon('pencil-simple')}{/snippet}
{#snippet close()}{@render icon('x')}{/snippet}
{#snippet more()}{@render icon('dots-three')}{/snippet}
{#snippet copy()}{@render icon('copy')}{/snippet}
{#snippet trash()}{@render icon('trash')}{/snippet}
{#snippet plus()}{@render icon('plus')}{/snippet}
{#snippet search()}{@render icon('magnifying-glass')}{/snippet}
{#snippet star()}{@render icon('star')}{/snippet}
{#snippet chosen()}{@render icon(glyph)}{/snippet}
{#snippet plusLeading()}{@render icon('plus')}{/snippet}

<div
  class="page"
  class:show-targets={showTargets}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>IconButton</h1>
    <p class="lede">
      An action, or a navigation to a task, from a compact square that shows only an icon. Its name is never visible but
      always announced. It matches a Button of the same size: same treatments, same height, same focus ring. Every
      control below is the real Svelte component on the approved tokens.
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
        {#if asLink}
          <IconButton
            id="play"
            href="#playground"
            {intent}
            {appearance}
            {size}
            {disabled}
            {loading}
            label={label.trim() || 'Edit'}
            icon={chosen}
            onactivate={() => activations++}
          />
        {:else}
          <IconButton
            id="play"
            {intent}
            {appearance}
            {size}
            {disabled}
            {loading}
            label={label.trim() || 'Edit'}
            icon={chosen}
            onactivate={() => activations++}
          />
        {/if}
        <p class="readout" aria-live="polite"><span data-testid="activations">Activations: {activations}</span></p>
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
        <label
          >Icon <select id="opt-glyph" bind:value={glyph}
            >{#each glyphNames as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-loading" type="checkbox" bind:checked={loading} /> Loading</label>
        <label class="check"><input id="opt-link" type="checkbox" bind:checked={asLink} /> Link (href)</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Intents, appearances and sizes</h2>
    <p>Hover, press and tab through them: the colors and transitions are those of Button. Default: neutral ghost.</p>
    {#each sizes as s (s)}
      <h3>Size {s}</h3>
      <div class="matrix">
        <span></span>
        {#each appearances as a (a)}<span class="col-head">{a}</span>{/each}
        {#each intents as i (i)}
          <span class="row-head">{i}</span>
          {#each appearances as a (a)}
            <div>
              <IconButton
                id={`ib-${i}-${a}-${s}`}
                data-testid="matrix"
                intent={i}
                appearance={a}
                size={s}
                label={`Edit (${i} ${a} ${s})`}
                icon={pencil}
              />
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </section>

  <section id="states" aria-labelledby="states-title">
    <h2 id="states-title">States</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Disabled</p>
        <div class="row">
          {#each appearances as a (a)}
            <IconButton id={`disabled-${a}`} appearance={a} intent="accent" disabled label="Delete" icon={trash} />
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Loading (keeps focus and size)</p>
        <div class="row">
          {#each appearances as a (a)}
            <IconButton id={`loading-${a}`} appearance={a} intent="accent" loading label="Saving" icon={copy} />
          {/each}
          <IconButton id="loading-disabled" loading disabled appearance="outline" label="Saving" icon={copy} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Async: 1.5 s request</p>
        <div class="row">
          <IconButton
            id="async"
            appearance="outline"
            loading={saving}
            label="Duplicate"
            icon={copy}
            onactivate={save}
          />
          <span data-testid="saved">Saved {saved} times</span>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Links</p>
        <div class="row">
          <IconButton id="link" href="#states" label="Search" icon={search} />
          <IconButton id="link-disabled" href="#states" disabled label="Search" icon={search} />
          <IconButton id="link-loading" href="#states" loading label="Search" icon={search} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">In a form: never submits by default</p>
        <form
          class="row"
          onsubmit={(e) => {
            e.preventDefault();
            submitted++;
          }}
        >
          <IconButton id="form-default" label="Add a row" icon={plus} />
          <IconButton id="form-submit" type="submit" appearance="solid" intent="accent" label="Send" icon={plus} />
          <span data-testid="submitted">Submitted {submitted}</span>
        </form>
      </div>
    </div>
  </section>

  <section id="alignment" aria-labelledby="alignment-title">
    <h2 id="alignment-title">Beside Buttons</h2>
    <p>Same height and same treatment as the Button of the same size.</p>
    {#each sizes as s (s)}
      <div class="row align" data-testid={`align-${s}`}>
        <Button
          id={`align-button-${s}`}
          size={s}
          intent="neutral"
          appearance="outline"
          label="Share"
          leading={plusLeading}
        />
        <IconButton id={`align-ib-${s}`} size={s} appearance="outline" label="More actions" icon={more} />
        <Button size={s} intent="accent" label="Publish" />
        <IconButton size={s} intent="accent" appearance="solid" label="Publish options" icon={more} />
      </div>
    {/each}
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Toolbar (sm)</p>
        <div class="toolbar" role="toolbar" aria-label="Formatting">
          <IconButton size="sm" label="Search" icon={search} />
          <IconButton size="sm" label="Copy" icon={copy} />
          <IconButton size="sm" label="Favorite" icon={star} />
          <IconButton size="sm" intent="danger" label="Delete" icon={trash} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Card header</p>
        <div class="card-head">
          <strong>Quarterly report</strong>
          <IconButton id="card-close" label="Close" icon={close} />
        </div>
      </div>
      <div class="panel wide">
        <p class="panel-title">Table rows (sm, 44 px targets overlap neighbours)</p>
        <table>
          <tbody>
            {#each ['Invoice 1024', 'Invoice 1025', 'Invoice 1026'] as row (row)}
              <tr>
                <td>{row}</td>
                <td class="actions">
                  <IconButton size="sm" label={`Edit ${row}`} icon={pencil} />
                  <IconButton size="sm" label={`Delete ${row}`} intent="danger" icon={trash} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .align {
    margin-block-end: var(--ggb-space-content-md);
  }
  .toolbar,
  .card-head {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-xs);
  }
  .card-head {
    justify-content: space-between;
    padding: var(--ggb-space-content-sm) var(--ggb-space-content-sm) var(--ggb-space-content-sm)
      var(--ggb-space-content-lg);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-container);
  }
  .wide {
    grid-column: 1 / -1;
  }
  table {
    inline-size: 100%;
    border-collapse: collapse;
  }
  td {
    padding-block: var(--ggb-space-content-xs);
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .actions {
    text-align: end;
    white-space: nowrap;
  }
  .show-targets :global(.ggb-icon-button::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
