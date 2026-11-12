# Select — Svelte implementation report

Component: `packages/svelte/src/components/select/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `lib/overlay`. Review page: `examples/select/`; preview `dist/previews/select.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 4).

## Notes

- Exports Select and the SelectOptionsRecord type.
- The trigger toggles the panel through popovertarget (exempt from light dismiss); keys open it through the open state.
- `name` submits the value through a hidden input.
- A press on the Field label activates the trigger, as for any button, and opens the list.

## Decisions taken during implementation

- Bits UI Select is not used: its content assumes its own portal and focus scope, and it unmounts when closed (no exit transition); as for Menu (decision of 2026-10-31), the component is written on the native auto popover with lib/overlay. Recorded for the implementation gate.
- The trigger is a button with the combobox role (WAI-ARIA select-only combobox): it keeps focus; the highlighted option is aria-activedescendant; presses in the panel never take focus.
- Options API: records (`options` prop) as the contract says; groups from consecutive records with the same group.

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/select.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/choice.test.ts`.

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).
