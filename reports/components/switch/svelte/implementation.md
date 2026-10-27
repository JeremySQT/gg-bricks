# Switch — Svelte implementation report

Component: `packages/svelte/src/components/switch/` (Svelte 5.57.1, Bits UI 2.19.3 `Switch.Root` and `Switch.Thumb`: a button with the switch role, a hidden input when `name` is set). Review page: `examples/switch/`; preview `dist/previews/switch.html`. Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `Switch.svelte`: a `<label class="ggb-switch">` container (whole-row target) with the track, the thumb and the text, in the order of `labelPosition`. Bits UI has no readonly switch: a readonly switch cancels the click and the Space/Enter keydown before the primitive (Bits stops on a prevented event) and sets `aria-readonly`.
- `switch.css`: track `2 × trackSize − 4 × borderWidth` wide, thumb `trackSize − 4 × borderWidth`, inset `2 × borderWidth`, moved with `inset-inline-start` (mirrors in right to left); same two-level condition and selection properties as Checkbox; `labelPosition: start` fills the row with the track at the end.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| No invalid or required | not in the API | SSR |
| Name and description; on/off exposed | `aria-labelledby`, `aria-describedby`, Bits `aria-checked` | browser CDP |
| labelPosition end / start | markup order; flex row filled at start | SSR order; browser: track at the row end |
| Track and thumb geometry, first-line centering | CSS from tokens | browser 3 sizes × 3 densities, right to left |
| Activation; readonly and disabled ignore | Bits plus readonly guard | browser: track, label, Space; readonly ignores click, label, Space and Enter and stays focusable |
| Condition precedence and colors | custom properties | browser: 3 conditions × 2 selections × 3 sizes in 18 contexts, hover in 4 contexts |
| Motion | `motion.duration.base`, none when reduced | browser |
| Forced colors | system colors | browser |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/switch.html` mounts from `file://` without errors.
- SSR: 3 Switch tests. Browser: 5 Switch tests. `computed.json`: 4 368 records.

## Limitations

- Enter also toggles (Bits UI behavior, allowed by the WAI-ARIA switch pattern); the contract names Space only.
- The off thumb uses the field placeholder color (a dark grey in light mode): to judge at the review.
- Only Chromium is automated.

## Review round 1 (2026-10-27)

- The thumb was off center by one device pixel at fractional display scales (reported by the user; reproduced at 125 %): a 2 px inset becomes 2.5 device pixels and the CSS boxes of the track and the thumb were snapped separately. The thumb is now an SVG circle (`cy: 50%`, `r`, `cx` from the inset) laid over the track, antialiased rather than snapped; `cx` transitions over the base duration and mirrors with `:dir(rtl)`. Checked at 125 % and in the browser tests (geometry, right to left after the transition settles).
- The off border follows the lighter field border (neutral.450 in light).
