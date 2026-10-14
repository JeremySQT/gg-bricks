# Counter

## Overview

A counter shows a quantity next to the thing it counts: unread messages after a tab label, items in a list header, selected rows beside an action. It is a small rectangle with the number inside, drawn in the color of the surrounding text on a faint tint of that same color, so it reads as part of its context, whether that is a line of text, a navigation item or a solid button.

Above a maximum (99 by default) the counter shows the maximum followed by a plus sign rather than the exact number, keeps the same height whether it holds one digit or two, and uses tabular figures so that counters of the same size line up. It comes in three sizes named like the Button sizes, so a host passes its own size through.

## When to use

Use a counter whenever a quantity accompanies an item and the user reads it at a glance.

- After a tab label, a navigation item or a list header (“Inbox 8”, “Selected rows 42”), with an accessible label that gives the number its meaning.
- In the trailing slot of a Button, where it takes the button's size and content color.
- For large quantities that only need a magnitude: capped at a maximum and shown as an overflow (99+, or 999+ with a raised maximum).
- For zero, when showing an empty quantity is meaningful (“0 selected rows”); hiding the counter when it is empty is the integration's choice.

## When not to use

- A status or a category in words (“Draft”, “New”): use Badge (planned).
- Free text, units or formatted amounts (“12 kB”, “€ 4.50”): plain text or a data field.
- A dot that only signals “something new” without a number: Badge (planned) or a later indicator.
- Editing a quantity: a number input (NumberInput, planned); the counter is display only.
- A quantity that changes live and must be announced: the counter does not announce its changes; the integration owns the live region.
- A colored emphasis (an accent or a danger counter): not available in this version; the counter has one treatment, the inherited color.

## Anatomy

The annotated anatomy lives on the Figma specification page of the component (frame “Counter — Specification”, `foundations/components/content/counter/figma-spec.md` gives the links; a capture is kept in `reports/components/counter/figma/specification.png`). Text equivalent, from the outside in:

| #   | Part      | Required | Role                                                                                                                                                                                                                                                           |
| --- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Container | yes      | The box the host places: as tall as the line box of its typography, at least as wide as it is tall, with a side padding that follows the density and small rounded corners (a rectangle, not a pill). Its only paint is the tint; nothing is drawn outside it. |
| 2   | Value     | yes      | The digits, centered on their cap height, in the indicator typography of the size with tabular figures. Shows the quantity, or the maximum followed by “+” when the quantity exceeds it.                                                                       |
| 3   | Tint      | yes      | The whole box filled with the color of the digits at 12 % opacity: a faint shade of its surroundings on any background. In forced-colors mode, where the tint cannot be painted, a thin edge in the system text color keeps the box visible.                   |

The dimension lines of the specification board show A, the side padding (2, 4 or 6 px with the density), B, the height (the line box of the digits) and C, the minimum width, equal to the height, so that a single digit sits in a square at compact and standard density.

The accessible label is not a visual part: it is read after the digits and never shown.

## Usage guidelines

**Give the number a meaning.** A lone “8” says nothing to a screen reader user. Next to a visible label (“Inbox 8”) the reading order already gives the meaning; elsewhere pass `label` so that the accessible text becomes a phrase (“8 unread messages”). The label is read after the visible text and is never displayed.

**Maximum.** Keep the default maximum of 99 for notification-style counts: the exact number stops mattering past two digits and the box stays narrow. Raise `max` when the exact quantity matters longer (a count of results up to 999); the overflow text is then “999+”. The exact value is never shown once the maximum is exceeded.

**Zero.** The counter shows 0 when asked; it never hides itself. Decide in the integration whether an empty quantity is information (“0 selected”) or noise (“0 unread”), and render the counter conditionally in the second case.

**Size.** Use the size of the host: `sm` beside small labels and in sm Buttons, `md` by default, `lg` with large labels. Inside a Button pass the button's size unchanged; the typography of the counter is one step below the host's label at each size.

**Color.** The counter has no color option: digits and tint take the text color of the context. Put it where that color is right (the row, the tab, the button) rather than wrapping it in a color of its own. Inside a Button the button's content color applies in every intent, appearance and state, and the button hides the counter from assistive technology: repeat the quantity in the label or elsewhere when it matters.

**Not interactive.** A counter never receives focus and emits no events; it changes nothing when its host is hovered, pressed, loading or disabled beyond inheriting the host's content color.

Do: `Inbox <Counter value={8} label="unread messages" />` after the tab label.
Don't: `<Counter value={n} />` alone in a cell with no visible label and no `label`.

