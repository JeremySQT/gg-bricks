<script lang="ts">
  // Dialog playground: size, description and dismissal of a dialog opened by a button; without dismissal, the
  // footer is the way out.
  import { Button, ButtonGroup, Dialog, Field, InputText } from '@ggbrick/svelte';
  import type { DialogSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let size = $state<DialogSize>('md');
  let description = $state('yes');
  let dismissible = $state('yes');
  let open = $state(false);
  let name = $state('Quarterly report');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Dismissible', options: ['yes', 'no'], value: dismissible, onchange: (v) => (dismissible = v) }
    ],
    topEnd: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as DialogSize) }],
    bottomEnd: [
      { label: 'Description', options: ['yes', 'no'], value: description, onchange: (v) => (description = v) }
    ]
  }}
>
  <Button label="Rename the report" intent="neutral" appearance="outline" onactivate={() => (open = true)} />
  <Dialog
    bind:open
    {size}
    dismissible={dismissible === 'yes'}
    title="Rename the report"
    description={description === 'yes' ? 'The new name is shown to everyone in the project.' : ''}
  >
    <Field label="Name"><InputText bind:value={name} /></Field>
    {#snippet footer()}
      <ButtonGroup>
        <Button label="Cancel" intent="neutral" appearance="outline" onactivate={() => (open = false)} />
        <Button label="Save" onactivate={() => (open = false)} />
      </ButtonGroup>
    {/snippet}
  </Dialog>
</PlaygroundFrame>
