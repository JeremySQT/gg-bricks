# Component contract format — v1

Status: compact encoding accepted during the design discussion; future component types may extend it. The five substantive blocks are agreed; this schema is deliberately limited to enum, boolean and string inputs; extend it through a reviewed schema change when a component needs more.

## Representation

- $schema: optional local editor reference.
- id: stable lowercase kebab-case ID.
- props: enum = values + default; boolean = type + default; string = type and optional required or default; number = type + default with optional min/max. A required prop cannot also declare a fallback default. `bindable: true` marks a prop whose value flows both ways (an input's value, an open state a parent can control); the implementation exposes it as a two-way binding.
- parts: named anatomy. An empty object declares an internal part. `accepts` declares a slot accepting component IDs, with optional `min` (default 0) and `max` (unbounded when omitted). A compound component (RadioGroup and its radios) declares the child component in `accepts` with `min: 1`. Part names do not automatically create public API.
- states: enum or boolean axes, using the same notation. These are observed or derived conditions, not automatically public inputs. Prop and state names must be distinct.
- tokens: visual role to literal or parameterized token path.
- events: optional conceptual outputs, name → `when` (English condition) and optional `payload`. Target-specific event names, DOM events and handler signatures belong to the implementation.
- rules: short English intrinsic requirements, manually reviewed and implemented/tested per target.

Keep approval metadata outside the contract. Add new types only when a real component needs a reviewed schema extension. No Svelte/DOM/Figma mechanisms belong here.

## Parameterized paths

Example: color.action.{intent}.{appearance}.{interaction}.surface

Each brace name references an enum prop or state. Parameters occupy complete path segments. Substitution is textual; no expression evaluation or hidden fallback. Repeated names receive the same value. All enum values contribute to required coverage, including non-default values.

This is a contract convention, NOT DTCG alias syntax. The contract references paths in a resolved token set for one brand/appearance/density configuration. Run reference coverage against every supported configuration.

Reference only necessary combinations. A border path may fix the appearance segment to `outline` when other treatments draw no border. Avoid adding unused requirements merely to complete a matrix. `tests/fixtures/button.contract.json` is a complete sample of the notation.

## Validation

1. JSON Schema Draft 2020-12: shape, allowed fields, types, enum domains, cardinality.
2. Node consistency checks: enum default membership, number ranges, conflicting declarations, slot cardinality, known enum parameters, no direct primitive bindings.
3. Optional inputs: token presence in a flat resolved map and accepted component IDs in an available catalog.
4. Manual/target checks: intrinsic rules, runtime behavior, accessibility and visual parity.

valid:true means only supplied checks passed. Read checks: not-provided is not verified. Token coverage checks presence of $type and $value, not full DTCG validity, alias resolution or type compatibility with a visual role.

No completed token set or production catalog is included. Never manufacture token values to make the checker pass.

## Role naming convention

Generic checks infer the expected token type from the role name: `surface`, `content`, `border` and roles ending in `Color` are colors; roles starting with `typography` are typography; `motion*`/`duration*` durations; `easing*` cubic Béziers; `shadow*` shadows; everything else is a dimension. The validator rejects a resolved token whose `$type` does not match. Contrast evidence uses `surface`/`content`/`border`/`focusColor`.

## Commands

npm ci
npm test
npm run validate # all contracts, schema + consistency + token coverage in every context
node tooling/validate-contracts.mjs <id> # one contract, schema + consistency only
node tooling/validate-contracts.mjs --tokens --dependencies # also check accepted part contents against the local catalog

The dependency check uses the ids of discovered contracts; presence does not prove dependency readiness. The validator uses Ajv's 2020 entry point, strict checks and no input coercion/default injection. CLI failures use a nonzero exit status.

## References

- https://json-schema.org/draft/2020-12/schema
- https://json-schema.org/draft/2020-12/json-schema-core
- https://json-schema.org/draft/2020-12/json-schema-validation
- https://ajv.js.org/json-schema.html
