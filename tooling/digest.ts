// Print sha256 digests for files, for approval records in status files.
//   node tooling/digest.ts <path> [<path> ...]
import fs from 'node:fs';
import crypto from 'node:crypto';
const files = process.argv.slice(2);
if (!files.length) throw Error('Usage: node tooling/digest.ts <path> [<path> ...]');
const out: Record<string, string> = {};
for (const f of files) out[f] = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
