# Security policy

## Supported versions

ggbrick is at version 0.x and is not published to npm yet. Fixes land on `main` only.

## Reporting a vulnerability

Report it privately through GitHub: on the repository page, open the **Security** tab and choose **Report a vulnerability**. Do not open a public issue or pull request for it.

Say what is affected (component, tooling script or documentation site), how to reproduce it, and what it allows. You will get an answer in the private advisory thread.

## Scope

- The Svelte components in `packages/svelte` and the tokens in `packages/tokens`.
- The generators and validators in `tooling/`.
- The documentation site in `apps/docs`.

Vulnerabilities in dependencies (Svelte, Bits UI, Astro and the others) belong to their own projects; report here only what ggbrick adds or misuses.
