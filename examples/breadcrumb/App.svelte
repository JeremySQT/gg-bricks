<script lang="ts">
  // Breadcrumb implementation review: a playground (size, separator, maxItems), a home icon, a level without a page,
  // a long path collapsed into a menu, a narrow column that truncates, right-to-left, in any brand, appearance and
  // density.
  import { Breadcrumb, Icon } from '../../packages/svelte/src/index.ts';
  import type { BreadcrumbItem, BreadcrumbSeparator, BreadcrumbSize } from '../../packages/svelte/src/index.ts';
  // Phosphor Icons 2.1.1 (MIT), house, regular weight.
  const house =
    'M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  let size = $state<BreadcrumbSize>('sm');
  let separator = $state<BreadcrumbSeparator>('chevron');
  let maxItems = $state(0);
  let home = $state(true);
  let homeOnly = $state(false);
  const path: BreadcrumbItem[] = $derived([
    { label: 'Home', href: '#home', iconOnly: homeOnly },
    { label: 'Projects', href: '#projects' },
    { label: 'Acme website', href: '#acme' },
    { label: 'Settings', href: '#settings' },
    { label: 'Members' }
  ]);
  const long: BreadcrumbItem[] = [
    { label: 'Home', href: '#home' },
    { label: 'Workspaces', href: '#workspaces' },
    { label: 'Marketing', href: '#marketing' },
    { label: 'Campaigns', href: '#campaigns' },
    { label: '2026', href: '#2026' },
    { label: 'Spring launch', href: '#spring' },
    { label: 'Assets' }
  ];
</script>

{#snippet homeIcon(_item: BreadcrumbItem, index: number)}{#if index === 0}<Icon><path d={house} /></Icon>{/if}{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Breadcrumb</h1>
    <p class="lede">
      Where the current page sits in the hierarchy, with a link to each ancestor. Each link is a Tab stop; the current
      page is the last item and is not a link. Every control below is the real Svelte component on the approved tokens.
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
        <Breadcrumb
          id="play"
          items={path}
          {size}
          {separator}
          {maxItems}
          leading={home || homeOnly ? homeIcon : undefined}
        />
        <button type="button" id="after">After</button>
      </div>
      <fieldset class="options">
        <legend>Options</legend>
        <label
          >Size <select id="opt-size" bind:value={size}
            >{#each ['sm', 'md'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Separator <select id="opt-separator" bind:value={separator}
            >{#each ['chevron', 'slash'] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label
          >Max items <select id="opt-max" bind:value={maxItems}
            >{#each [0, 3, 4] as v (v)}<option value={v}>{v}</option>{/each}</select
          ></label
        >
        <label><input type="checkbox" id="opt-home" bind:checked={home} /> Home icon</label>
        <!-- Icon only needs an icon: checking it shows the home icon whatever Home icon says. -->
        <label><input type="checkbox" id="opt-home-only" bind:checked={homeOnly} /> Home icon only</label>
      </fieldset>
    </div>
  </section>

  <section id="compositions" aria-labelledby="compositions-title">
    <h2 id="compositions-title">Compositions</h2>
    <div class="grid">
      <div class="panel">
        <p class="panel-title">A long path collapsed after 4 items</p>
        <Breadcrumb id="long" items={long} maxItems={4} />
      </div>
      <div class="panel">
        <p class="panel-title">A narrow column: ancestors truncate first</p>
        <div class="narrow">
          <Breadcrumb
            id="narrow"
            items={[
              { label: 'International partnerships', href: '#partners' },
              { label: 'Northern Europe distribution', href: '#north' },
              { label: 'Quarterly performance review' }
            ]}
          />
        </div>
      </div>
      <div class="panel">
        <p class="panel-title">Size md, slash, a level without its own page</p>
        <Breadcrumb
          id="md"
          size="md"
          separator="slash"
          items={[{ label: 'Docs', href: '#docs' }, { label: 'Components' }, { label: 'Breadcrumb' }]}
        />
      </div>
      <div class="panel">
        <p class="panel-title">Right-to-left: separators are mirrored</p>
        <div dir="rtl">
          <Breadcrumb
            id="rtl"
            label="مسار التنقل"
            items={[{ label: 'الرئيسية', href: '#home' }, { label: 'المشاريع', href: '#p' }, { label: 'الإعدادات' }]}
          />
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
  .narrow {
    max-inline-size: 15rem;
  }
</style>
