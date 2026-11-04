# IconButton

## Overview

An icon button starts an action from a compact square that shows only an icon: close a panel, edit a row, open settings, copy a value. Its name is never shown but always read by assistive technology, and it matches a Button of the same size beside it.

## Anatomy

| #   | Part              | Required | Role                                                                                                  |
| --- | ----------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Target            | yes      | The area that reacts to clicks, taps and keys: at least 44 × 44 px, centered, taking no layout space. |
| 2   | Container         | yes      | The visible square: background, border (outline only), corner radius; as tall as a Button.            |
| 3   | Icon              | yes      | One decorative icon, centered by its box at the icon size of the button; the button sets its size.    |
| 4   | Focus ring        | state    | Drawn outside the container on keyboard focus.                                                        |
| —   | Loading indicator | state    | Replaces the icon at the same place and size while `loading` is set.                                  |
| —   | Label             | yes      | The accessible name; never drawn.                                                                     |

A side of the square (the Button height of the size, following the density: 32, 40 or 48 px in standard density), B icon size (16, 20 or 24 px in every density).

## When to use

- Toolbars, table rows and card headers where a well-known icon is enough: close, more, edit, delete, copy, search.
- Dense layouts beside Buttons of the same size, with the same treatments.
- Navigation to a task from an icon alone, with `href`.

## When not to use

- When there is room for a visible label: Button with a leading icon is always clearer.
- A link inside text: Link.
- A toggle that stays pressed (bold, mute): SegmentedControl (planned).
- A list of actions behind one trigger: Menu, with the icon button as its trigger.
- A visible hint on hover: wrap it in a Tooltip; the icon button does not show its label.
- A dot or a number over the icon: a later indicator (planned).

## Best practices

| Guidance | Topic     | Practice                                                                                                                       |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Do       | Label     | Name the action, not the icon: “Delete invoice”, not “Trash”; screen readers announce only the label.                          |
| Do       | Icon      | Use icons people recognize without a caption (close, search, more, edit), and the same icon for the same action everywhere.    |
| Do       | Hierarchy | Keep the default neutral ghost in toolbars and rows; use solid or outline only for the main action of a compact area.          |
| Do       | Size      | Use the size of the Buttons and controls in the same row, so that they line up at the same height.                             |
| Do       | Spacing   | Space neighbors with `space.control.gap` of their size, as for buttons; the 44 px target overlaps the gap without taking room. |
| Do       | Loading   | Set `loading` while the action runs: the button keeps its focus and ignores presses.                                           |
| Don't    | Label     | Leave the label empty or repeat the icon name: the label is the only name of the button.                                       |
| Don't    | Meaning   | Use an icon button for a rare or ambiguous action: give it a visible label with Button.                                        |
| Don't    | Tooltip   | Rely on the native `title` attribute as a hint: it is not shown on touch or keyboard focus; compose a tooltip.                 |
| Don't    | Disabled  | Disable without a visible reason nearby, or add `disabled` to a loading button: it can no longer be reached by keyboard.       |

## Examples

Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set. Every case is exercised on the component's review page in the ggbrick repository (`examples/icon-button/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { IconButton, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  // Stands in for the application's action.
  function remove() {}
</script>

