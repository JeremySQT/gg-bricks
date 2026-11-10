<script lang="ts">
  // Toolbar implementation review: a playground with every option (icon buttons with tooltips, a Menu, a Popover,
  // separators, a disabled item), sizes, a vertical toolbar, a toolbar that wraps, in any brand, appearance and density.
  import {
    Button,
    Icon,
    IconButton,
    InputText,
    Menu,
    MenuItem,
    Popover,
    Toolbar,
    ToolbarSeparator,
    Tooltip
  } from '../../packages/svelte/src/index.ts';
  import type { ToolbarOrientation, ToolbarSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: ToolbarSize[] = ['sm', 'md', 'lg'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let size = $state<ToolbarSize>('md');
  let orientation = $state<ToolbarOrientation>('horizontal');
  let deleteDisabled = $state(true);
  let last = $state('none');
  let count = $state(0);
  const act = (name: string) => () => {
    last = name;
    count++;
  };
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Toolbar</h1>
    <p class="lede">
      Frequent controls for one area in a single Tab stop. Arrow keys move between the items (disabled ones are
      skipped), Home and End jump to the ends; a Menu or a Popover opens from its trigger and gives focus back to it.
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
      <div class="stage">
        <button type="button" id="before">Before</button>
        <Toolbar id="play" label="Selection actions" {size} {orientation}>
          <Tooltip label="Copy">
            <IconButton id="t-copy" label="Copy" onactivate={act('copy')}
              >{#snippet icon()}{@render iconFor('copy')}{/snippet}</IconButton
            >
          </Tooltip>
          <Tooltip label="Rename">
            <IconButton id="t-rename" label="Rename" onactivate={act('rename')}
              >{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton
            >
          </Tooltip>
          <Tooltip label="Delete">
            <IconButton
              id="t-delete"
              label="Delete"
              intent="danger"
              disabled={deleteDisabled}
              onactivate={act('delete')}>{#snippet icon()}{@render iconFor('trash')}{/snippet}</IconButton
            >
          </Tooltip>
          <ToolbarSeparator />
          <Button id="t-download" label="Download" intent="neutral" appearance="ghost" onactivate={act('download')}>
            {#snippet leading()}{@render iconFor('download-simple')}{/snippet}
          </Button>
          <Popover id="t-filter" label="Filter">
            {#snippet trigger(props)}<Button {...props} label="Filter" intent="neutral" appearance="ghost" />{/snippet}
            <InputText id="t-filter-name" label="Name contains" placeholder="Name contains" />
          </Popover>
          <Menu id="t-more" onselect={(v) => act(v)()}>
            {#snippet trigger(props)}<IconButton {...props} label="More actions"
                >{#snippet icon()}{@render iconFor('dots-three')}{/snippet}</IconButton
              >{/snippet}
            <MenuItem id="t-more-archive" label="Archive" value="archive" />
            <MenuItem id="t-more-share" label="Share" value="share" />
          </Menu>
        </Toolbar>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="last">Last: {last}</span> · <span data-testid="count">Count: {count}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
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
        <label><input type="checkbox" id="opt-delete-disabled" bind:checked={deleteDisabled} /> Delete disabled</label>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      {#each sizes as s (s)}
        <div class="panel">
          <p class="panel-title">Size {s}</p>
          <Toolbar id={`size-${s}`} label={`Size ${s}`} size={s}>
            <IconButton label="Copy">{#snippet icon()}{@render iconFor('copy')}{/snippet}</IconButton>
            <IconButton label="Rename">{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton>
            <ToolbarSeparator />
            <Button label="Share" intent="neutral" appearance="outline" />
          </Toolbar>
        </div>
      {/each}
      <div class="panel">
        <p class="panel-title">Vertical</p>
        <Toolbar id="vertical" label="Drawing tools" orientation="vertical" size="sm">
          <IconButton label="Select">{#snippet icon()}{@render iconFor('arrow-right')}{/snippet}</IconButton>
          <IconButton label="Draw">{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton>
          <ToolbarSeparator />
          <IconButton label="Erase">{#snippet icon()}{@render iconFor('x')}{/snippet}</IconButton>
        </Toolbar>
      </div>
      <div class="panel">
        <p class="panel-title">A narrow column: the items that do not fit move into the More menu</p>
        <div class="narrow">
          <Toolbar id="wrap" label="Bulk actions" size="sm">
            <Button label="Assign" intent="neutral" appearance="outline" />
            <Button label="Move" intent="neutral" appearance="outline" />
            <Button label="Label" intent="neutral" appearance="outline" />
            <Button label="Archive" intent="neutral" appearance="outline" />
            <Button label="Delete" intent="danger" appearance="outline" />
          </Toolbar>
        </div>
      </div>
    </div>
  </section>

  {#snippet iconFor(name: string)}{@render icon(name)}{/snippet}
</div>

<style>
  .narrow {
    max-inline-size: 14rem;
  }
</style>
