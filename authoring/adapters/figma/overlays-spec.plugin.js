// Tooltip and Popover specification pages (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2,
// spec-lib.plugin.js) and builds “Tooltip — Specification” on overlays/tooltip (407:123) and “Popover —
// Specification” on overlays/popover (407:122). Rerunning replaces both frames.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    tooltip: ['407:123', 'Tooltip', '430:103'],
    popover: ['407:122', 'Popover', '430:239'],
    button: ['144:2', 'Button', '48:1586'],
    'icon-button': ['211:2', 'IconButton', '211:1167']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, surface, setProps } = H;
const tt = (v = {}, label) => mk('tooltip', v, label ? { Label: label } : {});
const triggerOf = (i) => i.findChild((n) => n.type === 'SLOT').children[0];
const tipSpec = {
  path: 'OVERLAYS / TOOLTIP',
  repo: 'foundations/components/overlays/tooltip',
  intro:
    'A tooltip shows a short text about a control when the user points at it or focuses it: the name of an IconButton, the keyboard shortcut of an action, a short clarification. It holds plain text only, never interactive content or information needed to complete a task.',
  hero: () => [
    tt({ Side: 'top' }, 'More actions'),
    tt({ Side: 'bottom', Align: 'start' }, 'Copy the link to this invoice')
  ],
  anatomy: {
    intro: 'How a tooltip is built. The instance is enlarged three times; the real tooltips are shown underneath.',
    zoom: 3,
    dashed: ['Trigger'],
    instance: () => tt({}, 'More actions'),
    pins: [
      [1, 'Tooltip', 'top', 0],
      [2, 'Label', 'right', 0],
      [3, 'Trigger', 'bottom', 0]
    ],
    dims: [{ k: 'y', a: ['Tooltip', 'b'], b: ['Trigger', 't'], c: 'A', side: 'left' }],
    legend: [
      [
        '1',
        'Bubble: color/surface/inverse, padding space/content/sm × space/content/xs, radius/control, no arrow. It wraps at component/tooltip/max-inline-size (240 px).'
      ],
      [
        '2',
        'Label: plain text in caption/md, color/content/inverse. It describes the trigger; for an IconButton with the same accessible name it adds no description.'
      ],
      ['3', 'Trigger (slot): exactly one focusable Button, IconButton or Link. A disabled control shows no tooltip.'],
      [
        'A',
        'Offset: space/content/xs on Side (top, bottom), aligned on the trigger start, center or end; the code flips and shifts it when the viewport lacks room.'
      ]
    ],
    real: () => [
      [tt({ Side: 'top' }), 'top, center'],
      [tt({ Side: 'bottom', Align: 'start' }), 'bottom, start'],
      [tt({ Side: 'top', Align: 'end' }), 'top, end']
    ],
    figma:
      'The trigger is a slot so that the master shows the placement; in the code the tooltip opens after component/tooltip/delay on pointer hover, at once on keyboard focus, closes on Escape, sits above every overlay and enters and leaves over motion/duration/fast. Those are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Side top (default) or bottom and Align center (default), start or end place the tooltip relative to its trigger. The brand, the appearance and the density come from the modes of the frame.',
      (c) => {
        const m = card('Placements', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'CENTER';
        for (const s of ['top', 'bottom'])
          for (const a of ['start', 'center', 'end']) m.appendChild(caption(tt({ Side: s, Align: a }), `${s}, ${a}`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        contexts(c, () => [tt({}, 'Copy link')]);
      }
    ],
    [
      'States',
      'A tooltip is shown or hidden; it has no other state. It opens on hover after the delay or at once on focus; once one is open, moving to another trigger opens its tooltip at once. It closes when the pointer leaves, on blur and on Escape. On touch devices it does not open on a press.',
      (c) => {
        const m = card('Triggers', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'CENTER';
        m.appendChild(caption(tt({}, 'Bold  ⌘B'), 'an IconButton: a shortcut'));
        const b = tt({}, 'Opens in a new tab');
        triggerOf(b).swapComponent(
          H.SETS.button.children.find((ch) => ch.name === 'Intent=neutral, Appearance=ghost, Size=md, State=default')
        );
        setProps(triggerOf(b), { Label: 'Documentation' });
        m.appendChild(caption(b, 'a Button: a short clarification'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The bubble hugs short text and wraps at 240 px; keep it to a few words. It never holds links, buttons or other interactive content (use a Popover).',
      (c) => {
        const m = card('Lengths', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'MAX';
        m.appendChild(caption(tt({}, 'Copy'), 'one word'));
        m.appendChild(
          caption(
            tt({}, 'Archive the selected invoices and remove them from the list of due payments'),
            'long text wraps at 240 px'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Name icon-only buttons, show the shortcut of an action, clarify a control in a few words. Never put information needed to complete a task in a tooltip: it is not available on touch and hides on blur. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const bar = surface('Toolbar', 'HORIZONTAL', 8, 16);
        bar.counterAxisAlignItems = 'MAX';
        bar.appendChild(tt({}, 'Bold  ⌘B'));
        bar.appendChild(mk('icon-button', { Intent: 'neutral', Appearance: 'ghost' }));
        bar.appendChild(mk('icon-button', { Intent: 'neutral', Appearance: 'ghost' }));
        ex.appendChild(caption(bar, 'a toolbar: the name and shortcut of an icon'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
const pp = (v = {}) => mk('popover', v);
const popSpec = {
  path: 'OVERLAYS / POPOVER',
  repo: 'foundations/components/overlays/popover',
  intro:
    'A popover is a non-modal panel anchored to a trigger, holding free content the user may interact with: a short form, filters, details. The rest of the page stays usable. A list of actions is a Menu; a task that must be completed or abandoned before going on is a Dialog.',
  hero: () => [pp({ Side: 'bottom', Align: 'start' })],
  anatomy: {
    intro: 'How a popover is built. The instance is enlarged twice; the real popovers are shown underneath.',
    zoom: 2,
    dashed: ['Trigger', 'Content'],
    instance: () => pp({ Side: 'bottom', Align: 'start' }),
    pins: [
      [1, 'Trigger', 'top', 0],
      [2, 'Panel', 'right', 0],
      [3, 'Content', 'bottom', 0]
    ],
    dims: [
      { k: 'y', a: ['Trigger', 'b'], b: ['Panel', 't'], c: 'A', side: 'left' },
      { k: 'x', a: ['Panel', 'l'], b: ['Content', 'l'], c: 'B' }
    ],
    legend: [
      [
        '1',
        'Trigger (slot): exactly one Button or IconButton; activating it toggles the popover and it exposes the expanded state.'
      ],
      [
        '2',
        'Panel: color/surface/overlay, edge border/width/default in color/elevation/border, shadow/overlay, radius/overlay; at most size/overlay/panel (360 px) wide. Named by Label, exposed as a non-modal dialog.'
      ],
      [
        '3',
        'Content (slot): free content in body/sm and color/content/primary by default; focus moves to its first focusable element on opening.'
      ],
      [
        'A',
        'Offset: space/content/xs on Side (bottom, top), aligned on the trigger start, center or end; the code flips and shifts it and follows the trigger on scroll.'
      ],
      ['B', 'Padding: space/content/md.']
    ],
    real: () => [
      [pp({ Side: 'bottom', Align: 'start' }), 'bottom, start'],
      [pp({ Side: 'top', Align: 'end' }), 'top, end']
    ],
    figma:
      'Trigger and Content are slots. Focus management, closing on Escape, on a press outside or when focus leaves, nesting and the enter and leave motion (motion/duration/base) are behaviors of the code; the panel inherits the brand, appearance and density around the trigger.'
  },
  sections: [
    [
      'Variants',
      'Side bottom (default) or top and Align start (default), center or end place the panel relative to its trigger. The brand, the appearance and the density come from the modes of the frame.',
      (c) => {
        const m = card('Placements', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'CENTER';
        m.layoutWrap = 'WRAP';
        m.counterAxisSpacing = 32;
        for (const s of ['bottom', 'top'])
          for (const a of ['start', 'center', 'end']) m.appendChild(caption(pp({ Side: s, Align: a }), `${s}, ${a}`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [pp({})]);
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
      'A popover is open or closed. Opening it closes the popovers that do not contain it; a popover opened inside another keeps the first open. It closes on Escape (focus returns to the trigger), on a press outside, and when focus leaves both the panel and the trigger.',
      (c) => {
        const m = card('Open', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        const closed = mk('button', { Intent: 'neutral', Appearance: 'outline' });
        setProps(closed, { Label: 'Filters' });
        m.appendChild(caption(closed, 'closed: only the trigger'));
        m.appendChild(caption(pp({}), 'open: the panel at the trigger'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The panel follows its content up to 360 px and the room of the viewport; the content scrolls when the panel is taller than the room. It follows the trigger when the page scrolls.',
      (c) => {
        const m = card('Content', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        const p = pp({});
        p.findOne((n) => n.type === 'SLOT' && n.name === 'Content').children.find((n) => n.name === 'Text').characters =
          'Show only the invoices that are due this month, in every currency, for every client of the workspace, including archived ones.';
        m.appendChild(caption(p, 'long content wraps at the panel width'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Use a popover for content the user works with next to its trigger: filters, a short form, details. For a list of actions use a Menu; for a task that must be finished first use a Dialog; for a few words about a control use a Tooltip. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        ex.appendChild(caption(pp({ Side: 'bottom', Align: 'end' }), 'filters at the end of a toolbar'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return { tooltip: await H.build('tooltip', tipSpec), popover: await H.build('popover', popSpec) };
