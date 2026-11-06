# ButtonGroup

## Overview

A button group places related actions together with one size and one spacing: the footer of a dialog, the actions under a form, the follow-up actions of an alert or of a card. When its line does not fit the space available, it stacks its buttons at full width, without ever changing their order.

## Anatomy

| #   | Part  | Required | Role                                                                                                                    |
| --- | ----- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Items | yes      | The Buttons and IconButtons of the group in source order, one at least; the order is the priority and is never changed. |
| 2   | Item  | yes      | One Button or IconButton; it takes the size of the group, whatever its own size. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/button-group.json`.

## When to use

- The actions of a dialog footer or of a form, aligned at the end with the primary action last.
- The follow-up actions of an Alert, of a card or of a page header.
- Actions that must share one height, such as a Button next to an IconButton.
- Actions that must stack at full width on a narrow screen rather than overflow.

## When not to use

- A set of controls acting on one object, with one tab stop and arrow keys: Toolbar (planned).
- Attached buttons for a single choice among options: SegmentedControl (planned).
- More actions than the space holds, behind a trigger: Menu, composed next to the group.
- A single action on its own: Button.
- A footer split between a destructive action at the start and the others at the end: two groups placed by your layout.

## Best practices

| Guidance | Topic     | Practice                                                                                                                        |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Order     | Write the items in reading order of priority; in a dialog footer, end-aligned, put the primary action last.                     |
| Do       | Hierarchy | Keep one solid accent Button per group and give the others neutral outline or ghost treatments.                                 |
| Do       | Size      | Set `size` on the group only: it applies to every item, so that they all share one height.                                      |
| Do       | Label     | Pass `label` when the group needs a name of its own (“Text formatting”); otherwise the buttons are read as ordinary buttons.    |
| Do       | Split     | Build a split footer from two groups in a layout, so that the reading order stays explicit.                                     |
| Do       | Disabled  | Disable each action on its own; the group has no disabled state.                                                                |
| Don't    | Size      | Give an item its own size inside a group: it is ignored.                                                                        |
| Don't    | Order     | Rely on the alignment to change the order of the actions: start, center, end and stacking never reorder them.                   |
| Don't    | Content   | Put anything but Buttons and IconButtons in the group, or wrap them in other elements: each item is laid out as a direct child. |
| Don't    | Toggles   | Use a group of buttons for a choice that stays selected; that is a SegmentedControl (planned).                                  |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/button-group/App.svelte`, not shipped in the package).

### A dialog footer

The group is aligned at the end of its container, the primary action last.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup } from '@ggbrick/svelte';

  // Stand in for the application's actions.
  function cancel() {}
  function remove() {}
</script>

<div style="inline-size: 100%">
  <ButtonGroup align="end">
    <Button label="Cancel" intent="neutral" appearance="outline" onactivate={cancel} />
    <Button label="Delete project" intent="danger" onactivate={remove} />
  </ButtonGroup>
</div>
```

### Size, and an IconButton among the buttons

The group sets the size of every item, the IconButton included, and centers them on one line.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Icon, IconButton } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}

<ButtonGroup size="sm">
  <Button label="Back" intent="neutral" appearance="outline" />
  <Button label="Continue" />
  <IconButton label="Download" icon={download} intent="neutral" appearance="ghost" />
</ButtonGroup>
```

### A named group

With `label`, the group is exposed as a group of that name.

```svelte live
<script lang="ts">
  import { ButtonGroup, Icon, IconButton } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<ButtonGroup size="sm" label="Row actions">
  <IconButton label="Add a row" icon={plus} intent="neutral" appearance="ghost" />
  <IconButton label="Delete the row" icon={trash} intent="danger" appearance="ghost" />
</ButtonGroup>
```

### A split footer

Two groups in a layout: a destructive action at the start, the others at the end.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup } from '@ggbrick/svelte';
</script>

<div
  style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--ggb-space-content-md); inline-size: 100%"
>
  <ButtonGroup>
    <Button label="Remove" intent="danger" appearance="ghost" />
  </ButtonGroup>
  <ButtonGroup align="end">
    <Button label="Cancel" intent="neutral" appearance="outline" />
    <Button label="Save" />
  </ButtonGroup>
