# Table

## Overview

A table shows a set of records in rows and columns so that values can be read and compared along both: invoices, orders, members of a team.

## Anatomy

| #   | Part         | Required | Role                                                                                                                                                                                                                         |
| --- | ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Caption      | yes      | The name of the table, shown above it; it can be hidden from view and is still announced.                                                                                                                                    |
| 2   | Header       | no       | One column header per column, on a light band with a line below; it stays at the top when the table scrolls.                                                                                                                 |
| 3   | Cell         | yes      | Plain text (figures of equal width) or free content (a Badge, a Link, an Avatar with a name, row actions), aligned at the start, center or end; a light line runs under every row but the last, and a cell can name its row. |
| 4   | Frame        | yes      | The light border with rounded corners around the table; a table wider than its space scrolls inline inside it instead of squeezing its columns.                                                                              |
| —   | Footer       | no       | Summary rows (totals) after the rows, below a line, in slightly bolder text.                                                                                                                                                 |
| —   | Column lines | no       | Light vertical lines between the columns, from the header to the last row.                                                                                                                                                   |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/table.json`.

## When to use

- A set of records compared across a few columns: invoices, orders, users, with amounts aligned at the end.
- Records with rich cells: a status Badge, a Link to the record, an Avatar with a name, row actions in a Menu.
- Totals under the rows, in a footer.
- Many columns on a narrow screen, scrolled in the table's own area; a long list in an area of limited height, whose header stays visible.

## When not to use

- The properties of a single record, as label and value pairs: DataField.
- Items each made of several lines of text: a list (planned).
- Sorting, row selection, expandable rows, inline editing or large data sets: DataGrid (planned).
- Laying out a page or a form in columns: CSS layout, never a table.

## Best practices

| Guidance | Topic       | Practice                                                                                                                                                                             |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Do       | Caption     | Give every table a caption that names its data (“Invoices”); use `hideCaption` only when a heading next to the table already says it.                                                |
| Do       | Numbers     | Align numbers and amounts at the end, with their column header: figures have equal widths, so the digits line up.                                                                    |
| Do       | Row header  | Set `rowHeader` on the cell that names its row (an invoice number, a person), so that assistive technology announces it with the other cells.                                        |
| Do       | Density     | Let the density set the row height: the table has no size, so set `data-ggb-density` on an ancestor for a denser or roomier table.                                                   |
| Do       | Rows        | Give a column the same kind of content in every row: an Avatar or row actions make their row taller (an xs Avatar in comfortable density only, a small IconButton in every density). |
| Do       | Actions     | Put row actions in a ghost IconButton that opens a Menu, named after its row (“Actions for invoice #3066”), and give their column a header name too.                                 |
| Do       | Empty       | Keep the header when there is no data, and show one row whose single cell spans every column with a short message.                                                                   |
| Do       | Pagination  | Split a long set into pages with a Pagination composed below the table; it is not part of the table.                                                                                 |
| Do       | Loading     | While rows load, show a few rows of Skeletons in the cells and mark the table `aria-busy`.                                                                                           |
| Do       | Height      | Limit the block size of the Table for a long list in a fixed area: the rows scroll and the header stays visible.                                                                     |
| Don't    | Layout      | Use a table to lay out a page or a form: it announces rows and columns that mean nothing.                                                                                            |
| Don't    | Width       | Squeeze columns to fit a narrow screen: the table scrolls inline in its frame. Limit the width of a column of long text only, which then wraps.                                      |
| Don't    | Interaction | Make rows clickable or give them a hover state: rows and cells are not interactive; put a Link in the cell that names the row.                                                       |
| Don't    | Focus       | Add a `tabindex` to the table or wrap it in a scrolling box of your own: its scroll area becomes a named focus stop by itself, and only while it overflows.                          |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/table/App.svelte`, not shipped in the package).

### The usual case

Invoice numbers name their rows, amounts are aligned at the end, and the footer holds the total.

