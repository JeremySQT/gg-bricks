/** The first `count` graphemes of a text, so that an emoji or a combined character is never split. */
export function graphemes(text: string, count: number): string {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const out: string[] = [];
    for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
      if (out.length === count) break;
      out.push(segment);
    }
    return out.join('');
  }
  return Array.from(text).slice(0, count).join('');
}

/**
 * Initials of a name: the first grapheme of the first word and of the last word, uppercased (one for a single
 * word, or when `one` is set). Leading punctuation of a word is skipped; a word without letters or digits does not
 * count. Graphemes keep accents, scripts without case and combined characters whole. Returns '' when the name yields
 * no initials (the avatar then shows its generic glyph).
 */
export function initialsOf(name: string | undefined, one = false): string {
  if (typeof name !== 'string') return '';
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, ''))
    .filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (!words.length) return '';
  const first = (word: string) => {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
      for (const { segment } of segments) return segment;
    }
    return Array.from(word)[0];
  };
  const head = first(words[0]);
  const tail = !one && words.length > 1 ? first(words[words.length - 1]) : '';
  return (head + tail).toLocaleUpperCase();
}
