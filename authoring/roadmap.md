# Roadmap

Validated by the user on 2026-09-25 (waves), amended for the foundations-first order and the Button rebuild. Update the "State" columns when a task starts or finishes; this file is how a fresh session knows where the project stands.

## Phase 1: the design system

| Task                                                                           | Skill                  | Gate                                   | State                                                 |
| ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------- | ----------------------------------------------------- |
| 0 · Foundations: generous primitives, full semantic inventory, Figma variables | `ggb-foundations`      | Foundations review                     | Done: approved 2026-09-26 (JeremySQT/design-system#1) |
| 1 · Wave 1 components                                                          | `ggb-component`        | Contract, implementation, Figma parity | In progress: Button contract (gate pending)           |
| 2 · Wave 2 … 6                                                                 | `ggb-component`        | Same                                   | Not started                                           |
| 3 · Documentation site `apps/docs` (Astro + Starlight, docs.ggbrick.design)    | dedicated task         | Site review                            | Not started; start once wave 1 is documented          |
| 4 · Marketing site `apps/site` (Astro, ggbrick.design)                         | dedicated task         | Site review                            | Not started                                           |
| 5 · First release (package, Figma library, docs)                               | `ggb-maintain` Deliver | Delivery approval                      | Not started                                           |

## Phase 2: customization

| Task                                                     | Notes                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Theme builder (`apps/theme-builder`)                     | Web form producing a brand overlay (`foundations/tokens/<brand>/…` + config entry) and a preview |
| Figma import (`apps/figma-plugin` and/or a Claude skill) | Applies an overlay through the token manifest and the variable sync scripts                      |

## Component waves

Each wave passes the three creation gates together (all contracts, then one interactive implementation review, then Figma parity), followed by documentation. A single component can also be requested on its own: it then follows the same gates alone. Dependencies come before dependents. Names remain proposals until each contract is reviewed; see `component-catalog.md` for scope notes.

| Wave                          | Components                                                                                                             | Notes                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 · Actions and small content | Button, Icon, IconButton, Link, Badge, Counter, Shortcut                                                               | Button first: it fixes the pattern (contract, Figma, Svelte, docs) that the others follow. Icon/Counter/Shortcut are Button's slot contents |
| 2 · Form foundations          | Field, InputText, Textarea, Checkbox, Switch, RadioGroup                                                               | Uses the field, validation and readonly semantic families defined in the foundations                                                        |
| 3 · Feedback and overlays     | Spinner, Progress, Skeleton, Alert, Toast, Tooltip, Popover, Dialog, Menu                                              | Uses elevation, motion and layer tokens; Popover and Dialog are dependencies of wave 4                                                      |
| 4 · Choice and navigation     | Select, Combobox, Tabs, Breadcrumb, Pagination, Accordion                                                              | Built on wave 2 fields and wave 3 surfaces                                                                                                  |
| 5 · Data and structure        | Avatar, DataField, Divider, Table                                                                                      | Table starts as a semantic table                                                                                                            |
| 6 · Complex inputs            | DatePicker, TimeInput, NumberInput, Slider                                                                             | Each needs its own scoping decision (locale, data model) before its contract                                                                |
| Later                         | FileUpload, MultiSelect, TreeView, SegmentedControl, DateRangePicker, Drawer, Sidebar, NavigationRail, DataGrid, Chart | On product demand                                                                                                                           |

Composition patterns (toolbar, form section, action group, empty state, page header, card, app shell, bulk actions) are documented as examples, not components, unless repeated behavior justifies promotion.

## Component progress

One row per component once its scope phase starts. Phase values: scope, contract, implementation, figma, documentation, done; append "(gate pending)" while waiting for the reviewer.

| Component | Family  | Wave | Phase                   | Status file                             |
| --------- | ------- | ---- | ----------------------- | --------------------------------------- |
| Button    | actions | 1    | contract (gate pending) | `components/actions/button/status.json` |

## How a fresh session starts a task

1. Read `AGENTS.md`, this file, `decisions.md` and the relevant status file.
2. Check prerequisites: a component needs `foundations/status.json` with approved primitives and semantic tokens; a wave-N component needs its declared dependencies to have passed their implementation gate.
3. Run the skill. Stop at the gate with the complete review material. When a task starts, passes a gate or finishes, update its status file, the task's State cell (`In progress: <phase>`, `Done`) and the component progress row.
