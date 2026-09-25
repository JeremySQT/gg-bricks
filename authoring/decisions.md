# Decision register

## Agreed

- Target ordinary business applications and SaaS, desktop and mobile. Basic marketing interfaces may reuse these foundations; bespoke art direction is outside the initial goal.
- The repo owns DTCG JSON tokens and compact JSON component contracts. Figma, target code and documentation derive from or conform to those sources.
- Tokens use primitive, semantic and, where justified, component layers. A theme assigns values to semantic roles; it is not an extra mandatory semantic hierarchy.
- Base is complete and usable alone. Brands are sparse overrides with matching filenames and token paths; no brand must invent a fixed count of primitive colors or spacing values.
- Every brand supports light and dark through inheritance or explicit values.
- Brand, appearance and density are independently selectable. Density values may differ by brand. Viewport adaptation is distinct from density.
- Three Figma collections, Brand / Appearance / Density, worked in the scalar-token pilot. Do not infer a tested viewport mapping or unlimited brand scalability.
- Spacing families are layout, content and control. Distinguish visible dimensions from interaction targets.
- Compact contracts use props, parts, states, tokens and rules. Keep essential intrinsic behavior in rules; platform adaptation belongs with each implementation.
- Figma and code must offer corresponding options. A Figma boolean property need not become a variant.
- Svelte is the intended first implementation target. Target-specific APIs must not enter the shared contract.
- Sources and rules use English. Reproducible transforms use Node scripts.
- Human documentation and local agent documentation share maintained content. An economical catalog leads agents to individual component sections.
- Documentation order: Overview, When to use, When not to use, Anatomy, Usage guidelines, Examples, API, Accessibility.
- Figma sections: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples. Master components are distinguished from explanatory instances.
- Lifecycle: scope, contract, design, specifications, implementation, implementation review, documentation and delivery. Creation gates: contract, design, interactive implementation. Delivery approval is separate.
- Done means usable in Figma and code with accessible, version-aligned human and agent documentation.
- Authoring skills live with the DS. Consumer instructions accompany the installed package.
- Define individual contracts as components are addressed; settle the shared catalog and conventions before expanding heavily.

## Recorded component direction, not final contracts

Button: accent / neutral / danger intentions; defaults accent, solid, md, content width. One-line label, ellipsis when constrained, full accessible name preserved. Leading icon; trailing icon, counter or shortcut. Loading uses an indicator without replacing the public label or changing geometry. Full states, token mappings and target API still need a complete contract review.

TextInput: distinguish disabled from readonly. Field owns surrounding label, help and validation presentation; a composed TextField can expose the common use case. Leading/trailing content and an integrated trailing action require explicit composition rules. Placeholder is absent by default. Validation is separate from interaction state. These are design directions, not a delivered implementation.

## Open decisions

1. Final component catalog, dependency graph and v1 scope.
2. Full semantic token inventory, names and values; viewport mapping; composite typography and motion exports.
3. Review the [Button contract and schema candidate](../components/actions/button/figma-review.md); representations of future types/events remain open. The candidate has automated structural checks, not user approval.
4. Svelte version, headless dependency strategy, package structure and target-specific conventions.
5. Testing tools and measurable accessibility / visual acceptance criteria.
6. Figma naming and page layout details, publishing mechanism, stable identity storage and migration policy.
7. Documentation engine, hosting, local package layout, version routing and discovery integration.
8. Definition of release units and versioning policy.
9. Exact approval/status schema and how Figma revisions are captured.

Resolve only decisions that block the current phase. Do not silently mark proposals as accepted.

## Consolidation after the initial contract candidate

These entries supersede earlier open items in this document where they overlap.

- The compact contract notation, slot notation and parameterized token paths were accepted in the conversation.
- Button appearances are solid / outline / ghost. There is no link appearance. A Button may navigate; visual treatment does not determine native behavior.
- V1 has no desktop/mobile token axis, no viewport-driven density and no layout rewriting of token values.
- Focus bindings are color.focus.ring, focus.width and focus.offset.
- Button sizes and density spacing use the agreed table documented in docs/button-contract-review.md and the JSON sources. Font and icon sizes do not shrink with density. The target minimum is 44 in both dimensions.
- This batch was authorized as a whole: consolidate sources, complete Button tokens, run checks and prepare the Figma design review. Reversible palette and typography choices are review candidates, not user-approved final visuals.
- Base uses blue, slate neutrals, red and Inter. Brand A overrides radius only; Brand B overrides radius and accent colors. Both inherit all remaining values. No brand must author a fixed number of distinct primitive values.
- Figma review is complete enough to assess design; the component is not Done until code and version-aligned documentation are usable.

## Button slot foreground correction — 2026-09-24

- Leading/trailing foreground uses the resolved Button content color, as recorded in the component rule.
- The user authorized fixture restructuring after the initial direct-override approach failed repeated swaps.
- The Figma reference uses compatible local fixtures and generated inherited color-context aliases. This is an adapter decision, not a new source-token family or public theme axis. See adapters/figma/README.md for reconstruction, scope and evidence.

## Svelte reference implementation — 2026-09-24

