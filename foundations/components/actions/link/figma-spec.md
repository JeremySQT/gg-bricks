# Link — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **actions/link** (`225:2`): this specification and its instances. Master and its internal parts: library page **Actions** (`343:2`), section **Link** ([`343:5`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-5)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **Link** ([`232:659`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=232-659)), 54 variants, with the internal part **\_Link/Destination** ([`232:442`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=232-442)), 6 variants; both built by `authoring/adapters/figma/link-master.plugin.js` (rebuilt on 2026-10-20, see the ledger's maintenance).
- Specification frame: **Link — Specification** ([`234:13`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=234-13)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/link-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/actions/link/contract.json` (sha256 `d482a8b7…`, approved 2026-10-17, glyph and meta roles of 2026-10-19) and the implementation approved on 2026-10-19 (`packages/svelte/src/components/link`).
- Node and variable IDs: `reports/components/link/figma/ledger.json`. Parity: `reports/components/link/figma/parity.json` (4 680 records, 0 failures). Screenshots: `reports/components/link/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

A designer configures a link from its properties only; no variable mode is chosen by hand (user decision at the Figma parity review, 2026-10-20).

| Contract                                        | Figma                                                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tone`                                          | Variant property **Color**: accent (tone accent, default) or on info, on success, on warning, on danger, on inverse (tone inherit inside that context)                                                             |
| the surrounding text (no prop in code)          | Variant property **Size**: md (default), sm, lg, the body text size the link sits in                                                                                                                               |
| `interaction` state                             | Variant property **State**: default, hover, pressed                                                                                                                                                                |
| `focus` state                                   | Boolean **Focus** (Focus ring layer)                                                                                                                                                                               |
| `label`                                         | Text property **Label**                                                                                                                                                                                            |
| `destination`                                   | Exposed nested instance **Destination** (part `_Link/Destination`) with its variant property Destination: page (default), external, email, phone, file, print                                                      |
| `fileType`, `fileSize`                          | Text property **Meta** of the Destination part (file; “ (PDF, 2.4 MB)”, leading space kept) and the glyph of the format in the part's instance-swap property **File icon** (default file-pdf; file-xls, file-zip…) |
| `href`, `destinationLabel`                      | Not properties: no visual effect (destinationLabel changes only the announced suffix)                                                                                                                              |
| parts `label`, `meta`, `indicator`, `container` | Layers Label, Destination › Meta, Destination › Indicator (with the Indicator icon glyph), the variant itself                                                                                                      |

## Construction notes

- **Inline text.** In code the link is inline text that takes the font and, with tone inherit, the color of its context. Figma has no inheritance, so each Link variant sets on itself the modes of two hidden adapter collections, as the Button variants set their style and state modes: **Components · link size** (modes md, sm, lg) holds `link/font-family`, `link/font-weight`, `link/font-size`, `link/line-height` and `link/letter-spacing`, aliases of `typography/body/{size}/*`; **Components · link color** (modes accent, on-info, on-success, on-warning, on-danger, on-inverse) holds `link/content` (the label), `link/quiet` (meta and glyph) and `link/indicator-opacity`. Accent resolves to `color/content/link`, `color/content/tertiary` and 100 %; on-{status} to `color/status/{status}/content` twice and `opacity/muted`; on-inverse to `color/content/inverse` twice and `opacity/muted`. The nested part resolves the same variables, so the variant's modes reach it. These are adapter mechanics, not source tokens or contract fields.
- **No secondary or tertiary context.** A link inside secondary or tertiary text keeps the link color (Color accent): a link dimmed to its context is harder to find, so the Figma library offers only the status and inverse contexts, where the link color could fail contrast.
- **Label**: text bound to the five `link/*` typography variables, leading trim at cap height in a box at least `link/line-height` high, underline with skip ink and automatic offset and color, fill `link/content`.
- **Destination part**: horizontal auto layout after the label. page is empty (fixed at 0.01 px wide: an empty auto-layout frame keeps a 100 px width); file holds **Meta** (same typography, no decoration, fill `link/quiet`); every destination but page holds an **Indicator** frame with left padding `space/content/xs` and the Phosphor glyph itself (layer Indicator icon; a nested Icon until 2026-10-26), whose width and height are bound to `link/font-size` (one em), glyph fill `link/quiet`, layer opacity `link/indicator-opacity`. Each destination imposes its glyph (arrow-up-right, envelope, phone, printer); the file destination puts its glyph behind the instance-swap property **File icon** (default file-pdf), for the format. No size can be changed on an instance.
- **States**: the underline is 1 px (default) and 2 px (hover, pressed); the color does not change.
- **Focus ring**: absolute frame 2 px outside the link, outside stroke `focus/width` in `color/focus/ring`, corners `radius/indicator`, STRETCH constraints.
- **Canvas**: a locked rectangle in `color/surface/inverse` sits behind the on inverse rows of the set, so that they read on the page; it is not part of the component.

## Justified differences

Recorded as such in `parity.json` where a record exists; none hides a defect of the master.

1. **Underline thickness** is a literal (1 px, 2 px): Figma refuses a variable binding on the text decoration thickness. The values are those of `border/width/default` and `border/width/strong` in every brand (234 records noted as justified; hover and pressed are not in `computed.json`, the browser test checks them).
2. **Parent text.** The code reads the font and color of the parent element; Figma reads the Size and Color variants. The parity compares the parent font of the browser with the md size, and the parent color with the label color of the “on …” cases, where the code inherits it; with Color accent the parent color has no Figma counterpart (126 records noted as justified).
3. **Size.** The code has no size: a link takes any font. Figma offers the three body sizes; a link in a label, caption or heading style is drawn by styling the words of the text layer.
4. **Wrapping.** In code the label wraps with the sentence and the meta and indicator stay with the last word; a Figma component cannot flow inside a paragraph. The specification shows the two Figma techniques: a wrapping row of text and Link instances, or the words styled directly in a paragraph.
5. **Focus ring corners.** The CSS outline follows the border radius plus the offset (6 px); Figma cannot add the offset to `radius/indicator`, so the ring corners are 4 px.
6. **Forced-colors mode, the announced suffix, opening in a new tab and the protocol of email and phone links** are code-only.

## Page style and diagrams

Same layout as the other component pages. The Anatomy board shows a file link (“Report (PDF, 2 MB)” with its glyph) zoomed three times, with its focus ring dashed and translucent (shown only on keyboard focus: the link has no box), callouts 1 Label, 2 Meta, 3 Indicator, 4 Focus ring and the dimensions A (gap) and B (glyph size). Colors come from the Figma-only **Wireframe** collection and the documentation components `_Spec/Board`, `_Spec/Callout`, `_Spec/Marker` on the Utilities page.

## Parity method

For each of the 18 contexts a temporary frame with explicit Brand, Appearance and Density modes holds the 13 cases of `reports/components/link/svelte/computed.json` as instances of the Size md variants (the body md text of the review page): Color accent with the six destinations (nested Destination), Color on info, on success, on warning, on danger and on inverse (page), Color on inverse with the file destination, and the focused accent page link. `link-parity.plugin.js` reads the label color, the resolved font size, weight and line height, the decoration line, thickness and color, the meta decoration and color, the glyph size, color, opacity and gap, the focus ring and the radius as a field string, hashed per context; `link-parity-report.mjs` builds the same strings from `computed.json`. All 18 hashes are equal (4 680 records, 0 failures; re-measured on 2026-10-20 after the rebuild).
