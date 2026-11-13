<script lang="ts">
  // Avatar implementation review: a playground with every option, the five sizes in both shapes with a picture,
  // initials and the generic glyph, how initials are derived (accents, scripts without case, punctuation, emoji), the
  // picture states (loaded, failed, cropped), and avatars in context (a list of people, a comment, an account button,
  // a table cell), in any brand, appearance and density.
  import { Avatar } from '../../packages/svelte/src/index.ts';
  import type { AvatarShape, AvatarSize } from '../../packages/svelte/src/index.ts';
  import { people, portraits } from './portraits.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const shapes: AvatarShape[] = ['circle', 'square'];
  const pixels: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let showBoxes = $state(false);

  // Playground
  const sources: Record<string, string | undefined> = {
    none: undefined,
    portrait: portraits.olivia,
    organization: portraits.acme,
    landscape: portraits.landscape,
    broken: 'data:image/png;base64,bm90IGFuIGltYWdl'
  };
  // Tests pass a picture URL in the query (?src=…) to hold its request and observe the loading state.
  const given = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('src') : null;
  if (given) sources.given = given;
  let name = $state('Olivia Rhye');
  let initials = $state('');
  let source = $state(given ? 'given' : 'portrait');
  let size = $state<AvatarSize>('xl');
  let shape = $state<AvatarShape>('circle');
  let decorative = $state(false);

  const names = [
    ['Olivia Rhye', 'first and last word'],
    ['Jean-Pierre de La Fontaine', 'first and last word, hyphen kept whole'],
    ['Cher', 'one word: one initial'],
    ['élise durand', 'lowercase and accents: uppercased'],
    ['Ольга Петрова', 'Cyrillic'],
    ['李小龙', 'a script without case: one grapheme'],
    ['(Ann) Lee', 'leading punctuation skipped'],
    ['🎉 Party Team', 'emoji word skipped'],
    ['!!!', 'no letter: generic glyph'],
    ['', 'no name: generic glyph, hidden']
  ];
</script>

<div
  class="page"
  class:show-boxes={showBoxes}
  data-ggb-brand={brand}
  data-ggb-appearance={mode}
  data-ggb-density={density}
