# Tabs

## Overview

Tabs show one of several panels of related content in the same place, with a list of tabs to switch between them: the sections of a settings page, the views of a record (overview, activity, files). Tabs holds TabsTrigger and TabsPanel children, documented on this page.

## Anatomy

| #   | Part     | Required | Role                                                                                                                                                                                                  |
| --- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | List     | yes      | The row of tabs, or column when vertical, named by `label`: a container where the selected tab is raised, or a line where it is marked by a bar. A horizontal list too long for its width scrolls.    |
| 2   | Tab      | yes      | One TabsTrigger, its label on one line and never shortened; exactly one tab is selected, and a disabled tab cannot be.                                                                                |
| 3   | Leading  | no       | One decorative icon before the label, sized by the tab.                                                                                                                                               |
| 4   | Trailing | no       | One Counter or Badge after the label, in the tab's size: a count of items in the panel, a New badge. It is read with the tab's name.                                                                  |
| —   | Panel    | yes      | One TabsPanel per tab, holding any content; only the panel of the selected tab is shown, below the list or after it when vertical. The Figma component is the list only: designers place the content. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/tabs.json`.

## When to use

- Sections of one page, or views of one record, that the user switches between without leaving the page.
- Content of similar weight that is read one panel at a time, not compared side by side.
- A vertical list of sections beside their content, on a settings page.

## When not to use

- Moving to another page: Links in the page's navigation; tabs switch panels in place.
- Several sections open at once, or content read from top to bottom: Accordion.
- Choosing a value in a form: RadioGroup, or SegmentedControl (planned).
- Steps of a sequence completed in order: a stepper (planned).
- Tabs the user closes, reorders or adds: not built in.

## Best practices

| Guidance | Topic       | Practice                                                                                                                                                    |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Name        | Set `label` to name the list, often the heading of the area the tabs switch (“Project”), so that the list is announced with its purpose.                    |
| Do       | Labels      | Keep labels short and parallel (“Overview”, “Activity”, “Files”): a label is never shortened, and tabs that do not fit scroll out of sight.                 |
| Do       | Number      | Use two to about six tabs, so that they all stay visible.                                                                                                   |
| Do       | Trailing    | Use a Counter for the number of items in a panel and a Badge for a status, in the tab's `size`; give the Counter a `label` when the number needs a meaning. |
| Do       | Activation  | Keep automatic activation, and use `activation="manual"` only for panels slow to show, so that arrowing past a tab does not load it.                        |
| Do       | Disabled    | Keep an unavailable tab disabled rather than removing it when users expect it there, and say why in the page if it is not clear.                            |
| Do       | Values      | Give each tab a stable `value` shared with exactly one TabsPanel: a tab's value is read once.                                                               |
| Don't    | Navigation  | Use tabs to open other pages: they switch panels in place; use links.                                                                                       |
| Don't    | Steps       | Hide the steps of a sequence behind tabs: users can open them in any order.                                                                                 |
| Don't    | Form choice | Use tabs to choose a value submitted with a form: use a RadioGroup.                                                                                         |
| Don't    | Icons       | Add an icon to every tab by habit: use one only where it helps recognition, since it is decorative and not announced.                                       |
| Don't    | Nesting     | Put tabs inside a tab panel: two levels of switching are hard to follow.                                                                                    |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/tabs/App.svelte`, not shipped in the package). Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### The usual case

The `list` snippet holds the tabs, the children the panels; `bind:value` follows the selected tab.

```svelte live
<script lang="ts">
  import { Tabs, TabsPanel, TabsTrigger } from '@ggbrick/svelte';

  let view = $state('overview');
</script>

<Tabs label="Project" bind:value={view}>
  {#snippet list()}
    <TabsTrigger label="Overview" value="overview" />
    <TabsTrigger label="Activity" value="activity" />
    <TabsTrigger label="Files" value="files" />
  {/snippet}
  <TabsPanel value="overview"><p>Owner, status and the latest milestone.</p></TabsPanel>
  <TabsPanel value="activity"><p>Twelve updates this week.</p></TabsPanel>
  <TabsPanel value="files"><p>Specifications, exports and attachments.</p></TabsPanel>
</Tabs>
```