## Examples

The verified source of every example is `examples/counter/App.svelte`, the review page of the component (`npm run build && npm run build:preview counter` produces a self-contained page).

### The usual case

```svelte
<script lang="ts">
  import { Counter } from '@ggbrick/svelte';
</script>

<a href="/inbox">Inbox <Counter value={8} label="unread messages" /></a>
```

### Overflow and maximum

```svelte
<Counter value={100} />
<!-- shows 99+ -->
<Counter value={1234} max={999} />
<!-- shows 999+ -->
<Counter value={1234} max={9999} />
<!-- shows 1,234 in an English locale -->
```

### Sizes next to text

```svelte
<span class="label-sm">Drafts <Counter size="sm" value={3} /></span>
<span class="label-md">Notifications <Counter value={99} /></span>
<span class="label-lg">Archive <Counter size="lg" value={42} /></span>
```

### Inside a Button

The counter takes the button's size and content color. Repeat the quantity where assistive technology can read it: the button hides its trailing content.

```svelte
{#snippet inboxCount()}<Counter value={8} size="md" />{/snippet}

<Button label="Inbox" intent="neutral" appearance="ghost" trailing={inboxCount} />
```

### Values that are not clean integers

A fractional value is rounded down, a negative value shows 0, and a value that is not a number shows 0.

```svelte
<Counter value={7.9} />
<!-- 7 -->
<Counter value={-5} />
<!-- 0 -->
```

### Difficult cases

- A long number in a narrow container overflows the container rather than wrapping or shrinking (`#constrained` on the review page).
- A counter in a right-to-left paragraph follows the writing direction of its context (`#rtl`).
- Counters with the same number of digits have the same width (tabular figures: 11 and 88, 10 and 99 on the review page).

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

The platform-independent options and rules are in `foundations/components/content/counter/contract.json`; the Figma master exposes Size and Overflow as variants and the digits as text properties.

Visual tokens: `typography.indicator.{size}`, `radius.indicator`, `space.content.xs` (side padding), `opacity.tint` (the tint) and `border.width.default` (the forced-colors edge), so brands, appearances and densities apply without any prop.

## Accessibility

What the component guarantees:

- The accessible text is the visible text, followed by `label` when it is set, read as one phrase (“99+ unread messages”); the visible and announced numbers always agree.
- No role, no name of its own and no place in the tab order: a counter is text, so it never traps focus and never competes with its host's name.
- The digits keep the contrast of the surrounding text, in every brand, appearance and density; the tint is 12 % of that same color and carries no information.
- In forced-colors mode the box stays visible through a thin edge in the system text color (CanvasText standalone, ButtonText in a Button, GrayText in a disabled Button).
- Digits are never wrapped or truncated; the number stays legible at 200 % zoom and in a narrow container.

What the integration must provide:

- The meaning of the number: a visible label before the counter or the `label` prop.
- Inside a Button, the quantity in another accessible form: the Button hides its trailing content from assistive technology, so a counter there is decorative.
- Announcements when the quantity changes and the user should know (an `aria-live` region in the page); the counter is silent.
- Contrast between the surrounding text and its background: the counter inherits it.

Relevant WCAG 2.2 success criteria:

| Criterion                                                                                               | Level | Relevance                                                                                                     | Responsibility                                                          |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | The number and its meaning read as one phrase; the relationship to the labelled item is in the reading order. | Component (label phrase); integration (placement)                       |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | The digits inherit the text color of the context; the tint lowers no contrast of its own.                     | Integration (context color), component keeps full opacity on the digits |
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)                       | AA    | The counter scales with its typography and never truncates.                                                   | Component                                                               |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | A counter overflows a too-narrow container rather than hiding digits; layouts must give it room.              | Integration                                                             |
| [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)                    | AA    | Letter spacing and line height overrides do not clip the digits (the box grows with the line box).            | Component                                                               |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Plain text content with no role; the value is the text itself.                                                | Component                                                               |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | A changing quantity that must be announced needs a live region.                                               | Integration                                                             |

Validation status: automated checks only, in Chromium: the accessible text read from the browser's accessibility tree, axe-core on the review page in light and dark appearances (0 violations), geometry and ink centering, the inherited color inside every Button intent, appearance and state, forced colors, computed values in the 18 brand × appearance × density contexts (`tests/browser/counter.spec.ts`, `reports/components/counter/`). No assistive-technology test has been run yet; listing these criteria is not a conformance claim.
