# Spinner — Svelte implementation report

Component: `packages/svelte/src/components/spinner/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: none. Review page: `examples/spinner/`; preview `dist/previews/spinner.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- A labelled spinner is a role status named by aria-label (a status takes no name from its content in Chromium) with the same text visually hidden inside it as the announced content. Whether a status inserted already filled is announced varies between screen readers: the application may keep a status region on the page and fill it instead.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/spinner.spec.ts`; full suite run before the gate (see the status checks).
- SSR: 2 recorded checks (`tests/ssr/feedback-simple.test.ts`).
- `computed.json`: 648 records.
- Preview: `dist/previews/spinner.html` mounts from `file://` without errors.

## Fixed during implementation

- A status takes no name from its content in Chromium: the name is now aria-label.
