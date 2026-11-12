# Pagination

## Overview

A pagination moves through a long list or table split into numbered pages, showing where the user is and letting them jump to another page: the results of a search, the rows of an orders table, the archive of a blog. It shows the first and last pages, the current page and its neighbors, with Previous and Next buttons that never move while the user pages.

## Anatomy

| #   | Part     | Required | Role                                                                                                                             |
| --- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | First    | no       | A button with a double chevron that goes to page 1, shown with `showEdges`; disabled on page 1, it stays in place.               |
| 2   | Previous | yes      | A button with a chevron towards the start that goes to the previous page; disabled on page 1, it stays in place.                 |
| 3   | Item     | yes      | One page, named by its number; the current page is highlighted with an edge and exposed as the current page.                     |
| 4   | Ellipsis | no       | Stands for a run of two or more hidden pages; it is not interactive and is not announced.                                        |
| 5   | Next     | yes      | A button with a chevron towards the end that goes to the next page; disabled on the last page, it stays in place.                |
| 6   | Last     | no       | A button with a double chevron that goes to the last page, shown with `showEdges`; disabled on the last page, it stays in place. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/pagination.json`.

## When to use

- A list or table too long for one screen, split into pages the user may want to jump between.
- Results whose position matters to the user: “page 3 of 20”, a page to come back to.
- Server-rendered pages where each page has its own URL.

## When not to use

- A feed or a timeline read in order: a Load more Button, or loading as the user scrolls, which is not built in.
- Paging without a known number of pages, as with cursor-based APIs: Previous and Next Buttons in a ButtonGroup.
- Switching between views of the same content: Tabs.
- Showing where a page sits in a hierarchy: Breadcrumb.
- Choosing how many rows a page shows: a Select placed next to the pagination; it is not part of it.

## Best practices

| Guidance | Topic       | Practice                                                                                                                                            |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Placement   | Place the pagination under the list or table it controls, aligned with it, and show the result count nearby when it helps (“Showing 41–50 of 200”). |
| Do       | Binding     | Bind `page` and load the new page in `onpagechange`, which reports only the user's changes.                                                         |
| Do       | Links       | Pass `href` with `{page}` when each page has its own URL, so that pages can be bookmarked, shared and opened in a new tab.                          |
| Do       | Edges       | Turn on `showEdges` when there are many pages and few visible items, for example with `siblingCount={0}`.                                           |
| Do       | Label       | Set `label` when a page holds several paginations, so that each navigation has its own name (“Comments pages”).                                     |
| Do       | Translation | Translate `label`, `previousLabel`, `nextLabel`, `firstLabel` and `lastLabel` with the rest of the page.                                            |
| Don't    | Feeds       | Use a pagination for content read from start to end: a Load more Button keeps the reader's place.                                                   |
| Don't    | Siblings    | Rely on every sibling being shown: `siblingCount` is a maximum, reduced when the row lacks room.                                                    |
| Don't    | Width       | Squeeze the pagination into a column narrower than its smallest row: as a last resort the row scrolls, which hides pages.                           |
| Don't    | Count       | Invent a page count for paging that has none: use Previous and Next Buttons.                                                                        |
| Don't    | Grouping    | Put the pagination in a ButtonGroup or a Toolbar to size it: it keeps its own size, set by `size`.                                                  |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/pagination/App.svelte`, not shipped in the package).

### The usual case

Bind `page` and derive what the page shows from it; the result count sits next to the pagination.

```svelte live
<script lang="ts">
  import { Pagination } from '@ggbrick/svelte';

  const total = 200;
  const perPage = 10;
  let page = $state(5);
  const first = $derived((page - 1) * perPage + 1);
  const last = $derived(Math.min(page * perPage, total));
</script>

<div style="display: grid; justify-items: center; gap: var(--ggb-space-content-sm)">
  <Pagination bind:page pageCount={Math.ceil(total / perPage)} />
  <p>Showing {first}–{last} of {total}</p>
</div>
```

