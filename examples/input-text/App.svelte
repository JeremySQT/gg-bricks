<script lang="ts">
  // InputText implementation review: a playground with every option, sizes beside Buttons, conditions, slots,
  // trailing actions (clear, show password) at md and lg, standalone use and difficult cases, in any brand,
  // appearance and density.
  import { Button, Field, Icon, IconButton, InputText } from '../../packages/svelte/src/index.ts';
  import type { InputTextActionProps, InputTextSize, InputTextType } from '../../packages/svelte/src/index.ts';
  import { glyphs } from './glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: InputTextSize[] = ['sm', 'md', 'lg'];
  const types: InputTextType[] = ['text', 'email', 'password', 'search', 'tel', 'url'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showTargets = $state(false);

  // Playground
  let value = $state('');
  let type = $state<InputTextType>('text');
  let size = $state<InputTextSize>('md');
  let placeholder = $state('Ada Lovelace');
  let label = $state('Full name');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let required = $state(false);
  let withLeading = $state(false);
  let trailingKind = $state<'none' | 'icon' | 'action'>('none');
  let edits = $state(0);

  // Compositions
  let query = $state('quarterly report');
  let password = $state('correct horse');
  let revealed = $state(false);
</script>

{#snippet glyph(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}
{#snippet search()}{@render glyph('magnifying-glass')}{/snippet}
{#snippet mail()}{@render glyph('envelope-simple')}{/snippet}
{#snippet lock()}{@render glyph('lock-simple')}{/snippet}
{#snippet user()}{@render glyph('user')}{/snippet}
{#snippet globe()}{@render glyph('globe')}{/snippet}
{#snippet clearIcon()}{@render glyph('x')}{/snippet}
{#snippet eye()}{@render glyph(revealed ? 'eye-slash' : 'eye')}{/snippet}
{#snippet playClear(action: InputTextActionProps)}
  <IconButton {...action} id="play-action" label="Clear" icon={clearIcon} onactivate={() => (value = '')} />
{/snippet}
{#snippet clearQuery(action: InputTextActionProps)}
  <IconButton {...action} label="Clear search" icon={clearIcon} onactivate={() => (query = '')} />
{/snippet}
{#snippet reveal(action: InputTextActionProps)}
  <IconButton
    {...action}
    id="reveal"
    label={revealed ? 'Hide password' : 'Show password'}
    aria-pressed={revealed}
    icon={eye}
    onactivate={() => (revealed = !revealed)}
  />
{/snippet}

<div
  class="page"
  class:show-targets={showTargets}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>InputText</h1>
    <p class="lede">
      A single line of text the user types or edits. It has the height and the spacing of the Button of the same size,
      takes its name from a Field label (or from its own label when used alone), and leaves validation and messages to
      the Field. Every control below is the real Svelte component on the approved tokens.
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
          <Field label={label.trim() || 'Full name'} description="As it appears on your ID." {required}>
            <InputText
              id="play"
              bind:value
              {type}
              {size}
              placeholder={placeholder || undefined}
              {disabled}
              {readonly}
              {invalid}
              leading={withLeading ? user : undefined}
              trailing={trailingKind === 'icon' ? globe : undefined}
              action={trailingKind === 'action' ? playClear : undefined}
              onvaluechange={() => edits++}
            />
          </Field>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="value">Value: “{value}”</span> · <span data-testid="edits">Edits: {edits}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Type <select id="opt-type" bind:value={type}
            >{#each types as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Field label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Placeholder <input id="opt-placeholder" type="text" bind:value={placeholder} /></label>
        <label
          >Trailing <select id="opt-trailing" bind:value={trailingKind}
            ><option value="none">none</option><option value="icon">icon</option><option value="action"
              >action (IconButton)</option
            ></select
          ></label
        >
        <label class="check"><input id="opt-leading" type="checkbox" bind:checked={withLeading} /> Leading icon</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <label class="check"><input id="opt-required" type="checkbox" bind:checked={required} /> Required</label>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes beside Buttons</h2>
    <p>
      Same height, same inline padding and same icon size as the Button of the same size: the text and the icons line
      up. The value is set in the body typography of the size.
    </p>
    {#each sizes as s (s)}
      <div class="row align" data-testid={`align-${s}`}>
        <div class="grow">
          <InputText id={`size-${s}`} size={s} label={`Search (${s})`} placeholder="Search invoices" leading={search} />
        </div>
        <Button
          id={`align-button-${s}`}
          size={s}
          intent="neutral"
          appearance="outline"
          label="Search"
          leading={search}
        />
      </div>
    {/each}
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <p>
      Hover and focus them. Precedence: disabled, readonly, invalid, focus, hover. An invalid input keeps its border
      while focused; the ring shows the focus. Readonly stays focusable and selectable.
    </p>
    <div class="grid">
      {#each conditions as c (c)}
        <div class="panel">
          <p class="panel-title">{c}</p>
          <div class="stack">
            <InputText
              id={`cond-${c}`}
              label={`Email (${c})`}
              type="email"
              value={c === 'default' ? '' : 'ada@example.com'}
              placeholder="name@example.com"
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
              leading={mail}
            />
            <InputText
              id={`cond-${c}-empty`}
              label={`Email, empty (${c})`}
              type="email"
              placeholder="name@example.com"
              disabled={c === 'disabled'}
              readonly={c === 'readonly'}
              invalid={c === 'invalid'}
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="actions" aria-labelledby="actions-title">
    <h2 id="actions-title">Trailing actions (md and lg)</h2>
    <p>
      An IconButton one size smaller, neutral ghost, centered with the same inset on the end and the block edges. It is
      a separate tab stop after the input. At sm the action is not rendered (a warning is logged): there is no room for
      a second target.
    </p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Search with clear (md)</p>
        <InputText id="search" type="search" label="Search" bind:value={query} leading={search} action={clearQuery} />
      </div>
      <div class="panel">
        <p class="panel-title">Password with show/hide (lg)</p>
        <Field label="Password">
          <InputText
            id="password"
            size="lg"
            type={revealed ? 'text' : 'password'}
            bind:value={password}
            leading={lock}
            action={reveal}
            autocomplete="current-password"
          />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Every size with an action</p>
        <div class="stack">
          {#each sizes as s (s)}
            <InputText id={`action-${s}`} size={s} label={`With action (${s})`} value="Value" action={clearQuery} />
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Disabled and readonly with an action</p>
        <div class="stack">
          <InputText id="action-disabled" label="Disabled" value="Value" disabled action={clearQuery} />
          <InputText id="action-readonly" label="Readonly" value="Value" readonly action={reveal} />
        </div>
      </div>
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Long value in a narrow column</p>
        <div class="narrow">
          <InputText
            id="long"
            label="Address"
            value="1600 Pennsylvania Avenue Northwest, Washington, District of Columbia 20500, United States"
            leading={globe}
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Long placeholder</p>
        <div class="narrow">
          <InputText
            id="long-placeholder"
            label="Notes"
            placeholder="Anything the courier should know when delivering"
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Every type</p>
        <div class="stack">
          {#each types as t (t)}
            <InputText id={`type-${t}`} type={t} label={`Type ${t}`} placeholder={t} />
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">In a form: Enter submits</p>
        <form
          class="stack"
          onsubmit={(e) => {
            e.preventDefault();
            (e.currentTarget.querySelector('[data-testid="submitted"]') as HTMLElement).textContent = 'Submitted';
          }}
        >
          <Field label="Coupon code">
            <InputText id="coupon" name="coupon" />
          </Field>
          <span data-testid="submitted">Not submitted</span>
        </form>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .stage-field {
    inline-size: min(100%, 24rem);
  }
  .align {
    flex-wrap: nowrap;
    margin-block-end: var(--ggb-space-content-md);
    max-inline-size: 32rem;
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
    inline-size: 12rem;
  }
  .show-targets :global(.ggb-input-text::before),
  .show-targets :global(.ggb-icon-button::before) {
    outline: 1px dashed var(--ggb-color-status-danger-icon);
    background: rgb(from var(--ggb-color-status-danger-icon) r g b / 0.08);
  }
</style>
