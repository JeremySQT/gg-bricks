<script lang="ts">
  // Alert implementation review: a playground with every option, the five intents with and without title, actions
  // and dismiss, live announcements, a long message in a narrow column, in any brand, appearance and density.
  import { Alert, Button, ButtonGroup, Icon, Link } from '../../packages/svelte/src/index.ts';
  import type { AlertIntent } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const intents: AlertIntent[] = ['neutral', 'info', 'success', 'warning', 'danger'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let intent = $state<AlertIntent>('warning');
  let withTitle = $state(true);
  let withContent = $state(true);
  let withActions = $state(true);
  let dismissible = $state(true);
  let live = $state(false);
  let visible = $state(true);
  let dismissals = $state(0);
  let retried = $state(0);

  let saved = $state<'idle' | 'failed'>('idle');
</script>

<!-- Passed only when the Actions option is on: an empty actions snippet would still render the actions row (and its
     gap and actionsPaddingEnd). -->
{#snippet playActions()}
  <ButtonGroup>
    <Button id="play-choose" label="Choose a plan" onactivate={() => retried++} />
    <Button id="play-later" label="Later" intent="neutral" appearance="ghost" />
  </ButtonGroup>
{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Alert</h1>
    <p class="lede">
      A durable message in the flow of the page about the page, a section or a task. It stays until the situation
      changes or the user dismisses it. Every control below is the real Svelte component on the approved tokens.
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
        <div class="wide">
          {#if visible}
            <Alert
              id="play"
              {intent}
              title={withTitle ? 'Your trial ends in 3 days' : ''}
              {dismissible}
              {live}
              actions={withActions ? playActions : undefined}
              ondismiss={() => {
                visible = false;
                dismissals++;
              }}
            >
              {#if withContent}
                Choose a plan to keep your projects and invitations. <Link href="#plans" label="Compare plans" />
              {/if}
            </Alert>
          {:else}
            <Button
              id="play-restore"
              label="Show the alert again"
              intent="neutral"
              appearance="outline"
              onactivate={() => (visible = true)}
            />
          {/if}
        </div>
        <p class="readout" aria-live="polite">
          <span data-testid="dismissals">Dismissals: {dismissals}</span> ·
          <span data-testid="choose">Choose: {retried}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Intent <select id="opt-intent" bind:value={intent}
            >{#each intents as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-title" type="checkbox" bind:checked={withTitle} /> Title</label>
        <label class="check"><input id="opt-content" type="checkbox" bind:checked={withContent} /> Content</label>
        <label class="check"><input id="opt-actions" type="checkbox" bind:checked={withActions} /> Actions</label>
        <label class="check"
          ><input id="opt-dismissible" type="checkbox" bind:checked={dismissible} /> Dismissible</label
        >
        <label class="check"><input id="opt-live" type="checkbox" bind:checked={live} /> Live</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Intents</h2>
    <div class="stack">
      {#each intents as i (i)}
        <Alert id={`al-${i}`} intent={i} title={`${i[0].toUpperCase()}${i.slice(1)} title`}>
          A sentence that explains the situation and what to do next.
        </Alert>
        <Alert id={`al-${i}-plain`} intent={i}>A message without a title, one line of body text.</Alert>
      {/each}
    </div>
  </section>

  <section id="actions" aria-labelledby="actions-title">
    <h2 id="actions-title">Actions in every intent</h2>
    <p>
      Accent and neutral buttons take the action family of the alert, in solid, outline and ghost, the dismiss button
      included; danger buttons keep their own.
    </p>
    <div class="stack">
      {#each intents as i (i)}
        <Alert id={`act-${i}`} intent={i} title={`${i[0].toUpperCase()}${i.slice(1)}`}>
          Accent solid, outline and ghost, then neutral outline and danger outline. <Link
            href="#details"
            label="A link"
          />
          {#snippet actions()}
            <ButtonGroup>
              <Button id={`act-${i}-solid`} label="Solid" />
              <Button id={`act-${i}-outline`} label="Outline" appearance="outline" />
              <Button id={`act-${i}-ghost`} label="Ghost" appearance="ghost" />
              <Button id={`act-${i}-neutral`} label="Neutral" intent="neutral" appearance="outline" />
              <Button id={`act-${i}-danger`} label="Danger" intent="danger" appearance="outline" />
            </ButtonGroup>
          {/snippet}
        </Alert>
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">A failed save, announced when it appears (live)</p>
        <div class="stack">
          <Button id="save" label="Save changes" onactivate={() => (saved = 'failed')} />
          {#if saved === 'failed'}
            <Alert
              id="save-error"
              intent="danger"
              title="The changes were not saved"
              live
              dismissible
              ondismiss={() => (saved = 'idle')}
            >
              The connection was lost. Your edits are kept on this device.
              {#snippet actions()}
                <ButtonGroup
                  ><Button id="save-retry" label="Try again" intent="neutral" appearance="outline" /></ButtonGroup
                >
              {/snippet}
            </Alert>
          {/if}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">A long message in a narrow column, custom icon</p>
        <div class="narrow">
          <Alert
            id="long"
            intent="info"
            title="Scheduled maintenance on Saturday night between two and four"
            dismissible
          >
            {#snippet icon()}<Icon><path d={glyphs['magnifying-glass']} /></Icon>{/snippet}
            Exports, imports and the public API are unavailable during the window; everything else keeps working and queued
            jobs resume afterwards automatically.
          </Alert>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .wide {
    inline-size: min(40rem, 100%);
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--ggb-space-content-md);
  }
  .stack > :global(.ggb-button) {
    align-self: flex-start;
  }
  .narrow {
    inline-size: 18rem;
    max-inline-size: 100%;
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
</style>
