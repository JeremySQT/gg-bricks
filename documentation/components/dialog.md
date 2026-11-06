# Dialog

## Overview

A dialog is a modal window for a short task or a decision that the user completes or abandons before going back to the page: rename a report, confirm a deletion, accept updated terms. While it is open, the page behind it is dimmed and cannot be used.

## Anatomy

| #   | Part        | Required | Role                                                                                                                       |
| --- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | Title       | yes      | Plain text that asks the question or names the task; it names the dialog.                                                  |
| 2   | Description | no       | A short sentence under the title; it describes the dialog.                                                                 |
| 3   | Close       | no       | A small ghost neutral IconButton on the title line, shown while the dialog is dismissible; its accessible name is “Close”. |
| 4   | Body        | no       | Free content; it scrolls when the dialog is taller than the viewport allows, header and footer staying.                    |
| 5   | Footer      | no       | One ButtonGroup aligned at the end, the primary action last.                                                               |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/dialog.json`.

## When to use

- A short task that must be finished or cancelled before going on: rename an item, edit a few fields, invite people.
- A destructive or irreversible action that needs confirmation: an alert dialog.
- A choice the user must make explicitly, such as accepting updated terms, with no way to dismiss it.

## When not to use

- Content or controls next to their trigger that do not block the page: Popover.
- A message that needs no answer: Alert in the page, or Toast for a short confirmation after an action.
- A short list of actions behind a button: Menu.
- A side panel over the page: Drawer (planned).
- A full-screen window or a multi-step wizard: a page of the application; dedicated compositions are planned.

## Best practices

| Guidance | Topic         | Practice                                                                                                                               |
| -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Title         | Ask the question or name the task in the title (“Delete this report?”, “Rename the report”): it is what screen readers announce first. |
| Do       | Description   | State the consequence in one sentence (“It is removed for everyone. This cannot be undone.”).                                          |
| Do       | Footer        | Put one ButtonGroup in the footer: a neutral outline Cancel first, the primary action last, each labelled with a verb.                 |
| Do       | Destructive   | Set `alert` and make the last footer action a danger Button that names the action (“Delete report”); Dialog itself has no intent.      |
| Do       | Opening       | Set `open` from the Button or menu item that opens the dialog: focus returns to it when the dialog closes.                             |
| Do       | Initial focus | Mark the field to fill with `autofocus` when it is not the first focusable element of the body.                                        |
| Do       | Size          | Use `sm` for a confirmation, `md` by default and `lg` for a form with several fields.                                                  |
| Do       | Theme         | Declare the dialog inside the subtree whose brand, appearance and density it should take: it inherits them where it is declared.       |
| Don't    | Dismissal     | Set `dismissible={false}` without a footer action that closes the dialog: the user would have no way out.                              |
| Don't    | Interruption  | Open a dialog the user did not ask for, such as on page load: it blocks the page and takes the focus.                                  |
| Don't    | Actions       | Put the dialog's actions in the body or add a second footer row: the footer stays in place while the body scrolls.                     |
| Don't    | Labels        | Label the actions “OK” and “Yes”: a button is announced alone, without the title.                                                      |
| Don't    | Nesting       | Chain dialogs to build a wizard; open a dialog from another one only for a short sub-choice.                                           |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/dialog/App.svelte`, not shipped in the package).

### The usual case

A Button sets `open`; focus moves to the first field of the body, and returns to the Button when the dialog closes.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Dialog, Field, InputText } from '@ggbrick/svelte';

  let open = $state(false);
  let name = $state('Quarterly report');

  function rename(value: string) {
    // The application's action.
    void value;
  }
</script>

<Button label="Rename" intent="neutral" appearance="outline" onactivate={() => (open = true)} />

