# Component name

<!-- Template instructions are authoring guidance; remove them from the published page. -->

## Overview

One or two sentences: what the component is and what it lets the user do, with concrete examples of use. No variants, states or mechanics here: When to use, Best practices and API cover them. The page answers four questions, in this order: what is it, when to use it, when not to use it, how to use it well. Be concise without abbreviating: full sentences, no keyword lists; a reader (person or agent) should get each point once.

## Anatomy

A table of parts (#, part, required, role in one sentence) whose numbers match the callouts of the Figma blueprint board, then one line for its lettered dimensions. The site shows the blueprint captures (`reports/components/<id>/figma/blueprint-*.png`, exported from the specification page at the Figma parity phase) under the heading.

## When to use

A short list of the situations where this component is the right choice. Decisions only; how to use it goes to Best practices.

## When not to use

A short list of situations, each with the component or pattern to use instead (“A link inside a sentence: Link (planned)”). Mark planned alternatives.

## Best practices

A Markdown table with the columns Guidance, Topic, Practice: every Do row first, then every Don't row. Topic is one or two words (Label, Size, Slots); Do and Don't topics need not pair up. One sentence per practice, with the reason in a few words when it is not obvious. The site renders it as a card with a badge per row.

## Examples

Start with the usual case, then relevant variations, then a short list of difficult cases. One line of intent per example at most. The site also opens the page with a playground (`apps/docs/src/playgrounds/<id>.svelte`); examples show code, the playground the variants.

Mark a Svelte block ` ```svelte live ` when it can run on its own: the documentation site (`apps/docs`) compiles it as a component and renders it above its code, so the build checks it. A live block is a complete Svelte 5 component in valid HTML (a `<li>` inside a list, a `<td>` inside a table); without a `<script>` element the site adds `import { …every export… } from '@ggbrick/svelte'`, and `./glyphs` resolves to `examples/icon/glyphs.ts`. Define what the block calls (a stand-in `save()` or `api`), link to `#fragments` rather than application routes, and leave fragments that cannot run (a prop-less excerpt, an API signature) unmarked. Difficult cases point to anchors of the review page `examples/<id>/App.svelte`.

## API

Document exact target import, properties, types, defaults, exposed composition points, events and methods where relevant. Derive facts from the shared contract and real implementation. Do not equate anatomy with the public API.

## Accessibility

Explain guarantees, interaction behavior and integration responsibilities. Link related guidelines instead of duplicating them. List the relevant WCAG success criteria with their number, name, level, official W3C link and concrete relevance to this component. Distinguish component support, integration responsibilities and checks still pending. Keep AAA objectives separate from A/AA requirements, and do not imply that every listed criterion has passed. Do not claim accessibility conformance solely from automated checks.
