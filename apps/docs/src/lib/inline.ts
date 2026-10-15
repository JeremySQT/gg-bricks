// Inline Markdown of a documentation table cell (code spans, emphasis and links) rendered to HTML.
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function inlineMarkdown(source: string): string {
  return source
    .split(/(`[^`]*`)/)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
        return `<code>${escape(part.slice(1, -1))}</code>`;
      return escape(part)
        .replace(
          /\[([^\]]+)\]\(([a-z-]+)\.md(#[^)]*)?\)/g,
          (_, text, file, hash = '') => `<a href="/foundations/${file}/${hash}">${text}</a>`
        )
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\\\|/g, '|');
    })
    .join('');
}
