# Repository layout

The design-system root is the repository root. This layout was adopted on 2026-09-25 (see decisions.md); the previous kit paths are listed for reading historical evidence and conversation records.

| Path | Responsibility | Former kit path |
| --- | --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Authoring entry point and task routing | `AGENTS.md` |
| `package.json` | npm workspaces (`packages/*`), scripts | `package.json` |
| `foundations/config.json` | Brands, appearances, densities | `config.json` |
| `foundations/tokens/{base,brand-*}/` | Authoritative DTCG token sources | `tokens/` |
| `components/<family>/<id>/contract.json` | Compact shared contract | `contracts/<family>/<id>.contract.json` |
| `components/<family>/<id>/status.json` | Artifact, approval and evidence references | `components/<id>/status.json` |
| `components/<family>/<id>/*.md` | Component-level review notes (for Button: `figma-review.md`) | `docs/button-contract-review.md` |
| `documentation/index.json`, `documentation/AGENTS.md` | Economical consumer discovery | `packages/svelte/docs/` |
| `documentation/components/<id>.md` | Maintained usage page (humans and agents) | `packages/svelte/docs/<id>.md` |
| `packages/tokens/` | Generated token outputs: `tokens.css`, `resolved/`, Figma manifest and expectations | `dist/` |
| `packages/svelte/src/<id>/` | Svelte implementation plus generated `contract.generated.ts` and `tokens.generated.css` | same |
| `packages/svelte/{docs,contracts,tokens.css}` | Build-time copies, ignored by git | committed copies |
| `authoring/` | Architecture, decisions, workflows, playbook, roadmap, catalog, handoff | `docs/` |
| `authoring/skills/`, `authoring/schemas/`, `authoring/templates/`, `authoring/adapters/figma/` | Repo skills, contract schema, templates, Figma plugin script bodies | root folders of the same names |
| `tooling/` and `tooling/lib/` | Deterministic generators and validators | `tools/` |
| `examples/<id>/` | Review pages of the Vite app (`examples/index.html` lists them) | `examples/button/` + root `index.html` |
| `tests/`, `tests/ssr/`, `tests/browser/` | Unit, server-rendering and Playwright tests | `tests/` + `tools/test-svelte-ssr.mjs` |
| `reports/components/<id>/` | Revision-bound evidence per component (token coverage, contrast, Figma, Svelte) | `reports/button-*.json`, `reports/figma/`, `reports/svelte/` |
| `reports/tokens/traces/` | Provenance traces per context | `dist/traces/` |
| `dist/` | Ignored build outputs: `examples/`, `previews/<id>.html`, package tarballs | root `button-preview.html`, `dist/button-demo` |
| `apps/` | Future: `docs`, `site`, `theme-builder`, `figma-plugin` | none |

## Rules

- All agent instructions resolve paths relative to this root.
- Move files only as one explicit change with imports, scripts, links, skill references, schemas, exports and build paths updated together; verify `npm run verify` and a packed consumer afterwards.
- Do not create two maintained copies of a contract or documentation page. Generated distribution copies are not editable sources.
- Authoring procedures stay out of consumer packages.
