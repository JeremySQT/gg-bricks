---
name: ggb-svelte
description: Implement a ggbrick component in Svelte 5 on Bits UI from its approved contract and Figma design - component folder, generated bindings, review example page, SSR and browser tests, self-contained preview - and prepare the interactive implementation review. Used by ggb-component; use directly for implementation-only fixes.
---

# Svelte implementation

Read `authoring/playbook.md` (Svelte implementation, Implementation review), `authoring/architecture.md` (Svelte adapter generation, Component folder rule), the contract, `figma-spec.md` and the status. Verify the Bits UI primitive's real API in `node_modules/bits-ui` (and https://www.bits-ui.com/docs when reachable) before relying on it. shadcn-svelte may be consulted for implementation ideas; nothing is copied from it and no dependency on it exists.

## Steps

1. Create `packages/svelte/src/<id>/`: `<Name>.svelte`, `types.ts`, `<id>.css`. Run `npm run build:svelte` to obtain `contract.generated.ts` and `tokens.generated.css`; import both from the component. Export from `src/index.ts`.
2. Implement per contract rule: anatomy order, sizing rule, activation guards, state precedence, accessible name, loading/disabled behavior, slot restrictions (document what snippets cannot enforce). Root class `ggb-<id>`, parts `ggb-<id>__<part>`, enum props as `data-<prop>`, boolean states as `data-<state>`. Only `tokens.generated.css` custom properties feed colors and dimensions; no literal values in `<id>.css` except structural ones (0, 100%, transparent).
3. Handle `prefers-reduced-motion`, `forced-colors`, keyboard and focus with the native primitive; keep `size.target.min` without growing the visible surface.
4. Create `examples/<id>/index.html`, `main.ts`, `App.svelte` (copy the structure of an existing example when one exists): brand/appearance/density selectors, every option and state, difficult cases, instrumented controls with stable ids and `data-testid`s. Add the page to `examples/index.html`.
5. Write `tests/ssr/<id>.test.mjs` (with `tests/ssr/helpers.mjs`) and `tests/browser/<id>.spec.ts`: behavior, keyboard, focus, states, computed styles versus `packages/tokens/resolved/*.json` on a representative set of contexts, reduced motion, forced colors, axe scan on light and dark, screenshots into `reports/components/<id>/svelte/`.
6. `npm run verify`, `npm run test:browser` (set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when a local Chromium exists), `npm run build:preview <id>`. Write `reports/components/<id>/svelte/implementation.md` (versions, checks, limits).
7. Update the status (`artifacts.svelte`, checks) and hand back to `ggb-component` for the implementation gate with the preview, exercise list and limitations.

## Rules

- The component folder must be copyable on its own (plus `tokens.css`, Bits UI and declared internal dependencies).
- A contract fact discovered wrong during implementation goes back to the source first (contract or tokens), with the gate reassessed.
- Existing tests of other components never count as coverage for this one.
