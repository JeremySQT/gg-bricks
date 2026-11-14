# Avatar — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **content/avatar** (`540:59`). Masters: library page **Content** (`343:1635`), section **Avatar** (`542:495`).
- Master: **Avatar** ([`543:605`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=543-605)), 30 variants. Built by `authoring/adapters/figma/wave5-avatar-master.plugin.js`.
- Specification frame: **Avatar — Specification** ([`551:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=551-2)); built on `spec-lib.plugin.js` (stored `_Script/spec-lib`, bodies run in the wave 5 session), with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/content/avatar/contract.json` and the implementation approved on 2026-11-14 at the grouped wave 5 implementation gate (`packages/svelte/src/components/avatar`).
- Node IDs: `reports/components/avatar/figma/ledger.json`. Parity: `reports/components/avatar/figma/parity.json` (360 records, 0 failures). Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                  | Figma                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`                                    | variant Size (xs, sm, md, lg, xl)                                                                                                                            |
| `shape`                                   | variant Shape (circle, square)                                                                                                                               |
| `initials`, initials computed from `name` | text property **Initials** (at xs the layer holds one letter and is edited directly)                                                                         |
| `src`, part `image`, state `imageStatus`  | variant Content=picture: a Picture layer (SVG portrait) that the designer replaces with an image fill; Content=initials or glyph for none, loading and error |
| part `fallbackIcon`                       | variant Content=glyph: Phosphor user at component/avatar/icon-size/{size}                                                                                    |
| `name`, `decorative`                      | Not drawn: the accessible name and decorative are behaviors of the code                                                                                      |

## Construction notes

- Initials use the text styles component/avatar/typography/{size} (bound to their variables) with the vertical trim Cap height to baseline, so that they are centered on the cap height like the code (text-box trim).
- Pictures are the SVG portraits of examples/avatar/portraits (createNodeFromSvg): the Plugin API of the MCP server cannot create images from bytes reliably; designers replace the Picture layer with an image fill.

## Justified differences

Not drawn: the loading status, the accessible name and decorative (behaviors of the code); the forced-colors edge.

## Parity method

`wave5-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes, sizes, gaps, paddings, radii and typography, returned as one FNV-1a hash per context and component of the sorted lines. `node authoring/adapters/figma/wave5-parity-report.mjs <result.json>` builds the same lines from `computed.json` and writes `parity.json`; an equal hash proves every record equal.
