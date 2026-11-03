# Dialog — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **overlays/dialog** (`407:120`). Master: library page **Overlays** (`407:119`), section **Dialog** (`433:87`).
- Masters: component set **Dialog** ([`433:525`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=433-525)), 6 variants, and the internal part **\_Dialog/Backdrop** (`433:526`); built by `authoring/adapters/figma/dialog-master.plugin.js`.
- Specification frame: **Dialog — Specification** ([`435:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=435-2)); built by `dialog-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/overlays/dialog/contract.json` (approved 2026-11-03 with the body room amendment) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/dialog`).
- Node IDs: `reports/components/dialog/figma/ledger.json`. Parity: `reports/components/dialog/figma/parity.json` (96 records, 0 failures) plus 216 layout checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                      | Figma                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                        | Variant property Size (md default, sm, lg)                                                                                                                                                                                                                                                                                         |
| state `scrolled`                              | Variant property Scrolled (no, yes): the dividers around the body                                                                                                                                                                                                                                                                  |
| `title`, `description`                        | Text properties **Title**, **Description**, boolean **Show description**                                                                                                                                                                                                                                                           |
| `dismissible`, `closeLabel`, part `close`     | Boolean **Dismissible**; Close is the IconButton sm neutral ghost with the close glyph, label Close                                                                                                                                                                                                                                |
| parts `body`, `footer`                        | Slots **Body** and **Footer** (ButtonGroup preferred and only), boolean **Show footer**                                                                                                                                                                                                                                            |
| part `backdrop`                               | Internal part **\_Dialog/Backdrop** (a 1280 × 800 scrim with the slot Dialog centered)                                                                                                                                                                                                                                             |
| `open`, `alert`, focus, Escape, motion, layer | Not drawn: behaviors of the code                                                                                                                                                                                                                                                                                                   |
| tokens                                        | `color/surface/overlay`, `color/content/primary, secondary`, `color/elevation/border`, `color/border/subtle`, `color/surface/scrim`, `border/width/default`, `shadow/modal`, `radius/overlay`, `component/dialog/inline-size/{size}`, `space/layout/md`, `space/content/xs, lg`, `typography/heading/sm`, `typography/body/sm, md` |

## Construction notes

- The panel is a vertical auto layout bound to the size width, with the header (heading and the close box as tall as the title line), the Body slot and the Footer slot (a ButtonGroup aligned at the end: Cancel, then Delete in danger, the primary action last).
- The body room of the code (focus/width + focus/offset inside the scrolling area) is compensated in the code and invisible at rest; it is not drawn.

## Justified differences

None in `computed.json`. Not drawn: the body room, focus management, the inert page, stacking and the motion (behaviors of the code).

## Parity method

`dialog-parity.plugin.js` hashes the panel line (surface, title color, width, padding, radius, backdrop, title size, description color) of the three sizes in the four contexts of `computed.json` and checks the layout in the 18 contexts; `node authoring/adapters/figma/wave3-parity-report.mjs dialog <result.json>` writes `parity.json`. The report rounds the alpha of a color from its float32 value, as Figma stores it (the scrim of 0.7 is `b2`).
