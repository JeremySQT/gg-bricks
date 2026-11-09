# Tooltip — Svelte implementation report

Component: `packages/svelte/src/components/tooltip/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `lib/overlay`. Review page: `examples/tooltip/`; preview `dist/previews/tooltip.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- The trigger is the first element of the children snippet, wrapped in a display: contents span that listens to pointer and focus events; the tooltip is a manual popover placed by lib/overlay floating.
- One tooltip at a time and the skip delay (300 ms after a tooltip closed, the next opens at once) are module-level state.
- aria-describedby is added to the trigger unless its aria-label equals the tooltip text.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/tooltip.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks). The overlay smoke spec also runs in Firefox 155 and WebKit 26.6 (both support CSS anchor positioning and closedby natively; the measured fallback is covered in Chromium by the spike spec).
- SSR: 1 recorded checks (`tests/ssr/overlays.test.ts`).
- `computed.json`: 32 records.
- Preview: `dist/previews/tooltip.html` mounts from `file://` without errors.

## Fixed during implementation

- Nothing beyond the first draft.
