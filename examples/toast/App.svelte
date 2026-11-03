<script lang="ts">
  // Toast implementation review: buttons that send toasts of every intent, with and without description or action,
  // persistent toasts, the max and the queue, the six placements, a toast over an open dialog, in any brand,
  // appearance and density. The application owns the list: it adds a toast and removes it when the toast asks to.
  import { Button, ButtonGroup, Toast, ToastRegion } from '../../packages/svelte/src/index.ts';
  import type { ToastItemAppearance, ToastItemIntent, ToastPlacement } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const placements: ToastPlacement[] = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end'
  ];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let placement = $state<ToastPlacement>('bottom-end');
  let max = $state(3);
  // Empty: the component's defaults (5 s, 8 s with an action, none for danger).
  let duration = $state<number | null>(null);
  let appearance = $state<ToastItemAppearance>('neutral');
  let closable = $state(true);

  type Item = {
    id: number;
    intent: ToastItemIntent;
    title: string;
    description?: string;
    action?: string;
    duration?: number;
  };
  let toasts = $state<Item[]>([]);
  let next = 1;
  let log = $state<string[]>([]);
  function show(item: Omit<Item, 'id'>) {
    toasts.push({ id: next++, ...item });
  }
  function remove(id: number, why = 'dismissed') {
    const t = toasts.find((x) => x.id === id);
    toasts = toasts.filter((x) => x.id !== id);
    if (t) log = [`${t.title}: ${why}`, ...log].slice(0, 6);
  }
  let undone = $state(0);
  let dialog = $state<HTMLDialogElement | null>(null);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Toast</h1>
    <p class="lede">
      A brief notification about something that just happened. It appears above the page without blocking it and leaves
      by itself, unless it holds an action. Hover the toasts or tab into them: the countdown pauses. Every control below
      is the real Svelte component on the approved tokens.
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
        <ButtonGroup id="senders" label="Send a toast">
          <Button
            id="send-saved"
            label="Saved"
            intent="neutral"
            appearance="outline"
            onactivate={() => show({ intent: 'success', title: 'Changes saved' })}
          />
          <Button
            id="send-info"
            label="Message sent"
            intent="neutral"
            appearance="outline"
            onactivate={() =>
              show({ intent: 'info', title: 'Message sent', description: 'Ada will be notified by email.' })}
          />
          <Button
            id="send-undo"
            label="Deleted (Undo)"
            intent="neutral"
            appearance="outline"
            onactivate={() =>
              show({
                intent: 'neutral',
                title: 'Report deleted',
                description: 'It stays in the trash for 30 days.',
                action: 'Undo'
              })}
          />
          <Button
            id="send-warning"
            label="Storage warning"
            intent="neutral"
            appearance="outline"
            onactivate={() => show({ intent: 'warning', title: 'Storage almost full', duration: 0 })}
          />
          <Button
            id="send-danger"
            label="Upload failed"
            intent="neutral"
            appearance="outline"
            onactivate={() =>
              show({
                intent: 'danger',
                title: 'Upload failed',
                description: 'quarterly-report.pdf is larger than 50 MB.',
                action: 'Retry'
              })}
          />
          <Button
            id="send-all"
            label="All intents"
            intent="neutral"
            appearance="ghost"
            onactivate={() => {
              for (const [intent, title] of [
                ['neutral', 'Draft saved'],
                ['info', 'New version available'],
                ['success', 'Payment received'],
                ['warning', 'Storage almost full'],
                ['danger', 'Upload failed']
              ] as const)
                show({
                  intent,
                  title,
                  description: intent === 'info' ? 'Reload to update.' : undefined,
                  action: intent === 'danger' ? 'Retry' : undefined
                });
            }}
          />
          <Button
            id="send-dialog"
            label="Open a dialog (not supported)"
            intent="neutral"
            appearance="ghost"
            onactivate={() => dialog?.showModal()}
          />
        </ButtonGroup>
        <ol class="log" aria-label="Events" data-testid="log">
          {#each log as line, i (i)}<li>{line}</li>{/each}
        </ol>
        <p class="readout">
          <span data-testid="count">Toasts: {toasts.length}</span> · <span data-testid="undone">Undone: {undone}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Placement <select id="opt-placement" bind:value={placement}
            >{#each placements as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Max <input id="opt-max" type="number" min="1" max="6" bind:value={max} /></label>
        <label
          >Appearance <select id="opt-appearance" bind:value={appearance}
            >{#each ['neutral', 'intense'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Duration (ms, empty = default) <input
            id="opt-duration"
            type="number"
            min="0"
            step="500"
            bind:value={duration}
          /></label
        >
        <label class="check"><input id="opt-closable" type="checkbox" bind:checked={closable} /> Closable</label>
        <Button
          id="opt-clear"
          label="Clear all (application)"
          size="sm"
          intent="neutral"
          appearance="outline"
          onactivate={() => (toasts = [])}
        />
      </fieldset>
    </div>
  </section>

  <dialog bind:this={dialog} id="demo-dialog" class="demo-dialog">
    <p>
      Not a supported use: a modal dialog makes the toast region inert until it closes. A toast sent from here is seen
      above the dialog but cannot be pressed or announced; give feedback about the dialog's task inside the dialog.
    </p>
    <ButtonGroup>
      <Button
        id="dialog-send"
        label="Send a toast"
        onactivate={() => show({ intent: 'info', title: 'Sent from the dialog' })}
      />
      <Button
        id="dialog-close"
        label="Close"
        intent="neutral"
        appearance="outline"
        onactivate={() => dialog?.close()}
      />
    </ButtonGroup>
  </dialog>

  <ToastRegion id="region" {placement} {max}>
    {#each toasts as t (t.id)}
      {#snippet act()}
        <Button
          id={`toast-${t.id}-action`}
          label={t.action ?? ''}
          onactivate={() => {
            undone++;
            log = [`${t.title}: ${t.action}`, ...log].slice(0, 6);
          }}
        />
      {/snippet}
      <Toast
        id={`toast-${t.id}`}
        intent={t.intent}
        title={t.title}
        description={t.description}
        duration={t.duration ?? duration ?? undefined}
        {appearance}
        {closable}
        action={t.action ? act : undefined}
        ondismiss={() => remove(t.id)}
      />
    {/each}
  </ToastRegion>
</div>

<style>
  .stage {
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
  }
  .log {
    margin: 0;
    padding-inline-start: var(--ggb-space-content-lg);
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-secondary);
    min-block-size: 6lh;
  }
  .demo-dialog {
    padding: var(--ggb-space-layout-md);
    border: 0;
    border-radius: var(--ggb-radius-overlay);
    background: var(--ggb-color-surface-overlay);
    color: var(--ggb-color-content-primary);
    box-shadow: var(--ggb-shadow-modal);
  }
  .demo-dialog::backdrop {
    background: var(--ggb-color-surface-scrim);
  }
</style>
