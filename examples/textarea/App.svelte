<script lang="ts">
  // Textarea implementation review: a playground with every option, sizes beside InputText, the three resize
  // behaviors, conditions and difficult cases, in any brand, appearance and density.
  import { Field, InputText, Textarea } from '../../packages/svelte/src/index.ts';
  import type { TextareaResize, TextareaSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: TextareaSize[] = ['sm', 'md', 'lg'];
  const resizes: TextareaResize[] = ['vertical', 'auto', 'none'];
  const conditions = ['default', 'readonly', 'disabled', 'invalid'] as const;
  const long =
    'The parcel arrived on time but the box was damaged on one corner. The contents were intact. ' +
    'Please make sure the next delivery is packed with more padding, and leave it with the concierge ' +
    'if nobody answers the door. Thank you for the quick replacement last month.';

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let value = $state('');
  let size = $state<TextareaSize>('md');
  let resize = $state<TextareaResize>('vertical');
  let rows = $state(3);
  let maxRows = $state(8);
  let placeholder = $state('What went well, what could be better…');
  let disabled = $state(false);
  let readonly = $state(false);
  let invalid = $state(false);
  let edits = $state(0);

  let comment = $state('');
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Textarea</h1>
    <p class="lede">
      Multi-line free text. Same colors, border, padding, text and focus ring as the InputText of the same size; one row
      is exactly as tall as an InputText. It can be resized vertically, grow with its content, or stay fixed. Every
      control below is the real Svelte component on the approved tokens.
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
        <div class="stage-field">
          <Field label="Feedback" description="Visible to your team only.">
            <Textarea
              id="play"
              bind:value
              {size}
              {resize}
              {rows}
              {maxRows}
              placeholder={placeholder || undefined}
              {disabled}
              {readonly}
              {invalid}
              onvaluechange={() => edits++}
            />
          </Field>
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="length">Characters: {value.length}</span> ·
          <span data-testid="edits">Edits: {edits}</span>
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
          >Resize <select id="opt-resize" bind:value={resize}
            >{#each resizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Rows <input id="opt-rows" type="number" min="1" max="12" bind:value={rows} /></label>
        <label>Max rows (auto) <input id="opt-max-rows" type="number" min="1" max="20" bind:value={maxRows} /></label>
        <label>Placeholder <input id="opt-placeholder" type="text" bind:value={placeholder} /></label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
        <label class="check"><input id="opt-readonly" type="checkbox" bind:checked={readonly} /> Readonly</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <button type="button" id="opt-fill" onclick={() => (value = long)}>Fill with a long text</button>
      </fieldset>
    </div>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">One row beside InputText</h2>
    <p>A one-row textarea has the height of the InputText of the same size, and its text sits at the same place.</p>
    {#each sizes as s (s)}
      <div class="row pair" data-testid={`pair-${s}`}>
        <div class="grow"><InputText id={`pair-input-${s}`} size={s} label={`Title (${s})`} value="Same line" /></div>
        <div class="grow">
          <Textarea id={`pair-textarea-${s}`} size={s} rows={1} resize="none" label={`Text (${s})`} value="Same line" />
        </div>
      </div>
    {/each}
  </section>

  <section id="resize" aria-labelledby="resize-title">
    <h2 id="resize-title">Resize behaviors</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">vertical (default): drag the corner</p>
        <Textarea id="resize-vertical" label="Vertical" value={long} />
      </div>
      <div class="panel">
        <p class="panel-title">auto: grows from 2 to 5 rows, then scrolls</p>
        <Textarea
          id="resize-auto"
          label="Comment"
          resize="auto"
          rows={2}
          maxRows={5}
          bind:value={comment}
          placeholder="Type several lines"
        />
        <button type="button" id="auto-fill" onclick={() => (comment = long)}>Fill</button>
        <button type="button" id="auto-clear" onclick={() => (comment = '')}>Clear</button>
      </div>
      <div class="panel">
        <p class="panel-title">none: fixed at 3 rows, scrolls</p>
        <Textarea id="resize-none" label="Fixed" resize="none" value={long} />
      </div>
    </div>
  </section>

  <section id="conditions" aria-labelledby="conditions-title">
    <h2 id="conditions-title">Conditions</h2>
    <div class="grid">
      {#each conditions as c (c)}
        <div class="panel">
          <p class="panel-title">{c}</p>
          <Textarea
            id={`cond-${c}`}
            label={`Notes (${c})`}
            rows={2}
            value={c === 'default' ? '' : 'Leave at the door.'}
            placeholder="Delivery notes"
            disabled={c === 'disabled'}
            readonly={c === 'readonly'}
            invalid={c === 'invalid'}
          />
        </div>
      {/each}
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Unbroken word in a narrow column</p>
        <div class="narrow">
          <Textarea
            id="unbroken"
            label="Token"
            rows={2}
            value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0"
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">In a Field with an error</p>
        <Field label="Reason" required invalid message="Give a reason of at least 20 characters.">
          <Textarea id="field-invalid" rows={2} value="Too short" />
        </Field>
      </div>
    </div>
  </section>
</div>

<style>
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .stage-field {
    inline-size: min(100%, 28rem);
  }
  .pair {
    flex-wrap: nowrap;
    align-items: flex-start;
    max-inline-size: 40rem;
    margin-block-end: var(--ggb-space-content-md);
  }
  .grow {
    flex: 1;
    min-inline-size: 0;
  }
  .narrow {
    inline-size: 12rem;
  }
  .panel button {
    margin-block-start: var(--ggb-space-content-sm);
  }
  .options input[type='number'] {
    inline-size: 5rem;
  }
</style>
