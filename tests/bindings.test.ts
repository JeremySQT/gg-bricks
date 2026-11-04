import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateCss, generateTypes } from '../tooling/lib/bindings.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'fixtures', file), 'utf8'));

test('types: enum unions, record interfaces, defaults and child defaults', () => {
  const ts = generateTypes(read('compound.contract.json'), 'overlays');
  assert.match(ts, /^\/\/ Generated from foundations\/components\/overlays\/menu\/contract\.json/);
  assert.match(ts, /export type MenuSize = "sm" \| "md" \| "lg";/);
  assert.match(
    ts,
    /export interface MenuOptionsRecord \{\n {2}value: string;\n {2}label: string;\n {2}disabled\?: boolean;\n\}/
  );
  // States are not typed (as for the parent, a state is observed, not an input); child props are.
  assert.doesNotMatch(ts, /MenuItemCondition/);
  assert.match(
    ts,
    /export const defaults = \{\n {2}"size": "md",\n {2}"open": false,\n {2}"options": \[\]\n\} as const;/
  );
  assert.match(
    ts,
    /export const childDefaults = \{\n {2}"item": \{\n {4}"disabled": false\n {2}\},\n {2}"separator": \{\}\n\} as const;/
  );
});

test('css: parent roles on the root, child roles on the child part, parent parameters on the root', () => {
  // A child is a unit: its roles sit on its own class unless they read a parent prop (decision of 2026-11-04).
  const css = generateCss(read('compound.contract.json'));
  assert.match(css, /^\/\* Generated token bindings from the menu contract\. Do not edit\. \*\/\n@layer ggb \{\n/);
  assert.match(css, /\.ggb-menu \{\n(.*\n)*? {2}--ggb-menu-layer: var\(--ggb-layer-dropdown\);/);
  // Child state: a suffix of the variable, on the child part's own class (not nested under the parent).
  assert.match(
    css,
    /(^|\n)\.ggb-menu__item \{\n(.*\n)*? {2}--ggb-menu-item-surface-selected-hover: var\(--ggb-color-item-selected-hover-surface\);/
  );
  assert.doesNotMatch(css, /\.ggb-menu \.ggb-menu__item \{/);
  // Parent prop used by a child role: attribute on the root, variable on the child.
  assert.match(
    css,
    /\.ggb-menu\[data-size="lg"\] \.ggb-menu__item \{\n {2}--ggb-menu-item-typography: var\(--ggb-typography-body-lg\);/
  );
  assert.match(
    css,
    /(^|\n)\.ggb-menu__separator \{\n {2}--ggb-menu-separator-border: var\(--ggb-color-border-subtle\);\n\}/
  );
  assert.ok(css.trimEnd().endsWith('}'));
});

test('a leaf contract generates the same bindings as before the extension', () => {
  const ts = generateTypes(read('button.contract.json'), 'actions');
  assert.match(
    ts,
    /^\/\/ Generated from foundations\/components\/actions\/button\/contract\.json\. Do not edit\.\nexport type ButtonIntent/
  );
  const css = generateCss(read('button.contract.json'));
  assert.match(
    css,
    /\.ggb-button\[data-intent="accent"\]\[data-appearance="solid"\] \{\n {2}--ggb-button-surface-default:/
  );
  assert.doesNotMatch(css, /__/);
});
