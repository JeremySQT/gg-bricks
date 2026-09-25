# Reference repository architecture

The DS kit is intended to live inside a larger project/package root. This target layout records the accepted direction; it is not a filesystem migration. The current kit remains executable at its existing paths.

## Target responsibilities

| Target path, relative to the future DS root | Responsibility | Current location |
| --- | --- | --- |
| AGENTS.md | Short authoring entry point and task routing | AGENTS.md |
| package.json | Workspace/build orchestration | package.json |
| foundations/tokens/{base,brand-a,brand-b}/ | Authoritative DTCG token sources | tokens/ |
| components/actions/button/contract.json | Compact shared contract | contracts/actions/button.contract.json |
| components/actions/button/status.json | Artifact/approval/evidence references | components/button/status.json |
| packages/tokens/ | Generated distributable token outputs | dist/ token output; not yet a separate package |
| packages/svelte/ | Svelte target implementation and exports | packages/svelte/ |
| documentation/components/button.md | Maintained usage page | packages/svelte/docs/button.md |
| documentation/index.json | Economical consumer discovery | packages/svelte/docs/index.json |
| authoring/ | Architecture, decisions, workflows, skills, schemas, templates, adapter notes | docs/, skills/, schemas/, templates/, adapters/ |
| tooling/ | Deterministic generators and validators | tools/ |
| examples/ | Executable consumer examples and review demos | examples/ |
| tests/ | Meaningful implementation/source checks | tests/ |
| reports/ | Revision-bound evidence | reports/ |

A larger parent project can contain this root under a chosen folder. All agent instructions must resolve paths relative to the DS root; do not assume the parent repository root is the DS root.

## Migration rules

Move files only as one explicit migration with imports, scripts, links, skill references, schemas, exports and build paths updated together. Verify existing commands and packed consumption afterward. Do not create two maintained copies of a contract or documentation page to simulate the target layout.

Authoring procedures stay out of consumer packages. The documentation site and local package docs derive from the same content; generated distribution copies are not editable sources. The site engine and hosting remain open. Packaging raw Markdown locally does not depend on choosing a site engine.

Do not physically restructure the current kit merely to match this proposal before another agent chooses the parent package structure.
