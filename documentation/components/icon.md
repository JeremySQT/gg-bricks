# Icon

## Overview

An icon shows a small one-color drawing from your icon set at one of five sizes, in the color of the text around it. It gives a visual cue next to a label or in a button, or carries a meaning on its own when it has a label.

## Anatomy

| #   | Part  | Required | Role                                                                                                                                    |
| --- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Box   | yes      | A square of the chosen size (12, 16, 20, 24 or 32 px) that never shrinks or stretches, centered on the capitals of the text next to it. |
| 2   | Glyph | yes      | The drawing you supply, in one color (`currentColor`), inset by one eighth of the box as in Phosphor Icons.                             |

A is the inset, B the box size. Hosts rely on the inset: a Button places an icon by its drawing, not by its box.

## When to use

- Next to the text of a menu item, a list row, a navigation entry or a hint.
- In the leading or trailing slot of a Button.
- Alone, with a `label`, when the icon is the only carrier of a meaning: “Paid”, “Attention needed”.

## When not to use

- An action without visible text: IconButton.
- Multi-color artwork, logos, photographs; avatars: Avatar (planned).
- A loading indicator: Spinner; Button and IconButton show it with `loading`.
- A status or a category in words: Badge.
- Icon fonts and sprite sheets: the component takes inline vector content.

## Best practices

| Guidance | Topic       | Practice                                                                                                                                        |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Decorative  | Leave `label` out when the text next to the icon says the same thing: screen readers skip the icon.                                             |
| Do       | Named       | Give a `label` when the icon carries the meaning alone, written as the meaning (“Paid”), not the drawing (“check mark”).                        |
| Do       | Color       | Set the color on the surrounding text, the row or the host: the icon follows it.                                                                |
| Do       | Size        | Match the text next to it: `sm` beside body text and labels, `xs` beside captions, `md` by default, `lg` and `xl` for headers and empty states. |
| Do       | Icon set    | Use one set, one weight and one grid across the product; pass `viewBox` for a set drawn on another grid.                                        |
| Don't    | Named       | Label an icon that repeats the visible text: it is read twice.                                                                                  |
| Don't    | Color       | Color an icon on its own, or let color be the only way a status is conveyed.                                                                    |
| Don't    | Size        | Set a size inside a Button slot: the button sizes the icon.                                                                                     |
| Don't    | Interaction | Make an icon clickable: it never receives focus. Put it in a Button.                                                                            |

## Examples

Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set. Every case is exercised on the component's review page in the ggbrick repository (`examples/icon/App.svelte`, not shipped in the package).

### A decorative icon next to text

The drawing is the content of the component; a snippet keeps it reusable.

```svelte live
<script lang="ts">
  import { Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet glyph(id: string)}<path d={phosphor[id]} />{/snippet}

<ul>
  <li><Icon size="sm">{@render glyph('check')}</Icon> Changes saved</li>
  <li><Icon size="sm">{@render glyph('trash')}</Icon> Move to trash</li>
</ul>
```

### A named icon on its own

With `label`, the icon is an image with that accessible name.

```svelte live
<script lang="ts">
  import { Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet glyph(id: string)}<path d={phosphor[id]} />{/snippet}

<table>
  <tbody>
    <tr>
      <th scope="row">Invoice 1042</th>
      <td><Icon size="sm" label="Paid">{@render glyph('check')}</Icon></td>
    </tr>
    <tr>
      <th scope="row">Invoice 1043</th>
      <td><Icon size="sm" label="Attention needed">{@render glyph('warning-circle')}</Icon></td>
    </tr>
  </tbody>
</table>
```

### Sizes

```svelte live
<script lang="ts">
  import { Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

<Icon size="xs"><path d={phosphor.plus} /></Icon>
<Icon size="sm"><path d={phosphor.plus} /></Icon>
<Icon><path d={phosphor.plus} /></Icon>
<Icon size="lg"><path d={phosphor.plus} /></Icon>
<Icon size="xl"><path d={phosphor.plus} /></Icon>
```

### Inside a Button

The button sizes the icon and places it against the label; the `size` option is not needed.

```svelte live
<script lang="ts">
  import { Button, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet arrow()}<Icon><path d={phosphor['arrow-right']} /></Icon>{/snippet}

<Button label="New project" leading={plus} />
<Button label="Continue" intent="neutral" appearance="outline" trailing={arrow} />
```

### Another grid

A glyph drawn on a 24-unit grid passes its own `viewBox`.

```svelte live
<Icon size="lg" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" /></Icon>
```

### Difficult cases

- In a flex row that runs out of room the box keeps its size; the text wraps instead.
- A glyph from a set with another inset renders at the right size but sits off the optical spacing a host assumes.

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

The size reads `size.icon.{size}`; color comes from the context. The platform-independent contract ships as `contracts/icon.json`.

## Accessibility

The component provides:

- Without `label`: hidden from assistive technology (`aria-hidden`) and never focusable.
- With `label`: `role="img"` and the label as accessible name.
- The text color of its context, so the icon keeps that contrast and follows forced colors.

The integration provides:

- The choice between decorative and named, and a label written as the meaning.
- Text next to a decorative icon that carries the information, with enough contrast.

| WCAG 2.2 criterion                                                                                        | Level | Responsibility                                                       |
| --------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)               | A     | Component exposes or hides; integration decides and writes the label |
| [1.3.3 Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html) | A     | Integration (no “click the arrow icon”)                              |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                       | A     | Integration                                                          |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)            | AA    | Integration (inherited color; system content colors meet it)         |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)               | A     | Component                                                            |

Validated by automated checks in Chromium (axe-core in light and dark, accessibility tree, sizes in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
