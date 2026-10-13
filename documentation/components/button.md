# Button

## Overview

A button lets the user start an action or move to the next step of a task: save a form, open a dialog, confirm a deletion, create a project. It shows a short text label that names the action, with an optional icon before it and an optional icon, counter or keyboard shortcut after it.

Buttons come in three intents that say what the action means (accent for the main action, neutral for secondary actions, danger for destructive ones), three appearances that set their visual weight (solid, outline, ghost) and three sizes that follow the density of the surrounding interface. A button can show that its action is running, can be disabled, and can lead to another page while keeping the same look.

## When to use

Use a button whenever the user triggers something: submitting, confirming, cancelling, opening, creating, deleting, moving to the next step.

- The primary, secondary and tertiary actions of a form, a dialog, a toolbar or a page header, graded with intent and appearance.
- A destructive action, with the danger intent, so that the user reads the consequence before acting.
- An asynchronous action: the button shows a loading indicator, keeps its width and its focus, and ignores repeated presses until the action completes.
- Navigation that reads like an action, such as “Create project”: pass `href` and the same component renders as a link with the button appearance.
- An action with a visual cue: a leading icon, or a trailing icon, counter or keyboard shortcut.

## When not to use

- An action without visible text: use IconButton (planned), which requires an explicit accessible name. Button always needs a label.
- Navigation inside a sentence or a paragraph: use Link (planned). A button with `href` is for task-oriented navigation that stands on its own.
- A toggle that stays pressed (`aria-pressed`): use SegmentedControl (planned) or a future ToggleButton. Button has no pressed-and-held state.
- A trigger with an attached menu or a split action: use Menu (planned).
- Groups of buttons and toolbars are composition patterns: place buttons in your own layout; the button does not know its neighbours.
- Filling the available width is a layout decision: the button has no width option, the container stretches it.

## Anatomy

The annotated anatomy lives on the Figma specification page of the component (frame “Button — Specification”, `components/actions/button/figma-spec.md` gives the links; a capture is kept in `reports/components/button/figma/specification.png`). Text equivalent, from the outside in:

| #   | Part              | Required | Role                                                                                                                                                                                                                                                                                               |
| --- | ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Root              | yes      | The element that reacts to clicks, taps and keys: a native `button`, or `a` when `href` is set. It reserves an interaction target of at least 44 × 44 CSS px around the visible button, without enlarging it: its layout box is at least 44 px tall, and it extends sideways without taking space. |
| 2   | Container         | yes      | The visible button: background, border (outline appearance only), corner radius, side padding and height. It fills the root, so a container that stretches the button stretches its surface.                                                                                                       |
| 3   | Leading           | no       | One icon before the label, rendered at the button's icon size in the current text color. Decorative: hidden from assistive technology.                                                                                                                                                             |
| 4   | Label             | yes      | The text of the button, on one line. It is the accessible name. When space runs short it is shortened with an ellipsis; the full text stays available to assistive technology.                                                                                                                     |
| 5   | Trailing          | no       | One element after the label: an icon, a counter or a keyboard shortcut, in the current text color. Decorative: hidden from assistive technology, so a counter's value must not be the only place that information exists.                                                                          |
| 6   | Loading indicator | state    | A spinner centered over the container while `loading` is true. The other content is hidden but keeps its place, so the button keeps its width.                                                                                                                                                     |
| 7   | Focus ring        | state    | Drawn just outside the container, with concentric corners, when the button is focused with the keyboard.                                                                                                                                                                                           |

Spacing follows one rule in every size and density: the container has side padding, the label has a margin on each side, and an icon, counter or shortcut has a smaller margin on each side. An icon is placed by its drawing rather than by its square, so it looks as close to the text as a counter does.

Slots versus content: `leading` and `trailing` are the two slots. Until the Icon, Counter and Shortcut components exist, pass your own icon (an inline SVG in `currentColor`) or a small inline element; the examples use local fixtures for this purpose.

## Usage guidelines

