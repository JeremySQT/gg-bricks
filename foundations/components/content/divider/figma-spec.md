# Divider — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **content/divider** (`540:61`). Masters: library page **Content** (`343:1635`), section **Divider** (`545:645`).
- Master: **Divider** ([`545:652`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=545-652)), 2 variants. Built by `authoring/adapters/figma/wave5-divider-master.plugin.js`.
- Specification frame: **Divider — Specification** ([`552:703`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=552-703)); built on `spec-lib.plugin.js` (stored `_Script/spec-lib`, bodies run in the wave 5 session), with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/content/divider/contract.json` and the implementation approved on 2026-11-14 at the grouped wave 5 implementation gate (`packages/svelte/src/components/divider`).
- Node IDs: `reports/components/divider/figma/ledger.json`. Parity: `reports/components/divider/figma/parity.json` (20 records, 0 failures). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract      | Figma                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `orientation` | variant Orientation                                                                                   |
| `label`       | boolean **Show label** and text **Label** (horizontal only)                                           |
| part `line`   | Line rectangles of component/divider/thickness in color/border/subtle (Line end shown with the label) |
| `decorative`  | Not drawn: semantics of the code                                                                      |

## Construction notes

- The code draws the line as a border (painted by the system in forced colors); Figma draws a filled rectangle of the same thickness and color.
- The horizontal master is 320 px wide and the vertical 24 px high: designers resize instances to their container or row.

## Justified differences

The line is a filled rectangle instead of a border (same thickness and color). Not drawn: separator semantics, forced colors.

## Parity method

`wave5-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes, sizes, gaps, paddings, radii and typography, returned as one FNV-1a hash per context and component of the sorted lines. `node authoring/adapters/figma/wave5-parity-report.mjs <result.json>` builds the same lines from `computed.json` and writes `parity.json`; an equal hash proves every record equal.