```svelte live
<script lang="ts">
  import {
    Badge,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableHeading,
    TableRow
  } from '@ggbrick/svelte';
</script>

<Table caption="Invoices">
  <TableHeader>
    <TableRow>
      <TableHeading>Invoice</TableHeading>
      <TableHeading>Date</TableHeading>
      <TableHeading>Status</TableHeading>
      <TableHeading align="end">Amount</TableHeading>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell rowHeader>#3066</TableCell>
      <TableCell>Jan 6, 2027</TableCell>
      <TableCell><Badge size="sm" intent="success" label="Paid" /></TableCell>
      <TableCell align="end">€1,240.00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell rowHeader>#3065</TableCell>
      <TableCell>Jan 6, 2027</TableCell>
      <TableCell><Badge size="sm" intent="warning" label="Pending" /></TableCell>
      <TableCell align="end">€89.50</TableCell>
    </TableRow>
    <TableRow>
      <TableCell rowHeader>#3064</TableCell>
      <TableCell>Jan 5, 2027</TableCell>
      <TableCell><Badge size="sm" label="Refunded" /></TableCell>
      <TableCell align="end">€420.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colspan={3}>Total</TableCell>
      <TableCell align="end">€1,749.50</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

### Rich cells and row actions

A Link to the record, an Avatar beside a name (decorative, since the name is written), and a Menu of row actions behind an IconButton named after its row.

```svelte live
<script lang="ts">
  import {
    Avatar,
    Icon,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeading,
    TableRow
  } from '@ggbrick/svelte';

  // Phosphor “dots three”, standing in for your icon set.
  const dots =
    'M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z';
  const rows = [
    { id: '#3066', name: 'Olivia Rhye' },
    { id: '#3065', name: 'Phoenix Baker' }
  ];
</script>

