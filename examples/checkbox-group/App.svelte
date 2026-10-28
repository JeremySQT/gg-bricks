<script lang="ts">
  // CheckboxGroup implementation review: a playground with every option, sizes and conditions, the value in source
  // order, horizontal wrapping, descriptions and a required question (at least one) in a Field, in any brand,
  // appearance and density.
  import { Checkbox, CheckboxGroup, Field } from '../../packages/svelte/src/index.ts';
  import type { CheckboxGroupOrientation, CheckboxGroupSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: CheckboxGroupSize[] = ['sm', 'md', 'lg'];
  const orientations: CheckboxGroupOrientation[] = ['vertical', 'horizontal'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  let value = $state<string[]>([]);
  let size = $state<CheckboxGroupSize>('md');
  let orientation = $state<CheckboxGroupOrientation>('vertical');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let smsDisabled = $state(false);
  let withDescriptions = $state(false);
  let changes = $state(0);

  let channels = $state<string[]>([]);
  let tried = $state(false);
  let days = $state<string[]>(['mon', 'wed']);

  const toppings = [
    ['cheese', 'Cheese'],
    ['ham', 'Ham'],
    ['mushrooms', 'Mushrooms'],
    ['olives', 'Olives'],
    ['peppers', 'Peppers']
  ];
  let picked = $state<string[]>(['ham']);
  const all = $derived(picked.length === toppings.length);
  const some = $derived(picked.length > 0 && !all);
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
    <h1>CheckboxGroup</h1>
    <p class="lede">
      Several related checkboxes that answer one question; any number can be checked. Each checkbox is its own tab stop
      and Space toggles it. The value lists the checked options in their order on the page. Every control below is the
      real Svelte component on the approved tokens.
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
          <CheckboxGroup
            id="play"
            label="Notification channels"
            bind:value
            {size}
            {orientation}
            {disabled}
            {readonly}
            {invalid}
            onvaluechange={() => changes++}
          >
            <Checkbox
              id="play-email"
              value="email"
              label="Email"
              description={withDescriptions ? 'A summary every morning.' : undefined}
            />
            <Checkbox
              id="play-sms"
              value="sms"
              label="Text message"
              description={withDescriptions ? 'Only urgent alerts.' : undefined}
              disabled={smsDisabled}
            />
            <Checkbox
              id="play-push"
              value="push"
              label="Push notification"
              description={withDescriptions ? 'On this device.' : undefined}
            />
          </CheckboxGroup>
          <button type="button" id="after">After</button>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: [{value.join(', ')}]</span> ·
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
          >Orientation <select id="opt-orientation" bind:value={orientation}
            >{#each orientations as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"
          ><input id="opt-descriptions" type="checkbox" bind:checked={withDescriptions} /> Descriptions</label
        >
        <label class="check"
          ><input id="opt-sms-disabled" type="checkbox" bind:checked={smsDisabled} /> Text message disabled</label
        >
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <button type="button" id="opt-set" onclick={() => (value = ['push', 'email'])}
          >Set push and email (application)</button
        >
        <button type="button" id="opt-reset" onclick={() => (value = [])}>Clear (application)</button>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes and conditions</h2>
    <p>
      Hover them. The group passes its size and condition to every checkbox; precedence disabled, readonly, invalid.
    </p>
    <div class="grid">
      {#each sizes as s (s)}
        {#each conditions as c (c)}
          <div class="panel">
            <p class="panel-title">{s} · {c}</p>
            <CheckboxGroup
              id={`cg-${c}-${s}`}
              label={`Extras (${s} ${c})`}
              size={s}
              value={['wifi']}
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            >
              <Checkbox id={`cg-${c}-${s}-wifi`} value="wifi" label="Wi-Fi" />
              <Checkbox id={`cg-${c}-${s}-parking`} value="parking" label="Parking" />
            </CheckboxGroup>
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Required question (at least one) in a Field</p>
        <form
          class="stack"
          onsubmit={(e) => {
            e.preventDefault();
            tried = true;
          }}
        >
          <Field
            label="How can we reach you?"
            description="Select at least one channel."
            required
            invalid={tried && channels.length === 0}
            message="Select at least one channel."
          >
            <CheckboxGroup id="channels" bind:value={channels} name="channels">
              <Checkbox id="channels-email" value="email" label="Email" />
              <Checkbox id="channels-phone" value="phone" label="Phone call" />
              <Checkbox id="channels-post" value="post" label="Post" description="Invoices only." />
            </CheckboxGroup>
          </Field>
          <button type="submit" id="channels-submit">Continue</button>
        </form>
      </div>
      <div class="panel">
        <p class="panel-title">Horizontal, wrapping in a narrow column</p>
        <div class="narrow">
          <CheckboxGroup id="days" label="Delivery days" orientation="horizontal" bind:value={days}>
            {#each [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday']] as [v, l] (v)}
              <Checkbox id={`days-${v}`} value={v} label={l} />
            {/each}
          </CheckboxGroup>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Select all, outside the group</p>
        <div class="stack">
          <Checkbox
            id="toppings-all"
            label="All toppings"
            checked={all}
            indeterminate={some}
            oncheckedchange={(on) => (picked = on ? toppings.map(([v]) => v) : [])}
          />
          <div class="indent">
            <CheckboxGroup id="toppings" label="Toppings" bind:value={picked}>
              {#each toppings as [v, l] (v)}<Checkbox id={`toppings-${v}`} value={v} label={l} />{/each}
            </CheckboxGroup>
          </div>
        </div>
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
    gap: var(--ggb-space-content-sm);
  }
  .indent {
    padding-inline-start: var(--ggb-space-content-lg);
  }
  .narrow {
    inline-size: 16rem;
  }
  .show-targets :global(.ggb-checkbox::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
