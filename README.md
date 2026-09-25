# Design system architecture kit

An authoring reference for an AI-assisted design system: JSON tokens and compact component contracts, Figma representation, Svelte/Bits UI implementation, and documentation for humans and agents. Button is the worked example. This is not a complete production component library.

## Start

Read [AGENTS.md](AGENTS.md), then [the handoff](docs/handoff.md) for current artifacts, accepted direction and remaining work. All maintained content is English.

- [Workflows](docs/workflow.md): Create, Modify, Audit, Deliver and review gates.
- [Decisions](docs/decisions.md): settled principles and remaining choices.
- [Architecture](docs/architecture.md): source ownership and token resolution.
- [Repository reference](docs/repository-reference.md): target integration inside a larger project, mapped to current paths.
- [Component catalog](docs/component-catalog.md): proposed future scope; not available exports.
- [Authoring playbook](docs/authoring-playbook.md): phase-specific execution guidance.
- [Contract guide](docs/contract-guide.md), [documentation template](templates/component-documentation.md), [Figma specification template](templates/figma-specification.md).
- [Status template](templates/component-status.json) and [repo-scoped skills](docs/skills.md).

## Button reference

- [Validated usage documentation](packages/svelte/docs/button.md).
- [Implementation package](packages/svelte/README.md) and [local agent index](packages/svelte/docs/index.json).
- [Status](components/button/status.json), [Figma review notes](docs/button-contract-review.md) and [consolidation audit](reports/architecture-consolidation.md).

```sh
npm ci
npm run dev
```

Open the Vite URL. The self-contained button-preview.html also opens directly in a browser. The reference pins Svelte 5.57.1 and Bits UI 2.19.3.

Relevant checks: npm test, npm run validate, npm run check, npm run test:ssr, npm run build. Browser checks require Chromium (npx playwright install chromium), then npm run test:browser. An existing browser may be selected through PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. These tests currently cover Button, not all catalog candidates.

npm run pack:svelte produces dist/ds-reference-svelte-0.1.0.tgz for local installation. A local artifact is not public publication. Final Figma fixture property exposure, dependency scope, support validation and release channels remain open; see the handoff.

## Use in a larger project

Preserve current relative paths when embedding the kit, or perform the complete migration described in the repository reference. Direct the agent to this root's AGENTS.md. Repo skills are supplied as files, not installed globally. Consumer instructions live with the package.

A complete local Git snapshot is supplied as history.bundle. Restore separately with git clone /path/to/ds-architecture/history.bundle ds-architecture. No remote is configured.
