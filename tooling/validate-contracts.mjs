// Validate every component contract (schema + consistency), optionally with token coverage
// across all configured contexts and dependency presence in the local catalog.
//   node tooling/validate-contracts.mjs [component-id ...] [--tokens] [--dependencies]
import { checkContract } from './lib/contract.mjs';
import { listComponents } from './lib/catalog.mjs';
import { resolveAllContexts } from './lib/tokens.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const unknown = [...flags].filter((f) => !['--tokens', '--dependencies'].includes(f));
if (unknown.length) throw Error('Unknown option: ' + unknown.join(' '));
const ids = args.filter((a) => !a.startsWith('--'));
const all = listComponents();
const selected = ids.length
  ? ids.map(
      (id) =>
        all.find((c) => c.id === id) ??
        (() => {
          throw Error('Unknown component: ' + id);
        })()
    )
  : all;
const catalog = flags.has('--dependencies') ? all.map((c) => c.id) : undefined;
const contexts = flags.has('--tokens') ? resolveAllContexts() : null;

const report = {};
let valid = true;
for (const c of selected) {
  const base = checkContract(c.contract, { components: catalog });
  const perContext = contexts
    ? Object.fromEntries(contexts.map((ctx) => [ctx.id, checkContract(c.contract, { tokens: ctx.tokens })]))
    : null;
  const contextErrors = perContext
    ? Object.entries(perContext).flatMap(([id, r]) => r.errors.map((e) => ({ context: id, ...e })))
    : [];
  const ok = base.valid && contextErrors.length === 0;
  valid &&= ok;
  report[c.id] = {
    valid: ok,
    checks: { ...base.checks, tokenCoverage: contexts ? (contextErrors.length ? 'failed' : 'passed') : 'not-provided' },
    errors: [...base.errors, ...contextErrors],
    requiredTokenPaths: base.requiredTokenPaths?.length,
    dependencies: base.dependencies
  };
}
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
process.exitCode = valid ? 0 : 1;
