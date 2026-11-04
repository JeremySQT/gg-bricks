// Toast specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and builds
// “Toast — Specification” on feedback/toast (407:117), with the ToastRegion component (a single component since
// 2026-11-04: a Figma slot cannot reverse its order, so the placement is where the designer puts the region). After the run the six context cards
// were regrouped in a wrapping grid (346 px cards, toasts at 306 px) so that the toasts keep their text on one line.
// The action of an instance is changed through the variant properties of the exposed Action (a nested instance cannot
// override its minimum height after a swap). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { toast: ['407:117', 'Toast', '426:819'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, stack, card, caption, contexts, surface, setProps, fill } = H;
const REGION = await figma.getNodeByIdAsync('455:1602');
// A region; edge 'top' puts the newest toast (the second of the slot) first, as the designer does for a top placement.
const region = (edge = 'bottom') => {
  const r = REGION.createInstance();
  if (edge === 'top') {
    const sl = r.findOne((n) => n.type === 'SLOT');
    sl.insertChild(0, sl.children[1]);
  }
  return r;
};
const to = (v = {}, p = {}, action) => {
  const i = mk('toast', v, p);
  if (action) {
    const [intent, ap, label] = action;
    setProps(
      i.findOne((n) => n.name === 'Action'),
      { Intent: intent, Appearance: ap, Label: label }
    );
  }
  return i;
};
const single = (i, ap, p = {}, action) => to({ Layout: 'single', Appearance: ap, Intent: i }, p, action);
const multi = (i, ap, p = {}, action) => to({ Layout: 'multi', Appearance: ap, Intent: i }, p, action);
const spec = {
  path: 'FEEDBACK / TOAST',
  repo: 'foundations/components/feedback/toast',
  intro:
    'A toast is a brief notification about something the user just did or that just happened in the background: Saved, Message sent, Upload failed. It appears above the page, does not block it and leaves by itself unless the user must act on it. A durable message is an Alert; a message that must be answered is a Dialog.',
  hero: () => [region()],
  anatomy: {
    intro: 'How a toast is built. The instance is enlarged twice; the real toasts are shown underneath.',
    zoom: 2,
    dashed: ['Body', 'Text', 'Icon box', 'Dismiss box'],
    instance: () => multi('danger', 'neutral', { Title: 'Upload failed', 'Show action': true }),
    pins: [
      [1, 'Icon', 'left', 0],
      [2, 'Title', 'top', 0],
      [3, 'Description', 'right', 0],
      [4, 'Action', 'bottom', 0],
      [5, 'Dismiss', 'top', 0]
    ],
    dims: [
      { k: 'x', a: ['', 'l'], b: ['', 'r'], c: 'A' },
      { k: 'y', a: ['Text', 'b'], b: ['Action', 't'], c: 'B', side: 'right' }
    ],
    legend: [
      [
        '1',
        'Icon: the intrinsic glyph of the intent (neutral and info: info; success: check-circle; warning: warning; danger: warning-circle) at size/icon/md in color/status/{intent}/icon; hidden from assistive technology.'
      ],
      ['2', 'Title: required, label/md (color/content/primary; intense: color/status/{intent}/content).'],
      [
        '3',
        'Description (Layout=multi): body/sm (color/content/secondary; intense: the status content color). It wraps; the toast grows.'
      ],
      [
        '4',
        'Action (Show action): one sm Button for a secondary follow-up (Undo, View, Retry): ghost or outline, neutral, or danger for a destructive follow-up; never a call to action. Under the description in multi, on the row in single.'
      ],
      [
        '5',
        'Dismiss (Closable): ghost neutral IconButton with the close glyph, label Dismiss. A toast that never leaves by itself keeps it.'
      ],
      [
        'A',
        'Width: size/overlay/panel (360 px), or the region when narrower. Padding space/content/md, gaps space/content/sm, radius/overlay, shadow/overlay; edge border/width/default in color/elevation/border (intense: color/status/{intent}/border).'
      ],
      ['B', 'Action gap: space/content/sm; title gap space/content/xs.']
    ],
    real: () => [
      [single('success', 'neutral', { Title: 'Changes saved' }), 'single, neutral'],
      [single('success', 'intense', { Title: 'Payment received' }), 'single, intense']
    ],
    figma:
      'Layout is a variant because the code chooses it from the description (single without, multi with). Intense variants set the mode of Components · action family to their intent, so that the action and the dismiss button take the action family of the intent, as in an Alert; the neutral appearance keeps them neutral. Change the action through the variant properties of the exposed Action instance. The countdown, its pause, the queue and the enter and leave motion are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Intent sets the glyph and, in the intense appearance, the colors. Appearance neutral is the default; intense conveys a stronger message, tinted like an Alert of the same intent. Layout follows the description. The brand, the appearance (light, dark) and the density come from the modes of the frame.',
      (c) => {
        const m = card('Neutral and intense', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        for (const ap of ['neutral', 'intense']) {
          const s = stack(ap, 'VERTICAL', 12);
          for (const [i, t] of [
            ['neutral', 'Draft saved'],
            ['info', 'New version available'],
            ['success', 'Payment received'],
            ['warning', 'Storage almost full'],
            ['danger', 'Upload failed']
          ])
            s.appendChild(single(i, ap, { Title: t }));
          m.appendChild(caption(s, `appearance ${ap}`));
        }
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const l = card('Layout', 'HORIZONTAL', 24);
        l.counterAxisAlignItems = 'MIN';
        l.appendChild(
          caption(
            single('neutral', 'neutral', { Title: 'Report deleted', 'Show action': true }, [
              'neutral',
              'outline',
              'Undo'
            ]),
            'single: one row, centered'
          )
        );
        l.appendChild(
          caption(
            multi(
              'info',
              'neutral',
              { Title: 'Message sent', Description: 'Ada will be notified by email.', 'Show action': true },
              ['neutral', 'ghost', 'View']
            ),
            'multi: the action under the description'
          )
        );
        c.appendChild(l);
        l.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'States',
      'A toast has no interaction state of its own; its buttons keep theirs. The countdown is paused while the pointer is over the region, while focus is inside it and while the document is hidden. By default a danger toast stays until it is dismissed, a toast with an action leaves after 8 s (time to undo), another after 5 s; a set duration wins. Closable off removes the dismiss button only when the toast leaves by itself.',
      (c) => {
        const m = card('Actions', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            multi('danger', 'intense', { Title: 'Upload failed', 'Show action': true }, [
              'neutral',
              'outline',
              'Retry'
            ]),
            'intense: the action follows the intent'
          )
        );
        m.appendChild(
          caption(
            single('neutral', 'neutral', { Title: 'Item removed', 'Show action': true, Closable: false }, [
              'danger',
              'ghost',
              'Delete forever'
            ]),
            'danger follow-up; not closable (leaves after 8 s)'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        // Six contexts in a wrapping grid of 346 px cards.
        const old = contexts(c, () => [single('success', 'neutral', { Title: 'Saved' })]);
        const grid = stack('Contexts', 'HORIZONTAL', 24);
        grid.layoutWrap = 'WRAP';
        grid.counterAxisSpacing = 24;
        c.insertChild(c.children.indexOf(old), grid);
        grid.layoutSizingHorizontal = 'FILL';
        for (const cd of [...old.children]) {
          cd.layoutSizingHorizontal = 'FIXED';
          grid.appendChild(cd);
          cd.resize(346, cd.height);
          for (const i of cd.children.filter((n) => n.type === 'INSTANCE')) i.resize(306, i.height);
        }
        old.remove();
      }
    ],
    [
      'Behavior & sizing',
      'The region holds the toasts at space/layout/sm from the viewport edges named by its placement; the newest is nearest that edge and the others are separated by space/content/sm. In Figma the placement is where you put the region, and you order the toasts of its slot yourself (a slot cannot reverse its order). At most max (3) are shown; the next ones wait. A toast takes size/overlay/panel, or the width of the region when it is narrower, and grows with its text.',
      (c) => {
        const m = card('Placements', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(caption(region('top'), 'region placed at the top: the newest first'));
        m.appendChild(caption(region('bottom'), 'region placed at the bottom: the newest last'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const w = card('Long text', 'HORIZONTAL', 24);
        w.counterAxisAlignItems = 'MIN';
        w.appendChild(
          caption(
            multi('warning', 'neutral', {
              Title: 'Storage almost full: 9.6 GB of 10 GB used on this workspace',
              Description: 'Delete old exports or upgrade the plan to keep uploading files.'
            }),
            'title and description wrap'
          )
        );
        c.appendChild(w);
        w.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Use a toast for a short confirmation or a background event; put at most one secondary action in it (Undo, View, Retry) that is also available elsewhere. Never put a call to action in a toast, and do not send one from an open modal dialog: feedback about the dialog task belongs in the dialog. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const scr = surface('Screen', 'VERTICAL', 12, 20);
        scr.resize(440, 260);
        scr.primaryAxisSizingMode = 'FIXED';
        scr.counterAxisSizingMode = 'FIXED';
        scr.primaryAxisAlignItems = 'MAX';
        scr.counterAxisAlignItems = 'MAX';
        fill(scr, 'color/surface/canvas');
        scr.appendChild(region());
        ex.appendChild(caption(scr, 'bottom-end region on a page'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('toast', spec);
