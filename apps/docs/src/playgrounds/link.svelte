<script lang="ts">
  // Link playground: destination, tone and the size of the surrounding text, inside a sentence.
  import { Link } from '@ggbrick/svelte';
  import type { LinkDestination, LinkTone } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let destination = $state<LinkDestination>('page');
  let tone = $state<LinkTone>('accent');
  let text = $state('body-md');
  const targets: Record<LinkDestination, { label: string; href: string }> = {
    page: { label: 'migration guide', href: '#migration' },
    external: { label: 'Svelte documentation', href: 'https://svelte.dev' },
    email: { label: 'support@example.com', href: 'mailto:support@example.com' },
    phone: { label: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
    file: { label: 'annual report', href: '#report.pdf' },
    print: { label: 'printable version', href: '#print' }
  };
  const inverse = $derived(tone === 'inherit');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Destination',
        options: Object.keys(targets),
        value: destination,
        onchange: (v) => (destination = v as LinkDestination)
      }
    ],
    topEnd: [{ label: 'Tone', options: ['accent', 'inherit'], value: tone, onchange: (v) => (tone = v as LinkTone) }],
    bottomStart: [
      { label: 'Text', options: ['body-sm', 'body-md', 'body-lg'], value: text, onchange: (v) => (text = v) }
    ]
  }}
>
  <p
    style:font="var(--ggb-typography-{text})"
    style:margin="0"
    style:padding={inverse ? 'var(--ggb-space-content-sm) var(--ggb-space-content-md)' : undefined}
    style:background={inverse ? 'var(--ggb-color-surface-inverse)' : undefined}
    style:color={inverse ? 'var(--ggb-color-content-inverse)' : undefined}
  >
    More information: <Link
      label={targets[destination].label}
      href={targets[destination].href}
      {destination}
      {tone}
      fileType={destination === 'file' ? 'pdf' : undefined}
      fileSize={destination === 'file' ? '2.4 MB' : undefined}
    />.
  </p>
</PlaygroundFrame>
