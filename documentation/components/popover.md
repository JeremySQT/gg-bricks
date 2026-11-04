# Popover

## Overview

A popover opens a panel next to a button for content the user works with without leaving the page: filters for a list, a short form to rename or tag an item, the details of an entry. The rest of the page stays usable, and the panel closes on Escape, on a press outside or when focus leaves it.

## Anatomy

| #   | Part    | Required | Role                                                                                                                                                                                                                             |
| --- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Trigger | yes      | Exactly one Button or IconButton; activating it opens or closes the popover, and it tells assistive technology that it controls a popup and whether it is expanded.                                                              |
| 2   | Panel   | yes      | The non-modal dialog named by `label`, in `color.surface.overlay` with `shadow.overlay`, an edge of `border.width.default` in `color.elevation.border` and `radius.overlay` corners; at most `size.overlay.panel` (360 px) wide. |
| 3   | Content | yes      | Free content, set in `typography.body.sm` and `color.content.primary` by default; focus moves to its first focusable element on opening.                                                                                         |

A offset: `space.content.xs` between the trigger and the panel on the chosen side (2, 4 or 6 px in compact, standard and comfortable density). B padding: `space.content.md` inside the panel (8, 12 or 16 px).

## When to use

- Filters or view options next to the list or table they act on.
- A short form tied to one item: rename it, add a tag, share it.
- Details of an item, or help behind an info IconButton, that the user opens with a press, reads and dismisses.

## When not to use

- A list of actions or commands behind a button: Menu.
- A task that must be completed or abandoned before going on, or a confirmation: Dialog.
- A few words about a control on hover or focus: Tooltip.
- One choice in a list of options: RadioGroup, or Select (planned) and Combobox (planned) for long lists.
- A long form or content wider than 360 px: Dialog, or Drawer (planned).

## Best practices

| Guidance | Topic        | Practice                                                                                                                       |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Do       | Label        | Name the panel with `label`, usually the words of its visible heading (“Filters”).                                             |
| Do       | Trigger      | Spread the received props last on the trigger (`<Button label="Filters" {...props} />`): they carry its id and expanded state. |
| Do       | Trigger text | Say in the trigger's label what the panel holds (“Filters”, “Add a tag”), not “More” or “Open”.                                |
| Do       | Closing      | Set `open` to false once the content has done its job, such as an Apply button that applies the filters.                       |
| Do       | Close button | Add a Cancel or Close button to a panel that holds a form; Escape and a press outside always close it.                         |
| Do       | Placement    | Keep the default bottom and start; use `align="end"` for a trigger at the end of a toolbar.                                    |
| Don't    | Actions      | Put a list of commands in a popover: a Menu gives them the menu roles and arrow keys.                                          |
| Don't    | Blocking     | Use a popover for a task that must be finished first: it is not modal, and a press outside closes it.                          |
| Don't    | Trigger id   | Give the trigger an id of its own: the popover finds its trigger, and places the panel against it, by the id it passes.        |
| Don't    | Hover        | Expect a popover to open on hover or focus: it opens when its trigger is activated; a Tooltip shows text on hover.             |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/popover/App.svelte`, not shipped in the package). Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### Filters for a list

The trigger snippet receives the attributes that connect it to the panel; Apply closes the panel from the application.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Checkbox, Popover } from '@ggbrick/svelte';

  let open = $state(false);
  let onlyOpen = $state(true);
  let mine = $state(false);
  let applied = $state('Open issues');

  function apply() {
    applied = [onlyOpen && 'Open issues', mine && 'Assigned to me'].filter(Boolean).join(', ') || 'None';
    open = false;
  }
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)">
  <Popover label="Filters" bind:open>
    {#snippet trigger(props)}<Button label="Filters" intent="neutral" appearance="outline" {...props} />{/snippet}
    <div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)">
      <p style="margin: 0; font: var(--ggb-typography-label-md)">Filters</p>
      <Checkbox label="Open issues" bind:checked={onlyOpen} />
      <Checkbox label="Assigned to me" bind:checked={mine} />
      <ButtonGroup align="end" size="sm">
        <Button label="Apply" onactivate={apply} />
      </ButtonGroup>
    </div>
  </Popover>
  <p style="margin: 0">Applied filters: {applied}</p>