<Dialog bind:open title="Rename the report" description="The new name is shown to everyone in the project.">
  <Field label="Name"><InputText bind:value={name} /></Field>
  {#snippet footer()}
    <ButtonGroup>
      <Button label="Cancel" intent="neutral" appearance="outline" onactivate={() => (open = false)} />
      <Button
        label="Save"
        onactivate={() => {
          rename(name);
          open = false;
        }}
      />
    </ButtonGroup>
  {/snippet}
</Dialog>
```

### Confirm a destructive action

An alert dialog asks for a decision: a press on the backdrop does not close it, and the danger action comes last.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Dialog } from '@ggbrick/svelte';

  let open = $state(false);

  function remove() {
    // The application's action.
  }
</script>

<Button label="Delete report" intent="danger" appearance="outline" onactivate={() => (open = true)} />

<Dialog
  bind:open
  alert
  size="sm"
  title="Delete this report?"
  description="It is removed for everyone in the project. This cannot be undone."
>
  {#snippet footer()}
    <ButtonGroup>
      <Button label="Keep the report" intent="neutral" appearance="outline" onactivate={() => (open = false)} />
      <Button
        label="Delete report"
        intent="danger"
        onactivate={() => {
          remove();
          open = false;
        }}
      />
    </ButtonGroup>
  {/snippet}
</Dialog>
```

### An explicit choice with a long body

With `dismissible={false}` there is no close button, Escape and the backdrop do nothing, and the footer offers the way out. A body taller than the viewport allows scrolls between the header and the footer, which are then set off by a line.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Dialog } from '@ggbrick/svelte';

  let open = $state(false);
  let accepted = $state(false);
</script>

<Button label="Review the terms" intent="neutral" appearance="outline" onactivate={() => (open = true)} />
<p>Accepted: {accepted ? 'yes' : 'no'}</p>