### Links to each page

With `href`, every page and every enabled button is a link, each `{page}` replaced by its page number. Pass the template as a string expression so that Svelte does not read `{page}` itself; on a server-rendered page, set `page` from the URL.

```svelte live
<script lang="ts">
  import { Pagination } from '@ggbrick/svelte';

  let page = $state(4);
</script>

<div>
  <Pagination bind:page pageCount={12} href={'#fragments?page={page}'} />
</div>
```

### Many pages in little room

First and last buttons with no siblings: page 1, the current page and the last page, whatever the count.

```svelte live
<script lang="ts">
  import { Pagination } from '@ggbrick/svelte';

  let page = $state(37);
</script>

<div>
  <Pagination bind:page pageCount={120} siblingCount={0} showEdges size="sm" />
</div>
```

### Responding to the user and setting the page

`onpagechange` reports only what the user does, the moment to load the new page; setting `page` from the application changes the page without an event.

```svelte live
<script lang="ts">
  import { Button, Pagination } from '@ggbrick/svelte';

  let page = $state(6);
  let changes = $state(0);
</script>

<div style="display: grid; justify-items: center; gap: var(--ggb-space-content-sm)">
  <Pagination bind:page pageCount={12} label="Search results pages" onpagechange={() => changes++} />
  <Button label="Back to page 1" intent="neutral" appearance="outline" size="sm" onactivate={() => (page = 1)} />
  <p>Page: {page} · changes by the user: {changes}</p>
</div>
```

### Difficult cases

- Paging with Next keeps the same number of items, so Previous and Next do not move; activating the current page does nothing (`#playground`).
- Few pages show every page without an ellipsis, and a gap of a single page shows that page (`#playground`, 5, 7 and 8 pages).
- Keyboard: each enabled control is a Tab stop; focus stays on the activated control, or moves to the current page when that control becomes disabled (`#playground`).
- At phone width the row shows fewer siblings and stays on one line without widening the page (`#playground`).
- The application setting the page emits no change (`#playground`, “Go to page 10 from the app”).
- Every size at page 50 of 100, first and last buttons with no siblings, links, and mirrored chevrons in right-to-left text (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Pagination } from '@ggbrick/svelte';
import type { PaginationProps, PaginationSize } from '@ggbrick/svelte';
```

Renders a `<nav class="ggb-pagination">` (plus any class you pass) with `aria-label`, `data-size` and, while the row scrolls, `data-scrolling`. It holds a `<ul class="ggb-pagination__list">` with one `<li>` per control, in this order: first (with `showEdges`), previous, the items, next, last (with `showEdges`). First, previous, next and last are IconButtons of the pagination's size, neutral and ghost, with `data-direction` set to `first`, `previous`, `next` or `last` and built-in chevrons mirrored in right-to-left text. Each page is a `<button type="button" class="ggb-pagination__item">`, or an `<a>` with the same class when `href` is set, carrying `data-page` and, on the current page, `aria-current="page"`; an ellipsis is a `<span class="ggb-pagination__ellipsis" aria-hidden="true">`. The navigation adds no alignment: the application places it.

The items are page 1, the last page, the current page and up to `siblingCount` pages on each side, a gap of two pages or more becoming an ellipsis. Their number is constant, `siblingCount × 2 + 5` or `pageCount` when smaller. A `ResizeObserver` on the navigation and its parent reduces the siblings, down to none, when the row is wider than the navigation; when even that row is too wide, the row scrolls inside its width. Nothing is measured on the server, which renders `siblingCount` siblings.

| Prop            | Type                             | Default           | Description                                                                                                                                  |
| --------------- | -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number` (bindable)              | `1`               | The current page, from 1; bind it with `bind:page`. Shown clamped between 1 and `pageCount`. Setting it from the application emits no event. |
| `pageCount`     | `number`                         | `1`               | Number of pages, rounded down, at least 1.                                                                                                   |
| `siblingCount`  | `number`                         | `1`               | Maximum number of pages shown on each side of the current one; fewer are shown when the row does not fit.                                    |
| `href`          | `string`                         | —                 | Turns every page and every enabled button into a link, each `{page}` replaced by its page number (`?page={page}`). Without it, buttons.      |
| `showEdges`     | `boolean`                        | `false`           | Adds the first-page and last-page buttons around previous and next.                                                                          |
| `size`          | `'sm' \| 'md' \| 'lg'`           | `'md'`            | Size of the pages and of the buttons; a surrounding ButtonGroup or Toolbar does not change it.                                               |
| `label`         | `string`                         | `'Pagination'`    | Accessible name of the navigation landmark.                                                                                                  |
| `previousLabel` | `string`                         | `'Previous page'` | Name of the previous button. Like every IconButton name, a blank value throws.                                                               |
| `nextLabel`     | `string`                         | `'Next page'`     | Name of the next button.                                                                                                                     |
| `firstLabel`    | `string`                         | `'First page'`    | Name of the first-page button.                                                                                                               |
| `lastLabel`     | `string`                         | `'Last page'`     | Name of the last-page button.                                                                                                                |
| `onpagechange`  | `(page: number) => void`         | —                 | Called with the new page when the user activates another page, or first, previous, next or last; in link mode, as the link navigates.        |
| `ref`           | `HTMLElement \| null` (bindable) | `null`            | The `<nav>` element.                                                                                                                         |
| `class`         | `string`                         | —                 | Merged with `ggb-pagination`.                                                                                                                |

