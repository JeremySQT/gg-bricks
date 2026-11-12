# Breadcrumb

## Overview

A breadcrumb shows where the current page sits in the site hierarchy, from a top level down to the current page, with a link to each ancestor: Projects / Acme website / Settings / Members in a back office, Docs / Components / Breadcrumb in a documentation site. It complements the main navigation and never replaces it.

## Anatomy

| #   | Part         | Required | Role                                                                                                                                                                        |
| --- | ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Leading      | no       | One decorative icon before an item's label, usually a home icon on the first item; with `hideLabel` the icon shows alone and the label stays the item's name.               |
| 2   | Item (label) | yes      | One level of the path, on one line: a link to an ancestor's page, plain text for a level without a page, or the current page, always last and never a link.                 |
| 3   | Separator    | auto     | A chevron or a slash after every item except the current page; decorative, mirrored in right-to-left text.                                                                  |
| 4   | More         | no       | With `maxItems`, a “…” button after the first item that stands for the hidden levels and opens a Menu listing them as links, in order; it is painted like an ancestor link. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/breadcrumb.json`.

## When to use

- Deep hierarchies, in a back office or a documentation site, where users move up one or several levels.
- Pages reached from a search or a shared link, which need to say where they sit.
- A long path in a narrow header, collapsed behind “…” with `maxItems`.

## When not to use

- A history of visited pages, or a way back to the parent only: a Link (“Back to projects”).
- The steps of a task: Stepper (planned).
- A flat site or a top-level page: the page title alone.
- The main navigation of the site: a navigation bar; the breadcrumb sits beside it.
- Panels of related content on the same page: Tabs.
- The pages of a long list or table: Pagination.
- The sibling pages of each level, in a dropdown per level: not built in.

## Best practices

| Guidance | Topic       | Practice                                                                                                                |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Do       | Path        | Start at a meaningful top level and end with the current page, in hierarchy order, whatever route the user took.        |
| Do       | Labels      | Use the titles of the pages the items lead to, kept short: each label is its link's name.                               |
| Do       | Placement   | Put the breadcrumb at the top of the content, above the page title, in the same place on every page.                    |
| Do       | Home        | Give the first item a home icon through `leading`; with `hideLabel` its label stays the link's name and shows on hover. |
| Do       | Long paths  | Set `maxItems` for deep hierarchies or narrow layouts, so that the top level and the nearest ancestors stay visible.    |
| Do       | No page     | Leave out `href` on a level that has no page of its own: it shows as plain text rather than a link that leads nowhere.  |
| Do       | Translation | Pass `label` and `moreLabel` in the reader's language: “Breadcrumb” and “Show hidden pages” are English.                |
| Don't    | Current     | Expect the current page to be a link: the last item never is, even with `href`.                                         |
| Don't    | Purpose     | Use a breadcrumb for the steps of a task or the pages visited: it mirrors the site hierarchy.                           |
| Don't    | Navigation  | Replace the main navigation with it: a breadcrumb only shows the way up.                                                |
| Don't    | Icons       | Put an icon on every item: one home icon on the first is enough, and icons are not announced.                           |
| Don't    | Collapse    | Let `maxItems` hide levels without a page: in the menu they become items that lead nowhere.                             |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/breadcrumb/App.svelte`, not shipped in the package).

### The usual case

The items run from the top level to the current page, last; each ancestor with `href` is a link.

```svelte live
<script lang="ts">
  import { Breadcrumb } from '@ggbrick/svelte';
</script>

<Breadcrumb
  items={[
    { label: 'Projects', href: '#projects' },
    { label: 'Acme website', href: '#acme' },
    { label: 'Settings', href: '#settings' },
    { label: 'Members' }
  ]}
/>
```

### A home icon

The `leading` snippet receives each item and its index; it draws the icon on the first item only. With `hideLabel`, the link shows the icon alone and is still named “Home”.

```svelte live
<script lang="ts">
  import { Breadcrumb, Icon } from '@ggbrick/svelte';
  import type { BreadcrumbItem } from '@ggbrick/svelte';

  // Phosphor “house”, standing in for your icon set.
  const house =
    'M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z';

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '#home', hideLabel: true },
    { label: 'Invoices', href: '#invoices' },
    { label: 'Invoice 1024' }
  ];
</script>

{#snippet home(_item: BreadcrumbItem, index: number)}{#if index === 0}<Icon><path d={house} /></Icon>{/if}{/snippet}

<Breadcrumb {items} leading={home} />
```

