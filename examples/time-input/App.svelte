<script lang="ts">
  // TimeInput implementation review: a playground with every option, sizes beside InputText, conditions, hour
  // cycles and locales, form submission and difficult cases, in any brand, appearance and density.
  import { Button, Field, InputText, TimeInput } from '../../packages/svelte/src/index.ts';
  import type { TimeInputHourCycle, TimeInputSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: TimeInputSize[] = ['sm', 'md', 'lg'];
  const cycles: TimeInputHourCycle[] = ['auto', 'h12', 'h23'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;
  const locales = ['en', 'en-GB', 'fr', 'de', 'ja', 'ko', 'ar-EG'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let value = $state('09:30');
  let size = $state<TimeInputSize>('md');
  let locale = $state('en');
  let hourCycle = $state<TimeInputHourCycle>('auto');
  let seconds = $state(false);
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let required = $state(false);
  let changes = $state(0);

  // Compositions
  let departure = $state('');
  let submitted = $state('');
  let external = $state('18:45');
  let afternoonKo = $state('14:05');
  let opening = $state('');
  let afternoonFr = $state('14:05');
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
    <h1>TimeInput</h1>
    <p class="lede">
      One time of day, typed part by part: hour, minute, seconds when asked, and the day period on a 12-hour clock. The
      order, the separators and the hour cycle follow the locale. Type digits, use Up and Down Arrow in a part, Left and
      Right Arrow between parts, Backspace to clear. Every control below is the real Svelte component on the approved
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
          <Field label="Opening time" description="Local time of the shop." {required}>
            <TimeInput
              id="play"
              bind:value
              {size}
              {locale}
              {hourCycle}
              {seconds}
              {disabled}
              {readonly}
              {invalid}
              onvaluechange={() => changes++}
            />
          </Field>
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
          >Locale <select id="opt-locale" bind:value={locale}
            >{#each locales as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Hour cycle <select id="opt-cycle" bind:value={hourCycle}
            >{#each cycles as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-seconds" type="checkbox" bind:checked={seconds} /> Seconds</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <label class="check"><input id="opt-required" type="checkbox" bind:checked={required} /> Required</label>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes beside InputText and Buttons</h2>
    <p>Same height, same text start and same text size as the InputText and the Button of the same size.</p>
    {#each sizes as s (s)}
      <div class="row align">
        <div class="grow"><TimeInput id={`size-${s}`} size={s} label={`Start (${s})`} value="08:15" /></div>
        <div class="grow"><InputText id={`text-${s}`} size={s} label={`Place (${s})`} value="Main hall" /></div>
        <Button id={`align-button-${s}`} size={s} intent="neutral" appearance="outline" label="Save" />
      </div>
    {/each}
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <p>
      Hover and focus them. Precedence: disabled, readonly, invalid, focus, hover. Readonly parts stay focusable and are
      announced but cannot change. The bottom row starts empty.
    </p>
    <div class="grid">
      {#each conditions as c (c)}
        <div class="panel">
          <p class="panel-title">{c}</p>
          <div class="stack">
            <TimeInput
              id={`cond-${c}`}
              label={`Arrival (${c})`}
              value="14:05"
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
            <TimeInput
              id={`cond-${c}-empty`}
              label={`Arrival, empty (${c})`}
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="locales" aria-labelledby="locales-title">
    <h2 id="locales-title">Hour cycles and locales</h2>
    <p>
      The same time, 14:05:30, with seconds, in each locale and hour cycle. The value stays 24-hour whatever is shown;
      the parts are named in the locale for assistive technology.
    </p>
    <div class="matrix-grid">
      {#each locales as l (l)}
        {#each cycles as c (c)}
          <div class="cell">
            <p class="panel-title">{l} · {c}</p>
            <TimeInput
              id={`locale-${l}-${c}`}
              label={`Time (${l}, ${c})`}
              locale={l}
              hourCycle={c}
              value="14:05:30"
              seconds
            />
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">In a form</h2>
    <p>
      With a name, the value is submitted as typed in the value format (HH:mm). A disabled field is not submitted; a
      readonly one is.
    </p>
    <form
      id="booking"
      class="stack narrow-form"
      onsubmit={(event) => {
        event.preventDefault();
        submitted = [...new FormData(event.currentTarget)].map(([k, v]) => `${k}=${String(v)}`).join('&');
      }}
    >
      <Field label="Departure"><TimeInput id="form-departure" name="departure" bind:value={departure} /></Field>
      <TimeInput id="form-readonly" name="checkin" label="Check-in" value="15:00" readonly />
      <TimeInput id="form-disabled" name="checkout" label="Check-out" value="11:00" disabled />
      <div><Button id="submit" type="submit" label="Submit" /></div>
    </form>
    <p class="readout" data-testid="submitted">Submitted: {submitted || 'nothing yet'}</p>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Value set by the application</p>
        <TimeInput id="external" label="Reminder" bind:value={external} />
        <div class="row">
          <Button
            id="set-noon"
            size="sm"
            intent="neutral"
            appearance="outline"
            label="Noon"
            onactivate={() => (external = '12:00')}
          />
          <Button
            id="set-clear"
            size="sm"
            intent="neutral"
            appearance="outline"
            label="Clear"
            onactivate={() => (external = '')}
          />
          <Button
            id="set-bad"
            size="sm"
            intent="neutral"
            appearance="outline"
            label="25:99"
            onactivate={() => (external = '25:99')}
          />
        </div>
        <p class="readout" data-testid="external">Value: “{external}”</p>
      </div>
      <div class="panel">
        <p class="panel-title">Narrow (7rem), seconds, 12 hours</p>
        <div class="narrow"><TimeInput id="narrow" label="Lap" value="23:59:59" seconds hourCycle="h12" /></div>
      </div>
      <div class="panel">
        <p class="panel-title">Bounded, 09:00 to 18:00</p>
        <Field label="Pick-up time" description="Between 9:00 and 18:00.">
          <TimeInput id="bounded" bind:value={opening} min="09:00" max="18:00" hourCycle="h23" />
        </Field>
        <p class="readout" data-testid="bounded">Value: “{opening}”</p>
      </div>
      <div class="panel">
        <p class="panel-title">Afternoon on a 12-hour clock</p>
        <div class="stack">
          <TimeInput id="pm-ko" label="오후 시간" locale="ko" bind:value={afternoonKo} />
          <p class="readout" data-testid="pm-ko">Value: “{afternoonKo}”</p>
          <TimeInput id="pm-fr" label="Heure (h12)" locale="fr" hourCycle="h12" bind:value={afternoonFr} />
          <p class="readout" data-testid="pm-fr">Value: “{afternoonFr}”</p>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <div dir="rtl" lang="ar"><TimeInput id="rtl" label="الوقت" locale="ar-EG" value="09:30" /></div>
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
  .matrix-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--ggb-space-content-md);
  }
  .cell .panel-title {
    margin-block-end: var(--ggb-space-content-xs);
  }
  .narrow {
    inline-size: 7rem;
  }
  .narrow-form {
    max-inline-size: 20rem;
  }
  .show-targets :global(.ggb-time-input::before),
  .show-targets :global(.ggb-input-text::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
