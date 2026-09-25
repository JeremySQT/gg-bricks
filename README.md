# ggbrick

ggbrick is a design system built for AI-assisted authoring and delivered as three products generated from the same JSON sources:

1. **Figma library**: the validated visual representation, driven by generated variables.
2. **Svelte 5 components** (`@ggbrick/svelte`, built on Bits UI): install the package or copy a component's source folder into your project.
3. **Documentation**: one maintained source for humans and agents, shipped with the package and published as a site.

Sources of truth: DTCG tokens in `foundations/tokens` and one compact contract per component in `components/`. Everything else is generated from them or reviewed against them. Target domain: ggbrick.design.

## Status

The repository structure, tooling, procedures and skills are in place. Foundations (primitives and semantic tokens) are the next task, then components are built wave by wave. See [authoring/roadmap.md](authoring/roadmap.md).

## Layout

| Path | Role |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `.claude/skills/` | Authoring entry point, routing and skills |
| `foundations/` | Token sources, config and foundations status |
| `components/<family>/<id>/` | Contract, status and Figma specification per component |
| `documentation/` | Maintained consumer docs: index, agent guide, component pages |
| `packages/tokens/`, `packages/svelte/` | Generated token outputs; Svelte package |
| `authoring/` | Decisions, roadmap, workflows, playbook, foundations and Figma specs, schemas, templates |
| `tooling/` | Deterministic generators and validators |
| `examples/` | Vite review app, one page per component |
| `tests/` | Tooling unit tests, SSR tests, Playwright tests |
| `reports/` | Revision-bound evidence |
| `apps/` | Reserved for the docs site, marketing site, theme builder and Figma plugin |

Full description: [authoring/layout.md](authoring/layout.md).

## Commands

```sh
npm ci
npm run generate        # tokens + Svelte bindings + consumer copies
npm run validate        # every contract: schema, consistency, token coverage in all contexts
npm test                # tooling unit tests
npm run check           # svelte-check
npm run test:ssr        # server rendering per component
npm run dev             # review app at http://127.0.0.1:5173
npm run build           # generate + production build of the review app
npm run build:preview <id>     # self-contained dist/previews/<id>.html
npm run test:browser    # Playwright (Chromium); PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH reuses a local browser
npm run verify          # generate, validate, test, check, ssr, build
npm run verify:generated       # fails when generated outputs drift from sources
npm run pack:svelte     # dist/ggbrick-svelte-<version>.tgz
npm run new:component -- <family> <id>
```

Node 22.12 or newer. Svelte 5.57.1 and Bits UI 2.19.3 are pinned.

## Working with agents

Open the repository with Claude Code and ask for a task in plain words ("define the foundations", "do the Button", "build wave 2"). `AGENTS.md` routes the request to a skill; the skill stops at the review gates listed in [authoring/workflow.md](authoring/workflow.md) and records approvals and evidence in status files. The pre-ggbrick reference kit is archived at git tag `reference-kit-2026-09` (commit cd0a2a2, always reachable in the branch history).
