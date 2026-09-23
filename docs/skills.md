# Authoring skills

Implemented in this kit:
- ds-component-workflow: resume and coordinate the lifecycle.
- ds-component-contract: scope and draft the shared contract.

Planned, not implemented:
- ds-component-figma: design and specification phases separated by design approval.
- ds-component-svelte: concrete target conventions and implementation.
- ds-component-docs: shared content, catalog and executable examples.
- ds-component-validation: evidence and completion checks.

These are repo-scoped skills using shared references two levels above their directories. Keep this layout when moving them. They are supplied as files, not installed globally.

Example: "Read skills/ds-component-workflow/SKILL.md. Continue the datepicker using this repository's current decisions and status."

Specialized tool skills (for example Figma Plugin API guidance) still apply when those tools are used. These DS skills do not replace them. If a planned capability lacks a skill, use the approved workflow and template when sufficient; report missing conventions that block the phase rather than pretending an absent skill ran.

The consumer package should contain usage instructions, not these fabrication procedures.

Additional planned capability: ds-component-reconcile-figma. Compare the last synchronized representation, current Figma and source contracts/tokens; distinguish master changes from instance overrides; classify shared token, anatomy and intrinsic rule impacts; resolve ambiguous intent, update authoritative sources and rebuild affected outputs. Never promote an instance override to a global token automatically.
