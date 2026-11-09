<script lang="ts">
  // Menu implementation review: row actions with icons and shortcuts, groups and a destructive item, a disabled item,
  // links, long labels, a long menu that scrolls, a menu in a dark subtree, in any brand, appearance and density.
  import {
    Button,
    Icon,
    IconButton,
    Menu,
    MenuGroup,
    MenuItem,
    MenuSeparator,
    Shortcut
  } from '../../packages/svelte/src/index.ts';
  import type { MenuAlign, MenuSide } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';
  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let side = $state<MenuSide>('bottom');
  let align = $state<MenuAlign>('start');
  let open = $state(false);
  let selected = $state('none');
  let count = $state(0);
  const select = (value: string) => {
    selected = value;
    count++;
  };
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Menu</h1>
    <p class="lede">
      A short list of actions or links opened from a button. Arrow keys move the highlight, typing a letter jumps to an
      item, Enter activates it; Escape or Tab closes the menu. Every control below is the real Svelte component on the
      approved tokens.
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
        <Menu id="actions" {side} {align} bind:open onselect={select}>
          {#snippet trigger(props)}<Button label="Actions" intent="neutral" appearance="outline" {...props} />{/snippet}
          <MenuItem id="mi-edit" label="Edit" value="edit">
            {#snippet leading()}{@render iconFor('pencil-simple')}{/snippet}
            {#snippet trailing()}<Shortcut keys="E" size="sm" />{/snippet}
          </MenuItem>
          <MenuItem id="mi-copy" label="Duplicate" value="duplicate">
            {#snippet leading()}{@render iconFor('copy')}{/snippet}
            {#snippet trailing()}<Shortcut keys="Mod+D" size="sm" />{/snippet}
          </MenuItem>
          <MenuItem id="mi-share" label="Share" value="share" />
          <MenuItem id="mi-archive" label="Archive" value="archive" disabled />
          <MenuSeparator />
          <MenuGroup label="Danger zone">
            <MenuItem id="mi-delete" label="Delete" value="delete" intent="danger">
              {#snippet leading()}{@render iconFor('trash')}{/snippet}
            </MenuItem>
          </MenuGroup>
        </Menu>
        <button type="button" id="after">After</button>
        <p class="readout">
          <span data-testid="selected">Selected: {selected}</span> · <span data-testid="count">Count: {count}</span> ·
          <span data-testid="open">Open: {open}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Side <select id="opt-side" bind:value={side}
            >{#each ['bottom', 'top'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Align <select id="opt-align" bind:value={align}
            >{#each ['start', 'center', 'end'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Row actions (icon button), links, a long label</p>
        <Menu id="row" label="Report actions" align="end" onselect={select}>
          {#snippet trigger(props)}<IconButton label="More actions" intent="neutral" appearance="ghost" {...props}
              >{#snippet icon()}{@render iconFor('dots-three')}{/snippet}</IconButton
            >{/snippet}
          <MenuItem id="row-open" label="Open in a new tab" value="open" href="#report" />
          <MenuItem
            id="row-download"
            label="Download as a PDF with comments and the full revision history"
            value="download"
          />
          <MenuItem id="row-remove" label="Remove" value="remove" intent="danger" />
        </Menu>
      </div>
      <div class="panel">
        <p class="panel-title">A long menu that scrolls</p>
        <Menu id="long" onselect={select}>
          {#snippet trigger(props)}<Button label="Move to" intent="neutral" appearance="outline" {...props} />{/snippet}
          {#each ['Archive', 'Backlog', 'Clients', 'Design', 'Engineering', 'Finance', 'Growth', 'Hiring', 'Interviews', 'Journal', 'Knowledge', 'Legal', 'Marketing', 'Notes', 'Operations', 'Partners', 'Quality', 'Research', 'Sales', 'Travel', 'Updates', 'Vendors', 'Wiki', 'Years'] as folder (folder)}
            <MenuItem id={`long-${folder.toLowerCase()}`} label={folder} />
          {/each}
        </Menu>
      </div>
      <div class="panel">
        <p class="panel-title">Disabled first and last items: opening starts on an enabled one</p>
        <Menu id="locked" onselect={select}>
          {#snippet trigger(props)}<Button
              label="Locked report"
              intent="neutral"
              appearance="outline"
              {...props}
            />{/snippet}
          <MenuItem id="locked-edit" label="Edit" disabled />
          <MenuItem id="locked-copy" label="Duplicate" />
          <MenuItem id="locked-export" label="Export" />
          <MenuItem id="locked-delete" label="Delete" intent="danger" disabled />
        </Menu>
      </div>
      <div class="panel">
        <p class="panel-title">Inside a dark subtree and a clipped container</p>
        <div class="dark-panel" data-ggb-appearance="dark">
          <div class="clip">
            <Menu id="dark" onselect={select}>
              {#snippet trigger(props)}<Button
                  label="Options"
                  intent="neutral"
                  appearance="outline"
                  {...props}
                />{/snippet}
              <MenuItem id="dark-a" label="Rename" />
              <MenuItem id="dark-b" label="Delete" intent="danger" />
            </Menu>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#snippet iconFor(name: string)}{@render icon(name)}{/snippet}
</div>

<style>
  .dark-panel {
    padding: var(--ggb-space-content-lg);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  .clip {
    block-size: 6rem;
    overflow: hidden;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
</style>
