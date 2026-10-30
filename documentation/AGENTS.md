# Consumer entry point

You are working in an application that uses `@ggbrick/svelte`. Read `index.json`, then only the relevant sections of the component page you need. Prefer exported ggbrick components over rebuilding their appearance; the page's API section documents the actual Svelte API, the contract records platform-independent options and rules.

For styles the components do not cover (page layout, cards, custom content), read the `foundations` entries of `index.json`: `foundations/overview.md` first, then the page of the family you style (color, typography, spacing, shape, elevation, motion). Use role tokens (`var(--ggb-color-surface-default)`, `var(--ggb-space-layout-md)`), never hard-coded values, palette steps for UI or primitives.

- Import `tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on one ancestor (without them: `base`, `light`, `standard`). A subtree may override `data-ggb-appearance` or `data-ggb-density` alone; a subtree that switches `data-ggb-brand` restates the other two on the same element.
- Slot content inherits `color`; icons use `currentColor`. Snippets accept only the contents the page allows; the framework does not enforce this.
- Do not copy Figma internal structures, variant scaffolding or fixtures into application code.
- This documentation and `contracts/` are the only reference for ggbrick components. The specification pages of the ggbrick Figma library (and any Figma Spec in it) are written for designers: never read them to learn a component. From Figma, read only the screens you implement, and map their ggbrick instances to the exported components.
- Components named as alternatives but absent from `index.json` are planned, not exports.
