// Wave 4 (use_figma bodies), 2026-11-10, session https://claude.ai/code/session_0156c545pPRcTHotAjG2D8Qd.
// Specification pages of the seven wave 4 components on _Script/spec-lib (411:2), then the Master link in their headers
// (spec-header-links.plugin.js lists them too). Instances created in a slot are renamed to the code names, and a default
// glyph is never chosen again (that resets the glyph layer, which the anatomy pins look up by name).
// ---- Part 1: Rebuild Select — Specification with fixed real parts widths and filled groups ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { select: ['495:22', 'Select', '497:2541'], option: ['495:22', 'Listbox/Option', '496:1323'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text } = H;
const GROUP = await figma.getNodeByIdAsync('496:1324');
const GLOBE = '200:5046';
const sel = (v = {}, p = {}, w = 280) => {
  const i = mk('select', v, p);
  i.resize(w, i.height);
  return i;
};
const opt = (v = {}, p = {}, w = 240) => {
  const i = mk('option', v, p);
  i.resize(w, i.height);
  return i;
};
const fillSlot = (s, list) => {
  for (const c of [...s.children]) c.remove();
  for (const e of list) {
    let node;
    if (e.group) {
      node = GROUP.createInstance();
      const k = Object.keys(node.componentProperties).find((x) => x.startsWith('Heading'));
      node.setProperties({ [k]: e.group });
      s.appendChild(node);
      node.layoutSizingHorizontal = 'FILL';
      fillSlot(
        node.findOne((n) => n.type === 'SLOT'),
        e.items
      );
      continue;
    }
    node = mk('option', { Size: e.size || 'md', State: e.st || 'default' }, { Label: e.label });
    s.appendChild(node);
    node.layoutSizingHorizontal = 'FILL';
  }
};
const withOptions = (i, list) => {
  fillSlot(
    i.findOne((n) => n.type === 'SLOT'),
    list
  );
  return i;
};
const group = (w) => {
  const g = GROUP.createInstance();
  g.resize(w, g.height);
  return g;
};
const spec = {
  path: 'FORMS / SELECT',
  repo: 'foundations/components/forms/select',
  intro:
    'A select lets the user choose one value from a list of options, shown collapsed in a field. It suits five to about twenty-five known options; under five, a RadioGroup shows them all; for a long list or one the user searches, use a Combobox; a list of actions is a Menu.',
  hero: () => [sel({ Content: 'value' }, { Open: true, Focus: true }), sel({ Content: 'placeholder' })],
  anatomy: {
    intro: 'How a select is built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Options', 'Value'],
    instance: () => sel({ Content: 'value' }, { Open: true, 'Show leading': true }),
    pins: [
      [1, 'Trigger', 'top', -80],
      [2, 'Leading', 'left', 0],
      [3, 'Value', 'top', 40],
      [4, 'Indicator', 'right', 0],
      [5, 'Panel', 'right', 40],
      [6, 'Option', 'left', 0]
    ],
    dims: [
      { k: 'y', a: ['Trigger', 'b'], b: ['Panel', 't'], c: 'A', side: 'left' },
      { k: 'y', a: ['Trigger', 't'], b: ['Trigger', 'b'], c: 'B', side: 'right' }
    ],
    legend: [
      [
        '1',
        'Trigger: looks and sizes like an InputText of the same Size (size/control/{size} tall, space/control/edge-inline/{size}, color/input/{state}/*, radius/control). Its focus ring is drawn whatever the modality and stays while the list is open.'
      ],
      [
        '2',
        'Leading (Show leading, Leading icon): one decorative icon of size/icon/{size} in the placeholder color, space/control/slot-inline/{size} on both sides.'
      ],
      [
        '3',
        'Value: the label of the selected option, or the Placeholder in the placeholder color while no option matches; one line, truncated; space/control/label-inline/{size} on both sides.'
      ],
      ['4', 'Indicator: a downward chevron of size/icon/{size} in the placeholder color, decorative.'],
      [
        '5',
        'Panel (Open): color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs; as wide as the field (wider for a long label, up to size/overlay/panel), at most size/overlay/list tall: the options scroll beyond.'
      ],
      [
        '6',
        'Option (Listbox/Option): label in body/{size}, check mark on the selected option; the highlighted option is State hover.'
      ],
      ['A', 'Offset: space/content/sm between the field and the panel, so that the panel clears the focus ring.'],
      ['B', 'Height: size/control/{size}; the interaction target reaches size/target/min without enlarging the field.']
    ],
    real: () => [
      [opt({ State: 'default' }, { Label: 'Belgium' }, 168), 'Option'],
      [opt({ State: 'hover' }, { Label: 'Germany' }, 168), 'hover (highlighted)'],
      [opt({ State: 'selected' }, {}, 168), 'selected'],
      [opt({ State: 'disabled' }, { Label: 'Italy' }, 168), 'disabled'],
      [group(168), 'Listbox/Group']
    ],
    figma:
      'Open shows the panel under the field; switch Focus on with it, since the trigger keeps focus while the list is open. Fill the Options slot with Listbox/Option (and Listbox/Group) at the Size of the select, filling the panel width; mark the current value selected and at most one option hover. The panel is drawn below; the code flips it above and shifts it along the edge when the viewport lacks room, and scrolls the options past size/overlay/list. Keyboard (arrows, Home, End, typeahead), choosing, Escape, Tab and a press outside are behaviors of the code. Listbox/Option, Listbox/Group and Listbox/Empty are shared with the Combobox (the two contracts define them identically).'
  },
  sections: [
    [
      'Variants',
      'Size sm, md (default) or lg sets the field like an InputText of the same size and the option typography. Content shows the selected value or the placeholder. Show leading adds a decorative icon. Brand and appearance come from the context.',
      (c) => {
        const m = card('Sizes', 'VERTICAL', 16);
        for (const s of ['sm', 'md', 'lg']) m.appendChild(caption(sel({ Size: s, Content: 'value' }), 'Size ' + s));
        m.appendChild(
          caption(
            sel({ Content: 'placeholder' }, { 'Show leading': true, 'Leading icon': GLOBE }),
            'placeholder, with a leading icon'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [sel({ Content: 'value' }, { Open: true, Focus: true }, 240)]);
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
      'State resolves in this order: disabled, readonly, invalid, focus, hover, default; Focus draws the ring (and the focus border on default and hover). A disabled select is removed from sequential focus and never opens; a readonly select stays focusable and shows its value but never opens. Invalid is exposed to assistive technology; the message belongs to the Field.',
      (c) => {
        const m = card('Conditions', 'HORIZONTAL', 20);
        m.layoutWrap = 'WRAP';
        m.counterAxisSpacing = 20;
        for (const [st, f] of [
          ['default', false],
          ['hover', false],
          ['default', true],
          ['invalid', false],
          ['readonly', false],
          ['disabled', false]
        ])
          m.appendChild(caption(sel({ Content: 'value', State: st }, { Focus: f }, 240), f ? 'focus' : st));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const o = card('Options', 'HORIZONTAL', 20);
        for (const st of ['default', 'hover', 'selected', 'selected-hover', 'disabled'])
          o.appendChild(caption(opt({ State: st }, { Label: 'France' }, 180), st));
        c.appendChild(o);
        o.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The field fills the width it is given; its height is size/control/{size}. The panel is as wide as the field, wider when an option label needs it, up to size/overlay/panel; it grows with the options up to size/overlay/list and scrolls beyond, keeping the highlighted option visible. Groups gather consecutive options under a heading. The density changes heights and spacing.',
      (c) => {
        const m = card('Groups and long labels', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            withOptions(sel({ Content: 'value' }, { Open: true, Value: 'Paris' }, 260), [
              { group: 'Europe', items: [{ label: 'Lisbon' }, { label: 'Paris', st: 'selected' }] },
              { group: 'Americas', items: [{ label: 'Montreal', st: 'hover' }, { label: 'New York' }] }
            ]),
            'groups under headings'
          )
        );
        m.appendChild(
          caption(
            withOptions(sel({ Content: 'value' }, { Open: true, Value: 'Coordinated Universal Time (UTC)' }, 220), [
              { label: 'Coordinated Universal Time (UTC)', st: 'selected' },
              { label: 'Central European Time (UTC+1)' }
            ]),
            'long labels truncate'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        densities(c, () => [sel({ Content: 'value' }, {}, 240)], {
          compact: 'size/control/md: 32 px',
          standard: 'size/control/md: 40 px',
          comfortable: 'size/control/md: 44 px'
        });
      }
    ],
    [
      'Usage examples',
      'Put the select in a Field, which names it and shows the help and error messages. Keep the options short and in a meaningful order; preselect a value only when it is a sound default. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const f = surface('Form', 'VERTICAL', 8, 20);
        f.appendChild(text('Language', 'label/md'));
        f.appendChild(sel({ Content: 'value' }, { Value: 'Français' }, 280));
        f.appendChild(text('Used for emails and notifications.', 'caption/md', 'color/content/secondary'));
        ex.appendChild(caption(f, 'in a form, named by its field'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('select', spec);
const root = await figma.getNodeByIdAsync(r.root);
return { ...r, w: root.width };

// ---- Part 2: Fix the long-label caption on the Select specification ----
const page = await figma.getNodeByIdAsync('495:22');
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync('515:648');
const t = root.findOne((n) => n.type === 'TEXT' && n.characters === 'long labels truncate');
await figma.loadFontAsync(t.fontName);
t.characters = 'beyond size/overlay/panel, a long label truncates (the code first widens the panel)';
return t.id;

// ---- Part 3: Build Combobox — Specification (option layers named Option) ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: { combobox: ['495:21', 'Combobox', '499:2549'], option: ['495:21', 'Listbox/Option', '496:1323'] }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text } = H;
const EMPTY = await figma.getNodeByIdAsync('496:1338');
const cb = (v = {}, p = {}, w = 280) => {
  const i = mk('combobox', v, p);
  i.resize(w, i.height);
  return i;
};
const opt = (v = {}, p = {}, w = 180) => {
  const i = mk('option', v, p);
  i.resize(w, i.height);
  return i;
};
const withOptions = (i, list) => {
  const s = i.findOne((n) => n.type === 'SLOT');
  for (const c of [...s.children]) c.remove();
  for (const e of list) {
    const node =
      e === 'empty'
        ? EMPTY.createInstance()
        : mk('option', { Size: 'md', State: e.st || 'default' }, { Label: e.label });
    node.name = e === 'empty' ? 'Empty' : 'Option';
    s.appendChild(node);
    node.layoutSizingHorizontal = 'FILL';
  }
  return i;
};
const typed = (txt, list, w) => withOptions(cb({ Content: 'text' }, { Open: true, Focus: true, Text: txt }, w), list);
const spec = {
  path: 'FORMS / COMBOBOX',
  repo: 'foundations/components/forms/combobox',
  intro:
    'A combobox lets the user choose one value from a long list of options by typing to narrow it: a country, a person, a project. The value is always one of the options; free text is not a value. A short list without search is a Select; free text with suggestions is an InputText.',
  hero: () => [
    typed('Fr', [{ label: 'France', st: 'hover' }, { label: 'French Guiana' }, { label: 'French Polynesia' }]),
    cb({ Content: 'placeholder' }, { 'Show leading': true })
  ],
  anatomy: {
    intro: 'How a combobox is built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Options', 'Input'],
    instance: () =>
      withOptions(cb({ Content: 'text' }, { Open: true, Text: 'Fr', 'Show leading': true }), [
        { label: 'France', st: 'selected-hover' },
        { label: 'French Guiana' },
        { label: 'French Polynesia' }
      ]),
    pins: [
      [1, 'Container', 'top', -80],
      [2, 'Leading', 'left', 0],
      [3, 'Input', 'top', 40],
      [4, 'Indicator', 'right', 0],
      [5, 'Panel', 'right', 40],
      [6, 'Option', 'left', 0]
    ],
    dims: [{ k: 'y', a: ['Container', 'b'], b: ['Panel', 't'], c: 'A', side: 'left' }],
    legend: [
      [
        '1',
        'Container: looks and sizes like an InputText of the same Size (size/control/{size} tall, space/control/edge-inline/{size}, color/input/{state}/*, radius/control); the focus ring is drawn whatever the modality.'
      ],
      [
        '2',
        'Leading (Show leading, Leading icon): one decorative icon of size/icon/{size} in the placeholder color (a magnifying glass suits a search).'
      ],
      [
        '3',
        'Input: the Text in the content color, or the Placeholder while the text is empty; one line, scrolls to keep the caret visible; space/control/label-inline/{size} on both sides.'
      ],
      [
        '4',
        'Indicator: a downward chevron of size/icon/{size} in the placeholder color; a press toggles the list and keeps focus in the input; not a separate stop in sequential focus.'
      ],
      [
        '5',
        'Panel (Open): color/surface/overlay, edge color/elevation/border, shadow/overlay, radius/overlay, padding space/content/xs; as wide as the field, at most size/overlay/list tall.'
      ],
      [
        '6',
        'Option (Listbox/Option): the matching options in their original order; typing highlights the first enabled match, so that Enter chooses it.'
      ],
      ['A', 'Offset: space/content/sm between the field and the panel.']
    ],
    real: () => [
      [opt({ State: 'hover' }, { Label: 'France' }), 'first match (hover)'],
      [opt({ State: 'selected-hover' }, { Label: 'France' }), 'selected and highlighted'],
      [opt({}, { Label: 'French Guiana' }), 'option'],
      [
        (() => {
          const e = EMPTY.createInstance();
          e.resize(180, e.height);
          return e;
        })(),
        'Listbox/Empty'
      ]
    ],
    figma:
      'Text is what the user typed (or the label of the selected option); Placeholder shows while it is empty. Open shows the panel; switch Focus on with it, since focus stays in the input. Fill the Options slot with the matching Listbox/Option at the Size of the combobox, or with Listbox/Empty when nothing matches. Filtering (contains, ignoring case and accents), the caret, keyboard, choosing on Enter, restoring the label on Escape or when focus leaves, and placement are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Size sm, md (default) or lg sets the field like an InputText of the same size and the option typography. Content shows the text or the placeholder. Show leading adds a decorative icon. Brand and appearance come from the context.',
      (c) => {
        const m = card('Sizes', 'VERTICAL', 16);
        for (const s of ['sm', 'md', 'lg']) m.appendChild(caption(cb({ Size: s, Content: 'text' }), 'Size ' + s));
        m.appendChild(
          caption(cb({ Content: 'placeholder' }, { 'Show leading': true }), 'placeholder, with a leading icon')
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          typed('Fr', [{ label: 'France', st: 'hover' }, { label: 'French Guiana' }], 240)
        ]);
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
      'State resolves in this order: disabled, readonly, invalid, focus, hover, default; Focus draws the ring (and the focus border on default and hover). A disabled combobox is removed from sequential focus and never opens; a readonly combobox stays focusable, its text can be selected and copied, but it never opens. When nothing matches, the panel shows the empty label, announced politely.',
      (c) => {
        const m = card('Conditions', 'HORIZONTAL', 20);
        m.layoutWrap = 'WRAP';
        m.counterAxisSpacing = 20;
        for (const [st, f] of [
          ['default', false],
          ['hover', false],
          ['default', true],
          ['invalid', false],
          ['readonly', false],
          ['disabled', false]
        ])
          m.appendChild(caption(cb({ Content: 'text', State: st }, { Focus: f }, 240), f ? 'focus' : st));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const o = card('Matching', 'HORIZONTAL', 32);
        o.counterAxisAlignItems = 'MIN';
        o.appendChild(
          caption(
            typed(
              'Fr',
              [{ label: 'France', st: 'hover' }, { label: 'French Guiana' }, { label: 'French Polynesia' }],
              260
            ),
            'typing highlights the first match'
          )
        );
        o.appendChild(caption(typed('Atlantis', ['empty'], 260), 'no match: the empty label'));
        c.appendChild(o);
        o.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The field fills the width it is given; its height is size/control/{size}. With filter contains, the list shows the options whose label contains the typed text, in their original order; opening without typing shows every option. With filter none, the application supplies the options (a search on a server). The value is always an option: emptying the text and leaving clears it; other text is restored to the selected label.',
      (c) => {
        densities(c, () => [cb({ Content: 'text' }, {}, 240)], {
          compact: 'size/control/md: 32 px',
          standard: 'size/control/md: 40 px',
          comfortable: 'size/control/md: 44 px'
        });
      }
    ],
    [
      'Usage examples',
      'Put the combobox in a Field, which names it and shows the help and error messages. Use it when the list is long enough that typing is faster than scrolling. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const f = surface('Form', 'VERTICAL', 8, 20);
        f.appendChild(text('Country', 'label/md'));
        f.appendChild(typed('Ger', [{ label: 'Germany', st: 'hover' }], 280));
        ex.appendChild(caption(f, 'in a form, named by its field'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('combobox', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return { ...r, w: root.width };

// ---- Part 4: Build Tabs — Specification on navigation/tabs with spec-lib ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    tabs: ['495:20', 'Tabs', '502:530'],
    trigger: ['495:20', 'Tabs/Trigger', '501:249'],
    vtrigger: ['495:20', 'Tabs/Vertical trigger', '501:496']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text, stack } = H;
const GEAR = '200:5078',
  USERS = '200:5811',
  LOCK = '200:5869',
  FILE = '200:4974';
const tabsOf = (v, list, w, opts = {}) => {
  const i = mk('tabs', v);
  if (w) i.resize(w, i.height);
  const vert = (v.Orientation || 'horizontal') === 'vertical';
  const a = v.Appearance || 'contained',
    s = v.Size || 'md';
  if (list) {
    const sl = i.findOne((n) => n.type === 'SLOT' && n.name === 'Tabs');
    for (const c of [...sl.children]) c.remove();
    for (const e of list) {
      const t = mk(
        vert ? 'vtrigger' : 'trigger',
        { Appearance: a, Size: s, State: e.st || 'default' },
        {
          Label: e.label,
          ...(e.icon ? { 'Show leading': true, 'Leading icon': e.icon } : {}),
          ...(e.count ? { 'Show trailing': true } : {}),
          ...(e.focus ? { Focus: true } : {})
        }
      );
      t.name = 'TabsTrigger';
      sl.appendChild(t);
      if (vert || a === 'contained') t.layoutSizingHorizontal = 'FILL';
    }
  }
  if (opts.bar) {
    const b = i.findOne((n) => n.name === 'Bar');
    b.resize(opts.bar, b.height);
  }
  return i;
};
const std = [{ label: 'General', st: 'selected' }, { label: 'Members' }, { label: 'Security' }];
const trig = (v, p = {}) => mk('trigger', v, p);
const spec = {
  path: 'NAVIGATION / TABS',
  repo: 'foundations/components/navigation/tabs',
  intro:
    'Tabs show one of several panels of related content in the same place, with a list of tabs to switch between them: the sections of a settings page, the views of a record. They are not navigation between pages; to show several sections at once, use an Accordion; to choose a value, a SegmentedControl or a RadioGroup.',
  hero: () => [
    tabsOf({}, [{ label: 'General', st: 'selected' }, { label: 'Members', st: 'hover' }, { label: 'Security' }], 420),
    tabsOf({ Appearance: 'line' }, std, 420)
  ],
  anatomy: {
    intro: 'How tabs are built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Tabs', 'Panel'],
    instance: () =>
      tabsOf(
        {},
        [{ label: 'Overview', st: 'selected', icon: FILE }, { label: 'Activity', count: true }, { label: 'Settings' }],
        400
      ),
    pins: [
      [1, 'Bar', 'left', 0],
      [2, 'TabsTrigger', 'top', 0],
      [3, 'Leading', 'top', 0],
      [4, 'Trailing', 'top', 0],
      [5, 'Panel', 'left', 0]
    ],
    dims: [{ k: 'y', a: ['Bar', 'b'], b: ['Panel', 't'], c: 'A', side: 'right' }],
    legend: [
      [
        '1',
        'List (Bar): contained, a container in color/surface/inset with radius/overlay corners and space/content/xs padding; line, the tabs on a line of border/width/default in color/border/subtle. Tabs are space/content/xs apart.'
      ],
      [
        '2',
        'Tab (Tabs/Trigger): the selected tab is raised (contained: color/surface/overlay, edge color/elevation/border, shadow/raised) or marked by its indicator (line: color/item/indicator, border/width/strong). Label in label/{size}; min height size/control/{size}, padding space/control/padding-inline/{size}.'
      ],
      ['3', 'Leading (Show leading, Leading icon): a decorative icon of size/icon/{size}.'],
      ['4', 'Trailing (Show trailing): one Counter or Badge of the same size, part of the accessible name.'],
      ['5', 'Panel: the content of the selected tab, space/content/lg below the list (beside it when vertical).'],
      ['A', 'Panel gap: space/content/lg.']
    ],
    real: () => [
      [trig({ Appearance: 'contained', State: 'selected' }), 'contained, selected'],
      [trig({ Appearance: 'contained', State: 'hover' }), 'contained, hover'],
      [trig({ Appearance: 'line', State: 'selected' }), 'line, selected'],
      [trig({ Appearance: 'line', State: 'default' }), 'line, idle'],
      [trig({ Appearance: 'line', State: 'disabled' }), 'disabled']
    ],
    figma:
      'Fill the Tabs slot with Tabs/Trigger (horizontal) or Tabs/Vertical trigger (vertical) of the same Appearance and Size, exactly one selected; in a contained horizontal list set each tab to fill, so that they share the width. The Panel slot holds the content of the selected tab. Overflow (the list scrolls, its edges fade and show scroll buttons), roving focus with the arrow keys, automatic or manual activation and the panel switch are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Appearance contained (the default) or line; Orientation horizontal (list above the panel) or vertical (list at the inline start); Size sm, md (default) or lg sets the tabs. Leading icons and a trailing Counter or Badge are options of each tab.',
      (c) => {
        const m = card('Appearance and orientation', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'MIN';
        m.layoutWrap = 'WRAP';
        m.counterAxisSpacing = 32;
        m.appendChild(caption(tabsOf({}, std, 440), 'contained, horizontal'));
        m.appendChild(caption(tabsOf({ Appearance: 'line' }, std, 440), 'line, horizontal'));
        m.appendChild(caption(tabsOf({ Orientation: 'vertical' }, std, 440, { bar: 160 }), 'contained, vertical'));
        m.appendChild(
          caption(tabsOf({ Appearance: 'line', Orientation: 'vertical' }, std, 440, { bar: 160 }), 'line, vertical')
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const s = card('Sizes', 'VERTICAL', 20);
        for (const z of ['sm', 'md', 'lg']) s.appendChild(caption(tabsOf({ Size: z }, std, 440), 'Size ' + z));
        c.appendChild(s);
        s.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          tabsOf(
            {},
            [{ label: 'General', st: 'selected' }, { label: 'Members', st: 'hover' }, { label: 'Security' }],
            300
          )
        ]);
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
      'One tab is selected. An unselected tab is idle or hovered (hover paints color/item/hover/surface behind it); a disabled tab is never selected or focused and is skipped by the arrow keys. Focus shows the keyboard ring. Selection is never conveyed by color alone: the selected tab is raised (contained) or marked (line).',
      (c) => {
        for (const a of ['contained', 'line']) {
          const m = card(a, 'HORIZONTAL', 20);
          m.counterAxisAlignItems = 'MAX';
          for (const [st, f] of [
            ['selected', false],
            ['default', false],
            ['hover', false],
            ['disabled', false],
            ['default', true]
          ]) {
            const t = trig({ Appearance: a, State: st }, { Focus: f, Label: 'Members' });
            if (a === 'contained') {
              const w = stack('Well', 'HORIZONTAL', 0, 4);
              w.fills = [H.paint('color/surface/inset')];
              w.cornerRadius = 12;
              w.appendChild(t);
              m.appendChild(caption(w, f ? 'focus' : st));
            } else m.appendChild(caption(t, f ? 'focus' : st));
          }
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      }
    ],
    [
      'Behavior & sizing',
      'A contained horizontal list fills the width it is given and its tabs share it equally, never narrower than their content; a line list takes the width of its tabs. In a vertical list every tab is as wide as the widest. When the tabs do not fit, the list scrolls inline: its edges fade and scroll buttons appear (a behavior of the code). The density changes heights and spacing.',
      (c) => {
        const m = card('Width', 'VERTICAL', 20);
        m.appendChild(caption(tabsOf({}, std, 640), 'contained: equal shares of the width'));
        m.appendChild(caption(tabsOf({ Appearance: 'line' }, std, 640), 'line: the width of the tabs'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        densities(c, () => [tabsOf({}, std, 300)], {
          compact: 'size/control/md: 32 px',
          standard: 'size/control/md: 40 px',
          comfortable: 'size/control/md: 44 px'
        });
      }
    ],
    [
      'Usage examples',
      'Name the list with Label. Keep labels short and parallel; a few tabs (two to six) read best. Use a Counter or Badge for a count or a status, an icon only when it helps recognition. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('Settings', 'VERTICAL', 16, 24);
        pg.appendChild(text('Workspace settings', 'heading/sm'));
        pg.appendChild(
          tabsOf(
            { Appearance: 'line' },
            [
              { label: 'General', st: 'selected', icon: GEAR },
              { label: 'Members', icon: USERS, count: true },
              { label: 'Security', icon: LOCK }
            ],
            520
          )
        );
        ex.appendChild(caption(pg, 'a settings page with icons and a counter'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('tabs', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return { ...r, w: root.width };

// ---- Part 5: Build Breadcrumb — Specification on navigation/breadcrumb with spec-lib ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    breadcrumb: ['495:18', 'Breadcrumb', '503:405'],
    item: ['495:18', 'Breadcrumb/Item', '503:247'],
    more: ['495:18', 'Breadcrumb/More', '503:284']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text, stack } = H;
const crumbOf = (v, list) => {
  const i = mk('breadcrumb', v);
  const s = v.Size || 'sm',
    sh = v.Separator || 'chevron';
  if (list) {
    const sl = i.findOne((n) => n.type === 'SLOT');
    for (const c of [...sl.children]) c.remove();
    for (const e of list) {
      const node = e.more
        ? mk('more', { Size: s })
        : mk(
            'item',
            { Size: s, State: e.st || 'link' },
            {
              Label: e.label,
              ...(e.home ? { 'Show leading': true } : {}),
              ...(e.hide ? { 'Show label': false } : {}),
              ...(e.focus ? { Focus: true } : {})
            }
          );
      node.name = e.more ? 'BreadcrumbMore' : 'BreadcrumbItem';
      sl.appendChild(node);
      const sp = node.findOne((n) => n.type === 'INSTANCE' && n.name === 'Separator');
      if (sp && sh === 'slash') sp.setProperties({ Shape: 'slash' });
    }
  }
  return i;
};
const std = [{ label: 'Home', home: true }, { label: 'Projects' }, { label: 'ggbrick', st: 'current' }];
const spec = {
  path: 'NAVIGATION / BREADCRUMB',
  repo: 'foundations/components/navigation/breadcrumb',
  intro:
    'A breadcrumb shows where the current page sits in the site hierarchy, from a top level to the current page, with a link to each ancestor. It is not a history of visited pages and not a list of steps; it complements the main navigation, never replaces it.',
  hero: () => [
    crumbOf({ Size: 'md' }, [
      { label: 'Home', home: true },
      { label: 'Projects' },
      { label: 'Design system', st: 'hover' },
      { label: 'Breadcrumb', st: 'current' }
    ])
  ],
  anatomy: {
    intro: 'How a breadcrumb is built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Items'],
    instance: () =>
      crumbOf({ Size: 'md' }, [
        { label: 'Home', home: true },
        { more: true },
        { label: 'Projects' },
        { label: 'ggbrick', st: 'current' }
      ]),
    pins: [
      [1, 'Leading', 'top', 0],
      [2, 'BreadcrumbItem/Label', 'bottom', 0],
      [3, 'Separator', 'top', 0],
      [4, 'BreadcrumbMore', 'bottom', 0]
    ],
    dims: [{ k: 'x', a: ['BreadcrumbItem/Label', 'r'], b: ['Separator', 'l'], c: 'A' }],
    legend: [
      [
        '1',
        'Leading (Show leading, Leading icon): a decorative icon of size/icon/{size} in the item color, a home icon on the first item; Show label off hides the label beside it (hideLabel: the label stays the accessible name).'
      ],
      [
        '2',
        'Item: an ancestor link in color/content/secondary (hover: underlined, color/content/primary), a level without page in plain text, or the current page in color/content/primary, last and never a link. Label in body/{size}, one line.'
      ],
      [
        '3',
        'Separator: a chevron or a slash of size/icon/{size} in color/content/tertiary after each item except the current page; decorative, mirrored in right-to-left text.'
      ],
      [
        '4',
        'More (Breadcrumb/More): with maxItems, the hidden items after the first are replaced by an ellipsis button painted like a link, named moreLabel; it opens a Menu of the hidden items.'
      ],
      ['A', 'Gap: space/content/xs between icon, label and separator, and between entries.']
    ],
    real: () => [
      [mk('item', { Size: 'md', State: 'link' }), 'link'],
      [mk('item', { Size: 'md', State: 'hover' }), 'hover'],
      [mk('item', { Size: 'md', State: 'text' }, { Label: 'Archive' }), 'text (no page)'],
      [mk('item', { Size: 'md', State: 'current' }, { Label: 'ggbrick' }), 'current'],
      [mk('more', { Size: 'md' }), 'more']
    ],
    figma:
      'Fill the Items slot with Breadcrumb/Item in hierarchy order, the current page last (State current, no separator); put Breadcrumb/More after the first item when items are hidden. Keep the same Size and separator Shape on every item (select a separator to change its Shape). Truncation of long labels (ancestors first, down to three characters), the collapse with maxItems and the Menu of hidden items are behaviors of the code; the line never wraps.'
  },
  sections: [
    [
      'Variants',
      'Size sm (default) or md sets the type and icon sizes. Separator chevron (default) or slash. The first item can show a home icon, with or without its label.',
      (c) => {
        const m = card('Size and separator', 'VERTICAL', 20);
        for (const s of ['sm', 'md'])
          for (const sh of ['chevron', 'slash'])
            m.appendChild(caption(crumbOf({ Size: s, Separator: sh }, std), `Size ${s}, ${sh}`));
        m.appendChild(
          caption(
            crumbOf({ Size: 'sm' }, [
              { label: 'Home', home: true, hide: true },
              { label: 'Projects' },
              { label: 'ggbrick', st: 'current' }
            ]),
            'home icon without its label'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [crumbOf({ Size: 'sm' }, std)]);
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
      'An ancestor link is idle or hovered (underlined, color/content/primary); Focus shows the keyboard ring with radius/indicator corners. The current page is exposed as the current page and is never a link. Every link is its own stop in sequential focus; the breadcrumb adds no arrow-key navigation.',
      (c) => {
        const m = card('Items', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MAX';
        for (const [st, f, cap] of [
          ['link', false, 'link'],
          ['hover', false, 'hover'],
          ['link', true, 'focus'],
          ['text', false, 'text'],
          ['current', false, 'current']
        ])
          m.appendChild(caption(mk('item', { Size: 'md', State: st }, { Focus: f }), cap));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'Items take the width of their content and sit on one line. When the line lacks room, labels shrink and truncate with an ellipsis, ancestors first, the current page last, each down to three characters; the full label stays the accessible name and shows on hover. With maxItems, the breadcrumb keeps the first item and the last maxItems − 1 and collapses the others behind More.',
      (c) => {
        const m = card('Collapsed', 'VERTICAL', 20);
        m.appendChild(
          caption(
            crumbOf({ Size: 'sm' }, [
              { label: 'Home', home: true },
              { more: true },
              { label: 'Components' },
              { label: 'Breadcrumb', st: 'current' }
            ]),
            'maxItems 3: the hidden items behind More'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Place the breadcrumb at the top of the page, above the title. Start at a meaningful top level and end with the current page. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('Page header', 'VERTICAL', 12, 24);
        pg.appendChild(crumbOf({ Size: 'sm' }, std));
        pg.appendChild(text('ggbrick', 'heading/md'));
        ex.appendChild(caption(pg, 'above the page title'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('breadcrumb', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return { ...r, w: root.width };

// ---- Part 6: Build Pagination — Specification on navigation/pagination with spec-lib ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    pagination: ['495:19', 'Pagination', '504:552'],
    item: ['495:19', 'Pagination/Item', '504:307'],
    ellipsis: ['495:19', 'Pagination/Ellipsis', '504:314']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text, stack } = H;
// pages: numbers, '…' an ellipsis; current: the selected number; first/last: the edge states.
const pag = (v, pages, current, p = {}) => {
  const i = mk('pagination', v, p);
  const s = v.Size || 'md';
  const sl = i.findOne((n) => n.type === 'SLOT');
  for (const c of [...sl.children]) c.remove();
  for (const n of pages) {
    const node =
      n === '…'
        ? mk('ellipsis', { Size: s })
        : mk('item', { Size: s, State: n === current ? 'selected' : 'default' }, { Number: String(n) });
    node.name = n === '…' ? 'PaginationEllipsis' : 'PaginationItem';
    sl.appendChild(node);
  }
  const last = pages[pages.length - 1];
  for (const [name, dis] of [
    ['First', current === 1],
    ['Previous', current === 1],
    ['Next', current === last],
    ['Last', current === last]
  ]) {
    const b = i.findChild((x) => x.name === name);
    b.setProperties({ State: dis ? 'disabled' : 'default' });
  }
  return i;
};
const spec = {
  path: 'NAVIGATION / PAGINATION',
  repo: 'foundations/components/navigation/pagination',
  intro:
    'Pagination moves through a long list or table split into numbered pages, when the user benefits from knowing the position and jumping to a page. A feed read in order is better served by a Load more Button or by scrolling.',
  hero: () => [pag({}, [1, '…', 4, 5, 6, '…', 20], 5)],
  anatomy: {
    intro: 'How a pagination is built. The instance is enlarged; its parts are shown underneath.',
    zoom: 1.5,
    dashed: ['Items'],
    instance: () => pag({}, [1, '…', 4, 5, 6, '…', 20], 5, { 'Show edges': true }),
    pins: [
      [1, 'First', 'top', 0],
      [2, 'Previous', 'bottom', 0],
      [3, 'PaginationItem', 'top', 0],
      [4, 'PaginationEllipsis', 'bottom', 0],
      [5, 'Next', 'bottom', 0],
      [6, 'Last', 'top', 0]
    ],
    dims: [],
    legend: [
      [
        '1',
        'First (Show edges): an IconButton of the same size, neutral ghost, with a double chevron towards the start; disabled on page 1, it stays in place.'
      ],
      [
        '2',
        'Previous: an IconButton, neutral ghost, chevron towards the start (mirrored in right-to-left text); disabled on page 1.'
      ],
      [
        '3',
        'Item (Pagination/Item): the page number in label/{size} with tabular figures, in a box at least size/control/{size} wide; the current page is selected (color/item/selected/* and an inner edge in color/item/indicator).'
      ],
      [
        '4',
        'Ellipsis: a run of hidden pages, color/content/secondary; not interactive, hidden from assistive technology.'
      ],
      ['5', 'Next: chevron towards the end; disabled on the last page.'],
      [
        '6',
        'Last (Show edges): double chevron towards the end; disabled on the last page. Every control is space/content/xs from the next.'
      ]
    ],
    real: () => [
      [mk('item', { State: 'default' }, { Number: '4' }), 'page'],
      [mk('item', { State: 'hover' }, { Number: '6' }), 'hover'],
      [mk('item', { State: 'selected' }, { Number: '5' }), 'current'],
      [mk('item', { State: 'selected-hover' }, { Number: '5' }), 'current, hover'],
      [mk('item', { State: 'default' }, { Number: '128' }), 'long number'],
      [mk('ellipsis', {}), 'ellipsis']
    ],
    figma:
      'Fill the Items slot with Pagination/Item and Pagination/Ellipsis of the same Size: page 1, the last page, the current page (State selected) and siblingCount pages on each side; a gap of hidden pages becomes an ellipsis, a gap of one page shows that page. Set Previous and First to disabled on page 1, Next and Last on the last page. Links (href), the reduction of siblings when the row lacks room and the focus after activation are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Size sm, md (default) or lg sets the controls. Show edges adds First and Last, which help most with many pages and few visible items. The number of items is constant (siblingCount × 2 + 5) so that Previous and Next do not move while the user pages.',
      (c) => {
        const m = card('Sizes and edges', 'VERTICAL', 20);
        for (const s of ['sm', 'md', 'lg'])
          m.appendChild(caption(pag({ Size: s }, [1, 2, 3, 4, 5, '…', 20], 1), 'Size ' + s + ', page 1'));
        m.appendChild(caption(pag({}, [1, '…', 18, 19, 20], 20, { 'Show edges': true }), 'Show edges, last page'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [pag({ Size: 'sm' }, [1, '…', 5, '…', 20], 5)]);
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
      'Pages are idle or hovered; the current page is selected (selected-hover under the pointer) and exposed as the current page, never conveyed by the tint alone. Focus shows the keyboard ring. Activating the current page does nothing.',
      (c) => {
        const m = card('Items', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MAX';
        for (const [st, f, cap] of [
          ['default', false, 'default'],
          ['hover', false, 'hover'],
          ['selected', false, 'selected'],
          ['selected-hover', false, 'selected-hover'],
          ['default', true, 'focus']
        ])
          m.appendChild(caption(mk('item', { State: st }, { Focus: f, Number: '7' }), cap));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The pagination takes the width of its content, in a single row that never wraps; the application places it. siblingCount is a maximum: when the row does not fit, fewer siblings are shown, down to none; as a last resort the row scrolls inside its width. The density changes the control sizes.',
      (c) => {
        const m = card('Positions', 'VERTICAL', 20);
        m.appendChild(caption(pag({}, [1, 2, 3, 4, 5, '…', 20], 3), 'near the start'));
        m.appendChild(caption(pag({}, [1, '…', 9, 10, 11, '…', 20], 10), 'in the middle'));
        m.appendChild(caption(pag({}, [1, '…', 16, 17, 18, 19, 20], 18), 'near the end'));
        m.appendChild(caption(pag({}, [1, 2, 3, 4], 2), 'fewer pages than items'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        densities(c, () => [pag({ Size: 'sm' }, [1, '…', 5, '…', 20], 5)], {
          compact: 'size/control/sm: 28 px',
          standard: 'size/control/sm: 32 px',
          comfortable: 'size/control/sm: 36 px'
        });
      }
    ],
    [
      'Usage examples',
      'Place the pagination under the list or table it controls, aligned with it. Show the number of results nearby when it helps. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('Table footer', 'HORIZONTAL', 24, 20);
        pg.counterAxisAlignItems = 'CENTER';
        pg.appendChild(text('Showing 41–50 of 200', 'body/sm', 'color/content/secondary'));
        pg.appendChild(pag({ Size: 'sm' }, [1, '…', 4, 5, 6, '…', 20], 5));
        ex.appendChild(caption(pg, 'under a table, with the result count'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('pagination', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return { ...r, w: root.width };

// ---- Part 7: Build Accordion — Specification (without re-choosing the default glyph) ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { accordion: ['495:17', 'Accordion', '505:428'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text } = H;
const ACC = await figma.getNodeByIdAsync('505:429');
const CARD = '200:4833',
  USER = '200:5808',
  BELL = '200:4596';
const item = (v = {}, p = {}, w = 520) => {
  const i = mk('accordion', v, p);
  i.resize(w, i.height);
  return i;
};
// icon: true shows the default glyph (never chosen again: that resets the glyph layer); a string swaps it.
const acc = (list, w = 520) => {
  const a = ACC.createInstance();
  a.resize(w, a.height);
  const sl = a.findOne((n) => n.type === 'SLOT');
  for (const c of [...sl.children]) c.remove();
  for (const e of list) {
    const p = { Label: e.label };
    if (e.icon) p['Show leading'] = true;
    if (typeof e.icon === 'string') p['Leading icon'] = e.icon;
    if (e.focus) p.Focus = true;
    const i = mk('accordion', { State: e.st || 'default', Expanded: e.ex ? 'true' : 'false' }, p);
    i.name = 'AccordionItem';
    sl.appendChild(i);
    i.layoutSizingHorizontal = 'FILL';
  }
  return a;
};
const faq = [
  { label: 'What is included in the plan?', ex: true },
  { label: 'Can I change plans later?' },
  { label: 'How does billing work?' }
];
const spec = {
  path: 'NAVIGATION / ACCORDION',
  repo: 'foundations/components/navigation/accordion',
  intro:
    'An accordion is a vertical stack of headings that each show or hide a section of content, so that a long page can be scanned: questions and answers, settings sections, details. It is not navigation and not a selection; content needed by every user should not be hidden in it.',
  hero: () => [acc(faq, 560)],
  anatomy: {
    intro: 'How an accordion is built. The instance is enlarged; its parts are shown underneath.',
    zoom: 1.5,
    dashed: ['Content slot'],
    instance: () =>
      acc(
        [{ label: 'What is included in the plan?', ex: true, icon: true }, { label: 'Can I change plans later?' }],
        520
      ),
    pins: [
      [1, 'Trigger', 'left', 0],
      [2, 'Leading', 'top', 0],
      [3, 'Label', 'top', 0],
      [4, 'Indicator', 'right', 0],
      [5, 'Body', 'left', 0]
    ],
    dims: [{ k: 'y', a: ['Trigger', 'b'], b: ['Body text', 't'], c: 'A', side: 'right' }],
    legend: [
      [
        '1',
        'Trigger: inside a heading of level headingLevel; min height size/control/lg, padding space/control/padding-block/lg × space/content/sm, gap space/control/gap/lg, radius/control; hover paints color/item/hover/surface. It exposes whether the item is expanded and which content it controls.'
      ],
      ['2', 'Leading (Show leading, Leading icon): a decorative icon of size/icon/md.'],
      ['3', 'Label: label/lg, wraps onto several lines when long; the accessible name of the trigger.'],
      [
        '4',
        'Indicator: a chevron of size/icon/md in color/content/secondary, down when collapsed and up when expanded.'
      ],
      [
        '5',
        'Content (Expanded): free content in body/md and color/content/primary, aligned with the label, with space/content/lg below; exposed as a region named by the trigger. Lines of border/width/default in color/border/subtle separate the items, also above the first and below the last.'
      ],
      [
        'A',
        'Start of the content: focus/width + focus/offset below the trigger, so that the focus indicator of a control at its edge is never cut.'
      ]
    ],
    real: () => [
      [item({ State: 'default' }, {}, 300), 'collapsed'],
      [item({ State: 'hover' }, {}, 300), 'hover'],
      [item({ State: 'disabled' }, {}, 300), 'disabled']
    ],
    figma:
      'The Accordion holds the Items slot; fill it with Accordion/Item, filling the width. Expanded shows the Content slot of an item; with multiple off, keep at most one item expanded. Resize the Accordion instance to set the width. The heading level, single or multiple expansion, keyboard navigation (Tab through triggers and content, arrows between triggers) and the expand animation are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'One size. An item can show a leading icon; its label wraps when long. Brand and appearance come from the context.',
      (c) => {
        const m = card('Items', 'VERTICAL', 20);
        m.appendChild(
          caption(
            acc([
              { label: 'Profile', icon: USER, ex: true },
              { label: 'Billing', icon: CARD },
              { label: 'Notifications', icon: BELL }
            ]),
            'with leading icons'
          )
        );
        m.appendChild(
          caption(
            acc(
              [
                {
                  label:
                    'How are the projects of a workspace shared with external collaborators who do not have an account yet?'
                }
              ],
              520
            ),
            'a long label wraps'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          acc(
            [
              { label: 'What is included?', ex: true },
              { label: 'Billing', st: 'hover' }
            ],
            300
          )
        ]);
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
      'An item is collapsed or expanded; its trigger is idle, hovered (color/item/hover/surface) or disabled (cannot be toggled, keeps its expanded state, skipped by the arrow keys). Focus shows the keyboard ring inside the trigger.',
      (c) => {
        const m = card('Triggers', 'VERTICAL', 16);
        for (const [st, ex, f, cap] of [
          ['default', 'false', false, 'collapsed'],
          ['default', 'true', false, 'expanded'],
          ['hover', 'false', false, 'hover'],
          ['default', 'false', true, 'focus'],
          ['disabled', 'false', false, 'disabled']
        ])
          m.appendChild(caption(item({ State: st, Expanded: ex }, { Focus: f }), cap));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The accordion takes the width it is given and adds no surface of its own. With multiple off, expanding an item collapses the other, and the expanded item can be collapsed, leaving none; with multiple on, items expand independently. The density changes the trigger height and spacing.',
      (c) => {
        densities(c, () => [acc([{ label: 'Plans', ex: true }, { label: 'Billing' }], 300)], {
          compact: 'size/control/lg: 40 px',
          standard: 'size/control/lg: 48 px',
          comfortable: 'size/control/lg: 56 px'
        });
      }
    ],
    [
      'Usage examples',
      'Write labels that tell what the section holds; keep content needed by every user out of an accordion. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('FAQ', 'VERTICAL', 16, 24);
        pg.appendChild(text('Frequently asked questions', 'heading/sm'));
        pg.appendChild(acc(faq, 560));
        ex.appendChild(caption(pg, 'questions and answers'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('accordion', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return { ...r, w: root.width };

// ---- Part 8: Rebuild Toolbar — Specification with separators shown in context and no trailing separator ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: { toolbar: ['495:23', 'Toolbar', '506:1873'], separator: ['495:23', 'Toolbar/Separator', '506:1350'] }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text } = H;
const IB = await figma.getNodeByIdAsync('211:1167');
const BTN = await figma.getNodeByIdAsync('48:1586');
const G = {
  copy: '200:4794',
  pencil: '200:5394',
  trash: '200:5762',
  bold: '200:5705',
  italic: '200:5715',
  underline: '200:5722',
  link: '200:5218',
  list: '200:5238'
};
const setP = (inst, name, val) => {
  const k = Object.keys(inst.componentProperties).find((x) => x.split('#')[0] === name);
  inst.setProperties({ [k]: val });
};
const ib = (s, intent, glyph, label) => {
  const i = IB.children
    .find((x) => x.name === `Intent=${intent}, Appearance=ghost, Size=${s}, State=default`)
    .createInstance();
  setP(i, 'Icon', glyph);
  setP(i, 'Label', label);
  i.minHeight = null;
  i.name = 'IconButton';
  return i;
};
const btn = (s, label, app) => {
  const i = BTN.children
    .find((x) => x.name === `Intent=neutral, Appearance=${app}, Size=${s}, State=default`)
    .createInstance();
  setP(i, 'Label', label);
  i.minHeight = null;
  i.name = 'Button';
  return i;
};
const tb = (v, list, w, p = {}) => {
  const i = mk('toolbar', v, p);
  const s = v.Size || 'md',
    o = v.Orientation || 'horizontal';
  if (w) i.resize(w, i.height);
  if (list) {
    const sl = i.findOne((n) => n.type === 'SLOT');
    for (const c of [...sl.children]) c.remove();
    for (const e of list) {
      if (e === '|') {
        const sp = mk('separator', { Orientation: o });
        sp.name = 'ToolbarSeparator';
        sl.appendChild(sp);
        if (o === 'horizontal') sp.layoutSizingVertical = 'FILL';
        else sp.layoutSizingHorizontal = 'FILL';
        continue;
      }
      sl.appendChild(e[0] === 'ib' ? ib(s, e[1], e[2], e[3]) : btn(s, e[1], e[2]));
    }
  }
  return i;
};
const sel = [
  ['ib', 'neutral', G.copy, 'Copy'],
  ['ib', 'neutral', G.pencil, 'Rename'],
  ['ib', 'danger', G.trash, 'Delete'],
  '|',
  ['btn', 'Download', 'ghost'],
  ['btn', 'Share', 'outline']
];
const fmt = [
  ['ib', 'neutral', G.bold, 'Bold'],
  ['ib', 'neutral', G.italic, 'Italic'],
  ['ib', 'neutral', G.underline, 'Underline'],
  '|',
  ['ib', 'neutral', G.link, 'Link'],
  ['ib', 'neutral', G.list, 'List']
];
const spec = {
  path: 'ACTIONS / TOOLBAR',
  repo: 'foundations/components/actions/toolbar',
  intro:
    'A toolbar groups controls that act on the same context, such as the actions on a selection or the formatting of a text editor, as one stop in sequential focus with arrow-key navigation inside. A row of unrelated buttons is a ButtonGroup or a layout; a list of actions in a panel is a Menu.',
  hero: () => [tb({}, sel, 520)],
  anatomy: {
    intro: 'How a toolbar is built. The instance is enlarged; its parts are shown underneath.',
    zoom: 1.5,
    dashed: ['Items'],
    instance: () =>
      tb(
        {},
        [['ib', 'neutral', G.copy, 'Copy'], ['ib', 'neutral', G.pencil, 'Rename'], '|', ['btn', 'Share', 'outline']],
        440,
        { 'Show overflow': true }
      ),
    pins: [
      [1, 'IconButton', 'top', 0],
      [2, 'ToolbarSeparator', 'bottom', 0],
      [3, 'Button', 'top', 0],
      [4, 'Overflow', 'top', 0]
    ],
    dims: [],
    legend: [
      [
        '1',
        'Controls: Button, IconButton, Menu and Popover triggers of the toolbar size, space/control/gap/{size} apart; the toolbar imposes its size on them. No toggle buttons in v1.'
      ],
      [
        '2',
        'Separator (Toolbar/Separator): a line of border/width/default in color/border/subtle with space/content/xs on both sides, across the toolbar; skipped by the keyboard.'
      ],
      [
        '3',
        'A Button keeps its intent and appearance (here neutral outline); a danger action keeps its intent, also in the overflow menu.'
      ],
      [
        '4',
        'Overflow (Show overflow): when a horizontal toolbar lacks room, the controls that do not fit move, from the end, into a Menu behind an IconButton named overflowLabel.'
      ]
    ],
    real: () => [
      [
        tb({ Size: 'sm' }, [['ib', 'neutral', G.copy, 'Copy'], '|', ['ib', 'neutral', G.pencil, 'Rename']], 120),
        'separator, horizontal toolbar'
      ],
      [
        tb({ Size: 'sm', Orientation: 'vertical' }, [
          ['ib', 'neutral', G.bold, 'Bold'],
          '|',
          ['ib', 'neutral', G.italic, 'Italic']
        ]),
        'separator, vertical toolbar'
      ]
    ],
    figma:
      'Fill the Items slot with the controls of the toolbar size and clear their minimum height, so that the gaps separate the visible surfaces. A horizontal toolbar fills the width it is given (resize the instance); switch on Show overflow and remove the moved controls to show a toolbar that lacks room. Roving focus (one Tab stop, arrows inside), the overflow measurement and the overflow Menu are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Size sm, md (default) or lg sets the controls and the gap. Orientation horizontal (a row that fills the width) or vertical (a column as wide as its widest control).',
      (c) => {
        const m = card('Sizes', 'VERTICAL', 20);
        for (const s of ['sm', 'md', 'lg']) m.appendChild(caption(tb({ Size: s }, sel, 520), 'Size ' + s));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const v = card('Vertical', 'HORIZONTAL', 32);
        v.counterAxisAlignItems = 'MIN';
        v.appendChild(caption(tb({ Orientation: 'vertical', Size: 'sm' }, fmt), 'vertical, sm'));
        v.appendChild(caption(tb({ Orientation: 'vertical' }, fmt), 'vertical, md'));
        c.appendChild(v);
        v.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          tb(
            { Size: 'sm' },
            [['ib', 'neutral', G.copy, 'Copy'], ['ib', 'danger', G.trash, 'Delete'], '|', ['btn', 'Share', 'outline']],
            300
          )
        ]);
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
      'The toolbar has no state of its own: each control keeps its states (hover, pressed, disabled, focus). One control at a time is the Tab stop; the arrow keys move between controls, skipping separators and disabled controls.',
      (c) => {
        const m = card('Controls', 'HORIZONTAL', 24);
        const t = tb(
          {},
          [['ib', 'neutral', G.copy, 'Copy'], ['ib', 'neutral', G.pencil, 'Rename'], '|', ['btn', 'Share', 'outline']],
          360
        );
        const items = t.findOne((n) => n.type === 'SLOT').children;
        items[0].setProperties({
          [Object.keys(items[0].componentProperties).find((k) => k.startsWith('Focus'))]: true
        });
        items[1].setProperties({ State: 'disabled' });
        m.appendChild(caption(t, 'the Tab stop (focus) and a disabled control'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'A horizontal toolbar fills the width it is given and never wraps: the controls that do not fit move, from the end, into the overflow menu, which keeps their label, icon, disabled state and danger intent; a separator left at the end is hidden. A vertical toolbar is a column. The density changes the control sizes and gaps.',
      (c) => {
        const m = card('Overflow', 'VERTICAL', 20);
        m.appendChild(caption(tb({}, sel, 560), 'enough room: every control'));
        m.appendChild(
          caption(
            tb(
              {},
              [
                ['ib', 'neutral', G.copy, 'Copy'],
                ['ib', 'neutral', G.pencil, 'Rename'],
                ['ib', 'danger', G.trash, 'Delete']
              ],
              240,
              { 'Show overflow': true }
            ),
            'lacking room: Download and Share move into the overflow menu'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        densities(
          c,
          () => [
            tb(
              { Size: 'sm' },
              [
                ['ib', 'neutral', G.copy, 'Copy'],
                ['ib', 'neutral', G.pencil, 'Rename'],
                '|',
                ['btn', 'Share', 'outline']
              ],
              260
            )
          ],
          {
            compact: 'size/control/sm: 28 px, gap 4 px',
            standard: 'size/control/sm: 32 px, gap 6 px',
            comfortable: 'size/control/sm: 36 px, gap 8 px'
          }
        );
      }
    ],
    [
      'Usage examples',
      'Name the toolbar with Label. Group related controls between separators; put the most frequent first, since the last ones move into the overflow menu first. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('Editor', 'VERTICAL', 12, 20);
        pg.appendChild(tb({ Size: 'sm' }, fmt, 480, { Label: 'Formatting' }));
        pg.appendChild(text('Write the release notes of the version here…', 'body/md', 'color/content/secondary', 480));
        ex.appendChild(caption(pg, 'formatting tools above an editor'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('toolbar', spec);
const root = await figma.getNodeByIdAsync(r.root);
const real = root.findOne((n) => n.name === 'Real parts');
await real.screenshot({ scale: 1.5 });
return { ...r, w: root.width };

// ---- Part 9: Add the Master link to the header of the seven wave 4 specifications ----
const SPECS = [
  ['495:23', 'Actions', 'Toolbar', 'toolbar'],
  ['495:21', 'Forms', 'Combobox', 'combobox'],
  ['495:22', 'Forms', 'Select', 'select'],
  ['495:17', 'Navigation', 'Accordion', 'accordion'],
  ['495:18', 'Navigation', 'Breadcrumb', 'breadcrumb'],
  ['495:19', 'Navigation', 'Pagination', 'pagination'],
  ['495:20', 'Navigation', 'Tabs', 'tabs']
];
const vars = await figma.variables.getLocalVariablesAsync();
const V = (name) => vars.find((v) => v.name === name);
const paint = (name) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(name));
const style = (await figma.getLocalTextStylesAsync()).find((s) => s.name === 'typography/label/sm');
await figma.loadFontAsync(style.fontName);
const arrow = await figma.getNodeByIdAsync(
  await (async () => {
    const ph = await figma.getNodeByIdAsync('199:2');
    await ph.loadAsync();
    return ph.findOne((n) => n.type === 'COMPONENT' && n.name === 'phosphor/arrow-up-right').id;
  })()
);
async function chip(label, target) {
  const c = figma.createAutoLayout('HORIZONTAL', {
    name: `Link · ${label}`,
    itemSpacing: 6,
    counterAxisAlignItems: 'CENTER'
  });
  c.paddingLeft = c.paddingRight = 12;
  c.paddingTop = c.paddingBottom = 6;
  c.fills = [paint('color/surface/default')];
  c.strokes = [paint('color/border/default')];
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    c.setBoundVariable(k, V('radius/full'));
  const t = figma.createText();
  await t.setTextStyleIdAsync(style.id);
  t.characters = label;
  t.fills = [paint('color/content/link')];
  t.setRangeHyperlink(
    0,
    label.length,
    target.startsWith('http') ? { type: 'URL', value: target } : { type: 'NODE', value: target }
  );
  c.appendChild(t);
  const g = arrow.createInstance();
  g.rescale(14 / g.width);
  for (const n of g.findAll((n) => 'fills' in n && Array.isArray(n.fills) && n.fills.length))
    n.fills = [paint('color/content/link')];
  c.appendChild(g);
  return c;
}
const families = {};
for (const p of figma.root.children) if (['Actions', 'Forms', 'Navigation'].includes(p.name)) families[p.name] = p;
const out = {};
for (const [pid, family, name] of SPECS) {
  const fam = families[family];
  await fam.loadAsync();
  const section = fam.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!section) throw new Error(`no section ${family} › ${name}`);
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const root = page.children.find((n) => n.name === `${name} — Specification`);
  const header = root.children[0];
  const title = header.findOne((n) => n.name === 'Title');
  let rowNode = header.children.find((n) => n.name === 'Title row');
  if (!rowNode) {
    rowNode = figma.createAutoLayout('HORIZONTAL', {
      name: 'Title row',
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      counterAxisAlignItems: 'MIN'
    });
    rowNode.fills = [];
    header.insertChild(header.children.indexOf(title), rowNode);
    rowNode.appendChild(title);
    rowNode.layoutSizingHorizontal = 'FILL';
  }
  for (const n of rowNode.children.filter((n) => n.name === 'Links')) n.remove();
  const links = figma.createAutoLayout('HORIZONTAL', {
    name: 'Links',
    itemSpacing: 8,
    counterAxisAlignItems: 'CENTER'
  });
  links.fills = [];
  links.appendChild(await chip('Master', section.id));
  rowNode.appendChild(links);
  out[name] = { spec: root.id, section: section.id };
}
return out;

// ---- Accordion specification rebuilt with the one-sided lines (2026-11-12, user review of the Figma parity) ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { accordion: ['495:17', 'Accordion', '505:428'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text } = H;
const ACC = await figma.getNodeByIdAsync('505:429');
const CARD = '200:4833',
  USER = '200:5808',
  BELL = '200:4596';
const item = (v = {}, p = {}, w = 520) => {
  const i = mk('accordion', v, p);
  i.resize(w, i.height);
  return i;
};
const acc = (list, w = 520) => {
  const a = ACC.createInstance();
  a.resize(w, a.height);
  const sl = a.findOne((n) => n.type === 'SLOT');
  for (const c of [...sl.children]) c.remove();
  for (const e of list) {
    const p = { Label: e.label };
    if (e.icon) p['Show leading'] = true;
    if (typeof e.icon === 'string') p['Leading icon'] = e.icon;
    if (e.focus) p.Focus = true;
    const i = mk('accordion', { State: e.st || 'default', Expanded: e.ex ? 'true' : 'false' }, p);
    i.name = 'AccordionItem';
    sl.appendChild(i);
    i.layoutSizingHorizontal = 'FILL';
  }
  return a;
};
const faq = [
  { label: 'What is included in the plan?', ex: true },
  { label: 'Can I change plans later?' },
  { label: 'How does billing work?' }
];
const spec = {
  path: 'NAVIGATION / ACCORDION',
  repo: 'foundations/components/navigation/accordion',
  intro:
    'An accordion is a vertical stack of headings that each show or hide a section of content, so that a long page can be scanned: questions and answers, settings sections, details. It is not navigation and not a selection; content needed by every user should not be hidden in it.',
  hero: () => [acc(faq, 560)],
  anatomy: {
    intro: 'How an accordion is built. The instance is enlarged; its parts are shown underneath.',
    zoom: 1.5,
    dashed: ['Content slot'],
    instance: () =>
      acc(
        [{ label: 'What is included in the plan?', ex: true, icon: true }, { label: 'Can I change plans later?' }],
        520
      ),
    pins: [
      [1, 'Trigger', 'left', 0],
      [2, 'Leading', 'top', 0],
      [3, 'Label', 'top', 0],
      [4, 'Indicator', 'right', 0],
      [5, 'Body', 'left', 0]
    ],
    dims: [{ k: 'y', a: ['Trigger', 'b'], b: ['Body text', 't'], c: 'A', side: 'right' }],
    legend: [
      [
        '1',
        'Trigger: inside a heading of level headingLevel; min height size/control/lg, padding space/control/padding-block/lg × space/content/sm, gap space/control/gap/lg, radius/control; hover paints color/item/hover/surface. It exposes whether the item is expanded and which content it controls.'
      ],
      ['2', 'Leading (Show leading, Leading icon): a decorative icon of size/icon/md.'],
      ['3', 'Label: label/lg, wraps onto several lines when long; the accessible name of the trigger.'],
      [
        '4',
        'Indicator: a chevron of size/icon/md in color/content/secondary, down when collapsed and up when expanded.'
      ],
      [
        '5',
        'Content (Expanded): free content in body/md and color/content/primary, aligned with the label, with space/content/lg below; exposed as a region named by the trigger. Lines of border/width/default in color/border/subtle separate the items, also above the first and below the last (no side edges).'
      ],
      [
        'A',
        'Start of the content: focus/width + focus/offset below the trigger, so that the focus indicator of a control at its edge is never cut.'
      ]
    ],
    real: () => [
      [item({ State: 'default' }, {}, 300), 'collapsed'],
      [item({ State: 'hover' }, {}, 300), 'hover'],
      [item({ State: 'disabled' }, {}, 300), 'disabled']
    ],
    figma:
      'The Accordion holds the Items slot; fill it with Accordion/Item, filling the width. Expanded shows the Content slot of an item; with multiple off, keep at most one item expanded. Resize the Accordion instance to set the width. The heading level, single or multiple expansion, keyboard navigation (Tab through triggers and content, arrows between triggers) and the expand animation are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'One size. An item can show a leading icon; its label wraps when long. Brand and appearance come from the context.',
      (c) => {
        const m = card('Items', 'VERTICAL', 20);
        m.appendChild(
          caption(
            acc([
              { label: 'Profile', icon: USER, ex: true },
              { label: 'Billing', icon: CARD },
              { label: 'Notifications', icon: BELL }
            ]),
            'with leading icons'
          )
        );
        m.appendChild(
          caption(
            acc(
              [
                {
                  label:
                    'How are the projects of a workspace shared with external collaborators who do not have an account yet?'
                }
              ],
              520
            ),
            'a long label wraps'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          acc(
            [
              { label: 'What is included?', ex: true },
              { label: 'Billing', st: 'hover' }
            ],
            300
          )
        ]);
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
      'An item is collapsed or expanded; its trigger is idle, hovered (color/item/hover/surface) or disabled (cannot be toggled, keeps its expanded state, skipped by the arrow keys). Focus shows the keyboard ring inside the trigger.',
      (c) => {
        const m = card('Triggers', 'VERTICAL', 16);
        for (const [st, ex, f, cap] of [
          ['default', 'false', false, 'collapsed'],
          ['default', 'true', false, 'expanded'],
          ['hover', 'false', false, 'hover'],
          ['default', 'false', true, 'focus'],
          ['disabled', 'false', false, 'disabled']
        ])
          m.appendChild(caption(item({ State: st, Expanded: ex }, { Focus: f }), cap));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The accordion takes the width it is given and adds no surface of its own. With multiple off, expanding an item collapses the other, and the expanded item can be collapsed, leaving none; with multiple on, items expand independently. The density changes the trigger height and spacing.',
      (c) => {
        densities(c, () => [acc([{ label: 'Plans', ex: true }, { label: 'Billing' }], 300)], {
          compact: 'size/control/lg: 40 px',
          standard: 'size/control/lg: 48 px',
          comfortable: 'size/control/lg: 56 px'
        });
      }
    ],
    [
      'Usage examples',
      'Write labels that tell what the section holds; keep content needed by every user out of an accordion. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('FAQ', 'VERTICAL', 16, 24);
        pg.appendChild(text('Frequently asked questions', 'heading/sm'));
        pg.appendChild(acc(faq, 560));
        ex.appendChild(caption(pg, 'questions and answers'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('accordion', spec);
const board = await figma.getNodeByIdAsync(r.board);
await board.screenshot({ scale: 1 });
return r;

// ---- Tabs specification rebuilt for the list-only master (2026-11-12, user review of the Figma parity) ----
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    tabs: ['495:20', 'Tabs', '502:530'],
    trigger: ['495:20', 'Tabs/Trigger', '501:249'],
    vtrigger: ['495:20', 'Tabs/Vertical trigger', '501:496']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, densities, surface, text, stack } = H;
const GEAR = '200:5078',
  USERS = '200:5811',
  LOCK = '200:5869',
  FILE = '200:4974';
const tabsOf = (v, list, w) => {
  const i = mk('tabs', v);
  if (w) i.resize(w, i.height);
  const vert = (v.Orientation || 'horizontal') === 'vertical';
  const a = v.Appearance || 'contained',
    s = v.Size || 'md';
  if (list) {
    const sl = i.findOne((n) => n.type === 'SLOT' && n.name === 'Tabs');
    for (const c of [...sl.children]) c.remove();
    for (const e of list) {
      const t = mk(
        vert ? 'vtrigger' : 'trigger',
        { Appearance: a, Size: s, State: e.st || 'default' },
        {
          Label: e.label,
          ...(e.icon ? { 'Show leading': true, 'Leading icon': e.icon } : {}),
          ...(e.count ? { 'Show trailing': true } : {}),
          ...(e.focus ? { Focus: true } : {})
        }
      );
      t.name = 'TabsTrigger';
      sl.appendChild(t);
      if (vert || a === 'contained') t.layoutSizingHorizontal = 'FILL';
    }
  }
  return i;
};
// The content of the selected tab, placed by the designer space/content/lg from the list.
const withContent = (tabs, vertical, w) => {
  const box = stack('Tabs and content', vertical ? 'HORIZONTAL' : 'VERTICAL', 0);
  box.fills = [];
  box.setBoundVariable('itemSpacing', H.V('space/content/lg'));
  box.appendChild(tabs);
  box.appendChild(
    text('General settings of the workspace: name, language and time zone.', 'body/md', 'color/content/primary', w)
  );
  return box;
};
const std = [{ label: 'General', st: 'selected' }, { label: 'Members' }, { label: 'Security' }];
const trig = (v, p = {}) => mk('trigger', v, p);
const spec = {
  path: 'NAVIGATION / TABS',
  repo: 'foundations/components/navigation/tabs',
  intro:
    'Tabs show one of several panels of related content in the same place, with a list of tabs to switch between them: the sections of a settings page, the views of a record. They are not navigation between pages; to show several sections at once, use an Accordion; to choose a value, a SegmentedControl or a RadioGroup.',
  hero: () => [
    tabsOf({}, [{ label: 'General', st: 'selected' }, { label: 'Members', st: 'hover' }, { label: 'Security' }], 420),
    tabsOf({ Appearance: 'line' }, std, 420)
  ],
  anatomy: {
    intro: 'How the tab list is built. The instance is enlarged twice; its parts are shown underneath.',
    zoom: 2,
    dashed: ['Tabs'],
    instance: () =>
      tabsOf(
        {},
        [{ label: 'Overview', st: 'selected', icon: FILE }, { label: 'Activity', count: true }, { label: 'Settings' }],
        400
      ),
    pins: [
      [1, 'Bar', 'left', 0],
      [2, 'TabsTrigger', 'top', 0],
      [3, 'Leading', 'bottom', 0],
      [4, 'Trailing', 'top', 0]
    ],
    dims: [],
    legend: [
      [
        '1',
        'List (Bar): contained, a container in color/surface/inset with radius/overlay corners and space/content/xs padding; line, the tabs on a line of border/width/default in color/border/subtle. Tabs are space/content/xs apart.'
      ],
      [
        '2',
        'Tab (Tabs/Trigger): the selected tab is raised (contained: color/surface/overlay, edge color/elevation/border, shadow/raised) or marked by its indicator (line: color/item/indicator, border/width/strong). Label in label/{size}; min height size/control/{size}, padding space/control/padding-inline/{size}.'
      ],
      ['3', 'Leading (Show leading, Leading icon): a decorative icon of size/icon/{size}.'],
      ['4', 'Trailing (Show trailing): one Counter or Badge of the same size, part of the accessible name.']
    ],
    real: () => [
      [trig({ Appearance: 'contained', State: 'selected' }), 'contained, selected'],
      [trig({ Appearance: 'contained', State: 'hover' }), 'contained, hover'],
      [trig({ Appearance: 'line', State: 'selected' }), 'line, selected'],
      [trig({ Appearance: 'line', State: 'default' }), 'line, idle'],
      [trig({ Appearance: 'line', State: 'disabled' }), 'disabled']
    ],
    figma:
      'The Figma component is the tab list only: place the content of the selected tab yourself, space/content/lg below the list (after it when vertical). The code renders the panels and links each one to its tab. Fill the Tabs slot with Tabs/Trigger (horizontal) or Tabs/Vertical trigger (vertical) of the same Appearance and Size, exactly one selected; in a contained horizontal list set each tab to fill, so that they share the width. Overflow (the list scrolls, its edges fade and show scroll buttons), roving focus with the arrow keys and activation are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Appearance contained (the default) or line; Orientation horizontal (above the content) or vertical (at its inline start); Size sm, md (default) or lg sets the tabs. Leading icons and a trailing Counter or Badge are options of each tab.',
      (c) => {
        const m = card('Appearance and orientation', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'MIN';
        m.layoutWrap = 'WRAP';
        m.counterAxisSpacing = 32;
        m.appendChild(caption(tabsOf({}, std, 440), 'contained, horizontal'));
        m.appendChild(caption(tabsOf({ Appearance: 'line' }, std, 440), 'line, horizontal'));
        m.appendChild(caption(tabsOf({ Orientation: 'vertical' }, std), 'contained, vertical'));
        m.appendChild(caption(tabsOf({ Appearance: 'line', Orientation: 'vertical' }, std), 'line, vertical'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const s = card('Sizes', 'VERTICAL', 20);
        for (const z of ['sm', 'md', 'lg']) s.appendChild(caption(tabsOf({ Size: z }, std, 440), 'Size ' + z));
        c.appendChild(s);
        s.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [
          tabsOf(
            {},
            [{ label: 'General', st: 'selected' }, { label: 'Members', st: 'hover' }, { label: 'Security' }],
            300
          )
        ]);
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
      'One tab is selected. An unselected tab is idle or hovered (hover paints color/item/hover/surface behind it); a disabled tab is never selected or focused and is skipped by the arrow keys. Focus shows the keyboard ring. Selection is never conveyed by color alone: the selected tab is raised (contained) or marked (line).',
      (c) => {
        for (const a of ['contained', 'line']) {
          const m = card(a, 'HORIZONTAL', 20);
          m.counterAxisAlignItems = 'MAX';
          for (const [st, f] of [
            ['selected', false],
            ['default', false],
            ['hover', false],
            ['disabled', false],
            ['default', true]
          ]) {
            const t = trig({ Appearance: a, State: st }, { Focus: f, Label: 'Members' });
            if (a === 'contained') {
              const w = stack('Well', 'HORIZONTAL', 0, 4);
              w.fills = [H.paint('color/surface/inset')];
              w.cornerRadius = 12;
              w.appendChild(t);
              m.appendChild(caption(w, f ? 'focus' : st));
            } else m.appendChild(caption(t, f ? 'focus' : st));
          }
          c.appendChild(m);
          m.layoutSizingHorizontal = 'FILL';
        }
      }
    ],
    [
      'Behavior & sizing',
      'A contained horizontal list fills the width it is given and its tabs share it equally, never narrower than their content; a line list takes the width of its tabs, its line across the width given. In a vertical list every tab is as wide as the widest. The content of the selected tab starts space/content/lg from the list. When the tabs do not fit, the list scrolls inline: its edges fade and scroll buttons appear (a behavior of the code). The density changes heights and spacing.',
      (c) => {
        const m = card('Width and content', 'VERTICAL', 24);
        m.appendChild(
          caption(
            withContent(tabsOf({}, std, 640), false, 640),
            'contained: equal shares of the width; the content space/content/lg below'
          )
        );
        m.appendChild(
          caption(
            withContent(tabsOf({ Appearance: 'line', Orientation: 'vertical' }, std), true, 360),
            'vertical: the content space/content/lg after the list'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        densities(c, () => [tabsOf({}, std, 300)], {
          compact: 'size/control/md: 32 px',
          standard: 'size/control/md: 40 px',
          comfortable: 'size/control/md: 44 px'
        });
      }
    ],
    [
      'Usage examples',
      'Name the list with Label. Keep labels short and parallel; a few tabs (two to six) read best. Use a Counter or Badge for a count or a status, an icon only when it helps recognition. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const pg = surface('Settings', 'VERTICAL', 16, 24);
        pg.appendChild(text('Workspace settings', 'heading/sm'));
        pg.appendChild(
          withContent(
            tabsOf(
              { Appearance: 'line' },
              [
                { label: 'General', st: 'selected', icon: GEAR },
                { label: 'Members', icon: USERS, count: true },
                { label: 'Security', icon: LOCK }
              ],
              520
            ),
            false,
            520
          )
        );
        ex.appendChild(caption(pg, 'a settings page with icons and a counter'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const r = await H.build('tabs', spec);
const root = await figma.getNodeByIdAsync(r.root);
await root.screenshot({ scale: 0.35 });
return r;
