<script lang="ts">
  import type { LinkProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { glyphs } from './glyphs.js';
  import { resolveDestination, splitLastWord } from './destination.js';
  import './tokens.generated.css';
  import './link.css';

  let {
    label,
    href,
    tone = defaults.tone,
    destination = defaults.destination,
    fileType,
    fileSize,
    destinationLabel,
    rel,
    ref = $bindable(null),
    class: className,
    ...rest
  }: LinkProps = $props();

  // Fail identically on the server and in the browser rather than render a link without a name or a target.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Link requires a non-empty label.');
    return label;
  });
  const target = $derived.by(() => {
    if (typeof href !== 'string' || !href.trim()) throw new Error('Link requires a non-empty href.');
    return href;
  });

  const resolved = $derived(resolveDestination(destination, { fileType, fileSize, destinationLabel }));
  // With meta or a glyph, the last word is kept with them on one line (they never start a line alone).
  const parts = $derived(resolved.meta || resolved.glyph ? splitLastWord(name) : [name, '']);
  // A new browsing context gets no access to the opener; the consumer's rel values are kept.
  const relation = $derived(
    resolved.newContext
      ? [...new Set([...(rel ?? '').split(/\s+/), 'noopener', 'noreferrer'])].filter(Boolean).join(' ')
      : rel
  );
</script>

<!--
  The accessible name is the text content: label, then meta, then the visually hidden suffix in parentheses.
  The underline is drawn on the label spans only, so meta and glyph are never underlined (a decoration set on
  an ancestor cannot be removed by its descendants).
-->
<a
  {...rest}
  class={['ggb-link', className]}
  href={target}
  target={resolved.newContext ? '_blank' : undefined}
  rel={relation || undefined}
  data-tone={tone}
  data-destination={destination}
  bind:this={ref}
  >{#if parts[0]}<span class="ggb-link__label">{parts[0]}</span>{/if}{#if parts[1]}<span class="ggb-link__tail"
      ><span class="ggb-link__label">{parts[1]}</span>{#if resolved.meta}<span class="ggb-link__meta"
          >{` ${resolved.meta}`}</span
        >{/if}{#if resolved.glyph}<svg
          class="ggb-link__indicator"
          viewBox="0 0 256 256"
          fill="currentColor"
          focusable="false"
          aria-hidden="true"><path d={glyphs[resolved.glyph]} /></svg
        >{/if}</span
    >{/if}{#if resolved.suffix}<span class="ggb-link__suffix">{` (${resolved.suffix})`}</span>{/if}</a
>
