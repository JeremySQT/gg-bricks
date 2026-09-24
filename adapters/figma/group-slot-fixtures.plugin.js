// Reference-file migration. Resolve destination IDs from its ledger before reuse.
// Existing fixtures have matching direct children: TEXT content and VECTOR glyph.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:8'));
const entries = [['20:2', 'icon'], ['7:9', 'counter'], ['7:11', 'shortcut']];
const nodes = await Promise.all(entries.map(([id]) => figma.getNodeByIdAsync(id)));
for (const node of nodes) {
  for (const text of node.findAllWithCriteria({ types: ['TEXT'] })) {
    for (const segment of text.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(segment.fontName);
  }
}
for (let i = 0; i < nodes.length; i++) nodes[i].name = 'kind=' + entries[i][1];
const set = nodes[0].parent.type === 'COMPONENT_SET'
  ? nodes[0].parent : figma.combineAsVariants(nodes, figma.currentPage);
set.name = '_Slot fixture/Content';
set.x = 1800; set.y = 80;
nodes.forEach((node, i) => { node.x = 24; node.y = 24 + i * 64; });
set.resize(240, 230);
const oldKey = Object.keys(set.componentPropertyDefinitions).find(k => k.startsWith('Value#'));
if (oldKey) set.editComponentProperty(oldKey, { name: 'Counter value' });
let shortcutKey = Object.keys(set.componentPropertyDefinitions).find(k => k.startsWith('Shortcut value#'));
if (!shortcutKey) shortcutKey = set.addComponentProperty('Shortcut value', 'TEXT', '⌘ K');
const shortcutText = nodes[2].children.find(n => n.type === 'TEXT' && n.name === 'content');
shortcutText.componentPropertyReferences = { characters: shortcutKey };
shortcutText.characters = '⌘ K';
set.description = 'Compatible Button slot fixtures. Foreground inherits the Button content context. These fixtures are not released dependency components.';
const style = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === '_Button content/Style');
if (style) set.setExplicitVariableModeForCollection(style, style.modes.find(m => m.name === 'neutral/ghost').modeId);
return { set: set.id, mutatedNodeIds: [set.id, ...nodes.map(n => n.id), shortcutText.id] };
