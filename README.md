# Design system architecture kit

Start with [AGENTS.md](AGENTS.md). This kit records the agreed architecture and provides two repository-scoped authoring skills. All maintained source content is English.

## Read progressively

- [Decisions](docs/decisions.md): agreed principles and open decisions.
- [Architecture](docs/architecture.md): ownership, tokens, proposed repository layout.
- [Workflow](docs/workflow.md): lifecycle, approvals, completion and resumption.
- [Contract guide](docs/contract-guide.md): minimal platform-independent contracts.
- [Documentation template](templates/component-documentation.md).
- [Figma specification template](templates/figma-specification.md).
- [Component status template](templates/component-status.json): proposed operational format.
- [Pilot evidence](docs/pilot-evidence.md): tested scope and limits.
- [Skills](docs/skills.md): implemented skills and planned capabilities.

This is an architecture baseline, not a production component library. Template fields and the proposed tracking format are implementation proposals; they have not received a separate user review. The final token catalog, contract JSON Schema, catalog of components, Svelte conventions and publication infrastructure remain open.

The existing ds-token-pilot archive remains a separate experimental artifact. Do not treat its reduced Button contract or experimental values as the final DS.

## Use in a future repository

Merge this kit into the DS repository, preserving its relative paths. Explicitly direct an agent to skills/ds-component-workflow/SKILL.md or expose these directories through the agent's supported skill discovery mechanism. These files are not automatically installed by this archive.

A complete Git snapshot is supplied as history.bundle. To restore it outside the unpacked kit, run:
git clone /path/to/ds-architecture/history.bundle ds-architecture

No remote repository is configured. Do not mistake a local commit for a remote publication.
