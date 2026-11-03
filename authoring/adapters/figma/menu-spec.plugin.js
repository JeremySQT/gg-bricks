// Menu specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and builds
// “Menu — Specification” on overlays/menu (407:121), with MenuItem (437:343), MenuSeparator (437:344) and MenuGroup
// (437:401). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    menu: ['407:121', 'Menu', '437:795'],
    item: ['407:121', 'MenuItem', '437:343'],
    group: ['407:121', 'MenuGroup', '437:401']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, stack, card, caption, contexts, surface, text } = H;
const SEP = await figma.getNodeByIdAsync('437:344');
const TRASH = '200:5762';
const ARROW = '200:4459';
const mi = (v = {}, p = {}, w = 240) => {
  const i = mk('item', v, p);
  i.resize(w, i.height);
  return i;
};
// A menu with its own items: '-' a separator, { group, indent } a MenuGroup, { v, p } a MenuItem.
const menuWith = (v, list) => {
  const m = mk('menu', v);
  if (list) {
    const s = m.findChild((n) => n.name === 'Panel').findOne((n) => n.type === 'SLOT');
    for (const c of [...s.children]) c.remove();
    for (const e of list) {
      const node =
        e === '-'
          ? SEP.createInstance()
          : e.group
            ? mk('group', { Indent: e.indent ? 'yes' : 'no' }, { Label: e.group })
            : mi(e.v || {}, e.p || {});
      s.appendChild(node);
      node.layoutSizingHorizontal = 'FILL';
    }
  }
  return m;
};
const spec = {
  path: 'OVERLAYS / MENU',
  repo: 'foundations/components/overlays/menu',
  intro:
    'A menu offers a short list of actions or links in a panel opened from a trigger: row actions, an account menu, a More button. Activating an item performs it and closes the menu. A choice of value in a form is a Select; free content in an anchored panel is a Popover.',
  hero: () => [menuWith({ Side: 'bottom', Align: 'start' })],
  anatomy: {
    intro: 'How a menu is built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Trigger', 'Items'],
    instance: () => menuWith({ Side: 'bottom', Align: 'start' }),
    pins: [
      [1, 'Trigger', 'top', 0],
      [2, 'Panel', 'right', -60],
      [3, 'Leading', 'left', 0],
      [4, 'Trailing', 'right', 0],
      [5, 'MenuSeparator', 'right', 0]
    ],
    dims: [
      { k: 'y', a: ['MenuItem', 't'], b: ['MenuItem', 'b'], c: 'A', side: 'left' },
      { k: 'y', a: ['Trigger', 'b'], b: ['Panel', 't'], c: 'B', side: 'left' }
    ],
    legend: [
      [
        '1',
        'Trigger (slot): exactly one Button or IconButton; it opens the menu (Down and Up Arrow open it too) and exposes whether it is expanded.'
      ],
      [
        '2',
        'Panel: color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs; as wide as its widest item, up to size/overlay/panel. Its Items slot holds MenuItem, MenuSeparator and MenuGroup.'
      ],
      [
        '3',
        'MenuItem leading (Show leading, Icon): an icon at size/icon/sm in the item color; the label in body/sm, one line, truncated.'
      ],
      ['4', 'MenuItem trailing (Show trailing): a Shortcut sm, the keyboard shortcut of the action.'],
      ['5', 'MenuSeparator: a line in color/border/subtle with space/content/xs above and below.'],
      [
        'A',
        'Item: at least size/control/sm tall, padding space/control/padding-inline/sm × padding-block/sm, gap space/control/gap/sm, radius/container; colors color/item/{state}/*, danger color/status/danger/content.'
      ],
      ['B', 'Offset: space/content/xs on Side (bottom, top), aligned on the trigger start, center or end.']
    ],
    real: () => [
      [mi({}, {}), 'MenuItem'],
      [mi({ State: 'hover' }), 'hover (highlighted)'],
      [mi({ Intent: 'danger' }, { Label: 'Delete', Icon: TRASH }), 'danger'],
      [SEP.createInstance(), 'MenuSeparator']
    ],
    figma:
      'The highlighted item is State=hover: the code moves the highlight with the pointer and the arrow keys. Keyboard navigation (arrows, Home, End, typeahead), focus, closing on activation, Escape or a press outside, and the motion are behaviors of the code. A link item (href) looks like an action item.'
  },
  sections: [
    [
      'Variants',
      'Menu: Side bottom (default) or top and Align start (default), center or end place the panel. MenuItem: Intent neutral or danger (a destructive action) and State default, hover (highlighted) or disabled; Show leading, Icon and Show trailing add an icon and a shortcut. MenuGroup: Indent yes aligns its heading with labels that follow an icon.',
      (c) => {
        const m = card('Items', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        for (const intent of ['neutral', 'danger']) {
          const s = stack(intent, 'VERTICAL', 8);
          for (const st of ['default', 'hover', 'disabled'])
            s.appendChild(
              caption(
                mi({ Intent: intent, State: st }, intent === 'danger' ? { Label: 'Delete', Icon: TRASH } : {}, 220),
                `${intent} ${st}`
              )
            );
          m.appendChild(s);
        }
        const g = stack('Groups', 'VERTICAL', 8);
        for (const ind of ['yes', 'no']) {
          const gi = mk('group', { Indent: ind });
          gi.resize(220, gi.height);
          g.appendChild(caption(gi, `MenuGroup, indent ${ind}`));
        }
        m.appendChild(g);
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [menuWith({})]);
        ctx.layoutWrap = 'WRAP';
        ctx.counterAxisSpacing = 24;
        for (const cd of ctx.children) {
          cd.layoutSizingHorizontal = 'FIXED';
          cd.resize(346, cd.height);
        }
      }
    ],
    [
      'States',
      'A menu is open or closed; one item at a time is highlighted (State=hover) by the pointer or the arrow keys, skipping separators and headings. A disabled item is never activated. Activating an item performs it and closes the menu; Escape and a press outside close it too, and focus returns to the trigger.',
      (c) => {
        const m = card('Highlight', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            menuWith({}, [
              { p: { Label: 'Rename', 'Show leading': false } },
              { v: { State: 'hover' }, p: { Label: 'Move to…', 'Show leading': false } },
              { v: { State: 'disabled' }, p: { Label: 'Publish', 'Show leading': false } }
            ]),
            'the highlight on Move to…; Publish is disabled'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The panel is as wide as its widest item up to 360 px; long labels truncate on one line. It flips to the other side and shifts along the edge when the viewport lacks room, and scrolls when it is taller than the room. Group headings name their group; separators split the list.',
      (c) => {
        const m = card('Groups', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            menuWith({}, [
              { group: 'Share', indent: true },
              '-',
              { v: { Intent: 'danger' }, p: { Label: 'Delete', Icon: TRASH } }
            ]),
            'a group with icons, then a destructive action'
          )
        );
        m.appendChild(
          caption(
            menuWith({}, [
              { p: { Label: 'Quarterly financial statements of every client, final version', 'Show leading': false } },
              { p: { Label: 'Open in a new tab', Icon: ARROW } }
            ]),
            'a long label truncates'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Keep a menu short: a few actions or links about one object. Put the destructive action last, after a separator. A menu is not a form control: to choose a value use a Select; for free content use a Popover. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const row = surface('Row', 'HORIZONTAL', 16, 16);
        row.counterAxisAlignItems = 'MIN';
        row.appendChild(text('quarterly-report.pdf', 'body/sm'));
        row.appendChild(menuWith({ Align: 'end' }));
        ex.appendChild(caption(row, 'row actions, aligned at the end'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('menu', spec);
