<script lang="ts">
  import IconButton from '../icon-button/IconButton.svelte';
  import Menu from '../menu/Menu.svelte';
  import MenuItem from '../menu/MenuItem.svelte';
  import type { BreadcrumbItem, BreadcrumbProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './breadcrumb.css';

  let {
    items,
    label = defaults.label,
    size = defaults.size,
    separator = defaults.separator,
    maxItems = defaults.maxItems,
    moreLabel = defaults.moreLabel,
    leading,
    ref = $bindable(null),
    class: className,
    ...rest
  }: BreadcrumbProps = $props();

  // Fail identically on the server and in the browser rather than render an empty trail or an unnamed link.
  const list = $derived.by(() => {
    if (!Array.isArray(items) || !items.length) throw new Error('Breadcrumb requires at least one item.');
    for (const item of items)
      if (typeof item?.label !== 'string' || !item.label.trim())
        throw new Error('Every Breadcrumb item requires a non-empty label.');
    return items;
  });

  // Collapse: above maxItems (counted at least 3), keep the first and the last maxItems - 1 items.
  const keep = $derived(maxItems > 0 ? Math.max(3, Math.floor(maxItems)) : Infinity);
  const collapsed = $derived(list.length > keep);
  const hidden = $derived(collapsed ? list.slice(1, list.length - (keep - 1)) : []);
  const shown = $derived(
    collapsed
      ? [
          { item: list[0], index: 0 },
          ...list.slice(list.length - (keep - 1)).map((item, i) => ({ item, index: list.length - (keep - 1) + i }))
        ]
      : list.map((item, index) => ({ item, index }))
  );
  const lastIndex = $derived(list.length - 1);

  // The full label is shown on hover when the line truncates it (its accessible name is always the full label).
  function truncation(node: HTMLElement) {
    if (typeof ResizeObserver === 'undefined') return;
    const label = node.querySelector<HTMLElement>('.ggb-breadcrumb__item-label');
    const update = () => {
      if (!label) return;
      if (label.scrollWidth > label.clientWidth + 0.5) node.setAttribute('title', label.textContent ?? '');
      else node.removeAttribute('title');
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    update();
    return () => observer.disconnect();
  }
</script>

{#snippet glyph()}
  <svg class="ggb-breadcrumb__separator" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">
    {#if separator === 'slash'}
      <!-- A slash drawn on the 256-unit grid of the reference set, with its round caps and regular stroke. -->
      <path d="M168.3,33.3a8,8,0,0,1,4.4,10.4l-72,176a8,8,0,0,1-14.8-6l72-176A8,8,0,0,1,168.3,33.3Z" />
    {:else}
      <!-- Phosphor Icons 2.1.1 (MIT), caret-right, regular weight. -->
      <path
        d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
      />
    {/if}
  </svg>
{/snippet}

{#snippet entry(item: BreadcrumbItem, index: number)}
  {@const current = index === lastIndex}
  <li class="ggb-breadcrumb__entry" data-current={current ? '' : undefined}>
    {#if current}
      <span class="ggb-breadcrumb__item" data-current="" aria-current="page" {@attach truncation}>
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </span>
    {:else if item.href}
      <a class="ggb-breadcrumb__item" href={item.href} {@attach truncation}>
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </a>
    {:else}
      <span class="ggb-breadcrumb__item" {@attach truncation}>
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </span>
    {/if}
    {#if !current}{@render glyph()}{/if}
  </li>
{/snippet}

<nav {...rest} bind:this={ref} class={['ggb-breadcrumb', className]} aria-label={label} data-size={size}>
  <ol class="ggb-breadcrumb__list">
    {#each shown as { item, index }, position (index)}
      {@render entry(item, index)}
      {#if collapsed && position === 0}
        <li class="ggb-breadcrumb__entry ggb-breadcrumb__more">
          <Menu>
            {#snippet trigger(props)}
              <IconButton {...props} label={moreLabel} {size} intent="neutral" appearance="ghost">
                {#snippet icon()}
                  <!-- Phosphor Icons 2.1.1 (MIT), dots-three, regular weight. -->
                  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
                    ><path
                      d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"
                    /></svg
                  >
                {/snippet}
              </IconButton>
            {/snippet}
            {#each hidden as h, i (i)}<MenuItem label={h.label} href={h.href} />{/each}
          </Menu>
          {@render glyph()}
        </li>
      {/if}
    {/each}
  </ol>
</nav>
