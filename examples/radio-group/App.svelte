<script lang="ts">
  // RadioGroup and Radio implementation review: a playground with every option, sizes and conditions, keyboard
  // navigation, horizontal wrapping, descriptions and a required question in a Field, in any brand, appearance and
  // density.
  import { Field, Radio, RadioGroup } from '../../packages/svelte/src/index.ts';
  import type { RadioGroupOrientation, RadioGroupSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: RadioGroupSize[] = ['sm', 'md', 'lg'];
  const orientations: RadioGroupOrientation[] = ['vertical', 'horizontal'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  let value = $state('');
  let size = $state<RadioGroupSize>('md');
  let orientation = $state<RadioGroupOrientation>('vertical');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let expressDisabled = $state(false);
  let withDescriptions = $state(false);
  let changes = $state(0);

  let delivery = $state('');
  let tried = $state(false);
  let answer = $state('yes');
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
    <h1>RadioGroup</h1>
    <p class="lede">
      Exactly one choice among a few options that all stay visible. The group is one tab stop: arrows move and select,
      Space selects, and a choice cannot be undone to no selection. Every control below is the real Svelte component on
      the approved tokens.
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
        <div class="column">
          <button type="button" id="before">Before</button>
          <RadioGroup
            id="play"
            label="Delivery speed"
            bind:value
            {size}
            {orientation}
            {disabled}
            {readonly}
            {invalid}
            onvaluechange={() => changes++}
          >
            <Radio
              id="play-standard"
              value="standard"
              label="Standard"
              description={withDescriptions ? '3 to 5 business days, free.' : undefined}
            />
            <Radio
              id="play-express"
              value="express"
              label="Express"
              description={withDescriptions ? 'Next business day, 9 €.' : undefined}
              disabled={expressDisabled}
            />
            <Radio
              id="play-pickup"
              value="pickup"
              label="Pick up in store"
              description={withDescriptions ? 'Ready in 2 hours.' : undefined}
            />
          </RadioGroup>
          <button type="button" id="after">After</button>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: “{value}”</span> · <span data-testid="changes">Changes: {changes}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Orientation <select id="opt-orientation" bind:value={orientation}
            >{#each orientations as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"
          ><input id="opt-descriptions" type="checkbox" bind:checked={withDescriptions} /> Descriptions</label
        >
        <label class="check"
          ><input id="opt-express-disabled" type="checkbox" bind:checked={expressDisabled} /> Express disabled</label
        >
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <button type="button" id="opt-reset" onclick={() => (value = '')}>Clear the value (application)</button>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes and conditions</h2>
    <p>Hover them. Precedence: disabled, readonly, invalid, hover. Readonly and disabled circles are not filled.</p>
    <div class="grid">
      {#each sizes as s (s)}
        {#each conditions as c (c)}
          <div class="panel">
            <p class="panel-title">{s} · {c}</p>
            <RadioGroup
              id={`rg-${c}-${s}`}
              label={`Plan (${s} ${c})`}
              size={s}
              value="team"
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            >
              <Radio id={`rg-${c}-${s}-solo`} value="solo" label="Solo" />
              <Radio id={`rg-${c}-${s}-team`} value="team" label="Team" />
            </RadioGroup>
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Required question in a Field</p>
        <form
          class="stack"
          onsubmit={(e) => {
            e.preventDefault();
            tried = true;
          }}
        >
          <Field
            label="How should we deliver?"
            description="You can change it until the order ships."
            required
            invalid={tried && !delivery}
            message="Choose a delivery method."
          >
            <RadioGroup id="delivery" bind:value={delivery} name="delivery">
              <Radio id="delivery-home" value="home" label="Home delivery" description="2 to 4 business days." />
              <Radio id="delivery-locker" value="locker" label="Parcel locker" description="Open 24/7, near you." />
            </RadioGroup>
          </Field>
          <button type="submit" id="delivery-submit">Continue</button>
        </form>
      </div>
      <div class="panel">
        <p class="panel-title">Horizontal, wrapping in a narrow column</p>
        <div class="narrow">
          <RadioGroup id="wrap" label="Rating" orientation="horizontal" value="3">
            {#each ['1', '2', '3', '4', '5'] as n (n)}<Radio id={`wrap-${n}`} value={n} label={`${n} stars`} />{/each}
          </RadioGroup>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Short horizontal answer</p>
        <RadioGroup id="yes-no" label="Was this helpful?" orientation="horizontal" bind:value={answer}>
          <Radio id="yes" value="yes" label="Yes" />
          <Radio id="no" value="no" label="No" />
        </RadioGroup>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ggb-space-content-md);
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ggb-space-content-md);
  }
  .narrow {
    inline-size: 14rem;
  }
  .show-targets :global(.ggb-radio::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
