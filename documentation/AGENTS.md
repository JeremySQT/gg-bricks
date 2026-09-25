# Consumer entry point

You are working in an application that uses `@ggbrick/svelte`. Read `index.json`, then only the relevant sections of the component page you need. Prefer exported ggbrick components over rebuilding their appearance; the page's API section documents the actual Svelte API, the contract records platform-independent options and rules.

- Import `tokens.css` once and set `data-gg-brand`, `data-gg-appearance` and `data-gg-density` on one ancestor.
- Slot content inherits `color`; icons use `currentColor`. Snippets accept only the contents the page allows; the framework does not enforce this.
- Do not copy Figma internal structures, variant scaffolding or fixtures into application code.
- Components named as alternatives but absent from `index.json` are planned, not exports.