{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<IconButton label="Delete invoice" icon={trash} onactivate={remove} />
```

### Intent, appearance and size

The treatments are those of Button; the square is as tall as a Button of the same size.

```svelte live
<script lang="ts">
  import { Button, IconButton, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<IconButton label="Add item" icon={plus} intent="accent" appearance="solid" />
<IconButton label="Add item" icon={plus} appearance="outline" />
<IconButton label="Delete" icon={trash} intent="danger" />
<IconButton size="sm" label="Add item" icon={plus} />
<IconButton size="lg" label="Add item" icon={plus} />
<Button size="lg" label="Create" />
```

### A row of actions

Neighbors are spaced with `space.control.gap` of their size.

```svelte live
<script lang="ts">
  import { IconButton, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<div style="display: flex; gap: var(--ggb-space-control-gap-sm)">
  <IconButton size="sm" label="Download report" icon={download} />
  <IconButton size="sm" label="Delete report" icon={trash} intent="danger" />
</div>
```

### Asynchronous action and navigation

`loading` replaces the icon with the indicator and keeps the focus; with `href` the icon button is a link.

```svelte live
<script lang="ts">
  import { IconButton, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  let saving = $state(false);
  function save() {
    saving = true;
    setTimeout(() => (saving = false), 1500);
  }
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<IconButton label="Export" icon={download} loading={saving} onactivate={save} />
<IconButton href="#new-project" label="Create project" icon={plus} appearance="outline" />
```

### Difficult cases

- In compact density, `sm` icon buttons (28 px) sit 4 px apart and their 44 px targets reach 4 px into the neighbor's square; the squares stay above the 24 px minimum (`#alignment` on the review page).
- A disabled icon button with `href` keeps its appearance and loses its destination; a loading one keeps focus and does not navigate (`#states`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Button.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { IconButton } from '@ggbrick/svelte';
import type {
  IconButtonProps,
  IconButtonAsButton,
  IconButtonAsLink,
  IconButtonIntent,
  IconButtonAppearance,
  IconButtonSize
} from '@ggbrick/svelte';
```

Renders a native `<button>` or, when `href` is set, an `<a>`, with `aria-label` set to `label`. The root carries `class="ggb-icon-button"` plus any class you pass, and `data-intent`, `data-appearance`, `data-size`, `data-disabled` and `data-loading`.

| Prop         | Type                                | Default     | Description                                                                                                                                                   |
| ------------ | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`      | `string`                            | required    | Accessible name, never shown. Must be non-empty: an empty or blank label throws, on the server and in the browser.                                            |
| `icon`       | `Snippet`                           | required    | The one icon (an Icon), rendered at the icon size of the button in the current color and hidden from assistive technology; its own `size` is ignored.         |
| `intent`     | `'accent' \| 'neutral' \| 'danger'` | `'neutral'` | What the action means.                                                                                                                                        |
| `appearance` | `'solid' \| 'outline' \| 'ghost'`   | `'ghost'`   | Visual weight.                                                                                                                                                |
| `size`       | `'sm' \| 'md' \| 'lg'`              | `'md'`      | Square and icon size, matching a Button of the same size; the square follows the density.                                                                     |
| `disabled`   | `boolean`                           | `false`     | Not focusable and not activatable (native `disabled` on a button; no `href`, `aria-disabled` and `tabindex="-1"` on a link). Takes precedence over `loading`. |
| `loading`    | `boolean`                           | `false`     | Shows the loading indicator in place of the icon, sets `aria-busy` and `aria-disabled`, keeps the focus, blocks activation and navigation.                    |
| `href`       | `string`                            | —           | Renders a link instead of a button. `type` is then not allowed.                                                                                               |
| `type`       | `'button' \| 'submit' \| 'reset'`   | `'button'`  | Native button type (button only).                                                                                                                             |
| `onactivate` | `(event: MouseEvent) => void`       | —           | Called on click, Enter or Space while neither disabled nor loading. A native `onclick` or `onauxclick` you pass is guarded the same way.                      |
| `ref`        | `HTMLElement \| null` (bindable)    | `null`      | The rendered element.                                                                                                                                         |
| `class`      | `string`                            | —           | Merged with `ggb-icon-button`.                                                                                                                                |

Every other attribute of `HTMLButtonAttributes` (or `HTMLAnchorAttributes` with `href`) is forwarded to the element, except those the component owns: `children`, `href`, `type`, `disabled`, `aria-busy`, `aria-disabled`, `aria-label` and `role`.

`IconButtonProps` is the union of `IconButtonAsButton` and `IconButtonAsLink`; TypeScript rejects `type` together with `href`. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/icon-button.json`.

## Accessibility

The component provides:

- A native `button`, or `a` with `href`: role, keyboard (Enter and Space, Enter for a link) and tab order come from the platform.
- `label` as the accessible name; the icon hidden from assistive technology.
- `loading`: `aria-busy` and `aria-disabled`, focus kept, presses ignored. `disabled`: out of the tab order.
- A visible focus ring on keyboard focus, a 44 × 44 px target in every size, reduced motion and forced colors handled.

The integration provides:

- A label that names the action, and a tooltip when sighted users need the name.
- A visible reason for a disabled button, and a status message when the result of a loading action must be announced.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)                        | A     | Component (name from `label`), integration (a meaningful label)  |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component, on the system surfaces                                |
| [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)     | AA    | Integration (the tooltip it composes)                            |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                        |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)                  | AA    | Integration (descriptive label)                                  |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component                                                        |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Integration (sticky bars, overlays)                              |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (44 px target; compact `sm` neighbors overlap by 4 px) |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                        | A     | Component (`type` defaults to `button`)                          |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                        |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Integration                                                      |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard, accessible name, forced colors, target sizes, contrast in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
