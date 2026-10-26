# Button

## Overview

A button lets the user start an action or move to the next step of a task: save a form, open a dialog, confirm a deletion, create a project. It shows a short text label that names the action, with an optional icon before it and an optional icon, counter or keyboard shortcut after it.

## Anatomy

| #   | Part              | Required | Role                                                                                             |
| --- | ----------------- | -------- | ------------------------------------------------------------------------------------------------ |
| 1   | Root              | yes      | The element that reacts to clicks, taps and keys; its interaction target is at least 44 × 44 px. |
| 2   | Container         | yes      | The visible button: background, border (outline only), corner radius, side padding.              |
| 3   | Leading           | no       | One icon before the label. Decorative.                                                           |
| 4   | Label             | yes      | The text and the accessible name, on one line, shortened with an ellipsis when space runs out.   |
| 5   | Trailing          | no       | One icon, counter or keyboard shortcut after the label. Decorative.                              |
| 6   | Loading indicator | state    | Centered while `loading` is set; the content keeps its place, so the width does not change.      |
| 7   | Focus ring        | state    | Drawn outside the container on keyboard focus.                                                   |

Spacing, the same in every size and density: A side padding of the container, B margin on each side of the label, C margin on each side of slot content. An icon is placed by its drawing, not by its box.

## When to use

- The main, secondary and tertiary actions of a form, a dialog, a toolbar or a page header.
- A destructive action: delete, remove, revoke.
- An action that runs in the background: the button shows a loading state.
- Navigation that reads like an action (“Create project”): the button renders as a link with `href`.

## When not to use

- An action without visible text: IconButton.
- A link inside a sentence: Link.
- A toggle that stays pressed: SegmentedControl (planned).
- A trigger that opens a menu or a split action: Menu (planned).
- A group of buttons or a toolbar: compose buttons in your layout; there is no group component.

## Best practices

| Guidance | Topic       | Practice                                                                                                                      |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Name the action with a verb, short and specific: “Save changes”, “Delete project”, “Create”.                                  |
| Do       | Hierarchy   | Keep one solid accent button per area for the main action; use neutral outline or ghost for the others.                       |
| Do       | Destructive | Use the danger intent for actions that delete something or cannot be undone; outline or ghost when it is not the main action. |
| Do       | Size        | Match the surrounding controls: `md` by default, `sm` in dense toolbars and table rows, `lg` for a prominent call to action.  |
| Do       | Loading     | Set `loading` while the action runs and clear it when it ends: the button keeps its focus and ignores presses.                |
| Do       | Slots       | Put one Icon before the label, and one Icon, Counter or Shortcut after it, in the button's size.                              |
| Do       | Links       | Pass `href` when the action takes the user to another page or task.                                                           |
| Don't    | Label       | Write “OK” or “Yes”: screen readers announce the label alone, without the dialog title.                                       |
| Don't    | Hierarchy   | Put two solid accent buttons side by side.                                                                                    |
| Don't    | Size        | Resize or pad a button for density, or give it a width: density and layout already decide.                                    |
| Don't    | Disabled    | Disable a button without saying why nearby, or add `disabled` to a loading button: it can no longer be reached by keyboard.   |
| Don't    | Slots       | Put information only in a slot: screen readers skip it, so repeat a counter's quantity elsewhere.                             |
| Don't    | Links       | Use a button for a link inside running text.                                                                                  |

## Examples

Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set. The review page `examples/button/App.svelte` covers every case.

### The usual case

```svelte live
<script lang="ts">
  import { Button } from '@ggbrick/svelte';

  function save() {
    // The application's action.
  }
</script>

<Button label="Save changes" onactivate={() => save()} />
<Button label="Cancel" intent="neutral" appearance="outline" />
```

### Intent, appearance and size

```svelte live
<Button label="Delete project" intent="danger" />
<Button label="Delete" intent="danger" appearance="ghost" />
<Button label="Add item" size="sm" />
<Button label="Get started" size="lg" />
```

### Leading and trailing content

Snippets fill the two slots. The content inherits the text color; the button sizes an Icon, and a Counter or a Shortcut takes the button's size.

```svelte live
<script lang="ts">
  import { Button, Counter, Icon, Shortcut } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet counter()}<Counter value={8} size="md" />{/snippet}
{#snippet save()}<Shortcut keys="Mod+S" size="md" />{/snippet}

<Button label="New project" leading={plus} />
<Button label="Inbox" intent="neutral" appearance="ghost" trailing={counter} />
<Button label="Save" trailing={save} />
```

### Asynchronous action

The button shows the loading indicator, keeps its width and focus, and ignores presses until `loading` is cleared.

```svelte live
<script lang="ts">
  import { Button } from '@ggbrick/svelte';

  // Stands in for the application's request.
  const api = { save: () => new Promise((resolve) => setTimeout(resolve, 1500)) };

  let saving = $state(false);
  async function save() {
    saving = true;
    try {
      await api.save();
    } finally {
      saving = false;
    }
  }
</script>

<Button label="Save changes" loading={saving} onactivate={save} />
```

### In a form

