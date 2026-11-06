# Progress

## Overview

A progress bar shows how far a task of known size has gone, such as an upload, an export or an import in five steps, or that a longer task is under way when its end is not known. A label above the bar says what is in progress, and the percentage can be shown beside it.

## Anatomy

| #   | Part      | Required | Role                                                                                                                             |
| --- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Label     | yes      | What is in progress, on one line, shortened when too long; the accessible name of the bar, kept even when it is not shown. With neither label nor value shown, their line takes no room. |
| 2   | Value     | no       | The whole percentage at the end of the label line, steady in width as it changes; not shown when indeterminate. |
| 3   | Track     | yes      | The whole bar, standing for the whole task; it fills the width of its container. |
| 4   | Indicator | yes      | The part done, from the start edge over `value ÷ max` of the track, following the intent; none at 0; a sweeping segment when indeterminate. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/progress.json`.

## When to use

- An upload, a download or an export whose size is known.
- A process in steps (“Step 3 of 5”), with `value` and `max` counting the steps.
- A longer task under way without a known end (server processing): `indeterminate`, until a value is known.
- The result of such a task left in place: `success` when it completed, `danger` when it failed.

## When not to use

- A short wait in a small place, or a control that is working: Spinner, or the `loading` prop of Button and IconButton.
- The first load of a region whose layout is known: Skeleton.
- A static value in a range, such as disk usage or a score: a meter (planned).
- Steps with their own labels the user can move between: a stepper (planned).
- A circular progress indicator: not built in; use the bar.

## Best practices

| Guidance | Topic         | Practice                                                                                                                     |
| -------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label         | Say what is in progress, with the object: “Uploading quarterly-report.pdf”, “Importing contacts”.                            |
| Do       | Value         | Use `showValue` when the percentage helps the user decide to wait; the bar exposes the value to assistive technology anyway. |
| Do       | Steps         | Count steps with `max` (`value={3} max={5}`) and name the step in the label.                                                 |
| Do       | Indeterminate | Start `indeterminate` while the size is unknown, and switch to a value as soon as one is known.                              |
| Do       | Intent        | Switch to `success` or `danger` at the end and change the label to say so (“Upload complete”, “Import failed at step 3”).    |
| Do       | Width         | Give the bar the width of the content it relates to; it fills its container.                                                 |
| Don't    | Color         | Rely on the intent alone: the color is never the only sign of a failure or a warning.                                        |
| Don't    | Hidden label  | Set `showLabel={false}` unless a visible heading or text right next to the bar already says what is in progress.             |
| Don't    | Short waits   | Show a bar for a wait of a second or two, or one that jumps from 0 to 100: a Spinner, or nothing, is calmer.                 |
| Don't    | Backwards     | Move the value back, except when the task restarts: the user reads the bar as time left.                                     |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/progress/App.svelte`, not shipped in the package).

### An upload

```svelte live
<script lang="ts">
  import { Progress } from '@ggbrick/svelte';
</script>

<div style="inline-size: min(28rem, 100%)">
  <Progress label="Uploading quarterly-report.pdf" value={40} showValue />
</div>
```

### A task that advances, then completes

The label and the intent change at the end, so that the outcome is stated in words and not by the color alone.

```svelte live
<script lang="ts">
  import { Button, Progress } from '@ggbrick/svelte';

  let upload = $state(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  function start() {
    clearInterval(timer);
    upload = 0;
    timer = setInterval(() => {
      upload = Math.min(upload + 10, 100);
      if (upload === 100) clearInterval(timer);
    }, 300);
  }
</script>

<div
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md); inline-size: min(28rem, 100%)"
>
  <div style="align-self: stretch">
    <Progress
      label={upload === 100 ? 'Upload complete' : 'Uploading photos'}
      value={upload}
      intent={upload === 100 ? 'success' : 'accent'}
      showValue
    />
  </div>
  <Button label="Start upload" intent="neutral" appearance="outline" size="sm" onactivate={start} />
</div>
```

### Steps, intents and sizes

```svelte live
<script lang="ts">
  import { Progress } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg); inline-size: min(28rem, 100%)">
  <Progress label="Import failed at step 3 of 5" value={3} max={5} intent="danger" showValue />
  <Progress label="Syncing: 2 files need your attention" value={80} intent="warning" size="sm" />
  <Progress label="Exporting the archive" value={65} size="lg" showValue />
</div>
```

### Indeterminate, label not shown

A visible heading already says what is in progress; the label stays the accessible name of the bar.

