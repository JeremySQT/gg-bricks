# Spinner — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **feedback/spinner** (`407:116`): this specification and its instances. Master: library page **Feedback** (`407:112`), section **Spinner** (`408:2`).
- Master: component set **Spinner** ([`408:15`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=408-15)), 4 variants, built by `authoring/adapters/figma/spinner-master.plugin.js`.
- Specification frame: **Spinner — Specification** ([`412:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=412-2)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples; built by `authoring/adapters/figma/spinner-spec.plugin.js` on the shared library `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/feedback/spinner/contract.json` (approved 2026-11-03) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/spinner`).
- Node IDs: `reports/components/spinner/figma/ledger.json`. Parity: `reports/components/spinner/figma/parity.json` (864 records, 0 failures, 144 justified). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png` in the same folder.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                | Figma                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `size`                                  | Variant property Size (md, sm, lg, xl; default md)                                          |
| `label`                                 | Text property **Label** on a hidden layer (the accessible name; empty: decorative)          |
| parts `container`, `track`, `indicator` | The variant frame, vectors Track and Indicator                                              |
| tokens `size`, `trackOpacity`           | `size/icon/{size}` (width, height), `component/spinner/track-opacity` (Track layer opacity) |
| token `motionDuration`                  | Not drawn: the turn is an animation of the code (named in the set description)              |

## Construction notes

- The drawing is the one of `Spinner.svelte`: a ring of radius 9 in a 24-unit box, scaled to the size, stroke 2.5/24 of the size (1.667, 2.083, 2.5, 3.333 px), round caps on the indicator. The contract text says “1/9 of size” with the example “2.5 units in a 24-unit box”; the code and the master follow the example (2.5/24 ≈ 1/9.6). Correcting the contract wording is proposed at the Figma parity gate.
- **Color.** Figma has no inherited color: Track and Indicator bind `color/content/primary`, and a host overrides both strokes with its own content color.
- **Button and IconButton** compose the Spinner since 2026-11-03: the 270 instances of the former part `_Button/Loading indicator` (42:28, removed) were swapped for Spinner variants of the same width (`button-spinner-swap.plugin.js`), keeping the size bindings, the visibility and the stroke color of each variant; the track opacity is now the Spinner's (20 %, it was 25 %).

## Justified differences

1. **Turn** (`duration`, `timing`): an animation of the code; Figma masters are static.
2. **Inherited color** (`color`, `parentColor`): compared with the default stroke color, the content color of the review page.

## Adapter mechanics

- `component/spinner/track-opacity` is emitted ×100 (20) like every opacity token, because Figma reads a number bound to layer opacity as a percentage (`tooling/build-tokens.ts`, since 2026-11-03).
- The specification pages of wave 3 run the shared helper library stored as the hidden, locked text layer `_Script/spec-lib` (`411:2`) on the Utilities page (source: `authoring/adapters/figma/spec-lib.plugin.js`), so that a page body sends only its own blocks.

## Parity method

`spinner-parity.plugin.js` instantiates the four variants in a temporary frame with explicit Brand, Appearance and Density modes in each of the 18 contexts and reads the resolved width, height, stroke colors, track opacity, stroke widths and cap; `spinner-parity-report.mjs <result>` compares them with `reports/components/spinner/svelte/computed.json` and adds the stroke-width and cap records of the contract drawing.