### Line, with icons, a counter and a badge

```svelte live
<script lang="ts">
  import { Badge, Counter, Icon, Tabs, TabsPanel, TabsTrigger } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet checks()}<Icon><path d={phosphor.check} /></Icon>{/snippet}
{#snippet issues()}<Icon><path d={phosphor['warning-circle']} /></Icon>{/snippet}
{#snippet downloads()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}

<Tabs label="Release 4.2" appearance="line">
  {#snippet list()}
    <TabsTrigger label="Checks" value="checks" leading={checks} />
    <TabsTrigger label="Issues" value="issues" leading={issues}>
      {#snippet trailing()}<Counter value={3} label="open" />{/snippet}
    </TabsTrigger>
    <TabsTrigger label="Downloads" value="downloads" leading={downloads}>
      {#snippet trailing()}<Badge label="New" intent="accent" />{/snippet}
    </TabsTrigger>
  {/snippet}
  <TabsPanel value="checks"><p>All 24 checks passed.</p></TabsPanel>
  <TabsPanel value="issues"><p>Three open issues, one of them blocking.</p></TabsPanel>
  <TabsPanel value="downloads"><p>Installers for every platform.</p></TabsPanel>
</Tabs>
```

### A vertical list beside its content

Down and Up Arrow move between the tabs and skip the disabled one. The Notifications panel holds a control, so Tab goes to it; the other panels take focus themselves.

```svelte live
<script lang="ts">
  import { Switch, Tabs, TabsPanel, TabsTrigger } from '@ggbrick/svelte';
</script>

<Tabs label="Settings" orientation="vertical" appearance="line">
  {#snippet list()}
    <TabsTrigger label="Profile" value="profile" />
    <TabsTrigger label="Notifications" value="notifications" />
    <TabsTrigger label="Integrations" value="integrations" disabled />
    <TabsTrigger label="Billing" value="billing" />
  {/snippet}
  <TabsPanel value="profile"><p>Your name, photo and language.</p></TabsPanel>
  <TabsPanel value="notifications"><Switch label="Weekly summary by email" /></TabsPanel>
  <TabsPanel value="integrations"><p>Connected apps.</p></TabsPanel>
  <TabsPanel value="billing"><p>Plan, invoices and payment method.</p></TabsPanel>
</Tabs>
```

### Manual activation and the selection event

With manual activation the arrow keys move focus and Enter or Space selects. `onvaluechange` reports only what the user selects: the button sets `value` without an event.

```svelte live
<script lang="ts">
  import { Button, Tabs, TabsPanel, TabsTrigger } from '@ggbrick/svelte';

  const months = ['September', 'October', 'November'];
  let month = $state('November');
  let loads = $state(0);
  let loaded = $state('none');

  function load(value: string) {
    // The application fetches the report of this month.
    loaded = value;
    loads++;
  }
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)">
  <Tabs label="Monthly report" activation="manual" bind:value={month} onvaluechange={load}>
    {#snippet list()}
      {#each months as m (m)}<TabsTrigger label={m} value={m} />{/each}
    {/snippet}
    {#each months as m (m)}<TabsPanel value={m}><p>Report for {m}.</p></TabsPanel>{/each}
  </Tabs>
  <Button label="Show September" intent="neutral" appearance="outline" onactivate={() => (month = 'September')} />
  <p>Loaded by the user: {loads} · last: {loaded}</p>
</div>
```

### Difficult cases

