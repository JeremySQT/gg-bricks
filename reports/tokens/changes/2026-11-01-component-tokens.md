# Change record: semantic roles and component tokens (2026-11-01)

- **Request and scope:** at the wave 3 contract gate the user asked whether single-component tokens respect the token structure decided at the start ("primitives, semantic, and component tokens only where justified"), chose the component token layer for them ("Je suis ta recommandation, je préfère qu'on garde la structure propre"), asked for the Switch to follow in the same branch, and for a review of every token's placement. Session https://claude.ai/code/session_0156c543GZBnpgBmqmSNfDLB.
- **Starting source/output references:** branch `wave/3` at commit 647e4ba; Figma file TDPqojP4KvbWJlKSYc4zKC (ledger `reports/tokens/figma/ledger.json`).
- **Rule applied** (now in `authoring/decisions.md`, Semantic role or component token): a semantic role is shared by several components or documented for applications; a value meaningful for one component only is `component.<id>.<name>` in `foundations/tokens/base/components/<id>.tokens.json`, bound only by that component's contract, never density dependent, never a mere rename of a semantic role.

## Review of every token family

Primitives (`base/primitives`, no aliases, checked) and the axis of every semantic role (common, appearance, density, checked in 18 contexts by `tooling/check-foundations.ts`) were already in order. The review therefore looked at who uses each semantic family (contract bindings, expanded over enum values) and whether applications use it.

| Family | Consumers | Placement |
| --- | --- | --- |
| `size.switch.*` | Switch only | **Moved** to `component.switch.track-size.*` |
| `size.progress.*` (wave 3 draft) | Progress only | **Moved** to `component.progress.thickness.*` |
| `size.overlay.hint` (draft) | Tooltip only | **Moved** to `component.tooltip.max-inline-size` |
| `size.overlay.{sm,md,lg}` (draft) | Dialog only | **Moved** to `component.dialog.inline-size.*` |
| `motion.delay.hint` (draft) | Tooltip only | **Moved** to `component.tooltip.delay` |
| `motion.duration.spin`, `opacity.track` (draft) | Spinner (Button and IconButton will compose the Spinner) | **Moved** to `component.spinner.duration`, `component.spinner.track-opacity` |
| `size.overlay.panel` | Popover, Menu, Toast | Semantic |
| `motion.duration.loop` | Skeleton, Progress | Semantic |
| `size.avatar.*` | none yet (Avatar, wave 5) | Semantic for now, documented for applications; the Avatar contract applies the rule |
| `color.item.*` | Menu now; Select, Combobox, Tabs, Pagination, Toolbar (decision of 2026-10-31) | Semantic |
| `color.field.*`, `color.choice.*`, `size.choice.*`, `color.action.*` | two or more components each | Semantic |
| `typography.numeral.*`, `shadow.modal`, `layer.*`, `color.surface.scrim`, `color.content.link`, `opacity.tint` | one component today, documented in `documentation/foundations/` for applications | Semantic |
| Unused roles (`color.selection.*`, `color.border.focus`, `opacity.disabled`, `opacity.scrim`, `typography.display.*`…) | applications | Semantic |

Figma adapter variables (`switch/track-width`, `checkbox/focus-radius`, the hidden `Components` collections) are derived values Figma cannot compute; they are adapter mechanics recorded in each `figma-spec.md`, not source tokens, and stay as they are.

## Changes

