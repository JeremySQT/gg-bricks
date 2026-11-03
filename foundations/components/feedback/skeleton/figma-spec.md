# Skeleton — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **feedback/skeleton** (`407:115`). Master: library page **Feedback** (`407:112`), section **Skeleton** (`417:26`).
- Master: component set **Skeleton** ([`417:74`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=417-74)), 11 variants, built by `authoring/adapters/figma/skeleton-master.plugin.js`.
- Specification frame: **Skeleton — Specification** ([`418:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=418-2)); built by `skeleton-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/feedback/skeleton/contract.json` and the implementation approved on 2026-11-03 (`packages/svelte/src/components/skeleton`).
- Node IDs: `reports/components/skeleton/figma/ledger.json`. Parity: `reports/components/skeleton/figma/parity.json` (558 records, 0 failures, 162 justified). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                     | Figma                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shape`, `size`, `lines`     | Variant properties Shape (text, block, circle), Size (md, sm, lg), Lines (1, 2, 3); Size and Lines vary for text only (block and circle exist once, Size=md, Lines=1) |
| parts `container`, `line`    | Variant frame; Line frames holding a Bar                                                                                                                              |
| tokens                       | `color/surface/muted`, `typography/body/{size}/lineHeight` and `/fontSize`, `radius/indicator`, `radius/container`, `radius/full`                                     |
| `pulseOpacity`, `motionLoop` | Not drawn: the pulse is an animation of the code (the specification shows a still at 70 %)                                                                            |

## Construction notes

- A text variant is a vertical auto layout that hugs its lines; each Line has the line height of the body text and centers a Bar of its font size (center constraint). Full bars stretch; the last of several covers 60 % (scale constraint), as the code.
- `lines` is any number in the code; the master offers 1 to 3 lines (stack instances for more).
- Paints are bound with their resolved fallback color.

## Justified differences

1. **Pulse** (`pulse`, `duration`): an animation of the code.
2. **Hidden from assistive technology** (`hidden`): an attribute of the code, stated in the set description.
3. Not in `computed.json`: full-width bars stretch to whole pixels in an instance of fractional width (369 for 368.66 px).

## Parity method

`skeleton-parity.plugin.js` instantiates the three text sizes with 3 lines and a 160 px block at the width of the code's review page in each density, hashes the sorted field lines per context and checks bar centering and the circle radius; `node authoring/adapters/figma/wave3-parity-report.mjs skeleton <result.json>` compares the hashes with `computed.json` (18 equal) and writes `parity.json`.
