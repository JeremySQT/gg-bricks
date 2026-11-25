// TimeInput parts: layout for a locale and hour cycle, typing, stepping and the value (pure functions, no DOM).

export type Part = 'hour' | 'minute' | 'second' | 'dayPeriod';
export type Period = 'am' | 'pm';
export interface Parts {
  hour: number | null; // shown hour: 1-12 on a 12-hour clock, 0-23 otherwise
  minute: number | null;
  second: number | null;
  dayPeriod: Period | null;
}
export interface Layout {
  /** Editable parts and literal separators, in the order of the locale. */
  items: Array<{ part: Part } | { literal: string }>;
  twelve: boolean;
  /** Day period texts of the locale. */
  am: string;
  pm: string;
}

/**
 * Order and separators of the parts for a locale: hour cycle `auto` follows the locale (h11 and h12 locales show a
 * 12-hour clock), `h12` and `h23` force it. Read from Intl, so it matches how the locale writes a time.
 */
export function layoutOf(locale: string, hourCycle: 'auto' | 'h12' | 'h23', seconds: boolean): Layout {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  if (seconds) options.second = '2-digit';
  if (hourCycle !== 'auto') options.hourCycle = hourCycle;
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat(locale, options);
  } catch {
    format = new Intl.DateTimeFormat('en', options);
  }
  const resolved = format.resolvedOptions().hourCycle;
  const twelve = resolved === 'h11' || resolved === 'h12';
  // A twelve-hour clock is always shown 1 to 12 (the contract); Intl's h11 (0 to 11) becomes h12.
  if (twelve && resolved === 'h11') {
    options.hourCycle = 'h12';
    format = new Intl.DateTimeFormat(format.resolvedOptions().locale, options);
  }
  const items: Layout['items'] = [];
  for (const p of format.formatToParts(new Date(2000, 0, 1, 21, 45, 30))) {
    if (p.type === 'hour' || p.type === 'minute' || p.type === 'second' || p.type === 'dayPeriod')
      items.push({ part: p.type });
    else if (p.type === 'literal') {
      const last = items[items.length - 1];
      if (last && 'literal' in last) last.literal += p.value;
      else items.push({ literal: p.value });
    }
  }
  const period = (hour: number) =>
    format.formatToParts(new Date(2000, 0, 1, hour)).find((p) => p.type === 'dayPeriod')?.value;
  return { items, twelve, am: (twelve && period(9)) || 'AM', pm: (twelve && period(21)) || 'PM' };
}

export const rangeOf = (part: Part, twelve: boolean): [number, number] =>
  part === 'hour' ? (twelve ? [1, 12] : [0, 23]) : part === 'dayPeriod' ? [0, 1] : [0, 59];

/** Parts shown for a value (HH:mm or HH:mm:ss, 24-hour); all empty for an empty or invalid value. */
export function partsOf(value: string | undefined, twelve: boolean): Parts {
  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '');
  const empty: Parts = { hour: null, minute: null, second: null, dayPeriod: null };
  if (!m) return empty;
  const [h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  if (h > 23 || mi > 59 || s > 59) return empty;
  if (!twelve) return { hour: h, minute: mi, second: s, dayPeriod: null };
  return { hour: h % 12 === 0 ? 12 : h % 12, minute: mi, second: s, dayPeriod: h < 12 ? 'am' : 'pm' };
}

