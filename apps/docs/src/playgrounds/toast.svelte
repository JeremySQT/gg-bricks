<script lang="ts">
  // Toast playground: a preview of the toast in the frame, following the selects; Show live sends the same toast into
  // the page's notifications region (the only one of the page), with its real countdown.
  import { Button, Toast, ToastRegion } from '@ggbrick/svelte';
  import type { ToastItemAppearance, ToastItemIntent } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  // Title, description and action label of the toast for each intent.
  const messages: Record<ToastItemIntent, { title: string; description: string; action: string }> = {
    neutral: { title: 'Report deleted', description: 'It stays in the trash for 30 days.', action: 'Undo' },
    info: { title: 'Message sent', description: 'Ada will be notified by email.', action: 'View' },
    success: { title: 'Changes saved', description: 'Everyone in the project can see them.', action: 'View' },
    warning: { title: 'Storage almost full', description: 'You have used 95% of your storage.', action: 'Manage' },
    danger: { title: 'Upload failed', description: 'quarterly-report.pdf is larger than 50 MB.', action: 'Retry' }
  };

  type Item = {
    id: number;
    intent: ToastItemIntent;
    appearance: ToastItemAppearance;
    description: boolean;
    action: boolean;
  };

  let intent = $state<ToastItemIntent>('neutral');
  let appearance = $state<ToastItemAppearance>('neutral');
  let description = $state('no');
  let action = $state('yes');
  // The preview stays until dismissed (duration 0); dismissing it shows a button that brings it back.
  let preview = $state(true);
  let live = $state<Item[]>([]);
  let next = 1;

  function showLive() {
    live.push({ id: next++, intent, appearance, description: description === 'yes', action: action === 'yes' });
  }
</script>

{#snippet follow(label: string)}<Button {label} intent="neutral" appearance="outline" />{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['neutral', 'info', 'success', 'warning', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as ToastItemIntent)
      }
    ],
    topEnd: [
      {
        label: 'Appearance',
        options: ['neutral', 'intense'],
        value: appearance,
        onchange: (v) => (appearance = v as ToastItemAppearance)
      }
    ],
    bottomStart: [
      { label: 'Description', options: ['no', 'yes'], value: description, onchange: (v) => (description = v) }
    ],
    bottomEnd: [{ label: 'Action', options: ['yes', 'no'], value: action, onchange: (v) => (action = v) }]
  }}
>
  <div style="display: flex; flex-direction: column; align-items: center; gap: var(--ggb-space-content-md)">
    {#if preview}
      {#snippet previewAction()}{@render follow(messages[intent].action)}{/snippet}
      <Toast
        {intent}
        {appearance}
        duration={0}
        title={messages[intent].title}
        description={description === 'yes' ? messages[intent].description : ''}
        action={action === 'yes' ? previewAction : undefined}
        ondismiss={() => (preview = false)}
      />
    {:else}
      <Button label="Show the preview again" intent="neutral" appearance="ghost" onactivate={() => (preview = true)} />
    {/if}
    <Button label="Show live" intent="neutral" appearance="outline" onactivate={showLive} />
  </div>
  <ToastRegion>
    {#each live as t (t.id)}
      {#snippet liveAction()}{@render follow(messages[t.intent].action)}{/snippet}
      <Toast
        intent={t.intent}
        appearance={t.appearance}
        title={messages[t.intent].title}
        description={t.description ? messages[t.intent].description : ''}
        action={t.action ? liveAction : undefined}
        ondismiss={() => (live = live.filter((x) => x.id !== t.id))}
      />
    {/each}
  </ToastRegion>
</PlaygroundFrame>
