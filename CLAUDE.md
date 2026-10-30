# Claude Code instructions for ggbrick

Read `AGENTS.md` first: it routes every request to a skill in `.claude/skills/`. A request like "do the Button" or "build InputText" goes to `ggb-component`; foundations work goes to `ggb-foundations`.

- `npm run generate` after editing tokens, contracts or documentation; commit the regenerated files with the change.
- `npm run verify` before finishing a batch. Browser tests: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:browser` when a local Chromium exists, otherwise `npx playwright install chromium` first.
- Tests check everything but write no evidence by default: a full run (`verify`, `test:ssr`, `test:browser`) leaves the working tree clean, locally and in CI. Write screenshots, `computed.json`, `ssr.json` and `reports/browser-results.json` only when the evidence is wanted (implementation review, Figma parity, a status update that records it): `GGB_EVIDENCE=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:browser` (add `GGB_EVIDENCE=1 npm run test:ssr` for `ssr.json`). Commit only the evidence the change concerns; restore the rest (`git checkout -- reports`), since screenshots differ by a few anti-aliased pixels from one run to another.
- Interactive reviews: `npm run build && npm run build:preview <id>` writes `dist/previews/<id>.html`, a self-contained page. Publish it as an artifact when the user reviews remotely.
- Figma work uses the Figma MCP server; see `.claude/skills/ggb-figma/SKILL.md`.
- `main` is production. Work and push on the task's branch; never commit to `main`. Open a pull request to `main` only when the unit of work is complete (component Done, foundations approved, site task finished), with `.github/pull_request_template.md`.
- Never hand-edit generated files. Never publish without explicit authorization.
