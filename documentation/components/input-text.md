# InputText

## Overview

An input text lets the user type a short value on one line: a name, an email address, a password, a search query, a phone number. It is as tall as a Button of the same size and can show a decorative icon or one action, such as clearing a search or revealing a password.

## Anatomy

| #   | Part         | Required | Role                                                                                                          |
| --- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | Container    | yes      | The field surface with a thin border and the control radius; fills the width it is given.                     |
| 2   | Leading icon | no       | One decorative icon before the value, in the placeholder color; a press on it focuses the input.              |
| 3   | Value        | yes      | The text on one line; it scrolls to keep the caret visible. The placeholder shows while it is empty.          |
| 4   | Action       | no       | One IconButton after the value (md and lg only), one size smaller; a trailing icon takes its place otherwise. |
| —   | Focus ring   | state    | Drawn outside the container while the input has focus.                                                        |

A height (the Button height of the size: 32, 40 or 44 px at md in compact, standard and comfortable), B icon start, C text start (the padding of a text-only Button, or after the icon slot).

## When to use

- Short values on one line in a form, with a Field around it for the label, hint and error.
- Email, password, phone, URL and search entries: `type` gives the matching keyboard, autofill and masking.
- A search or filter box in a toolbar, named by its `label` prop when there is no visible label.

## When not to use

- Text that can span several lines (a comment, an address): Textarea.
- A choice among known options: RadioGroup for a few, Select (planned) for many.
- Numbers with steppers, dates and times: NumberInput, DatePicker (planned).
- A value the user cannot change: show it as text; use `readonly` only when it must stay selectable and submitted with the form.

## Best practices

| Guidance | Topic        | Practice                                                                                                                 |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Do       | Label        | Put the input in a Field with a visible label; use the `label` prop alone only when the context names it (a search bar). |
| Do       | Type         | Set the `type` and the native `autocomplete` that match the value, so that keyboards and autofill help the user.         |
| Do       | Placeholder  | Use the placeholder for an example of the expected value (“name@example.com”), or leave it out.                          |
| Do       | Size         | Use the size of the Buttons in the same row, so that they line up at the same height.                                    |
| Do       | Action       | Give the action IconButton a label that names its effect (“Clear search”, “Show password”).                              |
| Don't    | Placeholder  | Use the placeholder as a label or as the only hint: it disappears as soon as the user types.                             |
| Don't    | Icons        | Add a leading icon to every input of a form; keep icons for search and for values that a glyph identifies at a glance.   |
| Don't    | Validation   | Expect the input to check or format the value: validate in the application and show the message with Field.              |
| Don't    | Action at sm | Pass an action to a small input: it is not rendered at sm and a warning is logged.                                       |

## Examples

The review page `examples/input-text/App.svelte` covers every case.

### The usual case

```svelte live
<script lang="ts">
  import { Field, InputText } from '@ggbrick/svelte';

  let name = $state('');
</script>

<Field label="Full name">
  <InputText autocomplete="name" bind:value={name} />
</Field>
```

### A search box with a clear action

The `label` prop names an input that has no Field; the action receives the size, intent and appearance it must take.

```svelte live
<script lang="ts">
  import { Icon, IconButton, InputText } from '@ggbrick/svelte';
  import type { InputTextActionProps } from '@ggbrick/svelte';

  // Phosphor Icons 2.1.1 (MIT): magnifying glass and x.
  const search =
    'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z';
  const x =
    'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z';
  let query = $state('Invoices');
</script>

{#snippet leading()}<Icon><path d={search} /></Icon>{/snippet}
{#snippet clearIcon()}<Icon><path d={x} /></Icon>{/snippet}
{#snippet clear(action: InputTextActionProps)}
  <IconButton {...action} label="Clear search" icon={clearIcon} onactivate={() => (query = '')} />
{/snippet}

<InputText type="search" label="Search invoices" placeholder="Search" bind:value={query} {leading} action={clear} />
```

### Sizes beside buttons

```svelte live
<script lang="ts">
  import { Button, InputText } from '@ggbrick/svelte';

  const sizes = ['sm', 'md', 'lg'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm); max-inline-size: 24rem">
  {#each sizes as size (size)}
    <div style="display: flex; gap: var(--ggb-space-control-gap-md)">
      <InputText {size} label={`Coupon code (${size})`} placeholder="SPRING24" />
      <Button {size} label="Apply" />
    </div>
  {/each}
</div>
```

### Conditions

