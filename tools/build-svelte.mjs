import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'contracts/actions/button.contract.json'), 'utf8'));
const dir = path.join(root, 'packages/svelte/src/button');
const write = (name, content) => fs.writeFileSync(path.join(dir, name), content);
const cssVar = token => `var(--${token.replaceAll('.', '-')})`;
const resolve = (role, values) => cssVar(contract.tokens[role].replace(/\{(\w+)\}/g, (_, key) => values[key]));
const intents = contract.props.intent.values, appearances = contract.props.appearance.values, sizes = contract.props.size.values;
write('contract.generated.ts', '// Generated from the platform-independent Button contract. Do not edit.\n' +
  ['intent', 'appearance', 'size'].map(key => `export type Button${key[0].toUpperCase() + key.slice(1)} = ${contract.props[key].values.map(v => JSON.stringify(v)).join(' | ')};`).join('\n') +
  `\nexport const defaults = ${JSON.stringify(Object.fromEntries(Object.entries(contract.props).filter(([, v]) => 'default' in v).map(([k, v]) => [k, v.default])), null, 2)} as const;\n`);
let css = '/* Generated token bindings from button.contract.json. No Figma adapter variables. */\n';
for (const intent of intents) for (const appearance of appearances) {
  css += `.ds-button[data-intent="${intent}"][data-appearance="${appearance}"] {\n`;
  for (const interaction of contract.states.interaction.values) for (const role of ['surface', 'content', 'border']) {
    css += `  --button-${role}-${interaction}: ${role === 'border' && appearance !== 'outline' ? 'transparent' : resolve(role, { intent, appearance, interaction })};\n`;
  }
  css += '}\n';
}
const roles = ['minHeight', 'paddingInline', 'paddingBlock', 'gap', 'typography', 'iconSize'];
for (const size of sizes) {
  css += `.ds-button[data-size="${size}"] {\n${roles.map(role => `  --button-${role}: ${resolve(role, { size })};`).join('\n')}\n}\n`;
}
css += `.ds-button {\n${['minTarget', 'radius', 'borderWidth', 'focusColor', 'focusWidth', 'focusOffset'].map(role => `  --button-${role}: ${resolve(role, {})};`).join('\n')}\n}\n`;
write('tokens.generated.css', css);
fs.copyFileSync(path.join(root, 'dist/tokens.css'), path.join(root, 'packages/svelte/tokens.css'));
fs.mkdirSync(path.join(root, 'packages/svelte/contracts'), { recursive: true });
fs.copyFileSync(path.join(root, 'contracts/actions/button.contract.json'), path.join(root, 'packages/svelte/contracts/button.json'));
console.log('Generated Svelte Button types, CSS bindings, token stylesheet and consumer contract.');
