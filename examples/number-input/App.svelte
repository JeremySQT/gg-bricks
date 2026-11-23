<script lang="ts">
  // NumberInput implementation review: a playground with every option, sizes beside InputText and Buttons,
  // conditions, steppers at the bounds, locales, form submission and difficult cases, in any brand, appearance and
  // density.
  import { Button, Field, InputText, NumberInput } from '../../packages/svelte/src/index.ts';
  import type { NumberInputSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: NumberInputSize[] = ['sm', 'md', 'lg'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;
  const locales = ['en', 'fr', 'de', 'de-CH', 'hi-IN', 'ar-EG'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let value = $state<number | undefined>(3);
  let size = $state<NumberInputSize>('md');
  let minText = $state('0');
  let maxText = $state('99');
  let stepText = $state('1');
  let locale = $state('en');
  let placeholder = $state('');
  let hideSteppers = $state(false);
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let required = $state(false);
  let changes = $state(0);
  const num = (t: string) => (t.trim() === '' || Number.isNaN(Number(t)) ? undefined : Number(t));

  // Compositions
  let amount = $state<number | undefined>(1234.5);
  let ratio = $state<number | undefined>(0.2);
  let temperature = $state<number | undefined>(-4);
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
    <h1>NumberInput</h1>
    <p class="lede">
      One number, typed or stepped. It looks like an InputText of the same size, shows the number in the separators of
      its locale, reads what the user types when Enter is pressed or focus leaves, and keeps it within min and max. Up
      and Down Arrow step by one step, Shift with them or Page Up and Page Down by ten. Every control below is the real
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
          <Field label="Quantity" description="Between the minimum and the maximum." {required}>
            <NumberInput
              id="play"
              bind:value
              {size}
              min={num(minText)}
              max={num(maxText)}
              step={num(stepText) ?? 1}
              {locale}
              placeholder={placeholder || undefined}
              {hideSteppers}
              {disabled}
              {readonly}
              {invalid}
              onvaluechange={() => changes++}
            />
          </Field>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: {value === undefined ? 'none' : String(value)}</span> ·
          <span data-testid="changes">Changes: {changes}</span>
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
          >Locale <select id="opt-locale" bind:value={locale}
            >{#each locales as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Min <input id="opt-min" type="text" bind:value={minText} /></label>
        <label>Max <input id="opt-max" type="text" bind:value={maxText} /></label>
        <label>Step <input id="opt-step" type="text" bind:value={stepText} /></label>
        <label>Placeholder <input id="opt-placeholder" type="text" bind:value={placeholder} /></label>
        <label class="check"><input id="opt-hide" type="checkbox" bind:checked={hideSteppers} /> Hide steppers</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <label class="check"><input id="opt-required" type="checkbox" bind:checked={required} /> Required</label>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes beside InputText and Buttons</h2>
    <p>
      Same height as the InputText and the Button of the same size. The steppers are one step smaller than the field and
      sit at the same distance from its edge as from its top and bottom, in every size, sm included.
    </p>
    {#each sizes as s (s)}
      <div class="row align" data-testid={`align-${s}`}>
        <div class="grow">
          <NumberInput id={`size-${s}`} size={s} label={`Guests (${s})`} value={2} min={1} max={12} />
        </div>
        <div class="grow">
          <InputText id={`text-${s}`} size={s} label={`Name (${s})`} placeholder="Ada Lovelace" />
        </div>
        <Button id={`align-button-${s}`} size={s} intent="neutral" appearance="outline" label="Book" />
      </div>
    {/each}
    <h3>Without steppers</h3>
    {#each sizes as s (s)}
      <div class="row align">
        <div class="grow">
          <NumberInput id={`plain-${s}`} size={s} label={`Distance in km (${s})`} value={1815} hideSteppers />
        </div>
        <div class="grow">
          <InputText id={`plain-text-${s}`} size={s} label={`Town (${s})`} value="London" />
        </div>
      </div>
    {/each}
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <p>
      Hover and focus them. Precedence: disabled, readonly, invalid, focus, hover. Readonly stays focusable and
      selectable; its steppers are disabled. The bottom row starts empty.
    </p>
    <div class="grid">
      {#each conditions as c (c)}
        <div class="panel">
          <p class="panel-title">{c}</p>
          <div class="stack">
            <NumberInput
              id={`cond-${c}`}
              label={`Seats (${c})`}
              value={4}
              min={0}
              max={10}
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
            <NumberInput
              id={`cond-${c}-empty`}
              label={`Seats, empty (${c})`}
              placeholder="0"
              min={0}
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="bounds" aria-labelledby="bounds-title">
    <h2 id="bounds-title">Bounds and steps</h2>
    <p>
      Decrease is disabled at min and increase at max. A typed number outside the range becomes min or max when it is
      committed; text that is not a number returns to the last value. Stepping goes to the next multiple of the step.
    </p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">At max (0 to 10)</p>
        <NumberInput id="at-max" label="Rating" value={10} min={0} max={10} />
      </div>
      <div class="panel">
        <p class="panel-title">At min (0 to 10)</p>
        <NumberInput id="at-min" label="Children" value={0} min={0} max={10} />
      </div>
      <div class="panel">
        <p class="panel-title">Step 5 from min 1</p>
        <NumberInput id="step-five" label="Batch" value={3} min={1} max={100} step={5} />
      </div>
      <div class="panel">
        <p class="panel-title">Step 0.1</p>
        <Field label="Ratio"><NumberInput id="ratio" bind:value={ratio} step={0.1} min={0} max={1} /></Field>
        <p class="readout" data-testid="ratio">Value: {ratio ?? 'none'}</p>
      </div>
      <div class="panel">
        <p class="panel-title">Negative, no bounds</p>
        <Field label="Temperature (°C)"><NumberInput id="temperature" bind:value={temperature} /></Field>
      </div>
    </div>
  </section>

  <section id="locales" aria-labelledby="locales-title">
    <h2 id="locales-title">Locales</h2>
    <p>
      The same amount, 1234567.89 with a step of 0.01, in each locale: grouping and decimal separators follow it, and
      typing accepts them. The period is also accepted as decimal separator where it does not group digits.
    </p>
    <div class="grid">
      {#each locales as l (l)}
        <div class="panel">
          <p class="panel-title">{l}</p>
          <NumberInput id={`locale-${l}`} label={`Amount (${l})`} locale={l} value={1234567.89} step={0.01} />
        </div>
      {/each}
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">In a form</h2>
    <p>
      With a name, the value is submitted as a plain decimal number (period, no grouping). A disabled field is not
      submitted; a readonly one is. Enter commits the text and submits the form.
    </p>
    <form
      id="order"
      class="stack narrow-form"
      onsubmit={(event) => {
        event.preventDefault();
        submitted = [...new FormData(event.currentTarget)].map(([k, v]) => `${k}=${String(v)}`).join('&');
      }}
    >
      <Field label="Amount (fr)">
        <NumberInput id="form-amount" name="amount" locale="fr" bind:value={amount} step={0.01} min={0} />
      </Field>
      <NumberInput id="form-readonly" name="fee" label="Fee" value={2.5} step={0.01} readonly />
      <NumberInput id="form-disabled" name="discount" label="Discount" value={5} disabled />
      <div><Button id="submit" type="submit" label="Submit" /></div>
    </form>
    <p class="readout" data-testid="submitted">Submitted: {submitted || 'nothing yet'}</p>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Narrow (8rem), long number</p>
        <div class="narrow">
          <NumberInput id="narrow" label="Population" value={8123456789} />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Consumer onkeydown runs first</p>
        <NumberInput id="consumer" label="Counted keys" value={1} onkeydown={() => consumerKeys++} />
        <p class="readout" data-testid="consumer-keys">Keys seen by the application: {consumerKeys}</p>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <div dir="rtl" lang="ar">
          <NumberInput id="rtl" label="الكمية" locale="ar-EG" value={12} min={0} />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .stage-field {
    inline-size: min(100%, 20rem);
  }
  .align {
    flex-wrap: nowrap;
    margin-block-end: var(--ggb-space-content-md);
    max-inline-size: 40rem;
  }
  .grow {
    flex: 1;
    min-inline-size: 0;
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
    max-inline-size: 20rem;
  }
  .show-targets :global(.ggb-number-input::before),
  .show-targets :global(.ggb-number-input__stepper::before),
  .show-targets :global(.ggb-input-text::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