```svelte live
<script lang="ts">
  import { Progress } from '@ggbrick/svelte';
</script>

<section
  aria-labelledby="import-title"
  style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm); inline-size: min(28rem, 100%)"
>
  <h3 id="import-title" style="margin: 0; font: var(--ggb-typography-label-md)">Processing the import</h3>
  <Progress label="Processing the import" indeterminate showLabel={false} />
</section>
```

### Difficult cases

- A value below 0 or above `max` is clamped, a fraction of 0 shows no indicator, and `max` changes the percentage (`#playground`).
- Every intent in every size (`#matrix`).
- An upload that advances, an indeterminate bar with its label hidden, steps as a fraction, a long label in a narrow column, a brand with square bars, empty and full bars (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Progress.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Progress } from '@ggbrick/svelte';
import type { ProgressProps, ProgressIntent, ProgressSize } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-progress">` (plus any class you pass) with `data-intent` and `data-size`. It holds the first line (`ggb-progress__header`) with the label (`<span class="ggb-progress__label">`, visually hidden when `showLabel` is false) and the percentage (`<span class="ggb-progress__valueText" aria-hidden="true">`), then the progress bar: a `<div class="ggb-progress__track" role="progressbar">` with `aria-labelledby` pointing to the label, `aria-valuemin="0"`, `aria-valuemax` and `aria-valuenow` (absent when indeterminate), the Bits UI `data-state`, `data-value`, `data-min`, `data-max` and `data-indeterminate`, holding the `ggb-progress__indicator`.

| Prop            | Type                                             | Default    | Description                                                                                                                                      |
| --------------- | ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`         | `string`                                         | required   | What is in progress; the accessible name, shown by default. Must be non-empty: an empty or blank label throws, on the server and in the browser. |
| `value`         | `number`                                         | `0`        | Progress so far, clamped between 0 and `max` (a value above `max` shows a full bar). Ignored when indeterminate.                                 |
| `max`           | `number`                                         | `100`      | The value of a completed task; a value that is not a positive number falls back to 100.                                                          |
| `indeterminate` | `boolean`                                        | `false`    | A task under way without a known end: a segment of the track sweeps from start to end, no value and no percentage are exposed. |
| `showLabel`     | `boolean`                                        | `true`     | Shows the label above the track; false keeps it as the visually hidden accessible name.                                                          |
| `showValue`     | `boolean`                                        | `false`    | Shows the whole percentage of `value ÷ max` at the end of the label line (not when indeterminate).                                               |
| `intent`        | `'accent' \| 'success' \| 'warning' \| 'danger'` | `'accent'` | Color of the indicator: an ordinary task, a completed one, one that needs attention, a failed one.                                               |
| `size`          | `'sm' \| 'md' \| 'lg'`                           | `'md'`     | Thickness of the track. It does not change with the density. |
| `ref`           | `HTMLElement \| null` (bindable)                 | `null`     | The progress bar element.                                                                                                                        |
| `class`         | `string`                                         | —          | Merged with `ggb-progress` on the outer element.                                                                                                 |

`id` and every other attribute of the Bits UI `Progress.Root` props (`aria-describedby`, `data-*`…) go to the progress bar element, except those the component owns: `children`, `child`, `value`, `max`, `min`, `aria-label` and `aria-labelledby`. With an `id`, the label's id is `<id>-label`. There are no events. The fill moves smoothly to each new value, and the indeterminate sweep repeats while the bar is shown. Brand, appearance and density apply through the tokens, without any prop; a brand can square the corners. The platform-independent contract ships as `contracts/progress.json`.

## Accessibility

The component provides:

- `role="progressbar"` named by the label through `aria-labelledby`, whether the label is shown or not, with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; no current value when indeterminate.
- The percentage hidden from assistive technology, since the value is exposed by the bar; never focusable, no events.
- An indicator with a contrast of at least 3:1 against the track and the system surfaces, for every intent in the 18 brand, appearance and density contexts.
- No fill transition under reduced motion and a sweep three times slower; a visible track edge and the system highlight color in forced colors.

The integration provides:

- A label that says what is in progress, and the outcome in words when the intent changes.
- An announcement when the task completes or fails (a status message): the bar is not a live region.
- The removal of an indeterminate bar when the task ends, and contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                        |
| ------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (the label names the bar)                   |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Integration (the outcome stated in the label)         |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces                     |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces                     |
| [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)             | A     | Integration (an indeterminate bar only while it runs) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                             |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration                                           |

Validated by automated checks in Chromium (axe-core in light and dark, role, name, value and bounds, indeterminate without a value, clamping, motion and reduced motion, forced colors, computed values in the 18 contexts, indicator contrast in the 18 contexts) and server-rendering checks; no assistive-technology test yet. This list is not a conformance claim.
