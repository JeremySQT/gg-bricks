<script lang="ts">
  // Checkbox implementation review: a playground with every option, sizes and conditions in both selections,
  // indeterminate select-all, table row selectors with hidden labels, descriptions, a required acceptance in a Field,
  // in any brand, appearance and density.
  import { Checkbox, Field } from '../../packages/svelte/src/index.ts';
  import type { CheckboxSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: CheckboxSize[] = ['sm', 'md', 'lg'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;
  const selections = ['off', 'on', 'indeterminate'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  let checked = $state(false);
  let indeterminate = $state(false);
  let size = $state<CheckboxSize>('md');
  let label = $state('Email me about product updates');
  let description = $state('');
  let hideLabel = $state(false);
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let changes = $state(0);

  // Select all
  const rows = ['Invoice 1024', 'Invoice 1025', 'Invoice 1026'];
  let selected = $state<Record<string, boolean>>({
    'Invoice 1024': true,
    'Invoice 1025': false,
    'Invoice 1026': false
  });
  const count = $derived(rows.filter((r) => selected[r]).length);
  const all = $derived(count === rows.length);
  const some = $derived(count > 0 && count < rows.length);
  function selectAll(value: boolean) {
    for (const r of rows) selected[r] = value;
  }

  // Terms
  let accepted = $state(false);
  let submittedTerms = $state(false);
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
    <h1>Checkbox</h1>
    <p class="lede">
      Turns one option on or off, independently of the others, for a choice confirmed later. A press on the box, the
      label or the description toggles it; the box sits on the first line of the label. Every control below is the real
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
        <Checkbox
          id="play"
          bind:checked
          bind:indeterminate
          {size}
          label={label.trim() || 'Email me about product updates'}
          description={description || undefined}
          {hideLabel}
          {disabled}
          {readonly}
          {invalid}
          oncheckedchange={() => changes++}
        />
        <p class="readout" aria-live="polite">
          <span data-testid="state">checked: {checked} · indeterminate: {indeterminate}</span> ·
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
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Description <input id="opt-description" type="text" bind:value={description} /></label>
        <label class="check"
          ><input id="opt-indeterminate" type="checkbox" bind:checked={indeterminate} /> Indeterminate</label
        >
        <label class="check"><input id="opt-hide" type="checkbox" bind:checked={hideLabel} /> Hide label</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Conditions and selections</h2>
    <p>Hover them. Precedence: disabled, readonly, invalid, hover. Readonly and disabled boxes are not filled.</p>
    {#each sizes as s (s)}
      <h3>Size {s}</h3>
      <div class="matrix states">
        <span></span>
        {#each selections as sel (sel)}<span class="col-head">{sel}</span>{/each}
        {#each conditions as c (c)}
          <span class="row-head">{c}</span>
          {#each selections as sel (sel)}
            <div>
              <Checkbox
                id={`cb-${c}-${sel}-${s}`}
                size={s}
                label="Option"
                checked={sel === 'on'}
                indeterminate={sel === 'indeterminate'}
                disabled={c === 'disabled'}
                readonly={c === 'readonly'}
                invalid={c === 'invalid'}
              />
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Options with descriptions</p>
        <div class="stack">
          <Checkbox
            id="desc-1"
            label="Weekly summary"
            description="A digest of activity in your projects, every Monday."
            checked
          />
          <Checkbox
            id="desc-2"
            label="Mentions"
            description="When someone mentions you in a comment or a task, including long threads that wrap."
          />
          <Checkbox id="desc-3" label="Product news" description="A few times a year." disabled />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Required acceptance in a Field</p>
        <form
          class="stack"
          onsubmit={(e) => {
            e.preventDefault();
            submittedTerms = true;
          }}
        >
          <Field
            label="Terms of service"
            required
            invalid={submittedTerms && !accepted}
            message="Accept the terms to create your account."
          >
            <Checkbox id="terms" bind:checked={accepted} label="I accept the terms of service and the privacy policy" />
          </Field>
          <button type="submit" id="terms-submit">Create account</button>
        </form>
      </div>
      <div class="panel wide">
        <p class="panel-title">Table selection: hidden labels, select all (indeterminate)</p>
        <table>
          <thead>
            <tr>
              <th scope="col" class="select">
                <Checkbox
                  id="select-all"
                  size="sm"
                  hideLabel
                  label="Select all invoices"
                  checked={all}
                  indeterminate={some}
                  oncheckedchange={(v) => selectAll(v)}
                />
              </th>
              <th scope="col">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row)}
              <tr>
                <td class="select">
                  <Checkbox
                    id={`row-${row.split(' ')[1]}`}
                    size="sm"
                    hideLabel
                    label={`Select ${row}`}
                    bind:checked={selected[row]}
                  />
                </td>
                <td>{row}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="readout" data-testid="selected">{count} selected</p>
      </div>
      <div class="panel">
        <p class="panel-title">Long label in a narrow column</p>
        <div class="narrow">
          <Checkbox id="long" label="Remember this device for thirty days on this browser and this computer only" />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .states {
    grid-template-columns: max-content repeat(3, max-content);
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ggb-space-content-md);
  }
  .wide {
    grid-column: 1 / -1;
  }
  .narrow {
    inline-size: 12rem;
  }
  table {
    inline-size: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: var(--ggb-space-content-xs) var(--ggb-space-content-sm);
    text-align: start;
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .select {
    inline-size: 1%;
  }
  .show-targets :global(.ggb-checkbox::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
