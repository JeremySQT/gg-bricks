import fs from 'node:fs';
import path from 'node:path';
import { abs, paths, readJson, exists } from './paths.mjs';

/**
 * Discover component sources: components/<family>/<name>/contract.json.
 * A folder without a contract is not a component. Order is deterministic (family, then name).
 */
export function listComponents() {
  const base = abs(paths.components);
  if (!fs.existsSync(base)) return [];
  const result = [];
  for (const family of fs.readdirSync(base).sort()) {
    const familyDir = path.join(base, family);
    if (!fs.statSync(familyDir).isDirectory()) continue;
    for (const name of fs.readdirSync(familyDir).sort()) {
      const dir = `${paths.components}/${family}/${name}`;
      if (!exists(`${dir}/contract.json`)) continue;
      const contract = readJson(`${dir}/contract.json`);
      if (contract.id !== name) throw Error(`Contract id "${contract.id}" does not match folder ${dir}`);
      const status = exists(`${dir}/status.json`) ? readJson(`${dir}/status.json`) : null;
      result.push({ id: contract.id, family, dir, contractPath: `${dir}/contract.json`, contract, status });
    }
  }
  return result;
}

export function getComponent(id) {
  const found = listComponents().find((c) => c.id === id);
  if (!found) throw Error('Unknown component: ' + id);
  return found;
}

export const pascal = (s) => s.split(/[-_]/).map((x) => x[0].toUpperCase() + x.slice(1)).join('');
