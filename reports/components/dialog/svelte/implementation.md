# Dialog — Svelte implementation report

Component: `packages/svelte/src/components/dialog/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon-button`, `button-group`, `lib/overlay`. Review page: `examples/dialog/`; preview `dist/previews/dialog.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- lib/overlay modal gained a closeRequest option (closedby none and a cancelled cancel event) for a dialog that is not dismissible.
- The page does not scroll while a dialog is open (:root:has(dialog.ggb-dialog[open]) { overflow: hidden }).
- Header, title and footer are divs (the title has role heading, level 2) so that an application's element styles never reach them.
- Enters moving upwards: the dialog negates the overlay distance of overlay.css.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/dialog.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks). The overlay smoke spec also runs in Firefox 155 and WebKit 26.6 (both support CSS anchor positioning and closedby natively; the measured fallback is covered in Chromium by the spike spec).
- SSR: 2 recorded checks (`tests/ssr/overlays.test.ts`).
- `computed.json`: 96 records.
- Preview: `dist/previews/dialog.html` mounts from `file://` without errors.

## Fixed during implementation

- A 44 px target at the edge of the body made it scroll and clipped focus indicators: the body keeps a focus room (contract fact added).
- h2, header and footer elements received the review page's element styles: they are divs, the title keeps its heading role.
