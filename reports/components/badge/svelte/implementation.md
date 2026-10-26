# Badge — Svelte implementation report

Component: `packages/svelte/src/components/badge/` (Svelte 5.57.1; no Bits UI primitive: a badge is static text with no native semantics to borrow). Review page: `examples/badge/`; self-contained preview: `dist/previews/badge.html` (`npm run build:preview badge`). Implemented on 2026-10-17 against contract digest `b6d1402d…`, as re-recorded after the simplification and the accent intent at the contract gate of 2026-10-17; implementation approval pending (grouped implementation gate with IconButton and Link).

Amended on 2026-10-17 after the user's review ("les lettres qui descendent sont masquées/coupées par le container du badge"): the label was clipped in both directions (`overflow: clip`) and relied on `overflow-clip-margin: 0.3em` to keep the descenders below the cap-trimmed box. Safari does not support `overflow-clip-margin`, so it cut g, p and y at the baseline; Chromium hid the defect. The label is now clipped in the inline direction only (`overflow-x: clip; overflow-y: visible`), which is all the ellipsis needs, so no browser can cut the descenders. Simulated on the adjustment page (`examples/link-badge-review`, "Before" with `overflow: hidden`); the browser test now asserts the clip axes. Not verified in WebKit (not installed in this environment).

## Structure

- `Badge.svelte`: one `<span class="ggb-badge" data-intent data-appearance data-size>`, which is the container part, holding an optional `ggb-badge__leading` (`aria-hidden`, renders the `leading` snippet) and `ggb-badge__label` (the text). No role, no `aria-*`, no `tabindex`: the label is read where it stands. Native attributes pass through; `class` merged; `ref` bindable.
- `types.ts`: `BadgeProps` extends the native span attributes minus `children`, `role` and `tabindex`; `label` (required), `intent`, `appearance`, `size`, `leading`, `ref`.
- `badge.css`: structure only. `block-size: 1lh` fixes the box at the line box of the indicator typography, so an icon taller than the capitals never grows it; `min-inline-size: 1lh`; cap-height centering as in Counter (`text-box: trim-both cap alphabetic` on the label and a symmetric `padding-block` of (1lh − 1cap) / 2, under `@supports`). Subtle draws its edge as an inset `box-shadow` in `border`; strong swaps the custom properties to the strong roles and makes the edge transparent. The label truncates with `text-overflow: ellipsis` (the full text stays in the DOM); the leading icon never shrinks.
- `contract.generated.ts`, `tokens.generated.css`: generated (six color roles per intent, typography per size, radius, padding, gap, icon size, border width).

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| leading then label; label required and read as plain text | markup order; label text node; error on a blank label | SSR; browser (CDP): text `Paid`, no role other than generic and text, icon not exposed |
| intent families neutral, accent, info, success, warning, danger | `data-intent` → `color.status.{intent}.*` | SSR: 36 combinations; browser: 6 intents in 18 contexts |
| subtle: surface, inset border, content, icon color; strong: strong surface, no visible border, strong content for label and icon | custom properties per appearance | browser: background, color, icon color and shadow for 36 combinations in 18 contexts |
| Indicator typography, one line, truncated with an ellipsis, icon whole, full text available | `font: var(--ggb-badge-typography)`, `white-space: nowrap`, ellipsis on the label, `flex: none` on the icon | browser: truncated at 3, 5 and 8 em without overflowing the cell, icon 12 × 12, accessibility tree reads the full label |
| Block size = line box; cap-height centering; inline padding; min inline size = block size; radius | `block-size: 1lh`, `padding-inline`, `min-inline-size: 1lh`, `text-box` trim | browser: heights 15.4 / 16.8 / 19.6 px in 3 densities, same height and top as the Counter on the same line, radius per brand |
| Leading icon at iconSize, optical placement, leadingGap | svg sized to `size.icon.xs`, `margin-inline: -iconSize/8` (both sides, as in Button; amended on 2026-10-20), `margin-inline-end: leadingGap` | browser: icon box starts 2.5 px from the edge at standard (4 − 12/8) and ends 2.5 px before the label, gap = `space.content.xs` |
| Sizes like Button; typography, icon and height fixed across densities, padding follows | tokens | browser: 3 densities |
| Not interactive | no handlers, no role, no tabindex | browser: tabIndex −1, Tab skips badges |
| Forced colors: edge of borderWidth in the system text color, label in the system text color | transparent 1 px outline always present, `outline-color: CanvasText` and `color: CanvasText` | browser: outline 1 px solid in the text color, subtle and strong |

## Checks (2026-10-17)

- `npm run verify`: passed. SSR: 5 Badge tests (`ssr.json`).
- Browser (Chromium 141): 6 Badge tests: text and roles through the accessibility tree and focus, geometry in 3 densities with the Counter alignment and the icon placement, truncation, computed values in 18 contexts, motion and forced colors, axe WCAG 2.0/2.1/2.2 A and AA in light and dark plus 390 px. Full suite: 61 passed.
- Computed values: `computed.json`, 12 312 records: 6 intents × 2 appearances × 3 sizes with a leading icon, in the 18 contexts (colors, edge, radius, padding, font, geometry, icon color, size, offset, gap and distance to the label).
- Contrast: subtle content on surface and strong content on strong surface for the six intents pass 4.5:1 in the 18 contexts (inventory pairs, `reports/tokens/contrast.json`; component report `reports/components/badge/contrast.json`, edges informational as decided at the contract gate).
- Preview: `dist/previews/badge.html` (1 439 kB) mounts from `file://` without errors.

## Test adjustments made while implementing (new tests, before their first pass)

- Truncation: the first draft expected the long label not to truncate at a 12 em cell; at 12 px the label plus icon and padding is wider than 12 em, so it truncates there too. The test now asserts truncation at 3, 5 and 8 em and no truncation for an ordinary badge. The code was right.

## Limitations

- Only Chromium is automated; Firefox, Safari and screen readers were not tested. Cap-height centering needs `text-box` (supported by the tested Chromium); elsewhere the line box is centered.
- The inline padding is `space.content.xs` (2 / 4 / 6 px): compact badges are tight around their text. Observation for the reviewer; the value follows the approved contract.
- Live announcements when a status changes belong to the integration.
