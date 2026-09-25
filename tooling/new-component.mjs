// Scaffold the authoring sources for a component that is being addressed (Create procedure, Scope phase).
//   node tooling/new-component.mjs <family> <component-id>
// Creates components/<family>/<id>/contract.json (skeleton) and status.json from the templates.
// It does not create Svelte, Figma or documentation files: those follow their own gates.
import { paths, write, exists, readJson } from './lib/paths.mjs';

const [family, id] = process.argv.slice(2);
if (!family || !id || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) || !/^[a-z][a-z0-9-]*$/.test(family))
  throw Error('Usage: node tooling/new-component.mjs <family> <component-id> (lowercase kebab-case)');
const dir = `${paths.components}/${family}/${id}`;
if (exists(`${dir}/contract.json`)) throw Error(`${dir}/contract.json already exists`);

const contract = readJson(`${paths.templates}/component-contract.json`);
contract.$schema = '../../../authoring/schemas/component-contract.schema.json';
contract.id = id;
const status = readJson(`${paths.templates}/component-status.json`);
status.componentId = id;
status.phase = 'scope';
status.artifacts.contract = { path: `${dir}/contract.json`, sha256: null };
status.nextAction = 'Complete the scope, then draft the contract and present it for the contract gate.';
write(`${dir}/contract.json`, { $schema: contract.$schema, ...contract });
write(`${dir}/status.json`, status);
console.log(`Created ${dir}/contract.json and ${dir}/status.json. Complete parts before running validation.`);
