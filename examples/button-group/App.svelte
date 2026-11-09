<script lang="ts">
  // ButtonGroup implementation review: a playground with every option and a resizable container, sizes and
  // orientations, and the compositions the catalog names (dialog footer, form actions, a split footer of two groups,
  // icon buttons, a narrow column that stacks), in any brand, appearance and density.
  import { Button, ButtonGroup, Icon, IconButton } from '../../packages/svelte/src/index.ts';
  import type { ButtonGroupAlign, ButtonGroupOrientation, ButtonGroupSize } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: ButtonGroupSize[] = ['sm', 'md', 'lg'];
  const orientations: ButtonGroupOrientation[] = ['horizontal', 'vertical'];
  const aligns: ButtonGroupAlign[] = ['start', 'center', 'end', 'stretch'];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let size = $state<ButtonGroupSize>('md');
  let orientation = $state<ButtonGroupOrientation>('horizontal');
  let align = $state<ButtonGroupAlign>('start');
  let named = $state(false);
  let width = $state(100);
  let activations = $state(0);
  let last = $state('none');
  const act = (name: string) => () => {
    activations++;
    last = name;
  };
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>ButtonGroup</h1>
    <p class="lede">
      Related actions placed together with one size and one spacing. The group sets the size of every button, aligns
      them on a line, and stacks them at full width when the line does not fit; each button stays its own tab stop and
      the order never changes. Every control below is the real Svelte component on the approved tokens.
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
        <div class="frame" style:inline-size={`${width}%`} data-testid="frame">
          <ButtonGroup id="play" {size} {orientation} {align} label={named ? 'Document actions' : undefined}>
            <Button id="play-cancel" label="Cancel" intent="neutral" appearance="ghost" onactivate={act('cancel')} />
            <Button
              id="play-draft"
              label="Save draft"
              intent="neutral"
              appearance="outline"
              onactivate={act('draft')}
            />
            <Button id="play-publish" label="Publish" size="lg" onactivate={act('publish')} />
          </ButtonGroup>
        </div>
        <button type="button" id="after">After</button>
        <p class="readout" aria-live="polite">
          <span data-testid="last">Last: {last}</span> ·
          <span data-testid="activations">Activations: {activations}</span>
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
            >{#each orientations as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Align <select id="opt-align" bind:value={align}
            >{#each aligns as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Container width <input id="opt-width" type="range" min="15" max="100" step="1" bind:value={width} />
          {width}%</label
        >
        <label class="check"
          ><input id="opt-named" type="checkbox" bind:checked={named} /> Named group (Document actions)</label
        >
        <p class="hint">The Publish button asks for lg on its own: inside the group it follows the group size.</p>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes and orientations</h2>
    <div class="grid">
      {#each sizes as s (s)}
        {#each orientations as o (o)}
          <div class="panel">
            <p class="panel-title">{s} · {o}</p>
            <ButtonGroup id={`bg-${o}-${s}`} size={s} orientation={o}>
              <Button id={`bg-${o}-${s}-a`} label="Back" intent="neutral" appearance="outline" />
              <Button id={`bg-${o}-${s}-b`} label="Continue" />
              <IconButton id={`bg-${o}-${s}-c`} label="More actions" intent="neutral" appearance="ghost">
                {#snippet icon()}{@render iconFor('dots-three')}{/snippet}
              </IconButton>
            </ButtonGroup>
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Dialog footer: end aligned, the primary action last</p>
        <ButtonGroup id="footer" align="end">
          <Button id="footer-cancel" label="Cancel" intent="neutral" appearance="outline" />
          <Button id="footer-delete" label="Delete project" intent="danger" />
        </ButtonGroup>
      </div>
      <div class="panel">
        <p class="panel-title">Split footer: two groups in a layout</p>
        <div class="split">
          <ButtonGroup id="split-start">
            <Button id="split-remove" label="Remove" intent="danger" appearance="ghost" />
          </ButtonGroup>
          <ButtonGroup id="split-end" align="end">
            <Button id="split-cancel" label="Cancel" intent="neutral" appearance="outline" />
            <Button id="split-save" label="Save" />
          </ButtonGroup>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Icon buttons, small, named group</p>
        <ButtonGroup id="icons" size="sm" label="Text formatting">
          <IconButton id="icons-copy" label="Copy" intent="neutral" appearance="ghost"
            >{#snippet icon()}{@render iconFor('copy')}{/snippet}</IconButton
          >
          <IconButton id="icons-edit" label="Edit" intent="neutral" appearance="ghost"
            >{#snippet icon()}{@render iconFor('pencil-simple')}{/snippet}</IconButton
          >
          <IconButton id="icons-delete" label="Delete" intent="danger" appearance="ghost"
            >{#snippet icon()}{@render iconFor('trash')}{/snippet}</IconButton
          >
        </ButtonGroup>
      </div>
      <div class="panel">
        <p class="panel-title">Narrow column: the line stacks</p>
        <div class="narrow">
          <ButtonGroup id="narrow" align="end">
            <Button id="narrow-later" label="Remind me later" intent="neutral" appearance="outline" />
            <Button id="narrow-update" label="Update now" />
          </ButtonGroup>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Vertical, stretched</p>
        <div class="narrow">
          <ButtonGroup id="vertical-stretch" orientation="vertical" align="stretch">
            <Button id="vs-google" label="Continue with Google" intent="neutral" appearance="outline" />
            <Button id="vs-email" label="Continue with email" />
          </ButtonGroup>
        </div>
      </div>
    </div>
  </section>
</div>

{#snippet iconFor(name: string)}{@render icon(name)}{/snippet}

<style>
  .stage {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: var(--ggb-space-content-md);
    min-inline-size: 0;
  }
  .frame {
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
    max-inline-size: 100%;
  }
  .frame :global(.ggb-button-group) {
    inline-size: 100%;
  }
  .split {
    display: flex;
    justify-content: space-between;
    gap: var(--ggb-space-content-md);
    flex-wrap: wrap;
  }
  .narrow {
    inline-size: 14rem;
    max-inline-size: 100%;
  }
  .narrow :global(.ggb-button-group) {
    inline-size: 100%;
  }
  .hint {
    font: var(--ggb-typography-body-sm);
  }
  .check {
    gap: var(--ggb-space-content-xs);
  }
</style>
