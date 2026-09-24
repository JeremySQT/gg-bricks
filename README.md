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

This is an architecture baseline, not a production component library. Template fields and the proposed tracking format are implementation proposals; they have not received a separate user review. A [Button contract and schema candidate](docs/button-contract-review.md) is now available with a Node validator (npm ci, npm test, npm run validate). Its compact encoding was accepted; the full Button design candidate is now available for visual review. The final token catalog, other components, Svelte conventions and publication infrastructure remain open.

The existing ds-token-pilot archive remains a separate experimental artifact. Do not treat its reduced Button contract or experimental values as the final DS.

## Use in a future repository

Merge this kit into the DS repository, preserving its relative paths. Explicitly direct an agent to skills/ds-component-workflow/SKILL.md or expose these directories through the agent's supported skill discovery mechanism. These files are not automatically installed by this archive.

A complete Git snapshot is supplied as history.bundle. To restore it outside the unpacked kit, run:
git clone /path/to/ds-architecture/history.bundle ds-architecture

No remote repository is configured. Do not mistake a local commit for a remote publication.

## Current Button batch

Read [the review and adapter notes](docs/button-contract-review.md). Run `npm ci`, `npm test`, and `npm run build:tokens`. The package contains JSON sources, deterministic generators, validation evidence and Figma screenshots. Svelte and release publication are not included in this batch.

## Svelte Button implementation

This section supersedes the earlier batch's statement that Svelte is not included. The reference now uses Svelte 5.57.1 and Bits UI 2.19.3.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No backend or credentials are required. `button-preview.html` is a self-contained production build that can also be opened directly in a browser.

- Source/package: [packages/svelte](packages/svelte/README.md).
- Human and agent guide: [Button](packages/svelte/docs/button.md).
- Agent discovery: [catalog](packages/svelte/docs/index.json).
- Verification: `npm run check`, `npm test`, `npm run test:ssr`, `npm run build`.
- Browser checks: install Chromium with `npx playwright install chromium`, then `npm run test:browser`. A local browser may be selected through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
- Local installation artifact: `npm run pack:svelte` writes `dist/ds-reference-svelte-0.1.0.tgz`.

The live demo and its screenshots are implementation review aids. The Figma fixture properties still need exposure from the public Button, and complete dependency components and final distribution remain open. Do not mark the entire DS Done from this implementation.
