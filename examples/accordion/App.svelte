<script lang="ts">
  // Accordion implementation review: a playground (single or multiple, heading level), leading icons, a disabled
  // item, long headings that wrap, rich content with controls, a nested accordion, in any brand, appearance and
  // density.
  import { Accordion, AccordionItem, Button, Icon, InputText } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let value = $state<string[]>(['shipping']);
  let multiple = $state(false);
  let headingLevel = $state(3);
  let icons = $state(false);
  let changes = $state(0);
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Accordion</h1>
    <p class="lede">
      Headings that each show or hide a section. Enter, Space or a press toggles an item; Down and Up Arrow move between
      headings, Home and End jump to the ends. Every control below is the real Svelte component on the approved tokens.
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
      <div class="stage stage-block">
        <button type="button" id="before">Before</button>
        <Accordion id="play" bind:value {multiple} {headingLevel} onvaluechange={() => changes++}>
          <AccordionItem id="shipping" value="shipping" label="How long does shipping take?">
            {#snippet leading()}{#if icons}{@render iconFor('info')}{/if}{/snippet}
            <p>Orders leave our warehouse within two working days and arrive three to five days later.</p>
          </AccordionItem>
          <AccordionItem id="returns" value="returns" label="Can I return an item?">
            {#snippet leading()}{#if icons}{@render iconFor('arrow-right')}{/if}{/snippet}
            <p>Yes, within 30 days, in its original packaging.</p>
            <Button id="returns-start" label="Start a return" intent="neutral" appearance="outline" size="sm" />
          </AccordionItem>
          <AccordionItem id="gift" value="gift" label="Gift wrapping" disabled>
            {#snippet leading()}{#if icons}{@render iconFor('star')}{/if}{/snippet}
            <p>Not available for this order.</p>
          </AccordionItem>
          <AccordionItem
            id="long"
            value="long"
            label="What happens to my subscription, my saved addresses and my order history if I close my account?"
          >
            <p>They are deleted after 30 days. Download your order history first if you need it.</p>
          </AccordionItem>
        </Accordion>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="value">Value: {value.join(',') || 'none'}</span> ·
          <span data-testid="changes">Changes: {changes}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label><input type="checkbox" id="opt-multiple" bind:checked={multiple} /> Multiple</label>
        <label><input type="checkbox" id="opt-icons" bind:checked={icons} /> Leading icons</label>
        <label
          >Heading level <select id="opt-level" bind:value={headingLevel}
            >{#each [2, 3, 4, 5, 6] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <button type="button" id="set-returns" onclick={() => (value = ['returns'])}>Expand Returns from the app</button
        >
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Multiple, filters in a narrow column</p>
        <div class="narrow">
          <Accordion id="filters" multiple value={['price', 'brand']}>
            <AccordionItem value="price" label="Price"
              ><InputText id="price-max" label="Maximum price" placeholder="Maximum" size="sm" /></AccordionItem
            >
            <AccordionItem value="brand" label="Brand"><p>Acme, Globex, Initech</p></AccordionItem>
            <AccordionItem value="color" label="Color"><p>Red, green, blue</p></AccordionItem>
          </Accordion>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Nested: arrow keys stay in their own accordion</p>
        <Accordion id="outer" value={['account']}>
          <AccordionItem value="account" label="Account">
            <Accordion id="inner" headingLevel={4}>
              <AccordionItem value="email" label="Email"><p>you@example.com</p></AccordionItem>
              <AccordionItem value="password" label="Password"><p>Changed 3 months ago</p></AccordionItem>
            </Accordion>
          </AccordionItem>
          <AccordionItem value="billing" label="Billing"><p>Visa ending in 4242</p></AccordionItem>
        </Accordion>
      </div>
    </div>
  </section>

  {#snippet iconFor(name: string)}{@render icon(name)}{/snippet}
</div>

<style>
  .stage-block {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    min-inline-size: 0;
  }
  .stage-block :global(.readout) {
    white-space: normal;
  }
  .narrow {
    max-inline-size: 16rem;
  }
</style>
