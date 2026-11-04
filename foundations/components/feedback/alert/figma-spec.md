# Alert — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **feedback/alert** (`407:113`). Master: library page **Feedback** (`407:112`), section **Alert** (`422:26`).
- Master: component set **Alert** ([`422:715`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=422-715)), 20 variants (Intent × Title × Show actions), built by `authoring/adapters/figma/alert-master.plugin.js` on the adapter `action-family.plugin.js`.
- Specification frame: **Alert — Specification** ([`460:1133`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=460-1133)); built by `alert-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/feedback/alert/contract.json` (approved 2026-11-03 with the review amendments: buttons and links follow the intent) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/alert`).
- Node IDs: `reports/components/alert/figma/ledger.json`. Parity: `reports/components/alert/figma/parity.json` (990 records, 0 failures) plus 540 extra checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                      | Figma                                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent`                                      | Variant property Intent (info default, neutral, success, warning, danger)                                                                                                                   |
| `title`                                       | Variant property Title (yes, no) and text property **Title text**                                                                                                                           |
| content                                       | Text property **Content**                                                                                                                                                                   |
| part `icon`                                   | Layer Icon: the intrinsic Phosphor glyph of the intent (swap it to replace)                                                                                                                 |
| part `actions` (ButtonGroup, at most one)     | Slot **Actions** (ButtonGroup preferred and only; default: a ButtonGroup sm) with the variant **Show actions** (yes)                                                                        |
| `dismissible`, `dismissLabel`, part `dismiss` | Boolean **Dismissible**; Dismiss is the IconButton sm neutral ghost with the close glyph and the label Dismiss                                                                              |
| `live`                                        | Not drawn: an announcement behavior of the code                                                                                                                                             |
| tokens                                        | `color/status/{intent}/surface, content, border, icon`, `border/width/default`, `radius/container`, `space/content/md, sm, xs`, `typography/label/md`, `typography/body/sm`, `size/icon/md` |

## Construction notes

- **More room under the actions** (user review of the Figma parity, 2026-11-04, in the code as well): with actions, the block-end padding is `actionsPaddingEnd` (space/content/lg: 12, 16, 24 px by density) instead of space/content/md. Since Figma cannot change a padding from a boolean, **Show actions** became a variant: yes holds the Actions slot and binds paddingBottom to space/content/lg. A variant property cannot share the name of the slot (the slot layer is named after its property), hence Show actions and Actions.

- Horizontal auto layout (480 px by default; fill in a layout): Icon box, Body (Text, Actions), Dismiss box. The Icon box and the Dismiss box are as tall as the first line (the title line with a title, the content line without), so that the glyph and the button are centered on it; the 44 px target of the dismiss button overlaps the padding without moving the layout, as in the code.
- **Buttons follow the intent.** Figma cannot point variables in a subtree, but it has modes: the hidden collection **Components · action family** (`421:1499`; modes default, neutral, info, success, warning, danger; 90 variables, no scopes, hidden from publishing) aliases each accent and neutral action role; the Button and IconButton masters bind those variables (690 paints and the 30 aliases of Components · button state, rebound by `action-family.plugin.js`; default mode leaves every value unchanged, 432 checks). Each Alert variant sets the mode of its intent, so that the dismiss button and the buttons of the Actions slot take the family; danger buttons keep their own.
- Links in the content (Link tone inherit) are not modeled: the content is a text property.

## Justified differences

None in `computed.json`. Not drawn: live announcements (code behavior).

## Parity method

`alert-parity.plugin.js` instantiates the five Title=yes variants with actions and dismiss in each of the 18 contexts and hashes the sorted field lines (surface, content, edge, radius, padding, gap, sizes, weights); `node authoring/adapters/figma/wave3-parity-report.mjs alert <result.json>` compares them with `computed.json` (18 equal hashes). Extra checks in the same body (540 passed; the 90 added on 2026-11-04 check that the block-end padding with actions resolves to space/content/lg, 12, 16 and 24 px as in the code): the accent solid surface and the neutral outline label of the actions and the dismiss glyph resolve to the action family of the intent; the icon and the dismiss button are centered on the title line.
