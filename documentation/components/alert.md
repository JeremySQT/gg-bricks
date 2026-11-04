# Alert

## Overview

An alert is a durable message in the flow of the page about the page, a section or a task: a failed save at the top of a form, an expiring plan, a maintenance notice, a successful import with a follow-up action. It stays until the situation changes or the user dismisses it.

## Anatomy

| #   | Part    | Required | Role                                                                                                                                                   |
| --- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Icon    | yes      | The glyph of the intent (info, check-circle, warning or warning-circle), centered on the first line and hidden from assistive technology; replaceable. |
| 2   | Title   | no       | A short heading in label typography, in the content color of the intent.                                                                               |
| 3   | Content | no       | The message: a sentence, a link, a short list, wrapping as needed; links inside follow the content color. One of title and content at least.           |
| 4   | Actions | no       | One ButtonGroup of small buttons under the content; accent and neutral buttons take the action family of the intent, danger keeps its own.             |
| 5   | Dismiss | no       | A small ghost IconButton with the close glyph, named by `dismissLabel`, at the inline end; it follows the intent too.                                  |

A padding: `space.content.md` (8, 12 or 16 px in compact, standard and comfortable density), with an edge of `border.width.default` in `color.status.{intent}.border` inside `radius.container` corners on `color.status.{intent}.surface`. B icon gap: `space.content.sm` (4, 8 or 12 px), also before the dismiss button; title gap `space.content.xs` (2, 4 or 6 px). C actions gap: `space.content.md` (8, 12 or 16 px). D block-end padding with actions: `space.content.lg` (12, 16 or 24 px) instead of `space.content.md`, so that the buttons do not sit tight against the edge.

## When to use

- A failure or a risk about a form, a section or the page that the user must know about: a failed save, an expired card.
- A notice that stays relevant while the user works: an expiring plan, a scheduled maintenance.
- The result of a long task with a follow-up action: an import that succeeded, with a link to the imported items.

## When not to use

- A brief confirmation that leaves by itself: Toast.
- A message that must be answered before going on: Dialog.
- An error on one field: the message of its Field.
- A short status word on an item: Badge.
- A page-wide banner fixed at the top of the window: a composition in your layout; there is no banner component.

## Best practices

| Guidance | Topic   | Practice                                                                                                                               |
| -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Words   | State the meaning in words, in the title or the content: the color and the icon only reinforce it.                                     |
| Do       | Intent  | Pick the intent from the situation: danger for a failure, warning for a risk, success for a completed task, info or neutral otherwise. |
| Do       | Content | Keep the title short and the content to a sentence or two that says what happened and what to do next.                                 |
| Do       | Live    | Set `live` on an alert that appears after something happens, such as a failed save, so that it is announced.                           |
| Do       | Actions | Pass one ButtonGroup with one or two follow-up actions in `actions`: its buttons become small and follow the intent.                   |
| Do       | Dismiss | Remove the alert from the page in `ondismiss`: a dismissible alert does not hide itself.                                               |
| Don't    | Brief   | Use an alert for a confirmation that should leave by itself: that is a Toast.                                                          |
| Don't    | Live    | Set `live` on alerts present when the page loads: they are part of the page and the announcement would interrupt the user.             |
| Don't    | Actions | Put Buttons in `actions` without a ButtonGroup: they would keep the default size instead of the small one.                             |
| Don't    | Colors  | Restyle the buttons or links inside the alert: they follow its intent on purpose, and danger buttons keep their own family.            |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/alert/App.svelte`, not shipped in the package).

### A notice with actions

The usual case: a title, a sentence with a link, two follow-up actions and a dismiss button. The application removes the alert when it is dismissed.

```svelte live
<script lang="ts">
  import { Alert, Button, ButtonGroup, Link } from '@ggbrick/svelte';

  let visible = $state(true);
  // Stands in for the application's action.
  function choosePlan() {}
</script>

{#if visible}
  <Alert intent="warning" title="Your trial ends in 3 days" dismissible ondismiss={() => (visible = false)}>
    Choose a plan to keep your projects and invitations. <Link href="#plans" label="Compare plans" />
    {#snippet actions()}
      <ButtonGroup>
        <Button label="Choose a plan" onactivate={choosePlan} />
        <Button label="Later" intent="neutral" appearance="ghost" onactivate={() => (visible = false)} />
      </ButtonGroup>
    {/snippet}
  </Alert>
{:else}
  <Button label="Show the alert again" intent="neutral" appearance="outline" onactivate={() => (visible = true)} />
{/if}
```

### Intents

Each intent has its colors and its glyph; a title is optional.

```svelte live
<script lang="ts">
  import { Alert } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); inline-size: 100%">
  <Alert intent="neutral">Comments are visible to everyone in the workspace.</Alert>
  <Alert intent="info" title="Scheduled maintenance">Exports are unavailable on Saturday between 2 and 4 am.</Alert>
  <Alert intent="success" title="Import complete">1,204 contacts were added to your address book.</Alert>
  <Alert intent="warning" title="Storage almost full">You have used 95% of your storage.</Alert>
  <Alert intent="danger" title="Payment failed">Your card was declined. Update it to keep your plan.</Alert>
</div>
```

### Announced when it appears

With `live`, an alert that appears after an action is announced: assertively for danger and warning, politely for the other intents.

