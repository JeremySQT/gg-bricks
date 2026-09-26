// Shared server-rendering helper for tests/ssr/*.test.ts. One Vite server per test file.
import fs from 'node:fs';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..', '..');
let serverPromise: Promise<ViteDevServer> | undefined;

async function server(): Promise<ViteDevServer> {
  serverPromise ??= createServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error'
  });
  return serverPromise;
}

/** Render packages/svelte/src/<file> with props on the server; returns { head, body }. */
export async function renderComponent(
  file: string,
  props: Record<string, unknown>
): Promise<{ head: string; body: string }> {
  const s = await server();
  const { default: Component } = await s.ssrLoadModule(path.join(root, 'packages/svelte/src', file));
  const { render } = await s.ssrLoadModule('svelte/server');
  return render(Component, { props });
}

export async function closeServer(): Promise<void> {
  if (serverPromise) await (await serverPromise).close();
}

export function writeSsrReport(componentId: string, checks: string[]): void {
  const dir = path.join(root, 'reports/components', componentId, 'svelte');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ssr.json'), JSON.stringify({ result: 'passed', checks }, null, 2) + '\n');
}
