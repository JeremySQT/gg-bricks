# Link — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **actions/link** (`225:2`), after actions/icon-button; it holds the master and this specification.
- Master: component set **Link** ([`225:276`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=225-276)), 36 variants, built by `authoring/adapters/figma/link-master.plugin.js`.
- Specification frame: **Link — Specification** ([`228:63`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=228-63)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/link-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/actions/link/contract.json` (sha256 `d482a8b7…`, approved 2026-10-17, glyph and meta roles of 2026-10-19) and the implementation approved on 2026-10-19 (`packages/svelte/src/components/link`).
- Node and variable IDs: `reports/components/link/figma/ledger.json`. Parity: `reports/components/link/figma/parity.json` (4 680 records, 0 failures). Screenshots: `reports/components/link/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                        | Figma                                                                                                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`, `destination`                           | Variant properties Tone (accent, inherit) and Destination (page, external, email, phone, file, print); default accent · page                                           |
| `interaction` state                             | Variant property State: default, hover, pressed                                                                                                                        |
| `focus` state                                   | Boolean **Focus** (Focus ring layer)                                                                                                                                   |
| `label`                                         | Text property **Label**                                                                                                                                                |
| `fileType`, `fileSize`                          | Text property **Meta** (file variants; “ (PDF, 2.4 MB)”, leading space kept) and the glyph of the format in **Indicator icon › Glyph** (file-pdf, file-xls, file-zip…) |
| `href`, `destinationLabel`                      | Not properties: no visual effect (destinationLabel changes only the announced suffix)                                                                                  |
| parts `label`, `meta`, `indicator`, `container` | Layers Label, Meta, Indicator (with the exposed Indicator icon), the variant itself                                                                                    |
| the surrounding text                            | Variable modes chosen on the instance: **Components · link text** (font) and **Components · link context** (color for tone inherit)                                    |

## Construction notes

- **Inline text.** In code the link is inline text that takes the font and, with tone inherit, the color of its context. Figma has no inheritance, so two hidden adapter collections stand for the context: **Components · link text** (modes body-md by default, body-sm, body-lg, label-sm, label-md, label-lg, caption-md) holds `link/font-family`, `link/font-weight`, `link/font-size`, `link/line-height` and `link/letter-spacing`, aliases of `typography/{role}/*`; **Components · link context** (modes primary by default, secondary, tertiary, info, success, warning, danger, inverse) holds `link/context`, an alias of the matching content color. A designer sets both modes on the instance, in the Appearance panel, to match the surrounding text. They are adapter mechanics, not source tokens or contract fields.
- **Label**: text bound to the five `link/*` typography variables, leading trim at cap height in a box at least `link/line-height` high, underline with skip ink and automatic offset and color, fill `color/content/link` (accent) or `link/context` (inherit).
- **Meta** (file only): same typography, no decoration, fill `color/content/tertiary` (accent) or `link/context` (inherit).
- **Indicator**: a frame with left padding `space/content/xs` holding the Icon, whose width and height are bound to `link/font-size` (one em), glyph fill `color/content/tertiary` (accent) or `link/context` with layer opacity `opacity/muted` (inherit). Each destination sets its glyph: arrow-up-right, envelope, phone, file-pdf, printer.
- **States**: the underline is 1 px (default) and 2 px (hover, pressed); the color does not change.
- **Focus ring**: absolute frame 2 px outside the link, outside stroke `focus/width` in `color/focus/ring`, corners `radius/indicator`, STRETCH constraints.

## Justified differences

Recorded as such in `parity.json` where a record exists; none hides a defect of the master.

1. **Underline thickness** is a literal (1 px, 2 px): Figma refuses a variable binding on the text decoration thickness. The values are those of `border/width/default` and `border/width/strong` in every brand (234 records noted as justified; hover and pressed are not in `computed.json`, the browser test checks them).
2. **Parent text.** The code reads the font and color of the parent element; Figma reads the instance's text and context modes. The parity compares the parent values of the browser with the values resolved in those modes.
3. **Wrapping.** In code the label wraps with the sentence and the meta and indicator stay with the last word; a Figma component cannot flow inside a paragraph. The specification shows the two Figma techniques: a wrapping row of text and Link instances, or the words styled directly in a paragraph.
4. **Focus ring corners.** The CSS outline follows the border radius plus the offset (6 px); Figma cannot add the offset to `radius/indicator`, so the ring corners are 4 px.
5. **Forced-colors mode, the announced suffix, opening in a new tab and the protocol of email and phone links** are code-only.

## Page style and diagrams

Same layout as the other component pages. The Anatomy board shows a file link (“Report (PDF, 2 MB)” with its glyph) zoomed three times, with its focus ring, callouts 1 Label, 2 Meta, 3 Indicator, 4 Focus ring and the dimensions A (gap) and B (glyph size). Colors come from the Figma-only **Wireframe** collection and the documentation components `_Spec/Board`, `_Spec/Callout`, `_Spec/Marker` on the Utilities page.

## Parity method

For each of the 18 contexts a temporary frame with explicit modes holds the 13 cases of `reports/components/link/svelte/computed.json`: tone accent with the six destinations, tone inherit (page) in the info, success, warning, danger and inverse contexts (context mode), tone inherit (file) in the inverse context, and the focused accent page link; the text mode is body-md, the font of the review page. `link-parity.plugin.js` reads the label color, the context color, the resolved font size, weight and line height, the decoration line, thickness and color, the meta decoration and color, the glyph size, color, opacity and gap, the focus ring and the radius as a field string, hashed per context; `link-parity-report.mjs` builds the same strings from `computed.json`. All 18 hashes are equal.
