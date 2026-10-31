// Verify the approval digests recorded in status files against the current files.
//   node tooling/check-approvals.ts            (every component status and foundations/tokens/status.json)
//   node tooling/check-approvals.ts <id> [...] (only these components)
// An approval covers exactly the recorded revision (authoring/workflow.md): a listed source whose digest no longer
// matches invalidates the approval and fails the check. Paths that are evidence or designer support (reports/**,
// figma-spec.md) are expected to move with the Figma library layout: a drift there is reported as a warning only.
// A drift whose current digest is listed in a pendingChanges entry of the same status is a change already recorded
// and waiting for the next gate (authoring/workflow.md, Evidence and approval records): reported as a warning. The
// pendingChanges log itself records historical digests on purpose and is not checked.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { listComponents } from './lib/catalog.ts';
import { abs, exists, paths, readJson } from './lib/paths.ts';

interface Approval {
  revision?: { paths?: string[]; sha256?: Record<string, string> };
}
interface Status {
  approvals?: Record<string, Approval | null>;
  /** Changes accepted but not yet re-recorded in the approval (foundations/tokens/status.json); each lists the new digests. */
  pendingChanges?: { date: string; change: string; sha256?: Record<string, string> }[];
}
interface Drift {
  status: string;
  approval: string;
  path: string;
  recorded: string;
  current: string | null;
  severity: 'error' | 'warning';
}

const evidence = (p: string) => p.startsWith('reports/') || p.endsWith('figma-spec.md');
const digest = (p: string) =>
  exists(p)
    ? crypto
        .createHash('sha256')
        .update(fs.readFileSync(abs(p)))
        .digest('hex')
    : null;

const only = new Set(process.argv.slice(2));
const statuses = listComponents()
  .filter((c) => c.status && (!only.size || only.has(c.id)))
  .map((c) => `${c.dir}/status.json`);
if (!only.size) statuses.push(`${paths.tokens}/status.json`);

const drifts: Drift[] = [];
let checked = 0;
for (const file of statuses) {
  const status = readJson<Status>(file);
  for (const [name, approval] of Object.entries(status.approvals ?? {})) {
    const sha = approval?.revision?.sha256;
    if (!sha) continue;
    for (const [p, recorded] of Object.entries(sha)) {
      checked++;
      const current = digest(p);
      if (current === recorded) continue;
      const pending = (status.pendingChanges ?? []).some((c) => c.sha256?.[p] === current);
      drifts.push({
        status: file,
        approval: name,
        path: p,
        recorded,
        current,
        severity: evidence(p) || pending ? 'warning' : 'error'
      });
    }
  }
}
const errors = drifts.filter((d) => d.severity === 'error');
const warnings = drifts.filter((d) => d.severity === 'warning');
for (const d of drifts)
  console.log(
    `${d.severity}: ${d.status} approvals.${d.approval} ${d.path} ${d.current === null ? 'is missing' : evidence(d.path) ? 'changed since the approval (evidence or designer support)' : d.severity === 'warning' ? 'changed since the approval (recorded in pendingChanges, re-record at the next gate)' : 'changed since the approval'}`
  );
console.log(
  JSON.stringify({ statuses: statuses.length, digests: checked, errors: errors.length, warnings: warnings.length })
);
if (errors.length) {
  console.error(
    'Approved revisions changed. Re-present the affected gate, or re-record the approval with the new digests and the amendment provenance (authoring/workflow.md, Evidence and approval records).'
  );
  process.exitCode = 1;
}