### Size, separator and a level without a page

Size `md` for a breadcrumb above a large title, the slash separator, and a level that has no page of its own in plain text.

```svelte live
<script lang="ts">
  import { Breadcrumb } from '@ggbrick/svelte';
</script>

<Breadcrumb
  size="md"
  separator="slash"
  items={[{ label: 'Docs', href: '#docs' }, { label: 'Components' }, { label: 'Breadcrumb' }]}
/>
```

### A long path collapsed

With `maxItems={4}`, the first item and the last three stay; “…” opens a menu of the levels in between.

```svelte live
<script lang="ts">
  import { Breadcrumb } from '@ggbrick/svelte';

  const items = [
    { label: 'Home', href: '#home' },
    { label: 'Workspaces', href: '#workspaces' },
    { label: 'Marketing', href: '#marketing' },
    { label: 'Campaigns', href: '#campaigns' },
    { label: '2026', href: '#2026' },
    { label: 'Spring launch', href: '#spring' },
    { label: 'Assets' }
  ];
</script>

<Breadcrumb {items} maxItems={4} />
```

### In another language

The landmark name and the name of the “…” button follow the page's language.

```svelte live
<script lang="ts">
  import { Breadcrumb } from '@ggbrick/svelte';
</script>

<div lang="fr">
  <Breadcrumb
    label="Fil d’Ariane"
    moreLabel="Afficher les pages masquées"
    maxItems={3}
    items={[
      { label: 'Accueil', href: '#accueil' },
      { label: 'Projets', href: '#projets' },
      { label: 'Site Acme', href: '#acme' },
      { label: 'Membres' }
    ]}
  />
</div>
```

### Difficult cases

