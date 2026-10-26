<script lang="ts">
  // Switch implementation review: a playground with every option, sizes and conditions in both positions, a settings
  // list with labels at the start, hidden labels, in any brand, appearance and density.
  import { Checkbox, Switch } from '../../packages/svelte/src/index.ts';
  import type { SwitchLabelPosition, SwitchSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: SwitchSize[] = ['sm', 'md', 'lg'];
  const positions: SwitchLabelPosition[] = ['end', 'start'];
  const conditions = ['default', 'readonly', 'disabled'] as const;
  const selections = ['off', 'on'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  let checked = $state(false);
  let size = $state<SwitchSize>('md');
  let labelPosition = $state<SwitchLabelPosition>('end');
  let label = $state('Dark mode');
  let description = $state('');
  let hideLabel = $state(false);
  let disabled = $state(false);
  let readonly = $state(false);
  let changes = $state(0);

  let settings = $state({ notifications: true, sounds: false, digest: true });
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
    <h1>Switch</h1>
    <p class="lede">
      Turns a setting on or off with immediate effect. The label names the setting, never its state; there is no invalid
      or required switch (that is a Checkbox). Every control below is the real Svelte component on the approved tokens.
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
        <div class="stage-item">
          <Switch
            id="play"
            bind:checked
            {size}
            {labelPosition}
            label={label.trim() || 'Dark mode'}
            description={description || undefined}
            {hideLabel}
            {disabled}
            {readonly}
            oncheckedchange={() => changes++}
          />
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="state">checked: {checked}</span> · <span data-testid="changes">Changes: {changes}</span>
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
          >Label position <select id="opt-position" bind:value={labelPosition}
            >{#each positions as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Description <input id="opt-description" type="text" bind:value={description} /></label>
        <label class="check"><input id="opt-hide" type="checkbox" bind:checked={hideLabel} /> Hide label</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Conditions and positions</h2>
    <p>Hover them. Precedence: disabled, readonly, hover. The thumb moves to the inline end when on.</p>
    {#each sizes as s (s)}
      <h3>Size {s}</h3>
      <div class="matrix states">
        <span></span>
        {#each selections as sel (sel)}<span class="col-head">{sel}</span>{/each}
        {#each conditions as c (c)}
          <span class="row-head">{c}</span>
          {#each selections as sel (sel)}
            <div>
              <Switch
                id={`sw-${c}-${sel}-${s}`}
                size={s}
                label="Setting"
                checked={sel === 'on'}
                disabled={c === 'disabled'}
                readonly={c === 'readonly'}
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
        <p class="panel-title">Settings list (label at the start)</p>
        <div class="settings">
          <Switch
            id="set-notifications"
            labelPosition="start"
            label="Notifications"
            description="Push notifications on this device."
            bind:checked={settings.notifications}
          />
          <Switch id="set-sounds" labelPosition="start" label="Sounds" bind:checked={settings.sounds} />
          <Switch
            id="set-digest"
            labelPosition="start"
            label="Weekly digest with a long name that wraps on two lines"
            bind:checked={settings.digest}
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Beside a Checkbox of the same size</p>
        <div class="stack">
          {#each sizes as s (s)}
            <div class="row" data-testid={`beside-${s}`}>
              <Switch id={`beside-switch-${s}`} size={s} label="Switch" checked />
              <Checkbox id={`beside-checkbox-${s}`} size={s} label="Checkbox" checked />
            </div>
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Hidden label in a table cell</p>
        <table>
          <tbody>
            {#each ['Production', 'Staging'] as env (env)}
              <tr>
                <td>{env}</td>
                <td class="end"
                  ><Switch id={`env-${env}`} size="sm" hideLabel label={`Deploy ${env} automatically`} /></td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .stage-item {
    inline-size: min(100%, 22rem);
    display: flex;
    justify-content: center;
  }
  .states {
    grid-template-columns: max-content repeat(2, max-content);
  }
  .settings {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-lg);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-md);
  }
  table {
    inline-size: 100%;
    border-collapse: collapse;
  }
  td {
    padding: var(--ggb-space-content-xs) var(--ggb-space-content-sm);
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .end {
    text-align: end;
  }
  .show-targets :global(.ggb-switch::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
