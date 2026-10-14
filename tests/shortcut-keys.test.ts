import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseKeys,
  resolveShortcut,
  detectPlatform,
  MODIFIER_ORDER
} from '../packages/svelte/src/components/shortcut/keys.ts';

const texts = (keys: string, platform: 'mac' | 'other') => resolveShortcut(keys, platform).keys.map((k) => k.text);
const ids = (keys: string, platform: 'mac' | 'other') => resolveShortcut(keys, platform).keys.map((k) => k.id);
const spoken = (keys: string, platform: 'mac' | 'other') => resolveShortcut(keys, platform).spoken;

test('aliases map to canonical names ignoring case; other names are literals; single letters are uppercased', () => {
  assert.deepEqual(parseKeys('mod+SHIFT+p'), ['Mod', 'Shift', 'P']);
  assert.deepEqual(parseKeys('Control+Option+Command'), ['Ctrl', 'Alt', 'Meta']);
  assert.deepEqual(parseKeys('cmd+super+win'), ['Meta', 'Meta', 'Meta']);
  assert.deepEqual(parseKeys('Return+Esc+Del'), ['Enter', 'Escape', 'Delete']);
  assert.deepEqual(parseKeys('Up+Down+Left+Right'), ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  assert.deepEqual(parseKeys('PgUp+PgDn+Home+End'), ['PageUp', 'PageDown', 'Home', 'End']);
  assert.deepEqual(parseKeys('f1+F12+f5'), ['F1', 'F12', 'F5']);
  assert.deepEqual(parseKeys('Tab+Space+Backspace+Plus'), ['Tab', 'Space', 'Backspace', 'Plus']);
  assert.deepEqual(parseKeys('Fn+NumLock+é'), ['Fn', 'NumLock', 'É']);
  assert.deepEqual(parseKeys('/'), ['/']);
  assert.deepEqual(parseKeys(' Ctrl + k '), ['Ctrl', 'K']);
});

test('an empty token is dropped and an empty or non-string keys renders nothing without throwing', () => {
  assert.deepEqual(parseKeys('Ctrl+'), ['Ctrl']);
  assert.deepEqual(parseKeys('Ctrl++K'), ['Ctrl', 'K']);
  assert.deepEqual(parseKeys('+'), []);
  assert.deepEqual(parseKeys(''), []);
  assert.deepEqual(parseKeys(undefined as unknown as string), []);
  assert.deepEqual(resolveShortcut('', 'mac'), { platform: 'mac', keys: [], separator: null, spoken: '' });
});

test('Mod resolves to Meta on mac and to Ctrl on other; explicit modifiers keep their meaning', () => {
  assert.deepEqual(ids('Mod+K', 'mac'), ['Meta', 'K']);
  assert.deepEqual(ids('Mod+K', 'other'), ['Ctrl', 'K']);
  assert.deepEqual(ids('Ctrl+K', 'mac'), ['Ctrl', 'K']);
  assert.deepEqual(ids('Meta+K', 'other'), ['Meta', 'K']);
  // Mod and Ctrl on other name the same modifier once.
  assert.deepEqual(ids('Mod+Ctrl+K', 'other'), ['Ctrl', 'K']);
  assert.deepEqual(ids('Mod+Ctrl+K', 'mac'), ['Ctrl', 'Meta', 'K']);
});

test('modifiers come first in the canonical order of the platform; other keys keep their order', () => {
  assert.deepEqual(MODIFIER_ORDER.mac, ['Ctrl', 'Alt', 'Shift', 'Meta']);
  assert.deepEqual(MODIFIER_ORDER.other, ['Meta', 'Ctrl', 'Alt', 'Shift']);
  assert.deepEqual(ids('K+Meta+Shift+Alt+Ctrl', 'mac'), ['Ctrl', 'Alt', 'Shift', 'Meta', 'K']);
  assert.deepEqual(ids('K+Meta+Shift+Alt+Ctrl', 'other'), ['Meta', 'Ctrl', 'Alt', 'Shift', 'K']);
  assert.deepEqual(ids('Shift+Mod+P', 'mac'), ['Shift', 'Meta', 'P']);
  assert.deepEqual(ids('Shift+Mod+P', 'other'), ['Ctrl', 'Shift', 'P']);
  assert.deepEqual(ids('B+Shift+A', 'other'), ['Shift', 'B', 'A']);
});

test('mac shows Apple glyphs juxtaposed; Space and function keys show their name', () => {
  assert.deepEqual(texts('Ctrl+Alt+Shift+Meta+K', 'mac'), ['⌃', '⌥', '⇧', '⌘', 'K']);
  assert.deepEqual(texts('Enter', 'mac'), ['↩']);
  assert.deepEqual(texts('Escape', 'mac'), ['⎋']);
  assert.deepEqual(texts('Tab', 'mac'), ['⇥']);
  assert.deepEqual(texts('Backspace', 'mac'), ['⌫']);
  assert.deepEqual(texts('Delete', 'mac'), ['⌦']);
  assert.deepEqual(texts('Home+End', 'mac'), ['↖', '↘']);
  assert.deepEqual(texts('PageUp+PageDown', 'mac'), ['⇞', '⇟']);
  assert.deepEqual(texts('Space', 'mac'), ['Space']);
  assert.deepEqual(texts('F5+F12', 'mac'), ['F5', 'F12']);
  assert.equal(resolveShortcut('Mod+K', 'mac').separator, null);
});

test('other shows short names joined by + separators', () => {
  assert.deepEqual(texts('Ctrl+Alt+Shift+Meta+K', 'other'), ['Win', 'Ctrl', 'Alt', 'Shift', 'K']);
  assert.deepEqual(texts('Enter+Escape+Tab+Space', 'other'), ['Enter', 'Esc', 'Tab', 'Space']);
  assert.deepEqual(texts('Backspace+Delete+Home+End', 'other'), ['Backspace', 'Del', 'Home', 'End']);
  assert.deepEqual(texts('PageUp+PageDown+F1', 'other'), ['PgUp', 'PgDn', 'F1']);
  assert.equal(resolveShortcut('Mod+K', 'other').separator, '+');
});

test('arrows are glyphs and Plus shows + on every platform', () => {
  for (const platform of ['mac', 'other'] as const) {
    assert.deepEqual(texts('ArrowUp+ArrowDown+ArrowLeft+ArrowRight', platform), ['↑', '↓', '←', '→']);
    assert.deepEqual(texts('Mod+Plus', platform), [platform === 'mac' ? '⌘' : 'Ctrl', '+']);
  }
});

test('the spoken equivalent is in words, in the display order', () => {
  assert.equal(spoken('Mod+K', 'mac'), 'Command K');
  assert.equal(spoken('Mod+K', 'other'), 'Control K');
  assert.equal(spoken('K+Meta+Shift+Alt+Ctrl', 'mac'), 'Control Option Shift Command K');
  assert.equal(spoken('K+Meta+Shift+Alt+Ctrl', 'other'), 'Windows Control Alt Shift K');
  assert.equal(spoken('Enter+Escape+Tab+Space+Backspace+Delete', 'mac'), 'Enter Escape Tab Space Backspace Delete');
  assert.equal(spoken('Up+Down+Left+Right', 'other'), 'Up arrow Down arrow Left arrow Right arrow');
  assert.equal(spoken('Home+End+PgUp+PgDn', 'mac'), 'Home End Page up Page down');
  assert.equal(spoken('F5', 'other'), 'F5');
  assert.equal(spoken('Mod+Plus', 'mac'), 'Command plus');
  assert.equal(spoken('Shift+Enter', 'other'), 'Shift Enter');
  assert.equal(spoken('Mod+Foo', 'mac'), 'Command Foo');
  assert.equal(spoken('g', 'mac'), 'G');
});

test('an unknown name is a literal shown and spoken as written', () => {
  const [key] = resolveShortcut('NumLock', 'other').keys;
  assert.deepEqual(key, { id: 'NumLock', kind: 'literal', text: 'NumLock', spoken: 'NumLock' });
  assert.deepEqual(resolveShortcut('Meta', 'mac').keys[0].kind, 'modifier');
  assert.deepEqual(resolveShortcut('F5', 'mac').keys[0].kind, 'special');
});

test('platform detection: Apple platforms from userAgentData first, then navigator.platform', () => {
  assert.equal(detectPlatform({ userAgentData: { platform: 'macOS' }, platform: 'Linux x86_64' }), 'mac');
  assert.equal(detectPlatform({ userAgentData: { platform: 'Windows' }, platform: 'MacIntel' }), 'other');
  assert.equal(detectPlatform({ platform: 'MacIntel' }), 'mac');
  assert.equal(detectPlatform({ platform: 'iPhone' }), 'mac');
  assert.equal(detectPlatform({ platform: 'iPad' }), 'mac');
  assert.equal(detectPlatform({ platform: 'Win32' }), 'other');
  assert.equal(detectPlatform({ platform: 'Linux armv8l' }), 'other');
  assert.equal(detectPlatform({ userAgentData: null, platform: '' }), 'other');
  assert.equal(detectPlatform(undefined), 'other');
});
