# Spinner

## Overview

A spinner shows that something is loading or working when the time it takes is unknown and its place is small: next to “Loading comments”, in the middle of an empty panel, inside a control. It is a turning ring drawn in the color of the text around it, and Button and IconButton show the same spinner in their loading state.

## Anatomy

| #   | Part      | Required | Role                                                                                  |
| --- | --------- | -------- | ------------------------------------------------------------------------------------- |
| 1   | Track     | yes      | The full ring the indicator turns along; both take the color of the text around them. |
| 2   | Indicator | yes      | The part of the ring that keeps turning, showing that work is under way.              |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/spinner.json`.

## When to use

- A short wait next to a label that says what is loading (“Loading comments”).
- An empty panel or region whose content is being fetched, when its layout is not known in advance.
- A custom control or a list row that is working, in the size of the icon it stands beside.

## When not to use

- A Button or IconButton that is working: set its `loading` prop; it shows this spinner and keeps its width and focus.
- A task whose amount is known (an upload, an import in steps), or a long task without a known end: Progress, `indeterminate` when the end is unknown.
- The first load of a region whose layout is known (a card, a list, a profile): Skeleton.
- A colored or branded loading animation: not built in; the spinner takes the content color around it.

## Best practices

| Guidance | Topic    | Practice                                                                                                                        |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label    | Give `label` when nothing else says what is loading (“Loading the activity”): the spinner then becomes a polite status.         |
| Do       | Busy     | Leave `label` empty when the element that is loading already says so, and mark that element busy (`aria-busy`).                 |
| Do       | Size     | Match the icon or text next to it: `sm` beside small text, `md` by default, `xl` alone in an empty panel.                       |
| Do       | Color    | Set the color on the parent (secondary text, an inverse surface): the spinner follows it and reads wherever that text reads.    |
| Do       | Lifetime | Remove the spinner as soon as the work ends, and show the result or an error in its place.                                      |
| Don't    | Buttons  | Put a Spinner inside a Button or next to its label: use `loading`, which keeps the button's width, focus and name.              |
| Don't    | Many     | Show a spinner in every row or card of a region that loads at once: one spinner for the region, or Skeletons, is calmer.        |
| Don't    | Label    | Name a spinner and leave the same visible words exposed beside it: screen readers would read them twice; hide the visible copy. |
| Don't    | Progress | Use a spinner for a wait of known size or one that lasts long: a Progress says how far it has gone.                             |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/spinner/App.svelte`, not shipped in the package).

### Next to a label

The visible text is hidden from assistive technology because the named spinner already announces it.

```svelte live
<script lang="ts">
  import { Spinner } from '@ggbrick/svelte';
</script>

<p
  style="display: inline-flex; align-items: center; gap: var(--ggb-space-content-sm); margin: 0; color: var(--ggb-color-content-secondary)"
>
  <Spinner size="sm" label="Loading comments" />
  <span aria-hidden="true">Loading comments…</span>
</p>
```

### Sizes, in the color of their parent

```svelte live
<script lang="ts">
  import { Spinner } from '@ggbrick/svelte';
</script>

<div style="display: flex; align-items: center; gap: var(--ggb-space-content-md)">
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
  <span style="color: var(--ggb-color-content-secondary)"><Spinner /></span>
  <span
    style="display: inline-flex; padding: var(--ggb-space-content-xs); border-radius: var(--ggb-radius-control); background: var(--ggb-color-surface-inverse); color: var(--ggb-color-content-inverse)"
  >
    <Spinner />
  </span>
</div>
```

### An empty panel loading

The panel is marked busy while its content loads; the spinner is removed when the content arrives.

```svelte live
<script lang="ts">
  import { Button, Spinner } from '@ggbrick/svelte';

  let loading = $state(true);
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)">
  <section
    aria-label="Activity"
    aria-busy={loading}
    style="display: flex; flex-direction: column; align-items: center; gap: var(--ggb-space-content-sm); inline-size: 100%; padding: var(--ggb-space-layout-md); color: var(--ggb-color-content-secondary)"
  >
    {#if loading}
      <Spinner size="xl" label="Loading the activity" />
    {:else}
      <p style="margin: 0; color: var(--ggb-color-content-primary)">No activity this week.</p>
    {/if}
  </section>
  <Button
    label={loading ? 'Finish loading' : 'Load again'}
    intent="neutral"
    appearance="outline"
    size="sm"
    onactivate={() => (loading = !loading)}
  />
</div>
```

### A busy button

A working Button shows the same spinner through its `loading` prop; do not add one yourself.

```svelte live
<script lang="ts">
  import { Button } from '@ggbrick/svelte';
</script>

<Button label="Saving" loading />
```

### Difficult cases

- A named spinner removed and shown again, and the same spinner switched to decorative (`#playground`).
- Every size on primary text, secondary text and an inverse surface; beside a busy Button; alone in an empty panel (`#matrix`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Spinner } from '@ggbrick/svelte';
import type { SpinnerProps, SpinnerSize } from '@ggbrick/svelte';
```

Renders a `<span class="ggb-spinner">` (plus any class you pass) with `data-size`, holding an `<svg class="ggb-spinner__svg">` with the track (`ggb-spinner__track`) and the indicator (`ggb-spinner__indicator`), both stroked in `currentColor`. Without a label the root carries `aria-hidden="true"` and no role; with a label it carries `role="status"` and `aria-label`, and holds the same text in a visually hidden `<span class="ggb-spinner__label">`.

| Prop    | Type                                 | Default | Description                                                                                                                           |
| ------- | ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `size`  | `'sm' \| 'md' \| 'lg' \| 'xl'`       | `'md'`  | The icon scale: the same size as an Icon of the same name. It does not change with the density.                                       |
| `label` | `string`                             | `''`    | Empty or blank: decorative, hidden from assistive technology. Non-empty: the spinner is a polite status named by this text (trimmed). |
| `ref`   | `HTMLSpanElement \| null` (bindable) | `null`  | The rendered element.                                                                                                                 |
| `class` | `string`                             | —       | Merged with `ggb-spinner`.                                                                                                            |

Every other attribute of `HTMLAttributes<HTMLSpanElement>` (`id`, `style`, `data-*`…) is forwarded to the root, except those the component owns: `children`, `role`, `aria-label` and `aria-hidden`. There are no events. The color is the inherited content color; brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/spinner.json`.

## Accessibility

The component provides:

- Without a label, a spinner hidden from assistive technology; with a label, `role="status"` named by the label, a polite live region.
- Never focusable, no events; the ring is drawn in the content color of its parent, so it reads wherever the text around it reads.
- A turn three times slower when reduced motion is requested; the system text color in forced colors.

The integration provides:

- What is loading: a label, or `aria-busy` and visible text on the element that is loading.
- The removal of the spinner when the work ends, and an announcement of the result or of an error. Whether a status inserted already filled is announced varies between screen readers: for a result that must be heard, keep a status region on the page and fill it.
- A parent content color with enough contrast against its surface.

| WCAG 2.2 criterion                                                                             | Level | Responsibility                                                    |
| ---------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)    | A     | Component (decorative, or named by its label)                     |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | AA    | Integration (the spinner takes its parent's content color)        |
| [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)    | A     | Integration (shown only while the work lasts)                     |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)    | A     | Component                                                         |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)      | AA    | Component (a named spinner is a status), integration (the result) |

Validated by automated checks in Chromium (axe-core in light and dark, role and name of a decorative and a named spinner, size, inherited color, track opacity and turn duration in the 18 contexts, reduced motion, forced colors) and server-rendering checks; no assistive-technology test yet. This list is not a conformance claim.
