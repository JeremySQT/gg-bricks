// Run the Playwright suite only when browser specs exist (a repository with no implemented
// component has none). Reuses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. Evidence (screenshots, computed.json,
// reports/browser-results.json) is written only with GGB_EVIDENCE=1; otherwise the run leaves the tree clean.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { abs } from './lib/paths.ts';
const specs = fs.existsSync(abs('tests/browser'))
  ? fs.readdirSync(abs('tests/browser')).filter((f) => f.endsWith('.spec.ts'))
  : [];
if (!specs.length) {
  console.log('No browser specs in tests/browser; skipping.');
  process.exit(0);
}
console.log(
  process.env.GGB_EVIDENCE === '1'
    ? 'GGB_EVIDENCE=1: writing screenshots and reports to reports/.'
    : 'Checks only; set GGB_EVIDENCE=1 to write screenshots and reports to reports/.'
);
const r = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], { stdio: 'inherit', cwd: abs() });
process.exit(r.status ?? 1);
