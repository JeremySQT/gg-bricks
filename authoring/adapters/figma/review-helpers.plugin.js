const publicSet = await figma.getNodeByIdAsync('11:74');
function sample(
  parent,
  {
    intent = 'accent',
    appearance = 'solid',
    size = 'md',
    state = 'default',
    label = 'Button',
    leading = false,
    trailing = false,
    focus = false,
    slot = null
  } = {}
) {
  const main = publicSet.children.find((n) => n.name === 'intent=' + intent + ', appearance=' + appearance);
  const inst = track(main.createInstance());
  parent.appendChild(inst);
  const skin = inst.children[0];
  skin.setProperties({ size, state });
  const props = skin.componentProperties;
  const key = (n) => Object.keys(props).find((k) => k.split('#')[0] === n);
  const values = {
    [key('Label')]: label,
    [key('Show leading')]: leading,
    [key('Show trailing')]: trailing,
    [key('Focus')]: focus
  };
  if (slot) values[key('Trailing')] = slot;
  skin.setProperties(values);
  // Compatible fixtures inherit the Button context. Do not bake a contextual paint override into examples.
  ids.push(...allIds(inst));
  return inst;
}
function cell(parent, width = 170) {
  const f = frame('Cell', parent);
  f.resize(width, 1);
  f.layoutSizingHorizontal = 'FIXED';
  f.layoutSizingVertical = 'HUG';
  f.minHeight = 64;
  f.primaryAxisAlignItems = 'CENTER';
  return f;
}
