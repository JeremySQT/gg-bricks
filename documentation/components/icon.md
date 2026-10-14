# Icon

## Overview

An icon shows a small vector glyph from the application's icon set, at one of five system sizes, in the color of the text around it. It gives a visual cue next to a label, stands in a button's slot, or, when it carries a name, conveys a meaning on its own: a status in a table cell, a file type in a list.

The component owns the box and the semantics: a square that never shrinks or stretches, hidden from assistive technology when it is decorative and exposed as a named image when it is not. The drawing itself is content you supply, following the conventions of the reference set (Phosphor Icons): the glyph is painted in the current color, so the same icon reads correctly on a solid button, in a disabled row or in a danger message without any option.

## When to use

Use an icon wherever a small symbol helps the user recognize an item or an action faster than text alone.

- Next to the text of a menu item, a list row, a navigation entry or a form hint, inheriting the text color.
- In the leading or trailing slot of a Button, where the button sizes it and places it against the label.
- On its own with a `label`, when the icon is the only carrier of a meaning: a check mark for “Paid”, a warning sign for “Attention needed”.
- At the five sizes of the system, from captions (xs, 12 px) to empty states and feature headers (xl, 32 px); the sizes are the same in every density.

## When not to use

- An action without visible text: use IconButton (planned), which owns the action, the accessible name and the interaction target. Icon has no interaction.
- Multi-color or illustrative artwork, logos, avatars (Avatar, planned) and photographs: a glyph is one color.
- An activity indicator: use Spinner (planned); the Button has its own loading indicator.
- A status or a category with text: use Badge (planned).
- Icon fonts and sprite sheets: the component takes inline vector content, not a font character or a sprite reference.

## Anatomy

The annotated anatomy lives on the Figma specification page of the component (frame “Icon — Specification”, `foundations/components/content/icon/figma-spec.md` gives the links; a capture is kept in `reports/components/icon/figma/specification.png`). Text equivalent, from the outside in:

| #   | Part  | Required | Role                                                                                                                                                                                                                                                                                                    |
| --- | ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Box   | yes      | A square of the chosen size (12, 16, 20, 24 or 32 px). It keeps its size in a flexible layout, sits on the middle of the text line and clips anything drawn outside it. It has no fill, no border and no color of its own.                                                                              |
| 2   | Glyph | yes      | The drawing, supplied by the application as the content of the component: paths and shapes in one color, painted in the current text color. Following the reference set, the drawing is inset by one eighth of the box on each side (the Phosphor grid, 256 units with the drawing between 32 and 224). |

Dimension A on the specification board is that inset; dimension B is the box size. Hosts rely on the inset for optical spacing: the Button places a leading or trailing icon by its drawing rather than by its square, so the glyph sits as close to the label as a counter does.

The glyph is content, not a part of the public API: the component cannot check that a drawing is one color or that it fits the grid.

## Usage guidelines

**Decorative or named.** An icon next to text that already says what it means stays decorative: leave `label` out and assistive technology skips it. Give a `label` only when the icon carries information on its own; the label is then the accessible name of an image, so write it as the meaning (“Paid”), not as a description of the drawing (“check mark”). Never use both an icon label and a visible text that say the same thing: screen readers would read it twice.

**One color.** The icon is painted in `currentColor`. Set the color on the surrounding text, a tinted wrapper or the host, never on the icon: a status color belongs to the row or the message, and inside a Button the button's content color applies.

**Size.** Match the icon to the text next to it: sm (16 px) beside body and label text, xs (12 px) beside captions, md (20 px) by default, lg and xl for headers and empty states. Sizes do not change with density, so an icon stays legible in a compact interface; inside a Button slot the button's size wins over the `size` option.

**Reference set.** Draw glyphs on the Phosphor grid, or pass the `viewBox` of another set drawn on its own square grid. A set with another inset renders correctly but sits slightly off in hosts that compensate for the Phosphor inset.

**Not interactive.** An icon never receives focus and never handles clicks. For an icon the user acts on, wait for IconButton or put the icon inside a Button.

Do: `<li><Icon size="sm">…</Icon> Changes saved</li>` with a decorative icon.
Don't: `<Icon label="check mark" />` next to the text “Changes saved”: the label adds nothing and is read twice.

## Examples

The verified source of every example is `examples/icon/App.svelte`, the review page of the component (`npm run build && npm run build:preview icon` produces a self-contained page). The glyphs of the examples come from `examples/icon/glyphs.ts`, a handful of Phosphor paths standing in for the application's set.

### A decorative icon next to text

The drawing is the content of the component; a snippet keeps it reusable.

```svelte
<script lang="ts">
  import { Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet glyph(id: string)}<path d={phosphor[id]} />{/snippet}

<li><Icon size="sm">{@render glyph('check')}</Icon> Changes saved</li>
<li><Icon size="sm">{@render glyph('trash')}</Icon> Move to trash</li>
```

### A named icon on its own

With `label`, the icon is an image with that accessible name.

```svelte
<td><Icon size="sm" label="Paid">{@render glyph('check')}</Icon></td>
<td><Icon size="sm" label="Attention needed">{@render glyph('warning-circle')}</Icon></td>
```

