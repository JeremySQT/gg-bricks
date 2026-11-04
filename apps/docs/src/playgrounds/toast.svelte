<script lang="ts">
  // Toast playground: a preview toast in the page's region (the only one of the page) that follows the selects.
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

  let intent = $state<ToastItemIntent>('success');
  let appearance = $state<ToastItemAppearance>('neutral');
  let content = $state('title only');
  // One preview toast that follows the selects and stays until dismissed (duration 0); dismissing it shows a button
  // that brings it back.
  let shown = $state(true);
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
  <p style="margin: 0; color: var(--ggb-color-content-secondary); font: var(--ggb-typography-body-sm)">
    The toast is shown at the bottom end of the window, in the page's notifications region.
  </p>
  {#if !shown}<Button
      label="Show the toast again"
      intent="neutral"
      appearance="outline"
      onactivate={() => (shown = true)}
    />{/if}
  <ToastRegion>
    {#if shown}
      {#snippet follow()}<Button label={messages[intent].action} intent="neutral" appearance="outline" />{/snippet}
      <Toast
        {intent}
        {appearance}
        duration={0}
        title={messages[intent].title}
        description={content !== 'title only' ? messages[intent].description : ''}
        action={content === 'with an action' ? follow : undefined}
        ondismiss={() => (shown = false)}
      />
    {/if}
  </ToastRegion>
</PlaygroundFrame>
