# Slider — Svelte implementation report

Component: `packages/svelte/src/components/slider/` (Svelte 5.57.1, bits-ui 2.19.3 Slider (type single), completed locally). Dependencies: none. Review page: `examples/slider/`; preview `dist/previews/slider.html`. Implemented on 2026-11-23 (wave 6).

## Notes

- Thumb and range positioned in CSS from a --_fraction custom property with logical properties (correct before hydration and in right-to-left); the Bits UI root is the track inset by half a thumb, its hit area extended over the inset.
- Steps passed as an array that always ends with max; the value passed to Bits UI is already clamped and snapped, so that Bits UI never rewrites the application's value.
- Page Up/Down (ten steps), aria-valuetext (value formatted for the locale) and the hidden form input added; valueCommit only after a change.
- showValue: the value text shares one grid cell with the formatted min and max (hidden), so its width never changes.
- Forced colors: track CanvasText, range and thumb border Highlight, painted with forced-color-adjust none; disabled in GrayText.

## Decisions taken during implementation

- Other attributes go to the thumb; the consumer's onkeydown runs first.

## Checks (2026-11-23)

- `npm run verify`: passed (generate, lint, validate, unit tests, svelte-check 0 errors, SSR, build, docs build); `check:approvals` 0 errors (contract amendments recorded in pendingChanges are warnings until the gate).
- Tests: `tests/ssr/slider.test.ts`, `tests/browser/slider.spec.ts`.
- Browser (Chromium), also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): see the status checks.
- Evidence: `reports/components/slider/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
