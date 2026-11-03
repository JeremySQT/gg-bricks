# Progress — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **feedback/progress** (`407:114`): this specification and its instances. Master: library page **Feedback** (`407:112`), section **Progress** (`413:2`).
- Master: component set **Progress** ([`413:147`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=413-147)), 24 variants, and the internal part **\_Progress/Track** (`416:518`, 12 variants); built by `authoring/adapters/figma/progress-master.plugin.js`.
- Specification frame: **Progress — Specification** ([`416:2049`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=416-2049)); built by `progress-spec.plugin.js` on the shared library `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/feedback/progress/contract.json` (approved 2026-11-03, with the radius amendment) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/progress`).
- Node IDs: `reports/components/progress/figma/ledger.json`. Parity: `reports/components/progress/figma/parity.json` (2376 records, 0 failures, 216 justified). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                      | Figma                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `indeterminate`, `intent`, `size`                             | Variant properties Type (determinate, indeterminate), Intent, Size; default determinate · accent · md                                                                                                                                           |
| `value`, `max`                                                | Value of the exposed nested **Track** (0 to 100 in steps of 10, or indeterminate)                                                                                                                                                               |
| `label`, `showLabel`, `showValue`                             | Text property **Label**; booleans **Show label**, **Show value**; text **Value text** (the percentage shown)                                                                                                                                    |
| parts `container`, `label`, `valueText`, `track`, `indicator` | Variant frame, Label, Value, Track (instance of `_Progress/Track`), Indicator                                                                                                                                                                   |
| tokens                                                        | `color/surface/muted`, `color/status/{intent}/icon`, `color/content/primary`, `color/content/secondary`, `typography/label/md`, `typography/numeral/sm`, `component/progress/thickness/{size}`, `component/progress/radius`, `space/content/xs` |

## Construction notes

- The bar is a vertical auto layout (320 px by default, fill in a layout) with a First line (Label filling and truncated, Value) and the Track, which fills the width and takes the thickness of the size; the indicator keeps its share of the track through a scale constraint.
- **The fraction is a variant of the internal part.** An instance sublayer cannot be resized through the Plugin API or kept as an override (the Indicator came back to 60 %), so the fraction is the Value of the exposed `_Progress/Track` instance, in steps of 10 %.
- Each variant sets the indicator color of its intent; the paint is bound with its resolved fallback color (an override equal to the main binding otherwise renders the black fallback).

## Justified differences

1. **Tabular figures** (`valueNumeric`): `font-variant-numeric` cannot be set through the Plugin API; switch them on by hand, as noted on the numeral styles.
2. **Motion**: the value transition and the indeterminate sweep are animations of the code.
3. **First line without label and value**: the code removes it; in Figma the empty First line stays in the layout with the gap (2 to 6 px). Hide label and value only when the bar stands alone.

## Parity method

`progress-parity.plugin.js` instantiates the 12 determinate variants (value shown) at the width of the code's review page in each density and hashes the sorted field lines per context; `node authoring/adapters/figma/wave3-parity-report.mjs progress <result.json>` builds the same lines from `computed.json` (18 equal hashes) and writes `parity.json`. The same body checks the 11 Value steps (share of the track and thickness).
