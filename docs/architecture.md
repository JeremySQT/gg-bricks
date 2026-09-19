# Architecture

## Ownership

| Source | Owns |
| --- | --- |
| Token JSON | Values, types, aliases and variation inputs |
| Component contract | Public conceptual options, parts, states, token roles and intrinsic rules |
| Approved Figma representation | Visual construction and reviewed renderings |
| Target implementation | Platform behavior and concrete public API |
| Documentation sources | Choice and usage guidance; explanations linked to authoritative facts |
| Component status | Current phase, artifact references, revision-specific approvals and evidence |

If a visual iteration changes an intrinsic rule or option, reconcile the contract before coding. Essential behavior cannot exist only in a screenshot. Shared contracts do not promise deterministic regeneration of every implementation detail.

## Token source layout

The following naming and sparse mirroring principles are agreed:

- tokens/base/primitives/colors.tokens.json
- tokens/base/primitives/dimensions.tokens.json
- tokens/base/primitives/typography.tokens.json
- tokens/base/primitives/borders.tokens.json
- tokens/base/primitives/shadows.tokens.json
- tokens/base/primitives/motion.tokens.json
- tokens/base/semantic/common.tokens.json
- tokens/base/semantic/appearance.light.tokens.json
- tokens/base/semantic/appearance.dark.tokens.json
- tokens/base/semantic/density.compact.tokens.json
- tokens/base/semantic/density.standard.tokens.json
- tokens/base/semantic/density.comfortable.tokens.json
- tokens/base/components/actions/button.tokens.json, only for justified component-specific tokens
- tokens/brand-a/... mirrors only overridden source files and token paths.

Do not create empty files merely to fill this tree. Common files contain actual mode-independent definitions, never empty semantic placeholders. Required token coverage is validated after resolution.

Pilot precedence: base primitives, brand primitives, base common, base appearance, base density, brand common, brand appearance, brand density. Resolve aliases after merging; replace a token atomically. Unsupported axis interactions need explicit design rather than accidental file ordering. Validate missing references, cycles, types and configuration coverage.

## Figma adapter

The tested Brand collection stores per-brand common values and technical appearance/light, appearance/dark and density/{mode} values. Appearance and Density semantic variables alias these technical variables. Instances inherit the three selected modes from their consumer context.

Those technical variables are generated adapter output, not another handwritten source hierarchy. Preserve existing IDs during value synchronization. Type changes, renames, removals, concurrency and structural changes are not covered by the pilot.

## Proposed remaining repository paths

- contracts/{family}/{component}.contract.json
- components/{component}/status.json
- implementations/svelte/
- docs/components/{component}.md
- docs/catalog.json
- examples/svelte/{component}/
- tools/
- templates/
- skills/{skill-name}/SKILL.md

These paths are a working proposal to keep references concrete, not a finalized package/build architecture.

## Documentation distribution

Maintain one content source with human-readable prose and stable section headings. The human site adds visual examples and runnable demos. Installed packages should expose a compact entry point, a decision catalog and per-component usage documents aligned to the installed version.

Generate API facts from both the contract and actual target API. Do not invent imports or event syntax from the platform-independent contract. Import examples should come from verified executable examples.

Consumer discovery must be explicit: provide a small integration instruction pointing the project's agent to the installed index. Do not load all component documents automatically. Figma anatomy illustrations need text equivalents in local documentation.
