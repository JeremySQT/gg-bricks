# Architecture

## Ownership

| Source                                                        | Owns                                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Token JSON (`foundations/tokens`)                             | Values, types, aliases and variation inputs                                  |
| Component contract (`components/<family>/<id>/contract.json`) | Public conceptual options, parts, states, token roles and intrinsic rules    |
| Approved Figma representation                                 | Visual construction and reviewed renderings                                  |
| Svelte implementation (`packages/svelte/src/<id>`)            | Platform behavior and concrete public API                                    |
| Documentation (`documentation/`)                              | Choice and usage guidance; explanations linked to authoritative facts        |
| Status files                                                  | Current phase, artifact references, revision-specific approvals and evidence |

If a visual iteration changes an intrinsic rule or option, reconcile the contract before coding. Essential behavior cannot exist only in a screenshot.

## Token pipeline

`npm run build:palette` (`tooling/generate-palette.ts`) writes the color primitives from `foundations/palette.config.json` (OKLCH ramps, deterministic). `npm run build:tokens` (`tooling/build-tokens.ts`):

1. Resolves every brand × appearance × density context (`tooling/lib/tokens.ts`): merge the ordered source files (see decisions for precedence), keep a provenance trace, resolve aliases atomically, validate types.
2. Validates every discovered contract against every context (token presence and role type).
3. Writes `packages/tokens/resolved/<context>.json`, `reports/tokens/traces/<context>.json` and `packages/tokens/tokens.css` (`tooling/lib/css.ts`): layered rules mirroring the sources (base layers under `[data-ggb-brand]`, `[data-ggb-appearance=…]`, `[data-ggb-density=…]`; sparse brand overrides under combined selectors), aliases emitted as `var()`, every token as `--ggb-<path-with-dashes>`, typography also exposing `.fontSize` and `.lineHeight`. A unit test resolves the cascade for every context and checks it against the resolved maps.
4. Writes per-component evidence in `reports/components/<id>/`: token requirements, coverage, contract validation, and contrast against every `color.surface.*` backdrop for contracts exposing `surface`/`content` (`border` and `focusColor` when present; a parameter valued `disabled` is informational).
5. Writes the Figma manifest (variables, text styles with letter spacing, effect styles from the semantic shadows) and expectations. Axis routing is derived from the source file that defines each token (appearance.* → Appearance, density.* → Density, otherwise Brand). Primitives shared by every brand go to the single-mode Primitives collection, brand-specific ones to Brand. Variable values mirror the source aliases; a technical `_resolved/*` variable is emitted only when a token cannot be one alias per mode (a brand overlay of an appearance or density file, or an alias across those two axes). `tooling/figma-batches.ts` turns the manifest into `use_figma` scripts and `tooling/check-figma.ts` compares the native resolution with the expectations.

`npm run validate` also runs `tooling/check-foundations.ts`: every role of `foundations/inventory.json` must exist with its type on its axis in every context, no semantic token may be undeclared, primitives hold no aliases, semantic colors are aliases only, and the declared contrast pairs are measured into `reports/tokens/contrast.json`.

## Svelte adapter generation

`npm run build:svelte` (`tooling/build-svelte.ts`), for each contract that has a `packages/svelte/src/<id>/` folder:

- `contract.generated.ts`: one TypeScript union per enum prop (`<Id><Prop>`) and a `defaults` object.
- `tokens.generated.css`: enum **props** become `[data-<prop>="<value>"]` selectors on `.ggb-<id>`; enum **states** become suffixes of `--ggb-<id>-<role>`. Handwritten CSS selects the state (`:hover`, `[data-loading]`…) and applies conditional rules (for example a border only for the outline appearance).
- Copies `packages/tokens/tokens.css`, the contracts and `documentation/` into the package (ignored by git) and checks `documentation/index.json` against the discovered contracts and implementations.

## Component folder rule

A consumer must be able to copy `packages/svelte/src/<id>/` into a Svelte 5 project that has Bits UI and `tokens.css`, plus the internal dependencies declared in the component status, and use it. Therefore: no shared runtime helpers outside a component folder unless a decision creates a documented `src/lib/` module that is itself copyable; styles are plain CSS files imported by the component; no build-time preprocessors.

## Documentation distribution

One maintained source per component with stable section headings. Installed packages expose `docs/index.json`, `docs/AGENTS.md` and per-component pages aligned to the installed version. The documentation site (`apps/docs`, docs.ggbrick.design) renders the same Markdown and adds live examples. API facts come from the contract and the actual Svelte API; import examples come from verified executable examples in `examples/<id>/`.

## Evidence

`reports/` holds revision-bound evidence: generated JSON (committed for reviewable diffs), test results, screenshots and Figma ledgers. Status files reference evidence by path and, for approvals, by digest or commit.
