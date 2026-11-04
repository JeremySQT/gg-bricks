# Badge

## Overview

A badge labels an item with a short status or category set by the application: Paid, Draft, Overdue, Beta. It is a small colored box whose word carries the meaning and whose color reinforces it.

## Anatomy

| #   | Part         | Required | Role                                                                                                  |
| --- | ------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Container    | yes      | The box: as tall as the line of the label, at least as wide as it is tall, slightly rounded corners.  |
| 2   | Leading icon | no       | One decorative icon before the label, placed by its drawing; its size is set by the badge.            |
| 3   | Label        | yes      | The word, on one line, centered on its capital height; shortened with an ellipsis when room runs out. |

A height (the line box of the label: 15.4, 16.8 or 19.6 px, the same in every density), B side padding (2, 4 or 6 px with the density), C gap between the drawing of the icon and the label (the same value as the padding).

## When to use

- A status in a table cell, a list item, a card or a page header: Active, Pending, Failed.
- A category without valence (Internal, Archived) with the neutral intent, or a highlighted one in the brand color (New, Beta) with the accent intent.
- A signal that must stand out in a dense list, with the strong appearance.

## When not to use

- A quantity: Counter.
- A value the user can remove or select (a filter, a keyword): Tag (planned).
- A dot without text, or a badge over an avatar or an icon: a later indicator (planned).
- A message that explains the status: Alert.
- A status inside a sentence: plain text.
- Inside a Button: a quantity in a Button is a Counter.

## Best practices

| Guidance | Topic       | Practice                                                                                                                                         |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Do       | Label       | Write one or two words that make sense without the color: “Overdue”, not “Late!”.                                                                |
| Do       | Intent      | Match the intent to the meaning: success, warning, danger and info for statuses, neutral or accent for categories.                               |
| Do       | Appearance  | Keep subtle by default; reserve strong for the one or two statuses per screen that must stand out.                                               |
| Do       | Icon        | Add a leading icon only when it repeats the meaning (a check for Paid, a warning circle for Overdue), and use it for every badge of that status. |
| Do       | Size        | Use the size of the text or the controls around it: `sm` in dense tables, `md` by default, `lg` beside large headings.                           |
| Do       | Changes     | Announce a status change elsewhere (a status message) when the user must know it: a badge does not announce itself.                              |
| Don't    | Color       | Rely on the color alone: two statuses must have two different words.                                                                             |
| Don't    | Interaction | Make a badge clickable or put it in a button: it is not interactive and never takes focus.                                                       |
| Don't    | Length      | Put a sentence in a badge: a long label is shortened with an ellipsis.                                                                           |
| Don't    | Accent      | Use the accent intent for statuses: it is the brand color, for highlighted categories.                                                           |

## Examples

Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set. Every case is exercised on the component's review page in the ggbrick repository (`examples/badge/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Badge } from '@ggbrick/svelte';
</script>

<table>
  <tbody>
    <tr>
      <th scope="row">Invoice 1042</th>
      <td><Badge intent="success" label="Paid" /></td>
    </tr>
    <tr>
      <th scope="row">Invoice 1043</th>
      <td><Badge intent="warning" label="Due soon" /></td>
    </tr>
    <tr>
      <th scope="row">Invoice 1044</th>
      <td><Badge intent="danger" label="Overdue" /></td>
    </tr>
    <tr>
      <th scope="row">Invoice 1045</th>
      <td><Badge label="Draft" /></td>
    </tr>
  </tbody>
</table>
```

### Intents and appearances

```svelte live
<Badge label="Archived" />
<Badge intent="accent" label="New" />
<Badge intent="info" label="In review" />
<Badge intent="success" label="Paid" />
<Badge intent="warning" label="Due soon" />
<Badge intent="danger" label="Overdue" />
<Badge intent="danger" appearance="strong" label="Failed" />
<Badge intent="accent" appearance="strong" label="Beta" />
```

### With a leading icon

The badge sizes the icon (12 px) and places it by its drawing; the icon is decorative.

```svelte live
<script lang="ts">
  import { Badge, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet check()}<Icon><path d={phosphor.check} /></Icon>{/snippet}
{#snippet warning()}<Icon><path d={phosphor['warning-circle']} /></Icon>{/snippet}

<Badge intent="success" label="Paid" leading={check} />
<Badge intent="danger" label="Overdue" leading={warning} />
<Badge intent="danger" appearance="strong" label="Failed" leading={warning} />
```

### Sizes next to text

```svelte live
<span style="font: var(--ggb-typography-body-sm)">Billing API <Badge size="sm" intent="accent" label="Beta" /></span>
<span style="font: var(--ggb-typography-body-md)">Billing API <Badge intent="accent" label="Beta" /></span>
<span style="font: var(--ggb-typography-heading-sm)">Billing API <Badge size="lg" intent="accent" label="Beta" /></span>
```

### Difficult cases

- In a cell narrower than the badge, the label ends with an ellipsis, the icon stays whole and the full label stays readable by assistive technology (`#contexts` on the review page).
- A badge and a Counter of the same size sit on the same line at the same height.

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Badge } from '@ggbrick/svelte';
import type { BadgeProps, BadgeIntent, BadgeAppearance, BadgeSize } from '@ggbrick/svelte';
```

Renders a `<span>` that is the container, holding the optional `<span class="ggb-badge__leading" aria-hidden="true">` and a `<span class="ggb-badge__label">` with the text. The root carries `class="ggb-badge"` plus any class you pass, and `data-intent`, `data-appearance` and `data-size`. No role, no `aria-*`, no `tabindex`.

| Prop         | Type                                                                    | Default     | Description                                                                                                                        |
| ------------ | ----------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `label`      | `string`                                                                | required    | The visible word, read as plain text. Must be non-empty: an empty or blank label throws, on the server and in the browser.         |
| `intent`     | `'neutral' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Color family: neutral or accent for a category, the others for a status.                                                           |
| `appearance` | `'subtle' \| 'strong'`                                                  | `'subtle'`  | Subtle: tinted surface with an edge; strong: filled surface.                                                                       |
| `size`       | `'sm' \| 'md' \| 'lg'`                                                  | `'md'`      | Typography step, one below a Button label of the same size. Height and icon size do not change with the density; the padding does. |
| `leading`    | `Snippet`                                                               | —           | One decorative icon before the label (an Icon); the badge sets its size and color.                                                 |
| `ref`        | `HTMLSpanElement \| null` (bindable)                                    | `null`      | The rendered element.                                                                                                              |
| `class`      | `string`                                                                | —           | Merged with `ggb-badge`.                                                                                                           |

Every other attribute of `HTMLAttributes<HTMLSpanElement>` is forwarded to the element, except those the component owns: `children`, `role` and `tabindex`. There are no events.

Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/badge.json`.

## Accessibility

The component provides:

- The label as plain text, read where it stands; the icon hidden from assistive technology; never focusable.
- Text contrast of at least 4.5:1 for every intent and appearance on the system surfaces, in the 18 brand, appearance and density contexts.
- The full label kept in the document when it is shortened, and a visible edge in forced colors.

The integration provides:

- A label that carries the meaning without the color, and distinct words for distinct statuses.
- A status message (live region) when a change must be announced.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                        |
| ------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)             | A     | Component (the icon is decorative)                    |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Integration (placement next to the item it describes) |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Component (required label), integration (wording)     |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces                     |
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)                       | AA    | Component                                             |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration                                           |

Validated by automated checks in Chromium (accessible text, axe-core in light and dark, geometry, forced colors, contrast in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
