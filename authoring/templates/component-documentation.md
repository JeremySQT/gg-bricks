# Component name

<!-- Template instructions are authoring guidance; remove them from the published page. -->

## Overview

Write a short human-readable introduction: purpose, principal forms and capabilities. Several informative sentences, not only an API summary. Start with what the component lets the user do. Keep framework names, versions, HTML mappings and adapter mechanics in API or implementation references.

## When to use

Start with the general purpose, then list representative situations where this component is a suitable choice. Do not lead with a narrow example or implementation detail.

## When not to use

List unsuitable situations and name/link the appropriate component or pattern. Distinguish planned alternatives from currently available exports.

## Anatomy

Include an annotated visual and a textual list/table of parts. Explain role, optionality and allowed slot contents. Derive factual parts and constraints from the contract. Distinguish slots from inserted content and internal parts from public API.

## Usage guidelines

Explain labeling, emphasis, composition and relevant behavior before showing code. Use Do / Don't comparisons when they clarify a decision; do not force every recommendation into that format. Include accessibility guidance here when it affects usage choices.

## Examples

Start with the usual case, then relevant variations and edge cases. Explain the intent and reference verified executable source. The human site may embed demos; local agent docs need useful text and code without a browser.

Mark a Svelte block ` ```svelte live ` when it can run on its own: the documentation site (`apps/docs`) compiles it as a component and renders it above its code, so the build checks it. A live block is a complete Svelte 5 component in valid HTML (a `<li>` inside a list, a `<td>` inside a table); without a `<script>` element the site adds `import { …every export… } from '@ggbrick/svelte'`, and `./glyphs` resolves to `examples/icon/glyphs.ts`. Define what the block calls (a stand-in `save()` or `api`), link to `#fragments` rather than application routes, and leave fragments that cannot run (a prop-less excerpt, an API signature) unmarked. Difficult cases point to anchors of the review page `examples/<id>/App.svelte`.

## API

Document exact target import, properties, types, defaults, exposed composition points, events and methods where relevant. Derive facts from the shared contract and real implementation. Do not equate anatomy with the public API.

## Accessibility

Explain guarantees, interaction behavior and integration responsibilities. Link related guidelines instead of duplicating them. List the relevant WCAG success criteria with their number, name, level, official W3C link and concrete relevance to this component. Distinguish component support, integration responsibilities and checks still pending. Keep AAA objectives separate from A/AA requirements, and do not imply that every listed criterion has passed. Do not claim accessibility conformance solely from automated checks.
