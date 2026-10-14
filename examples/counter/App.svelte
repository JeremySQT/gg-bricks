<script lang="ts">
  // Counter implementation review: a playground with every option, every size against a set of values,
  // overflow and custom maximums, the accessible label, the counter next to text and inside Buttons of
  // every intent, appearance, size and state, in any brand, appearance and density.
  import { Button, Counter } from '../../packages/svelte/src/index.ts';
  import type { ButtonAppearance, ButtonIntent, CounterSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: CounterSize[] = ['sm', 'md', 'lg'];
  const intents: ButtonIntent[] = ['accent', 'neutral', 'danger'];
  const appearances: ButtonAppearance[] = ['solid', 'outline', 'ghost'];
  const values = [0, 1, 8, 42, 99, 100, 1234];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showBoxes = $state(false);

  // Playground
  let value = $state(8);
  let max = $state(99);
  let size = $state<CounterSize>('md');
  let label = $state('unread messages');
  let playground = $state<HTMLSpanElement | null>(null);
  // Readout of the rendered value, observed on the DOM so that it is what the component really shows.
  let shown = $state('');
  $effect(() => {
    const element = playground;
    if (!element) return;
    const read = () => (shown = element.querySelector('.ggb-counter__value')?.textContent ?? '');
    const observer = new MutationObserver(read);
    observer.observe(element, { subtree: true, childList: true, characterData: true });
    read();
    return () => observer.disconnect();
  });
</script>

<div
  class="page"
  class:show-boxes={showBoxes}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header class="hero">
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Counter</h1>
    <p class="lede">
      Shows a quantity (unread messages, items, selected rows) next to the thing it counts: a small rectangle drawn in
      the inherited content color, capped at a maximum, never interactive. Every counter below is the real Svelte
      component on the approved tokens.
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
        <Counter id="play-counter" bind:ref={playground} {value} {max} {size} label={label.trim() || undefined} />
        <p class="readout" aria-live="polite">
          <span data-testid="shown">Shown: {shown}</span> ·
          <span data-testid="overflow">Overflow: {Math.max(0, Math.floor(value)) > max ? 'yes' : 'no'}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Value <input id="opt-value" type="number" step="any" bind:value /></label>
        <label>Max <input id="opt-max" type="number" min="1" bind:value={max} /></label>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" bind:value={label} /></label>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes and values</h2>
    <p>
      One digit sits in a square (minimum width equal to the height); more digits widen the box; 100 and above overflow
      to 99+ by default. Tabular figures: 11 and 88 have the same width.
    </p>
    <div class="matrix values">
      <span></span>
      {#each values as v (v)}<span class="col-head">{v}</span>{/each}
      {#each sizes as s (s)}
        <span class="row-head">{s}</span>
        {#each values as v (v)}
          <div class="cell"><Counter id={`size-${s}-value-${v}`} data-testid="sized" size={s} value={v} /></div>
        {/each}
      {/each}
    </div>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Tabular figures</p>
        <div class="row">
          <Counter id="tabular-11" value={11} />
          <Counter id="tabular-88" value={88} />
          <Counter id="tabular-10" value={10} />
          <Counter id="tabular-99" value={99} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Custom maximum</p>
        <div class="row">
          <Counter id="max-5" value={8} max={5} />
          <Counter id="max-999" value={1234} max={999} />
          <Counter id="max-9999" value={1234} max={9999} />
          <Counter id="max-grouped" value={12345} max={99999} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Invalid input, normalized</p>
        <div class="row">
          <Counter id="negative" value={-5} />
          <Counter id="fractional" value={7.9} />
          <Counter id="nan" value={Number.NaN} />
        </div>
      </div>
    </div>
  </section>

  <section id="label" aria-labelledby="label-title">
    <h2 id="label-title">Accessible label</h2>
    <p>
      The label is read after the visible text and never shown: the first counter reads "8 unread messages", the second
      "99+ unread messages". Without a label the surrounding content supplies the meaning.
    </p>
    <div class="row">
      <Counter id="labelled" value={8} label="unread messages" />
      <Counter id="labelled-overflow" value={120} label="unread messages" />
      <Counter id="unlabelled" value={8} />
    </div>
  </section>

  <section id="text" aria-labelledby="text-title">
    <h2 id="text-title">Next to text</h2>
    <p>
      A counter of a size sits one typography step below a label of the same size and aligns on the baseline. Boxes are
      placed by their edges, without optical compensation.
    </p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Label typography</p>
        {#each sizes as s (s)}
          <p class={`text label-${s}`}>Inbox <Counter id={`text-${s}`} size={s} value={8} /></p>
        {/each}
      </div>
      <div class="panel">
        <p class="panel-title">Body typography</p>
        {#each sizes as s (s)}
          <p class={`text body-${s}`}>
            Drafts <Counter id={`body-${s}`} size={s} value={42} /> waiting for review since Tuesday.
          </p>
        {/each}
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <p class="text label-md" dir="rtl" lang="ar">الوارد <Counter id="rtl" value={8} /></p>
      </div>
    </div>
  </section>

  <section id="buttons" aria-labelledby="buttons-title">
    <h2 id="buttons-title">Inside a Button</h2>
    <p>
      In the trailing slot, the counter takes the button's size and inherits its content color in every intent,
      appearance and state; Button hides its trailing content from assistive technology.
    </p>
    <h3>Sizes</h3>
    <div class="row">
      {#each sizes as s (s)}
        {#snippet sized()}<Counter size={s} value={8} />{/snippet}
        <Button id={`button-size-${s}`} label="Inbox" size={s} trailing={sized} />
      {/each}
    </div>
    <h3>Intent × appearance</h3>
    <div class="matrix">
      <span></span>
      {#each appearances as a (a)}<span class="col-head">{a}</span>{/each}
      {#each intents as i (i)}
        <span class="row-head">{i}</span>
        {#each appearances as a (a)}
          {#snippet eight()}<Counter value={8} />{/snippet}
          <div class="cell">
            <Button
              id={`button-${i}-${a}`}
              data-testid="hosted"
              label="Inbox"
              intent={i}
              appearance={a}
              trailing={eight}
            />
          </div>
        {/each}
      {/each}
    </div>
    <h3>States</h3>
    <div class="grid">
      {#each appearances as a (a)}
        {#snippet twelve()}<Counter value={12} />{/snippet}
        {#snippet overflowing()}<Counter value={250} />{/snippet}
        <div class="panel">
          <p class="panel-title">{a}</p>
          <div class="row">
            <Button id={`button-default-${a}`} label="Default" intent="neutral" appearance={a} trailing={twelve} />
            <Button
              id={`button-overflow-${a}`}
              label="Overflow"
              intent="neutral"
              appearance={a}
              trailing={overflowing}
            />
            <Button
              id={`button-loading-${a}`}
              label="Loading"
              intent="neutral"
              appearance={a}
              loading
              trailing={twelve}
            />
            <Button
              id={`button-disabled-${a}`}
              label="Disabled"
              intent="neutral"
              appearance={a}
              disabled
              trailing={twelve}
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel" data-ggb-appearance={mode === 'light' ? 'dark' : 'light'}>
        <p class="panel-title">Nested opposite mode</p>
        {#snippet three()}<Counter value={3} />{/snippet}
        <div class="row">
          <p class="text label-md">Inbox <Counter id="nested-standalone" value={8} /></p>
          <Button id="nested-button" label="Review" intent="neutral" appearance="outline" trailing={three} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Constrained width</p>
        <p>A counter never wraps or truncates: a narrow parent overflows instead.</p>
        <div class="constrained"><Counter id="constrained" value={12345} max={99999} /></div>
      </div>
      <div class="panel">
        <p class="panel-title">Every size in a column</p>
        <div class="stack-inline">
          {#each sizes as s (s)}<Counter id={`column-${s}`} size={s} value={99} />{/each}
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
  input:not([type]),
  input[type='number'] {
    font: inherit;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
  }
  input[type='number'] {
    inline-size: 7rem;
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
    grid-template-columns: max-content repeat(3, minmax(0, 1fr));
    align-items: center;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .matrix.values {
    grid-template-columns: max-content repeat(7, max-content);
    justify-content: start;
    margin-block-end: var(--ggb-space-layout-sm);
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
  .text {
    color: var(--ggb-color-content-primary);
    margin: 0 0 var(--ggb-space-content-md);
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
  .body-sm {
    font: var(--ggb-typography-body-sm);
  }
  .body-md {
    font: var(--ggb-typography-body-md);
  }
  .body-lg {
    font: var(--ggb-typography-body-lg);
  }
  .constrained {
    display: flex;
    inline-size: 2.5rem;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-control);
  }
  .stack-inline {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ggb-space-content-sm);
  }
  .show-boxes :global(.ggb-counter) {
    outline: 1px dashed var(--ggb-color-border-strong);
    outline-offset: 0;
  }
  @media (max-width: 720px) {
    .page {
      padding: var(--ggb-space-layout-md) var(--ggb-space-layout-sm);
    }
    .playground {
      grid-template-columns: minmax(0, 1fr);
    }
    .matrix {
      overflow-x: auto;
    }
  }
</style>
