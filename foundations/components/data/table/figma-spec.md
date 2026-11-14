# Table — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **data/table** (`540:65`). Masters: library page **Data** (`540:63`), section **Table** (`547:5`).
- Master: **Table** ([`548:414`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=548-414)), 3 variants, with **Table/Column** (`548:173`), **Table/Cell** (`547:96`), **Table/Heading** (`547:97`), **Table/Footer cell** (`547:98`). Built by `authoring/adapters/figma/wave5-table-master.plugin.js`.
- Specification frame: **Table — Specification** ([`555:3502`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=555-3502)); built on `spec-lib.plugin.js` (stored `_Script/spec-lib`, bodies run in the wave 5 session), with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/data/table/contract.json` and the implementation approved on 2026-11-14 at the grouped wave 5 implementation gate (`packages/svelte/src/components/table`).
- Node IDs: `reports/components/table/figma/ledger.json`. Parity: `reports/components/table/figma/parity.json` (144 records, 0 failures). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                          | Figma                                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `caption`, `hideCaption`                                          | text **Caption**, boolean **Show caption**                                                                                      |
| `size`                                                            | variant Size on Table and on each child (sm, md, lg)                                                                            |
| `columnLines`                                                     | boolean **Column line** on each Table/Column (off for the last column)                                                          |
| children header, body, footer, row                                | a Table/Column per column: Table/Heading, the Cells slot (Table/Cell, one per row), an optional Table/Footer cell (Show footer) |
| children heading, cell: `align`                                   | variant Align (start, center, end)                                                                                              |
| cell `rowHeader`, scrolling, sticky header, focusable scroll area | Not drawn: behaviors of the code                                                                                                |

## Construction notes

- Figma builds a table from columns (each column a vertical stack of its cells) so that the cells of a column share its width; rows align because every cell keeps the row minimum height.
- The block padding comes from the Figma-only Density variables table/padding-block/{size} (hidden from publishing): min(space/content/sm, (size/control/{size} − 21) / 2), the value of the code (Figma has no min()).
- Lines are inside strokes that take no room (the code draws inset shadows); the frame is an inside stroke of the Frame layer, which clips the columns to the radius/container corners.

## Justified differences

Columns instead of rows (Figma mechanics, above); a tall row must be kept by hand in every column. Not drawn: scrolling, the sticky header, row headers, forced colors.

## Parity method

`wave5-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes, sizes, gaps, paddings, radii and typography, returned as one FNV-1a hash per context and component of the sorted lines. `node authoring/adapters/figma/wave5-parity-report.mjs <result.json>` builds the same lines from `computed.json` and writes `parity.json`; an equal hash proves every record equal.
