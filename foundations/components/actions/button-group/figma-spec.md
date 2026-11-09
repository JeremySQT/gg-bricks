# ButtonGroup — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **actions/button-group** (`407:110`). Master: library page **Actions** (`343:2`), section **ButtonGroup** (`419:2294`).
- Master: component set **ButtonGroup** ([`419:2913`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=419-2913)), 15 variants, built by `authoring/adapters/figma/button-group-master.plugin.js`.
- Specification frame: **ButtonGroup — Specification** ([`420:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=420-2)); built by `button-group-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/actions/button-group/contract.json` (approved 2026-11-03 with the no-reflow amendment) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/button-group`).
- Node IDs: `reports/components/button-group/figma/ledger.json`. Parity: `reports/components/button-group/figma/parity.json` (216 records, 0 failures) plus 54 centering checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                        | Figma                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`, `align`, `size`                  | Variant properties Orientation, Align (start, center, end, stretch; vertical with start only, since Buttons are always full width), Size |
| part `items` (Button, IconButton, at least one) | Slot **Items** (one SLOT property; Button and IconButton preferred and the only allowed content; minimum one)                            |
| `label`                                         | Text property **Label** on a hidden layer (the group name)                                                                               |
| state `stacked`                                 | The vertical variant: the code stacks a horizontal group that does not fit; Figma has no measurement of the available width              |
| token `gap`                                     | `space/control/gap/{size}` on the slot's item spacing                                                                                    |

## Construction notes

- **Items centered on the cross axis** (user review of the Figma parity, 2026-11-04): the Items slot of horizontal groups centers its items, so that an IconButton dropped into a group lines up with the buttons (they were aligned at the top). `button-group-parity.plugin.js` drops an outline IconButton into each horizontal group and checks that its surface is centered with the first button's, in the 18 contexts (54 checks).

- The group has no fill, border or padding; the slot lays the items out in the orientation with the gap and fills the width of the variant (400 px horizontal, 240 px vertical).
- **Item size.** A slot cannot pass the group's Size to its content: set every item to the Size of the group (the code sets it once).
- **Target height.** The Button master reserves its 44 px target (minimum height `size/target/min`); inside the group the Button instances clear it, so that the gap separates the surfaces as in the code, where the target overflows the button. IconButtons draw their target as an absolute layer and need nothing.
- **Fill.** Stretch and vertical Buttons fill the width: the instance and its Container are set to fill (the Button master hugs its label).

## Justified differences

None in `computed.json` (gap and item height in 18 contexts). Not measured by the code: the width shares of stretch (Figma rounds the shares to whole pixels).

## Parity method

`button-group-parity.plugin.js` measures, in each of the 18 contexts, the gap and the item surface height of both orientations and three sizes, and checks the visible distance between consecutive surfaces; `node authoring/adapters/figma/wave3-parity-report.mjs button-group <result.json>` compares the hashes with `computed.json` (18 equal) and writes `parity.json`.