</div>
```

### Vertical and stretched

A vertical group gives every Button the full inline size; `align="stretch"` shares the line equally between the items of a horizontal group.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg); inline-size: min(20rem, 100%)">
  <ButtonGroup orientation="vertical">
    <Button label="Continue with Google" intent="neutral" appearance="outline" />
    <Button label="Continue with email" />
  </ButtonGroup>
  <ButtonGroup align="stretch">
    <Button label="Decline" intent="neutral" appearance="outline" />
    <Button label="Accept" />
  </ButtonGroup>
</div>
```

### Difficult cases

- A line that no longer fits its container stacks at full width in source order, and returns to its line when there is room again (`#playground`, container width).
- An item asking for its own size follows the size of the group (`#playground`).
- Every size in both orientations, with an IconButton among the buttons (`#matrix`).
- A dialog footer, a split footer, a named group of IconButtons and a narrow column that stacks (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { ButtonGroup } from '@ggbrick/svelte';
import type { ButtonGroupProps, ButtonGroupSize, ButtonGroupOrientation, ButtonGroupAlign } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-button-group">` (plus any class you pass) with `data-size`, `data-orientation`, `data-align` and, while a horizontal group is stacked, `data-stacked`; with a non-empty `label` it also carries `role="group"` and `aria-label`. The items are its direct children.

| Prop          | Type                                        | Default        | Description                                                                                                                                                       |
| ------------- | ------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`        | `'sm' \| 'md' \| 'lg'`                      | `'md'`         | Size of every Button and IconButton of the group, and of the gap; the items' own size is ignored. In the actions of an Alert the default is `sm`.                 |
| `orientation` | `'horizontal' \| 'vertical'`                | `'horizontal'` | `horizontal`: one line, which stacks when it does not fit. `vertical`: one item per line, every Button at full width, an IconButton square at the inline start.   |
| `align`       | `'start' \| 'center' \| 'end' \| 'stretch'` | `'start'`      | Horizontal groups: places the line at the start, the center or the end, or shares the inline size equally between the items (`stretch`). No effect when vertical. |
| `label`       | `string`                                    | —              | Names the group for assistive technology; without it, or when blank, the group adds no semantics.                                                                 |
| `children`    | `Snippet`                                   | required       | One or more Buttons and IconButtons, in priority reading order.                                                                                                   |
| `ref`         | `HTMLDivElement \| null` (bindable)         | `null`         | The group element.                                                                                                                                                |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `class`, `style`, `aria-describedby`…) goes to the group element, except those the component owns: `children`, `role` and `aria-label`. The group emits no event; each item keeps its own `onactivate`. The size reaches the items through Svelte context: a Popover, Dialog, Menu or Alert declared inside a group does not pass it to the buttons of its own content. A horizontal group measures its items with a `ResizeObserver` to decide when to stack; nothing is measured on the server. The platform-independent contract ships as `contracts/button-group.json`.

## Accessibility

The component provides:

- Every enabled item as its own Tab stop, in source order; the group adds no arrow-key navigation and never reorders its items, whatever the alignment or the stacking.
- `role="group"` named by `label` when one is given; otherwise the items are read as ordinary buttons.
- Stacking at full width instead of overflowing when the line does not fit.
- One size for every item, so that each keeps the minimum interaction target and the focus ring of its own component.

The integration provides:

- An order that matches the priority of the actions, and a meaningful label on each item.
- A `label` when the group needs a name of its own, for example a set of IconButtons acting on one row.
- A visible reason for each disabled action.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                       |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (named group), integration (the label)     |
| [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)       | A     | Component (never reordered), integration (the order) |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (a line that does not fit stacks)          |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component, through Button and IconButton             |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (source order)                             |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component, through Button and IconButton             |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (group), integration (each item's label)   |

Validated by automated checks in Chromium (axe-core in light and dark, desktop and mobile, tab order without arrow-key navigation, group name only with a label, the group size on every item, alignment, stacking and return to the line in a narrow container, computed gap and item heights in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
