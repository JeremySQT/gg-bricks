---
name: ggb-svelte
description: Implement a ggbrick component in Svelte 5 on Bits UI from its approved contract - component folder, generated bindings, review example page, SSR and browser tests, self-contained preview - and prepare the interactive implementation review. Used by ggb-component; use directly for implementation-only fixes.
---

# Svelte implementation

Read `authoring/architecture.md` (Svelte adapter generation, Component folder rule), the contract, the status and, when they exist, the most recently completed component's folder, example and tests as the model. Verify the Bits UI primitive's real API in `node_modules/bits-ui` (and https://www.bits-ui.com/docs when reachable) before relying on it. shadcn-svelte may be consulted for ideas; nothing is copied from it and no dependency on it exists.

## Conventions

- Folder `packages/svelte/src/components/<id>/`: `<Name>.svelte`, `types.ts`, `<id>.css`, generated `contract.generated.ts` and `tokens.generated.css` (`npm run build:svelte`); export from `src/index.ts`. The folder must be copyable on its own (plus `tokens.css`, Bits UI and declared internal dependencies).
- Root class `ggb-<id>`, parts `ggb-<id>__<part>`, enum props as `data-<prop>` attributes, boolean states as `data-<state>` presence. Bindable props use `$bindable()`; contract events map to `on<Event>` callback props.
- Colors and dimensions come only from `tokens.generated.css` custom properties; `<id>.css` holds structural literals only (0, 100%, transparent, currentColor). Both files are wrapped in `@layer ggb` (the generator does it for `tokens.generated.css`; write `@layer ggb { … }` around the handwritten rules, the file comment staying outside).
- Use logical properties (`inline-size`, `padding-inline`, `margin-block`, `inset-inline-start`) so the component works in RTL without changes.
- Use the Bits UI primitive that owns the native semantics; add ggbrick's anatomy, guards and styles on top; do not re-implement what the primitive provides.
- Slot content inherits `color`; icons use `currentColor`. Handle `prefers-reduced-motion` and `forced-colors`. Respect `size.target.min` without growing the visible surface.
- Implement every contract rule literally (order, sizing, activation guards, state precedence, accessible name); document what snippets cannot enforce.

## Steps

1. Create the folder, run `npm run build:svelte`, implement, export.
2. Create `examples/<id>/` (`index.html`, `main.ts`, `App.svelte`): brand/appearance/density selectors, every option and state, difficult cases (long content, empty slots, constrained width, async states), instrumented controls with stable ids and `data-testid`s. Add the page to `examples/index.html`.
3. Write `tests/ssr/<id>.test.ts` (with `tests/ssr/helpers.ts`: server rendering, invalid input rejection) and `tests/browser/<id>.spec.ts` (behavior, keyboard, focus, states, computed styles versus `packages/tokens/resolved/*.json` on a representative set of contexts, reduced motion, forced colors, axe scan on light and dark, screenshots into `reports/components/<id>/svelte/` through `capture` of `tests/browser/helpers.ts`). Write `reports/components/<id>/svelte/computed.json` from the browser test (`ComputedReport` or `writeEvidence`, never `fs.writeFileSync`: evidence is written only with `GGB_EVIDENCE=1`), used later by the Figma parity check: `{ "records": [ { context: "base-light-standard", props: { … }, state: "hover", part: "surface", property: "background-color", value: "rgb(…)" } ] }`, covering every option and state on a representative set of contexts.
4. `npm run lint`, `npm run verify`, `npm run test:browser` (set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when a local Chromium exists), `npm run build:preview <id>`. These runs check without writing anything and must leave the tree clean. Then record the evidence once, on explicit request: `GGB_EVIDENCE=1 npm run test:ssr` and `GGB_EVIDENCE=1 npm run test:browser -- tests/browser/<id>.spec.ts` (screenshots, `computed.json`, `ssr.json`, `reports/browser-results.json`); commit this component's evidence and `git checkout --` any other file the run rewrote. Write `reports/components/<id>/svelte/implementation.md` (versions, checks, limits).
5. Update the status (`artifacts.svelte`, `artifacts.examples`, `artifacts.tests`, checks) and hand back to `ggb-component` for the implementation gate with the preview, the exercise list and the limitations.

A contract fact discovered wrong during implementation goes back to the source first (contract or tokens), with that fact re-presented at the gate. Existing tests of other components never count as coverage for this one.
