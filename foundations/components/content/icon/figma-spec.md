# Icon — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **content/icon** (`149:4`), which holds the master and this specification.
- Master: component set **Icon** ([`149:20`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=149-20)), 5 variants (Size), default Size=md.
- Specification frame: **Icon — Specification** ([`152:7`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=152-7)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, written in plain sentences for designers; token paths and mechanics stay in this file. Its instances are explanatory, never masters. Built by `authoring/adapters/figma/icon-spec.plugin.js`.
- Reproduces: contract `foundations/components/content/icon/contract.json` (sha256 `159c7201…01b6`) and the implementation approved on 2026-10-14 (`packages/svelte/src/components/icon`).
- Node and variable IDs: `reports/components/icon/figma/ledger.json`. Parity: `reports/components/icon/figma/parity.json` (360 records, 0 failures). Screenshots: `reports/components/icon/figma/master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract              | Figma                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                | Variant property **Size** (xs, sm, md, lg, xl; default md)                                                                                                                                                                                                                                                                                                                                         |
| `label`               | Not a property: it has no visual effect (accessible name only). The specification says so and shows a named status icon as an example                                                                                                                                                                                                                                                              |
| part `box`            | The variant component itself: a square frame, width and height bound to `size/icon/{size}`, no fill, clips its content                                                                                                                                                                                                                                                                             |
| part `glyph`          | Layer **Glyph**: an exposed instance bound to the instance-swap property **Glyph** (default `phosphor/plus`, `200:4367`; no preferred values: the swap menu lists the local components, with the 1,512 `phosphor/<name>` glyphs of the page `assets/phosphor`, searchable by name). The instance is sized to the box with scale constraints, so a swapped drawing fills the box without distortion |
| `tokens.size`         | `size/icon/{size}` (Brand collection, 12 / 16 / 20 / 24 / 32 in every brand)                                                                                                                                                                                                                                                                                                                       |
| current content color | The Phosphor glyph's fill is bound to `color/content/primary`; a host overrides that fill on its instance (Button binds it to `button/foreground`). Figma has no `currentColor`                                                                                                                                                                                                                    |
| states                | None (the contract defines none)                                                                                                                                                                                                                                                                                                                                                                   |

Every dimension of the master is bound to a variable; the only color is the glyph fill, bound to a variable in the Phosphor component. Brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Box**: each variant is a component frame resized to the icon size, with `width` and `height` bound to the size variable. `clipsContent` is on, like `overflow: hidden` in the code.
- **Glyph**: an instance of a Phosphor component, resized to the box; its vector keeps scale constraints, so the drawing follows the box (18/24 of the box, inset 1/8) in every size and when a host resizes the instance.
- **Default variant**: Figma takes the top-left variant as the default; Size=md is placed first (as the Button set places its md column first), the other sizes follow in ascending order.
- **Size in a host**: a host that defines an icon size binds the instance's width and height to its own variable (Button: `button/icon-size`), which overrides the component binding (checked while building: an md instance bound to `size/icon/lg` measures 24 × 24 with the drawing at 18 × 18).
- **Color in a host**: override the fill of the vector inside the Glyph instance (the specification's `icon()` helper does this for examples in secondary, tertiary, disabled and status colors).

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Label.** The code switches between `aria-hidden` and `role="img"` + `aria-label`; Figma has no accessibility tree, so the label is documentation only.
2. **Glyph source.** The code receives any svg content and a `viewBox`; the Figma master receives a component through the Glyph swap. Only drawings that follow the Phosphor grid (square, drawing inset 1/8) sit exactly like in the code; other grids render but sit off in hosts that assume the inset, as in the code.
3. **Local Phosphor copy.** The Phosphor community library is not available to the file, so the reference set is imported locally: Phosphor 2.1.1 regular, 1,512 components `phosphor/<name>` on the page `assets/phosphor` (2026-10-19, `reports/assets/phosphor/ledger.json`), whose vectors are those of `@phosphor-icons/core`, the package the code examples use. Until then the glyphs were five local fixtures (`_Fixture/Icon`), replaced in every instance with identical drawings. A new Phosphor version is applied in place (adapter change, no contract change).
4. **Color inheritance** is a per-instance fill override instead of `currentColor` (see Mapping).

## Page style and diagrams

Same layout as the Button page (white header on a gray page, hero card, blueprint anatomy board as a card, white cards in the body; see `foundations/components/actions/button/figma-spec.md`). The Anatomy board shows the box (dashed), the drawing area (tinted, inset 1/8) and the “plus” glyph zoomed five times, with callouts 1 Box, 2 Glyph, A inset and B size. Colors come from the Figma-only **Wireframe** collection and the documentation components `_Spec/Board`, `_Spec/Callout`, `_Spec/Marker` on the Utilities page.

## Adapter mechanics

- No adapter collection is needed: the Icon has one dimension role and no color of its own.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read the glyph vector inside instances.

## Parity method

`authoring/adapters/figma/icon-parity.plugin.js` instantiates the five sizes in a temporary frame per context (18 brand × appearance × density contexts, explicit modes), resolves the bound width, height and glyph fill with `resolveForConsumer`, reads the drawing's box, and removes the frame. `icon-parity-report.mjs` compares the result with `reports/components/icon/svelte/computed.json` (270 records: width, height and fill per size and context) and adds 90 records checking the drawing's size and inset per size and context.
