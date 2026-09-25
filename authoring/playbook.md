# Phase execution playbook

Read only the section for the current phase. The skills reference these sections.

## Scope

State purpose, alternatives, supported use cases and exclusions in the component status (`scope` block). Separate reusable dependencies (other ggbrick components) from explanatory fixtures. Check `component-catalog.md` for scope notes and `documentation/index.json` for available exports. Group the decisions that materially affect API or behavior; do not ask about routine choices covered by decisions.md.

## Contract and tokens

Follow `contract-guide.md` and `contract-format.md`. Inspect the actual semantic inventory (`packages/tokens/resolved/base-light-standard.json`) before introducing roles; reuse existing roles. Propose missing tokens as source changes in `foundations/tokens` with coverage in every context. Keep props, parts, states, tokens and rules compact and platform independent. Required behavior must not be deferred entirely to prose.

Commands: `npm run new:component -- <family> <id>`, edit the contract, `npm run validate`, `npm run build:tokens` (updates evidence in `reports/components/<id>/`).

## Figma design and specifications

Follow `figma.md`. Complete `components/<family>/<id>/figma-spec.md` from `templates/figma-specification.md` after the design review. Store file key, node IDs and review evidence in the status; never manufacture an immutable revision.

## Svelte implementation

Follow the `gg-svelte` skill. Conventions:

- Folder `packages/svelte/src/<id>/` with `<Name>.svelte`, `types.ts`, `<id>.css`, generated `contract.generated.ts` and `tokens.generated.css` (`npm run build:svelte`). Export from `src/index.ts`.
- Root class `gg-<id>`, parts `gg-<id>__<part>`, enum props as `data-<prop>` attributes, boolean states as `data-<state>` presence.
- Use the Bits UI primitive that owns the native semantics; verify its actual API in `node_modules/bits-ui` before relying on it. Add ggbrick's anatomy, guards and styles on top; do not re-implement what the primitive provides.
- Slot content inherits `color`; icons use `currentColor`. Handle `prefers-reduced-motion` and `forced-colors`. Respect `size.target.min` without forcing the visible surface to grow.
- Add `examples/<id>/` (index.html, main.ts, App.svelte) with brand/appearance/density selectors, every option, states, difficult cases (long content, empty slots, constrained width, async states) and instrumented controls for tests. Add the page to `examples/index.html`.
- Add `tests/ssr/<id>.test.mjs` (server rendering, invalid input rejection) and `tests/browser/<id>.spec.ts` (keyboard, focus, states, computed styles against `packages/tokens/resolved/*.json` for a representative set of contexts, reduced motion, forced colors, axe scan, screenshots into `reports/components/<id>/svelte/`).
- Run `npm run verify` and `npm run test:browser`; then `npm run build:preview <id>`.

## Implementation review

Give the user: the preview page, the exact revision, an exercise list (mouse, touch, keyboard, focus, transitions, difficult cases) and the test/limitation summary. Wait for approval. Apply feedback, reconcile sources if a contract fact changed, rerun affected checks.

## Documentation

Follow the `gg-docs` skill and `templates/component-documentation.md`. One page in `documentation/components/<id>.md`; entry in `documentation/index.json`; `npm run build:svelte` validates the index. Import examples must come from `examples/<id>/`. Accessibility lists relevant WCAG 2.2 criteria with number, name, level, link and the component/integration split, plus the actual validation status.

## Final consistency

Check links, API facts, source/output parity, `npm run verify:generated`, availability of every artifact the status references. Update the status (phase, approvals with digests, checks, open decisions, next action) and the roadmap state. Hand off to Deliver only when distribution is requested.
