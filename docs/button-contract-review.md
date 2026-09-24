# Button reference review

Status: design candidate ready for a holistic visual review. No Svelte implementation or release is claimed.

## Contract

The compact encoding, slots and parameterized paths were accepted during the design discussion. Subsequent accepted changes remove the link appearance and use focus.width / focus.offset. The current contract is contracts/actions/button.contract.json.

| Option | Values |
| --- | --- |
| Intent | accent (default), neutral, danger |
| Appearance | solid (default), outline, ghost |
| Size | sm, md (default), lg |
| Label | Required, non-empty, one line; ending ellipsis when constrained |
| Leading | Optional icon |
| Trailing | Optional icon, counter or shortcut |
| Loading / disabled | Independent boolean inputs; disabled colors take precedence |
| Focus | Independent visual state |

Button is a visual action presentation and may navigate to a task. Link provides a text-link presentation. The web implementation must preserve native semantics for the actual operation.

## Evidence

- All 18 brand / appearance / density configurations resolve from JSON.
- 2,088 contrast records cover active content, outline borders and focus on canvas and subtle surfaces. Disabled content is recorded without a minimum threshold. This is not a complete accessibility certification.
- 2,340 native Figma scalar comparisons cover 130 semantic values in each of the 18 contexts, with no differences at a tolerance of 0.000002.
- The loading composition example measures 229 px both before and during loading.
- Contract schema and consistency tests run independently of visual checks.

Reports live in reports/. Generated CSS, resolved maps, provenance traces and the Figma manifest live in dist/.

## Review in Figma

File: https://www.figma.com/design/vytcT4Uq6pdroelPdNLFcR

| Board | Node |
| --- | --- |
| Foundations | 5:2 |
| Overview, anatomy and visual variants | 12:56 |
| Light states and focus | 12:271 |
| Dark states and focus | 13:894 |
| Behavior, density, target and truncation | 14:996 |
| Brands and usage examples | 16:1105 |
| Public Button component set | 11:74 |

The original token pilot is preserved in its separate file. The new file uses Cover, Getting Started, Foundations, Button and Utilities pages.

## Figma adapter decisions

The public Button set has nine intent × appearance variants. Each exposes its internal surface's size, state, label, focus and slot properties. Nine internal sets each contain 18 size × state variants. This keeps each matrix below 30 variants.

The Figma state `disabled-loading` represents the combination of disabled and loading; it is not an extra shared contract state. Loading is shown as a static indicator in specifications; animation is not implemented in this review file.

The outer transparent component reserves a minimum 44 × 44 interactive envelope. The visible surface can remain smaller. Target collision and real input behavior require implementation testing.

Constrained-width example: set the outer instance to a fixed width, and surface, content and label to Fill container. The label uses one line and ending truncation. Resizing a default Hug instance alone does not configure all these nested sizing options.

Counter and shortcut are editable slot fixtures, not independently completed DS components. Preferred instance swaps suggest compatible content; they do not enforce the contract. Fixture text color is explicitly bound in the examples. Arbitrary future swaps must be checked for contextual color and intrinsic sizing rather than assumed compatible.

Focus offset is used when building the geometry. Changing that token requires rerunning geometry reconciliation, not just setting variable values. Typography currently supports the chosen Inter family and Semi Bold weight; multi-font brand exports are not claimed.

## Next gate

Review overall appearance, visual emphasis, density, focus and loading. Consolidate any edits into token / contract sources before the Svelte phase. After that phase, produce runtime accessibility, keyboard and visual parity evidence and executable documentation. Publication and a complete component catalog remain separate decisions.

## Slot color follow-up — 2026-09-24

The user approved the overall visual direction but identified dark shortcut text on the accent solid surface after an instance swap. Leading and trailing foreground content must use the same resolved content color as the label.

The original Plus fixture was replaced in verified original master slots by a local compatible icon fixture (20:2). All three fixtures now contain a `content` text layer and a `glyph` vector layer; their visibility depends on the fixture. Both layers receive state-specific foreground bindings in Button masters. Existing counter/shortcut component IDs remain 7:9 / 7:11.

A fresh shortcut swap correctly follows default, hover and disabled in light and dark. Repeated swaps between different fixtures after changing intent or appearance can still restore stale per-component overrides in Figma. This correction is partial; do not report complete slot parity.

Proposed next step: test and adopt a single compatible fixture variant family, keeping icon/counter/shortcut as the allowed content choices. Automatic approval review rejected regrouping the existing components because it changes their structure and might affect existing references. That regrouping was not executed. Explicit user authorization is needed before changing those existing components. Evidence: reports/figma/slot-color-review.json. The isolated regression example is node 22:2334.
