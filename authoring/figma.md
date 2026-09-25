# Figma operating mode

Figma is the validated visual representation of ggbrick. It is operated through the **Figma MCP server** connected to the session. Inspect the tools it exposes at session start (reading design context and screenshots, and executing Plugin API code in the file) and follow the server's own instructions or skill; nothing here replaces them.

## Model

- One ggbrick library file. Pages: Cover, Getting started, Foundations, one page per component family (Actions, Forms, Feedback, Overlays, Navigation, Data), Utilities (private fixtures, prefixed `_`).
- Variables: collections Brand, Appearance and Density with exactly the modes of `foundations/config.json`. The generated `packages/tokens/figma-manifest.json` is the source of variable names, types, scopes and values; `figma-expectations.json` holds the expected resolved values per brand and mode pair. Typography roles become text styles; shadows become effect styles.
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

`authoring/adapters/figma/` contains Plugin API script bodies inherited from the reference kit (variable sync preserving IDs, component construction, slot color inheritance, resolution verification). They encode the kit's Button IDs and are **models to adapt**, not scripts to run as is. Known mechanics worth reusing: traverse hidden instance children when binding icon colors; assign resolved fallback paints when re-binding cloned paints; a swapped slot instance may restore stale per-component paints, which is solved by an inherited foreground alias set by the parent surface's context.

## Publication

Publishing the library, its access and its versioning are Deliver decisions requiring explicit authorization.
