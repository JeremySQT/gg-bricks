# Architecture

## Ownership

| Source                                                                    | Owns                                                                         |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Token JSON (`foundations/tokens`)                                         | Values, types, aliases and variation inputs                                  |
| Component contract (`foundations/components/<family>/<id>/contract.json`) | Public conceptual options, parts, states, token roles and intrinsic rules    |
| Approved Figma representation                                             | Visual construction and reviewed renderings                                  |
| Svelte implementation (`packages/svelte/src/components/<id>`)             | Platform behavior and concrete public API                                    |
| Documentation (`documentation/`)                                          | Choice and usage guidance; explanations linked to authoritative facts        |
| Status files                                                              | Current phase, artifact references, revision-specific approvals and evidence |

If a visual iteration changes an intrinsic rule or option, reconcile the contract before coding. Essential behavior cannot exist only in a screenshot.

## Token pipeline

`npm run build:palette` (`tooling/generate-palette.ts`) writes the color primitives from `foundations/tokens/palette.config.json` (OKLCH ramps, deterministic). `npm run build:tokens` (`tooling/build-tokens.ts`):

1. Resolves every brand × appearance × density context (`tooling/lib/tokens.ts`): merge the ordered source files (see decisions for precedence), keep a provenance trace, resolve aliases atomically, validate types.
2. Validates every discovered contract against every context (token presence and role type).
3. Writes `packages/tokens/resolved/<context>.json`, `reports/tokens/traces/<context>.json` and `packages/tokens/tokens.css` (`tooling/lib/css.ts`): layered rules mirroring the sources (base layers and the config defaults under `:root, [data-ggb-brand]`, `[data-ggb-appearance=…]`, `[data-ggb-density=…]`; sparse brand overrides under combined selectors), aliases emitted as `var()`, every token as `--ggb-<path-with-dashes>`, typography also exposing `.fontSize` and `.lineHeight`. A unit test models the browser cascade (specificity and order per element, `var()` substituted where declared, computed values inherited) and checks every context, the defaults and the subtree overrides against the resolved maps.
4. Writes per-component evidence in `reports/components/<id>/`: token requirements, coverage, contract validation, and contrast for contracts exposing `surface`/`content` (`border` and `focusColor` when present) on every `color.surface.*` backdrop, or only on the backdrops listed in the status `contrastScope.backdrops` when the component declares them at its contract gate. A parameter valued `disabled` and the pairs listed in `contrastScope.informational` (role, backdrop, optional appearance, reason) are informational: reported without a minimum.
5. Writes the Figma manifest (variables, text styles with letter spacing, effect styles from the semantic shadows) and expectations. Axis routing is derived from the source file that defines each token (appearance.* → Appearance, density.* → Density, otherwise Brand). Primitives shared by every brand go to the single-mode Primitives collection, brand-specific ones to Brand. Variable values mirror the source aliases; a technical `_resolved/*` variable is emitted only when a token cannot be one alias per mode (a brand overlay of an appearance or density file, or an alias across those two axes). `tooling/figma-batches.ts` turns the manifest into `use_figma` scripts and `tooling/check-figma.ts` compares the native resolution with the expectations.

`npm run validate` also runs `tooling/check-foundations.ts`: every role of `foundations/tokens/inventory.json` must exist with its type on its axis in every context, no semantic token may be undeclared, primitives hold no aliases, semantic colors are aliases only, the declared `invariants` (a derived dimension role equals the sum of other roles) hold, and the declared contrast pairs are measured into `reports/tokens/contrast.json`.

## Svelte adapter generation

`npm run build:svelte` (`tooling/build-svelte.ts`), for each contract that has a `packages/svelte/src/components/<id>/` folder:

- `contract.generated.ts`: one TypeScript union per enum prop (`<Id><Prop>`) and a `defaults` object.
- `tokens.generated.css`: enum **props** become `[data-<prop>="<value>"]` selectors on `.ggb-<id>`; enum **states** become suffixes of `--ggb-<id>-<role>`. Handwritten CSS selects the state (`:hover`, `[data-loading]`…) and applies conditional rules (for example a border only for the outline appearance).
- Copies `packages/tokens/tokens.css`, the contracts and `documentation/` into the package (ignored by git) and checks `documentation/index.json` against the discovered contracts and implementations.

## Component folder rule

A consumer must be able to copy `packages/svelte/src/components/<id>/` into a Svelte 5 project that has Bits UI and `tokens.css`, plus the internal dependencies and the `packages/svelte/src/lib/` modules declared in the component status, and use it. Component stylesheets live in the cascade layer `ggb` (decisions.md). Therefore: no shared runtime helpers outside a component folder unless a decision creates a documented `src/lib/` module that is itself copyable; styles are plain CSS files imported by the component; no build-time preprocessors.

## Documentation distribution

One maintained source per component with stable section headings, and one guide per foundations family in `documentation/foundations/`. Installed packages expose `docs/index.json`, `docs/AGENTS.md`, per-component pages and `docs/foundations/*.md` aligned to the installed version; `npm run build:svelte` fails when a foundations guide names a token path that does not exist. API facts come from the contract and the actual Svelte API.

The documentation site (`apps/docs`, Astro + Starlight, docs.ggbrick.design) renders the same Markdown. When Astro loads its config, `apps/docs/lib/content.ts` writes one MDX page per entry of `documentation/index.json` into `src/content/docs/components/` (ignored by git; `astro dev` regenerates on change): the title becomes frontmatter, every ` ```svelte live ` block is written as a Svelte component in `src/generated/live/<id>/` and rendered as an island above its code (a block without a script gets the `@ggbrick/svelte` imports; `./glyphs` re-exports `examples/icon/glyphs.ts`), the page opens with the playground `apps/docs/src/playgrounds/<id>.svelte` when it exists (the component in a `PlaygroundFrame` card, key options as corner selects), the Figma blueprint boards (`reports/components/<id>/figma/blueprint-*.png`) are placed under Anatomy, and tables with a Guidance column (Best practices) are rendered as a card with a badge per row. Contracts, approvals and evidence are not shown on the page. The site build therefore compiles every live example. Getting started pages are maintained in `apps/docs/src/content/docs/getting-started/`. Foundations pages are generated the same way from `documentation/foundations/*.md` (the `foundations` entries of `documentation/index.json`): each `<!-- site:kind options -->` marker becomes a block (`tokens`, `ramps`, `actions`, `contrast`, `primitive-ramps`); a `tokens` marker right after a role table replaces it with the same columns plus a live preview and the value and alias of every context, revealing those of the reader's context (data from `packages/tokens/resolved/*` and `reports/tokens/traces/*`). Markers are HTML comments, invisible to agents reading the Markdown. Starlight is dressed in ggbrick tokens (`src/styles/ggbrick.css`); the header sets `data-ggb-brand`, `data-ggb-density` and mirrors Starlight's light/dark into `data-ggb-appearance` on `<html>`. `tests/browser/docs-site.spec.ts` checks every page (console errors, axe in light and dark), the hydration of every live block and the context selects.

## Evidence

`reports/` holds revision-bound evidence: generated JSON (committed for reviewable diffs), test results, screenshots and Figma ledgers. Status files reference evidence by path and, for approvals, by digest or commit.
