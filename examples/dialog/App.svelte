<script lang="ts">
  // Dialog implementation review: a playground with every option, an alert dialog, a dialog that requires an
  // explicit choice, a long body that scrolls, a form, nested dialogs, a dialog in a dark subtree, in any context.
  import { Button, ButtonGroup, Dialog, Field, InputText } from '../../packages/svelte/src/index.ts';
  import type { DialogSize } from '../../packages/svelte/src/index.ts';
  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let size = $state<DialogSize>('md');
  let withDescription = $state(true);
  let dismissible = $state(true);
  let long = $state(false);
  let open = $state(false);
  let changes = $state(0);
  let confirm = $state(false);
  let deleted = $state(0);
  let terms = $state(false);
  let accepted = $state(false);
  let edit = $state(false);
  let nested = $state(false);
  let dark = $state(false);
  let title = $state('Quarterly report');
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Dialog</h1>
    <p class="lede">
      A modal window for a short task or a decision. The page behind is dimmed and inert until the dialog closes; focus
      returns to the button that opened it. Every control below is the real Svelte component on the approved tokens.
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
        <Button id="open" label="Open the dialog" onactivate={() => (open = true)} />
        <p class="readout">
          <span data-testid="open">Open: {open}</span> · <span data-testid="changes">Changes: {changes}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each ['sm', 'md', 'lg'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"
          ><input id="opt-description" type="checkbox" bind:checked={withDescription} /> Description</label
        >
        <label class="check"
          ><input id="opt-dismissible" type="checkbox" bind:checked={dismissible} /> Dismissible</label
        >
        <label class="check"><input id="opt-long" type="checkbox" bind:checked={long} /> Long body (scrolls)</label>
      </fieldset>
    </div>
    <Dialog
      id="play"
      bind:open
      title="Invite people to the project"
      description={withDescription ? 'They receive an email with a link that expires in seven days.' : ''}
      {size}
      {dismissible}
      onopenchange={() => changes++}
    >
      <Field label="Email addresses"><InputText id="play-emails" placeholder="name@example.com" /></Field>
      {#if long}
        {#each Array.from({ length: 24 }, (_, i) => i + 1) as n (n)}
          <p class="para">Paragraph {n}: the body scrolls while the header and the footer stay in place.</p>
        {/each}
      {/if}
      {#snippet footer()}
        <ButtonGroup>
          <Button
            id="play-cancel"
            label="Cancel"
            intent="neutral"
            appearance="outline"
            onactivate={() => (open = false)}
          />
          <Button id="play-send" label="Send invitations" onactivate={() => (open = false)} />
        </ButtonGroup>
      {/snippet}
    </Dialog>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Alert dialog: confirm a deletion</p>
        <Button id="delete" label="Delete project" intent="danger" onactivate={() => (confirm = true)} />
        <p class="readout" data-testid="deleted">Deleted: {deleted}</p>
        <Dialog
          id="confirm"
          bind:open={confirm}
          alert
          size="sm"
          title="Delete this project?"
          description="Its 42 reports and their history are removed for everyone. This cannot be undone."
        >
          {#snippet footer()}
            <ButtonGroup>
              <Button
                id="confirm-cancel"
                label="Keep the project"
                intent="neutral"
                appearance="outline"
                onactivate={() => (confirm = false)}
              />
              <Button
                id="confirm-delete"
                label="Delete project"
                intent="danger"
                onactivate={() => {
                  deleted++;
                  confirm = false;
                }}
              />
            </ButtonGroup>
          {/snippet}
        </Dialog>
      </div>
      <div class="panel">
        <p class="panel-title">An explicit choice (not dismissible)</p>
        <Button
          id="terms"
          label="Review the terms"
          intent="neutral"
          appearance="outline"
          onactivate={() => (terms = true)}
        />
        <p class="readout" data-testid="accepted">Accepted: {accepted}</p>
        <Dialog id="terms-dialog" bind:open={terms} dismissible={false} title="Updated terms of service">
          <p class="para">Read and accept the updated terms to continue using shared workspaces.</p>
          {#snippet footer()}
            <ButtonGroup>
              <Button
                id="terms-decline"
                label="Decline"
                intent="neutral"
                appearance="outline"
                onactivate={() => (terms = false)}
              />
              <Button
                id="terms-accept"
                label="Accept"
                onactivate={() => {
                  accepted = true;
                  terms = false;
                }}
              />
            </ButtonGroup>
          {/snippet}
        </Dialog>
      </div>
      <div class="panel">
        <p class="panel-title">A form with initial focus, a nested dialog</p>
        <Button
          id="edit"
          label="Edit the report"
          intent="neutral"
          appearance="outline"
          onactivate={() => (edit = true)}
        />
        <Dialog id="edit-dialog" bind:open={edit} title="Edit the report" size="lg">
          <Field label="Title"><InputText id="edit-title" bind:value={title} autofocus /></Field>
          <Button
            id="edit-nested"
            label="Choose a template"
            size="sm"
            intent="neutral"
            appearance="outline"
            onactivate={() => (nested = true)}
          />
          <Dialog id="nested" bind:open={nested} title="Choose a template" size="sm">
            <p class="para">A dialog opened from another stacks above it; Escape closes this one first.</p>
            {#snippet footer()}<ButtonGroup
                ><Button id="nested-close" label="Done" onactivate={() => (nested = false)} /></ButtonGroup
              >{/snippet}
          </Dialog>
          {#snippet footer()}
            <ButtonGroup><Button id="edit-save" label="Save" onactivate={() => (edit = false)} /></ButtonGroup>
          {/snippet}
        </Dialog>
      </div>
      <div class="panel">
        <p class="panel-title">Declared in a dark subtree</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <Button
            id="dark"
            label="Open in dark"
            intent="neutral"
            appearance="outline"
            onactivate={() => (dark = true)}
          />
          <Dialog id="dark-dialog" bind:open={dark} title="Dark appearance" size="sm">
            <p class="para">The dialog inherits the appearance of the place it is declared in.</p>
          </Dialog>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .dark-panel {
    padding: var(--ggb-space-content-lg);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
  .para {
    margin: 0 0 var(--ggb-space-content-sm);
  }
</style>