<Dialog bind:open dismissible={false} title="Updated terms of service">
  {#each Array.from({ length: 12 }, (_, i) => i + 1) as n (n)}
    <p>Section {n}: read and accept the updated terms to keep using shared workspaces.</p>
  {/each}
  {#snippet footer()}
    <ButtonGroup>
      <Button label="Decline" intent="neutral" appearance="outline" onactivate={() => (open = false)} />
      <Button
        label="Accept"
        onactivate={() => {
          accepted = true;
          open = false;
        }}
      />
    </ButtonGroup>
  {/snippet}
</Dialog>
```

### Initial focus and the user's closing

`autofocus` marks the element that receives focus first. `onopenchange` reports a close asked by the user (close button, Escape, backdrop, or a form with `method="dialog"` submitted inside the dialog, which closes it even when it is not dismissible); closing from the application, as Save does, reports nothing.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Dialog, Field, InputText } from '@ggbrick/svelte';

  let open = $state(false);
  let dismissed = $state(0);
</script>

<Button label="Edit the report" intent="neutral" appearance="outline" onactivate={() => (open = true)} />
<p>Dismissed by the user: {dismissed}</p>

<Dialog bind:open size="lg" title="Edit the report" onopenchange={() => dismissed++}>
  <p><a href="#fragments">Formatting help</a></p>
  <Field label="Summary"><InputText autofocus /></Field>
  {#snippet footer()}
    <ButtonGroup><Button label="Save" onactivate={() => (open = false)} /></ButtonGroup>
  {/snippet}
</Dialog>
```

### Difficult cases

- A long body scrolls between a fixed header and footer, with dividers only while it scrolls; closing from the application emits nothing (`#playground`).
- An alert dialog ignores presses on the backdrop; a dialog that is not dismissible has no close button and ignores Escape (`#compositions`).
- A dialog opened from another one stacks above it, and Escape closes the innermost first; `autofocus` wins the initial focus (`#compositions`).
- A dialog declared in a dark subtree takes the dark appearance (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, on the shared overlay module; Bits UI is not used). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Dialog } from '@ggbrick/svelte';
import type { DialogProps, DialogSize } from '@ggbrick/svelte';
```

Renders a native `<dialog class="ggb-dialog ggb-overlay">` (plus any class you pass), opened with `showModal()` so that the browser places it in the top layer above the page; where the platform has no top layer, it is stacked at `layer.modal`. There is no portal: the element stays where it is declared and inherits the brand, appearance and density of that place. It carries `data-size`, `data-scrolled` while the body scrolls, `role="alertdialog"` with `alert`, `aria-labelledby` (the title), `aria-describedby` (the description, when there is one) and `tabindex="-1"`. Inside, the header holds the title (`role="heading"`, `aria-level="2"`), the close IconButton and the description, followed by the body and the footer. While a dialog is open the page under it does not scroll. It enters by fading in and moving up slightly and leaves by fading out, in CSS only; under reduced motion it only fades.

| Prop           | Type                                   | Default   | Description                                                                                                                                                       |
| -------------- | -------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean` (bindable)                   | `false`   | Open state; bind it with `bind:open` and set it from the Button or menu item that opens the dialog.                                                               |
| `title`        | `string`                               | required  | The question or task, in heading typography; it names the dialog. An empty or blank title throws, on the server and in the browser.                               |
| `description`  | `string`                               | `''`      | A short sentence under the title; it describes the dialog. Not rendered when empty.                                                                               |
| `size`         | `'sm' \| 'md' \| 'lg'`                 | `'md'`    | Panel width: narrow, medium or wide, never wider than the viewport less its margins.                                                                              |
| `alert`        | `boolean`                              | `false`   | An alert dialog, which asks for a decision (confirm a deletion); never closed by a press on the backdrop.                                                         |
| `dismissible`  | `boolean`                              | `true`    | The close button, Escape and a press on the backdrop ask to close. `false`: none of them; the footer offers the way out.                                          |
| `closeLabel`   | `string`                               | `'Close'` | Accessible name of the close button.                                                                                                                              |
| `children`     | `Snippet`                              | —         | The body: free content that scrolls when the dialog is taller than the viewport. Mark the element to focus first with `autofocus`.                                |
| `footer`       | `Snippet`                              | —         | One ButtonGroup, aligned at the end, the primary action last.                                                                                                     |
| `onopenchange` | `(open: boolean) => void`              | —         | Called with `false` when the user asks to close (close button, Escape, backdrop press, a submitted `method="dialog"` form); not when the application sets `open`. |
| `id`           | `string`                               | generated | The dialog's id; the title and the description get `<id>-title` and `<id>-description`.                                                                           |
| `ref`          | `HTMLDialogElement \| null` (bindable) | `null`    | The dialog element.                                                                                                                                               |
| `class`        | `string`                               | —         | Merged with `ggb-dialog`.                                                                                                                                         |

On opening, focus moves to the element marked `autofocus`, otherwise to the first focusable element of the body, then of the footer, otherwise to the panel; on closing, the browser returns it to the element that had it before. Buttons in the dialog are not sized by a ButtonGroup around its declaration. Every other attribute of `HTMLDialogAttributes` is forwarded to the `<dialog>` element, except those the component owns: `children`, `role`, `open`, `title` (the prop is the heading, not the HTML tooltip attribute), `aria-labelledby`, `aria-describedby` and `aria-modal`. The platform-independent contract ships as `contracts/dialog.json`.

## Accessibility

The component provides:

- A native modal dialog, exposed as a dialog (an alert dialog with `alert`) named by its title and described by its description; the title has the heading role.
- Focus moved into the dialog on opening (`autofocus`, else the first focusable element of the body, then of the footer, else the panel), kept inside while it is open, and returned on closing; the rest of the page is inert.
- Escape, the close button and a press on the backdrop to close a dismissible dialog; an alert dialog ignores the backdrop; nested dialogs close innermost first.
- Room inside the scrolling body so that the focus indicator of a control at its edge is never clipped; a visible panel edge in forced colors; motion reduced to a fade under reduced motion.

The integration provides:

- A title that asks the question or names the task, a description of the consequences, and footer actions labelled with verbs.
- A footer action that closes a dialog that is not dismissible, and the danger Button of a destructive dialog.
- A status message when the result of the action must be announced after the dialog closes.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (dialog named by its title, described, title heading)        |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces; integration for body content        |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (width capped by the viewport, scrolling body)               |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                              |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)                        | A     | Component (Escape); integration when not dismissible (a footer action) |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (initial focus, contained, returned)                         |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component (focus room in the body)                                     |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Component (inert page, fixed header and footer)                        |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | Integration (footer action labels)                                     |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                              |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Integration                                                            |

Beyond A and AA, the fade without movement under reduced motion serves [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).

Validated by automated checks in Chromium (closing by a submitted method dialog form, axe-core in light and dark, role, name and description, focus moving in, staying inside and returning, Escape, close button and backdrop, alert and not dismissible dialogs, nested dialogs, the scrolling body, forced colors, computed values in four representative contexts) and by a smoke test in Firefox and WebKit (modal, initial focus, Escape with focus return, backdrop press); no assistive-technology test yet. This list is not a conformance claim.
