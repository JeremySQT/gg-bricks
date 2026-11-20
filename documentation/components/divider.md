# Divider

## Overview

A divider separates two groups of content with a thin line: two sections of a settings panel, two ways to sign in around an “Or”, the items of a line of metadata. It is horizontal, or vertical between items laid out in a row, and a horizontal divider can carry a short centered label.

## Anatomy

| #   | Part  | Required | Role                                                                                                    |
| --- | ----- | -------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Line  | yes      | A thin line; a horizontal divider spans the width it is given, a vertical one the height of its row.    |
| 2   | Label | no       | Horizontal only: short plain text (Or, Today) on one line, centered, with the line drawn on both sides. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/divider.json`.

## When to use

- Between two sections of a panel, a card or a form whose content does not already show the break.
- Between groups of items laid out in a row: metadata on one line, groups of buttons, links in a footer.
- A labeled break between two blocks: “Or” between two ways to do the same thing, a date in a feed.

## When not to use

- Space between blocks: the gap of the layout, or a container edge (a card or a panel), is often enough on its own.
- The start of a new section: a heading names it, which a line cannot do.
- Separators inside a Menu or a Toolbar: MenuSeparator and ToolbarSeparator.
- The rows and columns of tabular data: Table, which draws its own lines.
- A handle to resize two panes: not built in; the divider is never interactive.

## Best practices

| Guidance | Topic      | Practice                                                                                                                    |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| Do       | Spacing    | Set the space around a divider with the gap of the layout that holds it: the divider adds no margin of its own.             |
| Do       | Layout     | Place a horizontal divider in a column or a block and a vertical one in a row: each stretches along its container.          |
| Do       | Label      | Keep the label to one or two words (Or, Today): it stays on one line and is never wrapped or shortened.                     |
| Do       | Decorative | Set `decorative` when the line only repeats a structure the content already gives, such as the items of a line of metadata. |
| Do       | Text       | Give a vertical divider in running text some space on each side yourself (a margin): text has no gap.                       |
| Don't    | Overuse    | Draw a divider between every block: space alone separates most groups, and many lines make a page heavy.                    |
| Don't    | Headings   | Use a labeled divider as a section title: a heading names the section for every reader.                                     |
| Don't    | Decorative | Make a labeled divider decorative when its label carries information (Today): it would be hidden from assistive technology. |
| Don't    | Vertical   | Give a vertical divider a label: it is ignored.                                                                             |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/divider/App.svelte`, not shipped in the package).

### Between two sections

The column's gap sets the space on both sides of the line.

```svelte live
<script lang="ts">
  import { Divider } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 28rem">
  <div>
    <p style="margin: 0; font: var(--ggb-typography-label-md)">Profile</p>
    <p style="margin: 0; color: var(--ggb-color-content-secondary)">Name, photo and bio.</p>
  </div>
  <Divider />
  <div>
    <p style="margin: 0; font: var(--ggb-typography-label-md)">Notifications</p>
    <p style="margin: 0; color: var(--ggb-color-content-secondary)">Email and push preferences.</p>
  </div>
</div>
```

### A labeled break

The label names the separator for assistive technology.

```svelte live
<script lang="ts">
  import { Button, Divider } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 20rem">
  <Button intent="neutral" appearance="outline" label="Continue with Google" />
  <Divider label="Or" />
  <Button label="Continue with email" />
</div>
```

### Vertical, in a row

In a row, the vertical divider takes the height of the row. Between groups of buttons it stays a separator; between items of metadata it is decorative.