- Keyboard: one tab stop on the selected tab, arrows that wrap and skip the disabled tab, Home and End, Tab into the panel's first control or onto a panel without one; manual activation with Enter and Space (`#playground`).
- A value set by the application selects its tab without calling `onvaluechange` (`#playground`).
- A list too long for its width scrolls without a scrollbar, fades at the edges with hidden tabs and shows a scroll button there, keeping the selected tab in view, in both appearances (`#compositions`).
- A value that matches no enabled tab shows the first enabled one (`#compositions`).
- A vertical list with manual activation and a disabled tab, and right-to-left text, where the arrow keys follow the reading direction (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Tabs`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Tabs, TabsTrigger, TabsPanel } from '@ggbrick/svelte';
import type {
  TabsProps,
  TabsTriggerProps,
  TabsPanelProps,
  TabsAppearance,
  TabsSize,
  TabsOrientation,
  TabsActivation
} from '@ggbrick/svelte';
```

Tabs renders a `<div class="ggb-tabs">` (plus any class you pass) with `data-appearance`, `data-size`, `data-orientation` and `data-activation`. It holds a `<div class="ggb-tabs__bar">` with the tab list, a `<div class="ggb-tabs__list" role="tablist">` with `aria-orientation`, named by `aria-label` when `label` is not blank, then a `<div class="ggb-tabs__panels">` with the panels. When a horizontal list overflows, it scrolls without a scrollbar, the bar carries `data-scrollable`, `data-overflow-start` and `data-overflow-end`, and each edge with hidden tabs shows a ghost IconButton that scrolls the list, out of the tab order and hidden from assistive technology.

| Prop            | Type                                | Default        | Description                                                                                                                                                                     |
| --------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string` (bindable)                 | `''`           | Value of the selected tab; bind it with `bind:value`. Empty, or a value no enabled tab has, shows the first enabled tab.                                                        |
| `label`         | `string`                            | —              | Accessible name of the tab list, often the heading of the area the tabs switch (not displayed).                                                                                 |
| `appearance`    | `'contained' \| 'line'`             | `'contained'`  | `contained`: the tabs in a container, the selected one raised; a horizontal list fills its width, shared equally. `line`: the tabs on a line, the selected one marked by a bar. |
| `size`          | `'sm' \| 'md' \| 'lg'`              | `'md'`         | Size of every tab (height, text, padding) and of the scroll buttons.                                                                                                            |
| `orientation`   | `'horizontal' \| 'vertical'`        | `'horizontal'` | `horizontal`: the list above the panels, Right and Left Arrow move. `vertical`: a column at the inline start, Down and Up Arrow move.                                           |
| `activation`    | `'automatic' \| 'manual'`           | `'automatic'`  | `automatic`: moving focus to a tab selects it. `manual`: focus moves without selecting; Enter or Space selects.                                                                 |
| `list`          | `Snippet`                           | required       | The TabsTrigger children, in order.                                                                                                                                             |
| `children`      | `Snippet`                           | required       | The TabsPanel children, one per tab value.                                                                                                                                      |
| `onvaluechange` | `(value: string) => void`           | —              | Called with the value of the tab the user selects; not when the application sets `value`, nor for the tab already selected.                                                     |
| `id`            | `string`                            | generated      | Base id: tabs get `<id>-tab-<value>`, panels `<id>-panel-<value>`, the value escaped for an id.                                                                                 |
| `ref`           | `HTMLDivElement \| null` (bindable) | `null`         | The root element.                                                                                                                                                               |
| `class`         | `string`                            | —              | Merged with `ggb-tabs`.                                                                                                                                                         |

Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the root, except `children` and `role`.

TabsTrigger renders a `<button class="ggb-tabs__trigger" role="tab">` with the id `<id>-tab-<value>`, `aria-selected`, `aria-controls` (its panel), `data-state` (`active` or `inactive`) and `data-value`; only the selected tab has `tabindex="0"`. A disabled tab has the `disabled` attribute and `data-disabled`. The leading icon is hidden from assistive technology; the trailing Counter or Badge is part of the tab's accessible name. A TabsTrigger outside the list of a Tabs throws, on the server and in the browser.

| Prop       | Type      | Default  | Description                                                                           |
| ---------- | --------- | -------- | ------------------------------------------------------------------------------------- |
| `label`    | `string`  | required | The tab's text, on one line, and its accessible name. An empty or blank label throws. |
| `value`    | `string`  | required | Identifies the tab and its panel; read once, so it must not change.                   |
| `disabled` | `boolean` | `false`  | Shown unavailable, never selected, skipped by the arrow keys.                         |
| `leading`  | `Snippet` | —        | One decorative Icon before the label, sized by the tab.                               |
| `trailing` | `Snippet` | —        | One Counter or Badge after the label; give it the tab's `size`.                       |
| `class`    | `string`  | —        | Merged with `ggb-tabs__trigger`.                                                      |

Every other attribute of `HTMLButtonAttributes` is forwarded to the tab, except `children`, `role`, `id`, `type`, `tabindex`, `aria-selected`, `aria-controls` and `value` (the prop above).

TabsPanel renders a `<div class="ggb-tabs__panel" role="tabpanel">` with the id `<id>-panel-<value>`, named by its tab through `aria-labelledby`, with `data-state`. Panels stay mounted, so their content keeps its state; the panels of unselected tabs have the `hidden` attribute. A panel whose content has no focusable element has `tabindex="0"`, `-1` otherwise, updated as the content changes. A TabsPanel outside a Tabs throws.

| Prop       | Type      | Default  | Description                                 |
| ---------- | --------- | -------- | ------------------------------------------- |
| `value`    | `string`  | required | The value of the tab that shows this panel. |
| `children` | `Snippet` | required | The panel content.                          |
| `class`    | `string`  | —        | Merged with `ggb-tabs__panel`.              |

Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the panel, except `role`, `id` and `hidden`. The platform-independent contract, with its `trigger` and `panel` children, ships as `contracts/tabs.json`.

## Accessibility

The component provides:

- The WAI-ARIA tabs pattern: a tab list named by `label`, with its orientation; tabs that expose whether they are selected or disabled and which panel they control; tab panels named by their tab. Exactly one tab is selected, the first enabled one when `value` names none, also in server rendering.
- One stop in sequential focus, on the selected tab. Right and Left Arrow in a horizontal list (reversed in right-to-left text), Down and Up Arrow in a vertical one, move to the next and previous enabled tab and wrap; Home and End go to the first and last enabled tab; disabled tabs are skipped. With automatic activation moving focus selects; with manual activation Enter or Space does. A press on an enabled tab selects it.
- Tab from the list moves into the selected panel: to its first focusable element, or to the panel itself when it has none, which then shows the focus indicator. The panels of unselected tabs are hidden from every user.
- A list too long for its width scrolls, never the page, and keeps the selected tab in view; its scroll buttons serve pointers only, since the arrow keys reach every tab.
- Selection shown by a raised surface or a bar, never by color alone; the list's line, the selected tab's bar and the focus indicator in system colors, and disabled tabs in the system disabled color, in forced colors; no color transitions under reduced motion.

The integration provides:

- A `label` that names the list, short tab labels, and a `label` on a trailing Counter when its number needs a meaning.
- Accessible panel content, with no navigation or other change of context when a tab is selected.
- Contrast with backgrounds other than the system surfaces, and an explanation of why a tab is disabled when it is not obvious.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------ |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (tab list, tabs, panels named by their tab)                                            |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                                | A     | Component (raised surface or bar for the selected tab)                                           |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces (idle, selected and hovered labels)                            |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (the list scrolls, not the page); integration (a vertical list in a narrow layout)     |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component, on the system surfaces (the selected tab's bar, the focus indicator)                  |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                                                        |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (one stop on the selected tab, then the panel)                                         |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component (tabs and focusable panels)                                                            |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Component (a tab scrolled into view clears the scroll buttons); integration (sticky bars)        |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | Component (the visible label starts the tab's name)                                              |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (tabs at control heights, apart from each other)                                       |
| [3.2.1 On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)                                        | A     | Component (showing a panel is not a change of context); integration (no navigation on selection) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component; integration (the list's `label`)                                                      |

Validated by automated checks in Chromium (axe-core in light and dark, desktop and mobile; roles, names and states; one tab stop, arrow keys with wrapping and the disabled tab skipped, Home and End, Tab into the panel or onto a panel without focusable content; manual activation; selection by the application without an event and the fallback to the first enabled tab; vertical lists and right-to-left text; overflow scrolling and scroll buttons; the focus indicator, reduced motion and forced colors; computed values in four representative contexts) and by server-rendering checks (the selected tab and its panel rendered, blank labels and orphan tabs rejected); no assistive-technology test yet. This list is not a conformance claim.
