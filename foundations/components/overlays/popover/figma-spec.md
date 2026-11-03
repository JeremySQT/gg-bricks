# Popover — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **overlays/popover** (`407:122`). Master: library page **Overlays** (`407:119`), section **Popover** (`430:104`).
- Master: component set **Popover** ([`430:239`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=430-239)), 6 variants, built by `authoring/adapters/figma/overlays-master.plugin.js`.
- Specification frame: **Popover — Specification** ([`431:613`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=431-613)); built by `overlays-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/overlays/popover/contract.json` and the implementation approved on 2026-11-03 (`packages/svelte/src/components/popover`).
- Node IDs: `reports/components/popover/figma/ledger.json`. Parity: `reports/components/popover/figma/parity.json` (28 records, 0 failures) plus 216 placement checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                         | Figma                                                                                                                                                                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`, `align`                                  | Variant properties Side (bottom, top), Align (start, center, end); default bottom · start                                                                                                                                  |
| `label`                                          | Text property **Label** on a hidden layer (the name of the panel)                                                                                                                                                          |
| part `trigger` (Button, IconButton; exactly one) | Slot **Trigger**                                                                                                                                                                                                           |
| parts `panel`, `content`                         | Layer Panel and its slot **Content** (a heading and a text by default)                                                                                                                                                     |
| `open`, focus, closing, motion, layer            | Not drawn: behaviors of the code (the master shows the open state)                                                                                                                                                         |
| tokens                                           | `color/surface/overlay`, `color/elevation/border`, `border/width/default`, `shadow/overlay`, `radius/overlay`, `space/content/md`, `size/overlay/panel`, `space/content/xs`, `typography/body/sm`, `color/content/primary` |

## Construction notes

- Each variant stacks the trigger and the panel with the gap `space/content/xs` and aligns them at the start, the center or the end.
- The panel hugs its content up to `size/overlay/panel`; the Content slot fills the panel and its texts wrap.
- The default variant is the top left one of the set: Side=bottom, Align=start, as in the contract.

## Justified differences

None in `computed.json`. Not drawn: flip, shift, scroll follow, focus management, closing and the motion (behaviors of the code).

## Parity method

`overlays-parity.plugin.js` hashes the panel line (surface, text color, edge and drop shadows, radius, padding, max width, font size) in the four contexts of `computed.json` and checks the offset and the alignment of the six placements in the 18 contexts; `node authoring/adapters/figma/wave3-parity-report.mjs popover <result.json>` writes `parity.json`.