- Keyboard: each link is a Tab stop and the current page is skipped; with `maxItems` the “…” button comes after the first link, Enter opens its menu and Escape returns focus to it (`#playground` on the review page, Max items 3 or 4).
- A home icon without its label: the link is named “Home” and shows it on hover; without the icon the label always shows, whatever `hideLabel` says (`#playground`, Show home icon and Show home label).
- A narrow column: ancestors truncate first, each down to about three characters, with the ellipsis right before the separator, the current page last; hovering a truncated link shows its full label (`#compositions`).
- A long path collapsed after four items, and right-to-left text, where the separators are mirrored (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5; Bits UI is not used, and the “…” button opens the package's Menu). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Breadcrumb } from '@ggbrick/svelte';
import type { BreadcrumbProps, BreadcrumbItem, BreadcrumbSize, BreadcrumbSeparator } from '@ggbrick/svelte';
```

Renders a `<nav class="ggb-breadcrumb">` (plus any class you pass) named by `aria-label` and carrying `data-size`, around an `<ol class="ggb-breadcrumb__list">` with one `<li class="ggb-breadcrumb__entry">` per shown item. An ancestor with `href` is an `<a class="ggb-breadcrumb__item">`, an ancestor without it a `<span>` with the same class, and the last item a `<span>` with `aria-current="page"` and `data-current`. The label sits in `.ggb-breadcrumb__item-label`, the leading content in an `aria-hidden` span before it; each item gets a `title` with its full label while the label is truncated or hidden. Every item but the last is followed by an `aria-hidden` SVG separator: Phosphor's caret-right for `chevron`, a slash drawn on the same grid for `slash`. When the path collapses, an extra `<li class="ggb-breadcrumb__entry ggb-breadcrumb__more">` after the first item holds a Menu whose trigger is a `<button type="button" class="ggb-breadcrumb__item ggb-breadcrumb__more-trigger">` showing “…”, named by `moreLabel` (`aria-label` and `title`); the menu lists the hidden items as MenuItems with their label and `href`, without leading content.

| Prop        | Type                                | Default               | Description                                                                                                                                                                                      |
| ----------- | ----------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `items`     | `BreadcrumbItem[]`                  | required              | The levels from the top to the current page, last. An empty list or an item with an empty or blank label throws, on the server and in the browser.                                               |
| `label`     | `string`                            | `'Breadcrumb'`        | Accessible name of the navigation landmark.                                                                                                                                                      |
| `size`      | `'sm' \| 'md'`                      | `'sm'`                | Text, icon and separator size.                                                                                                                                                                   |
| `separator` | `'chevron' \| 'slash'`              | `'chevron'`           | The glyph between items, mirrored in right-to-left text.                                                                                                                                         |
| `maxItems`  | `number`                            | `0`                   | Above zero, when there are more items than `maxItems` (rounded down, counted as at least 3), keeps the first and the last `maxItems` − 1 items and puts the others in a menu; 0 never collapses. |
| `moreLabel` | `string`                            | `'Show hidden pages'` | Accessible name of the “…” button that opens the menu of hidden items.                                                                                                                           |
| `leading`   | `Snippet<[BreadcrumbItem, number]>` | —                     | Rendered before the label of every shown item, with the item and its index in `items`: one decorative Icon, sized by the item, or nothing for items without one.                                 |
| `ref`       | `HTMLElement \| null` (bindable)    | `null`                | The `<nav>` element.                                                                                                                                                                             |
| `class`     | `string`                            | —                     | Merged with `ggb-breadcrumb`.                                                                                                                                                                    |

Each `BreadcrumbItem` is a record:

| Field       | Type      | Default  | Description                                                                                                                                     |
| ----------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string`  | required | The visible text and the item's accessible name, on one line.                                                                                   |
| `href`      | `string`  | —        | The ancestor's page; without it the ancestor is plain text. Ignored on the last item, which is never a link.                                    |
| `hideLabel` | `boolean` | `false`  | Hides the label when `leading` renders an icon for this item; the label stays the accessible name and shows on hover. Without an icon it shows. |

Every other attribute of `HTMLAttributes<HTMLElement>` is forwarded to the `<nav>` (`id`, `data-*`, event handlers…), except `children`; `aria-label` and `data-size` come from `label` and `size` and override what you pass. There are no events: ancestor links navigate as native links. The platform-independent contract, with its `item` child, ships as `contracts/breadcrumb.json`.

## Accessibility

The component provides:

- A navigation landmark named by `label` holding an ordered list in hierarchy order; the current page is last, exposed with `aria-current="page"` and is not a link.
- Native links, each its own Tab stop in source order, with no arrow-key navigation; separators and leading icons are hidden from assistive technology.
- The full label as the accessible name of a truncated or hidden label, shown on hover as well.
- A native “…” button named by `moreLabel` that exposes whether its menu is expanded; the menu behaves as a Menu (arrows, Home, End, typeahead, Enter to follow a link, Escape back to the button).
- Link targets that reach the minimum target height without changing the line, a focus ring on keyboard focus, the system link and text colors in forced colors, and no color transition under reduced motion.

The integration provides:

- Labels that match the titles of the pages, and `label` and `moreLabel` in the reader's language.
- The breadcrumb in the same place on every page, beside the main navigation, and `maxItems` where long labels would be truncated, since the full label only shows on pointer hover.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (named landmark, ordered list, current page)                 |
| [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)                  | A     | Component (hierarchy order); integration (the order of `items`)        |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces (ancestors and current page)         |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (one line that fits its container); integration (`maxItems`) |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                              |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (source order, focus back on the “…” button)                 |
| [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)        | A     | Component (full label as the name); integration (the labels)           |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component                                                              |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Integration (sticky bars, overlays)                                    |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | Component (the label is the name)                                      |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (targets extended to the minimum height)                     |
| [3.2.3 Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)              | AA    | Integration (same place on every page)                                 |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component (links, current page, the “…” button's expanded state)       |

Beyond A and AA, a breadcrumb serves [2.4.8 Location](https://www.w3.org/WAI/WCAG22/Understanding/location.html) (AAA): it tells the reader where the page sits in the set of pages.

Validated by automated checks in Chromium (landmark name, Tab order skipping the current page, the current page as a non-link, decorative separators, the collapsed menu opened with Enter listing the hidden links in order and Escape back to the “…” button, truncation of ancestors with the full label as name and title, mirrored separators in right-to-left text, regular spacing, a hidden home label kept as name and title, computed values in four representative contexts, axe-core in light and dark, no horizontal overflow at mobile width) and by server-rendering tests (structure, collapse, rejected input); no forced-colors check, no test in Firefox or WebKit and no assistive-technology test yet. This list is not a conformance claim.
