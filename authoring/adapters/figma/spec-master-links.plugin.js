// Link from each specification page to its master (use_figma body), 2026-10-29.
// The masters live on the library pages (Actions, Content, Forms), one section per component; the component pages
// hold the specifications. Adds under the title of every specification a line "Master: <family> › <component>"
// linked to the component's section (typography/body/sm, color/content/link). Rerun after rebuilding a
// specification page or adding a component (the line is replaced, never duplicated).
const SPECS = [
  ['144:2', 'Actions', 'Button'],
  ['211:2', 'Actions', 'IconButton'],
  ['225:2', 'Actions', 'Link'],
  ['220:2', 'Content', 'Badge'],
  ['149:1547', 'Content', 'Counter'],
  ['149:4', 'Content', 'Icon'],
  ['149:1569', 'Content', 'Shortcut'],
  ['288:3', 'Forms', 'Checkbox'],
  ['347:243', 'Forms', 'CheckboxGroup'],
  ['288:4', 'Forms', 'Field'],
  ['288:5', 'Forms', 'InputText'],
  ['288:6', 'Forms', 'Radio'],
  ['288:7', 'Forms', 'RadioGroup'],
  ['288:8', 'Forms', 'Switch'],
  ['288:9', 'Forms', 'Textarea']
];
const styles = await figma.getLocalTextStylesAsync();
const style = styles.find((s) => s.name === 'typography/body/sm');
await figma.loadFontAsync(style.fontName);
const vars = await figma.variables.getLocalVariablesAsync();
const link = vars.find((v) => v.name === 'color/content/link');
const families = {};
for (const p of figma.root.children) if (['Actions', 'Content', 'Forms'].includes(p.name)) families[p.name] = p;
const out = {};
for (const [pid, family, name] of SPECS) {
  const fam = families[family];
  await fam.loadAsync();
  const section = fam.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!section) throw new Error(`no section ${family} › ${name}`);
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const root = page.children.find((n) => n.name === `${name} — Specification`);
  if (!root) throw new Error('no specification ' + name);
  const title = root.children[0].findOne((n) => n.name === 'Title');
  for (const n of title.children.filter((n) => n.name === 'Master link')) n.remove();
  const t = figma.createText();
  t.name = 'Master link';
  t.textStyleId = style.id;
  t.characters = `Master: ${family} › ${name}`;
  t.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }, 'color', link)];
  t.setRangeHyperlink(0, t.characters.length, { type: 'NODE', value: section.id });
  t.setRangeTextDecoration(0, t.characters.length, 'UNDERLINE');
  title.appendChild(t);
  out[name] = { spec: root.id, section: section.id, text: t.id };
}
return out;
