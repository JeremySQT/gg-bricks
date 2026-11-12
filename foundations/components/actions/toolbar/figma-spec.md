# Toolbar — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **actions/toolbar** (`495:23`). Masters: library page **Actions** (`343:2`), section **Toolbar** (`506:1345`).
- Masters: **Toolbar** ([`506:1873`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=506-1873)), 6 variants (Orientation × Size); **Toolbar/Separator** (`506:1350`, 2 variants). Built by `authoring/adapters/figma/toolbar-master.plugin.js`.
- Specification frame: **Toolbar — Specification** ([`522:748`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=522-748)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/actions/toolbar/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/toolbar`).
- Node IDs: `reports/components/toolbar/figma/ledger.json`. Parity: `reports/components/toolbar/figma/parity.json` (60 records, 60 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                          | Figma                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `size`, `orientation`                             | variants Size, Orientation                                               |
| `label`                                           | text property **Label** on a hidden layer                                |
| part `items`                                      | slot **Items** (Button, IconButton, Menu, Toolbar/Separator)             |
| part `overflow`, `overflowLabel`                  | boolean **Show overflow** (an IconButton with dots-three after the slot) |
| child `separator`                                 | Toolbar/Separator (Orientation of the toolbar)                           |
| roving focus, overflow measurement, overflow Menu | Not drawn: behaviors of the code                                         |

## Construction notes

- The controls in the slot clear the 44 px minimum height their masters reserve as a target, so that the gaps separate the visible surfaces (as ButtonGroup).
- A horizontal toolbar is 520 px wide by default and resizable; a vertical toolbar hugs its widest control. Separators fill the toolbar's cross size.

## Justified differences

The toolbar cannot impose its Size on the controls a designer adds (the code does): choose their size. None in `computed.json`. Not drawn: roving focus and the overflow measurement.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs toolbar <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