`type` defaults to `button`, so a Button never submits a form by accident. Pass `submit` or `reset` explicitly.

```svelte live
<script lang="ts">
  import { Button } from '@ggbrick/svelte';

  function handle(event: SubmitEvent) {
    event.preventDefault();
    // Read the form data and send it.
  }
</script>

<form onsubmit={handle}>
  <Button type="submit" label="Create item" />
  <Button type="reset" label="Reset" intent="neutral" appearance="ghost" />
</form>
```

### Navigation to a task

With `href`, the button renders as a link. A disabled link keeps the appearance but loses its destination; a loading link keeps focus and does not navigate.

```svelte live
<script lang="ts">
  import { Button, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}

<Button href="#new-project" label="Create project" leading={plus} />
<Button href="#new-project" label="Unavailable" disabled appearance="outline" />
```

### Difficult cases

- A long label in a narrow container ends with an ellipsis; the full label stays the accessible name.
- A button stretched by its container keeps its height and centers its content.
- A small button (28 to 36 px tall) still has a 44 px interaction target, so a row of small buttons is at least 44 px tall.

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Button.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Button } from '@ggbrick/svelte';
import type {
  ButtonProps,
  ButtonAsButton,
  ButtonAsLink,
  ButtonIntent,
  ButtonAppearance,
  ButtonSize
} from '@ggbrick/svelte';
```

Renders a native `<button>` or, when `href` is set, an `<a>`. The root element carries `class="ggb-button"` plus any class you pass, and the data attributes `data-intent`, `data-appearance`, `data-size`, `data-disabled` and `data-loading`.

| Prop         | Type                                | Default    | Description                                                                                                                                                                          |
| ------------ | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`      | `string`                            | required   | Visible text and accessible name. Must be non-empty: an empty or blank label throws, on the server and in the browser.                                                               |
| `intent`     | `'accent' \| 'neutral' \| 'danger'` | `'accent'` | What the action means.                                                                                                                                                               |
| `appearance` | `'solid' \| 'outline' \| 'ghost'`   | `'solid'`  | Visual weight.                                                                                                                                                                       |
| `size`       | `'sm' \| 'md' \| 'lg'`              | `'md'`     | Height, padding, label size and icon size; each size follows the density of the ancestor.                                                                                            |
| `disabled`   | `boolean`                           | `false`    | Not focusable and not activatable (native `disabled` on a button; no `href`, `aria-disabled` and `tabindex="-1"` on a link). Takes precedence over `loading`.                        |
| `loading`    | `boolean`                           | `false`    | Shows the loading indicator, sets `aria-busy` and `aria-disabled`, keeps the width and the focus, blocks activation and navigation (including a middle or modified click on a link). |
| `href`       | `string`                            | —          | Renders a link instead of a button. `type` is then not allowed.                                                                                                                      |
| `type`       | `'button' \| 'submit' \| 'reset'`   | `'button'` | Native button type (button only).                                                                                                                                                    |
| `onactivate` | `(event: MouseEvent) => void`       | —          | Called when the button is activated by click, Enter or Space while neither disabled nor loading. A native `onclick` or `onauxclick` you pass is guarded the same way.                |
| `leading`    | `Snippet`                           | —          | One decorative icon before the label.                                                                                                                                                |
| `trailing`   | `Snippet`                           | —          | One decorative icon, counter or shortcut after the label.                                                                                                                            |
| `ref`        | `HTMLElement \| null` (bindable)    | `null`     | The rendered element.                                                                                                                                                                |
| `class`      | `string`                            | —          | Merged with `ggb-button`.                                                                                                                                                            |

Every other attribute of `HTMLButtonAttributes` (or `HTMLAnchorAttributes` with `href`) is forwarded to the element, except those the component owns: `children`, `href`, `type`, `disabled`, `aria-busy`, `aria-disabled` and `role`. `onclick` and `onauxclick` are forwarded but guarded as described above.

`ButtonProps` is the union of `ButtonAsButton` and `ButtonAsLink`; TypeScript rejects `type` together with `href`. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract (options, parts, states, token roles, rules) ships as `contracts/button.json`.

## Accessibility

The component provides:

- A native `button`, or `a` with `href`: role, keyboard (Enter and Space, Enter for a link) and tab order come from the platform.
- The label as the accessible name, even when shortened; slot content is hidden from assistive technology.
- `loading`: `aria-busy` and `aria-disabled`, focus kept, presses ignored. `disabled`: out of the tab order.
- A visible focus ring on keyboard focus, a 44 × 44 px target in every size, reduced motion and forced colors handled.

The integration provides:

- A meaningful label, and any information from a slot (a counter's value) in an accessible form elsewhere.
- A visible reason for a disabled button, and a status message when the result of a loading action must be announced.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------- |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces                                         |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component; outline border on the muted surface in dark accepted below 3:1 |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                                 |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component                                                                 |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Integration (sticky bars, overlays)                                       |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | Component                                                                 |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component                                                                 |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                        | A     | Component (`type` defaults to `button`)                                   |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                                 |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Integration                                                               |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard, forced colors, target sizes, contrast in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
