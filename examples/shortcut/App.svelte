<script lang="ts">
  // Shortcut implementation review: a playground with every option, representative combinations side by side
  // on mac and other, every size in both appearances, the Button trailing slot, a menu-like list, a tooltip-like
  // line and difficult cases, in any brand, appearance and density.
  import { Button, Shortcut } from '../../packages/svelte/src/index.ts';
  import type {
    ButtonAppearance,
    ButtonIntent,
    ButtonSize,
    ShortcutAppearance,
    ShortcutPlatform,
    ShortcutSize
  } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const platforms: ShortcutPlatform[] = ['auto', 'mac', 'other'];
  const forced: Exclude<ShortcutPlatform, 'auto'>[] = ['mac', 'other'];
  const appearances: ShortcutAppearance[] = ['plain', 'keycap'];
  const sizes: ShortcutSize[] = ['sm', 'md', 'lg'];
  const intents: ButtonIntent[] = ['accent', 'neutral', 'danger'];
  const buttonAppearances: ButtonAppearance[] = ['solid', 'outline', 'ghost'];

  /** Representative combinations, with a stable slug for ids. */
  const combinations = [
    { slug: 'mod-k', keys: 'Mod+K', note: 'Mod resolves per platform' },
    { slug: 'ctrl-shift-p', keys: 'Ctrl+Shift+P', note: 'explicit Ctrl keeps its meaning' },
    { slug: 'shift-enter', keys: 'Shift+Enter', note: 'special key glyph versus name' },
    { slug: 'alt-arrowup', keys: 'Alt+ArrowUp', note: 'arrow glyph everywhere' },
    { slug: 'escape', keys: 'Escape', note: 'single special key' },
    { slug: 'f5', keys: 'F5', note: 'function key name everywhere' },
    { slug: 'mod-plus', keys: 'Mod+Plus', note: 'the + key' },
    { slug: 'literal', keys: 'g', note: 'literal letter, uppercased' },
    { slug: 'unordered', keys: 'K+Shift+Meta+Alt+Ctrl', note: 'reordered to the canonical order' }
  ];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  // Playground
  let keys = $state('Mod+Shift+P');
  let platform = $state<ShortcutPlatform>('auto');
  let appearance = $state<ShortcutAppearance>('plain');
  let size = $state<ShortcutSize>('md');
  let label = $state('');
  // Readout of what the component rendered (resolved platform, spoken text), observed on its DOM.
  let playground = $state<HTMLElement | null>(null);
  let spoken = $state('');
  let resolvedPlatform = $state('');
  $effect(() => {
    const element = playground;
    if (!element) return;
    const read = () => {
      spoken = element.querySelector('.ggb-shortcut__name')?.textContent ?? '';
      resolvedPlatform = element.dataset.platform ?? '';
    };
    const observer = new MutationObserver(read);
    observer.observe(element, { subtree: true, childList: true, characterData: true, attributes: true });
    read();
    return () => observer.disconnect();
  });

  // Constrained width
  let width = $state(72);

  let detected = $state('');
  $effect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    detected = nav.userAgentData?.platform || nav.platform || 'unknown';
  });
</script>

