# Button implementation evidence

Date: 2026-09-24. Implementation target: Svelte 5.57.1, Bits UI 2.19.3, TypeScript 6.0.3. Reference design: Figma file vytcT4Uq6pdroelPdNLFcR, public Button 11:74; base accent solid context 11:2 was read with get_design_context and its screenshot. Existing repository token sources and contract determine options and numeric values. No Figma files were modified during this implementation.

## Delivered

- `packages/svelte`: local installable source package with Button, generated types/CSS bindings, tokens, contract and local consumer documentation.
- `examples/button`: runnable interactive review page with brand/theme/density selectors and behavior examples.
- `dist/previews/button.html`: self-contained production preview, including fonts, verified through a local file URL.
- `dist/ds-reference-svelte-0.1.0.tgz`: local installation artifact; no registry publication.

## Checks and outcomes

| Check | Result |
| --- | --- |
| Clean lockfile installation in an isolated directory | Passed, 70 packages installed |
| Svelte/TypeScript diagnostics | 0 errors, 0 warnings |
| Existing contract/resolver suite | 13 passed |
| Token generation and existing contrast checks | 18 contexts, 2,088 contrast checks, no failures; disabled values informational |
| Production Vite build | Passed |
| Browser behavior suite | 8 passed in Chromium; see browser-results.json |
| Computed style parity | 162 rendered combinations covering 18 brand/theme/density contexts and nine intent/appearance pairs; content, slot inheritance, surface, radius, padding and visible height checked against JSON |
| Loading/disabled | Focus, accessible name and dimensions retained during loading; activation/form submission/navigation blocked; combined state retains spinner |
| Keyboard/native semantics | Enter/Space activation, link Enter navigation, explicit submit, default non-submit and native required validation passed |
| Responsive/minimum target | 44px minimum target checked for each size and density; 390px page has no horizontal overflow |
| Reduced motion / forced colors | Static busy indicator and visible system contour checked |
| Axe | No violations for the selected WCAG A/AA rules on light and dark example pages |
| SSR | Default, loading, disabled link and empty-label rejection passed; see ssr.json |
| Visual inspection | Light/dark desktop and narrow-screen captures reviewed; no clipping or missing slot foreground |
| Package consumption | Tarball installed in a separate project; example compiled through the package's public imports |
| Standalone preview | Loaded through file URL; activation and theme selection passed without page errors |

The normal Playwright browser download was unavailable in this execution environment. Tests used a locally extracted Chromium binary from the @sparticuz/chromium npm package, selected through PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. That runtime is not part of the DS dependencies. The checked-in tests use normal Playwright Chromium by default. Firefox and WebKit were not executed.

## Architecture boundaries

The JSON contract is unchanged. CSS aliases are generated from its token mappings; no Figma-only collections or context variables are exported. Native root / visible surface / content row correspond to actual hit-target and layout responsibilities. Slot foreground uses ordinary color inheritance and currentColor. Bits UI supplies the native button/anchor primitive; the DS adds loading guards, its anatomy and styles.

The browser focus indicator is outside the visible surface and uses existing focus tokens. Outline uses an inset box shadow without affecting ordinary dimensions. Forced-colors mode uses a real system-color border and can differ slightly in geometry. The spinner's 900ms rotation belongs to this implementation, with reduced-motion support, not to the shared token contract.

## Limits and review items

- Svelte snippets cannot statically enforce component identity or internal DOM cardinality. Allowed slot contents are documented; no strict allowlist guarantee is claimed.
- Icon, Counter and Shortcut are example content, not independently released components with complete dependency contracts.
- The stylesheet requires all three theme attributes on one ancestor; nested context overrides repeat them. This is the current exporter behavior, not a new token axis.
- Figma fixture properties still need to be exposed from the public Button. They were deliberately not changed during the Svelte task.
- The demo is a review page, not the final documentation platform. Its narrow-screen matrix hides decorative slots; Button itself has no viewport-driven variant.
- Assistive-technology testing, additional browser engines, final visual/delivery approval, Figma publishing and public package/documentation distribution remain open. Automated checks do not establish full accessibility conformance.

Official primitive reference consulted: https://www.bits-ui.com/docs/components/button . Installed package source was also inspected before implementation. The full local guide is documentation/components/button.md; authoring agents must not reproduce Figma adapter scaffolding in later code components.