>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Avatar</h1>
    <p class="lede">
      A person (circle) or an organization, a team or a project (square), shown by a picture, initials or a generic
      glyph in a box of fixed size. The picture appears only once loaded; until then, or when it fails, the fallback
      stays. Not interactive. Every avatar below is the real Svelte component on the approved tokens.
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
      <label class="check"><input id="ctx-boxes" type="checkbox" bind:checked={showBoxes} /> Show boxes</label>
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground">
      <div class="stage">
        <Avatar
          id="play"
          name={name || undefined}
          initials={initials || undefined}
          src={sources[source]}
          {size}
          {shape}
          {decorative}
        />
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Name <input id="opt-name" type="text" bind:value={name} /></label>
        <label>Initials <input id="opt-initials" type="text" bind:value={initials} placeholder="computed" /></label>
        <label
          >Picture <select id="opt-src" bind:value={source}
            >{#each Object.keys(sources) as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each sizes as v (v)}<option value={v}>{v} ({pixels[v]} px)</option>{/each}</select
          ></label
        >
        <label
          >Shape <select id="opt-shape" bind:value={shape}
            >{#each shapes as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label class="check"><input id="opt-decorative" type="checkbox" bind:checked={decorative} /> Decorative</label>
      </fieldset>
    </div>
  </section>

  <section id="matrix" aria-labelledby="matrix-title">
    <h2 id="matrix-title">Sizes, shapes and fallbacks</h2>
    <p>
      24, 32, 40, 48 and 64 px. Initials are about 0.4 of the box; xs shows one. Square corners follow the size.
      Default: md circle.
    </p>
    {#each shapes as sh (sh)}
      <h3>{sh}</h3>
      <div class="matrix avatars">
        <span></span>
        {#each sizes as s (s)}<span class="col-head">{s} · {pixels[s]}</span>{/each}
        <span class="row-head">picture</span>
        {#each sizes as s (s)}
          <div>
            <Avatar
              id={`m-picture-${sh}-${s}`}
              data-testid="matrix"
              name={sh === 'circle' ? 'Phoenix Baker' : 'Acme Inc'}
              src={sh === 'circle' ? portraits.phoenix : portraits.acme}
              size={s}
              shape={sh}
            />
          </div>
        {/each}
        <span class="row-head">initials</span>
        {#each sizes as s (s)}
          <div>
            <Avatar
              id={`m-initials-${sh}-${s}`}
              data-testid="matrix"
              name={sh === 'circle' ? 'Demi Wilkinson' : 'Northwind Traders'}
              size={s}
              shape={sh}
            />
          </div>
        {/each}
        <span class="row-head">wide letters</span>
        {#each sizes as s (s)}
          <div><Avatar id={`m-wide-${sh}-${s}`} name="Walter Mendoza" size={s} shape={sh} /></div>
        {/each}
        <span class="row-head">glyph</span>
        {#each sizes as s (s)}
          <div><Avatar id={`m-glyph-${sh}-${s}`} data-testid="matrix" size={s} shape={sh} /></div>
        {/each}
      </div>
    {/each}
  </section>

  <section id="initials" aria-labelledby="initials-title">
    <h2 id="initials-title">Initials</h2>
    <p>
      The first grapheme of the first and last words, uppercased. The initials prop replaces them (an abbreviation, at
      most three characters).
    </p>
    <div class="panel">
      <ul class="cases">
        {#each names as [n, note], i (i)}
          <li>
            <Avatar id={`initials-${i}`} name={n || undefined} size="lg" />
            <span class="case-name">{n || '(no name)'}</span>
            <span class="case-note">{note}</span>
          </li>
        {/each}
        <li>
          <Avatar id="initials-given" name="Acme Corporation" initials="ACM" shape="square" size="lg" />
          <span class="case-name">Acme Corporation, initials ACM</span>
          <span class="case-note">initials prop</span>
        </li>
      </ul>
    </div>
  </section>

  <section id="states" aria-labelledby="states-title">
    <h2 id="states-title">Picture states</h2>
    <p>A picture that fails keeps the initials (or the glyph); a wide picture is cropped to fill the box, centered.</p>
    <div class="row panel">
      <figure>
        <Avatar id="state-loaded" name="Olivia Rhye" src={portraits.olivia} size="xl" />
        <figcaption>loaded</figcaption>
      </figure>
      <figure>
        <Avatar id="state-error" name="Olivia Rhye" src="data:image/png;base64,bm90IGFuIGltYWdl" size="xl" />
        <figcaption>failed: initials</figcaption>
      </figure>
      <figure>
        <Avatar id="state-error-glyph" src="data:image/png;base64,bm90IGFuIGltYWdl" size="xl" />
        <figcaption>failed, no name: glyph</figcaption>
      </figure>
      <figure>
        <Avatar id="state-landscape" name="Mountain view" src={portraits.landscape} size="xl" />
        <figcaption>wide picture, cropped</figcaption>
      </figure>
      <figure>
        <Avatar id="state-landscape-square" name="Mountain view" src={portraits.landscape} size="xl" shape="square" />
        <figcaption>square, cropped</figcaption>
      </figure>
    </div>
  </section>

  <section id="contexts" aria-labelledby="contexts-title">
    <h2 id="contexts-title">In context</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">A list of people (decorative avatars)</p>
        <ul class="people">
          {#each people.slice(0, 5) as p (p.name)}
            <li>
              <Avatar name={p.name} src={p.src} size="md" decorative />
              <span class="person"
                ><span class="person-name">{p.name}</span><span class="person-mail">{p.email}</span></span
              >
            </li>
          {/each}
        </ul>
      </div>
      <div class="panel">
        <p class="panel-title">A comment</p>
        <article class="comment">
          <Avatar name="Candice Wu" src={portraits.candice} size="sm" decorative />
          <div>
            <p class="comment-meta"><strong>Candice Wu</strong> · 2 hours ago</p>
            <p class="text">Looks good to me. Can we ship the export on Friday?</p>
          </div>
        </article>
      </div>
      <div class="panel">
        <p class="panel-title">Account button (the integration wraps the avatar)</p>
        <div class="row">
          <button id="account" class="account" type="button" aria-label="Account: Drew Cano">
            <Avatar name="Drew Cano" src={portraits.drew} size="sm" decorative />
          </button>
          <span class="text">The button carries the name; the avatar inside is decorative.</span>
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Beside text of every size</p>
        {#each sizes as s (s)}
          <div class="row line"><Avatar name="Natali Craig" size={s} /><span class={`t-${s}`}>Natali Craig</span></div>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .avatars {
    grid-template-columns: max-content repeat(5, max-content);
  }
  .cases {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--ggb-space-content-lg);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cases li {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: var(--ggb-space-content-md);
    align-items: center;
  }
  .cases :global(.ggb-avatar) {
    grid-row: span 2;
  }
  .case-name {
    font: var(--ggb-typography-label-md);
  }
  .case-note {
    font: var(--ggb-typography-caption-md);
    color: var(--ggb-color-content-secondary);
  }
  figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    margin: 0;
  }
  figcaption {
    font: var(--ggb-typography-caption-md);
    color: var(--ggb-color-content-secondary);
  }
  .people {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-content-md);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .people li,
  .comment {
    display: flex;
    gap: var(--ggb-space-content-md);
    align-items: center;
  }
  .comment {
    align-items: flex-start;
  }
  .person {
    display: flex;
    flex-direction: column;
  }
  .person-name {
    font: var(--ggb-typography-label-md);
  }
  .person-mail,
  .comment-meta {
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-secondary);
  }
  .page .comment-meta {
    margin: 0;
  }
  .account {
    display: inline-flex;
    padding: 0;
    border: 0;
    border-radius: var(--ggb-radius-full);
    background: none;
    cursor: pointer;
  }
  .account:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  .line {
    margin-block-end: var(--ggb-space-content-sm);
  }
  .t-xs {
    font: var(--ggb-typography-body-sm);
  }
  .t-sm,
  .t-md {
    font: var(--ggb-typography-body-md);
  }
  .t-lg {
    font: var(--ggb-typography-body-lg);
  }
  .t-xl {
    font: var(--ggb-typography-heading-md);
  }
  .show-boxes :global(.ggb-avatar) {
    outline: 1px dashed var(--ggb-color-status-danger-border);
    outline-offset: 0;
  }
</style>
