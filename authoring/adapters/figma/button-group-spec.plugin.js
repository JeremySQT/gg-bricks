// ButtonGroup specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and
// builds “ButtonGroup — Specification” on actions/button-group (407:110). After the run, the three groups of the
// Anatomy real parts were narrowed to 300 px and the groups of the six context cards set to fill their card, so that
// nothing overflows the 1232 px frame. Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    'button-group': ['407:110', 'ButtonGroup', '419:2913'],
    button: ['144:2', 'Button', '48:1586'],
    'icon-button': ['211:2', 'IconButton', '211:1167']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, text, card, caption, contexts, surface, densities, setProps } = H;
// A group with its own items [kind, intent, appearance, label] in order; Buttons do not reserve the target height.
const gb = (v = {}, items, w) => {
  const g = mk('button-group', v);
  const size = v.Size || 'md';
  const o = v.Orientation || 'horizontal';
  const al = v.Align || 'start';
  if (items) {
    const slot = g.findOne((n) => n.type === 'SLOT');
    for (const c of [...slot.children]) c.remove();
    for (const [k, intent, ap, label] of items) {
      const i = mk(k, { Intent: intent, Appearance: ap, Size: size });
      slot.appendChild(i);
      if (k !== 'button') continue;
      setProps(i, { Label: label });
      i.setBoundVariable('minHeight', null);
      i.minHeight = null;
      if (o === 'vertical' || al === 'stretch') {
        if (o === 'horizontal') i.layoutGrow = 1;
        i.layoutSizingHorizontal = 'FILL';
        i.findChild((n) => n.name === 'Container').layoutSizingHorizontal = 'FILL';
      }
    }
  }
  if (w) g.resize(w, g.height);
  return g;
};
const footer = [
  ['button', 'neutral', 'outline', 'Cancel'],
  ['button', 'danger', 'solid', 'Delete']
];
const spec = {
  path: 'ACTIONS / BUTTON GROUP',
  repo: 'foundations/components/actions/button-group',
  intro:
    'A button group places related actions together (a dialog footer, form actions, the actions of an alert or a card) with one spacing and one size. It adds no surface, border or padding: only the gap between its Buttons and IconButtons, in the order you give them.',
  hero: () => [
    gb(
      { Size: 'lg', Align: 'end' },
      [
        ['button', 'neutral', 'ghost', 'Back'],
        ['button', 'neutral', 'outline', 'Save draft'],
        ['button', 'accent', 'solid', 'Publish']
      ],
      460
    )
  ],
  anatomy: {
    intro: 'How a button group is built. The instance is enlarged twice; the real groups are shown underneath.',
    zoom: 2,
    dashed: ['Items'],
    instance: () =>
      gb(
        {},
        [
          ['button', 'accent', 'solid', 'Save'],
          ['button', 'neutral', 'outline', 'Cancel'],
          ['icon-button', 'neutral', 'ghost']
        ],
        300
      ),
    pins: [
      [1, 'Items', 'top', -120],
      [2, 'Button', 'bottom', 0]
    ],
    dims: [{ k: 'x', a: ['Button', 'r'], b: ['Items/Button', 'r'], c: 'A' }],
    legend: [
      [
        '1',
        'Items (slot): Buttons and IconButtons in source order; the order is the priority, never changed by the alignment or the reflow.'
      ],
      [
        '2',
        'Item: a Button or an IconButton of the size of the group. Set each item to that Size: the code sets it once on the group; a Figma slot cannot pass it.'
      ],
      [
        'A',
        'Gap: space/control/gap/{size}, the same in both directions; it follows the size and the density (sm 4/6/8, md 6/8/10, lg 8/10/12 px).'
      ]
    ],
    real: () => [
      [gb({ Size: 'sm' }, null, 300), 'sm'],
      [gb({}, null, 300), 'md'],
      [gb({ Size: 'lg' }, null, 300), 'lg']
    ],
    figma:
      'Inside a group the Buttons do not reserve the 44 px target height (their minimum height is cleared on the instance), so that the gap is the one between their surfaces, as in the code where the target overflows the button. Label is a hidden text: when it is not empty the code exposes the group, named by it.'
  },
  sections: [
    [
      'Variants',
      'Orientation horizontal puts the items on one line; Align places the line at the start, the center or the end, or stretch shares the width equally. Orientation vertical stacks them: Buttons take the full width whatever the alignment, an IconButton keeps its square at the start. Size sets the gap and the size of every item.',
      (c) => {
        const m = card('Alignment', 'VERTICAL', 16);
        for (const al of ['start', 'center', 'end', 'stretch'])
          m.appendChild(caption(gb({ Align: al }, footer, 460), `horizontal, ${al}`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const v = card('Vertical', 'HORIZONTAL', 40);
        v.counterAxisAlignItems = 'MIN';
        for (const s of ['sm', 'md', 'lg'])
          v.appendChild(
            caption(
              gb(
                { Orientation: 'vertical', Size: s },
                [
                  ['button', 'accent', 'solid', 'Continue'],
                  ['button', 'neutral', 'outline', 'Not now'],
                  ['icon-button', 'neutral', 'ghost']
                ],
                220
              ),
              `vertical ${s}`
            )
          );
        c.appendChild(v);
        v.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          gb({ Size: 'sm' }, [
            ['button', 'accent', 'solid', 'Save'],
            ['button', 'neutral', 'outline', 'Cancel']
          ])
        ]);
        for (const cardN of ctx.children)
          for (const i of cardN.children.filter((n) => n.type === 'INSTANCE')) i.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'States',
      'The group has no state of its own; each item keeps its states (hover, pressed, loading, disabled, focus) and is its own stop in sequential focus, in source order. A group with one tab stop and arrow keys is a Toolbar; attached buttons for a choice are a SegmentedControl.',
      (c) => {
        const m = card('Items in their states', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        const g1 = gb({}, footer);
        g1.findOne((n) => n.type === 'SLOT').children[1].swapComponent(
          H.SETS.button.children.find((ch) => ch.name === 'Intent=danger, Appearance=solid, Size=md, State=loading')
        );
        m.appendChild(caption(g1, 'Delete loading: the group keeps its layout'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'A horizontal group that does not fit the width it is given stacks vertically (full-width buttons, the same gap) and returns to its line when it fits again; it never wraps to a second line. In Figma, use the vertical variant for that case. The density changes the gap only through space/control/gap.',
      (c) => {
        densities(c, () => [gb({}, footer)], {
          compact: 'gap 6 px (md)',
          standard: 'gap 8 px (md)',
          comfortable: 'gap 10 px (md)'
        });
        const r = card('Reflow', 'HORIZONTAL', 40);
        r.counterAxisAlignItems = 'MIN';
        r.appendChild(
          caption(
            gb(
              { Align: 'end' },
              [
                ['button', 'neutral', 'outline', 'Keep editing'],
                ['button', 'accent', 'solid', 'Save and publish']
              ],
              360
            ),
            '360 px: one line'
          )
        );
        r.appendChild(
          caption(
            gb(
              { Orientation: 'vertical' },
              [
                ['button', 'neutral', 'outline', 'Keep editing'],
                ['button', 'accent', 'solid', 'Save and publish']
              ],
              220
            ),
            '220 px: the code stacks it (vertical variant)'
          )
        );
        c.appendChild(r);
        r.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Put the actions of one task together and in a stable order; give the group a label when the actions need a name (a toolbar of a list, a set of filters). Do not use a group to join buttons visually or to make a choice between options. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const dlg = surface('Dialog footer', 'VERTICAL', 16, 20);
        dlg.resize(380, 10);
        dlg.primaryAxisSizingMode = 'AUTO';
        dlg.appendChild(text('Delete this report?', 'heading/sm'));
        dlg.appendChild(text('It stays in the trash for 30 days.', 'body/sm', 'color/content/secondary', 340));
        dlg.appendChild(gb({ Align: 'end' }, footer, 340));
        ex.appendChild(caption(dlg, 'a dialog footer, aligned at the end'));
        const form = surface('Form actions', 'VERTICAL', 16, 20);
        form.appendChild(text('Billing address', 'heading/sm'));
        form.appendChild(
          gb({}, [
            ['button', 'accent', 'solid', 'Save'],
            ['button', 'neutral', 'ghost', 'Reset']
          ])
        );
        ex.appendChild(caption(form, 'form actions, at the start'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('button-group', spec);
