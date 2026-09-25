# DS authoring entry point

This repository defines how to build the DS. It is not the consumer guide for using components inside an application.

Read docs/decisions.md and the target component's status first. For creation, modification, auditing or delivery, follow skills/ds-component-workflow/SKILL.md. For contract work, follow skills/ds-component-contract/SKILL.md. Load other references only for the current phase.

Tokens and contracts in the repository are authoritative. Preserve their platform independence. Figma is the validated visual representation; Svelte is the target implementation. Update source decisions before reconciling diverging outputs.

Use English for identifiers, rules and maintained documentation. Communicate with the user in their language. Prefer deterministic Node scripts for transformations and checks.

Follow recorded approvals for their exact revision and scope; do not re-request valid approvals. Never infer component completion from a token pilot or visual approval alone. Record unresolved decisions rather than guessing product behavior.

Repository skills and templates describe outputs, not permissions. Do not infer publication authorization from artifact readiness. Do not modify unrelated user-owned Figma objects.

For task routing and reference-kit handoff, read docs/handoff.md. Use docs/component-catalog.md only to select scope or dependencies; listed candidates are not available exports. Before final documentation, obtain the agreed interactive implementation review. Load only the relevant procedure and phase references.
