# TimeInput — Svelte implementation report

Component: `packages/svelte/src/components/time-input/` (Svelte 5.57.1, Bits UI not used (TimeField rejected, see decisions)). Dependencies: none. Review page: `examples/time-input/`; preview `dist/previews/time-input.html`. Implemented on 2026-11-23 (wave 6).

## Notes

- Parts written by the component from Intl.DateTimeFormat.formatToParts (`time.ts`): order, separators, hour cycle (auto, h12, h23; h11 locales shown 1 to 12), day period texts of the locale.
- Each part is a contenteditable span exposed as a spin button so that mobile keyboards open; text arrives through beforeinput and is never applied by the browser; arrows come from keydown; Enter submits the enclosing form.
- Parts are named by aria-labelledby: the Field label (or a hidden span with the label prop) and a hidden span with the part name from Intl.DisplayNames(locale, dateTimeField).
- Left and Right Arrow go to the nearest part on screen, so they follow the bidirectional order of a time in a right-to-left page; the parts are inline content (not flex items) so that the separators keep their spaces and the bidirectional algorithm orders them.
- Digits shown and accepted in the locale's numbering system (Arabic-Indic in ar-EG).
- Hidden input with the value (HH:mm or HH:mm:ss) when name is given.

## Decisions taken during implementation

- Bits UI TimeField not used: bits-ui 2.19.3 reads the day period as PM only when Intl writes "PM" (internal/date-time/formatter.js:146), so afternoon times show as morning in ko, ja, ar, en-GB (pm), es; h12 forced on a 24-hour locale renders no day period. Raised at the implementation gate.
- min and max are taken out of the attributes and not used (question in the wave 6 final consistency pass).

## Checks (2026-11-23)

- `npm run verify`: passed (generate, lint, validate, unit tests, svelte-check 0 errors, SSR, build, docs build); `check:approvals` 0 errors (contract amendments recorded in pendingChanges are warnings until the gate).
- Tests: `time-input-time.test.ts (unit)`, `tests/ssr/time-input.test.ts`, `tests/browser/time-input.spec.ts`.
- Browser (Chromium), also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): see the status checks.
- Evidence: `reports/components/time-input/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