- **Compatibility:** `--ggb-size-switch-{sm,md,lg}` disappears from `tokens.css` (replaced by `--ggb-component-switch-track-size-*`). The package is unreleased (0.x, no Deliver yet), so no deprecation alias is kept. Rendering is unchanged.
- **Changed artifacts:** `foundations/tokens/base/components/{switch,progress,spinner,tooltip,dialog}.tokens.json` (new); `base/semantic/common.tokens.json` and `inventory.json` (13 roles removed: 3 approved Switch roles, 10 wave 3 drafts); contracts of Switch, Progress, Spinner, Tooltip, Dialog; generated `packages/tokens/*`, `packages/svelte/src/components/switch/tokens.generated.css`, `packages/svelte/contracts/switch.json`; `tooling/check-foundations.ts` (generic component token rules: file per contract id, paths under `component.<id>.`, bound by that contract only, never by another); `tests/browser/switch.spec.ts` (token path read by the size assertion: same value, same assertion); Figma adapter scripts and `figma-spec.md` of Switch; `documentation/foundations/{overview,spacing}.md`; `authoring/{decisions,foundations}.md`.
- **Figma:** variables `size/switch/{sm,md,lg}` renamed `component/switch/track-size/{sm,md,lg}` in place (VariableID:286:7 to 286:9, Foundations · Brand), WEB code syntax updated; the 48 track height bindings of the Switch set 291:434 resolve 16, 20, 24 px; specification text 306:566 updated. Other new variables wait for the wave 3 Figma phase.
- **Approvals:** Switch contract, implementation and Figma parity re-recorded with the amendment provenance (rendering unchanged); the Switch contract approval now also lists `switch.tokens.json`. The semantic approval waits for the wave 3 contract gate (`pendingChanges`, entry of 2026-11-01). `approvals.figmaVariables` amended with the rename.
- **Checks:** `node tooling/check-foundations.ts` 444 roles, 2340 contrast checks, 0 failures (and the new rules rejected a stray token, a token outside `component.<id>.`, an orphan and a cross-component binding in a negative run); `npx playwright test tests/browser/switch.spec.ts` 5 passed; `npm run verify` (see the commit).
- **Remaining limitations:** `reports/components/switch/figma/parity.json` keeps the old variable name in its notes (historical evidence; values identical). Native Figma resolution is re-verified for all variables at the wave 3 Figma phase.

## Amendment of 2026-11-03: the rule is read from the name

- **Request:** the user found the usage criterion unreadable for a person ("il faut connaître l'intégralité du DS pour savoir qu'un token est réutilisé"), declined a token list in the documentation (noise, paths to maintain) and asked to fix what the clearer rule reveals right away.
- **Rule** (`authoring/decisions.md`, rewritten): a component token is named by its component (`component.<id>.*`); a semantic role is named by what it describes (family and role), never by a component. A component id may appear in a semantic name only as a general concept declared under `concepts` in `foundations/tokens/inventory.json`: `icon` (`size.icon.*`, `color.status.*.icon`), `link` (`color.content.link`), `toast` and `tooltip` (levels of the `layer.*` scale). `tooling/check-foundations.ts` rejects any other semantic name containing a component id, and any stale concept.
- **Placement of the wave 3 tokens:** unchanged by the new wording (each component token is named after its component; `size.overlay.panel` and `motion.duration.loop` name concepts).
- **Corrections:**
  - `color.field.*` → `color.input.*` (24 roles, both appearances; the choice family's aliases follow; same values). Field is a component that does not use this family. Updated: InputText and Textarea contracts, `tests/browser/input-text.spec.ts` and `textarea.spec.ts` (token path read by the color assertions: same values, same assertions), review pages and the docs playground frame that style native selects with it, `documentation/foundations/{color,overview}.md`, `authoring/foundations.md`, Figma adapter scripts and the two `figma-spec.md`. Figma: VariableID:7:160 to 7:183 renamed in place, WEB code syntax updated, specification text 306:1491 updated.
  - `size.avatar.*` removed (no consumer; a name after the planned Avatar component). Values recorded for the Avatar contract in `authoring/component-catalog.md` as `component.avatar.size.{xs…xl}` = 24, 32, 40, 48, 64 px. Figma: VariableID:5:84 to 5:88 deleted after a scan found no binding or alias. `documentation/foundations/spacing.md` and the foundations review page no longer show them.
- **Approvals re-recorded** (rendering unchanged): InputText and Textarea contract, implementation and Figma parity; the implementation approvals of Button, Counter, Icon and Shortcut, whose review pages style their selects with the renamed family. Semantic approval: waits for the wave 3 contract gate (`pendingChanges`).
- **Compatibility:** `--ggb-color-field-*` and `--ggb-size-avatar-*` disappear from `tokens.css`; the package is unreleased, so no alias is kept.
