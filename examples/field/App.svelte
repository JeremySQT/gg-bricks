<script lang="ts">
  // Field implementation review: a playground with every option around each control it accepts, the required marker,
  // the error message, disabled fields, a complete form section and difficult cases, in any brand, appearance and
  // density.
  import { Button, Checkbox, Field, InputText, Radio, RadioGroup, Textarea } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const controls = ['input-text', 'textarea', 'checkbox', 'radio-group'] as const;

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let control = $state<(typeof controls)[number]>('input-text');
  let label = $state('Work email');
  let description = $state('We send invoices to this address.');
  let message = $state('Enter an email address like name@example.com.');
  let required = $state(true);
  let invalid = $state(false);
  let disabled = $state(false);

  let text = $state('');
  let notes = $state('');
  let agreed = $state(false);
  let plan = $state('');

  // Form section
  let form = $state({ name: '', email: '', team: '', bio: '', terms: false });
  let submitted = $state(false);
  const errors = $derived({
    name: submitted && !form.name.trim() ? 'Enter your name.' : '',
    email: submitted && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter an email address like name@example.com.' : '',
    team: submitted && !form.team ? 'Choose a team size.' : '',
    terms: submitted && !form.terms ? 'Accept the terms to continue.' : ''
  });
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Field</h1>
    <p class="lede">
      Gives one control its visible label, an optional description, the required asterisk and the error message, and
      links them for assistive technology. It passes required, invalid and disabled to the control. It never validates:
      the application decides when a field is invalid. Every control below is the real Svelte component on the approved
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
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        <div class="stage-field">
          <Field
            id="play"
            label={label.trim() || 'Work email'}
            description={description || undefined}
            message={message || undefined}
            {required}
            {invalid}
            {disabled}
          >
            {#if control === 'input-text'}
              <InputText id="play-control" type="email" bind:value={text} placeholder="name@example.com" />
            {:else if control === 'textarea'}
              <Textarea id="play-control" bind:value={notes} rows={2} />
            {:else if control === 'checkbox'}
              <Checkbox id="play-control" bind:checked={agreed} label="I agree to receive invoices by email" />
            {:else}
              <RadioGroup id="play-control" bind:value={plan}>
                <Radio id="play-monthly" value="monthly" label="Monthly" />
                <Radio id="play-yearly" value="yearly" label="Yearly" description="Two months free." />
              </RadioGroup>
            {/if}
          </Field>
        </div>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Control <select id="opt-control" bind:value={control}
            >{#each controls as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Description <input id="opt-description" type="text" bind:value={description} /></label>
        <label>Message <input id="opt-message" type="text" bind:value={message} /></label>
        <label class="check"><input id="opt-required" type="checkbox" bind:checked={required} /> Required</label>
        <label class="check"><input id="opt-invalid" type="checkbox" bind:checked={invalid} /> Invalid</label>
        <label class="check"><input id="opt-disabled" type="checkbox" bind:checked={disabled} /> Disabled</label>
      </fieldset>
    </div>
  </section>

  <section id="states" aria-labelledby="states-title">
    <h2 id="states-title">States</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Default</p>
        <Field id="state-default" label="Company" description="As registered.">
          <InputText value="Acme" />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Required</p>
        <Field id="state-required" label="Company" required>
          <InputText value="" />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Invalid with a message</p>
        <Field
          id="state-invalid"
          label="Company"
          description="As registered."
          required
          invalid
          message="Enter the company name."
        >
          <InputText value="" />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Disabled</p>
        <Field id="state-disabled" label="Company" description="Managed by your organization." required disabled>
          <InputText value="Acme" />
        </Field>
      </div>
    </div>
  </section>

  <section id="form" aria-labelledby="form-title">
    <h2 id="form-title">Form section</h2>
    <p>Submit empty to see every message; fix the values and submit again.</p>
    <form
      class="form"
      novalidate
      onsubmit={(e) => {
        e.preventDefault();
        submitted = true;
      }}
    >
      <Field id="form-name" label="Full name" required invalid={!!errors.name} message={errors.name}>
        <InputText bind:value={form.name} autocomplete="name" />
      </Field>
      <Field
        id="form-email"
        label="Work email"
        description="We send invoices to this address."
        required
        invalid={!!errors.email}
        message={errors.email}
      >
        <InputText type="email" bind:value={form.email} autocomplete="email" />
      </Field>
      <Field id="form-team" label="Team size" required invalid={!!errors.team} message={errors.team}>
        <RadioGroup bind:value={form.team} orientation="horizontal">
          <Radio value="1" label="Just me" />
          <Radio value="10" label="2 to 10" />
          <Radio value="50" label="11 to 50" />
          <Radio value="more" label="More" />
        </RadioGroup>
      </Field>
      <Field id="form-bio" label="About your team" description="Optional.">
        <Textarea bind:value={form.bio} rows={3} resize="auto" />
      </Field>
      <Field id="form-terms" label="Terms" required invalid={!!errors.terms} message={errors.terms}>
        <Checkbox bind:checked={form.terms} label="I accept the terms of service" />
      </Field>
      <div><Button id="form-submit" type="submit" label="Create workspace" /></div>
    </form>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Long label, description and message in a narrow column</p>
        <div class="narrow">
          <Field
            id="long"
            label="Billing contact for invoices and payment reminders"
            description="Invoices, receipts and reminders about failed payments go to this address."
            required
            invalid
            message="This address bounced last month. Enter another address or contact support."
          >
            <InputText value="billing@acme" />
          </Field>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Invalid without a message (the control is still invalid)</p>
        <Field id="no-message" label="Code" invalid>
          <InputText value="ABC" />
        </Field>
      </div>
      <div class="panel">
        <p class="panel-title">Control sizes: the field text does not change</p>
        <div class="stack">
          <Field id="size-sm" label="Small control"><InputText size="sm" /></Field>
          <Field id="size-lg" label="Large control"><InputText size="lg" /></Field>
        </div>
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
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-layout-sm);
    max-inline-size: 28rem;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-lg);
  }
  .narrow {
    inline-size: 14rem;
  }
</style>
