# Textarea

## Overview

A textarea lets the user write text that can span several lines: a comment, a delivery note, a description, a message to support. One row has the height of an InputText of the same size, so the two line up in a form.

## Anatomy

| #   | Part       | Required | Role                                                                                                       |
| --- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Container  | yes      | The field surface with a thin border and the control radius, as an InputText; fills the width it is given. |
| 2   | Value      | yes      | The text; it wraps and keeps line breaks. The placeholder shows while it is empty.                         |
| —   | Focus ring | state    | Drawn outside the container while the textarea has focus.                                                  |

A block padding (half the InputText height minus one line: 8 px at md in standard density), B inline padding (the padding of an InputText without icon), C first row (one line and its padding, as tall as an InputText of the same size).

## When to use

- Free text that may need several sentences or line breaks, in a Field with a label, hint and error.
- Answers whose length varies a lot: `resize="auto"` grows with the content up to `maxRows`.

## When not to use

- A short value on one line (a name, a code, an email): InputText.
- Formatted text with bold, lists or links: a rich text editor (planned).
- A chat composer that sends on Enter: Enter always inserts a line break here; compose a dedicated control (planned).

## Best practices

| Guidance | Topic       | Practice                                                                                                      |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Put the textarea in a Field with a visible label, and the expected content or length in the description.      |
| Do       | Rows        | Set `rows` to the length you expect, so that the user sees how much to write.                                 |
| Do       | Resize      | Keep `vertical` in forms; use `auto` for short answers that sometimes grow; reserve `none` for fixed layouts. |
| Do       | Size        | Use the size of the InputText fields in the same form.                                                        |
| Don't    | Placeholder | Write instructions in the placeholder: they disappear as soon as the user types.                              |
| Don't    | Limits      | Expect the textarea to count or limit characters: show a counter and validate in the application.             |
| Don't    | Enter       | Use a textarea where Enter must submit: Enter inserts a line break.                                           |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/textarea/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Field, Textarea } from '@ggbrick/svelte';

  let note = $state('');
</script>

<Field label="Delivery note" description="Door code, floor, or where to leave the parcel.">
  <Textarea rows={3} bind:value={note} />
</Field>
```

### Growing with the content

With `resize="auto"` the height follows the text from `rows` to `maxRows` lines, then the text scrolls.

```svelte live
<script lang="ts">
  import { Field, Textarea } from '@ggbrick/svelte';
</script>

<Field label="Comment">
  <Textarea resize="auto" rows={2} maxRows={6} placeholder="Add a comment" />
</Field>
```

### Beside an InputText

One row has the height and the text position of the InputText of the same size.

```svelte live
<script lang="ts">
  import { InputText, Textarea } from '@ggbrick/svelte';
</script>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--ggb-space-control-gap-md)">
  <InputText label="Subject" value="Damaged parcel" />
  <Textarea label="Summary" rows={1} resize="none" value="The box was crushed on one corner." />
</div>
```

### Difficult cases

- Long words, explicit line breaks and a readonly value that still scrolls and can be selected (`#difficult`, `#conditions`).
- The three resize modes side by side (`#resize`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Textarea } from '@ggbrick/svelte';
import type { TextareaProps, TextareaSize, TextareaResize } from '@ggbrick/svelte';
```

Renders a container `<div class="ggb-textarea">` (plus any class you pass) with `data-size`, `data-resize`, `data-disabled`, `data-readonly` and `data-invalid`, holding a native `<textarea>`.

| Prop            | Type                                     | Default      | Description                                                                                                            |
| --------------- | ---------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string` (bindable)                      | `''`         | The value; bind it with `bind:value`.                                                                                  |
| `size`          | `'sm' \| 'md' \| 'lg'`                   | `'md'`       | Padding and text size, matching an InputText of the same size.                                                         |
| `rows`          | `number`                                 | `3`          | Initial number of visible lines, at least 1.                                                                           |
| `resize`        | `'vertical' \| 'auto' \| 'none'`         | `'vertical'` | `vertical`: the user resizes the height. `auto`: the height follows the content up to `maxRows`. `none`: fixed height. |
| `maxRows`       | `number`                                 | `8`          | Largest number of lines shown with `resize="auto"` before the content scrolls.                                         |
| `placeholder`   | `string`                                 | —            | An example of the expected value, shown while the value is empty. Never a label.                                       |
| `label`         | `string`                                 | —            | Accessible name when the textarea is not in a Field (not displayed); required then, an empty one throws. A Field wins. |
| `disabled`      | `boolean`                                | `false`      | Not focusable, not editable, not submitted.                                                                            |
| `readonly`      | `boolean`                                | `false`      | Focusable, scrollable and selectable, submitted, not editable.                                                         |
| `invalid`       | `boolean`                                | `false`      | Sets `aria-invalid`; the message belongs to the enclosing Field.                                                       |
| `required`      | `boolean`                                | `false`      | Sets the native `required`; the asterisk belongs to the enclosing Field.                                               |
| `onvaluechange` | `(value: string) => void`                | —            | Called on every user edit with the new value; not when the application sets `value`.                                   |
| `ref`           | `HTMLTextAreaElement \| null` (bindable) | `null`       | The textarea element.                                                                                                  |
| `class`         | `string`                                 | —            | Class of the container.                                                                                                |

Every other attribute of `HTMLTextareaAttributes` (`id`, `name`, `maxlength`, `spellcheck`, `oninput`…) goes to the `<textarea>`, except those the component owns: `children`, `value`, `rows`, `placeholder`, `disabled`, `readonly`, `required`, `aria-invalid` and `aria-label`. Inside a Field, the textarea takes the field's label, description, message and state. The platform-independent contract ships as `contracts/textarea.json`.

## Accessibility

The component provides:

- A native `<textarea>` named by the Field label or the `label` prop; the placeholder is never the name.
- `aria-invalid` and `required` exposed; Enter inserts a line break and never submits.
- A visible focus ring, a 44 px target height, reduced motion and forced colors handled.

The integration provides:

- A visible label (Field), the expected length in the description, and a live character count when there is a limit.
- Validation, error messages and their timing.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                           |
| ------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (name and description from the Field)          |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (placeholder included) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component (field border at least 3:1)                    |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (fills its width, wraps the text)              |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                                |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Integration (Field label and description)                |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                |

Validated by automated checks in Chromium (axe-core in light and dark, typing and resizing, accessible names, forced colors, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
