<script lang="ts">
  // Foundations review page: every ramp, the semantic roles in light and dark, the type scale,
  // spacing and control sizes per density, elevation, motion, layers and the brand switch.
  // Values come from the generated resolved maps and the contrast report, rendering uses tokens.css.
  type Dimension = { value: number; unit: string };
  type Color = { components: [number, number, number]; alpha?: number };
  type Token = { $type: string; $value: unknown };
  type TokenMap = Record<string, Token>;
  interface ContrastRecord {
    context: string;
    content: string;
    surface: string;
    ratio: number;
    minimum: number;
    passed: boolean;
  }
  interface ContrastReport {
    checks: number;
    pairs: number;
    failures: ContrastRecord[];
    results: ContrastRecord[];
  }

  const resolved = import.meta.glob('../../packages/tokens/resolved/*.json', { eager: true, import: 'default' });
  const maps: Record<string, TokenMap> = Object.fromEntries(
    Object.entries(resolved).map(([file, map]) => [file.split('/').pop()!.replace('.json', ''), map as TokenMap])
  );
  const report = Object.values(
    import.meta.glob('../../reports/tokens/contrast.json', { eager: true, import: 'default' })
  )[0] as ContrastReport;

  const brands = ['base', 'brick', 'orchid'];
  const appearances = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let appearance = $state('light');
  let density = $state('standard');
  let showAllContrast = $state(false);
  const contextId = $derived(`${brand}-${appearance}-${density}`);
  const tokens = $derived(maps[contextId]);

  const hex = (t: Token | undefined): string => {
    if (!t) return '';
    const c = t.$value as Color;
    const h = c.components
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('');
    const a = c.alpha ?? 1;
    return (
      '#' +
      h +
      (a < 1
        ? Math.round(a * 255)
            .toString(16)
            .padStart(2, '0')
        : '')
    );
  };
  const px = (t: Token | undefined): number => (t ? (t.$value as Dimension).value : 0);
  const luminance = (c: Color): number => {
    const d = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * d(c.components[0]) + 0.7152 * d(c.components[1]) + 0.0722 * d(c.components[2]);
  };
  const onLight = (t: Token): boolean => luminance(t.$value as Color) > 0.4;
  const keys = (prefix: string, map: TokenMap = tokens): string[] =>
    Object.keys(map).filter((k) => k.startsWith(prefix));
  const last = (k: string) => k.split('.').pop() ?? k;
  const describe = (t: Token): string => {
    const v = t.$value as Record<string, unknown>;
    switch (t.$type) {
      case 'color':
        return hex(t);
      case 'dimension':
      case 'duration':
        return `${(v as unknown as Dimension).value}${(v as unknown as Dimension).unit}`;
      case 'typography':
        return `${(v.fontFamily as string[])[0]} ${v.fontWeight} · ${(v.fontSize as Dimension).value}px / ${v.lineHeight} · ${(v.letterSpacing as Dimension).value}px`;
      case 'shadow':
        return (v as unknown as Record<string, Dimension | Color>[])
          .map(
            (s) =>
              `${(s.offsetX as Dimension).value} ${(s.offsetY as Dimension).value} ${(s.blur as Dimension).value} ${(s.spread as Dimension).value} α${(s.color as Color).alpha}`
          )
          .join(' + ');
      case 'cubicBezier':
        return `cubic-bezier(${(v as unknown as number[]).join(', ')})`;
      case 'fontFamily':
        return (v as unknown as string[]).join(', ');
      default:
        return String(v);
    }
  };

  const rampNames = $derived(
    Array.from(new Set(keys('primitive.color.').map((k) => k.split('.')[2]))).filter(
      (n) => n !== 'transparent' && n !== 'alpha'
    )
  );
  const ramp = (name: string) => keys(`primitive.color.${name}.`);
  const paletteRoles = $derived(Array.from(new Set(keys('color.palette.').map((k) => k.split('.')[2]))));
  const contrastOf = (a: string, b: string): string => {
    const la = luminance(tokens[a].$value as Color),
      lb = luminance(tokens[b].$value as Color);
    return ((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(2);
  };

  const surfaces = ['canvas', 'default', 'subtle', 'muted', 'raised', 'overlay', 'inverse'];
  const contents = ['primary', 'secondary', 'tertiary', 'disabled', 'link'];
  const intents = ['accent', 'neutral', 'danger'];
  const actionAppearances = ['solid', 'outline', 'ghost'];
  const states = ['default', 'hover', 'pressed', 'loading', 'disabled'];
  const fieldStates = ['default', 'hover', 'focus', 'readonly', 'disabled', 'invalid'];
  const statuses = ['info', 'success', 'warning', 'danger'];
  const typeRoles = $derived(keys('typography.'));
  const sample = 'The quick brown fox jumps over the lazy dog';

  // Brand overlays: which resolved values differ from base in the same appearance and density.
  const overrides = (b: string): { path: string; base: string; brand: string }[] => {
    if (b === 'base') return [];
    const a = maps[`base-${appearance}-${density}`],
      c = maps[`${b}-${appearance}-${density}`];
    return Object.keys(c)
      .filter((k) => JSON.stringify(a[k]?.$value) !== JSON.stringify(c[k].$value))
      .map((k) => ({ path: k, base: describe(a[k]), brand: describe(c[k]) }));
  };
  const contrastRows = $derived(report.results.filter((r) => r.context === contextId));
  const contrastFailures = $derived(contrastRows.filter((r) => !r.passed).length);
  const minRatio = $derived(Math.min(...contrastRows.map((r) => r.ratio / r.minimum)));
</script>

<div class="page" data-ggb-brand={brand} data-ggb-appearance={appearance} data-ggb-density={density}>
  <header class="hero">
    <p class="eyebrow">ggbrick · foundations review</p>
    <h1>Foundations</h1>
    <p class="lede">
      Proposed primitives and semantic roles. Switch brand, appearance and density: every section below reads the
      generated <code>tokens.css</code> and the resolved maps for the selected context.
    </p>
    <div class="controls" role="group" aria-label="Context">
      <label
        >Brand <select bind:value={brand}
          >{#each brands as b (b)}<option value={b}>{b}</option>{/each}</select
        ></label
      >
      <label>
        Appearance <select bind:value={appearance}
          >{#each appearances as a (a)}<option value={a}>{a}</option>{/each}</select
        >
      </label>
      <label
        >Density <select bind:value={density}
          >{#each densities as d (d)}<option value={d}>{d}</option>{/each}</select
        ></label
      >
      <span class="context">{contextId} · {Object.keys(tokens).length} tokens</span>
    </div>
  </header>

  <nav class="toc" aria-label="Sections">
    {#each ['palette', 'surfaces', 'actions', 'fields', 'status', 'choices', 'typography', 'density', 'shape', 'elevation', 'motion', 'contrast', 'brands'] as id (id)}
      <a href={'#' + id}>{id}</a>
    {/each}
  </nav>

  <section id="palette">
    <h2>Palette</h2>
    <p>
      Three layers. <strong>Primitives</strong> (<code>primitive.color.*</code>, below): the generous raw material,
      neutral (13 steps) and ten hue ramps (11 steps) generated in OKLCH with one lightness per step index, so that one
      index has comparable contrast on every hue (step 600 passes 4.5:1 with white, step 500 passes 3:1 as a border).
      Most steps are unused today; that is expected. <strong>Semantic</strong> (<code>color.palette.*</code> then
      <code>color.surface.*</code>, <code>color.action.*</code>…): the six ramps a brand actually uses, each an alias to
      a primitive ramp, and the roles that pick from them. <strong>Component</strong> tokens come later, only when justified.
    </p>
    <h3>Primitive ramps</h3>
    {#each rampNames as name (name)}
      <div class="ramp">
        <span class="ramp-name"><small>primitive.color.</small>{name}</span>
        <div class="swatches">
          {#each ramp(name) as k (k)}
            <div
              class="swatch"
              style:background={hex(tokens[k])}
              class:on-light={onLight(tokens[k])}
              title={`${k} ${hex(tokens[k])}`}
            >
              <span>{last(k)}</span><small>{hex(tokens[k])}</small>
            </div>
          {/each}
        </div>
      </div>
    {/each}
    <div class="ramp">
      <span class="ramp-name"><small>primitive.color.</small>alpha</span>
      <div class="swatches checker">
        {#each keys('primitive.color.alpha.') as k (k)}
          <div class="swatch" style:background={hex(tokens[k])} class:on-light={k.includes('white')} title={k}>
            <span>{k.includes('black') ? 'b' : 'w'}{last(k)}</span>
          </div>
        {/each}
      </div>
    </div>
    <h3>Semantic palette of {brand}: <code>color.palette.*</code></h3>
    <p>
      The only ramps the roles reference. Each one aliases a primitive ramp (base: neutral, blue, blue, green, amber,
      red). A brand overrides one of them with 11 aliases: brick and orchid override <code>accent</code>.
    </p>
    {#each paletteRoles as name (name)}
      <div class="ramp">
        <span class="ramp-name"><small>color.palette.</small>{name}</span>
        <div class="swatches">
          {#each keys(`color.palette.${name}.`) as k (k)}
            <div class="swatch" style:background={hex(tokens[k])} class:on-light={onLight(tokens[k])} title={k}>
              <span>{last(k)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  <section id="surfaces">
    <h2>Surfaces, content and borders</h2>
    <p>Both appearances side by side, whatever the selection above.</p>
    <div class="pair">
      {#each appearances as a (a)}
        <div class="panel" data-ggb-appearance={a}>
          <p class="panel-title">{a}</p>
          <div class="surface-grid">
            {#each surfaces as s (s)}
              <div class="surface-card" style:background={`var(--ggb-color-surface-${s})`}>
                <strong class={s === 'inverse' ? 'inverse' : ''}>surface.{s}</strong>
                <span class={s === 'inverse' ? 'inverse' : ''}
                  >{hex(maps[`${brand}-${a}-${density}`][`color.surface.${s}`])}</span
                >
                {#if s !== 'inverse'}
                  {#each contents as c (c)}
                    <span style:color={`var(--ggb-color-content-${c})`}>content.{c}</span>
                  {/each}
                  <span class="border-sample" style:border-color="var(--ggb-color-border-default)">border.default</span>
                  <span class="border-sample" style:border-color="var(--ggb-color-border-strong)">border.strong</span>
                  <span class="border-sample" style:border-color="var(--ggb-color-focus-ring)">focus.ring</span>
                {/if}
              </div>
            {/each}
            <div class="surface-card selection" style:background="var(--ggb-color-selection-surface)">
              <strong style:color="var(--ggb-color-selection-content)">selection</strong>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="actions">
    <h2>Actions</h2>
    <p>
      <code>color.action.{'{intent}'}.{'{appearance}'}.{'{state}'}.{'{surface|content|border}'}</code>, rendered as
      static chips (no component yet). Loading aliases default; disabled is informational for contrast.
    </p>
    <div class="pair">
      {#each appearances as a (a)}
        <div class="panel" data-ggb-appearance={a}>
          <p class="panel-title">{a}</p>
          <table class="matrix">
            <thead
              ><tr
                ><th></th>{#each states as st (st)}<th>{st}</th>{/each}</tr
              ></thead
            >
            <tbody>
              {#each intents as i (i)}
                {#each actionAppearances as ap (ap)}
                  <tr>
                    <th>{i} · {ap}</th>
                    {#each states as st (st)}
                      <td>
                        <span
                          class="chip"
                          style:background={`var(--ggb-color-action-${i}-${ap}-${st}-surface)`}
                          style:color={`var(--ggb-color-action-${i}-${ap}-${st}-content)`}
                          style:border-color={`var(--ggb-color-action-${i}-${ap}-${st}-border)`}>Button</span
                        >
                      </td>
                    {/each}
                  </tr>
                {/each}
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    </div>
  </section>

  <section id="fields">
    <h2>Fields</h2>
    <div class="pair">
      {#each appearances as a (a)}
        <div class="panel" data-ggb-appearance={a}>
          <p class="panel-title">{a}</p>
          <div class="fields">
            {#each fieldStates as st (st)}
              <div
                class="field"
                class:focus={st === 'focus'}
                style:background={`var(--ggb-color-field-${st}-surface)`}
                style:color={`var(--ggb-color-field-${st}-content)`}
                style:border-color={`var(--ggb-color-field-${st}-border)`}
              >
                <span>{st}</span>
                <span style:color={`var(--ggb-color-field-${st}-placeholder)`}>placeholder</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="status">
    <h2>Status</h2>
    <div class="pair">
      {#each appearances as a (a)}
        <div class="panel" data-ggb-appearance={a}>
          <p class="panel-title">{a}</p>
          <div class="statuses">
            {#each statuses as s (s)}
              <div
                class="alert"
                style:background={`var(--ggb-color-status-${s}-surface)`}
                style:color={`var(--ggb-color-status-${s}-content)`}
                style:border-color={`var(--ggb-color-status-${s}-border)`}
              >
                <span class="dot" style:background={`var(--ggb-color-status-${s}-icon)`}></span>
                <span>{s} · content on surface</span>
                <span
                  class="strong"
                  style:background={`var(--ggb-color-status-${s}-surfaceStrong)`}
                  style:color={`var(--ggb-color-status-${s}-contentStrong)`}>strong</span
                >
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="choices">
    <h2>Choices to compare</h2>
    <p>Open questions rendered side by side; the current proposal is marked.</p>
    <h3>Warning strong surface</h3>
    <div class="pair">
      {#each appearances as a (a)}
        <div class="panel" data-ggb-appearance={a}>
          <p class="panel-title">{a}</p>
          <div class="statuses">
            <div
              class="alert"
              style:background="var(--ggb-color-status-warning-surface)"
              style:color="var(--ggb-color-status-warning-content)"
              style:border-color="var(--ggb-color-status-warning-border)"
            >
              <span class="dot" style:background="var(--ggb-color-status-warning-icon)"></span>
              <span
                >A (proposed) · amber 600 + white · {contrastOf(
                  'primitive.color.amber.600',
                  'primitive.color.neutral.0'
                )}:1</span
              >
              <span
                class="strong"
                style:background="var(--ggb-primitive-color-amber-600)"
                style:color="var(--ggb-primitive-color-neutral-0)">3 warnings</span
              >
            </div>
            <div
              class="alert"
              style:background="var(--ggb-color-status-warning-surface)"
              style:color="var(--ggb-color-status-warning-content)"
              style:border-color="var(--ggb-color-status-warning-border)"
            >
              <span class="dot" style:background="var(--ggb-color-status-warning-icon)"></span>
              <span
                >B · amber 400 + neutral 950 · {contrastOf(
                  'primitive.color.amber.400',
                  'primitive.color.neutral.950'
                )}:1</span
              >
              <span
                class="strong"
                style:background="var(--ggb-primitive-color-amber-400)"
                style:color="var(--ggb-primitive-color-neutral-950)">3 warnings</span
              >
            </div>
            <div class="row wrap">
              <span
                class="chip"
                style:background="var(--ggb-primitive-color-amber-600)"
                style:color="var(--ggb-primitive-color-neutral-0)">A · Toast banner</span
              >
              <span
                class="chip"
                style:background="var(--ggb-primitive-color-amber-400)"
                style:color="var(--ggb-primitive-color-neutral-950)">B · Toast banner</span
              >
              <span
                class="chip"
                style:background="var(--ggb-primitive-color-green-600)"
                style:color="var(--ggb-primitive-color-neutral-0)">success, for scale</span
              >
              <span
                class="chip"
                style:background="var(--ggb-primitive-color-red-600)"
                style:color="var(--ggb-primitive-color-neutral-0)">danger, for scale</span
              >
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="typography">
    <h2>Typography</h2>
    <p>Composite roles: family, weight, size, line height and letter spacing. Sizes do not change with density.</p>
    <div class="type-scale">
      {#each typeRoles as k (k)}
        <div class="type-row">
          <div class="type-meta"><code>{k.replace('typography.', '')}</code><small>{describe(tokens[k])}</small></div>
          <p
            style:font={`var(--ggb-${k.replaceAll('.', '-')})`}
            style:letter-spacing={`var(--ggb-${k.replaceAll('.', '-')}-letterSpacing)`}
          >
            {k.includes('code') ? 'const ratio = contrast(a, b);' : sample}
          </p>
        </div>
      {/each}
    </div>
  </section>

  <section id="density">
    <h2>Density: control sizes and spacing</h2>
    <p>Each column forces its own <code>data-ggb-density</code>. Icons, text and the 44 px target do not shrink.</p>
    <div class="triple">
      {#each densities as d (d)}
        <div class="panel" data-ggb-density={d}>
          <p class="panel-title">{d}</p>
          {#each ['sm', 'md', 'lg'] as size (size)}
            <div class="control-row">
              <span
                class="control"
                style:height={`var(--ggb-size-control-${size})`}
                style:padding-inline={`var(--ggb-space-control-padding-inline-${size})`}
                style:gap={`var(--ggb-space-control-gap-${size})`}
              >
                <i style:width={`var(--ggb-size-icon-${size})`} style:height={`var(--ggb-size-icon-${size})`}
                ></i>control.{size}
              </span>
              <small
                >{px(maps[`${brand}-${appearance}-${d}`][`size.control.${size}`])} px · pad {px(
                  maps[`${brand}-${appearance}-${d}`][`space.control.padding-inline.${size}`]
                )}/{px(maps[`${brand}-${appearance}-${d}`][`space.control.padding-block.${size}`])} · gap {px(
                  maps[`${brand}-${appearance}-${d}`][`space.control.gap.${size}`]
                )}</small
              >
            </div>
          {/each}
          {#each ['content', 'layout'] as family (family)}
            <p class="sub">space.{family}</p>
            {#each keys(`space.${family}.`, maps[`${brand}-${appearance}-${d}`]) as k (k)}
              <div class="bar-row">
                <span class="bar" style:width={`var(--ggb-${k.replaceAll('.', '-')})`}></span><small
                  >{last(k)} · {px(maps[`${brand}-${appearance}-${d}`][k])} px</small
                >
              </div>
            {/each}
          {/each}
        </div>
      {/each}
    </div>
  </section>

  <section id="shape">
    <h2>Shape: radii, borders, icons and avatars</h2>
    <div class="row wrap">
      {#each keys('radius.') as k (k)}
        <div class="shape" style:border-radius={`var(--ggb-${k.replaceAll('.', '-')})`}>
          <span>{last(k)}<br /><small>{px(tokens[k])} px</small></span>
        </div>
      {/each}
    </div>
    <div class="row wrap">
      {#each keys('primitive.radius.') as k (k)}
        <div class="shape small" style:border-radius={`var(--ggb-${k.replaceAll('.', '-')})`}>
          <span>{last(k)}</span>
        </div>
      {/each}
    </div>
    <div class="row wrap">
      {#each keys('border.width.') as k (k)}
        <div class="shape small" style:border-width={`var(--ggb-${k.replaceAll('.', '-')})`}>
          <span>{last(k)}</span>
        </div>
      {/each}
      <div class="shape small focus"><span>focus</span></div>
    </div>
    <div class="row wrap">
      {#each keys('size.icon.') as k (k)}
        <span
          class="icon-box"
          style:width={`var(--ggb-${k.replaceAll('.', '-')})`}
          style:height={`var(--ggb-${k.replaceAll('.', '-')})`}
          title={k}
        ></span>
      {/each}
      {#each keys('size.avatar.') as k (k)}
        <span
          class="avatar"
          style:width={`var(--ggb-${k.replaceAll('.', '-')})`}
          style:height={`var(--ggb-${k.replaceAll('.', '-')})`}
          title={k}>{last(k)}</span
        >
      {/each}
    </div>
  </section>

  <section id="elevation">
    <h2>Elevation, layers and opacity</h2>
    <div class="row wrap">
      {#each keys('shadow.') as k (k)}
        <div class="card" style:box-shadow={`var(--ggb-${k.replaceAll('.', '-')})`}>
          <strong>{last(k)}</strong><small>{describe(tokens[k])}</small>
        </div>
      {/each}
    </div>
    <div class="row wrap">
      {#each keys('primitive.shadow.') as k (k)}
        <div class="card small" style:box-shadow={`var(--ggb-${k.replaceAll('.', '-')})`}>
          <strong>{last(k)}</strong>
        </div>
      {/each}
    </div>
    <div class="row wrap">
      {#each keys('layer.') as k (k)}<span class="tag">{last(k)} = {describe(tokens[k])}</span>{/each}
      {#each keys('opacity.') as k (k)}<span class="tag">opacity.{last(k)} = {describe(tokens[k])}</span>{/each}
    </div>
  </section>

  <section id="motion">
    <h2>Motion</h2>
    <p>Hover a box: it slides with its duration and easing. Durations do not depend on brand or appearance.</p>
    <div class="row wrap">
      {#each keys('motion.duration.') as d (d)}
        {#each keys('motion.easing.') as e (e)}
          <div
            class="motion"
            style:transition-duration={`var(--ggb-${d.replaceAll('.', '-')})`}
            style:transition-timing-function={`var(--ggb-${e.replaceAll('.', '-')})`}
          >
            <span></span><small>{last(d)} {describe(tokens[d])} · {last(e)}</small>
          </div>
        {/each}
      {/each}
    </div>
  </section>

  <section id="contrast">
    <h2>Contrast evidence</h2>
    <p>
      {report.pairs} declared pairs × {Object.keys(maps).length} contexts = {report.checks} checks, {report.failures
        .length}
      failures overall. In {contextId}: {contrastRows.length} checks, {contrastFailures} failures, tightest margin
      {(minRatio * 100).toFixed(0)}% of the minimum.
    </p>
    <label class="toggle"
      ><input type="checkbox" bind:checked={showAllContrast} /> Show every pair of this context</label
    >
    <table class="data">
      <thead><tr><th>Content</th><th>Surface</th><th>Ratio</th><th>Minimum</th><th></th></tr></thead>
      <tbody>
        {#each contrastRows.filter((r) => showAllContrast || !r.passed || r.ratio < r.minimum * 1.25) as r (r)}
          <tr class:fail={!r.passed}
            ><td>{r.content}</td><td>{r.surface}</td><td>{r.ratio.toFixed(2)}</td><td>{r.minimum}</td><td
              >{r.passed ? 'pass' : 'FAIL'}</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
    {#if !showAllContrast}<p class="note">Showing failures and pairs within 25% of their minimum.</p>{/if}
  </section>

  <section id="brands">
    <h2>Brands</h2>
    <p>
      Sparse overlays: what each brand changes versus base in {appearance}/{density}. Everything else is inherited.
    </p>
    {#each brands.filter((b) => b !== 'base') as b (b)}
      <h3>{b}</h3>
      <table class="data">
        <thead><tr><th>Token</th><th>base</th><th>{b}</th></tr></thead>
        <tbody>
          {#each overrides(b) as o (o)}<tr><td>{o.path}</td><td>{o.base}</td><td>{o.brand}</td></tr>{/each}
        </tbody>
      </table>
    {/each}
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
    max-width: 1280px;
    margin: 0 auto var(--ggb-space-layout-2xl);
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
  h3 {
    font: var(--ggb-typography-heading-sm);
    margin: var(--ggb-space-layout-md) 0 var(--ggb-space-content-sm);
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
  .sub {
    font: var(--ggb-typography-label-sm);
    letter-spacing: var(--ggb-typography-label-sm-letterSpacing);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  code {
    font: var(--ggb-typography-code-sm);
  }
  small {
    font: var(--ggb-typography-label-sm);
    color: var(--ggb-color-content-tertiary);
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-subtle);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .controls label {
    display: flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  select {
    font: inherit;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-md);
  }
  select:focus-visible,
  input:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  .context {
    margin-left: auto;
    font: var(--ggb-typography-code-sm);
    color: var(--ggb-color-content-tertiary);
  }
  .toc {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    max-width: 1280px;
    margin: 0 auto var(--ggb-space-layout-lg);
    font: var(--ggb-typography-label-md);
  }
  .toc a {
    color: var(--ggb-color-content-link);
  }
  .ramp {
    display: grid;
    grid-template-columns: 8rem 1fr;
    align-items: center;
    gap: var(--ggb-space-content-md);
    margin-bottom: var(--ggb-space-content-sm);
  }
  .ramp-name {
    font: var(--ggb-typography-label-md);
  }
  .ramp-name small {
    display: block;
    font-size: 10px;
  }
  .swatches {
    display: flex;
    gap: 2px;
  }
  .checker {
    background: repeating-conic-gradient(var(--ggb-color-surface-muted) 0 25%, var(--ggb-color-surface-default) 0 50%) 0
      0 / 12px 12px;
  }
  .swatch {
    flex: 1;
    min-height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 4px 6px;
    color: #fff;
    font: var(--ggb-typography-label-sm);
    border-radius: var(--ggb-primitive-radius-xs);
  }
  .swatch small {
    color: inherit;
    opacity: 0.8;
    font-size: 10px;
  }
  .swatch.on-light {
    color: #000;
  }
  .pair,
  .triple {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--ggb-space-layout-md);
  }
  .panel {
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-container);
  }
  .surface-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--ggb-space-content-sm);
  }
  .surface-card {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--ggb-space-content-md);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-label-sm);
    min-height: 150px;
  }
  .surface-card strong {
    font: var(--ggb-typography-label-md);
  }
  .surface-card .inverse {
    color: var(--ggb-color-content-inverse);
  }
  .border-sample {
    border-bottom: 2px solid;
    align-self: flex-start;
  }
  .matrix {
    width: 100%;
    border-collapse: collapse;
    font: var(--ggb-typography-label-sm);
  }
  .matrix th {
    text-align: left;
    padding: 4px;
    color: var(--ggb-color-content-tertiary);
    font-weight: 500;
  }
  .matrix td {
    padding: 4px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    height: var(--ggb-size-control-sm);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
    border: var(--ggb-border-width-default) solid transparent;
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-label-md);
    white-space: nowrap;
  }
  .fields {
    display: grid;
    gap: var(--ggb-space-content-sm);
  }
  .field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: var(--ggb-size-control-md);
    padding-inline: var(--ggb-space-control-padding-inline-md);
    border: var(--ggb-border-width-default) solid;
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-body-sm);
  }
  .field.focus {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  .statuses {
    display: grid;
    gap: var(--ggb-space-content-sm);
  }
  .alert {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    padding: var(--ggb-space-content-md);
    border: var(--ggb-border-width-default) solid;
    border-radius: var(--ggb-radius-container);
    font: var(--ggb-typography-body-sm);
  }
  .dot {
    width: var(--ggb-size-icon-sm);
    height: var(--ggb-size-icon-sm);
    border-radius: var(--ggb-radius-full);
  }
  .strong {
    margin-left: auto;
    padding: 2px 8px;
    border-radius: var(--ggb-radius-full);
    font: var(--ggb-typography-label-sm);
  }
  .type-scale {
    display: grid;
    gap: var(--ggb-space-content-md);
  }
  .type-row {
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: var(--ggb-space-content-lg);
    align-items: baseline;
    border-bottom: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    padding-bottom: var(--ggb-space-content-sm);
  }
  .type-meta {
    display: flex;
    flex-direction: column;
  }
  .type-row p {
    margin: 0;
    color: var(--ggb-color-content-primary);
    max-width: none;
    overflow-wrap: anywhere;
  }
  .control-row,
  .bar-row {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-md);
    margin-bottom: var(--ggb-space-content-sm);
  }
  .control {
    display: inline-flex;
    align-items: center;
    background: var(--ggb-color-action-accent-solid-default-surface);
    color: var(--ggb-color-action-accent-solid-default-content);
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-label-md);
    white-space: nowrap;
  }
  .control i {
    display: inline-block;
    border-radius: var(--ggb-radius-full);
    background: currentColor;
    opacity: 0.6;
  }
  .bar {
    display: inline-block;
    height: 12px;
    background: var(--ggb-color-action-accent-solid-default-surface);
    border-radius: 2px;
  }
  .row {
    display: flex;
    align-items: flex-end;
    gap: var(--ggb-space-content-lg);
    margin-bottom: var(--ggb-space-content-lg);
  }
  .wrap {
    flex-wrap: wrap;
  }
  .shape {
    width: 96px;
    height: 96px;
    display: grid;
    place-items: center;
    text-align: center;
    background: var(--ggb-color-surface-subtle);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-strong);
    font: var(--ggb-typography-label-sm);
  }
  .shape.small {
    width: 64px;
    height: 64px;
  }
  .shape.focus {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  .icon-box {
    display: inline-block;
    background: var(--ggb-color-content-secondary);
    border-radius: var(--ggb-primitive-radius-xs);
  }
  .avatar {
    display: inline-grid;
    place-items: center;
    background: var(--ggb-color-action-accent-solid-default-surface);
    color: var(--ggb-color-action-accent-solid-default-content);
    border-radius: var(--ggb-radius-full);
    font: var(--ggb-typography-label-sm);
  }
  .card {
    width: 200px;
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-raised);
    border-radius: var(--ggb-radius-container);
    display: flex;
    flex-direction: column;
    gap: 4px;
    font: var(--ggb-typography-label-md);
  }
  .card.small {
    width: 96px;
  }
  .tag {
    padding: 2px 8px;
    border-radius: var(--ggb-radius-full);
    background: var(--ggb-color-surface-muted);
    font: var(--ggb-typography-code-sm);
  }
  .motion {
    width: 150px;
    height: 48px;
    position: relative;
    background: var(--ggb-color-surface-subtle);
    border-radius: var(--ggb-radius-control);
    overflow: hidden;
    transition-property: background-color;
  }
  .motion span {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    border-radius: var(--ggb-radius-full);
    background: var(--ggb-color-action-accent-solid-default-surface);
    transition: inherit;
    transition-property: transform;
  }
  .motion:hover span {
    transform: translateX(114px);
  }
  .motion small {
    position: absolute;
    left: 8px;
    bottom: 4px;
    font-size: 10px;
  }
  @media (prefers-reduced-motion: reduce) {
    .motion span {
      transition-duration: 0s;
    }
  }
  .data {
    width: 100%;
    border-collapse: collapse;
    font: var(--ggb-typography-code-sm);
  }
  .data th,
  .data td {
    text-align: left;
    padding: 4px 8px;
    border-bottom: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
  }
  .data th {
    color: var(--ggb-color-content-tertiary);
    font-weight: 500;
  }
  .data tr.fail td {
    color: var(--ggb-color-status-danger-content);
    background: var(--ggb-color-status-danger-surface);
  }
  .toggle {
    display: inline-flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
    margin-bottom: var(--ggb-space-content-md);
  }
  .note {
    font: var(--ggb-typography-label-sm);
    margin-top: var(--ggb-space-content-sm);
  }
  @media (max-width: 720px) {
    .page {
      padding: var(--ggb-space-layout-md) var(--ggb-space-layout-sm);
    }
    .ramp,
    .type-row {
      grid-template-columns: 1fr;
    }
    .swatch small {
      display: none;
    }
  }
</style>
