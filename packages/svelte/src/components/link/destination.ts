// What the reader is told about a link's destination: the indicator glyph, the visible meta text of a file
// and the suffix announced after the name. Pure functions, shared by the component and its tests.
import type { LinkDestination } from './contract.generated.js';
import type { Glyph } from './glyphs.js';

/** Default English suffixes announced after the accessible name; destinationLabel replaces them. */
export const suffixes: Record<LinkDestination, string> = {
  page: '',
  external: 'opens in a new tab',
  email: 'email',
  phone: 'phone',
  file: '',
  print: 'printable version'
};

const families: Record<string, Glyph> = {};
for (const [glyph, types] of Object.entries({
  pdf: ['pdf'],
  doc: ['doc', 'docx', 'odt', 'rtf'],
  xls: ['xls', 'xlsx', 'ods'],
  csv: ['csv'],
  ppt: ['ppt', 'pptx', 'odp'],
  txt: ['txt', 'md'],
  zip: ['zip', 'rar', '7z', 'gz', 'tar'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  audio: ['mp3', 'wav', 'ogg'],
  video: ['mp4', 'mov', 'webm']
}))
  for (const type of types) families[type] = glyph as Glyph;

/** A file type matched ignoring case, surrounding spaces and one leading dot; empty when absent. */
export function normalizeFileType(fileType: string | undefined): string {
  return (fileType ?? '').trim().replace(/^\./, '').toLowerCase();
}

export interface Resolved {
  /** Glyph shown after the label, or null for a page. */
  glyph: Glyph | null;
  /** Visible meta text of a file, with its parentheses: "(PDF, 2.4 MB)"; empty when absent. */
  meta: string;
  /** Text announced after the name, without punctuation; empty when none. */
  suffix: string;
  /** Opens in a new browsing context without access to the opener. */
  newContext: boolean;
}

export function resolveDestination(
  destination: LinkDestination,
  { fileType, fileSize, destinationLabel }: { fileType?: string; fileSize?: string; destinationLabel?: string } = {}
): Resolved {
  let glyph: Glyph | null = null;
  let meta = '';
  if (destination === 'file') {
    const type = normalizeFileType(fileType);
    glyph = families[type] ?? 'file';
    const parts = [type.toUpperCase(), (fileSize ?? '').trim()].filter(Boolean);
    if (parts.length) meta = `(${parts.join(', ')})`;
  } else if (destination !== 'page') glyph = destination;
  const custom = (destinationLabel ?? '').trim();
  return { glyph, meta, suffix: custom || suffixes[destination], newContext: destination === 'external' };
}

/**
 * Splits the label before its last word, so that the meta text and the glyph stay on the line of that word:
 * ["Read the annual ", "report"]. A label without a space has an empty head.
 */
export function splitLastWord(label: string): [string, string] {
  const match = /^(.*\s)(\S+\s*)$/s.exec(label);
  return match ? [match[1], match[2]] : ['', label];
}