/** The value of complete parts (HH:mm, HH:mm:ss with seconds), or empty while a needed part is missing. */
export function valueOf(parts: Parts, twelve: boolean, seconds: boolean): string {
  const { hour, minute, second, dayPeriod } = parts;
  if (hour === null || minute === null || (seconds && second === null) || (twelve && dayPeriod === null)) return '';
  const h = twelve ? (hour % 12) + (dayPeriod === 'pm' ? 12 : 0) : hour;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(minute)}${seconds ? `:${pad(second ?? 0)}` : ''}`;
}

/** Up (1) or Down (-1) on a part: wraps within its range; from empty, Up starts at the lowest and Down at the highest. */
export function stepPart(parts: Parts, part: Part, delta: 1 | -1, twelve: boolean): Parts {
  if (part === 'dayPeriod') {
    const next: Period = parts.dayPeriod === null ? (delta > 0 ? 'am' : 'pm') : parts.dayPeriod === 'am' ? 'pm' : 'am';
    return { ...parts, dayPeriod: next };
  }
  const [lo, hi] = rangeOf(part, twelve);
  const cur = parts[part];
  const next = cur === null ? (delta > 0 ? lo : hi) : ((cur - lo + delta + (hi - lo + 1)) % (hi - lo + 1)) + lo;
  return { ...parts, [part]: next };
}

/**
 * A digit typed in a numeric part, given the digits already typed in it since it was focused (`buffer`). Returns the
 * new value, the new buffer and whether the part is complete (no further digit can follow), so that focus moves on.
 */
export function typeDigit(
  part: Exclude<Part, 'dayPeriod'>,
  buffer: string,
  digit: number,
  twelve: boolean
): { value: number | null; buffer: string; complete: boolean } {
  const [lo, hi] = rangeOf(part, twelve);
  let text = buffer + String(digit);
  let n = Number(text);
  if (text.length > 2 || n > hi) {
    text = String(digit);
    n = digit;
  }
  // A lone 0 on a 12-hour clock waits for a second digit; it is not a valid hour on its own, and 00 is 12.
  const value = n < lo ? (text.length === 2 ? hi : null) : n;
  const complete = text.length === 2 || n * 10 > hi;
  return { value: value ?? null, buffer: complete ? '' : text, complete };
}

/** Seconds since midnight of HH:mm or HH:mm:ss; undefined for anything else. */
export function secondsOf(text: string | undefined): number | undefined {
  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text ?? '');
  if (!m) return undefined;
  const [h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  if (h > 23 || mi > 59 || s > 59) return undefined;
  return h * 3600 + mi * 60 + s;
}

export interface Bounds {
  min?: number; // seconds since midnight
  max?: number;
}

/** 24-hour hours the shown parts may stand for (both periods while the day period is empty on a 12-hour clock). */
function hoursOf(parts: Parts, twelve: boolean): number[] {
  if (parts.hour === null) return [];
  if (!twelve) return [parts.hour];
  const base = parts.hour % 12;
  return parts.dayPeriod === null ? [base, base + 12] : [base + (parts.dayPeriod === 'pm' ? 12 : 0)];
}

/**
 * Whether parts may still stand for a time within the bounds: a complete time is compared to min and max; an
 * incomplete one only by its hour (an hour whose 60 minutes all fall outside is out).
 */
export function withinBounds(parts: Parts, twelve: boolean, seconds: boolean, bounds: Bounds): boolean {
  const lo = bounds.min ?? 0;
  const hi = bounds.max ?? 24 * 3600 - 1;
  const full = valueOf(parts, twelve, seconds);
  if (full) {
    const s = secondsOf(full)!;
    return s >= lo && s <= hi;
  }
  const hours = hoursOf(parts, twelve);
  if (!hours.length) return true;
  return hours.some((h) => h * 3600 + 3599 >= lo && h * 3600 <= hi);
}

/**
 * Up or Down on a part within the bounds: steps as stepPart does, skipping the values that would put the time
 * outside min and max; when no other value is allowed the parts are unchanged.
 */
export function stepPartWithin(
  parts: Parts,
  part: Part,
  delta: 1 | -1,
  twelve: boolean,
  seconds: boolean,
  bounds: Bounds
): Parts {
  if (bounds.min === undefined && bounds.max === undefined) return stepPart(parts, part, delta, twelve);
  let next = parts;
  for (let i = 0; i < 61; i++) {
    next = stepPart(next, part, delta, twelve);
    if (withinBounds(next, twelve, seconds, bounds)) return next;
    if (next[part] === parts[part] && parts[part] !== null) break;
  }
  return parts;
}

/** A complete value outside the bounds becomes the nearest bound, in the value's format; otherwise unchanged. */
export function clampValue(value: string, bounds: Bounds, seconds: boolean): string {
  const s = secondsOf(value);
  if (s === undefined) return value;
  const target =
    bounds.min !== undefined && s < bounds.min
      ? bounds.min
      : bounds.max !== undefined && s > bounds.max
        ? bounds.max
        : s;
  if (target === s) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(target / 3600);
  const m = Math.floor((target % 3600) / 60);
  return `${pad(h)}:${pad(m)}${seconds ? `:${pad(target % 60)}` : ''}`;
}
