# @ggbrick/svelte

Svelte 5 components of the ggbrick design system, built on Bits UI primitives. Components are added as they pass their implementation gate; `docs/index.json` lists what is available in the installed version.

## Install

From the repository: `npm ci`, `npm run pack:svelte`, then in a Svelte 5 application:

```sh
npm install /absolute/path/to/ggbrick-svelte-<version>.tgz
```

```svelte
<script lang="ts">
  import '@ggbrick/svelte/tokens.css';
  // import { Button } from '@ggbrick/svelte';
</script>

<div data-ggb-brand="base" data-ggb-appearance="light" data-ggb-density="standard">
  <!-- components -->
</div>
```

Set all three `data-ggb-*` attributes on the same ancestor; they select one generated context. A nested override repeats all three. Fonts are loaded by your application, not by the components.

## Copy instead of installing

Every component folder in `src/<id>/` is self-contained: copy it, add `tokens.css`, install `bits-ui`, and copy the internal dependencies listed in the component's documentation page. Generated files inside the folder (`contract.generated.ts`, `tokens.generated.css`) are part of the copy.

## Documentation

Read `docs/index.json` first, then the component page (`docs/<id>.md`). `docs/AGENTS.md` is the entry point for an agent working in your application. Each component's platform-independent contract is in `contracts/<id>.json`.

## Package layout

- `src/index.ts`: public exports.
- `src/<id>/`: `<Name>.svelte`, `types.ts`, `<id>.css`, generated `contract.generated.ts` and `tokens.generated.css`.
- `tokens.css`, `contracts/`, `docs/`: copies generated at build time from `packages/tokens` and `documentation/`.
