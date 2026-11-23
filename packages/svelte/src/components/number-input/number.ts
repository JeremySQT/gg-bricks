// Locale-aware reading, formatting and decimal stepping of NumberInput (pure functions, no DOM).

/** Number of fraction digits of a finite number as written in plain decimal (1e-7 gives 7). */
export function decimalsOf(n: number): number {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  const s = String(n);
  const e = s.match(/e-(\d+)$/);
  if (e) {
    const mantissa = s.slice(0, s.indexOf('e'));
    return Number(e[1]) + (mantissa.split('.')[1]?.length ?? 0);
  }
  return s.split('.')[1]?.length ?? 0;
}

interface Symbols {
  group: string;
  decimal: string;
  digits: Map<string, string>;
}
const symbolCache = new Map<string, Symbols>();

/** Grouping and decimal separators and digit glyphs of a locale. */
export function symbolsOf(locale: string): Symbols {
  let s = symbolCache.get(locale);
  if (s) return s;
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6);
  const digits = new Map<string, string>();
  const plain = new Intl.NumberFormat(locale, { useGrouping: false });
  for (let d = 0; d <= 9; d++) digits.set(plain.format(d), String(d));
  s = {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    digits
  };
  symbolCache.set(locale, s);
  return s;
}

const spaces = /[\s\u00a0\u202f\u2009]/g;

/**
 * Reads a typed text as a number for a locale: grouping separators and spaces are ignored, the locale's decimal
 * separator is accepted, the period too when it is not the grouping separator, and a leading minus sign.
 * Returns undefined for an empty text and NaN for a text that is not a number.
 */
export function parseNumber(text: string, locale: string): number | undefined {
  const { group, decimal, digits } = symbolsOf(locale);
  let t = text.trim();
  if (t === '') return undefined;
  t = [...t].map((ch) => digits.get(ch) ?? ch).join('');
  t = t.replace(/^[\u2212\u2012\u2013\uFE63\uFF0D]/, '-');
  // A grouping separator that is a space (narrow or not) is removed with the spaces.
  t = t.replace(spaces, '');
  // Swiss grouping is an apostrophe, typographic or straight depending on the platform's data: accept both.
  const groupChars = group.replace(spaces, '') === '' ? [] : /^['\u2019]$/.test(group) ? ["'", '\u2019'] : [group];
  for (const g of groupChars) if (g !== decimal) t = t.split(g).join('');
  if (decimal !== '.') t = t.split(decimal).join('.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  return Number(t);
}

/**
 * Formats a number for a locale with as many fraction digits as step has, more when the value has more; the value
 * itself is never rounded.
 */
export function formatNumber(value: number | undefined, locale: string, step: number): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  const min = Math.min(decimalsOf(step), 20);
  const max = Math.min(Math.max(min, decimalsOf(value)), 20);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: min, maximumFractionDigits: max }).format(value);
}

/** Plain decimal text for form submission: a period as decimal separator, no grouping, no exponent. */
export function plainNumber(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  const d = Math.min(decimalsOf(value), 20);
  return value.toFixed(d);
}

export const clamp = (n: number, min?: number, max?: number): number =>
  Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

/**
 * Moves value by `count` steps (negative to go down): to the next multiple of step counted from min (or zero) in the
 * direction of the step, then by whole steps, then within min and max. From no value, up starts at min (or zero) and
 * down at max (or zero). Computed in integers of the finest decimal so that 0.1 + 0.2 is 0.3.
 */
export function stepValue(value: number | undefined, count: number, step: number, min?: number, max?: number) {
  if (value === undefined || !Number.isFinite(value)) return clamp(count > 0 ? (min ?? 0) : (max ?? 0), min, max);
  const base = min ?? 0;
  const d = Math.min(Math.max(decimalsOf(step), decimalsOf(value), decimalsOf(base)), 15);
  const scale = 10 ** d;
  const cur = Math.round(value * scale);
  const s = Math.round(step * scale);
  const b = Math.round(base * scale);
  const k = (cur - b) / s;
  const n = count > 0 ? Math.floor(k) + count : Math.ceil(k) + count;
  return clamp((b + n * s) / scale, min, max);
}
