# Toast

## Overview

A toast is a brief notification about something the user just did or that just happened in the background: changes saved, a message sent, a report deleted with Undo, an upload that failed. Toasts appear in one notifications region per page, above the page and without blocking it, and most leave by themselves after a few seconds.

## Anatomy

| #   | Part        | Required | Role                                                                                                                                                                |
| --- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Icon        | yes      | The glyph of the intent (info for neutral and info, check-circle, warning, warning-circle) in the status icon color, hidden from assistive technology; replaceable. |
| 2   | Title       | yes      | What happened, in label typography; plain text that wraps.                                                                                                          |
| 3   | Description | no       | A short detail in body typography under the title; with a description, the toast lays out on several lines.                                                         |
| 4   | Action      | no       | One small Button for a secondary follow-up (Undo, Retry, View): on the row without a description, under the description with one.                                   |
| 5   | Dismiss     | no       | A small ghost IconButton with the close glyph, named by `dismissLabel`; shown by default, and always kept by a toast that never leaves by itself.                   |

A width: `size.overlay.panel` (360 px), or the region when narrower; padding `space.content.md` (8, 12 or 16 px in compact, standard and comfortable density), gaps `space.content.sm` (4, 8 or 12 px), `radius.overlay` corners, `shadow.overlay`, an edge of `border.width.default` in `color.elevation.border` on `color.surface.overlay` (intense: `color.status.{intent}.border` on `color.status.{intent}.surface`). B action gap: `space.content.sm` under the description; title gap `space.content.xs` (2, 4 or 6 px).

The region (ToastRegion) sits at `space.layout.sm` (8, 16 or 24 px) from the viewport edges named by its placement and separates its toasts by `space.content.sm`; the newest toast is nearest that edge.

## When to use

- A confirmation of something the user just did: Changes saved, Message sent.
- An action that can be undone for a moment: Report deleted, with Undo.
- A background event the user should notice, such as an upload that failed, with Retry.

## When not to use

- A durable message about the page, a section or a task: Alert.
- A message that must be answered before going on: Dialog.
- An error on one field: the message of its Field.
- Feedback about the task of an open modal dialog: a message inside the Dialog.
- Rich content such as images or forms: Popover or Dialog.

## Best practices

| Guidance | Topic    | Practice                                                                                                                                    |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Region   | Render one ToastRegion per page, in the application layout, and keep the list of toasts in the application's state.                         |
| Do       | Removal  | Remove a toast from the list in `ondismiss`: the dismiss button, the end of the countdown, Escape and the action all call it.               |
| Do       | Title    | Say what happened in a short title (“Message sent”) and add a description only for a useful detail.                                         |
| Do       | Action   | Use one small ghost or outline Button, neutral or danger for a destructive follow-up, and offer the same action elsewhere in the interface. |
| Do       | Danger   | Use the danger intent for a failure the user must see: by default it stays until it is dismissed.                                           |
| Do       | Intense  | Use `appearance="intense"` for a stronger message; its action and dismiss button then follow the intent.                                    |
| Don't    | Accent   | Put an accent call to action in a toast: its action is a secondary follow-up.                                                               |
| Don't    | Duration | Rely on a toast for information the user must keep: it leaves after 5 seconds, or 8 with an action, unless you set a duration.              |
| Don't    | Dialog   | Send a toast from an open modal dialog: the dialog makes the region inert until it closes.                                                  |
| Don't    | Focus    | Move focus to a toast when it appears: it is announced without taking focus.                                                                |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/toast/App.svelte`, not shipped in the package). A page holds one notifications region, so these examples are shown as code; the playground at the top of the documentation site previews the toast and its Show live button sends it into the page's region.

### Send a toast

The usual case: the application keeps the list, adds a toast to show it and removes it when it asks to leave.

```svelte
<script lang="ts">
  import { Button, Toast, ToastRegion } from '@ggbrick/svelte';
  import type { ToastItemIntent } from '@ggbrick/svelte';

  type Item = { id: number; intent: ToastItemIntent; title: string };
  let toasts = $state<Item[]>([]);
  let next = 1;
  function notify(item: Omit<Item, 'id'>) {
    toasts.push({ id: next++, ...item });
  }
  function remove(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
  }
</script>

<Button label="Save changes" onactivate={() => notify({ intent: 'success', title: 'Changes saved' })} />

<ToastRegion>
  {#each toasts as toast (toast.id)}
    <Toast intent={toast.intent} title={toast.title} ondismiss={() => remove(toast.id)} />
  {/each}
</ToastRegion>
```