Pagination takes no children or snippets. Every other attribute of `HTMLAttributes<HTMLElement>` (`id`, `style`, `aria-describedby`…) goes to the `<nav>`, except `children`; `aria-label` is replaced by `label`. The platform-independent contract, with its `item` and `ellipsis` children, ships as `contracts/pagination.json`.

## Accessibility

The component provides:

- A navigation landmark named by `label`, holding a list of the controls in source order.
- Each page named by its number, the current page exposed with `aria-current="page"` and shown by an edge as well as a tint; ellipses hidden from assistive technology.
- Every enabled page and button as its own Tab stop, without arrow-key navigation, as links in a navigation; Previous and First are disabled on page 1, Next and Last on the last page, and stay in place.
- After activation, focus stays on the activated control while it is still there and enabled, and moves to the new current page otherwise.
- One row that shows fewer siblings rather than wrapping, and scrolls inside its own width as a last resort, with room kept for the focus indicator; the current page keeps a visible edge in the system highlight color in forced colors; no color transitions under reduced motion.

The integration provides:

- A distinct `label` when a page holds several paginations, and translated names for the buttons.
- A status message, or focus moved to the content, when a new page of results loads without a page load.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                         |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (named navigation, list, current page)                       |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Component (an edge on the current page, not the tint alone)            |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (page numbers, ellipses)             |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (fewer siblings, then scrolling inside its own width)        |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component (the current page's edge, the focus indicator)               |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                              |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (source order, focus kept or moved to the current page)      |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                                              |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                   | A     | Component (each page named by its number)                              |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component (pages and buttons at least the control size of the density) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component; integration (a distinct `label` for each pagination)        |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration                                                            |

Validated by automated checks in Chromium (the named navigation, previous disabled on page 1, a constant number of items with next staying in place, the current page doing nothing, Tab stops and focus after activation, siblings and few pages, the page set silently by the application, links carrying the page number, mirrored chevrons in right-to-left text, first and last buttons, fewer siblings on one row at phone width without page overflow, axe-core in light and dark, desktop and mobile, computed values in four representative contexts), by server-rendering tests (structure, clamping, links) and by a unit test of the items over every page of 1 to 40 pages with 0 to 3 siblings; forced colors and the last-resort scrolling are not covered by an automated check yet, and there is no assistive-technology test yet. This list is not a conformance claim.
