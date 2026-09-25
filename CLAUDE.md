# Claude Code instructions

Read `AGENTS.md` first; it is the authoring entry point and routes every task. `authoring/roadmap.md` says which component wave is current.

- Run `npm run generate` after editing tokens, contracts or documentation, and commit the regenerated files.
- Run `npm run verify` before finishing a batch. Browser tests: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:browser` when a local Chromium exists, otherwise `npx playwright install chromium` first.
- Interactive reviews: `npm run build && npm run build:preview <id>` produces `dist/previews/<id>.html`, a self-contained page that can be shared with the reviewer.
- Never hand-edit files marked generated. Never publish or push to a branch other than the one assigned for the task.