```svelte live
<script lang="ts">
  import { Alert, Button, ButtonGroup } from '@ggbrick/svelte';

  // Stands in for the application's request, which fails here.
  const api = { save: () => Promise.reject(new Error('offline')) };

  let failed = $state(false);
  async function save() {
    try {
      await api.save();
      failed = false;
    } catch {
      failed = true;
    }
  }
</script>

<div
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md); inline-size: 100%"
>
  <Button label="Save changes" onactivate={save} />
  {#if failed}
    <Alert intent="danger" title="The changes were not saved" live dismissible ondismiss={() => (failed = false)}>
      The connection was lost. Your edits are kept on this device.
      {#snippet actions()}
        <ButtonGroup>
          <Button label="Try again" intent="neutral" appearance="outline" onactivate={save} />
        </ButtonGroup>
      {/snippet}
    </Alert>
  {/if}
</div>
```

### A custom icon

The `icon` snippet replaces the glyph of the intent; it is decorative and drawn in the icon color.

```svelte live
<script lang="ts">
  import { Alert, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

<Alert intent="success" title="Your export is ready">
  {#snippet icon()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
  The file stays available for 7 days.
</Alert>
```

### Difficult cases

- Every option together, the alert removed on dismiss and shown again (`#playground`).
- Every intent with and without a title (`#matrix`).
- Accent, neutral and danger buttons in solid, outline and ghost, with a link, in every intent (`#actions`).
- A live failed save, and a long title and message wrapping in a narrow column next to a custom icon and a dismiss button (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Alert } from '@ggbrick/svelte';
import type { AlertProps, AlertIntent } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-alert">` (plus any class you pass) with `data-intent`, taking the full inline size it is given. With `live`, it carries `role="alert"` for danger and warning and `role="status"` for the other intents; without it, no role. The title and content are `div` elements, the dismiss button an IconButton.

| Prop           | Type                                                        | Default     | Description                                                                                                                  |
| -------------- | ----------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `intent`       | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'info'`    | Color family and default glyph; the action family of the buttons inside.                                                     |
| `title`        | `string`                                                    | `''`        | A short heading, in label typography. An alert without a title and without content throws, on the server and in the browser. |
| `children`     | `Snippet`                                                   | —           | The message, in body typography: a sentence, a link, a short list. Links take the content color unless they set a tone.      |
| `icon`         | `Snippet`                                                   | —           | Replaces the glyph of the intent: an Icon, or an `svg` drawn in `currentColor`. Decorative.                                  |
| `actions`      | `Snippet`                                                   | —           | One ButtonGroup of follow-up actions under the content; its buttons are small (`sm`) unless the group sets a `size`.         |
| `dismissible`  | `boolean`                                                   | `false`     | Shows the dismiss button at the inline end.                                                                                  |
| `dismissLabel` | `string`                                                    | `'Dismiss'` | Accessible name of the dismiss button.                                                                                       |
| `live`         | `boolean`                                                   | `false`     | Announces the alert when it appears or its text changes: assertive for danger and warning, polite otherwise.                 |
| `ondismiss`    | `() => void`                                                | —           | Called when the user activates the dismiss button; remove the alert from the page there.                                     |
| `ref`          | `HTMLDivElement \| null` (bindable)                         | `null`      | The alert element.                                                                                                           |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `class`, `aria-labelledby`…) goes to the alert element, except those the component owns: `children`, `role`, `aria-live` and `title` (the `title` prop is the heading, not the native tooltip attribute). Inside the alert, Buttons and IconButtons of intent accent or neutral, the dismiss button included, take the action family of the intent in every appearance; danger buttons keep their own. A ButtonGroup around the alert does not size its dismiss button. The platform-independent contract ships as `contracts/alert.json`.

## Accessibility

The component provides:

- Plain content by default, not announced; with `live`, `role="alert"` (assertive) for danger and warning and `role="status"` (polite) for the other intents, announced when the alert appears or its text changes.
- An alert that is never focusable and never moves focus.
- A decorative glyph hidden from assistive technology; the title and content are the text that is read.
- A dismiss button that is a native button named by `dismissLabel`, with a 44 × 44 px target and a visible focus ring; the action buttons keep their own keyboard behavior.
- Colors from the status roles of the intent, buttons and links that follow it, and in forced-colors mode a visible edge with the icon and text in the system text color.

The integration provides:

- The meaning in words, in the title or the content.
- `live` for an alert that appears after something happens, and none for alerts present when the page loads.
- The removal of a dismissed alert, and a sensible place for focus once the dismiss button has left with it.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                   |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (glyph hidden, text read in order)                     |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Integration (the meaning in words); the icon reinforces it       |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component (status content on the status surface)                 |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component (buttons in the intent family); the edge is decorative |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component (dismiss and action buttons)                           |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component (dismiss button)                                       |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)     | A     | Integration (a failure described in words)                       |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (dismiss button named by `dismissLabel`)               |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Component with `live`; integration (setting it)                  |

Validated by automated checks in Chromium (axe-core in light and dark, desktop and mobile, the dismiss event and name, no live role by default and the live roles per intent, icon and dismiss on the first line, small actions under the content, button and link colors per intent in every context, the block-end padding with actions, forced colors, computed values for every intent in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
