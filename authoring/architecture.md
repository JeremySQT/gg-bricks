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

The following naming and sparse mirroring principles are agreed (paths under foundations/tokens/):

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

Precedence: base primitives, brand primitives, base common, base appearance, base density, base components, brand common, brand appearance, brand density, brand components. Resolve aliases after merging; replace a token atomically. Unsupported axis interactions need explicit design rather than accidental file ordering. Validate missing references, cycles, types and configuration coverage.

## Figma adapter

The tested Brand collection stores per-brand common values and technical appearance/light, appearance/dark and density/{mode} values. Appearance and Density semantic variables alias these technical variables. Instances inherit the three selected modes from their consumer context.

Those technical variables are generated adapter output, not another handwritten source hierarchy. Preserve existing IDs during value synchronization. Type changes, renames, removals, concurrency and structural changes are not covered by the pilot.

## Repository integration

See [the repository layout](repository-reference.md). The design-system root is the repository root. Svelte sources live in packages/svelte/src/<id>/ and maintained usage content in documentation/.

## Documentation distribution

Maintain one content source with human-readable prose and stable section headings. The human site adds visual examples and runnable demos. Installed packages should expose a compact entry point, a decision catalog and per-component usage documents aligned to the installed version.

Generate API facts from both the contract and actual target API. Do not invent imports or event syntax from the platform-independent contract. Import examples should come from verified executable examples.

Consumer discovery must be explicit: provide a small integration instruction pointing the project's agent to the installed index. Do not load all component documents automatically. Figma anatomy illustrations need text equivalents in local documentation.

## Button reference batch

The token subset required by Button now exists in tokens/. Empty shadow or motion files are deliberately absent. This is not the full semantic catalog for all future components.

Run `npm run generate` to regenerate resolved tokens, CSS, provenance traces, the Figma adapter manifest and the Svelte bindings of every contract. Source aliases resolve after sparse overlays. The adapter compiles scalar theme routing into Brand, Appearance and Density from the source file that defines each token; generated technical variables are not a new source layer.

## Generic tooling conventions

- `tooling/lib/catalog.mjs` discovers `components/<family>/<id>/contract.json`; the contract id must equal the folder name.
- `tooling/build-tokens.mjs` validates every contract in every context, writes `packages/tokens/*`, `reports/tokens/traces/*` and per-component `reports/components/<id>/{token-requirements,token-coverage,contract-validation,contrast}.json`. Contrast is computed against every `color.surface.*` token for contracts exposing `surface` and `content` (and `border`, `focusColor` when present); a parameter valued `disabled` is informational.
- `tooling/build-svelte.mjs` writes `contract.generated.ts` (enum types, defaults) and `tokens.generated.css` for each contract that has a `packages/svelte/src/<id>/` folder. Enum props become `[data-<prop>]` selectors on `.ds-<id>`; enum states become suffixes of `--<id>-<role>`; handwritten CSS selects the state and applies conditional rules (for example a border only for outline).
- Role types follow the naming convention in contract-format.md; the validator rejects a token whose `$type` does not match its role.

No desktop/mobile variable collection is present. Application layout chooses composition and may select an explicit density, but does not mutate the definitions.
