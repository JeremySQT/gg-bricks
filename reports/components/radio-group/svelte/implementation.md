# RadioGroup — Svelte implementation report

Component: `packages/svelte/src/components/radio-group/` (Svelte 5.57.1, Bits UI 2.19.3 `RadioGroup.Root`: radiogroup role, roving tab stop, arrow keys in both axes with wrapping, readonly, hidden input when `name` is set). Radio children: `packages/svelte/src/components/radio/` (declared dependency). Review page: `examples/radio-group/`; preview `dist/previews/radio-group.html`. Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `RadioGroup.svelte`: the Bits root with `data-size`, `orientation`, `loop`, the Field protocol (named by the field label, described by its texts) or `aria-label`. Context `ggb:radio-group` (string key) gives every Radio its size, readonly, invalid and disabled.
- Two completions of the primitive: (1) Bits UI selects on arrow keys only once a value exists; the group completes the first arrow press of a group without a selection by selecting the radio focus moved to. (2) Bits UI keeps the last focused radio as the tab stop after the application clears the value; keyboard focus entering the group is moved to the selected radio, or to the first enabled radio when none is selected (a pointer press is left alone).
- `radio-group.css`: column with `verticalGap`; horizontal row that wraps, `verticalGap` between lines and `horizontalGap` between radios.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| One choice, no way back to none; value matching no radio selects none | Bits | browser |
| Name from Field or label prop; invalid, required exposed | `aria-labelledby` / `aria-label`, `aria-invalid`, Bits `aria-required` | SSR; browser CDP |
| Size, readonly, invalid, disabled reach every radio | context | SSR |
| Vertical and horizontal layouts, wrapping in order | flex | browser gaps in 3 densities, narrow column order |
| One tab stop; entry on the selected or first enabled radio; arrows move, select and wrap; Space selects | Bits + the two completions | browser: Tab in and out, Shift+Tab back to the selected radio, all four arrows, wrap, Space, first arrow without a value |
| Readonly: arrows move without selecting; disabled group skipped; disabled radio skipped | Bits | browser |
| valueChange on user selection only | `onValueChange` | browser change count |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/radio-group.html` mounts from `file://` without errors.
- SSR: 4 tests (`radio-group.test.ts`, shared with Radio). Browser: 7 tests. `computed.json`: group gaps in 18 contexts (36 records); the radio colors are in `reports/components/radio/svelte/computed.json`.

## Fixed during implementation

- Tab entry after the application cleared the value landed on the last focused radio (found by the keyboard test): entry is now redirected as above.

## Limitations

- Home and End also move focus (Bits UI behavior, as in the WAI-ARIA pattern); the contract does not name them.
- Before hydration every radio of a group without a value is a tab stop (Bits UI server markup).
- Only Chromium is automated.

## Review round 1 (2026-10-27)

- Radios redrawn in SVG (see `reports/components/radio/svelte/implementation.md`).
