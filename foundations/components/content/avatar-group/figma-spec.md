# AvatarGroup — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **content/avatar-group** (`540:60`). Masters: library page **Content** (`343:1635`), section **AvatarGroup** (`544:510`).
- Master: **AvatarGroup** ([`544:721`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=544-721)), 10 variants. Built by `authoring/adapters/figma/wave5-avatar-group-master.plugin.js`.
- Specification frame: **AvatarGroup — Specification** ([`553:554`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=553-554)); built on `spec-lib.plugin.js` (stored `_Script/spec-lib`, bodies run in the wave 5 session), with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/content/avatar-group/contract.json` and the implementation approved on 2026-11-14 at the grouped wave 5 implementation gate (`packages/svelte/src/components/avatar-group`).
- Node IDs: `reports/components/avatar-group/figma/ledger.json`. Parity: `reports/components/avatar-group/figma/parity.json` (120 records, 0 failures). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                     | Figma                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `size`, `shape`                              | variants Size and Shape, applied to every Avatar instance of the group                                     |
| part `avatars`                               | five Avatar instances (Avatar 1 to 5; 3 to 5 can be hidden); select a layer to set its picture or initials |
| part `overflow`, `max`, `total`, `moreLabel` | Overflow: an Avatar whose Initials hold +N (Show overflow); the counting is a behavior of the code         |
| `label`                                      | Not drawn: the list name is a behavior of the code                                                         |

## Construction notes

- The negative item spacing comes from the Figma-only Brand variables avatar-group/spacing/{size} (−6, −8, −10, −12, −16 px, hidden from publishing): Figma cannot negate the alias component/avatar-group/overlap/{size}. Keep them in the keep list of the prune script, like checkbox/focus-radius.
- Each avatar is drawn above the previous one by the auto layout order (stacking B, user decision of 2026-11-14).
- The ring is an outside stroke of border/width/strong in color/surface/default on each Avatar instance.

## Justified differences

Not drawn: max, total and the +N count (computed by the code), the list semantics; the forced-colors ring.

## Parity method

`wave5-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes, sizes, gaps, paddings, radii and typography, returned as one FNV-1a hash per context and component of the sorted lines. `node authoring/adapters/figma/wave5-parity-report.mjs <result.json>` builds the same lines from `computed.json` and writes `parity.json`; an equal hash proves every record equal.
