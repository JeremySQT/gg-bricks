import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeFileType,
  resolveDestination,
  splitLastWord,
  suffixes
} from '../packages/svelte/src/components/link/destination.ts';
import { glyphs } from '../packages/svelte/src/components/link/glyphs.ts';

test('page has no glyph, meta or suffix and stays in the same context', () => {
  assert.deepEqual(resolveDestination('page'), { glyph: null, meta: '', suffix: '', newContext: false });
});

test('external, email, phone and print show their glyph and default English suffix; only external opens a new context', () => {
  for (const d of ['external', 'email', 'phone', 'print'] as const) {
    const r = resolveDestination(d);
    assert.equal(r.glyph, d);
    assert.equal(r.meta, '');
    assert.equal(r.suffix, suffixes[d]);
    assert.ok(r.suffix.length > 0);
    assert.equal(r.newContext, d === 'external');
  }
  assert.equal(resolveDestination('external').suffix, 'opens in a new tab');
  assert.equal(resolveDestination('print').suffix, 'printable version');
});

test('file types map to their family glyph ignoring case, spaces and a leading dot; others get the generic file', () => {
  const families: Record<string, string[]> = {
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
  };
  for (const [glyph, types] of Object.entries(families))
    for (const type of types) {
      assert.equal(resolveDestination('file', { fileType: type }).glyph, glyph, type);
      assert.equal(resolveDestination('file', { fileType: ` .${type.toUpperCase()} ` }).glyph, glyph, type);
    }
  for (const fileType of [undefined, '', 'epub', 'key'])
    assert.equal(resolveDestination('file', { fileType }).glyph, 'file');
  assert.equal(normalizeFileType(' .DOCX '), 'docx');
});

test('file meta shows the format in uppercase and the size as given, leaving out what is missing; no default suffix', () => {
  assert.equal(resolveDestination('file', { fileType: '.pdf', fileSize: '2.4 MB' }).meta, '(PDF, 2.4 MB)');
  assert.equal(resolveDestination('file', { fileType: 'docx' }).meta, '(DOCX)');
  assert.equal(resolveDestination('file', { fileSize: ' 12 kB ' }).meta, '(12 kB)');
  assert.equal(resolveDestination('file').meta, '');
  assert.equal(resolveDestination('file', { fileType: 'pdf' }).suffix, '');
  // Meta belongs to files only.
  assert.equal(resolveDestination('external', { fileType: 'pdf', fileSize: '1 MB' }).meta, '');
});

test('a non-blank destinationLabel replaces the default suffix of any destination', () => {
  assert.equal(
    resolveDestination('external', { destinationLabel: "s'ouvre dans un nouvel onglet" }).suffix,
    "s'ouvre dans un nouvel onglet"
  );
  assert.equal(resolveDestination('file', { destinationLabel: 'downloads' }).suffix, 'downloads');
  assert.equal(resolveDestination('email', { destinationLabel: '   ' }).suffix, 'email');
});

test('the last word is split off so that meta and glyph stay on its line', () => {
  assert.deepEqual(splitLastWord('Annual report'), ['Annual ', 'report']);
  assert.deepEqual(splitLastWord('report'), ['', 'report']);
  assert.deepEqual(splitLastWord('the supplier  framework agreement'), ['the supplier  framework ', 'agreement']);
  assert.deepEqual(splitLastWord('trailing space '), ['trailing ', 'space ']);
});

test('every glyph is one Phosphor path on the 256 grid', () => {
  for (const [name, d] of Object.entries(glyphs)) assert.match(d, /^M[\d.,\-A-Za-z ]+Z$/, name);
  assert.deepEqual(Object.keys(glyphs).sort(), [
    'audio',
    'csv',
    'doc',
    'email',
    'external',
    'file',
    'image',
    'pdf',
    'phone',
    'ppt',
    'print',
    'txt',
    'video',
    'xls',
    'zip'
  ]);
});
