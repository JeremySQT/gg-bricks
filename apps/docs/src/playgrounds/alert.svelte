<script lang="ts">
  // Alert playground: intent, title, actions and the dismiss button; a dismissed alert can be shown again.
  import { Alert, Button, ButtonGroup, Link } from '@ggbrick/svelte';
  import type { AlertIntent } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let intent = $state<AlertIntent>('info');
  let title = $state('shown');
  let actions = $state('two buttons');
  // The snippet is passed only when shown: an alert with an actions snippet lays out an actions row.
  let dismissible = $state('yes');
  let visible = $state(true);
</script>

{#snippet followUp()}
  <ButtonGroup>
    <Button label="Choose a plan" />
    <Button label="Later" intent="neutral" appearance="ghost" />
  </ButtonGroup>
{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Intent',
        options: ['neutral', 'info', 'success', 'warning', 'danger'],
        value: intent,
        onchange: (v) => (intent = v as AlertIntent)
      }
    ],
    topEnd: [{ label: 'Title', options: ['shown', 'hidden'], value: title, onchange: (v) => (title = v) }],
    bottomStart: [
      { label: 'Actions', options: ['none', 'two buttons'], value: actions, onchange: (v) => (actions = v) }
    ],
    bottomEnd: [
      {
        label: 'Dismissible',
        options: ['no', 'yes'],
        value: dismissible,
        onchange: (v) => {
          dismissible = v;
          visible = true;
        }
      }
    ]
  }}
>
  <div style="inline-size: min(36rem, 100%)">
    {#if visible}
      <Alert
        {intent}
        title={title === 'shown' ? 'Your trial ends in 3 days' : ''}
        dismissible={dismissible === 'yes'}
        actions={actions === 'two buttons' ? followUp : undefined}
        ondismiss={() => (visible = false)}
      >
        Choose a plan to keep your projects and invitations. <Link href="#plans" label="Compare plans" />
      </Alert>
    {:else}
      <Button label="Show the alert again" intent="neutral" appearance="outline" onactivate={() => (visible = true)} />
    {/if}
  </div>
</PlaygroundFrame>
