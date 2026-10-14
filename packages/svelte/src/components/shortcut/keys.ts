// Platform-neutral shortcut notation (contract rules 1 to 6): parsing, platform resolution, canonical modifier
// order, visible texts, separators and the spoken equivalent. Pure TypeScript, no DOM, so that it is unit-testable
// and the Svelte component only renders the model.

export type ResolvedPlatform = 'mac' | 'other';
export type KeyKind = 'modifier' | 'special' | 'literal';

export interface ShortcutKey {
  /** Canonical name (Ctrl, Shift, Enter, F5, ArrowUp, Plus) or the literal text. */
  id: string;
  kind: KeyKind;
  /** Visible text: Apple glyph or short name on the resolved platform; arrows and + everywhere. */
  text: string;
  /** Spoken word(s) of the accessible name. */
  spoken: string;
}

export interface ShortcutModel {
  platform: ResolvedPlatform;
  keys: ShortcutKey[];
  /** Text of the separator part between consecutive keys; null when keys are juxtaposed (mac). */
  separator: string | null;
  /** Spoken equivalent in the display order, words separated by spaces. */
  spoken: string;
}

/** Canonical names of the closed vocabulary, matched ignoring case. */
const ALIASES: Record<string, string> = {
  mod: 'Mod',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  cmd: 'Meta',
  command: 'Meta',
  super: 'Meta',
  win: 'Meta',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: 'Space',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  arrowup: 'ArrowUp',
  up: 'ArrowUp',
  arrowdown: 'ArrowDown',
  down: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  left: 'ArrowLeft',
  arrowright: 'ArrowRight',
  right: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pgup: 'PageUp',
  pagedown: 'PageDown',
  pgdn: 'PageDown',
  plus: 'Plus'
};
for (let n = 1; n <= 12; n++) ALIASES[`f${n}`] = `F${n}`;
const CANONICAL = new Set(Object.values(ALIASES));

const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Meta'];
/** Canonical modifier order per platform (contract rule 3). */
export const MODIFIER_ORDER: Record<ResolvedPlatform, readonly string[]> = {
  mac: ['Ctrl', 'Alt', 'Shift', 'Meta'],
  other: ['Meta', 'Ctrl', 'Alt', 'Shift']
};

/** Visible text per platform (rules 4 and 5). Names missing here show their canonical name (Space, F1 to F12). */
const TEXT: Record<ResolvedPlatform, Record<string, string>> = {
  mac: {
    Ctrl: '⌃',
    Alt: '⌥',
    Shift: '⇧',
    Meta: '⌘',
    Enter: '↩',
    Escape: '⎋',
    Tab: '⇥',
    Backspace: '⌫',
    Delete: '⌦',
    Home: '↖',
    End: '↘',
    PageUp: '⇞',
    PageDown: '⇟'
  },
  other: {
    Meta: 'Win',
    Escape: 'Esc',
    Delete: 'Del',
    PageUp: 'PgUp',
    PageDown: 'PgDn'
  }
};
/** Rule 6: arrows and Plus look the same on every platform. */
const TEXT_EVERYWHERE: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Plus: '+'
};

/** Spoken words (rule 7). Names missing here are spoken by their canonical name (Enter, Tab, Home, F5…). */
const SPOKEN: Record<string, string> = {
  Ctrl: 'Control',
  Alt: 'Alt',
  Shift: 'Shift',
  Meta: 'Windows',
  ArrowUp: 'Up arrow',
  ArrowDown: 'Down arrow',
  ArrowLeft: 'Left arrow',
  ArrowRight: 'Right arrow',
  PageUp: 'Page up',
  PageDown: 'Page down',
  Plus: 'plus'
};
const SPOKEN_MAC: Record<string, string> = { Alt: 'Option', Meta: 'Command' };

/**
 * Tokens of a keys string, platform-neutral: canonical names (Mod kept as Mod) or literal keys. Tokens are
 * trimmed; a single letter is uppercased; an empty token (Ctrl+, Ctrl++) is dropped: there is nothing to show.
 * Never throws: an unknown name is a literal shown as written.
 */
export function parseKeys(keys: string): string[] {
  if (typeof keys !== 'string') return [];
  const tokens: string[] = [];
  for (const raw of keys.split('+')) {
    const token = raw.trim();
    if (!token) continue;
    const canonical = ALIASES[token.toLowerCase()];
    if (canonical) tokens.push(canonical);
    else tokens.push(token.length === 1 ? token.toUpperCase() : token);
  }
  return tokens;
}

function describe(id: string, platform: ResolvedPlatform): ShortcutKey {
  if (MODIFIERS.includes(id))
    return {
      id,
      kind: 'modifier',
      text: TEXT[platform][id] ?? id,
      spoken: (platform === 'mac' && SPOKEN_MAC[id]) || SPOKEN[id] || id
    };
  if (CANONICAL.has(id))
    return { id, kind: 'special', text: TEXT_EVERYWHERE[id] ?? TEXT[platform][id] ?? id, spoken: SPOKEN[id] ?? id };
  return { id, kind: 'literal', text: id, spoken: id };
}

/**
 * Resolve a keys string on a platform: Mod becomes Meta (mac) or Ctrl (other), a modifier named twice counts
 * once, modifiers come first in the canonical order of the platform, the remaining keys keep their order.
 */
export function resolveShortcut(keys: string, platform: ResolvedPlatform): ShortcutModel {
  const tokens = parseKeys(keys).map((t) => (t === 'Mod' ? (platform === 'mac' ? 'Meta' : 'Ctrl') : t));
  const modifiers = MODIFIER_ORDER[platform].filter((m) => tokens.includes(m));
  const rest = tokens.filter((t) => !MODIFIERS.includes(t));
  const resolved = [...modifiers, ...rest].map((id) => describe(id, platform));
  return {
    platform,
    keys: resolved,
    separator: platform === 'mac' ? null : '+',
    spoken: resolved.map((k) => k.spoken).join(' ')
  };
}

/** The part of navigator that detection reads (userAgentData is not in lib.dom yet). */
export interface PlatformSource {
  userAgentData?: { platform?: string } | null;
  platform?: string;
}

/** Platform auto: mac on Apple platforms (macOS, iOS, iPadOS; iPadOS reports MacIntel), other everywhere else. */
export function detectPlatform(source: PlatformSource | undefined | null): ResolvedPlatform {
  const value = source?.userAgentData?.platform || source?.platform || '';
  return /^(mac|iphone|ipad|ipod|ios)/i.test(value) ? 'mac' : 'other';
}
