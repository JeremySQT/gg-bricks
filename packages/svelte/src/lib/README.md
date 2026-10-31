# Shared modules

Copyable modules shared by several components (decision of 2026-10-31, `authoring/decisions.md`, Overlays, composition and shared code). A component folder stays self-contained together with the modules its status lists under `dependencies` (`lib/<module>`); a consumer who copies a component copies those folders too. Each module is plain TypeScript or CSS with no import outside `src/lib/`, so that it can be copied on its own.

| Module     | Content                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overlay/` | The browser top layer for ggbrick overlays: `floating` (an attachment for `popover` elements anchored to a trigger), `modal` (an attachment for `<dialog>`), `overlay.css` (reset, anchor positioning, entry and exit motion, backdrop). |
