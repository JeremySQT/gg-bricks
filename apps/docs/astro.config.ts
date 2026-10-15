import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import { EDIT_BASE, generateComponentPages, watchedSources } from './lib/content.ts';

// Component pages are generated from documentation/ before Astro reads its content (see lib/content.ts).
const components = generateComponentPages();
const families = [...new Set(components.map((c) => c.family))];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Regenerates the component pages when a documentation source changes during `astro dev`. */
const regenerate: AstroIntegration = {
  name: 'ggbrick-docs-content',
  hooks: {
    'astro:server:setup': ({ server, logger }) => {
      server.watcher.add(watchedSources);
      server.watcher.on('change', (file) => {
        if (watchedSources.some((source) => file.startsWith(source))) {
          generateComponentPages();
          logger.info(`regenerated component pages after a change in ${file}`);
        }
      });
    }
  }
};

export default defineConfig({
  site: 'https://docs.ggbrick.design',
  integrations: [
    starlight({
      title: 'ggbrick',
      description:
        'A design system delivered as a Figma library, a Svelte 5 package and documentation, from one set of JSON sources.',
      logo: { src: './src/assets/logo.svg', alt: 'ggbrick' },
      favicon: '/favicon.svg',
      editLink: { baseUrl: `${EDIT_BASE}apps/docs/` },
      customCss: [
        '@fontsource/inter/400.css',
        '@fontsource/inter/500.css',
        '@fontsource/inter/600.css',
        '@fontsource/inter/700.css',
        '@fontsource/ibm-plex-mono/400.css',
        '@ggbrick/tokens/tokens.css',
        './src/styles/ggbrick.css'
      ],
      expressiveCode: {
        styleOverrides: {
          codeBackground: 'var(--ggb-color-surface-subtle)',
          borderColor: 'var(--ggb-color-border-subtle)',
          borderRadius: 'var(--ggb-radius-container)',
          codeFontFamily: 'var(--ggb-primitive-font-family-mono)',
          uiFontFamily: 'var(--ggb-primitive-font-family-sans)'
        }
      },
      components: {
        ThemeProvider: './src/overrides/ThemeProvider.astro',
        ThemeSelect: './src/overrides/ThemeSelect.astro'
      },
      sidebar: [
        { label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Foundations', items: [{ autogenerate: { directory: 'foundations' } }] },
        {
          label: 'Components',
          items: [
            { label: 'Overview', link: '/components/' },
            ...families.map((family) => ({
              label: capitalize(family),
              items: components.filter((c) => c.family === family).map((c) => ({ label: c.title, link: `/${c.slug}/` }))
            }))
          ]
        }
      ]
    }),
    svelte(),
    regenerate
  ],
  vite: { server: { fs: { allow: ['../..'] } } }
});
