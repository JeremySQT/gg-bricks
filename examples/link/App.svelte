<script lang="ts">
  // Link implementation review: a playground with every option, every destination, every file format, links in
  // prose at several text sizes, wrapping in a narrow column, tone inherit on colored surfaces and translated
  // suffixes, in any brand, appearance and density.
  import { Link } from '../../packages/svelte/src/index.ts';
  import type { LinkDestination, LinkTone } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  const tones: LinkTone[] = ['accent', 'inherit'];
  const destinations: LinkDestination[] = ['page', 'external', 'email', 'phone', 'file', 'print'];
  const samples: Record<LinkDestination, { label: string; href: string; fileType?: string; fileSize?: string }> = {
    page: { label: 'Billing settings', href: '#destinations' },
    external: { label: 'Svelte documentation', href: 'https://svelte.dev/docs' },
    email: { label: 'support@example.com', href: 'mailto:support@example.com' },
    phone: { label: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
    file: { label: 'Annual report', href: '#destinations', fileType: 'pdf', fileSize: '2.4 MB' },
    print: { label: 'Printable invoice', href: '#destinations' }
  };
  const files = [
    ['pdf', 'Contract'],
    ['docx', 'Proposal'],
    ['xlsx', 'Budget'],
    ['csv', 'Export'],
    ['pptx', 'Slides'],
    ['txt', 'Notes'],
    ['zip', 'Assets'],
    ['png', 'Screenshot'],
    ['mp3', 'Recording'],
    ['mp4', 'Demo'],
    ['epub', 'Handbook'],
    ['', 'Attachment']
  ];

  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  // Playground
  let label = $state('Annual report');
  let href = $state('#playground');
  let tone = $state<LinkTone>('accent');
  let destination = $state<LinkDestination>('file');
  let fileType = $state('pdf');
  let fileSize = $state('2.4 MB');
  let destinationLabel = $state('');
  let playground = $state<HTMLAnchorElement | null>(null);
  // Readout of the accessible text, observed on the DOM so that it is what the component really renders.
  let spoken = $state('');
  $effect(() => {
    const element = playground;
    if (!element) return;
    const read = () => (spoken = (element.textContent ?? '').replace(/\s+/g, ' ').trim());
    const observer = new MutationObserver(read);
    observer.observe(element, { subtree: true, childList: true, characterData: true });
    read();
    return () => observer.disconnect();
  });
  let narrow = $state(14);
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Link</h1>
    <p class="lede">
      Navigation from inside text: an underlined word or phrase that reads with its sentence and says, before the click,
      what it leads to: another page, another site, an email address, a phone number, a file and its format, or a
      printable version. Every link below is the real Svelte component on the approved tokens.
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
        <p class="text prose">
          Download the <Link
            id="play"
            bind:ref={playground}
            label={label.trim() || 'Link'}
            href={href.trim() || '#playground'}
            {tone}
            {destination}
            fileType={fileType || undefined}
            fileSize={fileSize || undefined}
            destinationLabel={destinationLabel || undefined}
          /> before Friday.
        </p>
        <p class="readout" aria-live="polite"><span data-testid="spoken">Accessible text: {spoken}</span></p>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label>Label <input id="opt-label" type="text" bind:value={label} /></label>
        <label>Href <input id="opt-href" type="text" bind:value={href} /></label>
        <label
          >Tone <select id="opt-tone" bind:value={tone}
            >{#each tones as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Destination <select id="opt-destination" bind:value={destination}
            >{#each destinations as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label>File type <input id="opt-filetype" type="text" bind:value={fileType} /></label>
        <label>File size <input id="opt-filesize" type="text" bind:value={fileSize} /></label>
        <label>Suffix <input id="opt-suffix" type="text" placeholder="default" bind:value={destinationLabel} /></label>
      </fieldset>
    </div>
  </section>

  <section id="destinations" aria-labelledby="destinations-title">
    <h2 id="destinations-title">Destinations</h2>
    <p>The glyph after the label says what the link leads to; screen readers hear the same thing as a suffix.</p>
    <div class="matrix destinations">
      <span class="col-head">destination</span>
      <span class="col-head">accent</span>
      <span class="col-head">announced</span>
      {#each destinations as d (d)}
        {@const s = samples[d]}
        <span class="row-head">{d}</span>
        <span class="body"
          ><Link
            id={`dest-${d}`}
            data-testid="destination"
            destination={d}
            label={s.label}
            href={s.href}
            fileType={s.fileType}
            fileSize={s.fileSize}
          /></span
        >
        <span class="hint"
          >{d === 'page' || d === 'file'
            ? '—'
            : `(${{ external: 'opens in a new tab', email: 'email', phone: 'phone', print: 'printable version' }[d]})`}</span
        >
      {/each}
    </div>
  </section>

  <section id="files" aria-labelledby="files-title">
    <h2 id="files-title">File formats</h2>
    <p>
      The format is shown in words as well as by the glyph: the letters drawn inside the glyphs are too small to read.
    </p>
    <ul class="files">
      {#each files as [type, name] (name)}
        <li>
          <Link
            id={`file-${type || 'none'}`}
            data-testid="file"
            destination="file"
            label={name}
            href="#files"
            fileType={type || undefined}
            fileSize={type === 'zip' ? '48 MB' : type ? '320 kB' : undefined}
          />
        </li>
      {/each}
    </ul>
  </section>

  <section id="prose" aria-labelledby="prose-title">
    <h2 id="prose-title">In text</h2>
    <p>The link takes the font of its sentence. Hover thickens the underline; the color never changes.</p>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">Text sizes</p>
        <p class="text body-lg">
          Body large: read the <Link id="prose-lg" label="migration guide" href="#prose" /> first.
        </p>
        <p class="text body-md">
          Body medium: see <Link
            id="prose-md"
            label="the changelog"
            href="https://example.com"
            destination="external"
          />.
        </p>
        <p class="text body-sm">
          Body small: <Link
            id="prose-sm"
            label="Terms of use"
            href="#prose"
            destination="file"
            fileType="pdf"
            fileSize="180 kB"
          />.
        </p>
        <p class="text caption">Caption: <Link id="prose-caption" label="Privacy" href="#prose" /></p>
        <h3 class="heading">Heading: <Link id="prose-heading" label="Billing" href="#prose" /></h3>
      </div>
      <div class="panel">
        <p class="panel-title">Narrow column: the glyph never starts a line</p>
        <label class="width"
          >Width <input id="narrow" type="range" min="8" max="30" bind:value={narrow} /> {narrow} em</label
        >
        <p class="text column" style:inline-size={`${narrow}em`} data-testid="column">
          Before signing, download the <Link
            id="wrap-file"
            label="supplier framework agreement"
            href="#prose"
            destination="file"
            fileType="docx"
            fileSize="1.1 MB"
          /> and the <Link
            id="wrap-external"
            label="regulatory notice on the official portal"
            href="https://example.com"
            destination="external"
          />, then write to <Link
            id="wrap-email"
            label="legal@example.com"
            href="mailto:legal@example.com"
            destination="email"
          />.
        </p>
      </div>
      <div class="panel">
        <p class="panel-title">Standalone</p>
        <div class="stack">
          <Link id="standalone-page" label="See all invoices" href="#prose" />
          <Link id="standalone-print" label="Print this page" href="#prose" destination="print" />
          <Link id="standalone-phone" label="Call support" href="tel:+33123456789" destination="phone" />
        </div>
      </div>
    </div>
  </section>

  <section id="tones" aria-labelledby="tones-title">
    <h2 id="tones-title">Tone inherit on colored surfaces</h2>
    <p>Where the link color would not reach the contrast, tone inherit takes the text color; the underline remains.</p>
    <div class="grid">
      {#each ['info', 'success', 'warning', 'danger'] as s (s)}
        <div
          class="message"
          style:background={`var(--ggb-color-status-${s}-surface)`}
          style:color={`var(--ggb-color-status-${s}-content)`}
          style:border-color={`var(--ggb-color-status-${s}-border)`}
        >
          Status message. <Link id={`inherit-${s}`} tone="inherit" label="View details" href="#tones" />
        </div>
      {/each}
      <div class="message inverse">
        Inverse surface. <Link id="inherit-inverse" tone="inherit" label="Undo" href="#tones" />
      </div>
      <div class="message" style:background="var(--ggb-color-surface-muted)">
        Muted surface, accent tone. <Link id="accent-muted" label="Open settings" href="#tones" />
      </div>
    </div>
  </section>

  <section id="translation" aria-labelledby="translation-title">
    <h2 id="translation-title">Translated suffixes</h2>
    <p lang="fr" class="text">
      Consultez la <Link
        id="fr-external"
        label="documentation"
        href="https://example.com"
        destination="external"
        destinationLabel="s'ouvre dans un nouvel onglet"
      /> ou écrivez à <Link
        id="fr-email"
        label="support"
        href="mailto:support@example.com"
        destination="email"
        destinationLabel="adresse e-mail"
      />.
    </p>
  </section>
</div>

<style>
  .prose {
    font: var(--ggb-typography-body-lg);
    text-align: center;
  }
  .destinations {
    grid-template-columns: max-content max-content max-content;
  }
  .body {
    font: var(--ggb-typography-body-md);
  }
  .hint {
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-tertiary);
  }
  .files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--ggb-space-content-md) var(--ggb-space-layout-sm);
    padding: var(--ggb-space-content-lg);
    margin: 0;
    list-style: none;
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .body-lg {
    font: var(--ggb-typography-body-lg);
  }
  .body-md {
    font: var(--ggb-typography-body-md);
  }
  .body-sm {
    font: var(--ggb-typography-body-sm);
  }
  .caption {
    font: var(--ggb-typography-caption-md);
  }
  .heading {
    font: var(--ggb-typography-heading-md);
    margin: 0;
  }
  .width {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    font: var(--ggb-typography-label-sm);
    margin-block-end: var(--ggb-space-content-md);
  }
  .column {
    max-inline-size: 100%;
    padding: var(--ggb-space-content-sm);
    border: var(--ggb-border-width-default) dashed var(--ggb-color-border-default);
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ggb-space-content-sm);
  }
  .message {
    padding: var(--ggb-space-content-md) var(--ggb-space-content-lg);
    border: var(--ggb-border-width-default) solid transparent;
    border-radius: var(--ggb-radius-container);
  }
  .inverse {
    background: var(--ggb-color-surface-inverse);
    color: var(--ggb-color-content-inverse);
  }
</style>