### Sizes

```svelte
<Icon size="xs">{@render glyph('plus')}</Icon>
<Icon size="sm">{@render glyph('plus')}</Icon>
<Icon>{@render glyph('plus')}</Icon>
<Icon size="lg">{@render glyph('plus')}</Icon>
<Icon size="xl">{@render glyph('plus')}</Icon>
```

### Inside a Button

The button sizes the icon and places it against the label; the `size` option is not needed.

```svelte
{#snippet plus()}<Icon>{@render glyph('plus')}</Icon>{/snippet}
{#snippet arrow()}<Icon>{@render glyph('arrow-right')}</Icon>{/snippet}

<Button label="New project" leading={plus} />
<Button label="Continue" intent="neutral" appearance="outline" trailing={arrow} />
```

### Another grid

A glyph drawn on a 24-unit grid passes its own `viewBox`.

```svelte
<Icon size="lg" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" /></Icon>
```

### Difficult cases

- In a flex row that runs out of room the box keeps its size and the text wraps or shrinks instead (`#squeezed` on the review page).
- A wrapper that sets `color` tints the icon with its text (`#color-danger`, `#color-success`, `#color-tertiary`).
- A glyph from a set with another inset renders at the right size but sits off the optical spacing a host assumes (`#grid-24`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Icon } from '@ggbrick/svelte';
import type { IconProps, IconSize } from '@ggbrick/svelte';
```

Renders a single `<svg>` element, so a host that selects its slot content (`.ggb-button__leading > svg`) sizes and places the icon as it does a raw glyph. The element carries `class="ggb-icon"` plus any class you pass, `data-size`, `fill="currentColor"` and `focusable="false"`; decorative icons carry `aria-hidden="true"`, named ones `role="img"` and `aria-label`.

| Prop       | Type                                   | Default         | Description                                                                                                         |
| ---------- | -------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`          | Box size: 12, 16, 20, 24 or 32 px (`size.icon.*`), identical in every density. A host slot that sizes icons wins.   |
| `label`    | `string`                               | —               | Accessible name. Without it (or blank) the icon is decorative and hidden from assistive technology.                 |
| `viewBox`  | `string`                               | `'0 0 256 256'` | Coordinate box of the glyph: the Phosphor grid by default; pass another set's grid when its glyphs are drawn on it. |
| `children` | `Snippet`                              | —               | The glyph: paths and shapes in the coordinate box, one color, painted in `currentColor`.                            |
| `class`    | `string`                               | —               | Merged with `ggb-icon`.                                                                                             |

Every other `SVGAttributes` of the element is forwarded, except those the component owns: `children`, `viewBox`, `width`, `height`, `fill`, `focusable`, `role`, `aria-label` and `aria-hidden`. There are no events and no bindable reference: an icon is static content.

The platform-independent options and rules are in `foundations/components/content/icon/contract.json`; the Figma master exposes Size as a variant and the glyph as an instance-swap property.

Visual tokens: the only role is `size.icon.{size}`; color comes from the context.

## Accessibility

What the component guarantees:

- A decorative icon (no `label`) is hidden from assistive technology (`aria-hidden="true"`) and never focusable (`focusable="false"`, which matters in older browsers that put `svg` in the tab order).
- A named icon exposes `role="img"` with `label` as its accessible name, so a status that only an icon conveys is announced.
- The glyph is painted in the current text color, so it keeps whatever contrast the surrounding text has, in every brand, appearance and density, and it follows forced colors with that text.
- The box never shrinks below its size, so the drawing is never clipped by a tight layout.

What the integration must provide:

- The decision between decorative and named, and a meaningful `label` for a named icon, written as the meaning rather than the drawing.
- Text next to a decorative icon that carries the information (the icon alone must not be the only cue), and enough contrast between that text and its background: the icon inherits it.
- A one-color drawing that fits the grid, legible at the chosen size.

Relevant WCAG 2.2 success criteria:

| Criterion                                                                                                 | Level | Relevance                                                                                 | Responsibility                                                                |
| --------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)               | A     | A named icon has a text alternative; a decorative one is hidden.                          | Component exposes or hides; the integration decides and writes the label      |
| [1.3.3 Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html) | A     | Instructions must not rely on the icon's shape alone (“the icon with the arrow”).         | Integration                                                                   |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                       | A     | A tinted icon must not be the only way a status is conveyed.                              | Integration                                                                   |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)            | AA    | A meaningful icon needs 3:1 against its background; it inherits the color of its context. | Integration (the system's content colors meet it on the documented backdrops) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)               | A     | `role="img"` and the label on a named icon; nothing exposed on a decorative one.          | Component                                                                     |

Validation status: automated checks only, in Chromium: axe-core on the review page in light and dark appearances (0 violations), the accessibility tree of decorative and named icons, host sizing and layout behavior, computed sizes in the 18 brand × appearance × density contexts (`tests/browser/icon.spec.ts`, `reports/components/icon/`). No assistive-technology test has been run yet; listing these criteria is not a conformance claim.
