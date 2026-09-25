# Roadmap

Status: **proposal awaiting user validation** (2026-09-25). Once validated, this file becomes the authoritative order of work; update it when a wave starts or finishes. Names remain proposals until each contract is reviewed; see [the component catalog](component-catalog.md) for scope notes.

## Products

| Product | Location | State |
| --- | --- | --- |
| Token sources and generated outputs | `foundations/`, `packages/tokens` | Established |
| Svelte component package | `packages/svelte` | Button reference done; catalog in progress |
| Figma library | External file (see Button status) | Button reference done; library publication open |
| Consumer documentation (local, shipped with the package) | `documentation/` | Established for Button |
| Documentation site | `apps/docs` (proposed: Astro + Starlight, content read from `documentation/`) | Not started |
| Marketing site | `apps/site` (proposed: Astro) | Not started |
| Theme builder (web form producing a brand overlay) | `apps/theme-builder` | Not started |
| Figma plugin / Claude skill importing a brand overlay | `apps/figma-plugin`, `authoring/skills/` | Not started; adapter scripts exist |
| Copy-paste registry (shadcn-svelte style) | Generated from `packages/svelte` | Proposed for after wave 2 |

The theme builder's output format is already defined by the architecture: a sparse brand overlay (`foundations/tokens/<brand>/…` mirroring base file and token names) plus one entry in `foundations/config.json`. No new customization format is needed; the same overlay drives CSS, the Figma manifest and documentation contexts.

## Component waves

Each wave passes the three creation gates together (contract review for all its components, then Figma design review, then interactive implementation review), followed by documentation. Foundations that a wave needs (new semantic tokens) are proposed with its contracts. Dependencies come before dependents.

| Wave | Components | Why this order |
| --- | --- | --- |
| 0 (done) | Button | Reference format |
| 1 · Small content and actions | Icon, Counter, Badge, Shortcut, IconButton, Link | Button's fixtures become real dependencies; IconButton and Link reuse Button tokens |
| 2 · Form foundations | Field, InputText, Textarea, Checkbox, Switch, RadioGroup | Introduces the `color.field.*`, validation and readonly token families used by every later input |
| 3 · Feedback and overlays | Spinner, Progress, Skeleton, Alert, Toast, Tooltip, Popover, Dialog, Menu | Introduces elevation, motion and layer tokens; Popover and Dialog are dependencies of wave 4 |
| 4 · Choice and navigation | Select, Combobox, Tabs, Breadcrumb, Pagination, Accordion | Built on wave 2 fields and wave 3 surfaces |
| 5 · Data and structure | Avatar, DataField, Divider, Table | Display-only components; Table starts as a semantic table |
| 6 · Complex inputs | DatePicker, TimeInput, NumberInput, Slider | Each needs its own scoping decision (locale, data model) before its contract |
| Later | FileUpload, MultiSelect, TreeView, SegmentedControl, DateRangePicker, Drawer, Sidebar, NavigationRail, DataGrid, Chart | Only on product demand |

Composition patterns (toolbar, form section, action group, empty state, page header, card, app shell, bulk actions) are documented as examples, not components, unless repeated behavior justifies promotion.

## Foundations to settle before or during wave 1

- Full semantic color inventory beyond actions: surfaces, borders, text hierarchy, field states, status colors (info, success, warning, danger), overlays.
- Elevation (`shadow.*`), motion (`motion.duration.*`, `motion.easing.*`) and layer (`z.*`) token families; empty files are still not created ahead of need.
- Typography scale beyond `typography.label.*`: body, heading, code.
- Icon strategy: the icon set, licensing and how `Icon` consumes it.

## Order of the next tasks

1. Validate this roadmap and answer the open questions in `decisions.md` (name, distribution model, Figma operating mode, license).
2. Wave 1 contracts and foundations proposal → contract gate.
3. Wave 1 Figma → design gate. Wave 1 Svelte + examples + tests → implementation gate. Documentation.
4. Documentation site scaffold (Astro + Starlight) once two or more components are documented.
5. Continue waves. Registry, theme builder and Figma plugin follow the first stable release.