### An action to undo

With an action, the toast leaves after 8 seconds by default, and right after its action runs. The same action stays available elsewhere.

```svelte
<script lang="ts">
  import { Button, Toast, ToastRegion } from '@ggbrick/svelte';

  let deleted = $state(false);
  let shown = $state(false);
</script>

<p>{deleted ? 'Quarterly report: in the trash.' : 'Quarterly report'}</p>
<Button
  label={deleted ? 'Restore' : 'Delete'}
  intent={deleted ? 'neutral' : 'danger'}
  appearance="outline"
  onactivate={() => {
    deleted = !deleted;
    shown = deleted;
  }}
/>

<ToastRegion>
  {#if shown}
    <Toast title="Report deleted" description="It stays in the trash for 30 days." ondismiss={() => (shown = false)}>
      {#snippet action()}
        <Button label="Undo" intent="neutral" appearance="outline" onactivate={() => (deleted = false)} />
      {/snippet}
    </Toast>
  {/if}
</ToastRegion>
```

### A failure that stays

A danger toast has no countdown by default and keeps its dismiss button; the intense appearance tints it by its intent, and its neutral action follows the intent too.

```svelte
<script lang="ts">
  import { Button, Toast, ToastRegion } from '@ggbrick/svelte';

  let failed = $state(false);
  // Stands in for the application's upload.
  function upload() {
    failed = true;
  }
</script>

<Button label="Upload" onactivate={upload} />

<ToastRegion>
  {#if failed}
    <Toast
      intent="danger"
      appearance="intense"
      title="Upload failed"
      description="quarterly-report.pdf is larger than 50 MB."
      ondismiss={() => (failed = false)}
    >
      {#snippet action()}
        <Button label="Retry" intent="neutral" appearance="outline" onactivate={upload} />
      {/snippet}
    </Toast>
  {/if}
</ToastRegion>
```

### Placement, queue and duration

The region shows at most `max` toasts; the next ones wait and appear as shown toasts leave. A set `duration` wins over the defaults, and `0` keeps the toast until it is dismissed.

```svelte
<ToastRegion placement="top-center" max={2}>
  {#each toasts as toast (toast.id)}
    <Toast title={toast.title} duration={toast.sticky ? 0 : 10000} ondismiss={() => remove(toast.id)} />
  {/each}
</ToastRegion>
```

### Difficult cases

- Every intent at once with a `max` of three, the queue, the six placements, a set duration and `closable` off (`#playground`).
- The countdown paused while the pointer is over the region or focus is inside it (`#playground`).
- A toast sent from an open modal dialog: seen above it, but inert until the dialog closes, which is why this use is not supported (`#demo-dialog`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { ToastRegion, Toast } from '@ggbrick/svelte';
import type {
  ToastRegionProps,
  ToastProps,
  ToastPlacement,
  ToastItemIntent,
  ToastItemAppearance
} from '@ggbrick/svelte';
```

There is no sending function: the application keeps the list of toasts in its state, renders a Toast for each item inside the ToastRegion, oldest first, and removes the item when the toast calls `ondismiss`.

### ToastRegion

Renders a `<div class="ggb-toast">` (plus any class you pass) with `role="region"`, `aria-label`, `data-placement` and `popover="manual"`, shown in the top layer once mounted and raised again whenever another overlay enters the top layer after it; where the platform has no top layer it is stacked at `layer.toast`. It lets presses through between its toasts.

| Prop        | Type                                                                                            | Default           | Description                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `placement` | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'`    | Viewport corner or edge center where the toasts appear, the newest nearest the edge.       |
| `max`       | `number`                                                                                        | `3`               | How many toasts are shown at once (one at least); the next ones wait their turn, in order. |
| `label`     | `string`                                                                                        | `'Notifications'` | Name of the notifications landmark.                                                        |
| `children`  | `Snippet`                                                                                       | —                 | The Toasts, oldest first, as direct children.                                              |
| `ref`       | `HTMLDivElement \| null` (bindable)                                                             | `null`            | The region element.                                                                        |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `class`…) goes to the region element, except those the component owns: `children`, `role`, `aria-label` and `popover`.

### Toast

Renders a `<div class="ggb-toast__item">` (plus any class you pass) with `data-intent`, `data-appearance`, `data-layout` (`single` without a description, `multi` with one), `role="alert"` for danger and `role="status"` otherwise, and `aria-atomic="true"`. A toast waiting beyond `max` carries `data-queued` and is not displayed.

