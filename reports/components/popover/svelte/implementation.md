# Popover — Svelte implementation report

Component: `packages/svelte/src/components/popover/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `lib/overlay`. Review page: `examples/popover/`; preview `dist/previews/popover.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- The trigger is rendered by a snippet that spreads popovertarget and the popup attributes on a Button or IconButton: the browser toggles the auto popover, which spares the trigger from light dismiss (no close-then-reopen on the same press) and restores focus to it on Escape.
- On opening, the panel's max block size is the larger room above or below the trigger, so that it flips and scrolls instead of overflowing the viewport.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/popover.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks). The overlay smoke spec also runs in Firefox 155 and WebKit 26.6 (both support CSS anchor positioning and closedby natively; the measured fallback is covered in Chromium by the spike spec).
- SSR: 2 recorded checks (`tests/ssr/overlays.test.ts`).
- `computed.json`: 28 records.
- Preview: `dist/previews/popover.html` mounts from `file://` without errors.

## Fixed during implementation

- A Tab press right after opening could leave the panel open: the native toggle event arrived after the focus left; focus leaving now hides the element itself, and the deferred initial focus is skipped when the user already moved focus (also in Menu and Dialog).
