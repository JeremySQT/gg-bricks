<script lang="ts">
  // Combobox implementation review: a playground in a Field with every option and state, a long list of countries
  // (accents ignored when filtering), groups, disabled options, a search filtered by the application (filter none),
  // an empty result, readonly and disabled, a dark subtree and a clipping container, in any brand, appearance and
  // density.
  import { Combobox, Field, Icon } from '../../packages/svelte/src/index.ts';
  import type { ComboboxOptionsRecord, ComboboxSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../input-text/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: ComboboxSize[] = ['sm', 'md', 'lg'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  const names = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    "Côte d'Ivoire",
    'Croatia',
    'Czechia',
    'Denmark',
    'Egypt',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Iceland',
    'India',
    'Ireland',
    'Italy',
    'Japan',
    'Kenya',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Peru',
    'Poland',
    'Portugal',
    'Réunion',
    'Senegal',
    'South Africa',
    'Spain',
    'Sweden',
    'Switzerland',
    'Türkiye',
    'United Kingdom',
    'United States',
    'Vietnam'
  ];
  const countries: ComboboxOptionsRecord[] = names.map((label) => ({
    value: label.toLowerCase().replace(/[^a-z]+/g, '-'),
    label,
    disabled: label === 'Iceland'
  }));
  const people: ComboboxOptionsRecord[] = [
    { value: 'ada', label: 'Ada Lovelace', group: 'Design' },
    { value: 'grace', label: 'Grace Hopper', group: 'Design' },
    { value: 'alan', label: 'Alan Turing', group: 'Engineering' },
    { value: 'katherine', label: 'Katherine Johnson', group: 'Engineering' },
    { value: 'margaret', label: 'Margaret Hamilton', group: 'Engineering' }
  ];

  let value = $state('');
  let text = $state('');
  let open = $state(false);
  let size = $state<ComboboxSize>('md');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let icon = $state(false);
  let changes = $state(0);
  let edits = $state(0);

  // A search on a "server": the application filters after a short delay (filter none).
  let remote = $state<ComboboxOptionsRecord[]>([]);
  let remoteValue = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  function search(query: string) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      remote = q ? countries.filter((c) => c.label.toLowerCase().startsWith(q)).slice(0, 6) : [];
    }, 150);
  }
</script>

{#snippet search_icon()}<Icon><path d={glyphs['magnifying-glass']} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Combobox</h1>
    <p class="lede">
      One value from a long list, narrowed by typing. Typing filters the list (case and accents ignored) and highlights
      the first match, so that Enter chooses it; Down Arrow opens the full list; Escape restores the text. Leaving the
      field restores the chosen option's label, or clears the value when the text is empty. Every control below is the
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
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage stage-block">
        <button type="button" id="before">Before</button>
        <Field
          label="Country"
          description="Where the company is registered."
          message={invalid ? 'Choose a country.' : undefined}
          {invalid}
        >
          <Combobox
            id="play"
            options={countries}
            placeholder="Search a country"
            bind:value
            bind:inputValue={text}
            bind:open
            {size}
            {disabled}
            {readonly}
            leading={icon ? search_icon : undefined}
            onvaluechange={() => changes++}
            oninputchange={() => edits++}
          />
        </Field>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="value">Value: {value || 'none'}</span> · <span data-testid="text">Text: {text}</span> ·
          <span data-testid="changes">Changes: {changes}</span> · <span data-testid="edits">Edits: {edits}</span> ·
          <span data-testid="open">Open: {open}</span>
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
        <button type="button" id="set-japan" onclick={() => (value = 'japan')}>Select Japan from the app</button>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">Size {s}</p>
          <Combobox id={`size-${s}`} label={`Country, size ${s}`} options={countries} value="france" size={s} />
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">Groups</p>
        <Field label="Assignee"><Combobox id="people" options={people} placeholder="Search a person" /></Field>
      </div>
      <div class="panel">
        <p class="panel-title">Filtered by the application (filter none, a 150 ms search)</p>
        <Field label="Country (server search)">
          <Combobox
            id="remote"
            options={remote}
            filter="none"
            bind:value={remoteValue}
            placeholder="Type the first letters"
            emptyLabel="No country starts with these letters"
            oninputchange={search}
          />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Readonly and disabled</p>
        <div class="stack">
          <Combobox id="ro" label="Country (readonly)" options={countries} value="spain" readonly />
          <Combobox id="off" label="Country (disabled)" options={countries} value="spain" disabled />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a dark subtree and a clipped container</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <div class="clip"><Combobox id="dark" label="Country (dark)" options={countries} /></div>
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