**Label.** Name the action with a verb, short and specific: “Save changes”, “Delete project”, “Create”. Avoid “OK”, “Yes” or labels that only make sense next to the title of the dialog. The label is what screen readers announce; the icons add nothing to it.

**Hierarchy.** One solid accent button per area for the main action. Secondary actions use neutral outline or neutral ghost; the lower the emphasis, the lighter the appearance. Do not put two solid accent buttons side by side: the user should not have to work out which one is the main one.

**Destructive actions.** Use the danger intent for actions that delete something or cannot be undone, and keep it for those. A danger outline or ghost button suits a destructive action that is not the main action of the area.

**Size.** Pick the size that matches the surrounding controls: `md` by default, `sm` in dense toolbars and table rows, `lg` for a prominent call to action. Sizes already adapt to the density of the ancestor (`data-ggb-density`); do not compensate by hand.

**Loading.** Set `loading` while an asynchronous action runs and clear it when the action completes or fails. The button stays focusable so that keyboard users do not lose their place, and it ignores presses in the meantime. Do not also set `disabled`, unless the button really must leave the tab order: a disabled button cannot be reached by keyboard.

**Disabled.** Prefer leaving a button enabled and explaining why the action is not possible, over disabling it without explanation. When a button must be disabled, make the reason visible nearby.

**Links.** Pass `href` when the action moves the user to another page or task. Keep the button for actions and the Link component (planned) for navigation inside text.

**Icons.** A leading icon helps when it is a well-known symbol of the action (plus, download, trash). A trailing icon suits “next step” arrows. Counters show a quantity (“Inbox 8”); shortcuts remind of a key combination. One element per slot.

**Width.** Let the layout decide: a button is as wide as its content, and stretches when its container stretches it (for example a full-width button on a small screen).

Do: “Create project” as a solid accent button, “Cancel” as a neutral outline button.
Don't: “Submit” and “Save” as two solid accent buttons in the same footer.

## Examples

The verified source of every example is `examples/button/App.svelte`, the review page of the component (`npm run build && npm run build:preview button` produces a self-contained page). Icons, counters and shortcuts in these examples come from `examples/button/Fixtures.svelte`.

### The usual case

```svelte
<script lang="ts">
  import { Button } from '@ggbrick/svelte';
</script>

<Button label="Save changes" onactivate={() => save()} />
<Button label="Cancel" intent="neutral" appearance="outline" />
```

### Intent, appearance and size

```svelte
<Button label="Delete project" intent="danger" />
<Button label="Delete" intent="danger" appearance="ghost" />
<Button label="Add item" size="sm" />
<Button label="Get started" size="lg" />
```

### Leading and trailing content

Snippets fill the two slots. The content inherits the text color and the icon size.

```svelte
{#snippet plus()}<svg viewBox="0 0 256 256" fill="currentColor"><path d="…" /></svg>{/snippet}
{#snippet counter()}<span class="counter">8</span>{/snippet}

<Button label="New project" leading={plus} />
<Button label="Inbox" intent="neutral" appearance="ghost" trailing={counter} />
```

### Asynchronous action

The button shows the loading indicator, keeps its width and focus, and ignores presses until `loading` is cleared.

```svelte
<script lang="ts">
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

```svelte
<form onsubmit={handle}>
  <Button type="submit" label="Create item" />
  <Button type="reset" label="Reset" intent="neutral" appearance="ghost" />
</form>
```

### Navigation to a task

With `href`, the button renders as a link. A disabled link keeps the appearance but loses its destination; a loading link keeps focus and does not navigate.

```svelte
<Button href="/projects/new" label="Create project" leading={plus} />
<Button href="/projects/new" label="Unavailable" disabled appearance="outline" />
```

### Difficult cases

- A long label in a narrow container is shortened with an ellipsis; trailing content stays next to the visible text, and the full label remains the accessible name (`#truncated` on the review page).
- A button stretched by its container keeps its height and centers its content (`#stretched`).
- A small button (28 to 36 px tall depending on density) still offers a 44 px interaction target, so a row of small buttons is at least 44 px tall; the visible surface keeps the size height.

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Button.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

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

