# Pagination — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **navigation/pagination** (`495:19`). Masters: library page **Navigation** (`495:16`), section **Pagination** (`504:270`).
- Masters: **Pagination** ([`504:552`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=504-552)), 3 variants (Size); **Pagination/Item** (`504:307`, 12 variants: Size × State), **Pagination/Ellipsis** (`504:314`, 3 variants). Built by `authoring/adapters/figma/pagination-master.plugin.js`.
- Specification frame: **Pagination — Specification** ([`519:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=519-2)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/navigation/pagination/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/pagination`).
- Node IDs: `reports/components/pagination/figma/ledger.json`. Parity: `reports/components/pagination/figma/parity.json` (360 records, 360 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                    | Figma                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `size`                                      | variant Size                                                                                                   |
| `showEdges`                                 | boolean **Show edges** (First and Last)                                                                        |
| `label`                                     | text property **Label** on a hidden layer                                                                      |
| `page`, `pageCount`, `siblingCount`, `href` | not drawn: the designer fills the items (State selected on the current page) and sets the edge controls' State |
| parts `first`, `previous`, `next`, `last`   | exposed IconButton instances (neutral ghost, chevrons and double chevrons)                                     |
| part `items`                                | slot **Items** (Pagination/Item, Pagination/Ellipsis)                                                          |
| child `item`                                | Pagination/Item: text **Number**, State (default, hover, selected, selected-hover), **Focus**                  |
| child `ellipsis`                            | Pagination/Ellipsis                                                                                            |

## Construction notes

- The current page's inner edge is an inside stroke of `border/width/default` in `color/item/indicator`, outside the layout (as the code's inset shadow).
- Tabular figures cannot be set through the Plugin API (openTypeFeatures is read-only); the description tells the designer.

## Justified differences

Tabular figures are not set on the numbers (Figma API limitation; widths in `computed.json` are box widths and match). Not drawn: links, the reduction of siblings, the last-resort scroll and the focus after activation.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs pagination <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
