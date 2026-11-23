<script lang="ts">
  // Slider implementation review: a playground with every option, conditions, steps that do not divide the range,
  // decimals and locales, right to left, form submission and difficult cases, in any brand, appearance and density.
  import { Button, Field, Slider } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const locales = ['en', 'fr', 'de', 'ar-EG'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let value = $state(40);
  let minText = $state('0');
  let maxText = $state('100');
  let stepText = $state('1');
  let showValue = $state(true);
  let locale = $state('en');
  let disabled = $state(false);
  let changes = $state(0);
  let commits = $state(0);
  let lastCommit = $state<number | null>(null);
  const num = (t: string, d: number) => (t.trim() === '' || Number.isNaN(Number(t)) ? d : Number(t));

  // Compositions
  let price = $state(250);
  let thirds = $state(9);
  let opacity = $state(0.5);
  let outside = $state(150);
  let submitted = $state('');
  let consumerKeys = $state(0);
</script>

<div
  class="page"
  class:show-targets={showTargets}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Slider</h1>
    <p class="lede">
      One number picked in a bounded range by moving a thumb along a track. Drag the thumb or press anywhere on the
      track; Arrow keys move by one step, Page Up and Page Down by ten, Home and End to the ends. The value can be shown
      at the end of the track. Every control below is the real Svelte component on the approved tokens.
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
        <div class="stage-field">
          <Field label="Volume" description="Applies to every speaker.">
            <Slider
              id="play"
              bind:value
              min={num(minText, 0)}
              max={num(maxText, 100)}
              step={num(stepText, 1)}
              {showValue}
              {locale}
              {disabled}
              onvaluechange={() => changes++}
              onvaluecommit={(v) => {
                commits++;
                lastCommit = v;
              }}
            />
          </Field>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: {value}</span> · <span data-testid="changes">Changes: {changes}</span> ·
          <span data-testid="commits">Commits: {commits}</span> ·
          <span data-testid="last-commit">Last commit: {lastCommit ?? 'none'}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Min <input id="opt-min" type="text" bind:value={minText} /></label>
        <label>Max <input id="opt-max" type="text" bind:value={maxText} /></label>
        <label>Step <input id="opt-step" type="text" bind:value={stepText} /></label>
        <label
          >Locale <select id="opt-locale" bind:value={locale}
            >{#each locales as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-show" type="checkbox" bind:checked={showValue} /> Show value</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
      </fieldset>
    </div>
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <p>Hover, press and focus them. Precedence: disabled, hover. A disabled slider ignores the pointer and the keys.</p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">default</p>
        <Slider id="cond-default" label="Brightness (default)" value={60} showValue />
      </div>
      <div class="panel">
        <p class="panel-title">disabled</p>
        <Slider id="cond-disabled" label="Brightness (disabled)" value={60} showValue disabled />
      </div>
      <div class="panel">
        <p class="panel-title">at min, without value</p>
        <Slider id="cond-min" label="Brightness (at min)" value={0} />
      </div>
      <div class="panel">
        <p class="panel-title">at max</p>
        <Slider id="cond-max" label="Brightness (at max)" value={100} showValue />
      </div>
    </div>
  </section>

  <section id="steps" aria-labelledby="steps-title">
    <h2 id="steps-title">Steps, decimals and locales</h2>
    <p>
      Steps are counted from min, and max is always reachable, even when the range is not a multiple of the step. The
      value is shown and announced in the separators of the locale; its width is reserved for the widest of min and max
      so that the track does not move.
    </p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Price ceiling, step 50</p>
        <Field label="Maximum price">
          <Slider id="price" bind:value={price} min={0} max={1000} step={50} showValue />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">0 to 10, step 3</p>
        <Slider id="thirds" label="Thirds" bind:value={thirds} min={0} max={10} step={3} showValue />
        <p class="readout" data-testid="thirds">Value: {thirds}</p>
      </div>
      {#each locales as l (l)}
        <div class="panel">
          <p class="panel-title">Opacity, step 0.05 · {l}</p>
          <Slider
            id={`locale-${l}`}
            label={`Opacity (${l})`}
            bind:value={opacity}
            min={0}
            max={1}
            step={0.05}
            locale={l}
            showValue
          />
        </div>
      {/each}
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">In a form</h2>
    <p>With a name, the value is submitted as a plain decimal number. A disabled slider is not submitted.</p>
    <form
      id="settings"
      class="stack narrow-form"
      onsubmit={(event) => {
        event.preventDefault();
        submitted = [...new FormData(event.currentTarget)].map(([k, v]) => `${k}=${String(v)}`).join('&');
      }}
    >
      <Field label="Zoom"
        ><Slider id="form-zoom" name="zoom" value={1.5} min={0.5} max={3} step={0.25} showValue /></Field
      >
      <Slider id="form-disabled" name="contrast" label="Contrast" value={20} disabled />
      <div><Button id="submit" type="submit" label="Submit" /></div>
    </form>
    <p class="readout" data-testid="submitted">Submitted: {submitted || 'nothing yet'}</p>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Value 150 set by the application, max 100</p>
        <Slider id="outside" label="Outside the range" bind:value={outside} showValue />
        <p class="readout" data-testid="outside">Value: {outside}</p>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <div dir="rtl" lang="ar">
          <Slider id="rtl" label="مستوى الصوت" value={25} locale="ar-EG" showValue />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Narrow (8rem), large values</p>
        <div class="narrow">
          <Slider id="narrow" label="Budget" value={50000} min={0} max={100000} step={1000} showValue />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Consumer onkeydown runs first</p>
        <Slider id="consumer" label="Counted keys" value={10} onkeydown={() => consumerKeys++} />
        <p class="readout" data-testid="consumer-keys">Keys seen by the application: {consumerKeys}</p>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .stage-field {
    inline-size: min(100%, 24rem);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-md);
  }
  .narrow {
    inline-size: 8rem;
  }
  .narrow-form {
    max-inline-size: 24rem;
  }
  .show-targets :global(.ggb-slider__thumb::before),
  .show-targets :global(.ggb-slider__control::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
