# Checkbox — Svelte implementation report

Component: `packages/svelte/src/components/checkbox/` (Svelte 5.57.1, Bits UI 2.19.3 `Checkbox.Root`: a button with the checkbox role, Space toggles, Enter does not, readonly blocks activation, a hidden input when `name` is set). Review page: `examples/checkbox/`; preview `dist/previews/checkbox.html`. Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `Checkbox.svelte`: the container is a `<label class="ggb-checkbox" data-size data-selection …>`, so a press on the box, the label, the description or the target extension activates the control; the control is named by `aria-labelledby` (the label span) and described by the description span (plus the Field's ids). The mark is an inline Phosphor glyph, bold weight (check, or minus for indeterminate), drawn at the box size. Inside a Field the checkbox wraps itself in `role="group"` named by the field label. Other attributes go to the control.
- `checkbox.css`: two-level custom properties: each condition (hover, invalid, readonly, disabled, in that order, same specificity through `:where()`) sets the off and on colors; the selection then picks one set. The box is centered on the first line with `margin-block-start: (1lh − boxSize) / 2`. Hidden label: visually hidden text and a 44 × 44 target around the box.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| control, label, description; label required, name and description | label container, `aria-labelledby`, `aria-describedby` | SSR; browser CDP; hidden label still the name |
| Box size, radius, border, first-line centering | tokens, `1lh` | browser: size.choice in 3 densities, first-line offset ≤ 0.5 px, long label |
| Mark check / bar, indeterminate wins | Bits snippet props | SSR glyphs, aria-checked mixed |
| Activation and indeterminate → checked | Bits | browser: box, label, description, Space, not Enter, indeterminate, select all |
| Condition precedence; readonly, disabled, invalid colors | custom properties | browser: 4 conditions × 3 selections × 3 sizes in 18 contexts, hover in 4 contexts (hover never overrides invalid) |
| 44 px target | `::before` | browser: hidden-label probes |
| Keyboard focus ring, concentric | outline on the box | browser ring values in 4 contexts |
| Forced colors | system colors, Highlight when on | browser |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/checkbox.html` mounts from `file://` without errors.
- SSR: 4 Checkbox tests. Browser: 7 Checkbox tests. `computed.json`: 7 968 records.

## Test notes (new tests, before their first pass)

- Chromium does not expose `readonly` for the checkbox role in its accessibility tree; the test asserts `aria-readonly="true"` instead.
- axe flagged the contrast of a disabled checkbox's description: text of an inactive component is exempt (WCAG 1.4.3), and axe recognizes it for `aria-labelledby` but not for `aria-describedby`. The shared audit (`tests/browser/helpers.ts`) skips color-contrast results inside a component marked `data-disabled`; every other violation fails. To confirm at the gate.

## Limitations

- Only Chromium is automated; screen readers were not tested.

## Review round 1 (2026-10-27)

- The empty box border follows the lighter field border (neutral.450 in light, 3.43:1).
