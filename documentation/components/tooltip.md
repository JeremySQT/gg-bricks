# Tooltip

## Overview

A tooltip shows a short text about a control when the user points at it or reaches it with the keyboard: the name of an icon button, the keyboard shortcut of an action, a few words on what a button does. It holds plain text only, never something to press or information the user needs to complete a task.

## Anatomy

| #   | Part    | Required | Role                                                                                                                                                          |
| --- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tooltip | yes      | The bubble in `color.surface.inverse` with `radius.control` corners and no arrow; it hugs its text and wraps at `component.tooltip.max-inline-size` (240 px). |
| 2   | Label   | yes      | Plain text in `typography.caption.md` and `color.content.inverse`; it describes the trigger, unless it repeats the name of an IconButton.                     |
| 3   | Trigger | yes      | Exactly one focusable Button, IconButton or Link; a disabled control shows no tooltip.                                                                        |

A offset: `space.content.xs` between the trigger and the tooltip on the chosen side (2, 4 or 6 px in compact, standard and comfortable density). The bubble's padding is `space.content.sm` inline (4, 8 or 12 px) and `space.content.xs` block (2, 4 or 6 px).

## When to use

- The visible name of an IconButton, shown on hover and on keyboard focus.
- The keyboard shortcut of an action in a toolbar (“Bold (Ctrl+B)”).
- A few words that say what a button or a link does when its label alone is short.

## When not to use

- Links, buttons, a form or any other interactive content: Popover.
- Information the user needs to complete a task, which a tooltip never shows on touch and hides on blur: text on the page, or a Field description next to a form control.
- Help that opens on a press, behind an info button: Popover with an IconButton trigger.
- An explanation of why a control is disabled: visible text next to it, since a disabled control shows no tooltip.
- A message after an action (“Link copied”): Toast.

## Best practices

| Guidance | Topic      | Practice                                                                                                                      |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Do       | Text       | Keep the text to a few words on one or two lines; it wraps at 240 px.                                                         |
| Do       | IconButton | Give the tooltip the same text as the IconButton's label: it shows the name without announcing it twice.                      |
| Do       | Shortcut   | Add a keyboard shortcut after the name (“Bold (Ctrl+B)”), written in the user's platform convention, since the text is plain. |
| Do       | Placement  | Keep the default top and center; choose bottom or another alignment when the trigger sits at the edge of a view.              |
| Don't    | Essential  | Put information needed to complete a task in a tooltip: it never opens on touch and hides when focus leaves.                  |
| Don't    | Content    | Put links, buttons or formatting in a tooltip: it holds plain text; use a Popover.                                            |
| Don't    | Repetition | Repeat a Button's visible label in its tooltip: the text is added as a description and announced twice.                       |
| Don't    | Disabled   | Explain a disabled control with a tooltip: it is not focusable and shows none.                                                |
| Don't    | Trigger    | Wrap several controls, or anything but a Button, an IconButton or a Link, in one tooltip: its first element is the trigger.   |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/tooltip/App.svelte`, not shipped in the package). Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### Naming an icon button

The tooltip shows the IconButton's label; because both say the same thing, it adds no description.

```svelte live
<script lang="ts">
  import { Icon, IconButton, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  // Stands in for the application's action.
  function remove() {}
</script>

{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<Tooltip label="Delete invoice">
  <IconButton label="Delete invoice" icon={trash} onactivate={remove} />
</Tooltip>
```

### A shortcut, a clarification, a link

A text that differs from the trigger's name becomes the trigger's accessible description.

```svelte live
<script lang="ts">
  import { Button, Icon, IconButton, Link, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--ggb-space-content-md)">
  <Tooltip label="New item (Ctrl+N)">
    <IconButton label="New item" icon={plus} />
  </Tooltip>
  <Tooltip label="Saves a copy in your drafts folder">
    <Button label="Save draft" intent="neutral" appearance="outline" />
  </Tooltip>
  <p style="margin: 0">
    Read the <Tooltip label="Opens the API reference"><Link href="#api" label="API" /></Tooltip> first.
  </p>
</div>
```

### Side and alignment

The tooltip takes the preferred side and alignment, and flips when the viewport lacks room.

```svelte live
<script lang="ts">
  import { Icon, IconButton, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}

<Tooltip label="Download the report as a PDF file" side="bottom" align="start">
  <IconButton label="Download report" icon={download} appearance="outline" />
</Tooltip>
```

### Controlled from the application

`bind:open` shows or hides the tooltip from the application, for a guided hint; `onopenchange` reports only what the user does.

```svelte live
<script lang="ts">
  import { Checkbox, Icon, IconButton, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  let open = $state(false);
  let changes = $state(0);
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)">
  <Checkbox label="Show the hint" bind:checked={open} />
  <Tooltip label="Add an item" bind:open onopenchange={() => changes++}>
    <IconButton label="Add an item" icon={plus} appearance="outline" />
  </Tooltip>
  <p style="margin: 0">Opened or closed by the user: {changes}</p>
</div>
```

### Difficult cases

