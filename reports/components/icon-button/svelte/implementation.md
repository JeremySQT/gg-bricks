# IconButton — Svelte implementation report

Component: `packages/svelte/src/components/icon-button/` (Svelte 5.57.1, Bits UI 2.19.3 `Button.Root`). Review page: `examples/icon-button/`; self-contained preview: `dist/previews/icon-button.html` (`npm run build:preview icon-button`). Implemented on 2026-10-17 against contract digest `b9298af0…` (approved at the grouped contract gate of 2026-10-16); implementation approval pending (grouped implementation gate with Link and Badge).

## Structure

- `IconButton.svelte`: Bits UI `Button.Root` renders `<button type="button">`, or `<a href>` when `href` is set (disabled removes the href and the tab stop). Root `ggb-icon-button` with `data-intent`, `data-appearance`, `data-size`, `data-disabled?`, `data-loading?`, `aria-label` (the required label), `aria-busy` while loading and not disabled, `aria-disabled` while blocked. Inside: `ggb-icon-button__container` (the visible square) holding `ggb-icon-button__icon` (`aria-hidden`, renders the `icon` snippet) or, while loading, `ggb-icon-button__loadingIndicator` in its place. The click and auxclick guards are those of Button: a blocked control cancels activation, submission and navigation.
- `types.ts`: `IconButtonAsButton | IconButtonAsLink`, like Button; `label` and `icon` required; `aria-label`, `children`, `href`, `type`, `disabled`, `role`, `aria-busy`, `aria-disabled` owned.
- `icon-button.css`: structure only, duplicated from the Button patterns rather than imported, so the folder stays copyable (declared dependency: `icon`). The root is a square of `boxSize`; a centered `::before` extends the hit area to `max(100%, minTarget)` in both dimensions (Button extends only the width, its height already reaches 44 px). The container fills the root. Interaction state through `--_surface`, `--_content`, `--_border` in the contract precedence (hover < pressed < loading < disabled), `:hover` inside `@media (hover: hover)`.
- `contract.generated.ts`, `tokens.generated.css`: generated (`--ggb-icon-button-{surface,content,border}-{state}` per intent × appearance, `boxSize`, `iconSize` per size, radius, border, focus and motion roles).

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| Square of boxSize; one icon centered at iconSize in the content color; host size replaces the icon's | `inline-size`/`block-size: var(--ggb-icon-button-boxSize)`, `flex: none`; grid centering; `.ggb-icon-button__icon > svg` sized to `iconSize` | browser: width = height = `size.control.{size}` and icon = `size.icon.{size}` in 3 densities, icon center within 0.5 px of the box center |
| label is the accessible name, never visible; icon hidden; no native tooltip | `aria-label`, icon wrapper `aria-hidden`, no text node, no `title` | SSR: no text, owned aria-label; browser (CDP): role button / link, name = label, no exposed descendant |
| Target meets minTarget without enlarging the box | `::before` of `max(100%, 44px)` centered | browser: points 21 px from the center hit the control for sm (32 px), md and lg |
| State precedence disabled, loading, pressed, hover, default | CSS order and data attributes | browser: colors of every state in 4 representative contexts |
| activate only when neither disabled nor loading; never navigates then | Button's click and auxclick guards | browser: pointer, Enter, Space; blocked while loading and disabled; loading link does not navigate |
| href → link, else button; same appearance | Bits UI `Button.Root` | SSR and browser (CDP role link) |
| Disabled leaves the tab order; loading keeps focus, busy, label | native `disabled` / no href + `tabindex=-1`; `aria-busy` | browser: focus kept while loading, name unchanged |
| loadingIndicator replaces the icon in place; same size | `{#if loading}` swaps the icon wrapper for the spinner, same `iconSize` | browser: box and glyph sizes identical before and while loading |
| Border only for outline, inside | inset `box-shadow` on the container | browser: shadow per appearance in 18 contexts |
| Focus ring of focusWidth/focusColor at focusOffset, concentric | `outline` on the container under `:focus-visible` | browser: outline in 4 contexts × 9 treatments |
| Transitions over motionDuration with easingStandard; none under reduced motion; spinner slowed | as Button | browser: 0.1 s (motion.duration.fast) cubic-bezier(0.4, 0, 0.2, 1), 0 s reduced, spinner 2.4 s |
| Same treatments as Button | same token paths | browser: same height and top as the Button beside it, sm, md, lg, 3 densities |
| Forced colors: boundary, ButtonText icon, focus visible | transparent 1 px outline drawn by the system; `color: ButtonText`; Highlight focus | browser: 1 px outline, 2 px focus ring under forced colors |

## Checks (2026-10-17)

- `npm run verify`: passed (generate, lint, validate, 40 unit tests, svelte-check, 38 SSR tests, build, docs build).
- SSR: 6 IconButton tests (`ssr.json`).
- Browser (Chromium 141, `reports/browser-results.json`): 7 IconButton tests: accessible name and role through the accessibility tree, activation and forms, loading/disabled/link guards and the async case, geometry and 44 px targets in 3 densities, computed values, motion and forced colors, axe WCAG 2.0/2.1/2.2 A and AA in light and dark plus a 390 px viewport without horizontal overflow. Full suite: 61 passed.
- Computed values: `computed.json`, 7 992 records: 27 intent × appearance × size in the 18 contexts (default state) and hover, pressed, focus, loading and disabled for the 9 treatments in base-light-standard, base-dark-standard, brick-light-compact and orchid-dark-comfortable; content, glyph color, surface, border shadow, outline, radius, box and icon geometry. All match the resolved tokens.
- Preview: `dist/previews/icon-button.html` (1 469 kB) mounts from `file://` without errors.

## Test adjustments made while implementing (new tests, before their first pass)

- The 44 px target was first probed on a matrix control; its neighbour 12 px below covers the overlap (later siblings paint their target on top), so the probe hit the neighbour. The probe now uses the isolated playground control at each size. The assertion is unchanged (21 px from the center in four directions); the code was right.
- SSR: the anatomy regex now allows the hydration marker Svelte writes between the container and the icon wrapper.

## Limitations

- Only Chromium is automated; Firefox, Safari and screen readers were not tested.
- Targets of adjacent sm or md icon buttons overlap when they are closer than 44 px (toolbars, table rows); the later one wins the overlap. WCAG 2.5.8 is met by the spacing exception only when the 24 px circles do not intersect; a toolbar of sm icon buttons with a `space.content.xs` gap meets it, as the review page shows, but this is the integration's spacing.
- No tooltip: Tooltip (wave 3) will be composed by the integration to show the label on hover and focus.
