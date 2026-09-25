# @ds/svelte

Svelte 5 implementation of the design system, built on Bits UI primitives. Button is available; the catalog grows wave by wave (see the repository roadmap). The package name is a placeholder until the design system is named.

## Install and use

From the repository: `npm ci`, `npm run pack:svelte`. In a Svelte 5 application:

```sh
npm install /absolute/path/to/ds-svelte-0.1.0.tgz
```

```svelte
<script lang="ts">
  import { Button } from '@ds/svelte';
  import '@ds/svelte/tokens.css';
</script>

<div data-ds-brand="base" data-ds-appearance="light" data-ds-density="standard">
  <Button label="Save changes" onclick={() => console.log('save')} />
</div>
```

Load Inter 400/600 through your application's font pipeline. Fonts are not imposed or downloaded by the components.

Set all three data attributes on the same ancestor. They select one complete generated context. A nested override must repeat all three attributes.

## Documentation

Read `docs/index.json` first for economical discovery, then the component page (for example `docs/button.md`). The same maintained Markdown is intended for humans and agents. Each component's platform-independent contract is in `contracts/<id>.json`.

## Package layout

- `src/index.ts`: public exports.
- `src/<id>/`: one folder per component. `contract.generated.ts` and `tokens.generated.css` are generated from the shared contract; the `.svelte`, `types.ts` and handwritten `.css` files hold behavior and styling.
- `tokens.css`, `contracts/`, `docs/`: copies generated at build time from `packages/tokens` and `documentation/`.

No registry publication, public documentation hosting or Figma publishing is performed by this package.
