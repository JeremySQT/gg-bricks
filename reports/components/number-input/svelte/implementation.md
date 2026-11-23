# NumberInput — Svelte implementation report

Component: `packages/svelte/src/components/number-input/` (Svelte 5.57.1, Bits UI not used (no number input in Bits UI 2.19.3)). Dependencies: none. Review page: `examples/number-input/`; preview `dist/previews/number-input.html`. Implemented on 2026-11-23 (wave 6).

## Notes

- Text input with inputmode numeric, decimal or text (a minus sign needs the full keyboard), exposed as a spin button (aria-valuenow, -valuemin, -valuemax, -valuetext); the visible text is formatted for the locale outside editing and read back on commit (Enter, blur) by `number.ts` (Intl.NumberFormat formatToParts for the separators, the locale's digits accepted).
- Steppers are buttons outside the tab order (tabindex -1) whose pointerdown keeps focus in the input; each is a square as tall as the field with the visible box (::after, size.control.nested) and the 44 px target (::before) centered.
- Stepping computes in integers of the finest decimal (0.2 + 0.1 = 0.3) and goes to the next multiple of step counted from min (or zero); commits clamp to min and max; typed values are not snapped.
- Up and Down Arrow: one step; Shift+Up/Down and Page Up/Down: ten steps; Home/End: min/max when given. The mouse wheel changes nothing (text input).
- The consumer's onkeydown, oninput and onblur run before the component's handlers.
- Hidden input with the plain decimal (period, no grouping) when name is given.

## Decisions taken during implementation

- Contract amendment recorded in pendingChanges: the spacing rule is stated as for the InputText action (stepper centered in a square as tall as the field at its edge); role slotInline removed.
- Shift+arrows by ten steps (user at the contract gate).

## Checks (2026-11-23)

- `npm run verify`: passed (generate, lint, validate, unit tests, svelte-check 0 errors, SSR, build, docs build); `check:approvals` 0 errors (contract amendments recorded in pendingChanges are warnings until the gate).
- Tests: `number-input-number.test.ts (unit)`, `tests/ssr/number-input.test.ts`, `tests/browser/number-input.spec.ts`.
- Browser (Chromium), also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): see the status checks.
- Evidence: `reports/components/number-input/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
