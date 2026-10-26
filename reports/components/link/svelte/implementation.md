# Link — Svelte implementation report

Component: `packages/svelte/src/components/link/` (Svelte 5.57.1; no Bits UI primitive: a native anchor carries every semantic needed). Review page: `examples/link/`; self-contained preview: `dist/previews/link.html` (`npm run build:preview link`). Implemented on 2026-10-17 against contract digest `fbe2a0f3…` (approved at the grouped contract gate of 2026-10-17); implementation approval pending (grouped implementation gate with IconButton and Badge).

Amended on 2026-10-19 after the implementation review (variant D of the comparison page): the glyph and the file meta are a subtle complement in `color.content.tertiary` with the accent tone, so that only the underlined words read as the link; with tone inherit the meta keeps the context color and the glyph takes it at `opacity.muted`. The meta first used `color.content.secondary` on the comparison page; in dark it measured 1.12:1 against the link color and did not look attenuated (user remark), so both use `tertiary` (1.40:1 against the link). Contract roles added: `metaColor`, `indicatorColor`, `inheritIndicatorOpacity`. Forced colors keep everything in LinkText.

## Structure

- `Link.svelte`: one `<a class="ggb-link" data-tone data-destination href>`. Content in order: `ggb-link__label` (all words but the last), `ggb-link__tail` (`white-space: nowrap`) holding the last word in a second `ggb-link__label`, the `ggb-link__meta` text for files and the `ggb-link__indicator` glyph (`aria-hidden`), then a visually hidden `ggb-link__suffix` with the announced suffix in parentheses. The label is split only when meta or a glyph follows. External sets `target="_blank"` and merges `noopener noreferrer` into the consumer's `rel`. `target` is owned (the destination decides it); other native attributes pass through; `ref` is bindable.
- `destination.ts`: pure functions shared with the unit tests: `resolveDestination` (glyph, meta, suffix, new context), `normalizeFileType`, `splitLastWord`, and the default English `suffixes`.
- `glyphs.ts`: the 15 intrinsic glyphs, Phosphor Icons 2.1.1 regular (MIT), one path each, copied from `@phosphor-icons/core` (arrow-up-right, envelope, phone, printer, file, file-pdf, file-doc, file-xls, file-csv, file-ppt, file-txt, file-zip, file-image, file-audio, file-video).
- `link.css`: structure only. The underline is drawn on the label spans, not on the anchor: a decoration set on an ancestor propagates to every inline descendant and cannot be removed, so meta and glyph would be underlined. `box-decoration-break: clone` gives each line box its own corners and focus ring.
- `contract.generated.ts`, `tokens.generated.css`: generated (`--ggb-link-content`, underline widths, `indicatorGap`, focus roles).

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| Inline text; label, meta, indicator in order; font of the context | `font: inherit`; no typography role | browser: font size, weight and line height equal the parent's in body lg, md, sm, caption and heading |
| Destinations: page same context; external new context without opener; email, phone, file, print | `resolveDestination`; `target`/`rel` only for external | unit tests; SSR; browser: target and rel per destination, in-place navigation by click and Enter |
| Glyph per destination, one em, after indicatorGap, not underlined; indicatorColor (accent tone), context color at inheritIndicatorOpacity (inherit) | inline `svg` 1em × 1em, `margin-inline-start: indicatorGap`, `color: var(--ggb-link-indicatorColor)` and `fill: currentColor`; inherit: `color: inherit; opacity: var(--ggb-link-inheritIndicatorOpacity)`; centered on the cap height like Icon | browser: glyph = font size; gap = `space.content.xs` and fill = `color.content.tertiary` in 18 contexts; inherit: parent color at 0.7 |
| File glyphs by fileType ignoring case and a leading dot; generic otherwise | family table in `destination.ts` | unit tests for every listed type, upper case and dotted; browser: 11 distinct glyphs, epub and none generic |
| File meta (PDF, 2.4 MB): uppercase type, size as given, missing parts left out; metaColor (accent) or context color (inherit); part of the name; no download forced | `meta` built in `resolveDestination`; plain text node, `color: var(--ggb-link-metaColor)` or `inherit`; no `download` attribute | unit tests; browser: meta = `color.content.tertiary` in 18 contexts, parent color with tone inherit; (CDP) `Annual report (PDF, 2.4 MB)`, `Handbook (EPUB, 320 kB)`, `Attachment` |
| Name = label, meta, suffix; destinationLabel replaces the suffix | visually hidden suffix ` (…)` | browser (CDP) for the 6 destinations and 2 French suffixes |
| Underlined in every state; 1 px, 2 px on hover and press; color unchanged; visited same | `text-decoration` on the label spans; `:hover` (hover-capable devices) and `:active`; no `:visited` rule | browser: thickness 1 px → 2 px hover and pressed, same color, `transition-duration: 0s` |
| tone accent: link color; inherit: context color | `color: var(--ggb-link-content)` or `inherit` | browser: link color in 18 contexts; inherit equals the parent color on 4 status surfaces and the inverse surface |
| Wraps with the text; meta and glyph never start a line alone | last word, meta and glyph in a nowrap span | browser: glyph on the line of the last word at every column width from 8 to 30 em, 3 links |
| No disabled state | no disabled prop; `aria-disabled` owned | browser: every link on the page has an href and no aria-disabled |
| Focus ring around each line box, radius.indicator corners | `outline` + `border-radius` + `box-decoration-break: clone` under `:focus-visible` | browser: outline and radius in 18 contexts |
| No animation | no transition | browser: `transition-duration: 0s` |
| Forced colors: system link color, underline, focus ring | `color: LinkText` for both tones; Highlight focus | browser: color equals the LinkText probe, underline kept, outline solid |

