<script lang="ts">
  // DataField implementation review: a playground (label, value, orientation, size, empty, rich value, width), the
  // two orientations in both sizes, a details panel in columns, rich values (Badge, Link, Avatar with a name, several
  // lines), long values that wrap, the horizontal layout stacking in a narrow column, and a form beside its read-only
  // view, in any brand, appearance and density.
  import { DataField, Badge, Link, Avatar, Field, InputText } from '../../packages/svelte/src/index.ts';
  import type { DataFieldOrientation, DataFieldSize } from '../../packages/svelte/src/index.ts';
  import { portraits } from '../avatar/portraits.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let label = $state('Email');
  let value = $state('olivia@example.com');
  let orientation = $state<DataFieldOrientation>('vertical');
  let size = $state<DataFieldSize>('md');
  let rich = $state(false);
  let width = $state(480);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>DataField</h1>
    <p class="lede">
      One piece of information about an object, as a label and its value, for reading. Never a disabled or readonly
      input. vertical stacks the label above the value; horizontal puts the label in a 160 px column, and stacks below
      320 px. An empty value shows an em dash and announces No value.
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
      <div class="stage">
        <div class="frame" style:inline-size={`${width}px`}>
          {#if rich}
            <DataField id="play" {label} {orientation} {size}><Badge intent="success" label="Active" /></DataField>
          {:else}
            <DataField id="play" {label} {value} {orientation} {size} />
          {/if}
        </div>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Value <input id="opt-value" type="text" bind:value placeholder="empty" /></label>
        <label
          >Orientation <select id="opt-orientation" bind:value={orientation}
            ><option value="vertical">vertical</option><option value="horizontal">horizontal</option></select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            ><option value="sm">sm</option><option value="md">md</option></select
          ></label
        >
        <label class="check"><input id="opt-rich" type="checkbox" bind:checked={rich} /> Rich value (Badge)</label>
        <label>Width <input id="opt-width" type="range" min="200" max="560" bind:value={width} /> {width} px</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Orientations and sizes</h2>
    <p>Default: vertical md. The label is quieter than the value.</p>
    <div class="grid">
      {#each ['vertical', 'horizontal'] as const as o (o)}
        {#each ['sm', 'md'] as const as s (s)}
          <div class="panel fields">
            <p class="panel-title">{o} · {s}</p>
            <DataField
              id={`m-${o}-${s}`}
              data-testid="matrix"
              label="Owner"
              value="Olivia Rhye"
              orientation={o}
              size={s}
            />
            <DataField id={`m-${o}-${s}-2`} label="Created on" value="Jan 6, 2027" orientation={o} size={s} />
            <DataField id={`m-${o}-${s}-empty`} label="Phone" orientation={o} size={s} />
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="panel" aria-labelledby="panel-title">
    <h2 id="panel-title">A details panel</h2>
    <p>The integration lays fields out in columns; rich values are free content.</p>
    <div class="panel details">
      <DataField id="d-status" label="Status"><Badge intent="success" label="Paid" /></DataField>
      <DataField id="d-invoice" label="Invoice" value="#3066" />
      <DataField id="d-customer" label="Customer">
        <span class="person"><Avatar name="Olivia Rhye" src={portraits.olivia} size="xs" decorative /> Olivia Rhye</span
        >
      </DataField>
      <DataField id="d-site" label="Website"><Link href="#acme" label="acme.example.com" /></DataField>
      <DataField id="d-amount" label="Amount" value="€1,240.00" />
      <DataField id="d-due" label="Due date" />
      <DataField id="d-address" label="Billing address">
        <span>12 Rue de la Paix<br />75002 Paris<br />France</span>
      </DataField>
      <DataField id="d-id" label="Customer ID" value="cus_9s6XKzkNRiz8i3a7cRMbvwPtFqJdLfQ" />
    </div>
  </section>

  <section id="horizontal" aria-labelledby="horizontal-title">
    <h2 id="horizontal-title">Horizontal fields align without a container</h2>
    <div class="grid">
      <div class="panel fields">
        <p class="panel-title">Wide column</p>
        <DataField id="h-1" label="Name" value="Olivia Rhye" orientation="horizontal" />
        <DataField
          id="h-2"
          label="Billing contact email address"
          value="billing@acme.example.com"
          orientation="horizontal"
        />
        <DataField id="h-3" label="Plan" orientation="horizontal"><Badge intent="accent" label="Business" /></DataField>
      </div>
      <div class="panel fields narrow">
        <p class="panel-title">Narrow column (under 320 px: stacked)</p>
        <DataField id="h-narrow" label="Name" value="Olivia Rhye" orientation="horizontal" />
        <DataField label="Plan" orientation="horizontal"><Badge intent="accent" label="Business" /></DataField>
      </div>
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">A form and its read-only view</h2>
    <p>The same typographies as a Field label and an md InputText, so that switching to edit keeps the layout.</p>
    <div class="grid">
      <div class="panel fields">
        <p class="panel-title">Read</p>
        <DataField label="Company" value="Acme Inc" />
        <DataField label="VAT number" value="FR 12 345678901" />
      </div>
      <div class="panel fields">
        <p class="panel-title">Edit</p>
        <Field label="Company"><InputText value="Acme Inc" /></Field>
        <Field label="VAT number"><InputText value="FR 12 345678901" /></Field>
      </div>
    </div>
  </section>
</div>

<style>
  .frame {
    max-inline-size: 100%;
    padding: var(--ggb-space-content-md);
    border: 1px dashed var(--ggb-color-border-default);
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-lg);
  }
  .narrow {
    max-inline-size: 18rem;
  }
  .details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--ggb-space-layout-sm) var(--ggb-space-layout-md);
  }
  .person {
    display: inline-flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
  }
</style>