- An IconButton named by the same text gets no description, a Button gets one; the application opens a tooltip without an event (`#playground`).
- A disabled control shows no tooltip; a Link and a keyboard shortcut (`#compositions`).
- Inside a dark subtree and a clipping container, the tooltip takes the dark appearance and escapes the clipping (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5; no Bits UI primitive). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Tooltip } from '@ggbrick/svelte';
import type { TooltipProps, TooltipSide, TooltipAlign } from '@ggbrick/svelte';
```

Renders a `<span class="ggb-tooltip-trigger" role="none">` with `display: contents` around the trigger: it listens to pointer, focus and key events and takes no box of its own. After the trigger, inside it, comes the tooltip, a `<span class="ggb-tooltip ggb-overlay" role="tooltip" popover="manual">` with `id`, `data-side` and `data-align`. The tooltip stays in the DOM next to its trigger and is shown in the browser top layer, without a portal: it inherits the brand, appearance and density of its surroundings and is not clipped by an `overflow` container. It is placed with CSS anchor positioning; where the browser lacks it, it is measured instead and carries `data-positioning="measured"` and `data-placed-side`.

| Prop           | Type                           | Default    | Description                                                                                                                            |
| -------------- | ------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `string`                       | required   | The text of the tooltip, plain text. Must be non-empty: an empty or blank label throws, on the server and in the browser.              |
| `side`         | `'top' \| 'bottom'`            | `'top'`    | Preferred side; the tooltip flips to the other side when the viewport lacks room.                                                      |
| `align`        | `'start' \| 'center' \| 'end'` | `'center'` | Alignment with the start, the center or the end of the trigger.                                                                        |
| `open`         | `boolean` (bindable)           | `false`    | Shown state; bind it with `bind:open`. Setting it from the application shows or hides the tooltip without calling `onopenchange`.      |
| `children`     | `Snippet`                      | required   | Exactly one focusable Button, IconButton or Link: the trigger is the first element the snippet renders.                                |
| `onopenchange` | `(open: boolean) => void`      | —          | Called with the new state when the user opens or closes the tooltip: hover, keyboard focus, Escape, pointer leaving, blur, activation. |
| `id`           | `string`                       | generated  | id of the tooltip element, which the trigger's `aria-describedby` references.                                                          |

The tooltip adds its id to the trigger's `aria-describedby`, after the ids already there, unless the trigger's `aria-label` equals the text, as for an IconButton named by the same words. One tooltip is open at a time on the page: opening one closes the other. No other attribute is accepted: put `class`, ids and handlers on the trigger. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/tooltip.json`.

## Accessibility

Keyboard and pointer:

- Keyboard focus on the trigger opens the tooltip at once; focus given by a pointer press does not open it. A pointer opens it after `component.tooltip.delay` (500 ms), and at once when another tooltip was open a moment before.
- The tooltip stays open while the pointer is on the trigger or on the tooltip, so that magnified text can be read. It closes when the pointer leaves both, when the trigger loses focus, when the trigger is activated (click, Enter, Space) and on Escape, which keeps focus on the trigger. Escape closes only the tooltip: a Popover, Menu or Dialog that holds the trigger stays open until the next Escape.
- On a touch screen a press activates the trigger and never opens the tooltip.

The component provides:

- `role="tooltip"` and the text as the trigger's accessible description, except when it repeats an IconButton's name; the trigger keeps its own name.
- Content that can be pointed at, dismissed with Escape without moving focus, and stays until the user leaves; nothing on the page moves or changes, and focus stays on the trigger.
- The tooltip above every other overlay, including an open dialog, and one tooltip at a time.
- A fade without movement under reduced motion, a visible edge in forced colors, and text that wraps within the viewport.

The integration provides:

- One focusable Button, IconButton or Link as the trigger, with an accessible name of its own.
- Text that is never essential, since a tooltip is not available on touch; information the user needs stays visible on the page.
- A visible reason next to a disabled control.

| WCAG 2.2 criterion                                                                                             | Level | Responsibility                                                |
| -------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)        | A     | Component (the text as the trigger's description)             |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                  | AA    | Component (inverse text on the inverse surface)               |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                       | AA    | Component (wraps within 240 px and the viewport)              |
| [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) | AA    | Component (dismissible with Escape, hoverable, persistent)    |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                    | A     | Component (keyboard focus opens it)                           |
| [3.2.1 On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)                                    | A     | Component (opening moves no focus and changes no context)     |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)        | A     | Integration (instructions on the page, not only in a tooltip) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                    | A     | Component (role tooltip); integration (the trigger's name)    |

Validated by automated checks in Chromium (Escape inside a Popover and a Dialog closing only the tooltip, axe-core in light and dark, keyboard focus and Escape, the hover delay and the next tooltip at once, pointing at the tooltip, closing on leave and on activation, the accessible description, a disabled trigger, placement at the offset, a dark subtree and a clipping container, computed values in four representative contexts, reduced motion, forced colors) and text contrast in the 18 contexts; a smoke test in Firefox and WebKit (keyboard focus opens it, Escape closes it); no touch-device or assistive-technology test yet. This list is not a conformance claim.
