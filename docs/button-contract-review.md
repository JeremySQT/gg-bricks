# Button contract review

Status: candidate ready for contract review; not approved for implementation.

Read [the contract](../contracts/actions/button.contract.json), [format](contract-format.md) and [schema](../schemas/component-contract.schema.json).

## Consolidated behavior

| Subject | Candidate |
| --- | --- |
| Intent | accent (default), neutral, danger |
| Appearance | solid (default), outline, ghost, link |
| Size | sm, md (default), lg |
| Label | Required, nonempty, no default |
| Width | Content width up to available width; no new width prop |
| Overflow | One line, ellipsis, full accessible name preserved |
| Leading | Zero or one icon |
| Trailing | Zero or one icon, counter or shortcut |
| Disabled / loading | Independent boolean props, default false |
| Interaction colors | disabled > loading > pressed > hover > default |
| Focus | Independent boolean state |
| Loading | Centered indicator; original content hidden visually but retained in layout |
| Loading + disabled | Indicator stays visible with disabled content color; activation blocked |
| Border | Outline only, without changing outer dimensions |

The link appearance remains an action-button style. Navigation belongs to Link. Figma controls and target APIs adapt the contract, without forcing every boolean into a Figma variant.

## Encoding decisions awaiting review

1. values + default for enums; type + default/required for scalars.
2. A named parts map; accepts + max distinguishes optional slots.
3. Enum-parameterized token paths instead of repeated color matrices.
4. Intrinsic requirements stay short English rules, not a behavior DSL.

## Token inventory still required

Families and behavior follow earlier decisions. Exact bindings size.target.min, border.width.default, color.focus.ring, border.focus.width and border.focus.offset are proposals to confirm in the semantic catalog.

The full intent/treatment/state color matrix is not yet available. [Token requirements](../reports/button-token-requirements.json) expands paths without inventing values. Slots require icon, counter and shortcut; no complete production dependency catalog is supplied. loadingIndicator is an internal part, not an assertion that a spinner component already exists.

## Evidence and boundaries

The test suite covers valid structure, unknown fields, wrong types/defaults, conflicting or unknown parameters, missing token paths and invalid slots. Inventory tests use explicitly synthetic fixtures.

The [validation report](../reports/button-contract-validation.json) marks real token and dependency coverage not-provided and intrinsic rules manual-review-required. It does not establish Figma design approval, code availability or accessibility conformance.

Next: approve the encoding, confirm binding names and complete actual reference coverage before the full Figma design. The existing pilot remains approved only for its tested scope.
