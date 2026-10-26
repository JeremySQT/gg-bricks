# Radio — Svelte implementation report

Component: `packages/svelte/src/components/radio/` (Svelte 5.57.1, Bits UI 2.19.3 `RadioGroup.Item`: a button with the radio role). Usable only inside a RadioGroup; reviewed on `examples/radio-group/` (preview `dist/previews/radio-group.html`). Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `Radio.svelte`: a `<label class="ggb-radio">` container (whole-row target) with the item, its dot (`ggb-radio__mark`, 3/8 of the box) and the text; named by `aria-labelledby`, described by its description. Size, readonly and invalid come from the `ggb:radio-group` context; a Radio outside a group throws.
- `radio.css`: the Checkbox structure with a circle; the size is a state, so per-size custom properties are chosen from `data-size`; selection read from the item's `data-state` through `:has()`.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| Only inside a RadioGroup; inherits size, readonly, invalid; own or group disabled | context | SSR, including the rejection outside a group |
| Name and description | `aria-labelledby`, `aria-describedby` | SSR; browser CDP |
| Circle, dot, first-line centering, gap | tokens, `1lh` | browser 3 sizes × 3 densities |
| Pointer selects, never deselects | Bits | browser |
| Colors and precedence | two-level custom properties | browser: 4 conditions × 2 selections × 3 sizes in 18 contexts, hover in 4 contexts |
| Focus ring, motion, forced colors | CSS | browser |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/radio-group.html` mounts from `file://` without errors.
- Tests are in `tests/ssr/radio-group.test.ts` and `tests/browser/radio-group.spec.ts`. `computed.json`: 4 440 records.

## Limitations

- Only Chromium is automated.
