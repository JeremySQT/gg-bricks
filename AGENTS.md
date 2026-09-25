# DS authoring entry point

This repository defines how the design system is built. It is not the consumer guide for using components inside an application; that guide ships with the package (`documentation/`).

## Read first

1. [authoring/decisions.md](authoring/decisions.md): settled principles and open choices. Do not reopen settled ones.
2. [authoring/roadmap.md](authoring/roadmap.md): the component waves, their order and the current wave.
3. The target component's `components/<family>/<id>/status.json`, then only the sources it references.

Route the task through [authoring/workflow.md](authoring/workflow.md): Create, Modify, Audit, Deliver, or the batch procedure for a whole wave. Follow [authoring/skills/ds-component-workflow/SKILL.md](authoring/skills/ds-component-workflow/SKILL.md); for contract work follow [authoring/skills/ds-component-contract/SKILL.md](authoring/skills/ds-component-contract/SKILL.md). Load the relevant section of [authoring/authoring-playbook.md](authoring/authoring-playbook.md) only for the current phase.

## Rules

- Tokens (`foundations/tokens`) and contracts (`components/*/*/contract.json`) are authoritative and platform independent. Figma is the validated visual representation; Svelte (`packages/svelte`) is the target implementation. Update sources before reconciling diverging outputs.
- Generated files (`packages/tokens`, `packages/svelte/src/*/*.generated.*`, `reports/components/*/…json`) are produced by `npm run generate`; never edit them by hand. Commit them with the source change that caused them.
- Use English for identifiers, rules and maintained documentation. Communicate with the user in their language.
- Use the deterministic scripts in `tooling/` for transformations and checks. Extend them generically; do not add component-specific branches to shared tooling.
- Follow recorded approvals for their exact revision and scope; do not re-request valid approvals. Never infer completion from a passing check or a visual approval alone. Record unresolved decisions in status instead of guessing product behavior.
- Review gates (contract, Figma design, interactive implementation) and delivery approval are the only mandatory interruptions. Group other consequential questions into one message at the next gate; complete routine, unblocked work autonomously.
- Skills and templates describe outputs, not permissions. Do not publish (registry, Figma library, site) without explicit authorization for that destination and version. Do not modify unrelated user-owned Figma objects.
- Use Button (`components/actions/button`, `packages/svelte/src/button`, `examples/button`) as the example of artifact structure, not as a universal interaction model.

Before finishing any batch: `npm run verify`, update the affected `status.json` files, and record evidence paths.
