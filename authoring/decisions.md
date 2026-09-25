# Decision register

Settled decisions are not reopened. Open decisions are resolved only when they block the current phase, at a review gate. Record new questions in the relevant status file.

## Identity and delivery

- Name: **ggbrick**; domain target ggbrick.design; npm scope `@ggbrick`; CSS prefix `gg-`; theme attributes `data-gg-*`.
- Three deliverables from the same sources: Figma library, Svelte 5 package on Bits UI, documentation (local Markdown shipped with the package, and a site).
- Distribution: the npm package is the tested unit. Consumers may also copy a component's source folder into their project or download the whole `packages/svelte` source; every component folder is therefore self-contained (see AGENTS.md). No compatibility with any third-party registry or CLI is pursued. Bits UI is the only runtime dependency allowed besides Svelte. shadcn-svelte may be consulted as an implementation reference, never as a dependency or a format.
- Documentation site: Astro with Starlight in `apps/docs`, reading `documentation/` and embedding live Svelte examples. Marketing site: Astro in `apps/site`.
- Phase 1 delivers the design system (foundations, components, Figma library, docs, marketing site). Phase 2 delivers the theme builder (a web form producing a brand overlay) and the Figma import (plugin and/or Claude skill). The overlay format is the sparse brand folder already defined by the token architecture.
- Versioning proposal (adopt at first Deliver): semantic versioning, one version shared by tokens, Svelte package and Figma library; 0.x while the catalog grows.
- License: not decided; ask at the first Deliver.

## Sources and tokens

- The repository owns DTCG JSON tokens and compact JSON component contracts. Figma, code and documentation derive from or conform to them.
- Token layers: primitives, semantic, and component tokens only where justified. Primitives are **generous**: full ramps and scales are defined up front so that semantic roles pick from them; unused primitives are expected (see `authoring/foundations.md`).
- Base is complete and usable alone. Brands are sparse overrides with matching file names and token paths. Every brand supports light and dark by inheritance or explicit values.
- Brand, appearance (light/dark) and density (compact/standard/comfortable) are independent axes selected on one ancestor. No viewport token axis: layout chooses composition; it does not rewrite token values.
- Precedence: base primitives, brand primitives, base common, base appearance, base density, base components, brand common, brand appearance, brand density, brand components. Aliases resolve after merging.
- Spacing families: layout, content and control. Visible dimensions are distinct from interaction targets. Minimum interaction target 44 × 44 CSS px.
- Font and icon sizes do not shrink with density; spacing and control heights do.

## Contracts and implementation

- A contract has `id`, `props`, `parts`, `states`, `tokens`, `rules` (format in `authoring/contract-format.md`). Intrinsic behavior lives in rules; platform mechanics stay in adapters. Figma and code must offer corresponding options; a Figma boolean need not become a variant.
- Token roles use parameterized paths; enum props become `data-*` selectors, enum states become custom-property suffixes in generated CSS; role types follow the naming convention.
- Svelte 5 with runes and snippets; Bits UI primitives for native semantics; CSS inheritance and `currentColor` for slot content; `prefers-reduced-motion` and `forced-colors` handled in every component with motion or borders.
- Snippet slots cannot statically enforce component identity; allowed content is a contract rule documented in usage docs.

## Documentation

- One maintained source per component in `documentation/components/<id>.md`, sections in this order: Overview, When to use, When not to use, Anatomy, Usage guidelines, Examples, API, Accessibility. `documentation/index.json` is the economical agent index.
- Introduce a component by its user-facing purpose; framework names and native mappings belong in API. Accessibility lists relevant WCAG 2.2 criteria with level, link and the component/integration split; listing is not a conformance claim.
- Figma specification sections: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples. Masters are distinguished from explanatory instances.

## Process

- Lifecycle: scope, contract, design, specifications, implementation, implementation review, documentation, delivery. Gates: foundations review (once per foundations change), then per component contract, Figma design, interactive implementation; delivery approval is separate.
- Waves group components so gates are batched (see roadmap). Modify reopens only affected gates. Audit is read-only. Figma reconciliation and foundation changes belong to Modify.
- Done means usable in Figma and code with accessible, version-aligned human and agent documentation and recorded evidence.
- Figma is operated through the Figma MCP server. Reconstruction scripts are Plugin API bodies kept in `authoring/adapters/figma`; IDs are read from the destination file, never guessed.
- The pre-ggbrick reference kit (tag `reference-kit-2026-09`) is a model of artifact structure only. ggbrick starts from zero, Button included, so that everything is unified.

## Open decisions

1. License for code and Figma library (first Deliver).
2. Icon set and its license (foundations task).
3. Figma library file organization and publishing mechanism (first Figma task).
4. Exact hosting for the docs and marketing sites (when `apps/docs` starts).
