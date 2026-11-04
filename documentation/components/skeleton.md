# Skeleton

## Overview

A skeleton stands in for content that is loading, with the shape and size of that content, so that the page does not move when it arrives: lines of text in a card, an image or a chart, an avatar. It is a calm pulsing placeholder, and several skeletons compose the outline of a card, a list row or a profile.

## Anatomy

| #   | Part | Required   | Role                                                                                                                                                                        |
| --- | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Line | text shape | One per line of the text to come, as tall as the line box of `typography.body.{size}`; the lines fill the width.                                                            |
| 2   | Bar  | text shape | The font size of that text, centered in its line, with `radius.indicator` corners, in `color.surface.muted`; with more than one line the last bar covers 60 % of the width. |

A line height: `typography.body.{size}` line height, 21, 24 or 28.8 px. B bar height: its font size, 14, 16 or 18 px. Neither changes with the density. The block and circle shapes have no lines: a block fills the size the layout gives it with `radius.container` corners, a circle is a disc as wide as its box with `radius.full` corners.

## When to use

- The first load of a region whose layout is known: a card, a list, a profile, a table of results.
- Lines of running text, an image or chart block, an avatar, composed in the layout of the content to come.

## When not to use

- A short action on content already shown (saving, refreshing): Spinner, or the `loading` prop of Button and IconButton.
- A task whose amount is known, or a long task under way: Progress.
- A region whose layout is not known in advance: one Spinner in the region.
- A ready-made card or list skeleton: not built in; compose Skeletons in the layout of your content.
- Content that failed to load: an Alert with the error, in place of the skeleton.

## Best practices

| Guidance | Topic   | Practice                                                                                                                   |
| -------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Do       | Shape   | Reproduce the layout of the content to come: the same number of lines, the avatar and the image in their places and sizes. |
| Do       | Size    | Give text lines the `size` of the body text they stand for, so that the paragraph keeps its height when the text arrives.  |
| Do       | Busy    | Mark the loading region `aria-busy="true"` and set it to false when the content is in place.                               |
| Do       | Sizing  | Size block and circle skeletons with their container: a block takes its width and height, a circle its width.              |
| Do       | Replace | Replace the skeletons with the content in one step, in the same places.                                                    |
| Don't    | Actions | Show a skeleton over content already on the page while an action runs: the user loses what they were reading.              |
| Don't    | Labels  | Add text or a label to a skeleton: it is hidden from assistive technology; say it on the region.                           |
| Don't    | Forever | Leave skeletons when the load fails or returns nothing: show the error or the empty state instead.                         |
| Don't    | Shapes  | Draw skeletons for every small detail (icons, badges, buttons): a few lines and blocks give the outline.                   |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/skeleton/App.svelte`, not shipped in the package).

### A paragraph

```svelte live
<script lang="ts">
  import { Skeleton } from '@ggbrick/svelte';
</script>

<div style="inline-size: min(24rem, 100%)">
  <Skeleton lines={3} />
</div>
```

### A card loading, then loaded

The card is marked busy while it loads; the avatar is a circle as wide as its slot, the text three lines of the body size it stands for.

```svelte live
<script lang="ts">
  import { Skeleton, Switch } from '@ggbrick/svelte';

  let loaded = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); inline-size: min(24rem, 100%)">
  <Switch label="Loaded" bind:checked={loaded} />
  <article
    aria-busy={!loaded}
    style="display: flex; align-items: flex-start; gap: var(--ggb-space-content-md); min-block-size: 6rem; padding: var(--ggb-space-content-md); border: var(--ggb-border-width-default) solid var(--ggb-color-border-default); border-radius: var(--ggb-radius-container); font: var(--ggb-typography-body-sm)"
  >
    {#if loaded}
      <div
        aria-hidden="true"
        style="display: grid; place-items: center; flex: none; inline-size: 40px; block-size: 40px; border-radius: var(--ggb-radius-full); background: var(--ggb-color-action-accent-solid-default-surface); color: var(--ggb-color-action-accent-solid-default-content); font: var(--ggb-typography-label-sm)"
      >
        AL
      </div>
      <div style="flex: 1; min-inline-size: 0">
        <strong>Ada Lovelace</strong>
        <p style="margin: 0">Commented on the roadmap: the second wave looks right, ship it next week.</p>
      </div>
    {:else}
      <div style="flex: none; inline-size: 40px"><Skeleton shape="circle" /></div>
      <div style="flex: 1; min-inline-size: 0"><Skeleton lines={3} size="sm" /></div>
    {/if}
  </article>
</div>
```

### A chart block

A block fills the width and height of its container.

```svelte live
<script lang="ts">
  import { Skeleton } from '@ggbrick/svelte';
</script>

<div aria-busy="true" style="inline-size: min(24rem, 100%); block-size: 10rem">
  <Skeleton shape="block" />
</div>
```

### Difficult cases

- Every shape, number of lines and size in a fixed box (`#playground`).
- Text lines in each body size beside the real paragraph they stand for, with the same height (`#matrix`).
- A card loading then loaded, with its circle avatar, and a chart block filling its container (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Skeleton } from '@ggbrick/svelte';
import type { SkeletonProps, SkeletonShape, SkeletonSize } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-skeleton">` (plus any class you pass) with `data-shape`, `data-size` and `aria-hidden="true"`. The text shape holds one `<span class="ggb-skeleton__line">` per line, each drawing its bar; block and circle are painted on the root and hold nothing.

| Prop    | Type                                | Default  | Description                                                                                                                  |
| ------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `shape` | `'text' \| 'block' \| 'circle'`     | `'text'` | `text`: lines of running text. `block`: fills the width and height the layout gives it. `circle`: a disc as wide as its box. |
| `lines` | `number`                            | `1`      | Number of text lines, rounded down, at least 1; the last one covers 60 % of the width when there are several. Text only.     |
| `size`  | `'sm' \| 'md' \| 'lg'`              | `'md'`   | Body typography the text lines stand for. Text only.                                                                         |
| `ref`   | `HTMLDivElement \| null` (bindable) | `null`   | The rendered element.                                                                                                        |
| `class` | `string`                            | —        | Merged with `ggb-skeleton`.                                                                                                  |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `style`, `data-*`…) is forwarded to the root, except those the component owns: `children`, `role`, `aria-hidden` and `tabindex`. There are no events. Every shape pulses from full opacity to `opacity.muted` and back once per `motion.duration.loop`, all the skeletons of the page in phase, wherever they were inserted. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/skeleton.json`.

## Accessibility

The component provides:

- A skeleton hidden from assistive technology, never focusable, without content or events.
- No pulse when reduced motion is requested; a visible edge in the system text color in forced colors.

The integration provides:

- `aria-busy` on the region that is loading, and the content announced or reachable when it arrives; a status message when the user waits for it.
- The replacement of the skeletons by the content, an error or an empty state when the load ends.

| WCAG 2.2 criterion                                                                          | Level | Responsibility                                       |
| ------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) | A     | Component (hidden from assistive technology)         |
| [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | A     | Integration (skeletons only while the content loads) |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)   | AA    | Integration                                          |

Validated by automated checks in Chromium (axe-core in light and dark, hidden from assistive technology, line and bar heights against real text, colors, radii and pulse duration in the 18 contexts, pulses in phase, no pulse under reduced motion, forced colors) and server-rendering checks; no assistive-technology test yet. This list is not a conformance claim.