```svelte live
<script lang="ts">
  import { Field, InputText } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md)">
  <Field label="Account ID"><InputText value="ACC-2024-0042" readonly /></Field>
  <Field label="Workspace"><InputText value="Northwind" disabled /></Field>
  <Field label="Email" invalid message="Enter an address like name@example.com.">
    <InputText type="email" value="name@" />
  </Field>
</div>
```

### Difficult cases

- A password with a show or hide action that keeps working in a readonly input (`#actions`).
- Long values scroll inside the input; a long placeholder is cut at the edge (`#difficult`).
- The action is not rendered at size sm (`#actions`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { InputText } from '@ggbrick/svelte';
import type { InputTextProps, InputTextActionProps, InputTextType, InputTextSize } from '@ggbrick/svelte';
```

Renders a container `<div class="ggb-input-text">` (plus any class you pass) with `data-size`, `data-disabled`, `data-readonly`, `data-invalid` and `data-action`, holding a native `<input>`.

| Prop            | Type                                                            | Default  | Description                                                                                                            |
| --------------- | --------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string` (bindable)                                             | `''`     | The value; bind it with `bind:value`.                                                                                  |
| `type`          | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'` | `'text'` | Kind of value, for the platform keyboard, autofill and masking. No validation, no formatting.                          |
| `size`          | `'sm' \| 'md' \| 'lg'`                                          | `'md'`   | Height, padding, text and icon size, matching a Button of the same size; the height follows the density.               |
| `placeholder`   | `string`                                                        | —        | An example of the expected value, shown while the value is empty. Never a label.                                       |
| `label`         | `string`                                                        | —        | Accessible name when the input is not in a Field (not displayed); required then, an empty one throws. A Field wins.    |
| `disabled`      | `boolean`                                                       | `false`  | Not focusable, not editable, not submitted.                                                                            |
| `readonly`      | `boolean`                                                       | `false`  | Focusable and selectable, submitted, not editable.                                                                     |
| `invalid`       | `boolean`                                                       | `false`  | Sets `aria-invalid`; the message belongs to the enclosing Field.                                                       |
| `required`      | `boolean`                                                       | `false`  | Sets the native `required`; the asterisk belongs to the enclosing Field.                                               |
| `leading`       | `Snippet`                                                       | —        | One decorative icon before the value, at the input icon size in the current color.                                     |
| `trailing`      | `Snippet`                                                       | —        | One decorative icon after the value. Ignored when `action` is set.                                                     |
| `action`        | `Snippet<[InputTextActionProps]>`                               | —        | One IconButton after the value, at md and lg only. Spread the received `{ size, intent, appearance, disabled }` on it. |
| `onvaluechange` | `(value: string) => void`                                       | —        | Called on every user edit with the new value; not when the application sets `value`.                                   |
| `ref`           | `HTMLInputElement \| null` (bindable)                           | `null`   | The input element.                                                                                                     |
| `class`         | `string`                                                        | —        | Class of the container.                                                                                                |

Every other attribute of `HTMLInputAttributes` (`id`, `name`, `autocomplete`, `inputmode`, `maxlength`, `oninput`…) goes to the `<input>`, except those the component owns: `children`, `type`, `value`, `size`, `placeholder`, `disabled`, `readonly`, `required`, `aria-invalid`, `aria-required`, `aria-label` and `aria-labelledby`. Inside a Field, the input takes the field's id for its label, its description and message, and its required, invalid and disabled state. The platform-independent contract ships as `contracts/input-text.json`.

## Accessibility

The component provides:

- A native `<input>` named by the Field label or the `label` prop; the placeholder is never the name.
- `type` for the matching keyboard and autofill; `aria-invalid` and `required` exposed; decorative icons hidden.
- The action as a separate IconButton after the input in the tab order, with its own label; disabled with the input.
- A visible focus ring, a 44 px target height in every size, reduced motion and forced colors handled.

The integration provides:

- A visible label (Field) whenever the context does not name the input, and an `autocomplete` value for personal data.
- Validation, error messages and their timing.
- A pressed state on a toggle action (`aria-pressed` on a show-password button).

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                           |
| ------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (name and description from the Field)          |
| [1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) | AA    | Integration (`autocomplete`), component (`type`)         |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (placeholder included) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component (field border at least 3:1)                    |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                                |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component (44 px target height)                          |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)     | A     | Integration, through Field                               |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Integration (Field label and description)                |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard order with the action, accessible names, forced colors, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