## Checks (2026-10-17)

- `npm run verify`: passed. Unit tests: 7 `destination.ts` tests (`tests/link-destination.test.ts`). SSR: 6 Link tests (`ssr.json`).
- Browser (Chromium 141): 8 Link tests: destinations and accessible names through the accessibility tree, browsing contexts and navigation, file glyphs, typography and wrapping, underline states, computed values in 18 contexts, forced colors, axe WCAG 2.0/2.1/2.2 A and AA in light and dark plus 390 px. Full suite: 61 passed.
- Computed values: `computed.json`, 4 104 records: 6 destinations with tone accent, tone inherit on 5 colored surfaces and the focus ring, in the 18 contexts (color, decoration line, thickness and color, meta, glyph size, color and gap, outline, radius, font).
- Contrast: `color.content.link` measured by the inventory pairs on canvas, default, subtle, muted, raised and overlay: 4.80 to 11.19 after the dark amendment of 2026-10-17 (`reports/tokens/contrast.json`).
- Preview: `dist/previews/link.html` (1 440 kB) mounts from `file://` without errors.

## Test adjustments made while implementing (new tests, before their first pass)

- `splitLastWord('trailing space ')` was first expected to keep the whole label as its last word; the function splits before the last word and keeps the trailing space with it (`['trailing ', 'space ']`), which is the intended behavior. The test was wrong.
- Code fixes found by the tests: the space before the announced suffix and before the meta text was dropped by Svelte's whitespace handling at the start of an element; both are now written as template literals.

## Limitations

- Only Chromium is automated; Firefox, Safari and screen readers were not tested. The glyph is centered on the cap height with the `cap` unit; a browser without it falls back to `vertical-align: middle`.
- The suffix is announced as part of the name (WCAG 2.4.4 link purpose); some screen readers also announce "new window" for `target="_blank"`, which repeats the external suffix.
- The component does not check that email and phone links use `mailto:` and `tel:`; that is documented.
- English default suffixes; translation through `destinationLabel` per link.
- The meta in `color.content.tertiary` measures 3.42:1 on `color.surface.muted` in dark (below 4.5:1); the foundations do not pair tertiary content with that surface either. Use tone inherit there.
