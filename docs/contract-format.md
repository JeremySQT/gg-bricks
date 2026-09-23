# Component contract format — v1

Status: compact encoding accepted during the design discussion; future component types may extend it. The five substantive blocks are agreed; this schema is deliberately limited to the types currently required by Button.

## Representation

- $schema: optional local editor reference.
- id: stable lowercase kebab-case ID.
- props: enum = values + default; boolean = type + default; string = type and optional required or default. A required prop cannot also declare a fallback default in this candidate.
- parts: named anatomy. An empty object declares an internal part. accepts + max declares an optional slot accepting component IDs, empty when omitted. Part names do not automatically create public API.
- states: enum or boolean axes, using the same notation. These are observed or derived conditions, not automatically public inputs. Prop and state names must be distinct.
- tokens: visual role to literal or parameterized token path.
- rules: short English intrinsic requirements, manually reviewed and implemented/tested per target.

Keep approval metadata outside the contract. Add new types only when a real component needs a reviewed schema extension. No Svelte/DOM/Figma mechanisms belong here.

## Parameterized paths

Example: color.action.{intent}.{appearance}.{interaction}.surface

Each brace name references an enum prop or state. Parameters occupy complete path segments. Substitution is textual; no expression evaluation or hidden fallback. Repeated names receive the same value. All enum values contribute to required coverage, including non-default values.

This is a contract convention, NOT DTCG alias syntax. The contract references paths in a resolved token set for one brand/appearance/density configuration. Run reference coverage against every supported configuration.

Reference only necessary combinations. Button's border path fixes appearance to outline because other treatments do not draw a border. Avoid adding unused requirements merely to complete a matrix.

## Validation

1. JSON Schema Draft 2020-12: shape, allowed fields, types, enum domains, cardinality.
2. Node consistency checks: enum default membership, conflicting declarations, known enum parameters, no direct primitive bindings.
3. Optional inputs: token presence in a flat resolved map and accepted component IDs in an available catalog.
4. Manual/target checks: intrinsic rules, runtime behavior, accessibility and visual parity.

valid:true means only supplied checks passed. Read checks: not-provided is not verified. Token coverage checks presence of $type and $value, not full DTCG validity, alias resolution or type compatibility with a visual role.

No completed token set or production catalog is included. Never manufacture token values to make the checker pass.

## Commands

npm ci
npm test
npm run validate

Optional reference validation:
node tools/validate-contract.mjs contracts/actions/button.contract.json --tokens path/to/resolved.json --components path/to/component-ids.json

The catalog input is a JSON array of component IDs; presence does not prove dependency readiness. The validator uses Ajv's 2020 entry point, strict checks and no input coercion/default injection. CLI failures use a nonzero exit status.

## References

- https://json-schema.org/draft/2020-12/schema
- https://json-schema.org/draft/2020-12/json-schema-core
- https://json-schema.org/draft/2020-12/json-schema-validation
- https://ajv.js.org/json-schema.html