{#snippet more()}<Icon><path d={dots} /></Icon>{/snippet}

<Table caption="Invoices by customer">
  <TableHeader>
    <TableRow>
      <TableHeading>Invoice</TableHeading>
      <TableHeading>Customer</TableHeading>
      <TableHeading align="end">Actions</TableHeading>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each rows as row (row.id)}
      <TableRow>
        <TableCell rowHeader><Link href="#fragments" label={row.id} /></TableCell>
        <TableCell>
          <span style="display: flex; align-items: center; gap: var(--ggb-space-content-sm)">
            <Avatar name={row.name} size="xs" decorative />
            {row.name}
          </span>
        </TableCell>
        <TableCell align="end">
          <Menu align="end">
            {#snippet trigger(props)}
              <IconButton
                {...props}
                label={`Actions for invoice ${row.id}`}
                size="sm"
                appearance="ghost"
                intent="neutral"
                icon={more}
              />
            {/snippet}
            <MenuItem label="View" />
            <MenuItem label="Download PDF" />
            <MenuItem label="Delete" intent="danger" />
          </Menu>
        </TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
```

### Density

The table has no size: an ancestor's `data-ggb-density` sets the height of its rows; the text does not change.

```svelte live
<script lang="ts">
  import { Table, TableBody, TableCell, TableHeader, TableHeading, TableRow } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
  {#each ['compact', 'comfortable'] as density (density)}
    <div data-ggb-density={density}>
      <Table caption={`Seats (${density})`}>
        <TableHeader>
          <TableRow>
            <TableHeading>Company</TableHeading>
            <TableHeading align="end">Seats</TableHeading>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell rowHeader>Adidas</TableCell><TableCell align="end">48</TableCell></TableRow>
          <TableRow><TableCell rowHeader>Nike</TableCell><TableCell align="end">7</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  {/each}
</div>
```

### Column lines and a hidden caption

A heading already names the table, so the caption is only announced.

```svelte live
<script lang="ts">
  import { Table, TableBody, TableCell, TableHeader, TableHeading, TableRow } from '@ggbrick/svelte';
</script>

<section>
  <h4>Opening hours</h4>
  <Table caption="Opening hours" hideCaption columnLines>
    <TableHeader>
      <TableRow>
        <TableHeading>Store</TableHeading>
        <TableHeading align="center">Weekdays</TableHeading>
        <TableHeading align="center">Saturday</TableHeading>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell rowHeader>Lyon</TableCell>
        <TableCell align="center">9:00–19:00</TableCell>
        <TableCell align="center">10:00–18:00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell rowHeader>Nantes</TableCell>
        <TableCell align="center">9:30–19:00</TableCell>
        <TableCell align="center">Closed</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</section>
```

### Wider than its space

Columns keep their content on one line and the table scrolls inline in its frame; while it overflows, its scroll area is a focus stop named by the caption, scrolled with the arrow keys.

```svelte live
<script lang="ts">
  import { Table, TableBody, TableCell, TableHeader, TableHeading, TableRow } from '@ggbrick/svelte';

  const columns = ['Order', 'Customer', 'Product', 'Quantity', 'Warehouse', 'Carrier'];
</script>

<div style="inline-size: 100%; max-inline-size: 20rem">
  <Table caption="Orders">
    <TableHeader>
      <TableRow>
        {#each columns as column (column)}<TableHeading>{column}</TableHeading>{/each}
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each [1, 2] as n (n)}
        <TableRow>
          <TableCell rowHeader>SO-10{n}</TableCell>
          <TableCell>Northwind Traders</TableCell>
          <TableCell>Ergonomic chair</TableCell>
          <TableCell align="end">{n * 3}</TableCell>
          <TableCell>Lyon</TableCell>
          <TableCell>DHL Express</TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</div>
```

### Limited height

A block size limit on the Table makes its rows scroll under the header, which stays visible.

```svelte live
<script lang="ts">
  import { Table, TableBody, TableCell, TableHeader, TableHeading, TableRow } from '@ggbrick/svelte';

  const events = Array.from({ length: 10 }, (_, i) => ({ text: `Invoice #${3066 - i} paid`, time: `${9 + i}:05` }));
</script>

<Table caption="Activity" style="max-block-size: 14rem">
  <TableHeader>
    <TableRow>
      <TableHeading>Event</TableHeading>
      <TableHeading align="end">Time</TableHeading>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each events as event (event.text)}
      <TableRow><TableCell>{event.text}</TableCell><TableCell align="end">{event.time}</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
```

### Empty, loading and pages

No data: the header stays and one cell spans every column. Loading: Skeletons in a few rows, the table marked busy. Pages: a Pagination below the table.

```svelte live
<script lang="ts">
  import {
    Pagination,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeading,
    TableRow
  } from '@ggbrick/svelte';

  let view = $state<'empty' | 'loading'>('empty');
  let page = $state(1);
</script>

<div
  style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); inline-size: 100%; max-inline-size: 24rem"
