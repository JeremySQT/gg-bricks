# Foundations

## Overview

Foundations are the tokens every ggbrick component is built on: color, typography, spacing and sizing, shape, elevation and motion. Use them in the parts of an application that ggbrick components do not cover (page layout, cards, custom content) so that the whole interface follows the same brand, appearance and density.

Each foundations page lists the roles of one family with what each role is for, followed by rules. Values depend on the context: the documentation site shows them next to each role for the selected brand, appearance and density, and `@ggbrick/tokens` ships them resolved for every context (`resolved/<brand>-<appearance>-<density>.json`).

## Token layers

| Layer     | Path                                                         | Use in an application                                                                                |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Role      | `color.surface.default`, `space.layout.md`, `radius.control` | Always. Roles carry an intent and follow brand, appearance and density.                              |
| Palette   | `color.palette.<ramp>.<step>`                                | Only for content no role describes (charts, illustrations). Follows the brand, not the appearance.   |
| Primitive | `primitive.*`                                                | Never. Primitives are the raw scales roles pick from; a brand or an appearance does not change them. |

Component tokens (`component.<id>.*`, `--ggb-component-<id>-…`: values that mean something for one component only, such as the track size of a switch) and the bindings a component generates from its contract (`--ggb-<id>-…`) belong to their component and are not part of the application API.

## In CSS

Import `tokens.css` once. Every token is a custom property named `--ggb-` followed by its path with dots replaced by dashes: `color.surface.default` is `var(--ggb-color-surface-default)`, `space.control.padding-inline.md` is `var(--ggb-space-control-padding-inline-md)`. Typography roles are `font` shorthands with companion properties (see [Typography](typography.md)).

```css
.panel {
  padding: var(--ggb-space-layout-md);
  border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
  border-radius: var(--ggb-radius-container);
  background: var(--ggb-color-surface-default);
  color: var(--ggb-color-content-primary);
  font: var(--ggb-typography-body-md);
}
```

## Context

Three attributes on one ancestor select the context; without them the document is `base`, `light` and `standard`.

| Axis       | Attribute             | What it changes                                                                               |
| ---------- | --------------------- | --------------------------------------------------------------------------------------------- |
| Brand      | `data-ggb-brand`      | The accent palette and the corner radii. Everything else is inherited from the base.          |
| Appearance | `data-ggb-appearance` | Color roles only: surfaces, content, borders, actions, fields, statuses, selection and focus. |
| Density    | `data-ggb-density`    | Spacing and control heights. Font sizes, icon sizes and the interaction target do not change. |

A subtree may change its appearance or its density alone (a dark panel, a compact toolbar). A subtree that changes brand restates appearance and density on the same element.

## Rules

- Use roles, not values: no hexadecimal colors, pixel spacings or font sizes in application styles. A value that no role covers is a question for the design system, not a local constant.
- Pick a role by intent, not by its current value. `color.surface.default` and `color.surface.canvas` are both white in the light appearance and differ in dark.
- Contrast is guaranteed only for the pairs a page lists (content role on its surfaces). Another combination may pass in one context and fail in another.
- Prefer a ggbrick component over rebuilding its look from roles: the component also brings states, focus, accessibility and tests.
- Do not shrink text for density and do not make interaction targets smaller than `size.target.min`.
