# IconButton — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **actions/icon-button** (`211:2`): this specification and its instances. Master: library page **Actions** (`343:2`), section **IconButton** ([`343:4`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-4)), since 2026-10-29; the specification links to the section from the top right of its title row (since 2026-10-30), and the section starts with a header that links back to the specification.
- Master: component set **IconButton** ([`211:1167`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=211-1167)), 135 variants, built by `authoring/adapters/figma/icon-button-master.plugin.js`.
- Specification frame: **IconButton — Specification** ([`219:1828`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=219-1828)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/icon-button-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/actions/icon-button/contract.json` (sha256 `b9298af0…`, approved 2026-10-17) and the implementation approved on 2026-10-19 (`packages/svelte/src/components/icon-button`).
- Node and variable IDs: `reports/components/icon-button/figma/ledger.json`. Parity: `reports/components/icon-button/figma/parity.json` (8 658 records, 0 failures). Screenshots: `reports/components/icon-button/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                       | Figma                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent`, `appearance`, `size` | Variant properties Intent, Appearance, Size (default neutral · ghost · md, the top-left variant)                                                                                                                          |
| `interaction` state            | Variant property State: default, hover, pressed, loading, disabled                                                                                                                                                        |
| `focus` state                  | Boolean **Focus** (independent axis, combines with every state)                                                                                                                                                           |
| `label`                        | Text property **Label** on a hidden text layer “Label (accessible name, not shown)”: never drawn, read in Dev Mode                                                                                                        |
| part `icon` (one icon)         | Instance-swap property **Icon** (default `phosphor/plus`): the glyph sits directly in the variant at `size/icon/{size}`; any glyph of the page `assets/phosphor`                                                          |
| part `loadingIndicator`        | Layer **Loading indicator** (instance of the **Spinner** set `408:15` since 2026-11-03, formerly `_Button/Loading indicator`), visible in State=loading, hidden elsewhere so that an instance can show loading + disabled |
| part `container`               | Layer **Container**                                                                                                                                                                                                       |
| `href`, `disabled`, `loading`  | Not properties: href has no visual effect; disabled and loading are State values                                                                                                                                          |
| `minTarget`                    | Layer **Target**: absolute, empty, `size/target/min` square centered on the container                                                                                                                                     |

Every color, dimension, radius and stroke of the masters is bound to a variable of the Brand, Appearance and Density collections or to the Button adapter variables; brand, appearance and density are chosen by the consuming frame's variable modes, never by component properties.

## Construction notes

- **Root** is the visible square: auto layout, width and height bound to `size/control/{size}`, so the square follows the density like the Button height. It has no fill and does not clip.
- **Target**: the code extends the target with a `::before` pseudo-element that takes no layout space; Figma mirrors it with an absolute, empty frame bound to `size/target/min` in both dimensions with center constraints (checked centered in the three densities). It reserves nothing in auto layout, exactly like the code.
- **Spacing between icon buttons** (specification examples): the auto-layout gap of every row of icon buttons is bound to `space/control/gap/{size}` (4/6/8 px compact, 6/8/10 px standard, 8/10/12 px comfortable for sm/md/lg), as for buttons (user decision at the Figma parity review, 2026-10-20). In compact density, sm squares (28 px) sit 4 px apart and their 44 px targets reach 4 px into the neighbor's square: a documented exception, the squares staying above the 24 px minimum of WCAG 2.5.8. A group component that owns this spacing (ButtonGroup, Toolbar) is planned for waves 3 and 4 (`authoring/roadmap.md`).
- **Container** fills the root; fill bound to `color/action/{intent}/{appearance}/{state}/surface`, corners to `radius/control`; for the outline appearance an inside stroke bound to `color/action/{intent}/outline/{state}/border` and `border/width/default`, so it never changes the outer size.
- **Icon** is centered by its box (auto layout, center), as in the code: the reference set draws its 1/8 inset on every side, so no optical offset is needed. Its size is the Icon variant of the size (sm 16, md 20, lg 24, bound to `size/icon/{size}`).
- **Icon color**: the glyph vector fill is overridden to `button/foreground`, which resolves to the content color of the variant's intent, appearance and state through the modes each variant sets (see Adapter mechanics), like `currentColor` in the code. A swapped glyph keeps the color.
- **Loading**: the Loading indicator takes the icon's place and size; its strokes are bound to the variant's content color. The Icon is hidden while loading, which changes nothing in the square size.
- **Focus ring**: absolute frame 2 px outside the container (focus offset), outside stroke bound to `focus/width` and `color/focus/ring`, corners bound to `radius/focus`, STRETCH constraints so that it follows the square in every density.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Forced-colors outline.** The code keeps a transparent 1 px outline so that forced-colors mode draws a boundary. Figma has no forced-colors mode: no layer stands for it (594 `outline` records noted as justified).
2. **Loading + focus.** The browser measures a loading icon button with keyboard focus (loading stays focusable), so its focus outline is computed; in Figma State=loading combines with the Focus switch (36 records noted as justified).
3. **Disabled + loading** is an instance override (State=disabled, Icon hidden, Loading indicator shown), not a variant, as for the Button.
4. **Focus offset** is ring geometry (2 px), not a variable binding, because Figma cannot bind an absolute position. `focus/offset` is 2 in every brand and density.
5. **Label** is documentation only: Figma has no accessibility tree. The hidden layer carries it for hand-off.
6. **Tooltip** is the integration's job in the code too; the specification only mentions it.
7. **Transitions, spinner rotation and reduced motion** are code-only.
8. **Re-selecting the default glyph.** Choosing `plus` again in the Icon property while it is already the glyph resets the glyph layer (Figma treats it as a reset to the default): it loses its color override and turns to the primary text color; choosing any other glyph, or resetting the instance, restores it. The same applies to the Button's leading icon. Figma behavior; the scripts never set the default glyph explicitly.

## Page style and diagrams

Same layout as the Button and Icon pages (white header on a gray page, hero card, blueprint anatomy board as a card, white cards in the body; see `foundations/components/actions/button/figma-spec.md`). The Anatomy board shows the target (dashed, not to scale), the focus ring, the container and the icon box zoomed four times, with callouts 1 Target, 2 Container, 3 Icon, 4 Focus ring and the dimensions A (size) and B (icon size); the legend adds the label, which is not drawn. Colors come from the Figma-only **Wireframe** collection and the documentation components `_Spec/Board`, `_Spec/Callout`, `_Spec/Marker` on the Utilities page.

## Adapter mechanics

- The IconButton adds no variable: it reuses the Button's hidden collections. Each variant sets the mode of **Components** (sm, md, lg), of **Components · button style** (`{intent}-{appearance}`) and of **Components · button state** (`{state}`), so that `button/foreground` resolves to `color/action/{intent}/{appearance}/{state}/content`.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read the hidden Loading indicator, Label or Focus ring of instances.

## Parity method

For each of the 18 contexts (brand × appearance × density) a temporary frame with explicit modes holds instances of the 27 default cases (the three sizes) and, in base-light-standard, base-dark-standard, brick-light-compact and orchid-dark-comfortable, the 45 md state cases (hover, pressed, focus, loading, disabled). For each case `icon-button-parity.plugin.js` reads the resolved glyph color (the spinner arc while loading), surface, stroke and weight, radius, container size, icon box size and offset from the container center, focus ring color, width and offset, and the target size and offset, as a field string; it returns per context the count and the FNV-1a hash of the sorted lines. `icon-button-parity-report.mjs` builds the same strings from `reports/components/icon-button/svelte/computed.json` and writes `parity.json`, one record per computed record plus one target record per case: an equal hash proves every field equal. All 18 contexts matched on 2026-10-19 (before and after the hidden indicators were added).