>
  <label>
    State
    <select bind:value={view}>
      <option value="empty">Empty</option>
      <option value="loading">Loading</option>
    </select>
  </label>
  <Table caption="Payments" aria-busy={view === 'loading'}>
    <TableHeader>
      <TableRow>
        <TableHeading>Customer</TableHeading>
        <TableHeading align="end">Amount</TableHeading>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#if view === 'empty'}
        <TableRow><TableCell colspan={2} align="center">No payments yet</TableCell></TableRow>
      {:else}
        {#each [1, 2, 3] as n (n)}
          <TableRow>
            <TableCell><Skeleton /></TableCell>
            <TableCell><Skeleton /></TableCell>
          </TableRow>
        {/each}
      {/if}
    </TableBody>
  </Table>
  <div style="display: flex; justify-content: flex-end">
    <Pagination bind:page pageCount={12} size="sm" />
  </div>
</div>
```

### Difficult cases

- A Link in the row header, a Badge, an Avatar with a name and an email on two lines, and row actions in one row, which grows and keeps its padding; the totals footer; column lines, a hidden caption, an empty table and a limited height as options (`#playground`).
- The three densities side by side, rows aligned in each (`#densities`).
- A wide table with column lines scrolling inline in a narrow column, its scroll area a named focus stop that is no longer one once the table fits; a table of limited height whose header stays (`#scroll`).
- Right to left: columns from right to left, start and end alignments and column lines following the text direction (`#rtl`).

## API

Import from `@ggbrick/svelte` (Svelte 5; a native HTML table, without Bits UI). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHeading, TableCell } from '@ggbrick/svelte';
import type {
  TableProps,
  TableSectionProps,
  TableRowProps,
  TableHeadingProps,
  TableCellProps,
  TableHeadingAlign,
  TableCellAlign
} from '@ggbrick/svelte';
```

Table renders a `<div class="ggb-table">` (plus any class you pass) with `data-column-lines` when `columnLines` is set and `data-scrollable` while the table overflows its area. It holds the visible caption, a `<div class="ggb-table__caption" aria-hidden="true">` left out with `hideCaption`, then a `<div class="ggb-table__frame">` that draws the frame around the scroll area, a `<div class="ggb-table__container">`, which holds the `<table class="ggb-table__table">`. The table's native `<caption>` is visually hidden and names it. While the table overflows its area, in either direction, the scroll area gets `role="region"`, `aria-label` set to the caption and `tabindex="0"`; it also has them until the overflow is measured (in server-rendered HTML, before the component runs), and loses them as soon as the table is measured to fit. The root is a column: a `max-block-size` on it limits the scroll area, and the header cells stick to its top. The table takes the inline size it is given, and its columns the width of their content on one line.

| Prop          | Type                                | Default  | Description                                                |
| ------------- | ----------------------------------- | -------- | ---------------------------------------------------------- |
| `caption`     | `string`                            | required | The table's accessible name, shown above it. Blank throws. |
| `hideCaption` | `boolean`                           | `false`  | Announce the caption without showing it.                   |
| `columnLines` | `boolean`                           | `false`  | Vertical lines between the columns.                        |
| `children`    | `Snippet`                           | required | TableHeader (optional), TableBody, TableFooter (optional). |
| `ref`         | `HTMLDivElement \| null` (bindable) | `null`   | The root element.                                          |
| `class`       | `string`                            | —        | Merged with `ggb-table`.                                   |

Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the root element, not to the `<table>`, except `children`, `role` and `tabindex`. A blank caption throws, on the server and in the browser. There are no events and no size: rows follow the density.

TableHeader, TableBody and TableFooter render `<thead class="ggb-table__header">`, `<tbody class="ggb-table__body">` and `<tfoot class="ggb-table__footer">`. The header is a light band with a line below; the body draws a line under every row but the last; the footer is separated from the body by a line and sets its cells in the footer text style. All three take `TableSectionProps`.

| Prop       | Type                                         | Default | Description                    |
| ---------- | -------------------------------------------- | ------- | ------------------------------ |
| `children` | `Snippet`                                    | —       | TableRow children.             |
| `ref`      | `HTMLTableSectionElement \| null` (bindable) | `null`  | The rendered element.          |
| `class`    | `string`                                     | —       | Merged with the section class. |

Every other attribute of `HTMLAttributes<HTMLTableSectionElement>` is forwarded to the element, except `children`.

TableRow renders a `<tr class="ggb-table__row">`. A row is not interactive and has no hover or selected state.

| Prop       | Type                                     | Default | Description                                                   |
| ---------- | ---------------------------------------- | ------- | ------------------------------------------------------------- |
| `children` | `Snippet`                                | —       | TableHeading (in the header) or TableCell children, in order. |
| `ref`      | `HTMLTableRowElement \| null` (bindable) | `null`  | The rendered element.                                         |
| `class`    | `string`                                 | —       | Merged with `ggb-table__row`.                                 |

Every other attribute of `HTMLAttributes<HTMLTableRowElement>` is forwarded to the element, except `children`.

TableHeading renders a column header, a `<th scope="col" class="ggb-table__heading">` with `data-align`. Its text wraps when the column is limited.

| Prop       | Type                                      | Default   | Description                                    |
| ---------- | ----------------------------------------- | --------- | ---------------------------------------------- |
| `align`    | `'start' \| 'center' \| 'end'`            | `'start'` | Text alignment; `end` for a column of numbers. |
| `children` | `Snippet`                                 | —         | The column's name.                             |
| `ref`      | `HTMLTableCellElement \| null` (bindable) | `null`    | The rendered element.                          |
| `class`    | `string`                                  | —         | Merged with `ggb-table__heading`.              |

Every other attribute of `HTMLThAttributes` (`colspan`, `id`, `style`…) is forwarded to the element, except `children`, `scope` and `align` (the prop above).

TableCell renders a `<td class="ggb-table__cell">` with `data-align`, or with `rowHeader` a `<th scope="row">` of the same class with `data-row-header`, which looks the same. Figures have tabular widths.

| Prop        | Type                                      | Default   | Description                                                |
| ----------- | ----------------------------------------- | --------- | ---------------------------------------------------------- |
| `align`     | `'start' \| 'center' \| 'end'`            | `'start'` | Content alignment; `end` for numbers.                      |
| `rowHeader` | `boolean`                                 | `false`   | The cell names its row and is exposed as its header.       |
| `children`  | `Snippet`                                 | —         | Plain text or free content (Badge, Link, Avatar, actions). |
| `ref`       | `HTMLTableCellElement \| null` (bindable) | `null`    | The rendered element.                                      |
| `class`     | `string`                                  | —         | Merged with `ggb-table__cell`.                             |

Every other attribute of `HTMLTdAttributes` and `HTMLThAttributes` (`colspan`, `rowspan`, `headers`…) is forwarded to the element, except `children`, `scope` and `align` (the prop above). The platform-independent contract, with its `header`, `body`, `footer`, `row`, `heading` and `cell` children, ships as `contracts/table.json`.

## Accessibility

The component provides:

- A native data table named by its caption, shown or hidden; column headers exposed as the headers of their columns, and a cell with `rowHeader` as the header of its row.
- A table that is not interactive itself: rows and cells never take focus; only the content of cells and the scroll area do.
- While the table overflows its area, a scroll area that is a focus stop, exposed as a region named by the caption, with a focus indicator inside the frame, so that keyboard users can scroll it with the arrow keys; it is no focus stop once the table is measured to fit (server-rendered HTML keeps it focusable until then).
- A header that stays visible when the rows scroll, columns and alignments that follow the text direction, and the frame, lines, text and focus indicator kept visible in forced colors.

The integration provides:

- A caption and column headers that say what the data is, a header name for every column (row actions included), and `rowHeader` on the cell that names each row.
- Names for the controls in cells, such as row actions named after their row.
- A message when there is no data, `aria-busy` while rows load, and a status message when the user must know that the rows changed.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                              |
| ------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (native table, caption, header scopes); integration (row headers) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (headers, cells, footer)                  |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (a wide table scrolls in its own area, not the page)              |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces (focus indicator of the scroll area)      |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component (scroll area); integration (controls in cells)                    |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (rows and cells never focusable)                                  |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)       | AA    | Integration (caption and column headers that describe the data)             |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component (scroll area)                                                     |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (named table and scroll region); integration (controls in cells)  |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration (rows loaded, filtered or emptied)                              |

Validated by automated checks in Chromium (axe-core in light and dark on the review page, which also fits a phone width; the table named by its caption, shown or hidden; column and row headers exposed; the scroll area a region named by the caption and a focus stop only while the table overflows, with its focus indicator and arrow-key scrolling; the header staying at the top of a table of limited height; frame, header band, lines, typographies and row heights following the density in four representative contexts; content taller than one line keeping its padding; footer line and typography; column lines in both text directions; frame and lines in the system text color in forced colors), by server rendering checks (structure, header scopes, alignment, options, a blank caption rejected) and by contrast measurements in the 18 brand, appearance and density contexts; no assistive-technology test yet. This list is not a conformance claim.
