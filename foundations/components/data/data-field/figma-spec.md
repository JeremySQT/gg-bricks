# DataField — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **data/data-field** (`540:64`). Masters: library page **Data** (`540:63`), section **DataField** (`546:2`).
- Master: **DataField** ([`562:2786`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=562-2786)), 20 variants. Built by `authoring/adapters/figma/wave5-data-field-master.plugin.js`.
- Specification frame: **DataField — Specification** ([`564:80`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=564-80)); built on `spec-lib.plugin.js` (stored `_Script/spec-lib`, bodies run in the wave 5 session), with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/data/data-field/contract.json` and the implementation approved on 2026-11-14 at the grouped wave 5 implementation gate (`packages/svelte/src/components/data-field`).
- Node IDs: `reports/components/data-field/figma/ledger.json`. Parity: `reports/components/data-field/figma/parity.json` (80 records, 0 failures). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                              | Figma                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `orientation`, `size`                 | variants Orientation and Size                                                                                |
| `label`                               | text property **Label**                                                                                      |
| `value`, part `value`                 | slot **Value** (a body text by default, or free content)                                                     |
| part `empty`, `emptyLabel`            | variant Empty=true: an em dash in color/content/tertiary; the announced emptyLabel is a behavior of the code |
| stacking below twice the label column | Not drawn: behavior of the code (resize or use vertical)                                                     |

## Construction notes

- Horizontal aligns label and value on their first baselines (auto layout baseline alignment); the label is bound to component/data-field/label-inline-size.
- Label in color/content/tertiary (wave 5 implementation review, round 2).

## Justified differences

Not drawn: the stacking of a horizontal field below 320 px, the group semantics and the announced emptyLabel.

## Parity method

`wave5-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes, sizes, gaps, paddings, radii and typography, returned as one FNV-1a hash per context and component of the sorted lines. `node authoring/adapters/figma/wave5-parity-report.mjs <result.json>` builds the same lines from `computed.json` and writes `parity.json`; an equal hash proves every record equal.
