# @ds-reference/svelte

Local reference package for Svelte 5 and Bits UI. The Button implementation is ready for review; the complete design system is not released.

## Install and use

From the repository, run `npm ci`, `npm run build`, then `npm run pack:svelte`. In a Svelte 5 application:

```sh
npm install /absolute/path/to/ds-reference-svelte-0.1.0.tgz
```

```svelte
<script lang="ts">
  import { Button } from '@ds-reference/svelte';
  import '@ds-reference/svelte/tokens.css';
</script>

<div data-ds-brand="base" data-ds-appearance="light" data-ds-density="standard">
  <Button label="Save changes" onclick={() => console.log('save')} />
</div>
```

Load Inter 400/600 through your application's font pipeline. Fonts are not imposed or downloaded by the component. The example app self-hosts them through @fontsource/inter.

Set all three data attributes on the same ancestor. They select one complete generated context. A nested override must repeat all three attributes; changing only a nested theme attribute does not select a new context in this initial CSS exporter.

Read [docs/index.json](docs/index.json) first for economical agent discovery, then [docs/button.md](docs/button.md) for the component. The same maintained Markdown is intended for humans and agents. The package also includes the platform-independent contract in `contracts/button.json`.

No registry publication, public documentation hosting, or Figma publishing is performed by this package.