</div>
```

### A short form behind an icon button

Focus moves to the input on opening; Escape or Cancel closes the panel.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Field, Icon, IconButton, InputText, Popover } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  let open = $state(false);
  let tag = $state('');
  let tags = $state<string[]>(['urgent']);

  function add(event: SubmitEvent) {
    event.preventDefault();
    if (tag.trim()) tags = [...tags, tag.trim()];
    tag = '';
    open = false;
  }
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<div style="display: flex; align-items: center; gap: var(--ggb-space-content-md)">
  <p style="margin: 0">Tags: {tags.join(', ')}</p>
  <Popover label="Add a tag" bind:open>
    {#snippet trigger(props)}<IconButton label="Add a tag" icon={plus} appearance="outline" {...props} />{/snippet}
    <form style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)" onsubmit={add}>
      <Field label="Tag name"><InputText bind:value={tag} /></Field>
      <ButtonGroup align="end" size="sm">
        <Button label="Cancel" intent="neutral" appearance="ghost" onactivate={() => (open = false)} />
        <Button type="submit" label="Add" />
      </ButtonGroup>
    </form>
  </Popover>
</div>
```

### Details above, at the end

With nothing focusable inside, focus moves to the panel itself. The panel takes the preferred side and alignment and flips when the viewport lacks room.

```svelte live
<script lang="ts">
  import { Button, Popover } from '@ggbrick/svelte';
</script>

<Popover label="Storage" side="top" align="end">
  {#snippet trigger(props)}<Button label="Storage" intent="neutral" appearance="ghost" {...props} />{/snippet}
  <p style="margin: 0; max-inline-size: 18rem">
    You use 3.2 GB of your 5 GB. Files in the trash count until the trash is emptied.
  </p>
</Popover>
```

### Difficult cases

- A press on the trigger of an open popover closes it instead of closing and reopening it; Tab from the last element leaves the panel and closes it, focus staying where it went; the application toggles `open` without an event (`#playground`).
- A popover opened inside another stays open with it, and Escape closes the innermost first (`#compositions`).
- Inside a dark subtree and a clipping container, the panel takes the dark appearance and escapes the clipping (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5; no Bits UI primitive). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Popover } from '@ggbrick/svelte';
import type { PopoverProps, PopoverTriggerProps, PopoverSide, PopoverAlign } from '@ggbrick/svelte';
```

Renders the trigger snippet, then the panel: a `<div class="ggb-popover ggb-overlay">` (plus any class you pass) with `role="dialog"`, `aria-label`, `tabindex="-1"`, `popover="auto"`, `data-side` and `data-align`, holding the content. The panel stays in the DOM right after its trigger and is shown in the browser top layer, without a portal: it inherits the brand, appearance and density of its surroundings, is not clipped by an `overflow` container and needs no z-index. It is placed with CSS anchor positioning and follows the trigger when the page scrolls; where the browser lacks anchor positioning, it is measured instead and carries `data-positioning="measured"` and `data-placed-side`. Its block size is limited to the larger room above or below the trigger, and the content scrolls beyond it.

| Prop           | Type                                | Default    | Description                                                                                                                                   |
| -------------- | ----------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean` (bindable)                | `false`    | Shown state; bind it with `bind:open`. Setting it from the application shows or hides the panel without calling `onopenchange`.               |
| `label`        | `string`                            | required   | Accessible name of the panel, often its visible heading. Must be non-empty: an empty or blank label throws, on the server and in the browser. |
| `side`         | `'bottom' \| 'top'`                 | `'bottom'` | Preferred side; the panel flips to the other side when the viewport lacks room.                                                               |
| `align`        | `'start' \| 'center' \| 'end'`      | `'start'`  | Alignment with the start, the center or the end of the trigger, in the reading direction.                                                     |
| `trigger`      | `Snippet<[PopoverTriggerProps]>`    | required   | Renders the one Button or IconButton that opens the panel; spread the received props on it.                                                   |
| `children`     | `Snippet`                           | required   | The content of the panel.                                                                                                                     |
| `onopenchange` | `(open: boolean) => void`           | —          | Called with the new state when the user opens or closes the popover: trigger activation, Escape, a press outside, focus leaving.              |
| `id`           | `string`                            | generated  | id of the panel; the trigger gets `<id>-trigger`.                                                                                             |
| `ref`          | `HTMLDivElement \| null` (bindable) | `null`     | The panel element.                                                                                                                            |
| `class`        | `string`                            | —          | Merged with `ggb-popover ggb-overlay` on the panel.                                                                                           |

