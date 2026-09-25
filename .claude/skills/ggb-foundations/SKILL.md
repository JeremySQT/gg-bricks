---
name: ggb-foundations
description: Define or extend the ggbrick foundations - generous primitive token ramps and scales, the full semantic inventory, default brands, generated CSS and Figma variables - and stop at the foundations review gate. Use for "define the foundations", "the palette", "primitives", "semantic tokens", or when a component needs a new token family.
---

# Foundations

Read `AGENTS.md`, `authoring/decisions.md` (Sources and tokens), `authoring/foundations.md` (target inventory) and `foundations/status.json`. The current token files may be the reference-kit seed; replace them, do not extend them piecemeal.

## Procedure

1. **Inventory.** Write the primitive families and the semantic roles listed in `authoring/foundations.md` into `foundations/tokens/base/…` as DTCG JSON (`$type`, `$value`; aliases `{path}`). Write `tooling/generate-palette.mjs` (it does not exist yet): OKLCH lightness steps per index and chroma per hue, converted to sRGB components in 0–1, writing `colors.tokens.json` deterministically from committed parameters (`foundations/palette.config.json`). Keep `primitive.*` free of aliases and `semantic` free of literal values where a primitive exists.
2. **Brands.** Keep `base` complete. Add the demonstration brands as sparse overlays with the same file and token names; update `foundations/config.json`.
3. **Coverage check.** Create `foundations/inventory.json` (the semantic role list with expected types, plus the `contrast` pairs described in `authoring/foundations.md`) and write `tooling/check-foundations.mjs`, which fails if a role is missing in any context or has the wrong type. Chain it in `package.json`: `"validate": "node tooling/validate-contracts.mjs --tokens && node tooling/check-foundations.mjs"`.
4. **Generate and verify.** `npm run generate`, `npm test`, `npm run validate`. Inspect `packages/tokens/tokens.css` and the Figma manifest.
5. **Contrast evidence.** Have `tooling/check-foundations.mjs` write `reports/tokens/contrast.json` from the `contrast` pairs of the inventory: one record per pair and context `{ context, content, surface, ratio, minimum, passed }`, WCAG thresholds 4.5 for text and 3 for borders and focus. Pairs are declared explicitly (for example `content.onAccent` is paired with accent surfaces, not with every surface).
6. **Review page.** Create `examples/foundations/` (index.html, main.ts, App.svelte) showing every ramp, the surfaces and text roles in light and dark, the type scale, spacing and control sizes per density, shadows, motion and the brand switch. `npm run build && npm run build:preview foundations`.
7. **Figma variables.** If the Figma MCP server is available, follow `authoring/figma.md` to create or sync the three collections and the text and effect styles in the library file, then verify resolution against `packages/tokens/figma-expectations.json`. Record file key and evidence. If no Figma tool is available, say so in the status and leave `approvals.figmaVariables` null.
8. **Gate.** Present: preview page, palette and contrast summary, semantic role table, brands, the choices you made (hue names, scale values, fonts) and grouped open questions (icon set and license among them). Stop. On approval record `approvals.primitives` and `approvals.semantic` (format in `authoring/workflow.md`, digests of the token files), set `phase` to `approved`, and update the roadmap state. `approvals.figmaVariables` is recorded separately when step 7 has been verified, in this session or a later one; it does not block components.

## Rules

- Values are proposals until approved; do not describe them as final. Do not shrink the inventory to what a known component needs.
- Never create empty files. Every semantic file holds real definitions.
- Changing an approved foundation later goes through `ggb-maintain` Modify with a representative visual review of affected components.
