# @ggbrick/docs

The documentation site, docs.ggbrick.design: Astro and Starlight rendering `documentation/` with live Svelte examples. Static output, deployable on any static host (hosting is open decision 3 in `authoring/decisions.md`).

```sh
npm run dev:docs     # from the repository root: http://localhost:4321, regenerates component pages on change
npm run build:docs   # apps/docs/dist
```

| Path                                   | Content                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `astro.config.ts`                      | Starlight configuration; runs `lib/content.ts` and builds the Components sidebar from `documentation/index.json`          |
| `lib/content.ts`                       | Generator of the component pages (playground, live blocks, Figma blueprints, Best practices cards); output ignored by git |
| `src/content/docs/getting-started/`    | Maintained pages: introduction, installation, theming, copying a component, agents                                        |
| `src/content/docs/foundations/`        | Generated from `documentation/foundations/*.md` (ignored by git); `<!-- site:… -->` markers become `FoundationBlock`s     |
| `src/components/`                      | `LiveExample` and `Demo` frames, foundations tables (`foundations/`), home showcase                                       |
| `src/examples/`                        | Svelte demos of the Getting started pages, shown with their own source                                                    |
| `src/playgrounds/<id>.svelte`          | The playground that opens each component page (`PlaygroundFrame` with the key options in the corners)                     |
| `src/overrides/`                       | Starlight overrides: `ThemeProvider` (ggbrick attributes on `<html>`), `ThemeSelect` (brand and density selects)          |
| `src/styles/ggbrick.css`               | Starlight custom properties mapped to ggbrick tokens                                                                      |
| `src/lib/tokens.ts`, `src/lib/root.ts` | Build-time access to resolved tokens, traces and config                                                                   |

Component and foundations pages are never edited here: change `documentation/`, the contract, the status or the reports. See `authoring/architecture.md`, Documentation distribution.

## Deployment

Cloudflare Workers with static assets (`wrangler.jsonc`), built and deployed by Workers Builds, Cloudflare's Git integration: no token is stored in GitHub, `release` deploys to docs.ggbrick.design and every other branch, `main` included, gets a Worker Preview named after the branch (`wrangler preview`, open beta in Wrangler 4.151). Only the Deliver procedure merges into `release` (see `authoring/decisions.md`); until the first Deliver creates it, the site exists only as previews. One-time setup in the Cloudflare dashboard (Workers & Pages → Create → Import a repository):

| Setting                              | Value                                             |
| ------------------------------------ | ------------------------------------------------- |
| Repository                           | `JeremySQT/design-system`                         |
| Project name                         | `ggbrick-docs` (the `name` in `wrangler.jsonc`)   |
| Production branch                    | `release`                                         |
| Root directory                       | `/` (the repository root, for the npm workspaces) |
| Build command                        | `npm run build:docs`                              |
| Deploy command                       | `npm run deploy --workspace apps/docs`            |
| Builds for non-production branches   | enabled                                           |
| Non-production branch deploy command | `npm run deploy:preview --workspace apps/docs`    |
| Build variable                       | `NODE_VERSION` = `22` (also in `.node-version`)   |

Set both deploy commands explicitly: the dashboard's default (`npx wrangler preview` at the repository root) stops on the npm workspaces root. The first preview of `site/docs` was deployed this way on 2026-10-15 (`https://site-docs-design-system.jeremy-soquet.workers.dev`); Workers Builds names the Worker after the dashboard project (`design-system`), which takes precedence over `name` in `wrangler.jsonc`.

Then add the custom domain `docs.ggbrick.design` to the Worker (Settings → Domains & Routes) once `ggbrick.design` is a zone of the account. Locally, `npx wrangler dev` in `apps/docs` serves `dist/` as Cloudflare will.
