<script lang="ts">
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

  // The full label is shown on hover when the line truncates it or when only the icon shows (its accessible name is
  // always the full label).
  function truncation(node: HTMLElement) {
    if (typeof ResizeObserver === 'undefined') return;
    const label = node.querySelector<HTMLElement>('.ggb-breadcrumb__item-label');
    const update = () => {
      if (!label) return;
      const hidden = node.matches('[data-hide-label]:has(.ggb-breadcrumb__item-leading:not(:empty))');
      if (hidden || label.scrollWidth > label.clientWidth + 0.5) node.setAttribute('title', label.textContent ?? '');
      else node.removeAttribute('title');
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    update();
    return () => observer.disconnect();
  }

  // Each entry takes the width of its content, so that the spacing is gap everywhere; when the line lacks room it may
  // shrink down to its label's first three characters (1 em each), or its whole label when shorter. The minimum is
  // measured, since CSS has no minimum of "the smaller of a length and the content". A truncated label is then fitted
  // to its text: the native ellipsis drops whole characters and would leave up to one character's width before the
  // separator, so the label box is narrowed to the characters that fit plus the ellipsis (the browser then draws the
  // same characters and the ellipsis flush against the separator's gap).
  let listElement = $state<HTMLOListElement | null>(null);
  $effect(() => {
    const listNode = listElement;
    void [list, size, separator, leading, keep];
    if (!listNode || typeof ResizeObserver === 'undefined') return;
    const canvas = document.createElement('canvas').getContext('2d');
    const apply = () => {
      const entries = [...listNode.querySelectorAll<HTMLElement>('.ggb-breadcrumb__entry:not(.ggb-breadcrumb__more)')];
      const labels = entries.map((e) =>
        e.querySelector('[data-hide-label] .ggb-breadcrumb__item-leading:not(:empty)')
          ? null
          : e.querySelector<HTMLElement>('.ggb-breadcrumb__item-label')
      );
      // 1. Minimums, measured on the whole labels. The previous minimums are cleared first: an entry held at a minimum
      // measured earlier (with a fallback font, before the web font loaded) would otherwise keep that width.
      labels.forEach((label) => label?.style.removeProperty('max-inline-size'));
      entries.forEach((entry) => entry.style.removeProperty('min-inline-size'));
      entries.forEach((entry, i) => {
        const label = labels[i];
        if (!label) return;
        // The fractional width when the label is whole (scrollWidth is rounded), its scroll width when truncated.
        const box = label.getBoundingClientRect().width;
        const full = label.scrollWidth > label.clientWidth ? label.scrollWidth : box;
        const keepWidth = Math.min(full, 3 * parseFloat(getComputedStyle(label).fontSize));
        const others = entry.getBoundingClientRect().width - box;
        entry.style.minInlineSize = `${others + keepWidth}px`;
      });
      // 2. Truncated labels fitted to the characters that show.
      labels.forEach((label, i) => {
        if (!label || label.scrollWidth <= label.clientWidth + 0.5) return;
        const text = label.firstChild;
        if (!(text instanceof Text) || !canvas) return;
        const style = getComputedStyle(label);
        canvas.font = style.font;
        const ellipsis = canvas.measureText('…').width;
        const room = label.getBoundingClientRect().width;
        const range = document.createRange();
        let fit = 0;
        for (let n = text.length; n > 0; n--) {
          range.setStart(text, 0);
          range.setEnd(text, n);
          const width = range.getBoundingClientRect().width;
          if (width + ellipsis <= room) {
            fit = width;
            break;
          }
        }
        if (fit <= 0) return;
        const fitted = Math.ceil((fit + ellipsis) * 2) / 2 + 0.5;
        // The entry's minimum follows, so that the narrowed label leaves no room after the separator.
        const others = entries[i].getBoundingClientRect().width - room;
        label.style.maxInlineSize = `${fitted}px`;
        entries[i].style.minInlineSize = `${others + fitted}px`;
      });
    };
    const observer = new ResizeObserver(apply);
    observer.observe(listNode);
    apply();
    void document.fonts?.ready.then(apply);
    return () => observer.disconnect();
  });
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
  {@const hideLabel = !!item.hideLabel && !!leading}
  <li class="ggb-breadcrumb__entry" data-current={current ? '' : undefined}>
    {#if current}
      <span
        class="ggb-breadcrumb__item"
        data-current=""
        aria-current="page"
        data-hide-label={hideLabel ? '' : undefined}
        {@attach truncation}
      >
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </span>
    {:else if item.href}
      <a
        class="ggb-breadcrumb__item"
        href={item.href}
        data-hide-label={hideLabel ? '' : undefined}
        {@attach truncation}
      >
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </a>
    {:else}
      <span class="ggb-breadcrumb__item" data-hide-label={hideLabel ? '' : undefined} {@attach truncation}>
        {#if leading}<span class="ggb-breadcrumb__item-leading" aria-hidden="true">{@render leading(item, index)}</span
          >{/if}<span class="ggb-breadcrumb__item-label">{item.label}</span>
      </span>
    {/if}
    {#if !current}{@render glyph()}{/if}
  </li>
{/snippet}

<nav {...rest} bind:this={ref} class={['ggb-breadcrumb', className]} aria-label={label} data-size={size}>
  <ol class="ggb-breadcrumb__list" bind:this={listElement}>
    {#each shown as { item, index }, position (index)}
      {@render entry(item, index)}
      {#if collapsed && position === 0}
        <li class="ggb-breadcrumb__entry ggb-breadcrumb__more">
          <Menu>
            {#snippet trigger(props)}
              <!-- Painted and spaced like an ancestor link (the contract), not an IconButton. -->
              <button
                {...props}
                type="button"
                class="ggb-breadcrumb__item ggb-breadcrumb__more-trigger"
                aria-label={moreLabel}
                title={moreLabel}><span class="ggb-breadcrumb__item-label" aria-hidden="true">…</span></button
              >
            {/snippet}
            {#each hidden as h, i (i)}<MenuItem label={h.label} href={h.href} />{/each}
          </Menu>
          {@render glyph()}
        </li>
      {/if}
    {/each}
  </ol>
</nav>
