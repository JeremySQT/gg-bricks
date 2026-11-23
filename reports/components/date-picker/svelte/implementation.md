# DatePicker — Svelte implementation report

Component: `packages/svelte/src/components/date-picker/` (Svelte 5.57.1, bits-ui 2.19.3 DatePicker.Root, Input/Segment and Calendar, completed locally). Dependencies: icon-button, lib/overlay. Review page: `examples/date-picker/`; preview `dist/previews/date-picker.html`. Implemented on 2026-11-23 (wave 6).

## Notes

- The calendar is a native auto popover (lib/overlay floating), toggled by the calendar button through popovertarget; DatePicker.Content (portal) is not used.
- Segments: names from the Field label and Intl.DisplayNames, no value on empty parts, the Field description on the first part, invalid from the prop only (Bits UI's own min/max invalid removed, separators included); Backspace empties a whole part without emitting intermediate dates; Latin digits written by Bits UI shown in the locale's digits.
- Grid keyboard handled before Bits UI: arrows (right to left aware), Page Up/Down, Shift+Page Up/Down, Home/End; focus clamped to min..max; the target day is focused once the new month's grid exists.
- Choosing a day closes the calendar through the component and focus returns to the button; Escape closes, focus returns to the button; focus leaving the panel and the field closes it.
- Six fixed weeks, empty cells outside the month, 44 px cells, round days of size.control.sm; selected day in color.choice.on, today ring in color.item.indicator (selected text color on the selected day).
- Week start from Intl.Locale weekInfo (Monday where missing); short weekday names, narrow where the locale's are longer than four characters; Gregorian calendar whatever the locale.
- The calendar is rendered on the client from the first opening; the displayed month is fixed on the server and the current month once mounted.

## Decisions taken during implementation

- Contract amendments recorded in pendingChanges: spacing rule of the calendar button (as the InputText action, role slotInline removed); narrow weekday names where the short ones are long.
- The day rule "reached by the arrow keys" contradicts "focus never moves before min or after max" (wave 6 final consistency pass).

## Checks (2026-11-23)

- `npm run verify`: passed (generate, lint, validate, unit tests, svelte-check 0 errors, SSR, build, docs build); `check:approvals` 0 errors (contract amendments recorded in pendingChanges are warnings until the gate).
- Tests: `tests/ssr/date-picker.test.ts`, `tests/browser/date-picker.spec.ts`.
- Browser (Chromium), also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): see the status checks.
- Evidence: `reports/components/date-picker/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