The `trigger` snippet receives `PopoverTriggerProps`, to spread on the Button or IconButton after its own props:

| Field           | Value                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`            | `<panel id>-trigger`: the popover finds its trigger, and anchors the panel to it, by this id.                                                                      |
| `popovertarget` | The panel's id: the browser toggles the panel, so a press on the trigger of an open panel closes it without reopening it, and Escape returns focus to the trigger. |
| `aria-haspopup` | `'dialog'`.                                                                                                                                                        |
| `aria-expanded` | The open state.                                                                                                                                                    |
| `aria-controls` | The panel's id.                                                                                                                                                    |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`style`, `data-*`, `aria-describedby`…) goes to the panel, except those the component owns: `children`, `role`, `aria-label` and `popover`, and `id`, which is the prop above; the panel always sets `tabindex="-1"` and its own focus-out handler. Buttons inside the panel are not sized by a ButtonGroup around the popover. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/popover.json`.

## Accessibility

Keyboard and pointer:

- Enter, Space or a press on the trigger opens the panel; doing it again closes it. On opening, focus moves to the first focusable element of the content, or to the panel itself when there is none, unless the user has already moved focus elsewhere.
- The panel follows the trigger in the tab order: Tab from the trigger enters it, and Tab from its last element leaves it and closes it, focus staying where it went.
- Escape closes the panel and returns focus to the trigger; a press outside the panel and the trigger closes it. Opening a popover closes the popovers that do not contain it; a popover opened inside another keeps the first open and closes first on Escape.

The component provides:

- `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` on the trigger; the panel as a non-modal `dialog` named by `label`, the rest of the page staying usable.
- Focus moved into the content on opening, back to the trigger on Escape, and a tab order that follows the trigger.
- The panel above the page in the top layer, in the brand, appearance and density around the trigger; its height limited to the room on screen, the content scrolling beyond it.
- A fade without movement under reduced motion, and a visible edge in forced colors.

The integration provides:

- A `label` that names the panel, ideally the words of a visible heading, and a trigger label that says what opens.
- Content that makes sense in the order it is read, with its own labels, and a Cancel or Close button when it holds a form.
- A status message when the result of what the content applies is not visible, and contrast for colors the content sets itself.

| WCAG 2.2 criterion                                                                                             | Level | Responsibility                                                                     |
| -------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)        | A     | Component (named dialog, popup relation on the trigger); integration (the content) |
| [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)              | A     | Component (the panel follows its trigger in the DOM)                               |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                  | AA    | Component, for the default text; integration, for colors the content sets          |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                       | AA    | Component (width and height limited to the viewport, content scrolls)              |
| [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) | AA    | Not applicable: the panel opens on activation, never on hover or focus             |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                    | A     | Component                                                                          |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)                    | A     | Component (Tab and Escape leave the panel)                                         |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                              | A     | Component (into the content on opening, back to the trigger on Escape)             |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                    | A     | Component (expanded state, named dialog); integration (the trigger's label)        |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                      | AA    | Integration                                                                        |

Validated by automated checks in Chromium (axe-core in light and dark, the trigger's popup attributes, the named dialog, focus on opening and on Escape, a press outside, Tab leaving the panel, a nested popover, placement at the offset, a dark subtree and a clipping container, computed values in four representative contexts, forced colors) and text contrast in the 18 contexts; a smoke test in Firefox and WebKit (placement at the offset, focus on opening, Escape back to the trigger, a dark subtree and a clipping container); no assistive-technology test yet. This list is not a conformance claim.