- The user authorized completing the Svelte implementation and selected Bits UI primitives. The reference pins Svelte 5.57.1 and Bits UI 2.19.3; native Button/anchor behavior uses Bits UI Button.Root.
- Figma implementation details must not become shared tokens, shared contract fields or mandatory code structures. Agents follow the contract and anatomy; they must justify any target-specific layers independently.
- The Button uses CSS color inheritance and currentColor for compatible slot content. No Figma context collections or aliases are exported to code.
- The first Svelte adapter uses named snippets for leading/trailing. Their contents must obey the contract, but Svelte does not statically enforce the permitted component identities. This limitation is explicit; a stricter slot API remains a review decision, not a fabricated guarantee.
- During loading, an available control retains its focus and geometry while activation is guarded. Disabled uses native unavailable behavior and wins color precedence.
- The implementation ships as a local installable package with Markdown documentation and a small agent catalog. Hosting, public publishing, final dependency contracts and full DS delivery are still separate work.

## Documentation editorial review — 2026-09-24

- Introduce the component through its user-facing purpose. Framework names, versions and native HTML mappings belong in the API, not the overview.
- Start use guidance broadly and list representative use cases and alternatives.
- Accessibility documentation identifies relevant WCAG 2.2 criteria, levels and official links, with component versus application responsibilities and honest validation status. Listed criteria are not a blanket compliance claim.

## Workflow and reference-kit consolidation — 2026-09-25

- The goal is a reusable authoring pattern with Button as the worked example, not immediate implementation of the whole design system.
- Four procedures: Create, Modify, Audit and Deliver. Foundation changes and Figma reconciliation are included in Modify; incompatible evolution is its migration branch. No separate interruption-recovery process is needed.
- Technical checks precede a human interactive implementation review. Review behavior, focus, animation, micro-interactions and feel before finalizing documentation. Reconcile any resulting source/specification changes and rerun affected checks.
- Modify reopens only affected gates. Preserve approvals for unchanged scope. Group consequential questions rather than asking for each routine step.
- The user validated the revised Button documentation. The earlier implementation feedback accepted continuing with the reference while noting typography softness and subtle neutral hover; it is not an exhaustive accessibility/release approval.
- The reference repository layout is recorded separately with current-to-target paths; no migration is performed in this consolidation.
- The component catalog is a planning proposal, not approved scope or available exports. Draft individual contracts when each component is addressed.

Current outstanding decisions supersede stale items above: final catalog/v1 scope; broader semantic inventory and composite exports; final parent-package layout; Figma property exposure and publication; support matrix and remaining manual checks; docs hosting; release destinations/version policy; optional stricter Svelte slot API. Svelte/Bits UI choice, Button documentation structure and absence of a viewport axis are settled.

## Repository structure adopted — 2026-09-25

The kit was migrated in one explicit move into the design-system root described in [repository-reference.md](repository-reference.md); the migration preserved history, contracts, tokens and evidence.

- Authoritative sources: `foundations/tokens` (DTCG) and `components/<family>/<id>/contract.json`. Status and component-level review notes live next to the contract.
- Consumer documentation is maintained once in `documentation/` and copied into the package at build time. Authoring material lives in `authoring/`.
- Generated outputs are committed (`packages/tokens`, `packages/svelte/src/*/*.generated.*`, `reports/components/*/…json`) so that source changes are reviewable through their generated diffs; `npm run verify:generated` detects drift. Pure duplicates inside the Svelte package (`docs/`, `contracts/`, `tokens.css`) are ignored by git.
- Tooling is generic: every script iterates over the discovered contracts. Convention: enum props become `data-*` selectors, enum states become custom-property suffixes; roles `surface`/`content`/`border`/`*Color` are colors, `typography*` typography, other roles dimensions. Contrast evidence is computed for any contract exposing `surface` and `content`.
- Token precedence gains an optional component layer: `foundations/tokens/<brand>/components/*.tokens.json` after the brand semantic files.
- The review app is `examples/`, one page per component; `npm run build:preview <id>` produces the self-contained review page.
- Package names `@ds/tokens` and `@ds/svelte` are placeholders until the design system is named.

## Proposals awaiting user decision — 2026-09-25

1. **Name and scope of the design system** (package scope, Figma library name, repository description). Placeholders are used meanwhile.
2. **Distribution model.** Recommendation: the npm package (`@ds/svelte`) is the tested unit and the source of truth for Figma/code version alignment; a shadcn-svelte compatible registry is generated from the same sources after wave 2 so consumers can also copy components into their project. Copy-paste alone would break version alignment, which the definition of Done requires.
3. **Documentation site.** Recommendation: Astro with Starlight in `apps/docs`, reading `documentation/` as its content collection and embedding live Svelte examples. Marketing site in `apps/site` with plain Astro. Both later than wave 1.
4. **Theme builder and Figma import.** The customization file is a sparse brand overlay plus a config entry (already the brand format). The builder writes it; the Figma plugin or Claude skill applies it through the existing manifest and sync scripts.
5. **Figma operating mode.** The Figma brick needs a tool that can read and write the file (Figma MCP server with code execution, or a user running the plugin scripts). Which one is available determines how the design gate is prepared.
6. **Component waves** as listed in [roadmap.md](roadmap.md).
7. **License** for the code and the Figma library.
8. **Versioning policy.** Proposal: semantic versioning, one version for tokens, Svelte package and Figma library together; pre-1.0 while the catalog grows.
