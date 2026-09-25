# Handoff

## Where the project stands

- Repository structure, generic tooling, procedures and skills are in place (2026-09-25).
- Tokens are still the seed inherited from the reference kit. The **Foundations task** (`ggb-foundations`) is the next step; no component may start before its gate passes.
- No component exists yet. Button is rebuilt from zero in wave 1 as the pattern for the others.
- The pre-ggbrick kit is archived at tag `reference-kit-2026-09` (commit cd0a2a2, always reachable in the branch history) (Button worked example, Figma evidence, adapter scripts). It is a model of artifact structure only.

## Entry points

| Need                         | Entry                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Routing and rules            | `AGENTS.md`                                                                                                   |
| Settled and open decisions   | `authoring/decisions.md`                                                                                      |
| Order of work and state      | `authoring/roadmap.md`                                                                                        |
| Foundations target inventory | `authoring/foundations.md`                                                                                    |
| Procedures and gates         | `.claude/skills/ggb-*/SKILL.md` (executable), `authoring/workflow.md`, `authoring/workflows/*.md` (rationale) |
| Contract format              | `authoring/contract-format.md`, `authoring/contract-guide.md`, `authoring/schemas/`                           |
| Figma operating mode         | `authoring/figma.md`, `authoring/adapters/figma/`                                                             |
| Tooling                      | `tooling/*.mjs`, `npm run` scripts in `package.json`                                                          |
| Evidence                     | `reports/`, status files                                                                                      |

## Example requests and what happens

- "Define the foundations": `ggb-foundations` proposes primitives, semantic roles, brands and a review page; stops at the foundations gate.
- "Do the Button": `ggb-component` checks the foundations gate, scaffolds `components/actions/button`, drafts the contract, stops at the contract gate; then Svelte, examples, tests, implementation gate; then Figma reproduction, parity gate; then documentation.
- "Build wave 2": same, batched for all wave-2 components.
- "Change the accent color of brand X": `ggb-maintain` Modify, with a representative visual review.
