# Component catalog — planning proposal

This catalog organizes future scope; it does not authorize implementation or promise exports. Only Button has an implemented reference in this kit. Names and boundaries below are proposals until each contract is reviewed. Do not create empty component folders or placeholder contracts for these candidates.

## Priorities

- **Reference:** Button; consolidate and use as the worked example.
- **Core candidates:** common SaaS/business-app building blocks to address when requested.
- **Later candidates:** add only when product use cases justify the cost.
- **Patterns:** compositions documented with examples, not necessarily package components.

## Core candidates

| Family | Candidates | Scope and dependency notes |
| --- | --- | --- |
| Actions | Button, IconButton, Link | Button may navigate to a task; Link supports navigation in prose. IconButton needs an explicit accessible name. |
| Small content | Icon, Counter, Shortcut, Badge | Icon/Counter/Shortcut currently exist as Button fixtures/examples, not completed public DS dependencies. Badge conveys status/category; Counter conveys quantity. |
| Form structure | Field, FieldGroup, TextField | Field owns label/help/validation; FieldGroup composes controls/actions; TextField may offer a common composition. Set exact public boundaries in contracts. |
| Text entry | InputText, Textarea | InputText owns entry behavior; distinguish readonly, disabled and validation. |
| Choice | Checkbox, RadioGroup, Switch, Select | Distinguish selection from a persistent setting. Decide group/option subparts before creating standalone exports. |
| Searchable choice | Combobox | Search/filter and popup selection need their own interaction rules. Do not treat it as styled InputText. |
| Date and time | DatePicker, TimeInput | DatePicker is a sensible next *requested* complex exercise, not automatic work. Decide locale, date representation, calendar and selection scope before implementation. |
| Feedback | Alert, Toast, Progress, Spinner, Skeleton | Separate durable messages, transient notifications, progress and loading placeholders. Do not assume each needs a distinct motion token family. |
| Overlays | Dialog, Popover, Tooltip, Menu | Share primitives where useful but preserve distinct focus, dismissal and content behavior. An action menu is not Select. |
| Navigation | Tabs, Breadcrumb, Pagination | Selection, routing and focus rules must be explicit. |
| Disclosure | Accordion | Expand/collapse semantics differ from navigation and selection. |
| Data display | Table, Avatar, DataField | Begin with a semantic table; sorting/selection/virtualization belong to separately scoped enhancements. DataField displays a value without pretending to be a disabled input. |
| Structure | Divider | Prefer layout primitives for spacing; do not create visual components for every gap. |

## Later candidates

| Family | Candidates | Trigger |
| --- | --- | --- |
| Advanced inputs | NumberInput, Slider, RangeSlider, FileUpload | Clear product demand and accessibility behavior |
| Rich selection | MultiSelect, TreeView, SegmentedControl | Explicit selection, navigation and state rules |
| Advanced date/time | DateRangePicker, TimePicker | Proven need beyond a single date/time entry |
| Larger surfaces | Drawer, NavigationRail, Sidebar | Responsive composition and dismissal requirements |
| Rich data | DataGrid, Chart | Editing/virtualization or data visualization requirements |

## Composition patterns

Search/filter toolbar, form sections, action groups, empty states, page headers, cards, responsive app shell and bulk actions should first be explored as compositions. Promote a pattern to a component only when repeated behavior or public customization warrants it.

## Dependency planning

Resolve dependencies per request. For a DatePicker, likely concerns include a trigger/field, popup or dialog surface, a calendar view and date utilities. This is a planning hypothesis, not a final dependency graph. Native/platform responsibilities and the chosen headless primitive may change the decomposition.

A parent can use internal parts without publishing every part as a DS component. A fixture is not a production dependency merely because it appears in Figma. Document that distinction in the parent status and consumer API.

## What to settle before expansion

Choose the next requested component and its supported use cases; resolve only its blocking foundations and dependencies. Keep the authoring catalog separate from the consumer package index, which lists actual exports only.
