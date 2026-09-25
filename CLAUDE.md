# Claude Code instructions for ggbrick

Read `AGENTS.md` first: it routes every request to a skill in `.claude/skills/`. A request like "do the Button" or "build InputText" goes to `gg-component`; foundations work goes to `gg-foundations`.

- `npm run generate` after editing tokens, contracts or documentation; commit the regenerated files with the change.
- `npm run verify` before finishing a batch. Browser tests: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:browser` when a local Chromium exists, otherwise `npx playwright install chromium` first.
- Interactive reviews: `npm run build && npm run build:preview <id>` writes `dist/previews/<id>.html`, a self-contained page. Publish it as an artifact when the user reviews remotely.
- Figma work uses the Figma MCP server; see `.claude/skills/gg-figma/SKILL.md`.
- Never hand-edit generated files. Never push to a branch other than the one assigned for the task. Never publish without explicit authorization.