`ButtonProps` is the union of `ButtonAsButton` and `ButtonAsLink`; TypeScript rejects `type` together with `href`. The platform-independent options and rules are in `components/actions/button/contract.json`; the Figma master exposes the same options as variants and properties.

Visual tokens: the button reads its colors, radius, spacing and typography from the semantic roles listed in the contract (`color.action.*`, `size.control.*`, `space.control.*`, `typography.label.*`, `size.icon.*`, `radius.control`, `radius.focus`, `focus.*`, `motion.*`), so brands, appearances and densities apply without any prop.

## Accessibility

What the component guarantees:

- A native `button` or `a` element, so role, name and keyboard behavior come from the platform: Enter and Space activate a button, Enter activates a link, Tab reaches it in document order.
- The label is the accessible name, even when it is visually shortened. Leading and trailing content is hidden from assistive technology (`aria-hidden`).
- `loading` exposes `aria-busy="true"` and `aria-disabled="true"` and keeps the button focusable, so focus does not jump away during an asynchronous action; presses are ignored.
- `disabled` removes the button from the tab order (native `disabled`; on a link, no `href` and `tabindex="-1"`).
- A visible focus ring, drawn only for keyboard focus (`:focus-visible`), 2 px wide at 2 px outside the container.
- An interaction target of at least 44 × 44 CSS px in every size and density: the button's layout box is at least 44 px tall and its hit area at least 44 px wide, while the visible surface keeps the size height.
- Color transitions respect `prefers-reduced-motion`; the loading spinner slows down under it. In forced-colors mode the container keeps a visible boundary and the focus ring stays visible.

What the integration must provide:

- A meaningful label; the component only rejects an empty one.
- Any information carried by trailing content (for example the value of a counter) in an accessible form elsewhere, since slot content is decorative.
- A visible explanation when a button is disabled, and a status message if the outcome of a loading action needs to be announced (`aria-live` region in the page).
- Enough contrast between the button and its backdrop: the tokens are checked on the system's documented backdrops (canvas, default, subtle, muted, raised, overlay); other backgrounds are the integration's responsibility.

Relevant WCAG 2.2 success criteria:

| Criterion                                                                                                          | Level | Relevance                                                                                             | Responsibility                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Label against the button surface in every intent, appearance, state, brand and mode.                  | Component (tokens checked: 6264 pairs, 0 failures on documented backdrops)                                                       |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Focus ring and, for the outline appearance, the border against the backdrop.                          | Component; the outline border on `surface.muted` in dark modes is below 3:1 and accepted because the label identifies the button |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Activation with Enter and Space (button) or Enter (link).                                             | Component                                                                                                                        |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Focus ring on keyboard focus.                                                                         | Component                                                                                                                        |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | The focused button must not be hidden by sticky bars or overlays.                                     | Integration                                                                                                                      |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | The accessible name is exactly the visible label.                                                     | Component                                                                                                                        |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | 44 × 44 px target around every size, beyond the 24 px minimum.                                        | Component                                                                                                                        |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                        | A     | Activation is explicit; `type` defaults to `button`, so a Button in a form never submits by accident. | Component, with the integration deciding what the action does                                                                    |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Native role, name from the label, busy and disabled states exposed.                                   | Component                                                                                                                        |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | The result of an asynchronous action, if it must be announced.                                        | Integration                                                                                                                      |
| [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)  | AAA   | Transitions and the spinner under `prefers-reduced-motion`.                                           | Component (objective, not a requirement)                                                                                         |

Validation status: automated checks only, in Chromium: axe-core on the review page in light and dark appearances (0 violations), keyboard and focus behavior, forced-colors rendering, target sizes and computed contrast in the 18 brand × appearance × density contexts (`tests/browser/button.spec.ts`, `reports/components/button/`). No assistive-technology test has been run yet; listing these criteria is not a conformance claim.