| Prop           | Type                                                        | Default     | Description                                                                                                                                                                                        |
| -------------- | ----------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `string`                                                    | required    | What happened. An empty or blank title throws, on the server and in the browser.                                                                                                                   |
| `description`  | `string`                                                    | `''`        | A short detail under the title.                                                                                                                                                                    |
| `intent`       | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Glyph and icon color; danger is announced assertively and has no default countdown.                                                                                                                |
| `appearance`   | `'neutral' \| 'intense'`                                    | `'neutral'` | `neutral`: overlay surface, the icon carries the intent. `intense`: tinted by the intent like an Alert; its accent and neutral buttons take the intent's action family.                            |
| `duration`     | `number`                                                    | —           | Milliseconds before the toast leaves by itself. Not set: none for danger (even with an action), 8000 with an action, 5000 otherwise. `0` keeps the toast until it is dismissed or its action runs. |
| `closable`     | `boolean`                                                   | `true`      | Shows the dismiss button. `false` removes it only from a toast that leaves by itself; a toast without a countdown keeps it.                                                                        |
| `dismissLabel` | `string`                                                    | `'Dismiss'` | Accessible name of the dismiss button.                                                                                                                                                             |
| `icon`         | `Snippet`                                                   | —           | Replaces the glyph of the intent (decorative, drawn in `currentColor`).                                                                                                                            |
| `action`       | `Snippet`                                                   | —           | One Button for a secondary follow-up, made small: ghost or outline, neutral, or danger for a destructive follow-up. After its own handler runs, the toast asks to leave.                           |
| `ondismiss`    | `() => void`                                                | —           | Called once when the toast asks to leave: its dismiss button, the end of its countdown, Escape inside it, or after its action. Remove it from the list there.                                      |
| `ref`          | `HTMLDivElement \| null` (bindable)                         | `null`      | The toast element.                                                                                                                                                                                 |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `class`…) goes to the toast element, except those the component owns: `children`, `role`, `title`, `aria-live` and `aria-atomic`. The countdown pauses while the pointer is over the region, while focus is inside it, while the document is hidden and while the toast waits in the queue, and resumes with the time that was left. A toast enters from the region's edge and, once removed from the list, fades out while the others close the gap; under reduced motion it only fades. The platform-independent contract ships as `contracts/toast.json`.

## Accessibility

The component provides:

- A region landmark named by `label`, in the top layer above the page; toasts appear in it without moving focus.
- `role="status"` (polite) on every toast except danger, which has `role="alert"` (assertive), with `aria-atomic="true"`.
- A countdown paused on hover, on focus inside the region and while the document is hidden; no countdown by default for danger, and a dismiss button always kept by a toast that never leaves by itself.
- The action and dismiss buttons as Tab stops in the region's reading order, Escape inside a toast to dismiss it, a dismiss button named by `dismissLabel` with a 44 × 44 px target and a visible focus ring.
- Contrast pairs checked for the neutral and intense appearances, an entry that only fades under reduced motion, and a visible edge in forced-colors mode.

The integration provides:

- One region per page, the list of toasts and their removal in `ondismiss`.
- The same action elsewhere in the interface, since a toast with an action leaves after 8 seconds by default, and a longer or zero `duration` where users need more time.
- Feedback about an open modal dialog's task inside the dialog, never in a toast: the dialog makes the region inert until it closes.
- A placement that does not hide the element that has focus, and a place for the region in the reading order of the page.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------ |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, in both appearances                                                                               |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component (icon on both surfaces)                                                                            |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component (Tab to the buttons, Escape)                                                                       |
| [2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)                      | A     | Component (pause on hover and focus, danger without countdown); integration (duration, the action elsewhere) |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (region reading order); integration (where the region is rendered)                                 |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Integration (placement)                                                                                      |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (dismiss and action buttons)                                                                       |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                                                                    |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Component (status and alert roles), except from an open modal dialog                                         |

Validated by automated checks in Chromium (axe-core in light and dark, desktop and mobile, the named landmark in the top layer, the roles per intent, the newest toast nearest the edge, the default and set countdowns and their pause on hover and focus, the action, Escape and the dismiss button, `closable`, both layouts, the intense colors and button families, the queue beyond `max`, the region above a modal dialog and inert while it is open, forced colors, computed values in representative contexts) and by a smoke test in Firefox and WebKit (the region in the top layer, a toast shown and dismissed); no assistive-technology test yet. This list is not a conformance claim.
