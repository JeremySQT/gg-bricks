<script lang="ts">
  // Toast playground: intent, appearance and content of the next toast, sent into the page's region with a button.
  import { Button, Toast, ToastRegion } from '@ggbrick/svelte';
  import type { ToastItemAppearance, ToastItemIntent } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  // Title, description and action label of the toast sent for each intent.
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

  let intent = $state<ToastItemIntent>('success');
  let appearance = $state<ToastItemAppearance>('neutral');
  let content = $state('title only');
  let toasts = $state<Item[]>([]);
  let next = 1;

  function send() {
    toasts.push({
      id: next++,
      intent,
      appearance,
      description: content !== 'title only',
      action: content === 'with an action'
    });
  }
  function remove(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
  }
</script>

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
      {
        label: 'Content',
        options: ['title only', 'with a description', 'with an action'],
        value: content,
        onchange: (v) => (content = v)
      }
    ]
  }}
>
  <Button label="Send a toast" onactivate={send} />
  <Button label="Clear all" intent="neutral" appearance="ghost" onactivate={() => (toasts = [])} />
</PlaygroundFrame>

<ToastRegion>
  {#each toasts as t (t.id)}
    {#snippet follow()}<Button label={messages[t.intent].action} intent="neutral" appearance="outline" />{/snippet}
    <Toast
      intent={t.intent}
      appearance={t.appearance}
      title={messages[t.intent].title}
      description={t.description ? messages[t.intent].description : ''}
      action={t.action ? follow : undefined}
      ondismiss={() => remove(t.id)}
    />
  {/each}
</ToastRegion>
