# Figma operating mode

Figma is the validated visual representation of ggbrick. It is operated through the **Figma MCP server** connected to the session. Inspect the tools it exposes at session start (reading design context and screenshots, and executing Plugin API code in the file) and follow the server's own instructions or skill; nothing here replaces them.

## Model

- One ggbrick library file. Pages: Cover, Getting started, Foundations, one page per component named by its repository path (`actions/button`) holding the master, its internal parts (`_<Name>/…`) and its specification frame, and Utilities (review fixtures `_Fixture/*` and documentation tooling `_Spec/*`, all prefixed `_`). Family pages were replaced by component pages on 2026-10-13.
- Variables: collections Primitives (single mode `default`), Brand, Appearance and Density, the last three with exactly the modes of `foundations/tokens/config.json`; each collection's default mode is the config default (base, light, standard), set by the sync script through `setDefaultMode`, so a node without explicit modes resolves like a document without `data-ggb-*` attributes. Primitives shared by every brand live in Primitives; a primitive a brand overrides is emitted in Brand with one value per brand; component tokens go to Brand under `component/<id>/…` (a separate collection would duplicate the brand modes). The generated `packages/tokens/figma-manifest.json` is the source of variable names, types, scopes, WEB code syntax and values; values mirror the source aliases (an Appearance role aliases the Brand palette variable it references), so the chain reads in Figma as in the token files; opacity tokens are the one conversion: Figma reads a number bound to layer opacity as a percentage, so `opacity.*` and `primitive.opacity.*` are emitted ×100 (0.7 → 70). `figma-expectations.json` holds the expected resolved values per brand and mode pair. Typography roles become text styles; shadows become effect styles. `npm run figma:batches` writes the ready-to-run scripts (`dist/figma/variables-<n>.js`, `styles.js`, `verify.js`) from the adapter bodies in `authoring/adapters/figma/`; run them in order through `use_figma`, then `npm run figma:check -- <result.json>` writes `reports/tokens/figma/verification.json`. The library file key and the collection, mode and variable IDs are recorded in `reports/tokens/figma/ledger.json`.
- Component masters are built per contract: enum props become variant properties or booleans by meaning (do not multiply variants for optional children), parts become named layers, slot parts become instance-swap properties limited to compatible fixtures, tokens become variable bindings. Explanatory instances live in specification frames, not inside the master set.
- Record every node ID the design system owns in `reports/components/<id>/figma/ledger.json` (masters, variant sets, fixtures, specification frames) and the file key in the component status. Never guess an ID; read it from the file.

## Procedure for a component (ggb-component, parity phase)

1. Read the contract, the approved implementation, its computed-value report (`reports/components/<id>/svelte/computed.json`) and `authoring/templates/figma-specification.md`.
2. Inspect the destination: existing pages, variables, masters and the ledger. Reuse existing fixtures and variables.
3. Build masters with the Plugin API through the MCP code-execution tool, in small batches you verify visually (screenshot) after each batch. Preserve existing IDs. Bind every visual property to a variable; no hard-coded colors or sizes in masters.
4. Build the specification page: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples, with explanatory instances of the master.
5. Verify parity: Figma resolution against the computed values for every option and state in each brand and mode pair; public property exposure on the master; difficult cases (long labels, empty optional slots, constrained width, all states in light and dark). Write `reports/components/<id>/figma/parity.json`.
6. Present the parity review with file and node links, screenshots and the parity report. Stop for the Figma parity gate.

## Reference scripts

`authoring/adapters/figma/README.md` lists the mechanics learned with the reference kit (ID-preserving variable sync, native resolution verification, hidden instance children, fallback paints, slot foreground inheritance). The kit's own script bodies stay readable at tag `reference-kit-2026-09`; scripts for ggbrick are written per task and, when reusable, kept in that folder.

## Publication

Publishing the library, its access and its versioning are Deliver decisions requiring explicit authorization.
