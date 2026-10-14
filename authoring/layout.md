# Repository layout

The design-system root is the repository root. All agent instructions resolve paths from here.

| Path                                                  | Responsibility                                                                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`, `CLAUDE.md`                              | Authoring entry point and task routing                                                                                                         |
| `.claude/skills/ggb-*/SKILL.md`                       | Repository skills: foundations, component, contract, figma, svelte, docs, maintain                                                             |
| `package.json`                                        | npm workspaces (`packages/*`) and scripts                                                                                                      |
| `foundations/tokens/config.json`                      | Brands, appearances, densities                                                                                                                 |
| `foundations/tokens/{base,<brand>}/`                  | Authoritative DTCG token sources                                                                                                               |
| `foundations/tokens/status.json`                      | Tokens phase, approvals and evidence                                                                                                           |
| `foundations/components/<family>/<id>/contract.json`  | Compact shared contract (id equals folder name)                                                                                                |
| `foundations/components/<family>/<id>/status.json`    | Artifact, approval and evidence references                                                                                                     |
| `foundations/components/<family>/<id>/figma-spec.md`  | Figma specification, written at the parity phase                                                                                               |
| `documentation/index.json`, `documentation/AGENTS.md` | Economical consumer discovery                                                                                                                  |
| `documentation/components/<id>.md`                    | Maintained usage page for humans and agents                                                                                                    |
| `packages/tokens/`                                    | Generated token outputs: `tokens.css`, `resolved/`, Figma manifest and expectations                                                            |
| `packages/svelte/src/index.ts`                        | Public exports                                                                                                                                 |
| `packages/svelte/src/components/<id>/`                | Component implementation: `<Name>.svelte`, `types.ts`, `<id>.css`, generated `contract.generated.ts` and `tokens.generated.css`                |
| `packages/svelte/{docs,contracts,tokens.css}`         | Build-time copies, ignored by git                                                                                                              |
| `authoring/`                                          | Decisions, roadmap, workflow and procedures (rationale), foundations and Figma specifications, contract format and guide, catalog, this layout |
| `authoring/schemas/`                                  | Contract JSON Schema                                                                                                                           |
| `authoring/templates/`                                | Contract skeleton, status, documentation page, Figma specification, change/audit/release records                                               |
| `authoring/adapters/figma/`                           | Figma adapter notes (known mechanics); reusable script bodies written for ggbrick                                                              |
| `tooling/` and `tooling/lib/`                         | Deterministic generators and validators                                                                                                        |
| `examples/<id>/`                                      | Review page of the Vite app; `examples/index.html` lists them; `examples/foundations/` reviews tokens                                          |
| `tests/*.test.ts`                                     | Tooling unit tests (fixtures in `tests/fixtures/`)                                                                                             |
| `tests/ssr/<id>.test.ts`                              | Server-rendering tests per component (`helpers.ts` shared)                                                                                     |
| `tests/browser/<id>.spec.ts`                          | Playwright tests per component                                                                                                                 |
| `reports/`                                            | Revision-bound evidence (see `reports/README.md`): `tokens/` (traces, contrast, Figma ledger, change records), `components/<id>/`              |
| `dist/`                                               | Ignored build outputs: `examples/`, `previews/<id>.html`, package tarballs                                                                     |
| `apps/docs/`                                          | Documentation site (Astro + Starlight, docs.ggbrick.design); `lib/content.ts` generates the component pages, see architecture.md               |
| `apps/`                                               | Future: `site` (marketing, ggbrick.design), `theme-builder`, `figma-plugin`                                                                    |

## Rules

- Move files only as one explicit change with imports, scripts, links, skill references, schemas, exports and build paths updated together; verify `npm run verify` and a packed consumer afterwards.
- Do not create two maintained copies of a contract or documentation page. Generated distribution copies are not editable sources.
- Do not create empty component folders or placeholder contracts for future components; scaffold with `npm run new:component -- <family> <id>` when a component is addressed.
- Authoring procedures stay out of consumer packages.
