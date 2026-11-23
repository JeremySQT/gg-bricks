<script lang="ts">
  // DatePicker implementation review: a playground with every option, sizes beside InputText, conditions, locales,
  // bounds, a date with a time, form submission and difficult cases, in any brand, appearance and density.
  import { Button, DatePicker, Field, InputText, TimeInput } from '../../packages/svelte/src/index.ts';
  import type { DatePickerSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: DatePickerSize[] = ['sm', 'md', 'lg'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;
  const locales = ['en', 'en-GB', 'fr', 'de', 'ja', 'ar-EG', 'th-TH'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let value = $state('2026-11-23');
  let open = $state(false);
  let size = $state<DatePickerSize>('md');
  let locale = $state('en');
  let min = $state('');
  let max = $state('');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let required = $state(false);
  let changes = $state(0);
  let opens = $state(0);

  // Compositions
  let start = $state('');
  let startTime = $state('');
  let bounded = $state('2026-11-23');
  let external = $state('2026-01-31');
  let submitted = $state('');
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
    <h1>DatePicker</h1>
    <p class="lede">
      One calendar date, typed part by part or chosen in a calendar. The parts follow the order and separators of the
      locale; the calendar button opens a month view with six weeks. In the calendar, arrows move by day and week, Page
      Up and Page Down by month, with Shift by year, Home and End to the week's ends, Enter chooses. Every control below
      is the real Svelte component on the approved tokens.
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
          <Field label="Appointment" description="Day of your visit." {required}>
            <DatePicker
              id="play"
              bind:value
              bind:open
              {size}
              {locale}
              min={min || undefined}
              max={max || undefined}
              {disabled}
              {readonly}
              {invalid}
              onvaluechange={() => changes++}
              onopenchange={(o) => o && opens++}
            />
          </Field>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: “{value}”</span> · <span data-testid="changes">Changes: {changes}</span> ·
          <span data-testid="open">Open: {open}</span> · <span data-testid="opens">Opens: {opens}</span>
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
        <label>Min <input id="opt-min" type="text" placeholder="YYYY-MM-DD" bind:value={min} /></label>
        <label>Max <input id="opt-max" type="text" placeholder="YYYY-MM-DD" bind:value={max} /></label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <label class="check"><input id="opt-required" type="checkbox" bind:checked={required} /> Required</label>
        <Button
          id="opt-open"
          size="sm"
          intent="neutral"
          appearance="outline"
          label="Open from the application"
          onactivate={() => (open = true)}
        />
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes beside InputText and Buttons</h2>
    <p>
      The field has the height of the InputText and the Button of the same size; the calendar button is one step smaller
      and sits as far from the edge as from the top and bottom. The calendar itself has no size.
    </p>
    {#each sizes as s (s)}
      <div class="row align">
        <div class="grow"><DatePicker id={`size-${s}`} size={s} label={`Due date (${s})`} value="2026-03-09" /></div>
        <div class="grow"><InputText id={`text-${s}`} size={s} label={`Task (${s})`} value="Quarterly report" /></div>
        <Button id={`align-button-${s}`} size={s} intent="neutral" appearance="outline" label="Save" />
      </div>
    {/each}
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <p>
      Hover and focus them. Precedence: disabled, readonly, invalid, focus, hover. Readonly parts stay focusable; the
      calendar button of a readonly or disabled date picker is disabled. The bottom row starts empty.
    </p>
    <div class="grid">
      {#each conditions as c (c)}
        <div class="panel">
          <p class="panel-title">{c}</p>
          <div class="stack">
            <DatePicker
              id={`cond-${c}`}
              label={`Delivery (${c})`}
              value="2026-07-14"
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
            <DatePicker
              id={`cond-${c}-empty`}
              label={`Delivery, empty (${c})`}
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
    <h2 id="locales-title">Locales</h2>
    <p>
      The same date, 14 July 2026, in each locale: order, separators and placeholders of the parts, month and day names
      and the first day of the week follow it. The Thai locale keeps the Gregorian calendar. The value stays ISO.
    </p>
    <div class="grid">
      {#each locales as l (l)}
        <div class="panel">
          <p class="panel-title">{l}</p>
          <div class="stack">
            <DatePicker id={`locale-${l}`} label={`Date (${l})`} locale={l} value="2026-07-14" />
            <DatePicker id={`locale-${l}-empty`} label={`Date, empty (${l})`} locale={l} />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="bounds" aria-labelledby="bounds-title">
    <h2 id="bounds-title">Bounds, a date with a time</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Between 10 November and 10 December 2026</p>
        <Field label="Delivery day" description="Within the next four weeks.">
          <DatePicker id="bounded" bind:value={bounded} min="2026-11-10" max="2026-12-10" />
        </Field>
        <p class="readout" data-testid="bounded">Value: “{bounded}”</p>
      </div>
      <div class="panel">
        <p class="panel-title">Composed with a TimeInput</p>
        <div class="row pair">
          <Field label="Start date"><DatePicker id="start" bind:value={start} name="start" /></Field>
          <Field label="Start time"><TimeInput id="start-time" bind:value={startTime} /></Field>
        </div>
      </div>
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">In a form</h2>
    <p>
      With a name, the value is submitted as an ISO 8601 date. A disabled field is not submitted; a readonly one is.
    </p>
    <form
      id="booking"
      class="stack narrow-form"
      onsubmit={(event) => {
        event.preventDefault();
        submitted = [...new FormData(event.currentTarget)].map(([k, v]) => `${k}=${String(v)}`).join('&');
      }}
    >
      <Field label="Arrival"><DatePicker id="form-arrival" name="arrival" value="2026-12-24" /></Field>
      <DatePicker id="form-readonly" name="booked" label="Booked on" value="2026-11-02" readonly />
      <DatePicker id="form-disabled" name="departure" label="Departure" value="2026-12-31" disabled />
      <div><Button id="submit" type="submit" label="Submit" /></div>
    </form>
    <p class="readout" data-testid="submitted">Submitted: {submitted || 'nothing yet'}</p>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Value set by the application</p>
        <DatePicker id="external" label="Reminder" bind:value={external} />
        <div class="row">
          <Button
            id="set-leap"
            size="sm"
            intent="neutral"
            appearance="outline"
            label="29 Feb 2028"
            onactivate={() => (external = '2028-02-29')}
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
            label="2026-02-30"
            onactivate={() => (external = '2026-02-30')}
          />
        </div>
        <p class="readout" data-testid="external">Value: “{external}”</p>
      </div>
      <div class="panel">
        <p class="panel-title">Narrow (9rem)</p>
        <div class="narrow"><DatePicker id="narrow" label="Birthday" value="1990-05-17" /></div>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <div dir="rtl" lang="ar"><DatePicker id="rtl" label="التاريخ" locale="ar-EG" value="2026-07-14" /></div>
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
  .pair > :global(*) {
    flex: 1 1 10rem;
  }
  .narrow {
    inline-size: 9rem;
  }
  .narrow-form {
    max-inline-size: 20rem;
  }
  .show-targets :global(.ggb-date-picker__field::before),
  .show-targets :global(.ggb-date-picker__button::before),
  .show-targets :global(.ggb-date-picker__day::before),
  .show-targets :global(.ggb-input-text::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
