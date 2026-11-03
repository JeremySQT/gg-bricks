# Toast — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **feedback/toast** (`407:117`). Master: library page **Feedback** (`407:112`), section **Toast** (`426:36`).
- Masters: the item set **Toast** ([`426:819`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=426-819)), 20 variants, and the region set **ToastRegion** ([`426:1471`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=426-1471)), 6 variants; built by `authoring/adapters/figma/toast-master.plugin.js` on the adapter `action-family.plugin.js`.
- Specification frame: **Toast — Specification** ([`429:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=429-2)); built by `toast-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/feedback/toast/contract.json` (approved 2026-11-03 with the review amendments) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/toast`).
- Node IDs: `reports/components/toast/figma/ledger.json`. Parity: `reports/components/toast/figma/parity.json` (36 records, 0 failures, 4 justified) plus 1548 extra checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                        | Figma                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| region `placement`, `label`                     | ToastRegion: variant Placement (6), text **Label** (hidden region name)                                                                                                                                                                                                                                                                                                       |
| region part `items`, `max`                      | Slot **Toasts** of the region (Toast preferred and only); the queue (max) is a behavior of the code                                                                                                                                                                                                                                                                           |
| item `intent`, `appearance`                     | Variant properties Intent, Appearance (neutral, intense)                                                                                                                                                                                                                                                                                                                      |
| item state `layout`                             | Variant property Layout (single, multi): the code chooses it from the description                                                                                                                                                                                                                                                                                             |
| item `title`, `description`                     | Text properties **Title**, **Description** (multi)                                                                                                                                                                                                                                                                                                                            |
| item part `action`                              | Exposed nested **Action** (Button sm, neutral outline by default) and boolean **Show action**                                                                                                                                                                                                                                                                                 |
| item `closable`, `dismissLabel`, part `dismiss` | Boolean **Closable**; Dismiss is the IconButton sm neutral ghost with the close glyph, label Dismiss                                                                                                                                                                                                                                                                          |
| `duration`, state `paused`                      | Not drawn: the countdown and its pause are behaviors of the code                                                                                                                                                                                                                                                                                                              |
| tokens                                          | `color/surface/overlay`, `color/elevation/border`, `color/content/primary, secondary`, `color/status/{intent}/surface, border, content, icon`, `shadow/overlay`, `radius/overlay`, `size/overlay/panel`, `space/content/md, sm, xs`, `typography/label/md`, `typography/body/sm`, `size/icon/md`; region `space/content/sm` (gap), `space/layout/sm` (edge, a placement rule) |

## Construction notes

- Single centers the icon, the title, the action and the dismiss button on one row; multi aligns at the top, with the icon and dismiss boxes as tall as the title line, and puts the action under the description.
- **Intense buttons follow the intent**: intense variants set the mode of **Components · action family** to their intent (see the Alert specification); neutral variants use the default mode, so their action stays neutral.
- The Action is an exposed instance: change its intent, appearance and label through its own properties (swapping it would drop the cleared minimum height of the instance).

## Justified differences

1. **Transitions** (`transition`, motion/duration/base): the enter and leave motion is an animation of the code.
2. `computed.json` measures only the danger toast in four contexts; the extra checks cover the intense appearance, the action families and the alignment in all 18 contexts.

## Parity method

`toast-parity.plugin.js` builds the danger toast line (surface, title color, edge and drop shadows, radius, padding, width, icon, description color) in the four contexts of `computed.json` and runs the extra checks; `node authoring/adapters/figma/wave3-parity-report.mjs toast <result.json>` compares the hashes and writes `parity.json`.
