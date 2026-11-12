<script lang="ts">
  // Accordion playground: single or multiple expansion and leading icons, on questions and answers about a plan.
  import { Accordion, AccordionItem, Icon } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { phosphor } from '../../../../examples/icon/glyphs.ts';

  let multiple = $state('no');
  let icons = $state('no');
  let value = $state<string[]>(['included']);
</script>

{#snippet check()}<Icon><path d={phosphor.check} /></Icon>{/snippet}
{#snippet change()}<Icon><path d={phosphor['arrow-right']} /></Icon>{/snippet}
{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet warning()}<Icon><path d={phosphor['warning-circle']} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Multiple',
        options: ['no', 'yes'],
        value: multiple,
        onchange: (v) => {
          multiple = v;
          // A single accordion keeps at most one expanded item.
          if (v === 'no') value = value.slice(0, 1);
        }
      }
    ],
    topEnd: [{ label: 'Leading icons', options: ['no', 'yes'], value: icons, onchange: (v) => (icons = v) }]
  }}
>
  <div style="inline-size: min(36rem, 100%)">
    <Accordion bind:value multiple={multiple === 'yes'}>
      <AccordionItem
        value="included"
        label="What is included in the plan?"
        leading={icons === 'yes' ? check : undefined}
      >
        <p>Unlimited projects, 50 GB of storage and email support on working days.</p>
      </AccordionItem>
      <AccordionItem value="change" label="Can I change plans later?" leading={icons === 'yes' ? change : undefined}>
        <p>Yes. A new plan applies at once, and the price is adjusted on your next invoice.</p>
      </AccordionItem>
      <AccordionItem value="export" label="Can I export my data?" leading={icons === 'yes' ? download : undefined}>
        <p>Download every project as a ZIP archive of CSV files, at any time and on every plan.</p>
      </AccordionItem>
      <AccordionItem
        value="payment"
        label="What happens if a payment fails?"
        leading={icons === 'yes' ? warning : undefined}
      >
        <p>We try again after three days and email the billing contact. Projects stay available for 14 days.</p>
      </AccordionItem>
    </Accordion>
    <p>Expanded: {value.join(', ') || 'none'}</p>
  </div>
</PlaygroundFrame>
