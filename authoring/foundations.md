# Foundations specification

The tokens (the foundations' base layer) are defined once, generously, before components. Semantic roles then pick from the primitives; unused primitives are expected and are not a defect. This document is the target inventory for the `ggb-foundations` skill. Exact values are proposed by that task and approved at the foundations gate; the structure below is settled.

## Files

```
foundations/tokens/config.json                       brands, appearances, densities, defaults (appearance, density)
foundations/tokens/base/primitives/
  colors.tokens.json        ramps: neutral + brand hues + status hues (see below)
  dimensions.tokens.json    spacing/size scale
  typography.tokens.json    families, sizes, line heights, weights, letter spacings
  borders.tokens.json       widths, radii
  shadows.tokens.json       elevation shadow levels
  motion.tokens.json        durations, easings
  opacity.tokens.json       opacity steps
  layers.tokens.json        z-index steps (type number)
foundations/tokens/base/semantic/
  common.tokens.json        mode-independent roles (radius, borders, focus, sizes, typography, motion, layers)
  appearance.light.tokens.json / appearance.dark.tokens.json     color roles
  density.compact|standard|comfortable.tokens.json               spacing and control sizes
foundations/tokens/base/components/<id>.tokens.json             only when a component needs its own justified tokens
foundations/tokens/<brand>/…                                    sparse overrides with identical file and token names
```

Empty files are not created. Every semantic file contains real definitions.

## Primitive inventory (targets)

| Family         | Path                                                                                                 | Target                                                                                                                                                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neutral ramp   | `primitive.color.neutral.{0…1000}`                                                                   | 13 steps (0, 50, 100 … 900, 950, 1000) for surfaces, borders and text                                                                                                                                                                                                                                               |
| Hue ramps      | `primitive.color.<hue>.{50…950}`                                                                     | **10 hues × 11 steps** (50, 100 … 900, 950): for example red, orange, amber, yellow, green, teal, cyan, blue, violet, pink. Generated deterministically in OKLCH with even lightness steps so that the same step index has comparable contrast across hues. A brand may add its own hue ramp with the same 11 steps |
| Alpha          | `primitive.color.alpha.{black,white}.{5…90}`                                                         | Transparent overlays for scrims, hover tints and disabled states                                                                                                                                                                                                                                                    |
| Dimensions     | `primitive.dimension.v{0,1,2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,56,64,80,96,128,160,192,256}` | px scale; used by spacing, sizes, radii, borders                                                                                                                                                                                                                                                                    |
| Radius         | `primitive.radius.{none,xs,sm,md,lg,xl,2xl,full}`                                                    | Aliases into dimensions plus `full`                                                                                                                                                                                                                                                                                 |
| Border width   | `primitive.border.{0,1,2,3,4}`                                                                       |                                                                                                                                                                                                                                                                                                                     |
| Font family    | `primitive.font.family.{sans,mono}`                                                                  | Inter and a monospace stack; brands may override                                                                                                                                                                                                                                                                    |
| Font weight    | `primitive.font.weight.{400,500,600,700}`                                                            |                                                                                                                                                                                                                                                                                                                     |
| Font size      | `primitive.font.size.{11,12,13,14,16,18,20,24,28,32,40,48,56,64}`                                    | px                                                                                                                                                                                                                                                                                                                  |
| Line height    | `primitive.font.lineHeight.{1,1.2,1.3,1.4,1.5,1.6}`                                                  | unitless (type number)                                                                                                                                                                                                                                                                                              |
| Letter spacing | `primitive.font.tracking.{tight,normal,wide}`                                                        | dimension                                                                                                                                                                                                                                                                                                           |
| Shadow         | `primitive.shadow.{1…5}`                                                                             | composed shadow lists                                                                                                                                                                                                                                                                                               |
| Duration       | `primitive.duration.{50,100,150,200,300,500,700}`                                                    | ms                                                                                                                                                                                                                                                                                                                  |
| Easing         | `primitive.easing.{linear,standard,emphasized,decelerate,accelerate}`                                | cubicBezier                                                                                                                                                                                                                                                                                                         |
| Opacity        | `primitive.opacity.{0,5,10,20,40,60,80,90,100}`                                                      | number                                                                                                                                                                                                                                                                                                              |
| Layer          | `primitive.layer.{base,raised,dropdown,sticky,overlay,modal,toast,tooltip}`                          | number                                                                                                                                                                                                                                                                                                              |

## Semantic inventory (targets)

Color roles (appearance files):

- `color.surface.{canvas,default,subtle,muted,raised,overlay,inverse,scrim}`
- `color.content.{primary,secondary,tertiary,disabled,inverse,link,onAccent}`
- `color.border.{default,subtle,strong,disabled,focus}`
- `color.action.{accent,neutral,danger}.{solid,outline,ghost}.{default,hover,pressed,loading,disabled}.{surface,content,border}`
- `color.field.{default,hover,focus,readonly,disabled,invalid}.{surface,content,border,placeholder}`
- `color.status.{info,success,warning,danger}.{surface,surfaceStrong,content,contentStrong,border,icon}`
- `color.selection.{surface,content}` and `color.focus.ring`

Mode-independent roles (common file):

- `radius.{control,container,overlay,full}`, `border.width.{default,strong}`, `focus.{width,offset}`
- `size.target.min`, `size.icon.{xs,sm,md,lg,xl}`, `size.avatar.{xs…xl}`
- `typography.{display,heading}.{xl…xs}`, `typography.body.{lg,md,sm}`, `typography.label.{lg,md,sm}`, `typography.code.{md,sm}` as composite typography tokens
- `shadow.{raised,overlay,modal}`, `motion.duration.{fast,base,slow}`, `motion.easing.{standard,emphasized,enter,exit}`, `layer.*` aliases
- `opacity.{disabled,scrim}`

Density roles (density files):

- `size.control.{sm,md,lg}`, `space.control.{padding-inline,padding-block,gap}.{sm,md,lg}`
- `space.content.{xs,sm,md,lg,xl}` (inside components) and `space.layout.{xs,sm,md,lg,xl,2xl}` (between blocks)

Every role must exist in every configured context after sparse overlays; `npm run build:tokens` enforces this once contracts reference them, and the foundations task adds a dedicated coverage check for the whole semantic inventory (`tooling/check-foundations.ts`, written by that task, driven by `foundations/tokens/inventory.json`).

`foundations/tokens/inventory.json` holds three lists: `roles` (`path`, `type`, and `axis`: common, appearance or density), `contrast` pairs (`content`, `surface`, `minimum`), which the check uses to write `reports/tokens/contrast.json`, and `invariants` (`equals`, `sum`): derived dimension roles that must equal the sum of other roles in every context. Pairs are explicit so that roles designed for a specific backdrop (`content.onAccent` on accent surfaces, status content on status surfaces) are tested where they are used.

## Figma variables

Four collections as generated by the manifest: Primitives (one mode, every primitive shared by all brands), Brand, Appearance and Density; the default mode of each collection follows the config defaults (base, light, standard), so a node without explicit modes matches a document without attributes. A primitive a brand overrides is emitted in Brand with one value per brand mode instead; component tokens (`foundations/tokens/*/components/<id>.tokens.json`) go to Brand under `component/<id>/…`. Typography roles become text styles; shadows become effect styles. Naming mirrors token paths with `/` separators. Variables are created or updated by ID-preserving sync; renames and removals are explicit migration steps.

## Brands shipped by default

- `base`: the neutral ggbrick look (blue accent, neutral slate).
- Two demonstration brands with sparse overrides (accent hue, radius, font) to prove the overlay model. Names are proposed by the foundations task.

## Tokens gate

Present: the palette (all ramps, light and dark surfaces, contrast tables for the declared pairs), the type scale, spacing and control sizes per density, shadows and motion, and the semantic role table with one example value per appearance. Provide `dist/previews/foundations.html` (a generated review page in `examples/foundations/`) so the user can inspect the result. On approval record `approvals.primitives` and `approvals.semantic` in `foundations/tokens/status.json` with the token file digests and set `phase: approved`. Figma variables are verified through the `ggb-figma` skill and recorded in `approvals.figmaVariables` whenever a Figma tool is available; components do not wait for it.
