# Counter

## Overview

A counter shows a quantity next to the thing it counts: unread messages after a tab label, items in a list header, selected rows beside an action. It is a small box in the color of the surrounding text on a faint tint of that color, and shows “99+” above its maximum.

## When to use

- After a tab label, a navigation item or a list header (“Inbox 8”).
- In the trailing slot of a Button.
- For a large quantity where only the magnitude matters (99+, or 999+ with a raised maximum).

## When not to use

- A status or a category in words (“Draft”, “New”): Badge (planned).
- Free text, units or amounts (“12 kB”, “€ 4.50”): plain text.
- A dot that only signals something new: Badge (planned).
- Editing a quantity: NumberInput (planned).
- A colored emphasis (accent, danger): not available; the counter takes the color of its context.

## Anatomy

| #   | Part      | Required | Role                                                                                              |
| --- | --------- | -------- | ------------------------------------------------------------------------------------------------- |
| 1   | Container | yes      | The box: as tall as the line of digits, at least as wide as it is tall, slightly rounded corners. |
| 2   | Value     | yes      | The digits, centered, with tabular figures; the maximum followed by “+” above the maximum.        |
| 3   | Tint      | yes      | The box filled with the color of the digits at 12 % opacity.                                      |

A side padding (2, 4 or 6 px with the density), B height (the line box of the digits), C minimum width, equal to the height.

## Do and don't

### Meaning

- **Do** place the counter after a visible label (“Inbox 8”), or pass `label` so that screen readers hear a phrase (“8 unread messages”).
- **Don't** show a lone counter with neither a visible label nor `label`.

### Maximum and zero

- **Do** keep the default maximum of 99 for notification counts; raise `max` when the exact number matters longer (999).
- **Do** decide in your code whether zero is useful (“0 selected”) or noise (“0 unread”): the counter shows 0 when asked and never hides itself.

### Size and color

- **Do** use the size of the host: `sm` beside small labels and in `sm` buttons, `md` by default, `lg` with large labels.
- **Don't** wrap a counter in a color of its own: it takes the text color of its context, which is why it works in every button.

### Inside a Button

- **Do** repeat the quantity elsewhere when it matters: the Button hides its trailing content from screen readers.
- **Don't** expect a counter to announce changes: add a live region in the page if the user must be told.

## Examples

The review page `examples/counter/App.svelte` covers every case.

### The usual case

```svelte live
<script lang="ts">
  import { Counter } from '@ggbrick/svelte';
</script>

<a href="#inbox">Inbox <Counter value={8} label="unread messages" /></a>
```

### Overflow and maximum

```svelte live
<Counter value={100} />
<!-- shows 99+ -->
<Counter value={1234} max={999} />
<!-- shows 999+ -->
<Counter value={1234} max={9999} />
<!-- shows 1,234 in an English locale -->
```

### Sizes next to text

Each counter takes the size of the label it follows.

```svelte live
<span style="font: var(--ggb-typography-label-sm)">Drafts <Counter size="sm" value={3} /></span>
<span style="font: var(--ggb-typography-label-md)">Notifications <Counter value={99} /></span>
<span style="font: var(--ggb-typography-label-lg)">Archive <Counter size="lg" value={42} /></span>
```

### Inside a Button

The counter takes the button's size and content color. Repeat the quantity where assistive technology can read it: the button hides its trailing content.

```svelte live
{#snippet inboxCount()}<Counter value={8} size="md" />{/snippet}

<Button label="Inbox" intent="neutral" appearance="ghost" trailing={inboxCount} />
```

### Values that are not clean integers

A fractional value is rounded down, a negative value shows 0, and a value that is not a number shows 0.

```svelte live
<Counter value={7.9} />
<!-- 7 -->
<Counter value={-5} />
<!-- 0 -->
```

### Difficult cases

- A long number in a narrow container overflows it rather than wrapping or shrinking.
- Counters with the same number of digits have the same width (tabular figures).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Counter } from '@ggbrick/svelte';
import type { CounterProps, CounterSize } from '@ggbrick/svelte';
```

Renders a `<span>` that is the container, holding a `<span class="ggb-counter__value">` with the digits and, when `label` is set, a visually hidden `<span class="ggb-counter__label">`. The root carries `class="ggb-counter"` plus any class you pass, `data-size`, and `data-overflow` while the value exceeds the maximum. No role, no `aria-*`, no `tabindex`.

| Prop    | Type                                 | Default | Description                                                                                                                                      |
| ------- | ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value` | `number`                             | `0`     | Quantity shown. Rounded down to an integer; a negative or non-finite value shows 0. Digits are grouped by the runtime's locale.                  |
| `max`   | `number`                             | `99`    | Largest quantity shown exactly; above it the counter shows `max` followed by “+”. Rounded down and kept at least 1; a non-finite value means 99. |
| `size`  | `'sm' \| 'md' \| 'lg'`               | `'md'`  | Typography, padding and corner radius step, named like the Button sizes.                                                                         |
| `label` | `string`                             | —       | Meaning of the number for assistive technology, read after the visible text (“8 unread messages”). Never displayed.                              |
| `ref`   | `HTMLSpanElement \| null` (bindable) | `null`  | The rendered element.                                                                                                                            |
| `class` | `string`                             | —       | Merged with `ggb-counter`.                                                                                                                       |

Every other attribute of `HTMLAttributes<HTMLSpanElement>` is forwarded to the element, except those the component owns: `children`, `role` and `tabindex`. There are no events.

Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/counter.json`.

## Accessibility

The component provides:

- Accessible text made of the visible digits followed by `label` (“99+ unread messages”); no role, never focusable.
- The digits in the text color of the context; in forced colors a thin edge keeps the box visible.
- Digits never wrapped or truncated, legible at 200 % zoom.

The integration provides:

- The meaning of the number: a visible label before it, or `label`.
- The quantity in another accessible form inside a Button, and a live region when changes must be announced.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                    |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (label phrase), integration (placement) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Integration (the counter inherits the text color) |
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)                       | AA    | Component                                         |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Integration (give it room)                        |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                         |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration                                       |

Validated by automated checks in Chromium (accessible text, axe-core in light and dark, geometry, forced colors, the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
