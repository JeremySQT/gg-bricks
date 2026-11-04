# Tooltip — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **overlays/tooltip** (`407:123`). Master: library page **Overlays** (`407:119`), section **Tooltip** (`430:2`).
- Master: component set **Tooltip** ([`430:103`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=430-103)), 6 variants, built by `authoring/adapters/figma/overlays-master.plugin.js`.
- Specification frame: **Tooltip — Specification** ([`462:95`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=462-95)); built by `overlays-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/overlays/tooltip/contract.json` and the implementation approved on 2026-11-03 (`packages/svelte/src/components/tooltip`).
- Node IDs: `reports/components/tooltip/figma/ledger.json`. Parity: `reports/components/tooltip/figma/parity.json` (32 records, 0 failures, 4 justified) plus 216 placement checks (with Show trigger on). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                               | Figma                                                                                                                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`, `align`                                        | Variant properties Side (top, bottom), Align (center, start, end); default top · center                                                                  |
| `label`                                                | Text property **Label**                                                                                                                                  |
| part `trigger` (Button, IconButton, Link; exactly one) | Slot **Trigger** (those three preferred and only; minimum one), shown by the boolean **Show trigger** (off by default)                                   |
| part `content`                                         | Layer Tooltip (the bubble) and its Label text                                                                                                            |
| `open`, delay, motion, layer                           | Not drawn: behaviors of the code (the master shows the open state)                                                                                       |
| tokens                                                 | `color/surface/inverse`, `color/content/inverse`, `typography/caption/md`, `radius/control`, `space/content/sm, xs`, `component/tooltip/max-inline-size` |

## Construction notes

- **The trigger is optional** (user review of the Figma parity, 2026-11-04): the boolean **Show trigger**, off by default, shows the Trigger slot. A designer builds the interface first and places the tooltip over a control already in it; switched on, the slot shows the placement against one trigger. The placement checks of the parity switch it on.

- Each variant stacks the trigger and the bubble with the gap `space/content/xs` (the offset) and aligns them at the start, the center or the end.
- The bubble hugs its label up to `component/tooltip/max-inline-size`: the label fills the bubble and wraps there, and a short label keeps the bubble short (a filling text in a hugging frame with a max width).

## Justified differences

1. **Transitions and delay** (`duration`): behaviors of the code.
2. Flip, shift, top layer, hover and focus opening: behaviors of the code.

## Parity method

`overlays-parity.plugin.js` hashes the bubble line (surface, label color, radius, paddings, font size, max width) in the four contexts of `computed.json` and checks the offset and the alignment of the six placements in the 18 contexts; `node authoring/adapters/figma/wave3-parity-report.mjs tooltip <result.json>` writes `parity.json`.