{#snippet buttonShortcut(size: ButtonSize)}<Shortcut keys="Mod+S" {size} />{/snippet}
{#snippet shortcutSm()}{@render buttonShortcut('sm')}{/snippet}
{#snippet shortcutMd()}{@render buttonShortcut('md')}{/snippet}
{#snippet shortcutLg()}{@render buttonShortcut('lg')}{/snippet}
{#snippet shortcutMac()}<Shortcut keys="Mod+Shift+P" platform="mac" />{/snippet}
{#snippet shortcutOther()}<Shortcut keys="Mod+Shift+P" platform="other" />{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header class="hero">
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Shortcut</h1>
    <p class="lede">
      Shows a keyboard shortcut written once in a platform-neutral notation and rendered in the conventions of the
      user's platform, with a spoken equivalent for assistive technology. Detected platform of this browser:
      <code data-testid="detected-platform">{detected}</code>.
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
        <p class="sentence">
          Press <Shortcut id="play-shortcut" {keys} {platform} {appearance} {size} {label} bind:ref={playground} /> to open
          the command palette.
        </p>
        <p class="readout" aria-live="polite">
          <span data-testid="resolved-platform">Resolved platform: {resolvedPlatform}</span> ·
          <span data-testid="spoken">Spoken: {spoken}</span>
        </p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Keys <input id="opt-keys" bind:value={keys} /></label>
        <label
          >Platform <select id="opt-platform" bind:value={platform}
            >{#each platforms as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Appearance <select id="opt-appearance" bind:value={appearance}
            >{#each appearances as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>Label <input id="opt-label" bind:value={label} placeholder="spoken equivalent" /></label>
      </fieldset>
    </div>
  </section>

  <section id="combinations" aria-labelledby="combinations-title">
    <h2 id="combinations-title">Representative combinations</h2>
    <p>The same notation rendered on mac (Apple glyphs juxtaposed) and on other platforms (short names joined by +).</p>
    <table class="combos">
      <thead>
        <tr><th>keys</th><th>mac</th><th>other</th><th>mac keycap</th><th>other keycap</th><th>note</th></tr>
      </thead>
      <tbody>
        {#each combinations as c (c.slug)}
          <tr>
            <td><code>{c.keys}</code></td>
            {#each forced as p (p)}
              <td><Shortcut id={`combo-${c.slug}-${p}`} data-testid="combo" keys={c.keys} platform={p} /></td>
            {/each}
            {#each forced as p (p)}
              <td
                ><Shortcut
                  id={`combo-${c.slug}-${p}-keycap`}
                  data-testid="combo-keycap"
                  keys={c.keys}
                  platform={p}
                  appearance="keycap"
                /></td
              >
            {/each}
            <td class="note-cell">{c.note}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section id="sizes" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Sizes and appearances</h2>
    <p>
      Indicator typography sm, md, lg (11, 12, 14 px); a keycap is the line box plus two borders tall and never narrower
      than tall.
    </p>
    <div class="matrix">
      <span></span>
      {#each forced as p (p)}{#each appearances as a (a)}<span class="col-head">{p} {a}</span>{/each}{/each}
      {#each sizes as s (s)}
        <span class="row-head">{s}</span>
        {#each forced as p (p)}
          {#each appearances as a (a)}
            <div class="cell">
              <Shortcut
                id={`size-${s}-${a}-${p}`}
                data-testid="size"
                keys="Mod+Shift+K"
                size={s}
                appearance={a}
                platform={p}
              />
              <Shortcut
                id={`single-${s}-${a}-${p}`}
                data-testid="single"
                keys="K"
                size={s}
                appearance={a}
                platform={p}
              />
              <Shortcut
                id={`wide-${s}-${a}-${p}`}
                data-testid="wide"
                keys="Alt+Enter"
                size={s}
                appearance={a}
                platform={p}
              />
            </div>
          {/each}
        {/each}
      {/each}
    </div>
  </section>

  <section id="buttons" aria-labelledby="buttons-title">
    <h2 id="buttons-title">Inside a Button trailing slot</h2>
    <p>
      Plain appearance, the Button's size passed unchanged; the shortcut takes the resolved button content color in
      every intent, appearance and state.
    </p>
    <div class="grid wide">
      <div class="panel">
        <p class="panel-title">Intent × appearance (md)</p>
        <div class="matrix buttons">
          <span></span>
          {#each buttonAppearances as a (a)}<span class="col-head">{a}</span>{/each}
          {#each intents as i (i)}
            <span class="row-head">{i}</span>
            {#each buttonAppearances as a (a)}
              <div class="cell">
                <Button
                  id={`button-${i}-${a}`}
                  data-testid="button"
                  label="Save"
                  intent={i}
                  appearance={a}
                  trailing={shortcutMd}
                />
              </div>
            {/each}
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Sizes</p>
        <div class="row">
          <Button
            id="button-size-sm"
            label="Save"
            size="sm"
            intent="neutral"
            appearance="outline"
            trailing={shortcutSm}
          />
          <Button
            id="button-size-md"
            label="Save"
            size="md"
            intent="neutral"
            appearance="outline"
            trailing={shortcutMd}
          />
          <Button
            id="button-size-lg"
            label="Save"
            size="lg"
            intent="neutral"
            appearance="outline"
            trailing={shortcutLg}
          />
        </div>
        <p class="panel-title">States and forced platforms</p>
        <div class="row">
          <Button id="button-disabled" label="Save" disabled trailing={shortcutMd} />
          <Button id="button-loading" label="Save" loading trailing={shortcutMd} />
          <Button id="button-mac" label="Command palette" intent="neutral" appearance="ghost" trailing={shortcutMac} />
          <Button
            id="button-other"
            label="Command palette"
            intent="neutral"
            appearance="ghost"
            trailing={shortcutOther}
          />
        </div>
      </div>
    </div>
  </section>

  <section id="contexts" aria-labelledby="contexts-title">
    <h2 id="contexts-title">Menu, tooltip and help contexts</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Menu-like list</p>
        <ul class="menu" aria-label="Edit">
          {#each [['Undo', 'Mod+Z'], ['Redo', 'Mod+Shift+Z'], ['Find', 'Mod+F'], ['Delete line', 'Mod+Shift+K']] as [text, k], i (k)}
            <li>
              <button type="button" id={`menu-item-${i}`} class="menu-item">
                <span>{text}</span>
                <Shortcut keys={k} platform="mac" data-testid="menu-shortcut" />
              </button>
            </li>
          {/each}
          <li>
            <button type="button" id="menu-item-disabled" class="menu-item" disabled>
              <span>Paste special</span>
              <Shortcut keys="Mod+Shift+V" platform="mac" data-testid="menu-shortcut" />
            </button>
          </li>
        </ul>
      </div>
      <div class="panel">
        <p class="panel-title">Tooltip-like line</p>
        <p class="tooltip" role="tooltip" id="tooltip">Save changes <Shortcut keys="Mod+S" platform="other" /></p>
        <p class="tooltip" role="tooltip" id="tooltip-label">
          Enregistrer <Shortcut keys="Mod+S" platform="mac" label="Commande S" />
        </p>
        <p class="panel-title">Inline help</p>
        <p class="help">
          Use <Shortcut keys="Mod+K" appearance="keycap" platform="other" id="help-keycap" /> to open the command palette,
          then <Shortcut keys="ArrowDown" appearance="keycap" platform="other" /> and
          <Shortcut keys="Enter" appearance="keycap" platform="other" /> to run a command.
        </p>
      </div>
      <div class="panel" data-ggb-appearance={mode === 'light' ? 'dark' : 'light'}>
        <p class="panel-title">Nested opposite mode</p>
        <div class="row">
          <Shortcut id="nested-keycap" keys="Mod+Shift+P" platform="other" appearance="keycap" />
          <Shortcut id="nested-plain" keys="Mod+Shift+P" platform="mac" />
          <Button label="Save" intent="neutral" appearance="outline" trailing={shortcutMd} />
        </div>
      </div>
    </div>
  </section>

  <section id="difficult" aria-labelledby="difficult-title">
    <h2 id="difficult-title">Difficult cases</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">One line in a constrained width</p>
        <label class="field"
          >Width: {width}px <input id="width" type="range" min="24" max="320" bind:value={width} /></label
        >
        <div class="constrained" style:inline-size={`${width}px`}>
          <Shortcut id="nowrap" keys="Ctrl+Alt+Shift+Meta+Delete" platform="other" appearance="keycap" />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Every modifier and special key</p>
        <div class="stack">
          {#each forced as p (p)}
            <Shortcut id={`all-modifiers-${p}`} keys="Ctrl+Alt+Shift+Meta+K" platform={p} appearance="keycap" />
            <Shortcut keys="Enter+Escape+Tab+Space+Backspace+Delete" platform={p} appearance="keycap" />
            <Shortcut keys="Home+End+PageUp+PageDown+Up+Down+Left+Right" platform={p} appearance="keycap" />
            <Shortcut keys="F1+F12+Plus+Space" platform={p} appearance="keycap" />
          {/each}
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Unknown names, empty tokens, long literals</p>
        <div class="stack">
          <Shortcut id="unknown" keys="Mod+Foo" platform="mac" appearance="keycap" />
          <Shortcut id="empty-token" keys="Ctrl++K" platform="other" appearance="keycap" />
          <Shortcut id="long-literal" keys="Ctrl+NumLock" platform="other" appearance="keycap" />
          <Shortcut id="lowercase" keys="ctrl+shift+a" platform="other" />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Right to left</p>
        <p dir="rtl" lang="ar">حفظ <Shortcut id="rtl" keys="Mod+S" platform="other" appearance="keycap" /></p>
      </div>
      <div class="panel">
        <p class="panel-title">Baseline in running text</p>
        <p class="baseline">
          Body text with <Shortcut id="inline-plain" keys="Mod+K" platform="mac" /> and
          <Shortcut id="inline-keycap" keys="Mod+K" platform="mac" appearance="keycap" /> aligned on the baseline;
          <span class="lg-text">larger text with <Shortcut keys="Mod+K" platform="other" size="lg" /> too.</span>
        </p>
      </div>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  :global(*) {
    box-sizing: border-box;
  }
  .page {
    min-height: 100vh;
    padding: var(--ggb-space-layout-xl) var(--ggb-space-layout-lg);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  section,
  header {
    max-width: 1200px;
    margin: 0 auto var(--ggb-space-layout-xl);
  }
  h1 {
    font: var(--ggb-typography-display-md);
    letter-spacing: var(--ggb-typography-display-md-letterSpacing);
    margin: var(--ggb-space-content-sm) 0;
  }
  h2 {
    font: var(--ggb-typography-heading-lg);
    letter-spacing: var(--ggb-typography-heading-lg-letterSpacing);
    margin: 0 0 var(--ggb-space-content-sm);
    padding-top: var(--ggb-space-layout-md);
    border-top: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  p {
    color: var(--ggb-color-content-secondary);
    margin: 0 0 var(--ggb-space-content-lg);
    max-width: 72ch;
  }
  .lede {
    font: var(--ggb-typography-body-lg);
  }
  .eyebrow,
  .panel-title,
  .col-head,
  .row-head,
  legend {
    font: var(--ggb-typography-label-sm);
    letter-spacing: var(--ggb-typography-label-sm-letterSpacing);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  code {
    font: var(--ggb-typography-code-sm);
  }
  .controls,
  .options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-md) var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    margin: 0;
    background: var(--ggb-color-surface-subtle);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .controls label,
  .options label,
  .field {
    display: flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  .field {
    margin-block-end: var(--ggb-space-content-md);
  }
  select,
  input:not([type]) {
    font: inherit;
    color: var(--ggb-color-input-default-content);
    background: var(--ggb-color-input-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-input-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
  }
  select:focus-visible,
  input:focus-visible,
  .menu-item:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  input[type='range'] {
    accent-color: var(--ggb-color-action-accent-solid-default-surface);
  }
  .playground {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 22rem);
    gap: var(--ggb-space-layout-sm);
  }
  .stage {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--ggb-space-content-lg);
    min-block-size: 14rem;
    padding: var(--ggb-space-layout-md);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .sentence {
    margin: 0;
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-lg);
  }
  .readout {
    text-align: center;
    margin: 0;
    font: var(--ggb-typography-label-sm);
  }
  .options {
    flex-direction: column;
    align-items: stretch;
  }
  .options label {
    justify-content: space-between;
  }
  .combos {
    border-collapse: collapse;
    inline-size: 100%;
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .combos th,
  .combos td {
    text-align: start;
    padding: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    border-block-end: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .combos th {
    font: var(--ggb-typography-label-sm);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
  }
  .note-cell {
    color: var(--ggb-color-content-secondary);
    font: var(--ggb-typography-body-sm);
  }
  .matrix {
    display: grid;
    grid-template-columns: max-content repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .grid.wide {
    grid-template-columns: repeat(auto-fit, minmax(min(26rem, 100%), 1fr));
  }
  .matrix.buttons {
    grid-template-columns: max-content repeat(3, max-content);
    padding: 0;
    border: 0;
  }
  .col-head,
  .row-head {
    margin: 0;
  }
  .cell {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-lg);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: var(--ggb-space-layout-sm);
  }
  .panel {
    margin: 0;
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-lg);
    margin-block-end: var(--ggb-space-content-lg);
  }
  .stack {
    display: grid;
    justify-items: start;
    gap: var(--ggb-space-content-md);
  }
  .constrained {
    display: flex;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-control);
  }
  .menu {
    list-style: none;
    margin: 0;
    padding: var(--ggb-space-content-xs);
    inline-size: 16rem;
    background: var(--ggb-color-surface-raised);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .menu-item {
    display: flex;
    inline-size: 100%;
    align-items: center;
    justify-content: space-between;
    gap: var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-sm) var(--ggb-space-content-md);
    border: 0;
    border-radius: var(--ggb-radius-control);
    background: transparent;
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
    text-align: start;
    cursor: pointer;
  }
  .menu-item:hover {
    background: var(--ggb-color-action-neutral-ghost-hover-surface);
  }
  .menu-item:disabled {
    color: var(--ggb-color-content-disabled);
    cursor: not-allowed;
  }
  .menu-item :global(.ggb-shortcut) {
    color: var(--ggb-color-content-tertiary);
  }
  .menu-item:disabled :global(.ggb-shortcut) {
    color: inherit;
  }
  .tooltip {
    display: inline-block;
    margin: 0 0 var(--ggb-space-content-md);
    padding: var(--ggb-space-content-sm) var(--ggb-space-content-md);
    border-radius: var(--ggb-radius-control);
    background: var(--ggb-color-surface-overlay, var(--ggb-color-surface-raised));
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    font: var(--ggb-typography-body-sm);
  }
  .help,
  .baseline {
    color: var(--ggb-color-content-primary);
    line-height: 2;
  }
  .lg-text {
    font: var(--ggb-typography-body-lg);
  }
  @media (max-width: 720px) {
    .page {
      padding: var(--ggb-space-layout-md) var(--ggb-space-layout-sm);
    }
    .playground {
      grid-template-columns: minmax(0, 1fr);
    }
    .matrix {
      grid-template-columns: max-content repeat(4, max-content);
      overflow-x: auto;
    }
    .matrix.buttons {
      grid-template-columns: max-content repeat(3, max-content);
    }
    .combos {
      display: block;
      overflow-x: auto;
    }
  }
</style>
