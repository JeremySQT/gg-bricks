<script lang="ts">
  // Select implementation review: a playground in a Field with every option and state, sizes, groups, disabled
  // options, a long list that scrolls, long labels, a placeholder, readonly and disabled, invalid with a message, a
  // dark subtree and a clipping container, in any brand, appearance and density.
  import { Field, Icon, Select } from '../../packages/svelte/src/index.ts';
  import type { SelectOptionsRecord, SelectSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../input-text/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: SelectSize[] = ['sm', 'md', 'lg'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  const languages: SelectOptionsRecord[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
    { value: 'it', label: 'Italiano', disabled: true },
    { value: 'ja', label: '日本語' },
    { value: 'pt', label: 'Português' }
  ];
  const zones: SelectOptionsRecord[] = [
    { value: 'paris', label: 'Paris (UTC+1)', group: 'Europe' },
    { value: 'london', label: 'London (UTC+0)', group: 'Europe' },
    { value: 'berlin', label: 'Berlin (UTC+1)', group: 'Europe' },
    { value: 'ny', label: 'New York (UTC−5)', group: 'Americas' },
    { value: 'sp', label: 'São Paulo (UTC−3)', group: 'Americas' },
    { value: 'tokyo', label: 'Tokyo (UTC+9)', group: 'Asia' },
    { value: 'utc', label: 'Coordinated Universal Time' }
  ];
  const many: SelectOptionsRecord[] = Array.from({ length: 40 }, (_, i) => ({
    value: `item-${i + 1}`,
    label: `Project ${String(i + 1).padStart(2, '0')}`
  }));

  let value = $state('');
  let open = $state(false);
  let size = $state<SelectSize>('md');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let icon = $state(false);
  let changes = $state(0);
</script>

{#snippet globe()}<Icon><path d={glyphs['globe']} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Select</h1>
    <p class="lede">
      One value from a list of known options, shown collapsed in a field. Arrow keys, Enter or Space open the list;
      arrows move the highlight, typing a letter jumps to an option, Enter or Space chooses it; Escape or Tab closes it
      without changing the value. Every control below is the real Svelte component on the approved tokens.
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
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage stage-block">
        <button type="button" id="before">Before</button>
        <Field
          label="Language"
          description="Used for emails and the interface."
          message={invalid ? 'Choose a language.' : undefined}
          {invalid}
        >
          <Select
            id="play"
            options={languages}
            placeholder="Choose a language"
            bind:value
            bind:open
            {size}
            {disabled}
            {readonly}
            leading={icon ? globe : undefined}
            onvaluechange={() => changes++}
          />
        </Field>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="value">Value: {value || 'none'}</span> ·
          <span data-testid="changes">Changes: {changes}</span> · <span data-testid="open">Open: {open}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label><input type="checkbox" id="opt-disabled" bind:checked={disabled} /> Disabled</label>
        <label><input type="checkbox" id="opt-readonly" bind:checked={readonly} /> Readonly</label>
        <label><input type="checkbox" id="opt-invalid" bind:checked={invalid} /> Invalid</label>
        <label><input type="checkbox" id="opt-icon" bind:checked={icon} /> Leading icon</label>
        <button type="button" id="set-de" onclick={() => (value = 'de')}>Select Deutsch from the app</button>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">Size {s}</p>
          <Select id={`size-${s}`} label={`Language, size ${s}`} options={languages} value="fr" size={s} />
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">Groups, a long label, no value</p>
        <Field label="Time zone"><Select id="zones" options={zones} placeholder="Choose a time zone" /></Field>
      </div>
      <div class="panel">
        <p class="panel-title">A long list scrolls; typeahead jumps</p>
        <Field label="Project"><Select id="many" options={many} value="item-20" /></Field>
      </div>
      <div class="panel">
        <p class="panel-title">Readonly and disabled</p>
        <div class="stack">
          <Select id="ro" label="Plan (readonly)" options={languages} value="en" readonly />
          <Select id="off" label="Plan (disabled)" options={languages} value="en" disabled />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a dark subtree and a clipped container</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <div class="clip"><Select id="dark" label="Language (dark)" options={languages} value="es" /></div>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">A narrow column: the panel can be wider than the field</p>
        <div class="narrow">
          <Select id="narrow" label="Time zone (narrow)" options={zones} value="utc" size="sm" />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .stage-block {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    min-inline-size: 0;
  }
  .stage-block :global(.readout) {
    white-space: normal;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-md);
  }
  .narrow {
    max-inline-size: 8rem;
  }
  .dark-panel {
    padding: var(--ggb-space-content-lg);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  .clip {
    block-size: 4rem;
    overflow: hidden;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
</style>
