// The repository root, found from the working directory: bundled build chunks do not keep their source
// location, so import.meta.dirname cannot be trusted in components.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

function findRoot(start: string): string {
  let dir = start;
  while (!existsSync(join(dir, 'foundations/tokens/config.json'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`ggbrick repository root not found above ${start}`);
    dir = parent;
  }
  return dir;
}

export const repoRoot = findRoot(process.cwd());
