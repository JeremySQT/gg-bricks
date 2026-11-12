<script lang="ts">
  // Tabs implementation review: a playground with every option, sizes, a vertical list, a disabled tab, counters and
  // badges, a list that overflows and scrolls, panels without focusable content, a value that matches no tab, in any
  // brand, appearance and density.
  import {
    Badge,
    Button,
    Counter,
    Icon,
    InputText,
    Tabs,
    TabsPanel,
    TabsTrigger
  } from '../../packages/svelte/src/index.ts';
  import type { TabsActivation, TabsAppearance, TabsOrientation, TabsSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: TabsSize[] = ['sm', 'md', 'lg'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let value = $state('overview');
  let appearance = $state<TabsAppearance>('contained');
  let size = $state<TabsSize>('md');
  let orientation = $state<TabsOrientation>('horizontal');
  let activation = $state<TabsActivation>('automatic');
  let icons = $state(false);
  let changes = $state(0);
  let last = $state('none');
  const change = (v: string) => {
    changes++;
    last = v;
  };
  const many = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Tabs</h1>
    <p class="lede">
      One panel of related content at a time, with a list of tabs to switch. The list is one Tab stop; arrow keys move
      between tabs (and select them with automatic activation), Home and End jump to the ends, Tab moves into the panel.
      Every control below is the real Svelte component on the approved tokens.
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
        <Tabs
          id="play"
          label="Project"
          bind:value
          {appearance}
          {size}
          {orientation}
          {activation}
          onvaluechange={change}
        >
          {#snippet list()}
            <TabsTrigger label="Overview" value="overview">
              {#snippet leading()}{#if icons}{@render icon('info')}{/if}{/snippet}
            </TabsTrigger>
            <TabsTrigger label="Activity" value="activity">
              {#snippet trailing()}<Counter value={12} {size} />{/snippet}
            </TabsTrigger>
            <TabsTrigger label="Files" value="files">
              {#snippet leading()}{#if icons}{@render icon('download-simple')}{/if}{/snippet}
            </TabsTrigger>
            <TabsTrigger label="Billing" value="billing" disabled />
            <TabsTrigger label="Settings" value="settings">
              {#snippet trailing()}<Badge label="New" intent="accent" {size} />{/snippet}
            </TabsTrigger>
          {/snippet}
          <TabsPanel value="overview"
            ><p>
              The project at a glance: owner, status and the latest milestone. This panel has no focusable content, so
              it is a Tab stop of its own.
            </p></TabsPanel
          >
          <TabsPanel value="activity"
            ><p>Twelve updates this week.</p>
            <Button id="activity-more" label="Show all activity" intent="neutral" appearance="outline" /></TabsPanel
          >
          <TabsPanel value="files"><InputText id="files-search" label="Search files" placeholder="Search" /></TabsPanel>
          <TabsPanel value="billing"><p>Billing is not available for this project.</p></TabsPanel>
          <TabsPanel value="settings"><p>Name, members and notifications.</p></TabsPanel>
        </Tabs>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="value">Value: {value}</span> · <span data-testid="changes">Changes: {changes}</span> ·
          <span data-testid="last">Last: {last}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Appearance <select id="opt-appearance" bind:value={appearance}
            >{#each ['contained', 'line'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Orientation <select id="opt-orientation" bind:value={orientation}
            >{#each ['horizontal', 'vertical'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Activation <select id="opt-activation" bind:value={activation}
            >{#each ['automatic', 'manual'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label><input type="checkbox" id="opt-icons" bind:checked={icons} /> Leading icons</label>
        <button type="button" id="set-files" onclick={() => (value = 'files')}>Select Files from the app</button>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">Line, size {s}</p>
          <Tabs id={`line-${s}`} label={`Line, size ${s}`} appearance="line" size={s}>
            {#snippet list()}
              <TabsTrigger label="General" value="general" />
              <TabsTrigger label="Members" value="members" />
              <TabsTrigger label="Security" value="security" />
            {/snippet}
            <TabsPanel value="general"><p>General settings.</p></TabsPanel>
            <TabsPanel value="members"><p>Members.</p></TabsPanel>
            <TabsPanel value="security"><p>Security.</p></TabsPanel>
          </Tabs>
        </div>
      {/each}
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">Contained, size {s}</p>
          <Tabs id={`size-${s}`} label={`Size ${s}`} size={s}>
            {#snippet list()}
              <TabsTrigger label="General" value="general" />
              <TabsTrigger label="Members" value="members" />
              <TabsTrigger label="Security" value="security" />
            {/snippet}
            <TabsPanel value="general"><p>General settings.</p></TabsPanel>
            <TabsPanel value="members"><p>Members.</p></TabsPanel>
            <TabsPanel value="security"><p>Security.</p></TabsPanel>
          </Tabs>
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">A list that overflows its width scrolls; the selected tab stays visible</p>
        <div class="narrow">
          <Tabs id="months" label="Month" value="November" appearance="line">
            {#snippet list()}
              {#each many as m (m)}<TabsTrigger label={m} value={m} />{/each}
            {/snippet}
            {#each many as m (m)}<TabsPanel value={m}><p>Report for {m}.</p></TabsPanel>{/each}
          </Tabs>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Contained list that overflows</p>
        <div class="narrow">
          <Tabs id="months-contained" label="Month (contained)" value="November">
            {#snippet list()}
              {#each many as m (m)}<TabsTrigger label={m} value={m} />{/each}
            {/snippet}
            {#each many as m (m)}<TabsPanel value={m}><p>Report for {m}.</p></TabsPanel>{/each}
          </Tabs>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Vertical list, manual activation</p>
        <Tabs id="vertical" label="Settings" orientation="vertical" activation="manual">
          {#snippet list()}
            <TabsTrigger label="Profile" value="profile" />
            <TabsTrigger label="Notifications" value="notifications" />
            <TabsTrigger label="Integrations" value="integrations" disabled />
            <TabsTrigger label="Danger zone" value="danger" />
          {/snippet}
          <TabsPanel value="profile"><p>Your name and photo.</p></TabsPanel>
          <TabsPanel value="notifications"><p>Email and push.</p></TabsPanel>
          <TabsPanel value="integrations"><p>Connected apps.</p></TabsPanel>
          <TabsPanel value="danger"><p>Delete the account.</p></TabsPanel>
        </Tabs>
      </div>
      <div class="panel">
        <p class="panel-title">A value that matches no enabled tab shows the first enabled one</p>
        <Tabs id="fallback" label="Fallback" value="missing">
          {#snippet list()}
            <TabsTrigger label="Locked" value="locked" disabled />
            <TabsTrigger label="First enabled" value="first" />
            <TabsTrigger label="Second" value="second" />
          {/snippet}
          <TabsPanel value="locked"><p>Locked.</p></TabsPanel>
          <TabsPanel value="first"><p>The first enabled tab.</p></TabsPanel>
          <TabsPanel value="second"><p>Second.</p></TabsPanel>
        </Tabs>
      </div>
      <div class="panel">
        <p class="panel-title">Right-to-left: the arrow keys follow the reading direction</p>
        <div dir="rtl">
          <Tabs id="rtl" label="RTL">
            {#snippet list()}
              <TabsTrigger label="الأول" value="one" />
              <TabsTrigger label="الثاني" value="two" />
              <TabsTrigger label="الثالث" value="three" />
            {/snippet}
            <TabsPanel value="one"><p>١</p></TabsPanel>
            <TabsPanel value="two"><p>٢</p></TabsPanel>
            <TabsPanel value="three"><p>٣</p></TabsPanel>
          </Tabs>
        </div>
      </div>
    </div>
  </section>
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
    max-inline-size: 22rem;
  }
</style>