```svelte live
<script lang="ts">
  import { Badge, Button, Divider } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
  <div style="display: flex; align-items: center; gap: var(--ggb-space-content-sm)">
    <Button size="sm" appearance="outline" intent="neutral" label="Bold" />
    <Button size="sm" appearance="outline" intent="neutral" label="Italic" />
    <Divider orientation="vertical" />
    <Button size="sm" appearance="outline" intent="neutral" label="Link" />
  </div>
  <div
    style="display: flex; align-items: center; gap: var(--ggb-space-content-sm); font: var(--ggb-typography-body-sm); color: var(--ggb-color-content-secondary)"
  >
    <span>Updated 2 days ago</span>
    <Divider orientation="vertical" decorative />
    <span>12 comments</span>
    <Divider orientation="vertical" decorative />
    <Badge size="sm" intent="success" label="Published" />
  </div>
</div>
```

### Vertical, in running text

Without a row, the divider spans the line of text; the margin on each side comes from the integration.

```svelte live
<script lang="ts">
  import { Divider } from '@ggbrick/svelte';
</script>

<p style="margin: 0">
  <a href="#fragments">Docs</a>
  <Divider orientation="vertical" decorative style="margin-inline: var(--ggb-space-content-sm)" />
  <a href="#fragments">Changelog</a>
  <Divider orientation="vertical" decorative style="margin-inline: var(--ggb-space-content-sm)" />
  <a href="#fragments">Support</a>
</p>
```

### Difficult cases

- A label set on a vertical divider is ignored, and a divider switched to decorative loses its role and its name (`#playground`).
- A date separator (Today) in a feed, and a labeled break between two full-width buttons (`#horizontal`).
- A vertical divider stretched to a row of buttons, beside a Badge in a line of metadata, and in running text where it spans the line (`#vertical`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Divider } from '@ggbrick/svelte';
import type { DividerProps, DividerOrientation } from '@ggbrick/svelte';
```

Built on the Bits UI Separator. Renders one `<div class="ggb-divider">` (plus any class you pass) with `data-orientation`, `aria-orientation` and `role="separator"`; with `decorative`, `role="none"` and `aria-hidden="true"` instead. A horizontal divider with a label adds `data-labelled`, carries the label as `aria-label` (unless decorative) and holds it in a `<span class="ggb-divider__label" aria-hidden="true">`; the line on each side is drawn by the root's `::before` and `::after`. The line is a border of the root.

| Prop          | Type                                | Default        | Description                                                                     |
| ------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`        | `'horizontal'` | Horizontal spans the width it is given; vertical, the height of its row.        |
| `label`       | `string`                            | —              | Short text centered on a horizontal line, trimmed; blank or vertical: no label. |
| `decorative`  | `boolean`                           | `false`        | Hides the divider from assistive technology.                                    |
| `ref`         | `HTMLDivElement \| null` (bindable) | `null`         | The rendered element.                                                           |
| `class`       | `string`                            | —              | Merged with `ggb-divider`.                                                      |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `style`, `data-*`…) is forwarded to the root, except those the component owns: `children`, `role` and `tabindex`; the component also sets `aria-label` from `label`. There are no snippets and no events. The thickness (1 px by default) and the colors apply through the tokens, so a brand can change every divider at once; appearance and density need no prop. The platform-independent contract ships as `contracts/divider.json`.

## Accessibility

The component provides:

- A separator with its orientation, named by its label when one is shown; with `decorative`, a line hidden from assistive technology.
- Never focusable, no events, no state.
- Label contrast of at least 4.5:1 on the default and subtle surfaces in the 18 brand, appearance and density contexts; the line and the label in the system text color in forced colors.

The integration provides:

- The choice of `decorative` for a line that only repeats the structure, and a heading for each section that needs a name.
- A structure that does not depend on the line alone: the line is subtle, and space or headings carry the grouping.
- The space around the divider, and contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                  |
| ------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (separator or hidden), integration (choice, headings) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component (the label), on the system surfaces                   |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Integration (the grouping must not rely on the line alone)      |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                       |

Validated by automated checks in Chromium (role, orientation and name, decorative hidden, a vertical label ignored, never focusable, line and label against the tokens and the stretch of a vertical divider, forced colors, axe-core in light and dark, phone width), server-rendering checks, and label contrast in the 18 contexts; no assistive-technology test yet. This list is not a conformance claim.
