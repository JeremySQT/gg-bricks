# Design system

An AI-authorable, portable design system with three deliverables built from the same sources:

1. **Figma library**: the validated visual representation, driven by generated variables.
2. **Svelte components** (`packages/svelte`): the reference implementation on Svelte 5 and Bits UI.
3. **Documentation**: one maintained source (`documentation/`) for humans and agents, shipped with the package and, later, published as a site.

Authoritative sources are JSON: DTCG tokens in `foundations/tokens` and one compact contract per component in `components/`. Everything else is generated from them or reviewed against them. Button is the worked reference; the catalog is being built component by component through the procedures in `authoring/`.

## Layout

| Path | Role |
| --- | --- |
| `AGENTS.md` | Authoring entry point for agents (task routing, rules) |
| `foundations/` | `config.json` (brands, appearances, densities) and `tokens/{base,brand-*}` DTCG sources |
| `components/<family>/<id>/` | `contract.json`, `status.json` and component-level review notes |
| `documentation/` | Maintained consumer docs: `index.json`, `AGENTS.md`, `components/*.md` |
| `packages/tokens/` | Generated token outputs (CSS, resolved JSON, Figma manifest) |
| `packages/svelte/` | Svelte package: `src/<id>/` per component plus generated bindings and consumer copies |
| `authoring/` | Decisions, workflows, playbook, roadmap, skills, schemas, templates, Figma adapter scripts |
| `tooling/` | Deterministic Node generators and validators |
| `examples/` | Vite review app, one page per component |
| `tests/` | Contract/token unit tests, SSR tests, Playwright browser tests |
| `reports/` | Revision-bound evidence per component and for tokens |
| `apps/` | Reserved for the documentation site, marketing site, theme builder and Figma plugin (see the roadmap) |

## Commands

```sh
npm ci
npm run generate        # tokens + Svelte bindings + consumer copies (run after editing sources)
npm run validate        # every contract: schema, consistency, token coverage in all contexts
npm test                # contract and token resolver unit tests
npm run check           # svelte-check
npm run test:ssr        # server rendering per component
npm run dev             # review app at http://127.0.0.1:5173 (examples/<id>/)
npm run build           # generate + production build of the review app into dist/examples
npm run build:preview button   # self-contained dist/previews/button.html for review outside the repo
npm run test:browser    # Playwright (Chromium). Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to reuse a local Chromium.
npm run verify          # generate, validate, test, check, ssr, build
npm run pack:svelte     # dist/ds-svelte-<version>.tgz for isolated consumer checks
npm run new:component -- <family> <id>   # scaffold contract + status for a component being addressed
```

Node 22.12 or newer. The reference pins Svelte 5.57.1 and Bits UI 2.19.3.

## Start here

- Agents: read [AGENTS.md](AGENTS.md), then [the handoff](authoring/handoff.md) and [the roadmap](authoring/roadmap.md).
- Consumers of the package: read [packages/svelte/README.md](packages/svelte/README.md) and the local `docs/index.json` shipped with it.
- Decisions: [authoring/decisions.md](authoring/decisions.md). Procedures: [authoring/workflow.md](authoring/workflow.md).

Generated files are committed so that token, binding and evidence changes are reviewable in diffs. `npm run verify:generated` fails when sources and generated outputs drift.
