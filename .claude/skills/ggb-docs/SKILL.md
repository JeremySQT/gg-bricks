---
name: ggb-docs
description: Write or update the maintained documentation page of a ggbrick component (Overview, When to use, When not to use, Anatomy, Do and don't, Examples, API, Accessibility) and its entry in the consumer index, from the approved contract and implementation. Used by ggb-component after the implementation and Figma parity gates; use directly for documentation-only changes.
---

# Documentation

Read `authoring/templates/component-documentation.md`, `authoring/decisions.md` (Documentation), the contract, `types.ts`, the example page and the status. Write only about approved behavior; an early outline is fine before the implementation gate, final content is not. Anatomy includes a text equivalent of the Figma anatomy when the parity phase is done.

1. Create `documentation/components/<id>.md` with the eight sections in order. Overview introduces the user-facing purpose; framework names, versions and native mappings belong in API. Keep the page concise (the template says how): a one- or two-sentence Overview, short When to use and When not to use lists, Anatomy as a parts table numbered like the Figma blueprint callouts, best practices as a Do and don't section grouped by topic. Examples are ` ```svelte live ` blocks wherever the code can run on its own (rules in the template; the site build compiles and renders them) and point to the review page `examples/<id>/App.svelte` for difficult cases. API documents the actual Svelte props, types, defaults, snippets, events and forwarded attributes. Accessibility lists relevant WCAG 2.2 criteria (number, name, level, W3C link, component versus integration responsibility) and the actual validation status; no blanket conformance claim.
2. Add the entry to `documentation/index.json` (`id`, `import`, `from`, `purpose`, `whenNotToUse`, `documentation`, `contract`, `sections`). Keep `documentation/AGENTS.md` accurate about what is exported.
3. `npm run build:svelte` (validates the index and copies docs into the package), then `npm run build:docs` (compiles every live block and renders the page with its generated contract and evidence section). Check links and look at the page (`npm run dev:docs`).
   Export the blueprint boards of the specification page (Anatomy diagrams) with the Figma MCP `get_screenshot` into `reports/components/<id>/figma/blueprint-*.png` and record their node IDs in the status; write the site playground `apps/docs/src/playgrounds/<id>.svelte` (the component in a `Playground` frame with the key options as corner selects).
4. Update the status (`artifacts.humanDocs`, `artifacts.agentDocs`, optional `approvals.documentation` when the user gives editorial feedback) and hand back to `ggb-component`.

Alternatives named in "When not to use" that are not yet exported are marked as planned. Never invent imports or event syntax from the platform-independent contract.
